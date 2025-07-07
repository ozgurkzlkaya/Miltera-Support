import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { db } from "./client";

type Schema = typeof schema;
type Database = NodePgDatabase<Schema>;

export { db };
export type { Database };
export type { Schema };
