import { db } from '../db';
import { shipments, companies, users, issues, products } from '../db/schema';
import { eq, and, or, like, desc, asc, count, sql } from 'drizzle-orm';
import type { ShipmentCreate, ShipmentUpdate, ShipmentStatusUpdate } from '../dtos/shipment.dto';
import { EmailService } from './email.service';
import { notificationService } from './notification.service';

export class ShipmentService {
  private emailService = new EmailService();

  // Sevkiyat listesi
  async getShipments(filter: any, page: number = 1, limit: number = 20) {
    console.log('getShipments called with:', { filter, page, limit });
    
    try {
      // Sevkiyat listesi - company ve user bilgileri ile
      const shipmentList = await db
        .select({
          id: shipments.id,
          shipmentNumber: shipments.shipmentNumber,
          type: shipments.type,
          status: shipments.status,
          trackingNumber: shipments.trackingNumber,
          totalCost: shipments.totalCost,
          estimatedDelivery: shipments.estimatedDelivery,
          actualDelivery: shipments.actualDelivery,
          shippedAt: shipments.shippedAt,
          deliveredAt: shipments.deliveredAt,
          createdAt: shipments.createdAt,
          updatedAt: shipments.updatedAt,
          company: {
            id: companies.id,
            name: companies.name,
          },
          createdBy: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
          },
        })
        .from(shipments)
        .leftJoin(companies, eq(shipments.toCompanyId, companies.id))
        .leftJoin(users, eq(shipments.createdBy, users.id))
        .orderBy(desc(shipments.createdAt))
        .limit(limit);
      
      console.log('Shipments found:', shipmentList.length);
      
      return {
        shipments: shipmentList,
        pagination: {
          page,
          limit,
          total: shipmentList.length,
          totalPages: 1,
        },
      };
    } catch (error) {
      console.error('Error in getShipments:', error);
      throw error;
    }
  }

  // Sevkiyat detayı
  async getShipmentById(shipmentId: string) {
    const shipment = await db
      .select({
        id: shipments.id,
        shipmentNumber: shipments.shipmentNumber,
        type: shipments.type,
        status: shipments.status,
        trackingNumber: shipments.trackingNumber,
        totalCost: shipments.totalCost,
        estimatedDelivery: shipments.estimatedDelivery,
        actualDelivery: shipments.actualDelivery,
        shippedAt: shipments.shippedAt,
        deliveredAt: shipments.deliveredAt,
        createdAt: shipments.createdAt,
        updatedAt: shipments.updatedAt,
        fromCompany: {
          id: companies.id,
          name: companies.name,
        },
        toCompany: {
          id: companies.id,
          name: companies.name,
        },
        createdBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        product: {
          id: products.id,
          serialNumber: products.serialNumber,
          status: products.status,
        },
      })
      .from(shipments)
      .leftJoin(companies, eq(shipments.toCompanyId, companies.id))
      .leftJoin(users, eq(shipments.createdBy, users.id))
      .leftJoin(products, eq(shipments.productId, products.id))
      .where(eq(shipments.id, shipmentId))
      .limit(1);

    if (!shipment[0]) {
      return null;
    }

    return shipment[0];
  }

  // Yeni sevkiyat oluşturma
  async createShipment(data: any) {
    // Sevkiyat numarası oluştur
    const shipmentNumber = await this.generateShipmentNumber();
    
    // Sevkiyat oluştur
    const [newShipment] = await db
      .insert(shipments)
      .values({
        id: crypto.randomUUID(),
        shipmentNumber,
        type: data.type || 'SALES',
        status: data.status || 'PREPARING',
        fromCompanyId: data.fromCompanyId,
        toCompanyId: data.toCompanyId,
        trackingNumber: data.trackingNumber,
        totalCost: data.totalCost,
        estimatedDelivery: data.estimatedDelivery,
        notes: data.notes,
        createdBy: data.createdBy,
      })
      .returning();
    
    const shipment = await this.getShipmentById(newShipment.id);
    
    return shipment;
  }

  // Sevkiyat numarası oluşturma
  private async generateShipmentNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    // Aynı gün oluşturulan sevkiyat sayısını al
    const existingCount = await db
      .select({ count: count() })
      .from(shipments)
      .where(sql`DATE(created_at) = CURRENT_DATE`);
    
    const count = existingCount[0]?.count || 0;
    const sequenceNumber = (count + 1).toString().padStart(2, '0');
    
    return `${year}${month}${day}-${sequenceNumber}`;
  }

  // Sevkiyat güncelleme
  async updateShipment(data: ShipmentUpdate & { shipmentId: string; updatedBy: string }) {
    const { shipmentId, updatedBy, ...updateData } = data;
    
    const [updatedShipment] = await db
      .update(shipments)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(shipments.id, shipmentId))
      .returning();

    return await this.getShipmentById(updatedShipment.id);
  }

  // Sevkiyat durumu güncelleme
  async updateShipmentStatus(data: ShipmentStatusUpdate & { shipmentId: string }) {
    const { shipmentId, status } = data;
    
    const updateData: any = { status };
    
    if (status === 'SHIPPED') {
      updateData.shippedAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }
    
    const [updatedShipment] = await db
      .update(shipments)
      .set(updateData)
      .where(eq(shipments.id, shipmentId))
      .returning();

    const shipment = await this.getShipmentById(updatedShipment.id);

    // Real-time notification gönder
    await notificationService.sendShipmentUpdateNotification(
      shipmentId,
      status,
      data.updatedBy || 'system'
    );

    return shipment;
  }

  // Sevkiyat istatistikleri
  async getShipmentStats() {
    const allShipments = await db.select().from(shipments);
    
    const stats = {
      total: allShipments.length,
      preparing: allShipments.filter(s => s.status === 'PREPARING').length,
      shipped: allShipments.filter(s => s.status === 'SHIPPED').length,
      delivered: allShipments.filter(s => s.status === 'DELIVERED').length,
      cancelled: allShipments.filter(s => s.status === 'CANCELLED').length,
    };

    return stats;
  }
} 