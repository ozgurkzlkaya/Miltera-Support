import path from "path";
import url from "url";
import dotenv from "dotenv";

import { z } from "../lib/zod";
import type { Env } from "hono";

const __dirname = url.fileURLToPath(import.meta.url);
const envLocalPath = path.resolve(__dirname, "..", "..", "..", ".env.local");

// TODO: temporary
dotenv.config({
  path: envLocalPath,
});

const envSchema = z.object({
  NODE_ENV: z.string().optional().default("development"),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
});

const env = envSchema.parse(process.env);

type HonoEnv = Env & {
  Bindings: {};
  Variables: {};
};

export default env;
export type { HonoEnv };
