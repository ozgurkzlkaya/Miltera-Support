import { describe, it, expect } from '@jest/globals';
import { rateLimitMiddleware, securityHeadersMiddleware } from '../../lib/security';

describe('Security Middleware', () => {
  describe('rateLimitMiddleware', () => {
    it('should be a function', () => {
      expect(typeof rateLimitMiddleware).toBe('function');
    });
  });

  describe('securityHeadersMiddleware', () => {
    it('should be a function', () => {
      expect(typeof securityHeadersMiddleware).toBe('function');
    });
  });
});
