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
    const offset = (page - 1) * limit;
    
    // Filtreleme koşulları
    const whereConditions = [];
    
    if (filter.status) {
      whereConditions.push(eq(shipments.status, filter.status));
    }
    
    if (filter.type) {
      whereConditions.push(eq(shipments.type, filter.type));
    }
    
    if (filter.fromCompanyId) {
      whereConditions.push(eq(shipments.fromCompanyId, filter.fromCompanyId));
    }
    
    if (filter.toCompanyId) {
      whereConditions.push(eq(shipments.toCompanyId, filter.toCompanyId));
    }
    
    if (filter.search) {
      whereConditions.push(
        or(
          like(shipments.trackingNumber, `%${filter.search}%`)
        )
      );
    }
    
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    // Toplam kayıt sayısı
    const totalResult = await db
      .select({ count: count() })
      .from(shipments)
      .where(whereClause);
    
    const totalItems = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Sevkiyat listesi
    const shipmentList = await db
      .select({
        id: shipments.id,
        productId: shipments.productId,
        type: shipments.type,
        status: shipments.status,
        trackingNumber: shipments.trackingNumber,
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
          name: users.name,
        },
      })
      .from(shipments)
      .leftJoin(companies, eq(shipments.fromCompanyId, companies.id))
      .leftJoin(companies, eq(shipments.toCompanyId, companies.id))
      .leftJoin(users, eq(shipments.createdBy, users.id))
      .where(whereClause)
      .orderBy(desc(shipments.createdAt))
      .limit(limit)
      .offset(offset);
    
    return {
      shipments: shipmentList,
      pagination: {
        page,
        limit,
        total: totalItems,
        totalPages,
      },
    };
  }

  // Sevkiyat detayı
  async getShipmentById(shipmentId: string) {
    const shipment = await db
      .select({
        id: shipments.id,
        productId: shipments.productId,
        type: shipments.type,
        status: shipments.status,
        trackingNumber: shipments.trackingNumber,
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
          name: users.name,
        },
        product: {
          id: products.id,
          serialNumber: products.serialNumber,
          status: products.status,
        },
      })
      .from(shipments)
      .leftJoin(companies, eq(shipments.fromCompanyId, companies.id))
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
  async createShipment(data: ShipmentCreate & { createdBy: string }) {
    const { productId, ...shipmentData } = data;
    
    // Sevkiyat oluştur
    const [newShipment] = await db
      .insert(shipments)
      .values({
        id: crypto.randomUUID(),
        productId,
        ...shipmentData,
        createdBy: data.createdBy,
      })
      .returning();
    
    const shipment = await this.getShipmentById(newShipment.id);
    
    return shipment;
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