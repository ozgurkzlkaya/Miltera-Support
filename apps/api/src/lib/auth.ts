import { db } from "../db";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Basit auth fonksiyonları
export const createUser = async (email: string, password: string, name: string, role: string = "user") => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID(); // PostgreSQL uyumlu UUID
    
    const [user] = await db.insert(schema.users).values({
      id: userId,
      email,
      name,
      role,
      emailVerified: false,
      isActive: true,
      mustChangePassword: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Password'ü ayrı tabloya kaydet
    await db.insert(schema.accounts).values({
      accountId: email, // email'i account_id olarak kullan
      providerId: "email", // provider_id olarak email kullan
      userId: userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return user;
  } catch (error) {
    console.error("User creation error:", error);
    throw new Error("Failed to create user");
  }
};

export const authenticateUser = async (email: string, password: string) => {
  try {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    
    if (!user) {
      throw new Error("User not found");
    }

    const [account] = await db.select().from(schema.accounts)
      .where(eq(schema.accounts.userId, user.id));

    if (!account || !account.password) {
      throw new Error("Account not found");
    }

    const isValidPassword = await bcrypt.compare(password, account.password);
    
    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    return user;
  } catch (error) {
    console.error("Authentication error:", error);
    throw new Error("Authentication failed");
  }
};

export const generateToken = (user: any) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Better-auth uyumluluğu için
export const auth = {
  api: {
    getSession: async ({ headers }: { headers: any }) => {
      try {
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return null;
        }
        
        const token = authHeader.substring(7);
        const payload = verifyToken(token);
        return { user: payload };
      } catch (error) {
        return null;
      }
    }
  }
};

export const getAuth = async (c: any) => {
  return await auth.api.getSession({ headers: c.req.raw.headers });
};
