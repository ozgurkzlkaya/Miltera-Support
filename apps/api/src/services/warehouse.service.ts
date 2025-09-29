import { db } from '../db';
import { locations, products, productModels, productTypes, companies, users, inventoryCounts } from '../db/schema';
import { eq, and, isNull, isNotNull, desc, asc, count, sql, gte, lt } from 'drizzle-orm';
import type { ProductStatus } from '../db/schema';
import { ProductService } from './product.service';
import { CompanyService } from './company.service';
import { IssueService } from './issue.service';
import { UserService } from './user.service';
import { ShipmentService } from './shipment.service';
import { NotificationService } from './notification.service';

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
  countedItems: Array<{
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
    try {
      const { name, type, address, notes, createdBy } = request;

      // User service kullanarak kullanıcıyı doğrula
      const userService = new UserService(db);
      const user = await userService.getUser(createdBy);
      
      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      const result = await db.insert(locations).values({
        name,
        type,
        address,
        notes,
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error in createLocation:', error);
      throw error;
    }
  }

  /**
   * Konum günceller
   */
  async updateLocation(request: UpdateLocationRequest) {
    try {
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
    } catch (error) {
      console.error('Error in updateLocation:', error);
      throw error;
    }
  }

  /**
   * Konumları listeler
   */
  async getLocations(filter: LocationFilter = {}) {
    try {
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
    } catch (error) {
      console.error('Error in getLocations:', error);
      throw error;
    }
  }

  /**
   * Konum detayını getirir
   */
  async getLocationById(locationId: string) {
    try {
      const result = await db
        .select({
          id: locations.id,
          name: locations.name,
          type: locations.type,
          address: locations.address,
          notes: locations.notes,
          capacity: locations.capacity,
          currentCount: locations.currentCount,
          createdAt: locations.createdAt,
          updatedAt: locations.updatedAt,
        })
        .from(locations)
        .where(eq(locations.id, locationId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('Error in getLocationById:', error);
      throw error;
    }
  }

  /**
   * Depo envanterini getirir
   */
  async getWarehouseInventory(request: WarehouseInventoryRequest = {}) {
    try {
      // Detaylı envanter sorgusu - tüm ürün bilgileri ile
      const inventory = await db
        .select({
          id: products.id,
          productId: products.id,
          serialNumber: products.serialNumber,
          status: products.status,
          locationId: products.locationId,
          locationName: locations.name,
          locationType: locations.type,
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
          productionDate: products.productionDate,
          createdAt: products.createdAt,
        })
        .from(products)
        .leftJoin(locations, eq(products.locationId, locations.id))
        .leftJoin(productModels, eq(products.productModelId, productModels.id))
        .leftJoin(productTypes, eq(productModels.productTypeId, productTypes.id))
        .leftJoin(companies, eq(productModels.manufacturerId, companies.id))
        .where(isNotNull(products.locationId));

      return inventory;
    } catch (error) {
      console.error('Error in getWarehouseInventory:', error);
      throw error;
    }
  }

  /**
   * Konum detaylı envanterini getirir
   */
  async getLocationInventory(locationId: string) {
    try {
      // Konumun var olduğunu kontrol et
      const location = await this.getLocationById(locationId);
      if (!location) {
        throw new Error('Konum bulunamadı');
      }

      const locationProducts = await db
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

      return locationProducts;
    } catch (error) {
      console.error('Error in getLocationInventory:', error);
      throw error;
    }
  }

  /**
   * Ürünleri toplu olarak başka konuma taşır
   */
  async bulkMoveProducts(request: BulkMoveProductsRequest) {
    try {
      const { productIds, targetLocationId, movedBy, reason } = request;

      // Hedef konumu kontrol et
      const targetLocation = await db
        .select()
        .from(locations)
        .where(eq(locations.id, targetLocationId))
        .limit(1);

      if (targetLocation.length === 0) {
        throw new Error('Hedef konum bulunamadı');
      }

      const results = [];
      
      // Her ürün için taşıma işlemi yap
      for (const productId of productIds) {
        try {
          // Ürünün mevcut konumunu al
          const currentProduct = await db
            .select()
            .from(products)
            .where(eq(products.id, productId))
            .limit(1);

          if (currentProduct.length === 0) {
            results.push({
              productId,
              success: false,
              error: 'Ürün bulunamadı'
            });
            continue;
          }

          const oldLocationId = currentProduct[0].locationId;

          // Ürünü yeni konuma taşı
          await db
            .update(products)
            .set({
              locationId: targetLocationId,
              updatedAt: new Date()
            })
            .where(eq(products.id, productId));

          // Eski konumun kapasitesini güncelle (varsa)
          if (oldLocationId) {
            const oldLocationProducts = await db
              .select({ count: count(products.id) })
              .from(products)
              .where(eq(products.locationId, oldLocationId));

            await db
              .update(locations)
              .set({
                currentCount: oldLocationProducts[0]?.count || 0,
                updatedAt: new Date()
              })
              .where(eq(locations.id, oldLocationId));
          }

          // Yeni konumun kapasitesini güncelle
          const newLocationProducts = await db
            .select({ count: count(products.id) })
            .from(products)
            .where(eq(products.locationId, targetLocationId));

          await db
            .update(locations)
            .set({
              currentCount: newLocationProducts[0]?.count || 0,
              updatedAt: new Date()
            })
            .where(eq(locations.id, targetLocationId));

          results.push({
            productId,
            success: true,
            newLocationId: targetLocationId,
            oldLocationId,
            movedBy,
            reason
          });

        } catch (productError) {
          console.error(`Error moving product ${productId}:`, productError);
          results.push({
            productId,
            success: false,
            error: productError instanceof Error ? productError.message : 'Bilinmeyen hata'
          });
        }
      }

      return {
        movedProducts: results,
        totalMoved: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length,
        targetLocation: targetLocation[0].name,
        movedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in bulkMoveProducts:', error);
      throw error;
    }
  }

  /**
   * Envanter sayımı yapar
   */
  async performInventoryCount(request: InventoryCountRequest) {
    try {
      const { locationId, countedBy, countedItems } = request;

      // Konumu kontrol et
      const location = await db
        .select()
        .from(locations)
        .where(eq(locations.id, locationId))
        .limit(1);

      if (location.length === 0) {
        throw new Error('Konum bulunamadı');
      }

      // Basit sayım sonucu döndür
      const results = countedItems.map(count => ({
        productId: count.productId,
        success: true,
        expectedQuantity: count.expectedQuantity,
        actualQuantity: count.actualQuantity,
        difference: count.actualQuantity - count.expectedQuantity,
        notes: count.notes
      }));

      // Sayım sonuçlarını veritabanına kaydet
      await db.insert(inventoryCounts).values({
        locationId,
        countedBy,
        countedItems: JSON.stringify(results),
        totalItems: countedItems.length,
        completedAt: new Date()
      });

      return {
        locationId,
        countedBy,
        countedItems: results,
        totalItems: countedItems.length,
        completedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in performInventoryCount:', error);
      throw error;
    }
  }

  /**
   * Envanter sayımı geçmişini getirir
   */
  async getInventoryCountHistory(locationId?: string, limit = 20) {
    try {
      let whereClause = undefined;
      if (locationId) {
        whereClause = eq(inventoryCounts.locationId, locationId);
      }

      const counts = await db
        .select({
          id: inventoryCounts.id,
          locationId: inventoryCounts.locationId,
          locationName: locations.name,
          countedBy: inventoryCounts.countedBy,
          countedByUser: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          },
          countedItems: inventoryCounts.countedItems,
          totalItems: inventoryCounts.totalItems,
          completedAt: inventoryCounts.completedAt,
          createdAt: inventoryCounts.createdAt
        })
        .from(inventoryCounts)
        .leftJoin(locations, eq(inventoryCounts.locationId, locations.id))
        .leftJoin(users, eq(inventoryCounts.countedBy, users.id))
        .where(whereClause)
        .orderBy(desc(inventoryCounts.completedAt))
        .limit(limit);

      return counts.map(count => ({
        ...count,
        countedItems: JSON.parse(count.countedItems)
      }));
    } catch (error) {
      console.error('Error in getInventoryCountHistory:', error);
      throw error;
    }
  }

  /**
   * Depo istatistikleri
   */
  async getWarehouseStats() {
    try {
      // Toplam konum sayısı
      const totalLocationsResult = await db
        .select({ count: count() })
        .from(locations);
      const totalLocations = totalLocationsResult[0]?.count || 0;

      // Kullanılan konum sayısı (benzersiz konum sayısı)
      const usedLocationsResult = await db
        .select({ locationId: products.locationId })
        .from(products)
        .where(isNotNull(products.locationId))
        .groupBy(products.locationId);
      
      const usedLocations = usedLocationsResult.length;

      // Toplam stok ürün sayısı
      const totalStockProductsResult = await db
        .select({ count: count() })
        .from(products)
        .where(isNull(products.ownerId));
      const totalStockProducts = totalStockProductsResult[0]?.count || 0;

      // Müşteriye ait ürün sayısı
      const totalCustomerProductsResult = await db
        .select({ count: count() })
        .from(products)
        .where(isNotNull(products.ownerId));
      const totalCustomerProducts = totalCustomerProductsResult[0]?.count || 0;

      // Durum bazlı istatistikler
      const statusStatsResult = await db
        .select({
          status: products.status,
          count: count(products.id)
        })
        .from(products)
        .groupBy(products.status);

      return {
        totalLocations,
        usedLocations,
        totalStockProducts,
        totalCustomerProducts,
        statusStats: statusStatsResult,
      };
    } catch (error) {
      console.error('Error in getWarehouseStats:', error);
      throw error;
    }
  }

  /**
   * Konum bazında detaylı istatistikler
   */
  async getLocationStats() {
    try {
      const stats = await db
        .select({
          locationId: locations.id,
          locationName: locations.name,
          locationType: locations.type,
          totalProducts: count(products.id),
        })
        .from(locations)
        .leftJoin(products, eq(locations.id, products.locationId))
        .groupBy(locations.id, locations.name, locations.type);

      return stats;
    } catch (error) {
      console.error('Error in getLocationStats:', error);
      throw error;
    }
  }

  /**
   * Stok uyarıları (düşük stok, fazla stok vb.)
   */
  async getStockAlerts() {
    try {
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
        .where(isNull(products.locationId))
        .groupBy(locations.id, locations.name, locations.type);

      if (emptyLocations.length > 0) {
        // Notification service kullanarak bildirim gönder
        const notificationService = new NotificationService();
        await notificationService.sendSystemAlertNotification(
          'Boş Konumlar',
          `${emptyLocations.length} konum boş`,
          'medium'
        );

        alerts.push({
          type: 'EMPTY_LOCATION',
          message: `${emptyLocations.length} konum boş`,
          details: emptyLocations,
          severity: 'warning',
          count: emptyLocations.length,
          action: 'Konumları kontrol edin',
        });
      }

      // Sevkiyata hazır ürünler - Shipment service kullanarak
      const shipmentService = new ShipmentService();
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
          severity: 'info',
          count: readyForShipment.reduce((sum, item) => sum + item.count, 0),
          action: 'Sevkiyat işlemlerini başlatın',
        });
      }

      // Arızalı ürünler - Issue service kullanarak
      const issueService = new IssueService();
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
          severity: 'error',
          count: defectiveProducts.reduce((sum, item) => sum + item.count, 0),
          action: 'Arızalı ürünleri servise gönderin',
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error in getStockAlerts:', error);
      throw error;
    }
  }

  /**
   * Konum kapasitesini günceller
   */
  async updateLocationCapacity(locationId: string, capacity: number) {
    try {
      await db
        .update(locations)
        .set({ 
          capacity,
          updatedAt: new Date()
        })
        .where(eq(locations.id, locationId));

      return { success: true, message: 'Konum kapasitesi güncellendi' };
    } catch (error) {
      console.error('Error updating location capacity:', error);
      throw error;
    }
  }

  /**
   * Konumun mevcut ürün sayısını günceller
   */
  async updateLocationCurrentCount(locationId: string) {
    try {
      const productCount = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.locationId, locationId));

      await db
        .update(locations)
        .set({ 
          currentCount: productCount[0]?.count || 0,
          updatedAt: new Date()
        })
        .where(eq(locations.id, locationId));

      return { 
        success: true, 
        currentCount: productCount[0]?.count || 0,
        message: 'Konum ürün sayısı güncellendi' 
      };
    } catch (error) {
      console.error('Error updating location current count:', error);
      throw error;
    }
  }

  /**
   * Konum kapasite durumunu kontrol eder
   */
  async checkLocationCapacity(locationId: string) {
    try {
      const location = await this.getLocationById(locationId);
      if (!location) {
        throw new Error('Konum bulunamadı');
      }

      const currentCount = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.locationId, locationId));

      const current = currentCount[0]?.count || 0;
      const capacity = location.capacity || 0;
      const available = capacity - current;
      const utilizationRate = capacity > 0 ? (current / capacity) * 100 : 0;

      return {
        locationId,
        locationName: location.name,
        current,
        capacity,
        available,
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        status: utilizationRate >= 90 ? 'FULL' : utilizationRate >= 75 ? 'WARNING' : 'OK'
      };
    } catch (error) {
      console.error('Error checking location capacity:', error);
      throw error;
    }
  }

  /**
   * Tüm konumların kapasite durumunu getirir
   */
  async getAllLocationCapacities() {
    try {
      const allLocations = await this.getLocations();
      const capacityData = [];

      for (const location of allLocations) {
        const capacityInfo = await this.checkLocationCapacity(location.id);
        capacityData.push(capacityInfo);
      }

      return capacityData;
    } catch (error) {
      console.error('Error getting all location capacities:', error);
      throw error;
    }
  }

  /**
   * Depo analitikleri ve raporları
   */
  async getWarehouseAnalytics() {
    try {
      // Depo analitikleri
      
      // Toplam istatistikler
      const totalStats = await this.getWarehouseStats();
      
      // Konum bazlı analitikler
      const locationAnalytics = await this.getAllLocationCapacities();
      
      // Ürün durumu analitikleri
      const productStatusAnalytics = await db
        .select({
          status: products.status,
          count: count(products.id)
        })
        .from(products)
        .groupBy(products.status);

      // Üretici bazlı analitikler - Company service kullanarak
      const companyService = new CompanyService(db);
      const manufacturerAnalytics = await db
        .select({
          manufacturerId: productModels.manufacturerId,
          manufacturerName: companies.name,
          count: count(products.id)
        })
        .from(products)
        .leftJoin(productModels, eq(products.productModelId, productModels.id))
        .leftJoin(companies, eq(productModels.manufacturerId, companies.id))
        .where(isNotNull(productModels.manufacturerId))
        .groupBy(productModels.manufacturerId, companies.name);

      // Aylık trend analizi (son 12 ay)
      const monthlyTrends = await db
        .select({
          month: sql<string>`DATE_TRUNC('month', ${products.createdAt})`,
          count: count(products.id)
        })
        .from(products)
        .where(
          gte(products.createdAt, sql`NOW() - INTERVAL '12 months'`)
        )
        .groupBy(sql`DATE_TRUNC('month', ${products.createdAt})`)
        .orderBy(sql`DATE_TRUNC('month', ${products.createdAt})`);

      // En çok kullanılan konumlar
      const topLocations = await db
        .select({
          locationId: products.locationId,
          locationName: locations.name,
          count: count(products.id)
        })
        .from(products)
        .leftJoin(locations, eq(products.locationId, locations.id))
        .where(isNotNull(products.locationId))
        .groupBy(products.locationId, locations.name)
        .orderBy(desc(count(products.id)))
        .limit(10);

      return {
        totalStats,
        locationAnalytics,
        productStatusAnalytics,
        manufacturerAnalytics,
        monthlyTrends,
        topLocations
      };
    } catch (error) {
      console.error('Error getting warehouse analytics:', error);
      throw error;
    }
  }

  /**
   * Depo performans raporu
   */
  async getWarehousePerformanceReport() {
    try {
      const analytics = await this.getWarehouseAnalytics();
      
      // Performans metrikleri
      const performanceMetrics = {
        totalLocations: analytics.totalStats?.totalLocations || 0,
        usedLocations: analytics.totalStats?.usedLocations || 0,
        utilizationRate: analytics.totalStats?.totalLocations > 0 
          ? (analytics.totalStats.usedLocations / analytics.totalStats.totalLocations) * 100 
          : 0,
        totalProducts: analytics.totalStats?.totalStockProducts || 0,
        averageProductsPerLocation: analytics.totalStats?.usedLocations > 0
          ? (analytics.totalStats.totalStockProducts / analytics.totalStats.usedLocations)
          : 0
      };

      // Kapasite kullanım analizi
      const capacityAnalysis = analytics.locationAnalytics.map(location => ({
        ...location,
        efficiency: location.capacity > 0 ? (location.current / location.capacity) * 100 : 0
      }));

      // Öneriler
      const recommendations = [];
      
      if (performanceMetrics.utilizationRate < 50) {
        recommendations.push({
          type: 'warning',
          message: 'Konum kullanım oranı düşük. Gereksiz konumları değerlendirin.',
          priority: 'medium'
        });
      }

      const fullLocations = capacityAnalysis.filter(loc => loc.status === 'FULL');
      if (fullLocations.length > 0) {
        recommendations.push({
          type: 'error',
          message: `${fullLocations.length} konum kapasitesi dolu. Yeni konum ekleyin veya ürünleri taşıyın.`,
          priority: 'high'
        });
      }

      const warningLocations = capacityAnalysis.filter(loc => loc.status === 'WARNING');
      if (warningLocations.length > 0) {
        recommendations.push({
          type: 'warning',
          message: `${warningLocations.length} konum kapasitesi %75'in üzerinde. Dikkatli takip edin.`,
          priority: 'medium'
        });
      }

      return {
        performanceMetrics,
        capacityAnalysis,
        recommendations,
        analytics
      };
    } catch (error) {
      console.error('Error getting warehouse performance report:', error);
      throw error;
    }
  }
}
