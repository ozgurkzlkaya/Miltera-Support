import { db } from '../db';
import { issues, companies, users, products } from '../db/schema';
import { eq, and, desc, asc, like } from 'drizzle-orm';
import type { issueStatusEnum, issueSourceEnum, issuePriorityEnum } from '../db/schema';
import { EmailService } from './email.service';
import { notificationService } from './notification.service';

export interface CreateIssueRequest {
  productId: string;
  customerId: string;
  reportedBy: string;
  title: string;
  description: string;
  priority: typeof issuePriorityEnum[number];
  source: typeof issueSourceEnum[number];
}

export interface UpdateIssueRequest {
  issueId: string;
  status?: typeof issueStatusEnum[number];
  priority?: typeof issuePriorityEnum[number];
  description?: string;
  assignedTo?: string;
  resolvedAt?: Date;
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
      source
    } = request;

    const issueData = {
      id: crypto.randomUUID(),
      productId,
      customerId,
      reportedBy,
      title,
      description,
      status: 'OPEN' as typeof issueStatusEnum[number],
      priority,
      source,
      reportedAt: new Date(),
    };

    const result = await db.insert(issues).values(issueData).returning();
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
      assignedTo,
      resolvedAt
    } = request;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (description) updateData.description = description;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (resolvedAt) updateData.resolvedAt = resolvedAt;

    const result = await db.update(issues)
      .set(updateData)
      .where(eq(issues.id, issueId))
      .returning();

    const updatedIssue = result[0];

    // Real-time notification gönder (eğer durum değiştiyse)
    if (status) {
      await notificationService.sendIssueStatusChangeNotification(
        issueId,
        status,
        reportedBy || 'system'
      );
    }

    return updatedIssue;
  }

  /**
   * Arıza kayıtlarını listeler
   */
  async getIssues(filter: IssueFilter = {}) {
    let query = db.select().from(issues);

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

    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(issues.reportedAt));
    }

    return await query.orderBy(desc(issues.reportedAt));
  }

  /**
   * Arıza kaydını getirir
   */
  async getIssueById(issueId: string) {
    const result = await db.select()
      .from(issues)
      .where(eq(issues.id, issueId))
      .limit(1);

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
