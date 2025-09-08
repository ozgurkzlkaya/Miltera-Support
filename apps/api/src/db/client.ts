import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";
import env from "../config/env";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "fixlog",
  ssl: false,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

const db = drizzle(pool, { schema });

export { db };
