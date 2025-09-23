import { db } from '../db';
import { issues, companies, users, products, issueCategories } from '../db/schema';
import { eq, and, desc, asc, like } from 'drizzle-orm';
import type { issueStatusEnum, issueSourceEnum, issuePriorityEnum } from '../db/schema';
import { EmailService } from './email.service';
import { notificationService } from './notification.service';

export interface CreateIssueRequest {
  productId: string | null;
  customerId: string;
  reportedBy: string;
  title: string;
  description: string;
  priority: typeof issuePriorityEnum[number];
  source: typeof issueSourceEnum[number];
  estimatedCost?: number | null;
  actualCost?: number | null;
}

export interface UpdateIssueRequest {
  issueId: string;
  status?: typeof issueStatusEnum[number];
  priority?: typeof issuePriorityEnum[number];
  description?: string;
  customerDescription?: string;
  technicianDescription?: string;
  assignedTo?: string;
  resolvedAt?: Date;
  estimatedCost?: number;
  actualCost?: number;
  source?: typeof issueSourceEnum[number];
  companyId?: string;
}

export interface IssueFilter {
  status?: typeof issueStatusEnum[number];
  source?: typeof issueSourceEnum[number];
  priority?: typeof issuePriorityEnum[number];
  customerId?: string;
  reportedBy?: string;
  search?: string;
}

export class IssueService {
  private emailService = new EmailService();

  /**
   * Yeni arıza kaydı oluşturur
   */
  async createIssue(request: CreateIssueRequest) {
    const {
      productId,
      customerId,
      reportedBy,
      title,
      description,
      priority,
      source,
      estimatedCost,
      actualCost
    } = request;

    // Issue number oluştur (YYMMDD-XX format)
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // Aynı gün için kaç issue var kontrol et
    const todayIssues = await db.select().from(issues)
      .where(like(issues.issueNumber, `${dateStr}-%`));
    const issueNumber = `${dateStr}-${(todayIssues.length + 1).toString().padStart(2, '0')}`;

    const issueData = {
      id: crypto.randomUUID(),
      issueNumber,
      productId,
      customerId,
      companyId: customerId, // companyId'yi customerId ile aynı yap
      reportedBy,
      title,
      description,
      customerDescription: description, // customerDescription'ı description ile aynı yap
      status: 'OPEN' as typeof issueStatusEnum[number],
      priority,
      source,
      estimatedCost,
      actualCost,
      reportedAt: new Date(),
    };

    console.log('Issue data to insert:', issueData);
    const result = await db.insert(issues).values(issueData).returning();
    console.log('Inserted issue:', result[0]);
    const newIssue = result[0];

    // Real-time notification gönder
    await notificationService.sendNewIssueNotification(newIssue.id);

    return newIssue;
  }

  /**
   * Arıza kaydını günceller
   */
  async updateIssue(request: UpdateIssueRequest) {
    const {
      issueId,
      status,
      priority,
      description,
      customerDescription,
      technicianDescription,
      assignedTo,
      resolvedAt,
      estimatedCost,
      actualCost,
      source,
      companyId
    } = request;

    console.log('Updating issue with request:', request);

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (description) updateData.description = description;
    if (customerDescription) updateData.customerDescription = customerDescription;
    if (technicianDescription) updateData.technicianDescription = technicianDescription;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (resolvedAt) updateData.resolvedAt = resolvedAt;
    if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost;
    if (actualCost !== undefined) updateData.actualCost = actualCost;
    if (source) updateData.source = source;
    if (companyId) updateData.companyId = companyId;
    
    // updatedAt timestamp'i ekle
    updateData.updatedAt = new Date();

    console.log('Update data:', updateData);

    const result = await db.update(issues)
      .set(updateData)
      .where(eq(issues.id, issueId))
      .returning();

    const updatedIssue = result[0];
    console.log('Updated issue:', updatedIssue);

    // Real-time notification gönder (eğer durum değiştiyse)
    if (status) {
      await notificationService.sendIssueStatusChangeNotification(
        issueId,
        status,
        'system'
      );
    }

    return updatedIssue;
  }

  /**
   * Arıza kayıtlarını listeler
   */
  async getIssues(filter: IssueFilter = {}) {
    console.log('getIssues called with filter:', filter);
    const conditions = [];

    if (filter.status) {
      conditions.push(eq(issues.status, filter.status));
    }

    if (filter.source) {
      conditions.push(eq(issues.source, filter.source));
    }

    if (filter.priority) {
      conditions.push(eq(issues.priority, filter.priority));
    }

    if (filter.customerId) {
      conditions.push(eq(issues.customerId, filter.customerId));
    }

    if (filter.reportedBy) {
      conditions.push(eq(issues.reportedBy, filter.reportedBy));
    }

    if (filter.search) {
      conditions.push(
        like(issues.title, `%${filter.search}%`)
      );
    }

    // Basit yaklaşım - tüm kayıtları getir
    const whereClause = undefined;
    console.log('whereClause:', whereClause);
    console.log('conditions:', conditions);

    // İlişkili verilerle birlikte getir
    const result = await db
      .select({
        id: issues.id,
        issueNumber: issues.issueNumber,
        title: issues.title,
        description: issues.description,
        customerDescription: issues.customerDescription,
        technicianDescription: issues.technicianDescription,
        status: issues.status,
        priority: issues.priority,
        source: issues.source,
        isUnderWarranty: issues.isUnderWarranty,
        estimatedCost: issues.estimatedCost,
        actualCost: issues.actualCost,
        reportedAt: issues.reportedAt,
        createdAt: issues.createdAt,
        updatedAt: issues.updatedAt,
        companyId: issues.companyId,
        issueCategoryId: issues.issueCategoryId,
        reportedBy: issues.reportedBy,
        // Company bilgileri
        company: {
          id: companies.id,
          name: companies.name,
        },
        // Category bilgileri
        issueCategory: {
          id: issueCategories.id,
          name: issueCategories.name,
        },
        // Reported by user bilgileri
        reportedByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(issues)
      .leftJoin(companies, eq(issues.companyId, companies.id))
      .leftJoin(issueCategories, eq(issues.issueCategoryId, issueCategories.id))
      .leftJoin(users, eq(issues.reportedBy, users.id))
      .where(whereClause)
      .orderBy(desc(issues.reportedAt));

    return result;
  }

  /**
   * Arıza kaydını getirir
   */
  async getIssue(issueId: string) {
    const result = await db.select()
      .from(issues)
      .where(eq(issues.id, issueId))
      .limit(1);

    return result[0];
  }

  /**
   * Arıza kaydını siler
   */
  async deleteIssue(issueId: string) {
    console.log('Deleting issue with ID:', issueId);
    
    const result = await db.delete(issues)
      .where(eq(issues.id, issueId))
      .returning();

    console.log('Deleted issue result:', result);
    return result[0];
  }

  /**
   * Arıza istatistiklerini getirir
   */
  async getIssueStats() {
    const allIssues = await db.select().from(issues);
    
    const stats = {
      total: allIssues.length,
      open: allIssues.filter(i => i.status === 'OPEN').length,
      inProgress: allIssues.filter(i => i.status === 'IN_PROGRESS').length,
      closed: allIssues.filter(i => i.status === 'CLOSED').length,
      critical: allIssues.filter(i => i.priority === 'CRITICAL').length,
      high: allIssues.filter(i => i.priority === 'HIGH').length,
    };

    return stats;
  }
}
