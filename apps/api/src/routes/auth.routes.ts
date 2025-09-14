import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import { createUser, authenticateUser, generateToken } from "../lib/auth";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.string().optional().default("user"),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const authRoute = createRouter<HonoEnv>()
  .post("/sign-up/email", async (c) => {
    try {
      // CORS headers
      c.header("Access-Control-Allow-Origin", "http://localhost:3002");
      c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      c.header("Access-Control-Allow-Credentials", "true");
      
      const body = await c.req.json();
      const { email, password, name, role } = signUpSchema.parse(body);
      
      const user = await createUser(email, password, name, role);
      const token = generateToken(user);
      
      return c.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      });
    } catch (error: any) {
      console.error("Sign up error:", error);
      return c.json({
        code: "FAILED_TO_CREATE_USER",
        message: error.message || "Failed to create user",
      }, 400);
    }
  })
  .post("/sign-in/email", async (c) => {
    try {
      // CORS headers
      c.header("Access-Control-Allow-Origin", "http://localhost:3002");
      c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      c.header("Access-Control-Allow-Credentials", "true");
      
      const body = await c.req.json();
      console.log("Sign-in request body:", body);
      
      const { email, password } = signInSchema.parse(body);
      
      const user = await authenticateUser(email, password);
      const token = generateToken(user);
      
      return c.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      });
    } catch (error: any) {
      console.error("Sign in error:", error);
      return c.json({
        code: "INVALID_EMAIL_OR_PASSWORD",
        message: "Invalid email or password",
      }, 401);
    }
  })
  .get("/get-session", async (c) => {
    try {
      // CORS headers
      c.header("Access-Control-Allow-Origin", "http://localhost:3002");
      c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      c.header("Access-Control-Allow-Credentials", "true");
      
      const authHeader = c.req.header("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ user: null }, 200);
      }
      
      const token = authHeader.substring(7);
      const { verifyToken } = await import("../lib/auth");
      const payload = verifyToken(token);
      
      return c.json({ user: payload }, 200);
    } catch (error) {
      return c.json({ user: null }, 200);
    }
  })
  .options("*", async (c) => {
    c.header("Access-Control-Allow-Origin", "http://localhost:3002");
    c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    c.header("Access-Control-Allow-Credentials", "true");
    return c.text("", 200);
  });

export default authRoute;
