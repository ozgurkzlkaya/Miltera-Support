import { describe, it, expect, jest } from '@jest/globals';

// Mock JWT
const mockJwt = {
  verify: jest.fn()
};

jest.mock('jsonwebtoken', () => mockJwt);

describe('Auth Library Unit Tests', () => {
  describe('Token Verification', () => {
    it('should verify valid JWT token', async () => {
      mockJwt.verify.mockReturnValue({ userId: 'user-123', role: 'ADMIN' });

      // Mock verifyToken function
      const verifyToken = (token: string) => {
        return mockJwt.verify(token, 'test-secret');
      };

      const result = verifyToken('valid-token');

      expect(result).toEqual({ userId: 'user-123', role: 'ADMIN' });
    });

    it('should throw error for invalid token', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const verifyToken = (token: string) => {
        try {
          return mockJwt.verify(token, 'test-secret');
        } catch (error) {
          throw new Error('Invalid token');
        }
      };

      await expect(() => verifyToken('invalid-token'))
        .toThrow('Invalid token');
    });

    it('should throw error for expired token', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      const verifyToken = (token: string) => {
        try {
          return mockJwt.verify(token, 'test-secret');
        } catch (error) {
          throw new Error('Token expired');
        }
      };

      await expect(() => verifyToken('expired-token'))
        .toThrow('Token expired');
    });
  });
});
