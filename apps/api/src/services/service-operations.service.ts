import { db } from '../db';
import { serviceOperations, issues, issueProducts, products, users, companies } from '../db/schema';
import { eq, and, desc, asc, count, sql } from 'drizzle-orm';
import type { OperationType, ServiceOperationStatus } from '../db/schema';
import { EmailService } from './email.service';
import { notificationService } from './notification.service';

export interface CreateServiceOperationRequest {
  issueId: string;
  issueProductId?: string;
  operationType: OperationType;
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
  status?: ServiceOperationStatus;
  description?: string;
  findings?: string;
  actionsTaken?: string;
  isUnderWarranty?: boolean;
  cost?: number;
  duration?: number;
  updatedBy: string;
}

export interface ServiceOperationFilter {
  issueId?: string;
  operationType?: OperationType;
  status?: ServiceOperationStatus;
  performedBy?: string;
  isUnderWarranty?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ServiceWorkflowRequest {
  issueId: string;
  operations: Array<{
    operationType: OperationType;
    description: string;
    findings?: string;
    actionsTaken?: string;
    isUnderWarranty?: boolean;
    cost?: number;
    duration?: number;
  }>;
  performedBy: string;
}

export interface RepairSummaryRequest {
  issueId: string;
  summary: string;
  totalCost: number;
  isUnderWarranty: boolean;
  completedBy: string;
}

export class ServiceOperationsService {
  private emailService = new EmailService();

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

    const operationData = {
      issueId,
      issueProductId: issueProductId || null,
      operationType,
      status: 'COMPLETED' as ServiceOperationStatus,
      description,
      findings,
      actionsTaken,
      isUnderWarranty,
      cost,
      duration,
      operationDate: new Date(),
      performedBy,
    };

    const result = await db.insert(serviceOperations).values(operationData).returning();
    const operation = result[0];

    // E-posta bildirimi gönder
    await this.sendOperationNotification(operation.id);

    return operation;
  }

  /**
   * Servis operasyonunu günceller
   */
  async updateServiceOperation(request: UpdateServiceOperationRequest) {
    const {
      operationId,
      status,
      description,
      findings,
      actionsTaken,
      isUnderWarranty,
      cost,
      duration,
      updatedBy
    } = request;

    const updateData: any = {
      updatedAt: new Date()
    };

    if (status) updateData.status = status;
    if (description) updateData.description = description;
    if (findings !== undefined) updateData.findings = findings;
    if (actionsTaken !== undefined) updateData.actionsTaken = actionsTaken;
    if (isUnderWarranty !== undefined) updateData.isUnderWarranty = isUnderWarranty;
    if (cost !== undefined) updateData.cost = cost;
    if (duration !== undefined) updateData.duration = duration;

    const result = await db
      .update(serviceOperations)
      .set(updateData)
      .where(eq(serviceOperations.id, operationId))
      .returning();

    return result[0];
  }

  /**
   * Servis operasyonlarını listeler
   */
  async getServiceOperations(filter: ServiceOperationFilter = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    let whereConditions = [];

    if (filter.issueId) {
      whereConditions.push(eq(serviceOperations.issueId, filter.issueId));
    }

    if (filter.operationType) {
      whereConditions.push(eq(serviceOperations.operationType, filter.operationType));
    }

    if (filter.status) {
      whereConditions.push(eq(serviceOperations.status, filter.status));
    }

    if (filter.performedBy) {
      whereConditions.push(eq(serviceOperations.performedBy, filter.performedBy));
    }

    if (filter.isUnderWarranty !== undefined) {
      whereConditions.push(eq(serviceOperations.isUnderWarranty, filter.isUnderWarranty));
    }

    if (filter.dateFrom) {
      whereConditions.push(sql`${serviceOperations.operationDate} >= ${filter.dateFrom}`);
    }

    if (filter.dateTo) {
      whereConditions.push(sql`${serviceOperations.operationDate} <= ${filter.dateTo}`);
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const result = await db
      .select({
        id: serviceOperations.id,
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
        // İlişkili veriler
        issue: {
          id: issues.id,
          issueNumber: issues.issueNumber,
          status: issues.status,
        },
        performedBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        issueProduct: {
          id: issueProducts.id,
          product: {
            id: products.id,
            serialNumber: products.serialNumber,
          },
        },
      })
      .from(serviceOperations)
      .leftJoin(issues, eq(serviceOperations.issueId, issues.id))
      .leftJoin(users, eq(serviceOperations.performedBy, users.id))
      .leftJoin(issueProducts, eq(serviceOperations.issueProductId, issueProducts.id))
      .leftJoin(products, eq(issueProducts.productId, products.id))
      .where(whereClause)
      .orderBy(desc(serviceOperations.operationDate))
      .limit(limit)
      .offset(offset);

    // Toplam sayı
    const totalCount = await db
      .select({ count: serviceOperations.id })
      .from(serviceOperations)
      .where(whereClause)
      .then(result => result.length);

    return {
      operations: result,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    };
  }

  /**
   * Servis operasyonu detayını getirir
   */
  async getServiceOperationById(operationId: string) {
    const result = await db
      .select({
        id: serviceOperations.id,
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
        // İlişkili veriler
        issue: {
          id: issues.id,
          issueNumber: issues.issueNumber,
          status: issues.status,
          customerDescription: issues.customerDescription,
          company: {
            id: companies.id,
            name: companies.name,
          },
        },
        performedBy: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        issueProduct: {
          id: issueProducts.id,
          product: {
            id: products.id,
            serialNumber: products.serialNumber,
            status: products.status,
          },
        },
      })
      .from(serviceOperations)
      .leftJoin(issues, eq(serviceOperations.issueId, issues.id))
      .leftJoin(users, eq(serviceOperations.performedBy, users.id))
      .leftJoin(issueProducts, eq(serviceOperations.issueProductId, issueProducts.id))
      .leftJoin(products, eq(issueProducts.productId, products.id))
      .leftJoin(companies, eq(issues.companyId, companies.id))
      .where(eq(serviceOperations.id, operationId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Servis iş akışı oluşturur (birden fazla operasyon)
   */
  async createServiceWorkflow(request: ServiceWorkflowRequest) {
    const { issueId, operations, performedBy } = request;

    const results = [];

    for (const operation of operations) {
      try {
        const result = await this.createServiceOperation({
          issueId,
          operationType: operation.operationType,
          description: operation.description,
          findings: operation.findings,
          actionsTaken: operation.actionsTaken,
          isUnderWarranty: operation.isUnderWarranty,
          cost: operation.cost,
          duration: operation.duration,
          performedBy,
        });
        results.push(result);
      } catch (error) {
        console.error(`Error creating operation ${operation.operationType}:`, error);
        results.push({ error: error.message, operationType: operation.operationType });
      }
    }

    return results;
  }

  /**
   * Tamir özeti oluşturur
   */
  async createRepairSummary(request: RepairSummaryRequest) {
    const { issueId, summary, totalCost, isUnderWarranty, completedBy } = request;

    // Son operasyon olarak tamir özeti ekle
    const operationData = {
      issueId,
      operationType: 'REPAIR' as OperationType,
      status: 'COMPLETED' as ServiceOperationStatus,
      description: summary,
      isUnderWarranty,
      cost: totalCost,
      operationDate: new Date(),
      performedBy: completedBy,
    };

    const result = await db.insert(serviceOperations).values(operationData).returning();
    const operation = result[0];

    // Arıza durumunu güncelle
    await this.updateIssueStatus(issueId, 'REPAIRED', completedBy);

    // E-posta bildirimi gönder
    await this.sendRepairCompletionNotification(issueId, operation.id);

    return operation;
  }

  /**
   * Arıza durumunu günceller
   */
  private async updateIssueStatus(issueId: string, status: string, updatedBy: string) {
    await db
      .update(issues)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(issues.id, issueId));

    // Real-time notification gönder
    await notificationService.sendIssueStatusChangeNotification(
      issueId,
      status,
      updatedBy
    );
  }

  /**
   * Servis operasyonu istatistikleri
   */
  async getServiceOperationStats() {
    const stats = await db
      .select({
        operationType: serviceOperations.operationType,
        status: serviceOperations.status,
        count: count(serviceOperations.id),
        totalCost: sql<number>`SUM(COALESCE(${serviceOperations.cost}, 0))`,
        totalDuration: sql<number>`SUM(COALESCE(${serviceOperations.duration}, 0))`,
      })
      .from(serviceOperations)
      .groupBy(serviceOperations.operationType, serviceOperations.status);

    return stats;
  }

  /**
   * Garanti kapsamında olmayan operasyonlar
   */
  async getNonWarrantyOperations() {
    const operations = await db
      .select({
        id: serviceOperations.id,
        operationType: serviceOperations.operationType,
        cost: serviceOperations.cost,
        operationDate: serviceOperations.operationDate,
        issue: {
          id: issues.id,
          issueNumber: issues.issueNumber,
          company: {
            id: companies.id,
            name: companies.name,
            contactPersonName: companies.contactPersonName,
            contactPersonEmail: companies.contactPersonEmail,
          },
        },
      })
      .from(serviceOperations)
      .leftJoin(issues, eq(serviceOperations.issueId, issues.id))
      .leftJoin(companies, eq(issues.companyId, companies.id))
      .where(eq(serviceOperations.isUnderWarranty, false))
      .orderBy(desc(serviceOperations.operationDate));

    return operations;
  }

  /**
   * Teknisyen performans raporu
   */
  async getTechnicianPerformanceReport(dateFrom?: Date, dateTo?: Date) {
    let whereConditions = [];

    if (dateFrom) {
      whereConditions.push(sql`${serviceOperations.operationDate} >= ${dateFrom}`);
    }

    if (dateTo) {
      whereConditions.push(sql`${serviceOperations.operationDate} <= ${dateTo}`);
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const report = await db
      .select({
        technicianId: serviceOperations.performedBy,
        technicianName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        totalOperations: count(serviceOperations.id),
        completedOperations: count(sql`CASE WHEN ${serviceOperations.status} = 'COMPLETED' THEN 1 END`),
        totalCost: sql<number>`SUM(COALESCE(${serviceOperations.cost}, 0))`,
        totalDuration: sql<number>`SUM(COALESCE(${serviceOperations.duration}, 0))`,
        averageDuration: sql<number>`AVG(COALESCE(${serviceOperations.duration}, 0))`,
      })
      .from(serviceOperations)
      .leftJoin(users, eq(serviceOperations.performedBy, users.id))
      .where(whereClause)
      .groupBy(serviceOperations.performedBy, users.firstName, users.lastName)
      .orderBy(desc(sql`count(${serviceOperations.id})`));

    return report;
  }

  /**
   * Operasyon bildirimi gönderir
   */
  private async sendOperationNotification(operationId: string) {
    try {
      const operation = await this.getServiceOperationById(operationId);
      if (!operation) return;

      // Önemli operasyonlarda bildirim gönder
      const importantOperations = ['REPAIR', 'FINAL_TEST', 'QUALITY_CHECK'];
      if (importantOperations.includes(operation.operationType)) {
        await this.emailService.sendServiceOperationNotification(operationId);
      }
    } catch (error) {
      console.error('Error sending operation notification:', error);
    }
  }

  /**
   * Tamir tamamlama bildirimi gönderir
   */
  private async sendRepairCompletionNotification(issueId: string, operationId: string) {
    try {
      await this.emailService.sendRepairCompletionNotification(issueId, operationId);
    } catch (error) {
      console.error('Error sending repair completion notification:', error);
    }
  }
}
