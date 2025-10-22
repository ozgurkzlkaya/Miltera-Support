import { db } from '../src/db/client';

export default async function globalSetup() {
  console.log('🚀 Starting global test setup...');
  
  try {
    // Ensure database connection
    await db.execute('SELECT 1');
    console.log('✅ Database connection established');
    
    // Setup test data if needed
    console.log('✅ Global test setup completed');
  } catch (error) {
    console.error('❌ Global test setup failed:', error);
    throw error;
  }
}
