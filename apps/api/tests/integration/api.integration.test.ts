import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app';

describe('API Integration Tests', () => {
  let authToken: string;
  let testProductId: string;

  beforeAll(async () => {
    // Setup test database and get auth token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@miltera.com',
        password: 'admin123'
      });

    authToken = loginResponse.body.token;
  });

  describe('Authentication Flow', () => {
    it('should login and return JWT token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@miltera.com',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@miltera.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('Product Management Flow', () => {
    it('should create, read, update, and delete products', async () => {
      // Create product
      const createResponse = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serialNumber: 'TEST-INTEGRATION-001',
          productModelId: 'model-123',
          productionDate: new Date().toISOString(),
          status: 'IN_PRODUCTION',
          locationId: 'location-123',
          createdBy: 'user-123'
        });

      expect(createResponse.status).toBe(201);
      testProductId = createResponse.body.id;

      // Read product
      const readResponse = await request(app)
        .get(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(readResponse.status).toBe(200);
      expect(readResponse.body.serialNumber).toBe('TEST-INTEGRATION-001');

      // Update product
      const updateResponse = await request(app)
        .put(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'READY_FOR_SHIPMENT',
          updatedBy: 'user-123'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.status).toBe('READY_FOR_SHIPMENT');

      // Delete product
      const deleteResponse = await request(app)
        .delete(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
    });
  });

  describe('Location Update Persistence', () => {
    it('should persist location changes correctly', async () => {
      // Create product
      const createResponse = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serialNumber: 'TEST-LOCATION-001',
          productModelId: 'model-123',
          productionDate: new Date().toISOString(),
          status: 'IN_PRODUCTION',
          locationId: 'location-123',
          createdBy: 'user-123'
        });

      const productId = createResponse.body.id;

      // Update location to null (Müşteride)
      const updateResponse = await request(app)
        .put(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          locationId: null,
          updatedBy: 'user-123'
        });

      expect(updateResponse.status).toBe(200);

      // Verify location change persisted
      const verifyResponse = await request(app)
        .get(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.locationId).toBeNull();

      // Cleanup
      await request(app)
        .delete(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);
    });
  });

  describe('Database Transaction Integrity', () => {
    it('should handle concurrent updates correctly', async () => {
      const productId = 'test-concurrent-product';

      // Create test product
      await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serialNumber: 'TEST-CONCURRENT-001',
          productModelId: 'model-123',
          productionDate: new Date().toISOString(),
          status: 'IN_PRODUCTION',
          createdBy: 'user-123'
        });

      // Simulate concurrent updates
      const update1 = request(app)
        .put(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'READY_FOR_SHIPMENT', updatedBy: 'user-123' });

      const update2 = request(app)
        .put(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ locationId: 'new-location', updatedBy: 'user-123' });

      const [result1, result2] = await Promise.all([update1, update2]);

      // At least one should succeed
      expect([result1.status, result2.status]).toContain(200);

      // Cleanup
      await request(app)
        .delete(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);
    });
  });
});
