import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app';

describe('Frontend-Backend Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // Get auth token for API calls
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@miltera.com',
        password: 'admin123'
      });

    authToken = loginResponse.body.token;
  });

  describe('Dashboard Data Flow', () => {
    it('should provide dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalProducts');
      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('totalIssues');
      expect(response.body).toHaveProperty('totalShipments');
    });

    it('should provide user-specific dashboard data', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/user-stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userIssues');
      expect(response.body).toHaveProperty('userProducts');
    });
  });

  describe('Real-time Data Synchronization', () => {
    it('should sync product updates across API calls', async () => {
      // Create product
      const createResponse = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serialNumber: 'SYNC-TEST-001',
          productModelId: 'model-123',
          productionDate: new Date().toISOString(),
          status: 'IN_PRODUCTION',
          createdBy: 'user-123'
        });

      const productId = createResponse.body.id;

      // Update product
      await request(app)
        .put(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'READY_FOR_SHIPMENT',
          updatedBy: 'user-123'
        });

      // Verify update is reflected in list
      const listResponse = await request(app)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`);

      const updatedProduct = listResponse.body.data.find((p: any) => p.id === productId);
      expect(updatedProduct.status).toBe('READY_FOR_SHIPMENT');

      // Cleanup
      await request(app)
        .delete(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);
    });
  });

  describe('Export Functionality', () => {
    it('should export products data as CSV', async () => {
      const response = await request(app)
        .get('/api/v1/products/export')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ format: 'csv' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.text).toContain('Serial Number');
      expect(response.text).toContain('Status');
    });

    it('should export users data as CSV', async () => {
      const response = await request(app)
        .get('/api/v1/users/export')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ format: 'csv' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.text).toContain('Email');
      expect(response.text).toContain('Role');
    });
  });

  describe('Search and Filter Integration', () => {
    it('should filter products by status', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'IN_PRODUCTION' });

      expect(response.status).toBe(200);
      response.body.data.forEach((product: any) => {
        expect(product.status).toBe('IN_PRODUCTION');
      });
    });

    it('should search products by serial number', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'TEST' });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
});
