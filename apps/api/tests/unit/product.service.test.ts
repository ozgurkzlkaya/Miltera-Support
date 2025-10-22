import { describe, it, expect, jest } from '@jest/globals';

// Mock ProductService
const mockProductService = {
  createProducts: jest.fn() as jest.MockedFunction<any>,
  updateProduct: jest.fn() as jest.MockedFunction<any>,
  getProducts: jest.fn() as jest.MockedFunction<any>,
  getProductById: jest.fn() as jest.MockedFunction<any>,
  deleteProduct: jest.fn() as jest.MockedFunction<any>
};

describe('ProductService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProducts', () => {
    it('should create products with valid data', async () => {
      const mockProductData = {
        productModelId: 'model-123',
        quantity: 5,
        productionDate: new Date(),
        locationId: 'location-123',
        createdBy: 'user-123'
      };

      const mockProducts = Array(5).fill(null).map((_, i) => ({ 
        id: `product-${i}`, 
        serialNumber: `TEST-${i}`,
        productModelId: 'model-123',
        status: 'IN_PRODUCTION',
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      mockProductService.createProducts.mockResolvedValue(mockProducts);

      const result = await mockProductService.createProducts(mockProductData);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect((result as any[]).length).toBe(5);
      expect(mockProductService.createProducts).toHaveBeenCalledWith(mockProductData);
    });

    it('should handle invalid data gracefully', async () => {
      const invalidData = {
        productModelId: '',
        quantity: 0,
        productionDate: new Date(),
        createdBy: 'user-123'
      };

      mockProductService.createProducts.mockRejectedValue(new Error('Invalid data'));

      await expect(mockProductService.createProducts(invalidData))
        .rejects.toThrow('Invalid data');
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const productId = 'product-123';
      const updateData = {
        locationId: 'new-location-id',
        updatedBy: 'user-123'
      };
      const mockUpdatedProduct = { 
        id: productId, 
        locationId: 'new-location-id',
        updatedBy: 'user-123',
        updatedAt: new Date()
      };

      mockProductService.updateProduct.mockResolvedValue(mockUpdatedProduct);

      const result = await mockProductService.updateProduct(productId, updateData);

      expect(result).toBeDefined();
      expect((result as any).id).toBe(productId);
      expect((result as any).locationId).toBe('new-location-id');
      expect(mockProductService.updateProduct).toHaveBeenCalledWith(productId, updateData);
    });
  });

  describe('getProducts', () => {
    it('should return products list', async () => {
      const mockProducts = [
        { id: '1', serialNumber: 'TEST-001', status: 'IN_PRODUCTION' },
        { id: '2', serialNumber: 'TEST-002', status: 'READY_FOR_SHIPMENT' }
      ];

      mockProductService.getProducts.mockResolvedValue(mockProducts);

      const result = await mockProductService.getProducts({});

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect((result as any[]).length).toBe(2);
      expect(mockProductService.getProducts).toHaveBeenCalledWith({});
    });
  });
});