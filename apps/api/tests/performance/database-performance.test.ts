import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { db } from '../../src/db/client';
import { products, users, locations } from '../../src/drizzle/schema';

describe('Database Performance Tests', () => {
  beforeAll(async () => {
    // Setup test data
    await setupTestData();
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
  });

  describe('Query Performance', () => {
    it('should execute simple select queries within 50ms', async () => {
      const startTime = Date.now();
      const result = await db.select().from(products).limit(10);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should execute complex joins within 200ms', async () => {
      const startTime = Date.now();
      const result = await db
        .select({
          product: products,
          location: locations
        })
        .from(products)
        .leftJoin(locations, eq(products.locationId, locations.id))
        .limit(50);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should handle pagination efficiently', async () => {
      const startTime = Date.now();
      const result = await db
        .select()
        .from(products)
        .limit(20)
        .offset(40);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Insert Performance', () => {
    it('should insert single record within 100ms', async () => {
      const testProduct = {
        id: `perf-test-${Date.now()}`,
        serialNumber: `PERF-${Date.now()}`,
        productModelId: 'model-123',
        productionDate: new Date(),
        status: 'IN_PRODUCTION' as const,
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const startTime = Date.now();
      await db.insert(products).values(testProduct);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);

      // Cleanup
      await db.delete(products).where(eq(products.id, testProduct.id));
    });

    it('should handle bulk inserts efficiently', async () => {
      const testProducts = Array(50).fill(null).map((_, index) => ({
        id: `bulk-test-${Date.now()}-${index}`,
        serialNumber: `BULK-${Date.now()}-${index}`,
        productModelId: 'model-123',
        productionDate: new Date(),
        status: 'IN_PRODUCTION' as const,
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const startTime = Date.now();
      await db.insert(products).values(testProducts);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);

      // Cleanup
      const ids = testProducts.map(p => p.id);
      await db.delete(products).where(inArray(products.id, ids));
    });
  });

  describe('Update Performance', () => {
    it('should update single record within 100ms', async () => {
      // Create test product
      const testProduct = {
        id: `update-test-${Date.now()}`,
        serialNumber: `UPDATE-${Date.now()}`,
        productModelId: 'model-123',
        productionDate: new Date(),
        status: 'IN_PRODUCTION' as const,
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.insert(products).values(testProduct);

      const startTime = Date.now();
      await db
        .update(products)
        .set({ status: 'READY_FOR_SHIPMENT', updatedAt: new Date() })
        .where(eq(products.id, testProduct.id));
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);

      // Cleanup
      await db.delete(products).where(eq(products.id, testProduct.id));
    });

    it('should handle bulk updates efficiently', async () => {
      // Create test products
      const testProducts = Array(20).fill(null).map((_, index) => ({
        id: `bulk-update-${Date.now()}-${index}`,
        serialNumber: `BULK-UPDATE-${Date.now()}-${index}`,
        productModelId: 'model-123',
        productionDate: new Date(),
        status: 'IN_PRODUCTION' as const,
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await db.insert(products).values(testProducts);

      const startTime = Date.now();
      const ids = testProducts.map(p => p.id);
      await db
        .update(products)
        .set({ status: 'READY_FOR_SHIPMENT', updatedAt: new Date() })
        .where(inArray(products.id, ids));
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500);

      // Cleanup
      await db.delete(products).where(inArray(products.id, ids));
    });
  });

  describe('Index Performance', () => {
    it('should use indexes for status queries', async () => {
      const startTime = Date.now();
      const result = await db
        .select()
        .from(products)
        .where(eq(products.status, 'IN_PRODUCTION'))
        .limit(10);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should use indexes for serial number queries', async () => {
      const startTime = Date.now();
      const result = await db
        .select()
        .from(products)
        .where(like(products.serialNumber, 'TEST%'))
        .limit(10);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('Connection Pool Performance', () => {
    it('should handle concurrent database operations', async () => {
      const operations = Array(20).fill(null).map(async (_, index) => {
        const startTime = Date.now();
        const result = await db
          .select()
          .from(products)
          .where(eq(products.status, 'IN_PRODUCTION'))
          .limit(5);
        const endTime = Date.now();

        return { index, duration: endTime - startTime, result };
      });

      const results = await Promise.all(operations);

      results.forEach(({ duration }) => {
        expect(duration).toBeLessThan(200);
      });

      // All operations should complete successfully
      expect(results.length).toBe(20);
    });
  });
});

async function setupTestData() {
  // Create test locations if they don't exist
  const existingLocations = await db.select().from(locations).limit(1);
  if (existingLocations.length === 0) {
    await db.insert(locations).values([
      { id: 'location-1', name: 'Depo A', address: 'Test Address 1' },
      { id: 'location-2', name: 'Depo B', address: 'Test Address 2' }
    ]);
  }
}

async function cleanupTestData() {
  // Clean up any test data created during tests
  await db.delete(products).where(like(products.serialNumber, 'PERF-%'));
  await db.delete(products).where(like(products.serialNumber, 'BULK-%'));
  await db.delete(products).where(like(products.serialNumber, 'UPDATE-%'));
}
