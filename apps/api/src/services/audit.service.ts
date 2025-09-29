import { db } from '../db';
import { auditLogs } from '../db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';

export interface AuditLogEntry {
  id?: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export class AuditService {
  /**
   * Log an audit entry
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      const auditData = {
        id: crypto.randomUUID(),
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        oldValues: entry.oldValues ? JSON.stringify(entry.oldValues) : null,
        newValues: entry.newValues ? JSON.stringify(entry.newValues) : null,
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        createdAt: entry.timestamp || new Date(),
      };

      await db.insert(auditLogs).values(auditData);
    } catch (error) {
      console.error('Error logging audit entry:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  /**
   * Get audit logs with filters
   */
  static async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  } = {}) {
    const {
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = filters;

    let query = db.select().from(auditLogs);

    // Apply filters
    if (userId) {
      query = query.where(eq(auditLogs.userId, userId));
    }

    if (action) {
      query = query.where(eq(auditLogs.action, action));
    }

    if (entityType) {
      query = query.where(eq(auditLogs.entityType, entityType));
    }

    if (entityId) {
      query = query.where(eq(auditLogs.entityId, entityId));
    }

    if (startDate) {
      query = query.where(gte(auditLogs.createdAt, startDate));
    }

    if (endDate) {
      query = query.where(lte(auditLogs.createdAt, endDate));
    }

    // Apply pagination and ordering
    const offset = (page - 1) * limit;
    const results = await query
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalQuery = db.select({ count: sql<number>`count(*)` }).from(auditLogs);
    const totalResult = await totalQuery;
    const total = totalResult[0]?.count || 0;

    return {
      data: results.map(log => ({
        ...log,
        oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
        newValues: log.newValues ? JSON.parse(log.newValues) : null,
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Get audit trail for a specific entity
   */
  static async getEntityAuditTrail(entityType: string, entityId: string) {
    const results = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.entityType, entityType),
          eq(auditLogs.entityId, entityId)
        )
      )
      .orderBy(desc(auditLogs.createdAt));

    return results.map(log => ({
      ...log,
      oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
      newValues: log.newValues ? JSON.parse(log.newValues) : null,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    }));
  }

  /**
   * Get user activity summary
   */
  static async getUserActivitySummary(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const results = await db
      .select({
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        count: sql<number>`count(*)`,
      })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.userId, userId),
          gte(auditLogs.createdAt, startDate)
        )
      )
      .groupBy(auditLogs.action, auditLogs.entityType);

    return results;
  }

  /**
   * Clean up old audit logs (for maintenance)
   */
  static async cleanupOldLogs(daysToKeep: number = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await db
      .delete(auditLogs)
      .where(lte(auditLogs.createdAt, cutoffDate));

    return result;
  }
}

// Audit decorator for automatic logging
export function AuditLog(action: string, entityType: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);
      
      // Extract entity ID from result or arguments
      let entityId: string | undefined;
      if (result && result.id) {
        entityId = result.id;
      } else if (args[0] && args[0].id) {
        entityId = args[0].id;
      } else if (args[0] && typeof args[0] === 'string') {
        entityId = args[0];
      }

      if (entityId) {
        // Get user ID from context (you'll need to implement this based on your auth system)
        const userId = 'system'; // Replace with actual user ID from request context
        
        await AuditService.log({
          userId,
          action,
          entityType,
          entityId,
          metadata: {
            method: propertyName,
            timestamp: new Date().toISOString(),
          }
        });
      }

      return result;
    };

    return descriptor;
  };
}

export default AuditService;
