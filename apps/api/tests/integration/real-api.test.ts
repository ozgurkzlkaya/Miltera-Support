import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app';

describe('Real API Integration Tests', () => {
  let authToken: string;
  let testProductId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Test için gerekli setup
    console.log('🚀 Setting up real API tests...');
  });

  afterAll(async () => {
    // Test cleanup
    console.log('🧹 Cleaning up real API tests...');
  });

  describe('Authentication Endpoints', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@miltera.com',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      
      authToken = response.body.data.token;
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@miltera.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
    });
  });

  describe('Product Endpoints', () => {
    it('should create a new product', async () => {
      const productData = {
        serialNumber: 'REAL-TEST-001',
        productModelId: 'model-123',
        productionDate: new Date().toISOString(),
        status: 'IN_PRODUCTION',
        locationId: 'location-123',
        createdBy: 'user-123'
      };

      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product).toBeDefined();
      
      testProductId = response.body.data.product.id;
    });

    it('should get products list', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeDefined();
      expect(Array.isArray(response.body.data.products)).toBe(true);
    });

    it('should get specific product', async () => {
      const response = await request(app)
        .get(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product).toBeDefined();
      expect(response.body.data.product.id).toBe(testProductId);
    });

    it('should update product location', async () => {
      const updateData = {
        locationId: null, // Müşteride
        updatedBy: 'user-123'
      };

      const response = await request(app)
        .put(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.product.locationId).toBeNull();
    });

    it('should delete product', async () => {
      const response = await request(app)
        .delete(`/api/v1/products/${testProductId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('User Endpoints', () => {
    it('should get users list', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeDefined();
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should create a new user', async () => {
      const userData = {
        email: 'testuser@example.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
        companyId: 'company-123'
      };

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      
      testUserId = response.body.data.user.id;
    });

    it('should update user', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'User'
      };

      const response = await request(app)
        .put(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe('Updated');
    });

    it('should delete user', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Company Endpoints', () => {
    it('should get companies list', async () => {
      const response = await request(app)
        .get('/api/v1/companies')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.companies).toBeDefined();
      expect(Array.isArray(response.body.data.companies)).toBe(true);
    });
  });

  describe('Issue Endpoints', () => {
    it('should get issues list', async () => {
      const response = await request(app)
        .get('/api/v1/issues')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.issues).toBeDefined();
      expect(Array.isArray(response.body.data.issues)).toBe(true);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/non-existent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 for protected endpoint without token', async () => {
      const response = await request(app)
        .get('/api/v1/users');

      expect(response.status).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
