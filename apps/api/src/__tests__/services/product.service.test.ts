import { describe, it, expect } from '@jest/globals';
import { ProductService } from '../../services/product.service';

describe('ProductService', () => {
  describe('constructor', () => {
    it('should create an instance', () => {
      const service = new ProductService();
      expect(service).toBeInstanceOf(ProductService);
    });
  });

  describe('methods', () => {
    it('should have required methods', () => {
      const service = new ProductService();
      
      expect(typeof service.createProducts).toBe('function');
      expect(typeof service.bulkCreateProducts).toBe('function');
      expect(typeof service.updateProductStatus).toBe('function');
      expect(typeof service.bulkUpdateProductStatus).toBe('function');
      expect(typeof service.getProducts).toBe('function');
      expect(typeof service.getProductById).toBe('function');
    });
  });
});
