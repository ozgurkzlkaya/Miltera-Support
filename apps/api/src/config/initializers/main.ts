import { db } from "../../db/client";
import { sql } from "drizzle-orm";

const init = async () => {
  try {
    // Test database connection
    await db.execute(sql`SELECT 1`);
    console.log("✅ Database connection successful");
    console.log("✅ Initialization completed");
  } catch (error) {
    console.error("❌ Initialization failed:", error);
    throw error;
  }
};

export default init;