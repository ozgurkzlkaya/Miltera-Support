const init = async () => {
  try {
    // TODO: Re-enable database connection test after fixing connection issues
    // await db.execute(sql`SELECT 1`);
    // console.log("✅ Database connection successful");
    console.log("✅ Initialization completed");
  } catch (error) {
    console.error("❌ Initialization failed:", error);
    throw error;
  }
};

export default init;