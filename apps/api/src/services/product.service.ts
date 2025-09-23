import { db } from '../db';
import { products, productModels, productTypes, companies, locations, users, productHistory } from '../db/schema';
import { eq, and, isNull, isNotNull, desc, asc, inArray, like, not, or, ne } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import type { ProductStatus, WarrantyStatus, ProductHistoryEventType } from '../db/schema';
import { EmailService } from './email.service';
import { notificationService } from './notification.service';

export interface CreateProductRequest {
  productModelId: string;
  quantity: number;
  productionDate: Date | string;
  locationId?: string;
  createdBy: string;
}

export interface BulkCreateProductsRequest {
  productModelId: string;
  quantities: Array<{
    quantity: number;
    productionDate: Date;
    locationId?: string;
  }>;
  createdBy: string;
}

export interface UpdateProductStatusRequest {
  productId: string;
  status: ProductStatus;
  updatedBy: string;
  serialNumber?: string;
  hardwareVerificationBy?: string;
  warrantyStartDate?: Date;
  warrantyPeriodMonths?: number;
  locationId?: string;
  ownerId?: string;
  soldDate?: Date;
}

export interface BulkUpdateProductStatusRequest {
  productIds: string[];
  status: ProductStatus;
  updatedBy: string;
  serialNumberPrefix?: string;
  hardwareVerificationBy?: string;
  warrantyStartDate?: Date;
  warrantyPeriodMonths?: number;
  locationId?: string;
}

export interface ProductFilter {
  status?: ProductStatus;
  manufacturerId?: string;
  productTypeId?: string;
  productModelId?: string;
  locationId?: string;
  ownerId?: string;
  warrantyStatus?: WarrantyStatus;
  search?: string;
  includeScrapped?: boolean;
}

export interface ProductSearchRequest {
  serialNumber?: string;
  manufacturerName?: string;
  productModelName?: string;
  productTypeName?: string;
}

export class ProductService {
  private emailService = new EmailService();

  /**
   * Ürün bilgilerini günceller
   */
  async updateProduct(productId: string, data: any) {
    const result = await db.update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning();
    
    return result[0];
  }

  /**
   * Tek ürün getirir
   */
  async getProduct(productId: string) {
    const result = await db.select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    
    return result[0];
  }

  /**
   * Ürün siler
   */
  async deleteProduct(productId: string) {
    await db.delete(products)
      .where(eq(products.id, productId));
    
    return { success: true };
  }

  /**
   * İlk üretim ile ürünleri depoya ekler
   */
  async createProducts(request: CreateProductRequest) {
    const { productModelId, quantity, productionDate, locationId, createdBy } = request;
    
    // productionDate'i Date objesine çevir
    const productionDateObj = typeof productionDate === 'string' 
      ? new Date(productionDate) 
      : productionDate;
    
    const productData = [];
    for (let i = 0; i < quantity; i++) {
      productData.push({
        productModelId,
        status: 'FIRST_PRODUCTION' as ProductStatus,
        currentStatus: 'FIRST_PRODUCTION' as ProductStatus,
        productionDate: productionDateObj,
        productionEntryBy: createdBy,
        locationId: locationId || null,
        createdBy,
        updatedBy: createdBy,
      });
    }

    const result = await db.insert(products).values(productData).returning();
    
    // Ürün geçmişi kayıtları oluştur
    await this.createProductHistoryEntries(result, 'PRODUCTION_ENTRY', createdBy, 'İlk üretim ile depoya eklendi');
    
    return result;
  }

  /**
   * Toplu ürün oluşturma (farklı tarihler ve konumlar için)
   */
  async bulkCreateProducts(request: BulkCreateProductsRequest) {
    const { productModelId, quantities, createdBy } = request;
    
    const productData = [];
    for (const item of quantities) {
      for (let i = 0; i < item.quantity; i++) {
        productData.push({
          productModelId,
          status: 'FIRST_PRODUCTION' as ProductStatus,
          currentStatus: 'FIRST_PRODUCTION' as ProductStatus,
          productionDate: item.productionDate,
          productionEntryBy: createdBy,
          locationId: item.locationId || null,
          createdBy,
          updatedBy: createdBy,
        });
      }
    }

    const result = await db.insert(products).values(productData).returning();
    
    // Ürün geçmişi kayıtları oluştur
    await this.createProductHistoryEntries(result, 'PRODUCTION_ENTRY', createdBy, 'Toplu üretim ile depoya eklendi');
    
    return result;
  }

  /**
   * Ürün durumunu günceller ve geçmiş kaydı oluşturur
   */
  async updateProductStatus(request: UpdateProductStatusRequest) {
    const { 
      productId, 
      status, 
      updatedBy, 
      serialNumber, 
      hardwareVerificationBy,
      warrantyStartDate,
      warrantyPeriodMonths,
      locationId,
      ownerId,
      soldDate
    } = request;

    // Mevcut ürün bilgilerini al
    const currentProduct = await this.getProductById(productId);
    if (!currentProduct) {
      throw new Error('Ürün bulunamadı');
    }

    const updateData: any = {
      status,
      updatedBy,
      updatedAt: new Date()
    };

    // Seri numarası sadece donanım doğrulama sırasında eklenir
    if (serialNumber) {
      updateData.serialNumber = serialNumber;
    }

    // Donanım doğrulama bilgileri
    if (hardwareVerificationBy) {
      updateData.hardwareVerificationBy = hardwareVerificationBy;
      updateData.hardwareVerificationDate = new Date();
    }

    // Garanti bilgileri
    if (warrantyStartDate) {
      updateData.warrantyStartDate = warrantyStartDate;
      updateData.warrantyStatus = 'IN_WARRANTY' as WarrantyStatus;
    }

    if (warrantyPeriodMonths) {
      updateData.warrantyPeriodMonths = warrantyPeriodMonths;
    }

    // Konum bilgileri
    if (locationId !== undefined) {
      updateData.locationId = locationId;
    }

    // Müşteri sahipliği (satış durumunda)
    if (ownerId !== undefined) {
      updateData.ownerId = ownerId;
    }

    // Satış tarihi
    if (soldDate) {
      updateData.soldDate = soldDate;
    }

    const result = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, productId))
      .returning();

    const updatedProduct = result[0];
    if (!updatedProduct) {
      throw new Error('Ürün güncellenemedi');
    }

    // Ürün geçmişi kaydı oluştur
    await this.createProductHistoryEntry(
      productId,
      'STATUS_CHANGE',
      updatedBy,
      `Durum değişikliği: ${currentProduct.status} → ${status}`,
      updatedProduct.locationId || undefined
    );

    // E-posta bildirimi gönder (duruma göre)
    await this.sendStatusChangeNotification(updatedProduct, currentProduct.status, status);

    // Real-time notification gönder
    await notificationService.sendProductStatusChangeNotification(
      productId,
      status,
      updatedBy
    );

    return updatedProduct;
  }

  /**
   * Toplu ürün durumu güncelleme
   */
  async bulkUpdateProductStatus(request: BulkUpdateProductStatusRequest) {
    const { 
      productIds, 
      status, 
      updatedBy, 
      serialNumberPrefix,
      hardwareVerificationBy,
      warrantyStartDate,
      warrantyPeriodMonths,
      locationId
    } = request;

    const results = [];
    
    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i];
      const serialNumber = serialNumberPrefix ? `${serialNumberPrefix}${(i + 1).toString().padStart(3, '0')}` : undefined;
      
      try {
        const result = await this.updateProductStatus({
          productId,
          status,
          updatedBy,
          serialNumber,
          hardwareVerificationBy,
          warrantyStartDate,
          warrantyPeriodMonths,
          locationId
        });
        results.push(result);
      } catch (error) {
        console.error(`Error updating product ${productId}:`, error);
        results.push({ id: productId, error: (error as Error).message });
      }
    }

    return results;
  }

  /**
   * Ürünleri filtreler ve listeler
   */
  async getProductsSimple() {
    // Basit product listesi - relation'lar olmadan
    const result = await db
      .select({
        id: products.id,
        serialNumber: products.serialNumber,
        status: products.status,
        productionDate: products.productionDate,
        warrantyStatus: products.warrantyStatus,
        locationId: products.locationId,
        ownerId: products.ownerId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(100);

    return result;
  }

  /**
   * Liste görünümü için ürünleri ilişkili temel verilerle döndürür
   * Frontend'in beklediği shape: productModel, productType, manufacturer, location, owner
   */
  async getProductsForList() {
    const manufacturer = alias(companies, 'manufacturer');
    const owner = alias(companies, 'owner');

    const result = await db
      .select({
        id: products.id,
        serialNumber: products.serialNumber,
        status: products.status,
        productionDate: products.productionDate,
        warrantyStatus: products.warrantyStatus,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        productModel: {
          id: productModels.id,
          name: productModels.name,
        },
        productType: {
          id: productTypes.id,
          name: productTypes.name,
        },
        manufacturer: {
          id: manufacturer.id,
          name: manufacturer.name,
        },
        location: {
          id: locations.id,
          name: locations.name,
        },
        owner: {
          id: owner.id,
          name: owner.name,
        },
      })
      .from(products)
      .leftJoin(productModels, eq(products.productModelId, productModels.id))
      .leftJoin(productTypes, eq(productModels.productTypeId, productTypes.id))
      .leftJoin(manufacturer, eq(productModels.manufacturerId, manufacturer.id))
      .leftJoin(locations, eq(products.locationId, locations.id))
      .leftJoin(owner, eq(products.ownerId, owner.id))
      .orderBy(desc(products.createdAt))
      .limit(100);

    return result;
  }

  async getProducts(filter: ProductFilter = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    let whereConditions: any[] = [];

    if (filter.status) {
      whereConditions.push(eq(products.status, filter.status));
    }

    if (filter.locationId) {
      whereConditions.push(eq(products.locationId, filter.locationId));
    }

    if (filter.ownerId !== undefined) {
      if (filter.ownerId === null) {
        whereConditions.push(isNull(products.ownerId));
      } else {
        whereConditions.push(eq(products.ownerId, filter.ownerId));
      }
    }

    if (filter.warrantyStatus) {
      whereConditions.push(eq(products.warrantyStatus, filter.warrantyStatus));
    }

    // Hurda ürünleri dahil etme kontrolü
    if (!filter.includeScrapped) {
      whereConditions.push(
        and(
          ne(products.status, 'FIRST_PRODUCTION_SCRAPPED'),
          ne(products.status, 'SERVICE_SCRAPPED')
        )
      );
    }

    // Arama
    if (filter.search) {
      // Seri numarası ile arama
      whereConditions.push(eq(products.serialNumber, filter.search));
    }

    const filteredConditions = whereConditions.filter(condition => condition !== undefined);
    const whereClause = filteredConditions.length > 0 ? and(...filteredConditions) : undefined;

    const result = await db
      .select({
        id: products.id,
        serialNumber: products.serialNumber,
        status: products.status,
        productionDate: products.productionDate,
        warrantyStatus: products.warrantyStatus,
        warrantyStartDate: products.warrantyStartDate,
        warrantyPeriodMonths: products.warrantyPeriodMonths,
        hardwareVerificationDate: products.hardwareVerificationDate,
        soldDate: products.soldDate,
        locationId: products.locationId,
        ownerId: products.ownerId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        // İlişkili veriler
        productModel: {
          id: productModels.id,
          name: productModels.name,
          description: productModels.description,
        },
        productType: {
          id: productTypes.id,
          name: productTypes.name,
          description: productTypes.description,
        },
        manufacturer: {
          id: companies.id,
          name: companies.name,
        },
        location: {
          id: locations.id,
          name: locations.name,
          type: locations.type,
        },
        owner: {
          id: companies.id,
          name: companies.name,
        },
        createdByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        updatedByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(products)
      .leftJoin(productModels, eq(products.productModelId, productModels.id))
      .leftJoin(productTypes, eq(productModels.productTypeId, productTypes.id))
      .leftJoin(companies, eq(productModels.manufacturerId, companies.id))
      .leftJoin(locations, eq(products.locationId, locations.id))
      .leftJoin(companies, eq(products.ownerId, companies.id))
      .leftJoin(users, eq(products.createdBy, users.id))
      .leftJoin(users, eq(products.updatedBy, users.id))
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    // Toplam sayı
    const totalCount = await db
      .select({ count: products.id })
      .from(products)
      .where(whereClause)
      .then(result => result.length);

    return {
      products: result,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    };
  }

  /**
   * Gelişmiş ürün arama
   */
  async searchProducts(searchRequest: ProductSearchRequest) {
    const { serialNumber, manufacturerName, productModelName, productTypeName } = searchRequest;
    
    let whereConditions = [];

    if (serialNumber) {
      whereConditions.push(eq(products.serialNumber, serialNumber));
    }

    if (manufacturerName) {
      whereConditions.push(like(companies.name, `%${manufacturerName}%`));
    }

    if (productModelName) {
      whereConditions.push(like(productModels.name, `%${productModelName}%`));
    }

    if (productTypeName) {
      whereConditions.push(like(productTypes.name, `%${productTypeName}%`));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const result = await db
      .select({
        id: products.id,
        serialNumber: products.serialNumber,
        status: products.status,
        productionDate: products.productionDate,
        warrantyStatus: products.warrantyStatus,
        soldDate: products.soldDate,
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
        owner: {
          id: companies.id,
          name: companies.name,
        },
      })
      .from(products)
      .leftJoin(productModels, eq(products.productModelId, productModels.id))
      .leftJoin(productTypes, eq(productModels.productTypeId, productTypes.id))
      .leftJoin(companies, eq(productModels.manufacturerId, companies.id))
      .leftJoin(companies, eq(products.ownerId, companies.id))
      .where(whereClause)
      .orderBy(desc(products.createdAt));

    return result;
  }

  /**
   * Ürün detayını getirir
   */
  async getProductById(productId: string) {
    const result = await db
      .select({
        id: products.id,
        serialNumber: products.serialNumber,
        status: products.status,
        productionDate: products.productionDate,
        warrantyStatus: products.warrantyStatus,
        warrantyStartDate: products.warrantyStartDate,
        warrantyPeriodMonths: products.warrantyPeriodMonths,
        hardwareVerificationDate: products.hardwareVerificationDate,
        soldDate: products.soldDate,
        locationId: products.locationId,
        ownerId: products.ownerId,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        // İlişkili veriler
        productModel: {
          id: productModels.id,
          name: productModels.name,
          description: productModels.description,
        },
        productType: {
          id: productTypes.id,
          name: productTypes.name,
          description: productTypes.description,
        },
        manufacturer: {
          id: companies.id,
          name: companies.name,
        },
        location: {
          id: locations.id,
          name: locations.name,
          type: locations.type,
        },
        owner: {
          id: companies.id,
          name: companies.name,
        },
        createdByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        updatedByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(products)
      .leftJoin(productModels, eq(products.productModelId, productModels.id))
      .leftJoin(productTypes, eq(productModels.productTypeId, productTypes.id))
      .leftJoin(companies, eq(productModels.manufacturerId, companies.id))
      .leftJoin(locations, eq(products.locationId, locations.id))
      .leftJoin(companies, eq(products.ownerId, companies.id))
      .leftJoin(users, eq(products.createdBy, users.id))
      .leftJoin(users, eq(products.updatedBy, users.id))
      .where(eq(products.id, productId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Ürün geçmişini getirir
   */
  async getProductHistory(productId: string) {
    const result = await db
      .select({
        id: productHistory.id,
        event: productHistory.event,
        eventType: productHistory.eventType,
        eventTimestamp: productHistory.eventTimestamp,
        createdAt: productHistory.createdAt,
        performedBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        location: {
          id: locations.id,
          name: locations.name,
        },
      })
      .from(productHistory)
      .leftJoin(users, eq(productHistory.performedBy, users.id))
      .leftJoin(locations, eq(productHistory.locationId, locations.id))
      .where(eq(productHistory.productId, productId))
      .orderBy(desc(productHistory.eventTimestamp));

    return result;
  }

  /**
   * Ürün durumlarına göre istatistikler
   */
  async getProductStats() {
    const stats = await db
      .select({
        status: products.status,
        count: products.id,
      })
      .from(products)
      .groupBy(products.status);

    return stats;
  }

  /**
   * Depo istatistikleri
   */
  async getWarehouseStats() {
    const stats = await db
      .select({
        locationId: products.locationId,
        locationName: locations.name,
        status: products.status,
        count: products.id,
      })
      .from(products)
      .leftJoin(locations, eq(products.locationId, locations.id))
      .where(isNotNull(products.locationId))
      .groupBy(products.locationId, locations.name, products.status);

    return stats;
  }

  /**
   * Garanti istatistikleri
   */
  async getWarrantyStats() {
    const stats = await db
      .select({
        warrantyStatus: products.warrantyStatus,
        count: products.id,
      })
      .from(products)
      .groupBy(products.warrantyStatus);

    return stats;
  }

  /**
   * Ürün geçmişi kaydı oluşturur
   */
  private async createProductHistoryEntry(
    productId: string,
    eventType: ProductHistoryEventType,
    performedBy: string,
    event: string,
    locationId?: string
  ) {
    await db.insert(productHistory).values({
      productId,
      eventType,
      event,
      performedBy,
      locationId,
      eventTimestamp: new Date(),
      performedAt: new Date(),
      createdBy: performedBy,
    });
  }

  /**
   * Toplu ürün geçmişi kaydı oluşturur
   */
  private async createProductHistoryEntries(
    products: any[],
    eventType: ProductHistoryEventType,
    performedBy: string,
    event: string
  ) {
    const historyData = products.map(product => ({
      productId: product.id,
      eventType,
      event,
      performedBy,
      locationId: product.locationId,
      eventTimestamp: new Date(),
      performedAt: new Date(),
      createdBy: performedBy,
    }));

    await db.insert(productHistory).values(historyData);
  }

  /**
   * Durum değişikliği bildirimi gönderir
   */
  private async sendStatusChangeNotification(
    product: any,
    oldStatus: string,
    newStatus: string
  ) {
    try {
      // Önemli durum değişikliklerinde e-posta gönder
      const importantStatusChanges = [
        'READY_FOR_SHIPMENT',
        'SHIPPED',
        'ISSUE_CREATED',
        'RECEIVED',
        'UNDER_REPAIR',
        'SERVICE_SCRAPPED'
      ];

      if (importantStatusChanges.includes(newStatus)) {
        await this.emailService.sendProductStatusChangeNotification(
          product.id,
          oldStatus,
          newStatus
        );
      }
    } catch (error) {
      console.error('Error sending status change notification:', error);
    }
  }
}
