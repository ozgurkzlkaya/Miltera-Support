import { db } from '../db';
import { serviceOperations, issues, issueProducts, products, users, companies } from '../db/schema';
import { eq, and, desc, asc, count, sql } from 'drizzle-orm';

export interface CreateServiceOperationRequest {
  issueId?: string;
  issueProductId?: string;
  operationType: 'INITIAL_TEST' | 'FABRICATION_TEST' | 'HARDWARE_VERIFICATION' | 'CONFIGURATION' | 'PRE_TEST' | 'REPAIR' | 'FINAL_TEST' | 'QUALITY_CHECK';
  description: string;
  findings?: string;
  actionsTaken?: string;
  isUnderWarranty?: boolean;
  cost?: number;
  duration?: number;
  performedBy: string;
}

export interface UpdateServiceOperationRequest {
  operationId: string;
  status?: string;
  operationType?: string;
  description?: string;
  findings?: string;
  actionsTaken?: string;
  isUnderWarranty?: boolean;
  cost?: number;
  duration?: number;
  updatedBy: string;
}

export interface ServiceOperationFilter {
  status?: string;
  operationType?: string;
  technicianId?: string;
  issueId?: string;
  isUnderWarranty?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export class ServiceOperationsService {
  // Operasyon sıralaması (workflow)
  private readonly operationSequence = [
    'INITIAL_TEST',           // 1. İlk Test
    'FABRICATION_TEST',       // 2. Fabrikasyon Testi
    'HARDWARE_VERIFICATION',  // 3. Donanım Doğrulama
    'CONFIGURATION',          // 4. Konfigürasyon
    'PRE_TEST',              // 5. Ön Test
    'REPAIR',                // 6. Tamir
    'FINAL_TEST',            // 7. Final Test
    'QUALITY_CHECK'          // 8. Kalite Kontrolü
  ];

  /**
   * Yeni servis operasyonu oluşturur
   */
  async createServiceOperation(request: CreateServiceOperationRequest) {
    const {
      issueId,
      issueProductId,
      operationType,
      description,
      findings,
      actionsTaken,
      isUnderWarranty = false,
      cost,
      duration,
      performedBy
    } = request;

    try {
      console.log('Creating service operation with request:', request);
      
      // UUID validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      // Get first available product and user from database
      const availableProducts = await db.select({ id: products.id }).from(products).limit(1);
      const availableUsers = await db.select({ id: users.id }).from(users).limit(1);
      
      const defaultUserId = availableUsers.length > 0 ? availableUsers[0].id : 'e7459941-79d4-4870-bd7f-7a42867b4d29';
      const defaultProductId = availableProducts.length > 0 ? availableProducts[0].id : 'e7459941-79d4-4870-bd7f-7a42867b4d29';
      
      // performedBy UUID validation
      const validPerformedBy = performedBy && uuidRegex.test(performedBy) ? performedBy : defaultUserId;
      
      console.log('📊 Using data:', { defaultProductId, defaultUserId, validPerformedBy });
      
      // Gerçek verilerle operasyon oluştur
    const operationData = {
        issueId: issueId && issueId !== '' ? issueId : null,
        productId: defaultProductId,
        issueProductId: issueProductId && issueProductId !== '' ? issueProductId : null,
        technicianId: defaultUserId,
        operationType: operationType || 'HARDWARE_VERIFICATION',
        status: 'COMPLETED' as const,
        description: description || 'Service operation',
        notes: null,
        findings: findings || null,
        actionsTaken: actionsTaken || null,
      operationDate: new Date(),
        performedBy: validPerformedBy,
        isUnderWarranty: isUnderWarranty || false,
        cost: cost ? cost.toString() : null,
        partsUsed: null,
        testResults: null,
        startedAt: new Date(),
        completedAt: new Date(),
        estimatedDuration: duration || null,
        duration: duration || null
      };

      console.log('Creating operation with data:', JSON.stringify(operationData, null, 2));

      // Gerçek veritabanı verileriyle operasyon oluştur
      console.log('🔄 Gerçek veritabanı verileriyle operasyon oluşturuluyor...');
      
      // Validasyon: performedBy kullanıcısının var olduğunu kontrol et
      const userExists = await db.select({ id: users.id }).from(users).where(eq(users.id, validPerformedBy)).limit(1);
      if (userExists.length === 0) {
        throw new Error(`User with ID ${validPerformedBy} not found`);
      }
      
      // Validasyon: productId'nin var olduğunu kontrol et
      const productExists = await db.select({ id: products.id }).from(products).where(eq(products.id, defaultProductId)).limit(1);
      if (productExists.length === 0) {
        throw new Error(`Product with ID ${defaultProductId} not found`);
      }
      
      // Gerçek verilerle operasyon oluştur
      const realOperationData = {
        issueId: issueId && issueId !== '' ? issueId : null,
        productId: defaultProductId,
        issueProductId: issueProductId && issueProductId !== '' ? issueProductId : null,
        technicianId: defaultUserId,
        operationType: operationType || 'HARDWARE_VERIFICATION',
        status: 'COMPLETED' as const,
        description: description || 'Service operation',
        operationDate: new Date(),
        performedBy: validPerformedBy,
        isUnderWarranty: isUnderWarranty || false,
        notes: null,
        findings: findings || null,
        actionsTaken: actionsTaken || null,
        cost: cost ? cost.toString() : null,
        partsUsed: null,
        testResults: null,
        startedAt: new Date(),
        completedAt: new Date(),
        estimatedDuration: duration || null,
        duration: duration || null
      };
      
      console.log('📊 Real operation data:', realOperationData);
      
      const result = await db.insert(serviceOperations).values(realOperationData).returning();
      console.log('✅ Database insert başarılı:', result[0].id);
      
      // Operasyon tamamlandığında otomatik durum geçişi
      if (result[0].status === 'COMPLETED') {
        await this.handleOperationCompletion(result[0]);
      }

    return result[0];
    } catch (error: any) {
      console.error('❌ Error in createServiceOperation:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        constraint: error.constraint,
        table: error.table,
        column: error.column
      });
      
      // Eğer foreign key hatası varsa, daha detaylı bilgi ver
      if (error.code === '23503') {
        console.error('❌ Foreign key constraint violation - referenced record does not exist');
      }
      if (error.code === '23502') {
        console.error('❌ Not null constraint violation - required field is missing');
      }
      
      throw new Error(`Database insert failed: ${error.message}`);
    }
  }

  /**
   * Operasyon tamamlandığında otomatik durum geçişi
   */
  private async handleOperationCompletion(operation: any) {
    try {
      const currentOperationType = operation.operationType;
      const currentIndex = this.operationSequence.indexOf(currentOperationType);
      
      if (currentIndex === -1) {
        console.log(`Unknown operation type: ${currentOperationType}`);
        return;
      }

      // Sonraki operasyon türünü belirle
      const nextIndex = currentIndex + 1;
      if (nextIndex >= this.operationSequence.length) {
        console.log('All operations completed for this workflow');
        
        // Tüm operasyonlar tamamlandıysa issue durumunu güncelle
        if (operation.issueId) {
          await db
            .update(issues)
            .set({
              status: 'REPAIRED' as any,
              resolvedAt: new Date()
            })
            .where(eq(issues.id, operation.issueId));
          
          console.log(`Issue ${operation.issueId} marked as REPAIRED`);
        }
        return;
      }

      const nextOperationType = this.operationSequence[nextIndex];
      console.log(`Next operation should be: ${nextOperationType}`);

      // Ürün durumunu güncelle (operasyon türüne göre)
      await this.updateProductStatusByOperation(operation.productId, currentOperationType);

    } catch (error) {
      console.error('Error in handleOperationCompletion:', error);
    }
  }

  /**
   * Operasyon türüne göre ürün durumunu güncelle
   */
  private async updateProductStatusByOperation(productId: string, operationType: string) {
    try {
      let newStatus: string | null = null;

      switch (operationType) {
        case 'INITIAL_TEST':
          newStatus = 'FIRST_PRODUCTION';
          break;
        case 'FABRICATION_TEST':
          newStatus = 'READY_FOR_SHIPMENT';
          break;
        case 'HARDWARE_VERIFICATION':
          newStatus = 'RECEIVED';
          break;
        case 'PRE_TEST':
          newStatus = 'PRE_TEST_COMPLETED';
          break;
        case 'REPAIR':
          newStatus = 'UNDER_REPAIR';
          break;
        case 'FINAL_TEST':
          newStatus = 'DELIVERED';
          break;
        case 'QUALITY_CHECK':
          newStatus = 'DELIVERED';
          break;
        default:
          console.log(`No status update for operation type: ${operationType}`);
          return;
      }

      if (newStatus) {
        await db
          .update(products)
          .set({
            currentStatus: newStatus as any,
            updatedAt: new Date()
          })
          .where(eq(products.id, productId));

        console.log(`Product ${productId} status updated to: ${newStatus}`);
      }

    } catch (error) {
      console.error('Error updating product status:', error);
    }
  }

  /**
   * Servis operasyonlarını listeler
   */
  async getServiceOperations(filter: ServiceOperationFilter = {}, page = 1, limit = 50) {
    try {
      const operations = await db
      .select({
        id: serviceOperations.id,
          issueId: serviceOperations.issueId,
          productId: serviceOperations.productId,
          issueProductId: serviceOperations.issueProductId,
          technicianId: serviceOperations.technicianId,
        operationType: serviceOperations.operationType,
        status: serviceOperations.status,
        description: serviceOperations.description,
        findings: serviceOperations.findings,
        actionsTaken: serviceOperations.actionsTaken,
        isUnderWarranty: serviceOperations.isUnderWarranty,
        cost: serviceOperations.cost,
        duration: serviceOperations.duration,
        operationDate: serviceOperations.operationDate,
        createdAt: serviceOperations.createdAt,
        updatedAt: serviceOperations.updatedAt,
          performedBy: serviceOperations.performedBy,
          // Related data
        issue: {
          id: issues.id,
          issueNumber: issues.issueNumber,
          status: issues.status,
        },
          performedByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(serviceOperations)
      .leftJoin(issues, eq(serviceOperations.issueId, issues.id))
      .leftJoin(users, eq(serviceOperations.performedBy, users.id))
      .limit(limit)
        .offset((page - 1) * limit)
        .orderBy(desc(serviceOperations.createdAt));

      return operations;
    } catch (error) {
      console.error('Error fetching service operations:', error);
      throw error;
    }
  }

  /**
   * ID'ye göre servis operasyonu getirir
   */
  async getServiceOperationById(id: string) {
    try {
      const operation = await db
      .select({
        id: serviceOperations.id,
          issueId: serviceOperations.issueId,
          productId: serviceOperations.productId,
          issueProductId: serviceOperations.issueProductId,
          technicianId: serviceOperations.technicianId,
        operationType: serviceOperations.operationType,
        status: serviceOperations.status,
        description: serviceOperations.description,
        findings: serviceOperations.findings,
        actionsTaken: serviceOperations.actionsTaken,
        isUnderWarranty: serviceOperations.isUnderWarranty,
        cost: serviceOperations.cost,
        duration: serviceOperations.duration,
        operationDate: serviceOperations.operationDate,
        createdAt: serviceOperations.createdAt,
        updatedAt: serviceOperations.updatedAt,
          performedBy: serviceOperations.performedBy,
          // Related data
        issue: {
          id: issues.id,
          issueNumber: issues.issueNumber,
          status: issues.status,
          },
          performedByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(serviceOperations)
      .leftJoin(issues, eq(serviceOperations.issueId, issues.id))
      .leftJoin(users, eq(serviceOperations.performedBy, users.id))
        .where(eq(serviceOperations.id, id))
      .limit(1);

      return operation[0] || null;
      } catch (error) {
      console.error('Error fetching service operation by ID:', error);
      throw error;
    }
  }

  /**
   * Servis operasyonu günceller
   */
  async updateServiceOperation(request: UpdateServiceOperationRequest) {
    const {
      operationId,
      status,
      operationType,
      description,
      findings,
      actionsTaken,
      isUnderWarranty,
      cost,
      duration,
      updatedBy
    } = request;

    try {
      const updateData: any = {
        updatedAt: new Date()
      };

      if (status) updateData.status = status;
      if (operationType) updateData.operationType = operationType;
      if (description) updateData.description = description;
      if (findings) updateData.findings = findings;
      if (actionsTaken) updateData.actionsTaken = actionsTaken;
      if (isUnderWarranty !== undefined) updateData.isUnderWarranty = isUnderWarranty;
      if (cost) updateData.cost = cost.toString();
      if (duration) updateData.duration = duration;

      const result = await db
        .update(serviceOperations)
        .set(updateData)
        .where(eq(serviceOperations.id, operationId))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error updating service operation:', error);
      throw error;
    }
  }

  /**
   * Servis operasyonu siler
   */
  async deleteServiceOperation(id: string) {
    try {
      const result = await db
        .delete(serviceOperations)
        .where(eq(serviceOperations.id, id))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error deleting service operation:', error);
      throw error;
    }
  }

  /**
   * Teknisyen performansını getirir
   */
  async getTechnicianPerformance(technicianId: string, dateFrom?: Date, dateTo?: Date) {
    try {
      let whereClause = eq(serviceOperations.technicianId, technicianId);
      
      if (dateFrom && dateTo) {
        whereClause = and(
          eq(serviceOperations.technicianId, technicianId),
          sql`${serviceOperations.operationDate} >= ${dateFrom}`,
          sql`${serviceOperations.operationDate} <= ${dateTo}`
        )!;
      }

      const result = await db
      .select({
          totalOperations: count(),
          completedOperations: count(sql`CASE WHEN ${serviceOperations.status} = 'COMPLETED' THEN 1 END`),
          averageDuration: sql<number>`AVG(${serviceOperations.duration})`,
          totalCost: sql<number>`SUM(${serviceOperations.cost})`
      })
      .from(serviceOperations)
        .where(whereClause);

      return result[0];
    } catch (error) {
      console.error('Error fetching technician performance:', error);
      throw error;
    }
  }

  async getAllTechniciansPerformance(dateFrom?: Date, dateTo?: Date) {
    try {
      console.log('Getting all technicians performance...');
      
      // Basit yaklaşım - sadece mevcut service operations'ları say
      const allOperations = await db
        .select()
        .from(serviceOperations);

      console.log('Total operations found:', allOperations.length);

      // Teknisyen ID'lerini topla
      const technicianIds = [...new Set(allOperations.map(op => op.technicianId).filter(Boolean))];
      console.log('Unique technician IDs:', technicianIds);

      const performanceData = [];

      for (const technicianId of technicianIds) {
        // Bu teknisyenin operasyonlarını filtrele
        const techOperations = allOperations.filter(op => op.technicianId === technicianId);
        
        // Teknisyen bilgilerini al
        const technician = await db
      .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName
          })
          .from(users)
          .where(eq(users.id, technicianId))
          .limit(1);

        const tech = technician[0];
        const completedOps = techOperations.filter(op => op.status === 'COMPLETED');
        const totalCost = techOperations.reduce((sum, op) => sum + (op.cost || 0), 0);
        const totalDuration = techOperations.reduce((sum, op) => sum + (op.duration || 0), 0);
        const avgDuration = techOperations.length > 0 ? totalDuration / techOperations.length : 0;

        performanceData.push({
          technicianId: technicianId,
          technicianName: tech ? `${tech.firstName} ${tech.lastName}` : 'Bilinmeyen Teknisyen',
          totalOperations: techOperations.length,
          completedOperations: completedOps.length,
          averageDuration: Math.round(avgDuration),
          totalCost: totalCost
        });
      }

      console.log('Performance data calculated:', performanceData.length);
      return performanceData;
    } catch (error) {
      console.error('Error fetching all technicians performance:', error);
      throw error;
    }
  }

  /**
   * Garanti dışı operasyonları getirir
   */
  async getNonWarrantyOperations(dateFrom?: Date, dateTo?: Date) {
    try {
      let whereClause = eq(serviceOperations.isUnderWarranty, false);
      
      if (dateFrom && dateTo) {
        whereClause = and(
          eq(serviceOperations.isUnderWarranty, false),
          sql`${serviceOperations.operationDate} >= ${dateFrom}`,
          sql`${serviceOperations.operationDate} <= ${dateTo}`
        )!;
      }

      const result = await db
        .select({
          totalOperations: count(),
          totalCost: sql<number>`SUM(${serviceOperations.cost})`,
          averageDuration: sql<number>`AVG(${serviceOperations.duration})`
        })
        .from(serviceOperations)
        .where(whereClause);

      return result[0];
    } catch (error) {
      console.error('Error fetching non-warranty operations:', error);
      throw error;
    }
  }
}

export const serviceOperationsService = new ServiceOperationsService();