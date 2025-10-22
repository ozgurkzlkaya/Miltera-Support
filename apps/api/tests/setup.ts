import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { db } from '../src/db/client';

// Global test setup
beforeAll(async () => {
  // Setup test database connection
  console.log('Setting up test environment...');
});

afterAll(async () => {
  // Cleanup test database
  console.log('Cleaning up test environment...');
});

beforeEach(async () => {
  // Clean up test data before each test
  // This ensures tests don't interfere with each other
});
