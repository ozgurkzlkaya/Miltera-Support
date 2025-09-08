import { config } from 'dotenv';
import { resolve } from 'path';
import { jest, describe, it, expect } from '@jest/globals';

// Load test environment variables
config({ path: resolve(__dirname, '../../.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fixlog_test';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379/1';

// Global test setup
beforeAll(async () => {
  // Setup test environment
  console.log('Setting up test environment...');
});

// Global test teardown
afterAll(async () => {
  // Cleanup test environment
  console.log('Cleaning up test environment...');
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Test to ensure setup is working
describe('Test Setup', () => {
  it('should have test environment configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
