import path from "path";
import url from "url";
import dotenv from "dotenv";

import { z } from "../lib/zod";

const __dirname = url.fileURLToPath(import.meta.url);
const envLocalPath = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  ".env.local"
);

// TODO: temporary
dotenv.config({
  path: envLocalPath,
});

const envSchema = z.object({
  NODE_ENV: z.string().optional().default("development"),
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string(),
});

const env = envSchema.parse(process.env);

export default env;
