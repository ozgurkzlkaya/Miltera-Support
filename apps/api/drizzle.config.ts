import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "fixlog",
    ssl: false,
  },
  out: "./drizzle",
});
