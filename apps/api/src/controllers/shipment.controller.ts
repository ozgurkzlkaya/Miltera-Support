import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ShipmentService } from '../services/shipment.service';
import { auth } from '../lib/auth';

const shipmentService = new ShipmentService();

// Validation schemas
const createShipmentSchema = z.object({
  type: z.enum(['SALES', 'SERVICE_RETURN', 'SERVICE_SEND']),
  companyId: z.string().uuid(),
  issueId: z.string().uuid().optional(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().datetime().optional(),
  notes: z.string().optional(),
  productIds: z.array(z.string().uuid()).min(1),
});

const updateShipmentSchema = z.object({
  status: z.enum(['PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().datetime().optional(),
  actualDelivery: z.string().datetime().optional(),
  totalCost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const shipmentFilterSchema = z.object({
  status: z.enum(['PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  type: z.enum(['SALES', 'SERVICE_RETURN', 'SERVICE_SEND']).optional(),
  companyId: z.string().uuid().optional(),
  issueId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const shipmentController = new Hono();

// Sevkiyat listesi
shipmentController.get('/', zValidator('query', shipmentFilterSchema), async (c) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const query = c.req.valid('query');
    const { page, limit, ...filter } = query;

    // Müşteri kullanıcıları sadece kendi sevkiyatlarını görebilir
    if (session.user.role === 'CUSTOMER') {
      filter.companyId = session.user.companyId;
    }

    const result = await shipmentService.getShipments(filter, page, limit);

    return c.json({
      success: true,
      data: result.shipments,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error getting shipments:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Sevkiyat detayı
shipmentController.get('/:id', async (c) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const shipmentId = c.req.param('id');
    const shipment = await shipmentService.getShipmentById(shipmentId);

    if (!shipment) {
      return c.json({ error: 'Shipment not found' }, 404);
    }

    // Müşteri kullanıcıları sadece kendi sevkiyatlarını görebilir
    if (session.user.role === 'CUSTOMER' && shipment.company?.id !== session.user.companyId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    return c.json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    console.error('Error getting shipment:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Yeni sevkiyat oluşturma
shipmentController.post('/', zValidator('json', createShipmentSchema), async (c) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Sadece TSP ve ADMIN sevkiyat oluşturabilir
    if (session.user.role !== 'TSP' && session.user.role !== 'ADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const body = c.req.valid('json');
    const {
      type,
      companyId,
      issueId,
      trackingNumber,
      estimatedDelivery,
      notes,
      productIds
    } = body;

    const shipment = await shipmentService.createShipment({
      type,
      companyId,
      issueId,
      trackingNumber,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
      notes,
      productIds,
      createdBy: session.user.id,
    });

    return c.json({
      success: true,
      data: shipment,
      message: 'Sevkiyat başarıyla oluşturuldu',
    }, 201);
  } catch (error) {
    console.error('Error creating shipment:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Sevkiyat güncelleme
shipmentController.put('/:id', zValidator('json', updateShipmentSchema), async (c) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Sadece TSP ve ADMIN sevkiyat güncelleyebilir
    if (session.user.role !== 'TSP' && session.user.role !== 'ADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const shipmentId = c.req.param('id');
    const body = c.req.valid('json');
    const {
      status,
      trackingNumber,
      estimatedDelivery,
      actualDelivery,
      totalCost,
      notes
    } = body;

    const shipment = await shipmentService.updateShipment({
      shipmentId,
      status,
      trackingNumber,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
      actualDelivery: actualDelivery ? new Date(actualDelivery) : undefined,
      totalCost,
      notes,
      updatedBy: session.user.id,
    });

    if (!shipment) {
      return c.json({ error: 'Shipment not found' }, 404);
    }

    return c.json({
      success: true,
      data: shipment,
      message: 'Sevkiyat başarıyla güncellendi',
    });
  } catch (error) {
    console.error('Error updating shipment:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Sevkiyat durumu güncelleme
shipmentController.patch('/:id/status', zValidator('json', z.object({
  status: z.enum(['PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
})), async (c) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Sadece TSP ve ADMIN sevkiyat durumu güncelleyebilir
    if (session.user.role !== 'TSP' && session.user.role !== 'ADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const shipmentId = c.req.param('id');
    const body = c.req.valid('json');
    const { status } = body;

    const shipment = await shipmentService.updateShipmentStatus(shipmentId, status, session.user.id);

    if (!shipment) {
      return c.json({ error: 'Shipment not found' }, 404);
    }

    return c.json({
      success: true,
      data: shipment,
      message: 'Sevkiyat durumu başarıyla güncellendi',
    });
  } catch (error) {
    console.error('Error updating shipment status:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Sevkiyat silme
shipmentController.delete('/:id', async (c) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Sadece ADMIN sevkiyat silebilir
    if (session.user.role !== 'ADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const shipmentId = c.req.param('id');
    const deleted = await shipmentService.deleteShipment(shipmentId);

    if (!deleted) {
      return c.json({ error: 'Shipment not found' }, 404);
    }

    return c.json({ success: true }, 204);
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Sevkiyata ürün ekleme
shipmentController.post('/:id/items', zValidator('json', z.object({
  productIds: z.array(z.string().uuid()).min(1),
})), async (c) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Sadece TSP ve ADMIN sevkiyata ürün ekleyebilir
    if (session.user.role !== 'TSP' && session.user.role !== 'ADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const shipmentId = c.req.param('id');
    const body = c.req.valid('json');
    const { productIds } = body;

    const shipment = await shipmentService.addItemsToShipment(shipmentId, productIds);

    if (!shipment) {
      return c.json({ error: 'Shipment not found' }, 404);
    }

    return c.json({
      success: true,
      data: shipment,
      message: 'Ürünler sevkiyata başarıyla eklendi',
    });
  } catch (error) {
    console.error('Error adding items to shipment:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Kargo takip bilgilerini güncelleme
shipmentController.patch('/:id/tracking', zValidator('json', z.object({
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().datetime().optional(),
  actualDelivery: z.string().datetime().optional(),
})), async (c) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Sadece TSP ve ADMIN kargo bilgilerini güncelleyebilir
    if (session.user.role !== 'TSP' && session.user.role !== 'ADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const shipmentId = c.req.param('id');
    const body = c.req.valid('json');
    const {
      trackingNumber,
      estimatedDelivery,
      actualDelivery
    } = body;

    const shipment = await shipmentService.updateTrackingInfo({
      shipmentId,
      trackingNumber,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
      actualDelivery: actualDelivery ? new Date(actualDelivery) : undefined,
      updatedBy: session.user.id,
    });

    if (!shipment) {
      return c.json({ error: 'Shipment not found' }, 404);
    }

    return c.json({
      success: true,
      data: shipment,
      message: 'Kargo takip bilgileri başarıyla güncellendi',
    });
  } catch (error) {
    console.error('Error updating tracking info:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Sevkiyat numarası ile arama
shipmentController.get('/search/:shipmentNumber', async (c) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const shipmentNumber = c.req.param('shipmentNumber');
    const shipment = await shipmentService.searchByShipmentNumber(shipmentNumber);

    if (!shipment) {
      return c.json({ error: 'Shipment not found' }, 404);
    }

    // Müşteri kullanıcıları sadece kendi sevkiyatlarını görebilir
    if (session.user.role === 'CUSTOMER' && shipment.company?.id !== session.user.companyId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    return c.json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    console.error('Error searching shipment:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Kargo takip numarası ile arama
shipmentController.get('/tracking/:trackingNumber', async (c) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const trackingNumber = c.req.param('trackingNumber');
    const shipment = await shipmentService.searchByTrackingNumber(trackingNumber);

    if (!shipment) {
      return c.json({ error: 'Shipment not found' }, 404);
    }

    // Müşteri kullanıcıları sadece kendi sevkiyatlarını görebilir
    if (session.user.role === 'CUSTOMER' && shipment.company?.id !== session.user.companyId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    return c.json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    console.error('Error searching by tracking number:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Sevkiyat istatistikleri
shipmentController.get('/stats/overview', async (c) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const stats = await shipmentService.getShipmentStats();

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting shipment stats:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Sevkiyat teslim etme
shipmentController.post('/:id/deliver', async (c) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Sadece TSP ve ADMIN sevkiyat teslim edebilir
    if (session.user.role !== 'TSP' && session.user.role !== 'ADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const shipmentId = c.req.param('id');
    const shipment = await shipmentService.updateShipmentStatus(shipmentId, 'DELIVERED', session.user.id);

    if (!shipment) {
      return c.json({ error: 'Shipment not found' }, 404);
    }

    return c.json({
      success: true,
      data: shipment,
      message: 'Sevkiyat başarıyla teslim edildi',
    });
  } catch (error) {
    console.error('Error delivering shipment:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default shipmentController; 