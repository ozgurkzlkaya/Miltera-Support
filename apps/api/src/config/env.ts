import path from "path";
import dotenv from "dotenv";

import { z } from "../lib/zod";
import type { Env } from "hono";

// Geçici olarak doğrudan path kullanıyoruz
const envLocalPath = path.resolve(process.cwd(), ".env.local");

// TODO: temporary
dotenv.config({
  path: envLocalPath,
});

const envSchema = z.object({
  NODE_ENV: z.string().optional().default("development"),
  PORT: z.string().optional().default("3003"),
  DATABASE_URL: z.string().optional().default("postgresql://postgres:postgres@localhost:5432/fixlog"),
  BETTER_AUTH_SECRET: z.string().optional().default("dev-secret-key-123"),
  BETTER_AUTH_URL: z.string().optional().default("http://localhost:3001"),
  REDIS_URL: z.string().optional().default("redis://localhost:6379"),
  FRONTEND_URL: z.string().optional().default("http://localhost:3002"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

const env = envSchema.parse(process.env);

type HonoEnv = Env & {
  Bindings: {};
  Variables: {};
};

export default env;
export type { HonoEnv };
