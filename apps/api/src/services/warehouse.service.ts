import { db } from '../db';
import { locations, products, productModels, productTypes, companies, users } from '../db/schema';
import { eq, and, isNull, isNotNull, desc, asc, count, sql } from 'drizzle-orm';
import type { ProductStatus } from '../db/schema';

export interface CreateLocationRequest {
  name: string;
  type: string;
  address?: string;
  notes?: string;
  createdBy: string;
}

export interface UpdateLocationRequest {
  locationId: string;
  name?: string;
  type?: string;
  address?: string;
  notes?: string;
  updatedBy: string;
}

export interface LocationFilter {
  type?: string;
  search?: string;
}

export interface WarehouseInventoryRequest {
  locationId?: string;
  includeEmpty?: boolean;
  status?: ProductStatus;
}

export interface BulkMoveProductsRequest {
  productIds: string[];
  targetLocationId: string;
  movedBy: string;
  reason?: string;
}

export interface InventoryCountRequest {
  locationId: string;
  countedBy: string;
  counts: Array<{
    productId: string;
    expectedQuantity: number;
    actualQuantity: number;
    notes?: string;
  }>;
}

export class WarehouseService {
  /**
   * Yeni konum oluşturur
   */
  async createLocation(request: CreateLocationRequest) {
    const { name, type, address, notes, createdBy } = request;

    const result = await db.insert(locations).values({
      name,
      type,
      address,
      notes,
    }).returning();

    return result[0];
  }

  /**
   * Konum günceller
   */
  async updateLocation(request: UpdateLocationRequest) {
    const { locationId, name, type, address, notes, updatedBy } = request;

    const updateData: any = {
      updatedAt: new Date()
    };

    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (address !== undefined) updateData.address = address;
    if (notes !== undefined) updateData.notes = notes;

    const result = await db
      .update(locations)
      .set(updateData)
      .where(eq(locations.id, locationId))
      .returning();

    return result[0];
  }

  /**
   * Konumları listeler
   */
  async getLocations(filter: LocationFilter = {}) {
    let whereConditions = [];

    if (filter.type) {
      whereConditions.push(eq(locations.type, filter.type));
    }

    if (filter.search) {
      whereConditions.push(sql`${locations.name} ILIKE ${`%${filter.search}%`}`);
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const result = await db
      .select({
        id: locations.id,
        name: locations.name,
        type: locations.type,
        address: locations.address,
        notes: locations.notes,
        createdAt: locations.createdAt,
        updatedAt: locations.updatedAt,
      })
      .from(locations)
      .where(whereClause)
      .orderBy(asc(locations.name));

    return result;
  }

  /**
   * Konum detayını getirir
   */
  async getLocationById(locationId: string) {
    const result = await db
      .select({
        id: locations.id,
        name: locations.name,
        type: locations.type,
        address: locations.address,
        notes: locations.notes,
        createdAt: locations.createdAt,
        updatedAt: locations.updatedAt,
      })
      .from(locations)
      .where(eq(locations.id, locationId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Depo envanterini getirir
   */
  async getWarehouseInventory(request: WarehouseInventoryRequest = {}) {
    const { locationId, includeEmpty = false, status } = request;

    let whereConditions = [isNotNull(products.locationId)];

    if (locationId) {
      whereConditions.push(eq(products.locationId, locationId));
    }

    if (status) {
      whereConditions.push(eq(products.status, status));
    }

    const whereClause = and(...whereConditions);

    // Konum bazında ürün sayıları
    const inventoryCounts = await db
      .select({
        locationId: products.locationId,
        locationName: locations.name,
        locationType: locations.type,
        status: products.status,
        count: count(products.id),
      })
      .from(products)
      .leftJoin(locations, eq(products.locationId, locations.id))
      .where(whereClause)
      .groupBy(products.locationId, locations.name, locations.type, products.status);

    // Boş konumları dahil et
    if (includeEmpty) {
      const allLocations = await this.getLocations();
      const emptyLocations = allLocations.filter(location => {
        return !inventoryCounts.some(count => count.locationId === location.id);
      });

      emptyLocations.forEach(location => {
        inventoryCounts.push({
          locationId: location.id,
          locationName: location.name,
          locationType: location.type,
          status: null,
          count: 0,
        });
      });
    }

    return inventoryCounts;
  }

  /**
   * Konum detaylı envanterini getirir
   */
  async getLocationInventory(locationId: string) {
    const products = await db
      .select({
        id: products.id,
        serialNumber: products.serialNumber,
        status: products.status,
        productionDate: products.productionDate,
        productModel: {
          id: productModels.id,
          name: productModels.name,
        },
        productType: {
          id: productTypes.id,
          name: productTypes.name,
        },
        manufacturer: {
          id: companies.id,
          name: companies.name,
        },
      })
      .from(products)
      .leftJoin(productModels, eq(products.productModelId, productModels.id))
      .leftJoin(productTypes, eq(productModels.productTypeId, productTypes.id))
      .leftJoin(companies, eq(productModels.manufacturerId, companies.id))
      .where(eq(products.locationId, locationId))
      .orderBy(asc(products.serialNumber));

    return products;
  }

  /**
   * Ürünleri toplu olarak başka konuma taşır
   */
  async bulkMoveProducts(request: BulkMoveProductsRequest) {
    const { productIds, targetLocationId, movedBy, reason } = request;

    // Hedef konumun var olduğunu kontrol et
    const targetLocation = await this.getLocationById(targetLocationId);
    if (!targetLocation) {
      throw new Error('Hedef konum bulunamadı');
    }

    // Ürünleri güncelle
    const result = await db
      .update(products)
      .set({
        locationId: targetLocationId,
        updatedBy: movedBy,
        updatedAt: new Date(),
      })
      .where(sql`${products.id} = ANY(${productIds})`)
      .returning();

    return result;
  }

  /**
   * Envanter sayımı yapar
   */
  async performInventoryCount(request: InventoryCountRequest) {
    const { locationId, countedBy, counts } = request;

    // Konumun var olduğunu kontrol et
    const location = await this.getLocationById(locationId);
    if (!location) {
      throw new Error('Konum bulunamadı');
    }

    const results = [];

    for (const count of counts) {
      const { productId, expectedQuantity, actualQuantity, notes } = count;

      // Ürünün mevcut durumunu kontrol et
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (!product[0]) {
        results.push({
          productId,
          success: false,
          error: 'Ürün bulunamadı',
        });
        continue;
      }

      // Sayım sonucunu kaydet (şimdilik sadece log)
      console.log(`Envanter sayımı: Ürün ${productId}, Beklenen: ${expectedQuantity}, Gerçek: ${actualQuantity}, Not: ${notes}`);

      results.push({
        productId,
        success: true,
        expectedQuantity,
        actualQuantity,
        difference: actualQuantity - expectedQuantity,
      });
    }

    return results;
  }

  /**
   * Depo istatistikleri
   */
  async getWarehouseStats() {
    // Toplam konum sayısı
    const totalLocations = await db
      .select({ count: count() })
      .from(locations)
      .then(result => result[0]?.count || 0);

    // Kullanılan konum sayısı
    const usedLocations = await db
      .select({ count: count() })
      .from(products)
      .where(isNotNull(products.locationId))
      .then(result => result[0]?.count || 0);

    // Toplam stok ürün sayısı
    const totalStockProducts = await db
      .select({ count: count() })
      .from(products)
      .where(isNull(products.ownerId))
      .then(result => result[0]?.count || 0);

    // Müşteriye ait ürün sayısı
    const totalCustomerProducts = await db
      .select({ count: count() })
      .from(products)
      .where(isNotNull(products.ownerId))
      .then(result => result[0]?.count || 0);

    // Durum bazında ürün sayıları
    const statusStats = await db
      .select({
        status: products.status,
        count: count(products.id),
      })
      .from(products)
      .groupBy(products.status);

    return {
      totalLocations,
      usedLocations,
      totalStockProducts,
      totalCustomerProducts,
      statusStats,
    };
  }

  /**
   * Konum bazında detaylı istatistikler
   */
  async getLocationStats() {
    const stats = await db
      .select({
        locationId: locations.id,
        locationName: locations.name,
        locationType: locations.type,
        totalProducts: count(products.id),
        status: products.status,
        statusCount: count(products.id),
      })
      .from(locations)
      .leftJoin(products, eq(locations.id, products.locationId))
      .groupBy(locations.id, locations.name, locations.type, products.status);

    return stats;
  }

  /**
   * Stok uyarıları (düşük stok, fazla stok vb.)
   */
  async getStockAlerts() {
    const alerts = [];

    // Boş konumlar
    const emptyLocations = await db
      .select({
        id: locations.id,
        name: locations.name,
        type: locations.type,
      })
      .from(locations)
      .leftJoin(products, eq(locations.id, products.locationId))
      .where(isNull(products.id))
      .groupBy(locations.id, locations.name, locations.type);

    if (emptyLocations.length > 0) {
      alerts.push({
        type: 'EMPTY_LOCATION',
        message: `${emptyLocations.length} konum boş`,
        details: emptyLocations,
      });
    }

    // Sevkiyata hazır ürünler
    const readyForShipment = await db
      .select({
        locationId: products.locationId,
        locationName: locations.name,
        count: count(products.id),
      })
      .from(products)
      .leftJoin(locations, eq(products.locationId, locations.id))
      .where(eq(products.status, 'READY_FOR_SHIPMENT'))
      .groupBy(products.locationId, locations.name);

    if (readyForShipment.length > 0) {
      alerts.push({
        type: 'READY_FOR_SHIPMENT',
        message: `${readyForShipment.reduce((sum, item) => sum + item.count, 0)} ürün sevkiyata hazır`,
        details: readyForShipment,
      });
    }

    // Arızalı ürünler
    const defectiveProducts = await db
      .select({
        locationId: products.locationId,
        locationName: locations.name,
        count: count(products.id),
      })
      .from(products)
      .leftJoin(locations, eq(products.locationId, locations.id))
      .where(eq(products.status, 'FIRST_PRODUCTION_ISSUE'))
      .groupBy(products.locationId, locations.name);

    if (defectiveProducts.length > 0) {
      alerts.push({
        type: 'DEFECTIVE_PRODUCTS',
        message: `${defectiveProducts.reduce((sum, item) => sum + item.count, 0)} arızalı ürün`,
        details: defectiveProducts,
      });
    }

    return alerts;
  }
}
