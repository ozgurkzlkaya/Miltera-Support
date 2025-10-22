import { db } from '../src/db/client';

export default async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Clean up any test data
    console.log('✅ Global test teardown completed');
  } catch (error) {
    console.error('❌ Global test teardown failed:', error);
  }
}
