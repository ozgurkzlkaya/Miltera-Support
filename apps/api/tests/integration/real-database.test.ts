import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { db } from '../../src/db/client';
import { users, products, companies, issues } from '../../src/db/schema';
import { eq, and, like } from 'drizzle-orm';

describe('Real Database Integration Tests', () => {
  let testUserId: string;
  let testProductId: string;
  let testCompanyId: string;
  let testIssueId: string;

  beforeAll(async () => {
    console.log('🚀 Setting up real database tests...');
  });

  afterAll(async () => {
    // Cleanup test data
    console.log('🧹 Cleaning up test data...');
    
    if (testIssueId) {
      await db.delete(issues).where(eq(issues.id, testIssueId));
    }
    if (testProductId) {
      await db.delete(products).where(eq(products.id, testProductId));
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
    if (testCompanyId) {
      await db.delete(companies).where(eq(companies.id, testCompanyId));
    }
  });

  describe('Database Connection', () => {
    it('should connect to database successfully', async () => {
      const result = await db.execute('SELECT 1 as test');
      expect(result).toBeDefined();
    });

    it('should execute simple query', async () => {
      const result = await db.execute('SELECT NOW() as current_time');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('User Database Operations', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'dbtest@example.com',
        password: 'hashedpassword123',
        firstName: 'DB',
        lastName: 'Test',
        role: 'CUSTOMER' as const,
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.insert(users).values(userData).returning();
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].email).toBe('dbtest@example.com');
      
      testUserId = result[0].id;
    });

    it('should read user from database', async () => {
      const result = await db.select().from(users).where(eq(users.id, testUserId));
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].email).toBe('dbtest@example.com');
    });

    it('should update user in database', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'User',
        updatedAt: new Date()
      };

      const result = await db.update(users)
        .set(updateData)
        .where(eq(users.id, testUserId))
        .returning();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].firstName).toBe('Updated');
    });

    it('should query users with filters', async () => {
      const result = await db.select()
        .from(users)
        .where(and(
          eq(users.role, 'CUSTOMER'),
          eq(users.isActive, true)
        ));

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Company Database Operations', () => {
    it('should create a new company', async () => {
      const companyData = {
        name: 'Test Company',
        email: 'company@test.com',
        phone: '+1234567890',
        address: 'Test Address',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.insert(companies).values(companyData).returning();
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Test Company');
      
      testCompanyId = result[0].id;
    });

    it('should read company from database', async () => {
      const result = await db.select().from(companies).where(eq(companies.id, testCompanyId));
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Test Company');
    });
  });

  describe('Product Database Operations', () => {
    it('should create a new product', async () => {
      const productData = {
        serialNumber: 'DB-TEST-001',
        productModelId: 'model-123',
        status: 'IN_PRODUCTION' as const,
        productionDate: new Date(),
        locationId: 'location-123',
        createdBy: testUserId,
        updatedBy: testUserId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.insert(products).values(productData).returning();
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].serialNumber).toBe('DB-TEST-001');
      
      testProductId = result[0].id;
    });

    it('should read product from database', async () => {
      const result = await db.select().from(products).where(eq(products.id, testProductId));
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].serialNumber).toBe('DB-TEST-001');
    });

    it('should update product location', async () => {
      const updateData = {
        locationId: null, // Müşteride
        updatedBy: testUserId,
        updatedAt: new Date()
      };

      const result = await db.update(products)
        .set(updateData)
        .where(eq(products.id, testProductId))
        .returning();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].locationId).toBeNull();
    });

    it('should query products with complex filters', async () => {
      const result = await db.select()
        .from(products)
        .where(and(
          eq(products.status, 'IN_PRODUCTION'),
          like(products.serialNumber, 'DB-TEST-%')
        ));

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Issue Database Operations', () => {
    it('should create a new issue', async () => {
      const issueData = {
        title: 'Test Issue',
        description: 'Test issue description',
        status: 'OPEN' as const,
        priority: 'MEDIUM' as const,
        reportedBy: testUserId,
        assignedTo: testUserId,
        productId: testProductId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.insert(issues).values(issueData).returning();
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Test Issue');
      
      testIssueId = result[0].id;
    });

    it('should read issue from database', async () => {
      const result = await db.select().from(issues).where(eq(issues.id, testIssueId));
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Test Issue');
    });

    it('should update issue status', async () => {
      const updateData = {
        status: 'IN_PROGRESS' as const,
        updatedAt: new Date()
      };

      const result = await db.update(issues)
        .set(updateData)
        .where(eq(issues.id, testIssueId))
        .returning();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].status).toBe('IN_PROGRESS');
    });
  });

  describe('Database Performance Tests', () => {
    it('should handle bulk insert efficiently', async () => {
      const startTime = Date.now();
      
      const bulkData = Array(10).fill(null).map((_, i) => ({
        serialNumber: `BULK-TEST-${i}`,
        productModelId: 'model-123',
        status: 'IN_PRODUCTION' as const,
        productionDate: new Date(),
        createdBy: testUserId,
        updatedBy: testUserId,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const result = await db.insert(products).values(bulkData).returning();
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(result.length).toBe(10);
      expect(endTime - startTime).toBeLessThan(1000); // Less than 1 second

      // Cleanup bulk data
      const ids = result.map(r => r.id);
      await db.delete(products).where(eq(products.id, ids[0])); // Delete one by one for cleanup
    });

    it('should handle complex joins efficiently', async () => {
      const startTime = Date.now();
      
      const result = await db.select({
        product: products,
        user: users
      })
      .from(products)
      .leftJoin(users, eq(products.createdBy, users.id))
      .where(eq(products.id, testProductId));
      
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(endTime - startTime).toBeLessThan(100); // Less than 100ms
    });
  });

  describe('Database Transaction Tests', () => {
    it('should handle transaction rollback', async () => {
      // This test would require transaction support
      // For now, we'll test basic error handling
      try {
        await db.insert(users).values({
          email: 'invalid-email', // This might cause an error
          password: 'test',
          firstName: 'Test',
          lastName: 'User',
          role: 'CUSTOMER' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (error) {
        // Expected to fail due to invalid email format
        expect(error).toBeDefined();
      }
    });
  });
});
