import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ProductService } from '../services/product.service';
import { getAuth } from '../lib/auth';

const productService = new ProductService();

// Validation schemas
const createProductSchema = z.object({
  productModelId: z.string().uuid(),
  quantity: z.number().min(1).max(100),
  productionDate: z.string().datetime(),
  locationId: z.string().uuid().optional(),
});

const updateProductStatusSchema = z.object({
  status: z.enum([
    'FIRST_PRODUCTION',
    'FIRST_PRODUCTION_ISSUE',
    'FIRST_PRODUCTION_SCRAPPED',
    'READY_FOR_SHIPMENT',
    'SHIPPED',
    'ISSUE_CREATED',
    'RECEIVED',
    'PRE_TEST_COMPLETED',
    'UNDER_REPAIR',
    'SERVICE_SCRAPPED',
    'DELIVERED'
  ]),
  serialNumber: z.string().optional(),
  hardwareVerificationBy: z.string().uuid().optional(),
  warrantyStartDate: z.string().datetime().optional(),
  warrantyPeriodMonths: z.number().min(0).max(120).optional(),
});

const productFilterSchema = z.object({
  status: z.enum([
    'FIRST_PRODUCTION',
    'FIRST_PRODUCTION_ISSUE',
    'FIRST_PRODUCTION_SCRAPPED',
    'READY_FOR_SHIPMENT',
    'SHIPPED',
    'ISSUE_CREATED',
    'RECEIVED',
    'PRE_TEST_COMPLETED',
    'UNDER_REPAIR',
    'SERVICE_SCRAPPED',
    'DELIVERED'
  ]).optional(),
  manufacturerId: z.string().uuid().optional(),
  productTypeId: z.string().uuid().optional(),
  productModelId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const productController = new Hono();

// Ürün listesi
productController.get('/', zValidator('query', productFilterSchema), async (c) => {
  try {
    const auth = await getAuth(c);
    if (!auth.isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const query = c.req.valid('query');
    const { page, limit, ...filter } = query;

    const result = await productService.getProducts(filter, page, limit);

    return c.json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error getting products:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Ürün detayı
productController.get('/:id', async (c) => {
  try {
    const auth = await getAuth(c);
    if (!auth.isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productId = c.req.param('id');
    const product = await productService.getProductById(productId);

    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    return c.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error getting product:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Yeni ürün oluşturma (İlk üretim)
productController.post('/', zValidator('json', createProductSchema), async (c) => {
  try {
    const auth = await getAuth(c);
    if (!auth.isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Sadece TSP ve ADMIN ürün oluşturabilir
    if (auth.user.role !== 'TSP' && auth.user.role !== 'ADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const body = c.req.valid('json');
    const { productModelId, quantity, productionDate, locationId } = body;

    const products = await productService.createProducts({
      productModelId,
      quantity,
      productionDate: new Date(productionDate),
      locationId,
      createdBy: auth.user.id,
    });

    return c.json({
      success: true,
      data: products,
      message: `${quantity} ürün başarıyla oluşturuldu`,
    }, 201);
  } catch (error) {
    console.error('Error creating products:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Ürün durumu güncelleme
productController.patch('/:id/status', zValidator('json', updateProductStatusSchema), async (c) => {
  try {
    const auth = await getAuth(c);
    if (!auth.isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Sadece TSP ve ADMIN ürün durumu güncelleyebilir
    if (auth.user.role !== 'TSP' && auth.user.role !== 'ADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const productId = c.req.param('id');
    const body = c.req.valid('json');
    const { status, serialNumber, hardwareVerificationBy, warrantyStartDate, warrantyPeriodMonths } = body;

    const product = await productService.updateProductStatus({
      productId,
      status,
      updatedBy: auth.user.id,
      serialNumber,
      hardwareVerificationBy,
      warrantyStartDate: warrantyStartDate ? new Date(warrantyStartDate) : undefined,
      warrantyPeriodMonths,
    });

    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    return c.json({
      success: true,
      data: product,
      message: 'Ürün durumu başarıyla güncellendi',
    });
  } catch (error) {
    console.error('Error updating product status:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Ürün istatistikleri
productController.get('/stats/overview', async (c) => {
  try {
    const auth = await getAuth(c);
    if (!auth.isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const stats = await productService.getProductStats();

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting product stats:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Donanım doğrulama ve konfigürasyon
productController.post('/:id/hardware-verification', zValidator('json', z.object({
  serialNumber: z.string(),
  warrantyStartDate: z.string().datetime().optional(),
  warrantyPeriodMonths: z.number().min(0).max(120).optional(),
})), async (c) => {
  try {
    const auth = await getAuth(c);
    if (!auth.isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Sadece TSP ve ADMIN donanım doğrulama yapabilir
    if (auth.user.role !== 'TSP' && auth.user.role !== 'ADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const productId = c.req.param('id');
    const body = c.req.valid('json');
    const { serialNumber, warrantyStartDate, warrantyPeriodMonths } = body;

    const product = await productService.updateProductStatus({
      productId,
      status: 'READY_FOR_SHIPMENT',
      updatedBy: auth.user.id,
      serialNumber,
      hardwareVerificationBy: auth.user.id,
      warrantyStartDate: warrantyStartDate ? new Date(warrantyStartDate) : undefined,
      warrantyPeriodMonths,
    });

    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    return c.json({
      success: true,
      data: product,
      message: 'Donanım doğrulama ve konfigürasyon tamamlandı',
    });
  } catch (error) {
    console.error('Error hardware verification:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Üretim arızası işaretleme
productController.post('/:id/mark-production-issue', zValidator('json', z.object({
  issueCategoryId: z.string().uuid(),
  description: z.string(),
})), async (c) => {
  try {
    const auth = await getAuth(c);
    if (!auth.isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Sadece TSP ve ADMIN üretim arızası işaretleyebilir
    if (auth.user.role !== 'TSP' && auth.user.role !== 'ADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const productId = c.req.param('id');
    const body = c.req.valid('json');
    const { issueCategoryId, description } = body;

    // Önce ürünü arızalı olarak işaretle
    const product = await productService.updateProductStatus({
      productId,
      status: 'FIRST_PRODUCTION_ISSUE',
      updatedBy: auth.user.id,
    });

    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    // TODO: Arıza kaydı oluştur (IssueService kullanılacak)

    return c.json({
      success: true,
      data: product,
      message: 'Ürün üretim arızası olarak işaretlendi',
    });
  } catch (error) {
    console.error('Error marking production issue:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default productController;
