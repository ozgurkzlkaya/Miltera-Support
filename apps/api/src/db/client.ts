import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import env from "../config/env";

// Create postgres client
export const client = postgres(env.DATABASE_URL);

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema for type inference
export type Schema = typeof schema;
