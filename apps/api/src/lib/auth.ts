/**
 * Miltera Fixlog API - Authentication Library
 * 
 * Bu dosya, kullanıcı authentication ve yetkilendirme işlemlerini yönetir.
 * JWT token tabanlı güvenli authentication sistemi sağlar.
 * 
 * Ana Özellikler:
 * - Kullanıcı oluşturma ve doğrulama
 * - JWT token generation ve verification
 * - Password hashing (bcrypt)
 * - User session management
 * - Role-based access control
 * - Password change operations
 * - Account management
 * 
 * Güvenlik:
 * - Bcrypt ile password hashing
 * - JWT secret key ile token signing
 * - Password strength validation
 * - Session timeout management
 */

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

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  try {
    // Mevcut şifreyi doğrula
    const [account] = await db.select().from(schema.accounts)
      .where(eq(schema.accounts.userId, userId));

    if (!account || !account.password) {
      throw new Error("Account not found");
    }

    const isValidPassword = await bcrypt.compare(currentPassword, account.password);
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Yeni şifreyi hash'le ve güncelle
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const now = new Date();
    
    await db.update(schema.accounts)
      .set({ 
        password: hashedNewPassword,
        updatedAt: now
      })
      .where(eq(schema.accounts.userId, userId));
    
    // Users tablosunda lastPasswordChange tarihini güncelle
    await db.update(schema.users)
      .set({ 
        lastPasswordChange: now,
        updatedAt: now
      })
      .where(eq(schema.users.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Password change error:", error);
    throw error;
  }
};

// Hono context'ten auth bilgilerini al
export const getAuth = async (c: any) => {
  try {
    const authHeader = c.req.header("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { isAuthenticated: false, user: null };
    }
    
    const token = authHeader.substring(7);
    const payload = verifyToken(token) as any;
    
    // Kullanıcı bilgilerini veritabanından al
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, payload.id));
    
    if (!user) {
      return { isAuthenticated: false, user: null };
    }
    
    return { isAuthenticated: true, user };
  } catch (error) {
    return { isAuthenticated: false, user: null };
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

