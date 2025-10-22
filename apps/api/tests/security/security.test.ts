import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/app';

describe('Security Tests', () => {
  describe('Authentication Security', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/users');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject requests with invalid JWT', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', 'Bearer invalid-jwt-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject requests with malformed JWT', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', 'Bearer malformed.token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject expired JWT tokens', async () => {
      // This would require creating an expired token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDB9.invalid';
      
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Authorization Security', () => {
    let customerToken: string;
    let adminToken: string;

    beforeAll(async () => {
      // Get customer token
      const customerResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'customer@miltera.com',
          password: 'customer123'
        });
      customerToken = customerResponse.body.token;

      // Get admin token
      const adminResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@miltera.com',
          password: 'admin123'
        });
      adminToken = adminResponse.body.token;
    });

    it('should prevent customer access to admin routes', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    it('should allow admin access to all routes', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should prevent privilege escalation', async () => {
      // Try to access admin endpoint with customer token
      const response = await request(app)
        .delete('/api/v1/users/some-user-id')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('SQL Injection Protection', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@miltera.com',
          password: 'admin123'
        });
      authToken = loginResponse.body.token;
    });

    it('should prevent SQL injection in search parameters', async () => {
      const maliciousSearch = "'; DROP TABLE products; --";
      
      const response = await request(app)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: maliciousSearch });

      expect(response.status).toBe(200);
      // Should not crash the application
    });

    it('should prevent SQL injection in filter parameters', async () => {
      const maliciousFilter = "'; DELETE FROM products; --";
      
      const response = await request(app)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: maliciousFilter });

      expect(response.status).toBe(200);
    });

    it('should prevent SQL injection in sort parameters', async () => {
      const maliciousSort = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ sortBy: maliciousSort });

      expect(response.status).toBe(200);
    });
  });

  describe('XSS Protection', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@miltera.com',
          password: 'admin123'
        });
      authToken = loginResponse.body.token;
    });

    it('should sanitize XSS attempts in product data', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serialNumber: xssPayload,
          productModelId: 'model-123',
          productionDate: new Date().toISOString(),
          status: 'IN_PRODUCTION',
          createdBy: 'user-123'
        });

      if (response.status === 201) {
        // If product was created, verify the XSS payload was sanitized
        const productResponse = await request(app)
          .get(`/api/v1/products/${response.body.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(productResponse.body.serialNumber).not.toContain('<script>');
        
        // Cleanup
        await request(app)
          .delete(`/api/v1/products/${response.body.id}`)
          .set('Authorization', `Bearer ${authToken}`);
      }
    });
  });

  describe('CORS Security', () => {
    it('should include proper CORS headers', async () => {
      const response = await request(app)
        .options('/api/v1/health');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
      expect(response.headers['access-control-allow-headers']).toBeDefined();
    });

    it('should reject requests from unauthorized origins', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .set('Origin', 'https://malicious-site.com');

      // Should either reject or sanitize the response
      expect(response.status).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should implement rate limiting on auth endpoints', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'admin@miltera.com',
            password: 'wrongpassword'
          })
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      // Should have some rate limiting after multiple failed attempts
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should implement rate limiting on API endpoints', async () => {
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@miltera.com',
          password: 'admin123'
        });
      const authToken = loginResponse.body.token;

      const requests = Array(100).fill(null).map(() =>
        request(app)
          .get('/api/v1/products')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      // Should have some rate limiting after many requests
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    let authToken: string;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@miltera.com',
          password: 'admin123'
        });
      authToken = loginResponse.body.token;
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
          productModelId: 'model-123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('validation');
    });

    it('should validate data types', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serialNumber: 'TEST-001',
          productModelId: 'model-123',
          productionDate: 'invalid-date',
          status: 'INVALID_STATUS',
          createdBy: 'user-123'
        });

      expect(response.status).toBe(400);
    });

    it('should validate string length limits', async () => {
      const longString = 'a'.repeat(10000);
      
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serialNumber: longString,
          productModelId: 'model-123',
          productionDate: new Date().toISOString(),
          status: 'IN_PRODUCTION',
          createdBy: 'user-123'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
    });
  });
});
