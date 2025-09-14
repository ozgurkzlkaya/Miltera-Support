import { db } from "../db";
import { notifications, users } from "../db/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";

export interface NotificationFilters {
  filter?: string;
  type?: string;
  priority?: string;
  category?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  highPriority: number;
  success: number;
}

export class NotificationsService {
  async getNotificationsByUserId(
    userId: string,
    filters: NotificationFilters = {},
    page: number = 1,
    limit: number = 20
  ) {
    const offset = (page - 1) * limit;
    
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    // Apply filters
    if (filters.filter === 'unread') {
      query = query.where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    } else if (filters.filter === 'read') {
      query = query.where(and(eq(notifications.userId, userId), eq(notifications.read, true)));
    }

    if (filters.type) {
      query = query.where(and(eq(notifications.userId, userId), eq(notifications.type, filters.type)));
    }

    if (filters.priority) {
      query = query.where(and(eq(notifications.userId, userId), eq(notifications.priority, filters.priority)));
    }

    if (filters.category) {
      query = query.where(and(eq(notifications.userId, userId), eq(notifications.category, filters.category)));
    }

    const notificationsList = await query;

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(notifications)
      .where(eq(notifications.userId, userId));

    return {
      data: notificationsList,
      pagination: {
        page,
        limit,
        total: totalResult.count,
        totalPages: Math.ceil(totalResult.count / limit)
      }
    };
  }

  async getNotificationById(id: string, userId: string) {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .limit(1);

    return notification;
  }

  async markAsRead(id: string, userId: string) {
    const [updated] = await db
      .update(notifications)
      .set({ 
        read: true,
        readAt: new Date()
      })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();

    return updated;
  }

  async markAllAsRead(userId: string) {
    const result = await db
      .update(notifications)
      .set({ 
        read: true,
        readAt: new Date()
      })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
      .returning();

    return { count: result.length };
  }

  async deleteNotification(id: string, userId: string) {
    const [deleted] = await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();

    return deleted;
  }

  async createNotification(data: {
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info' | 'critical';
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'system' | 'issue' | 'product' | 'shipment' | 'user' | 'security' | 'performance' | 'maintenance';
    userId: string;
    createdBy: string;
    description?: string;
    source?: string;
    channels?: string[];
    expiresAt?: Date;
    tags?: string[];
  }) {
    const [notification] = await db
      .insert(notifications)
      .values({
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority,
        category: data.category,
        userId: data.userId,
        createdBy: data.createdBy,
        description: data.description,
        source: data.source || 'system',
        channels: data.channels || ['in-app'],
        expiresAt: data.expiresAt,
        tags: data.tags || [],
        read: false,
        createdAt: new Date()
      })
      .returning();

    return notification;
  }

  async getNotificationStats(userId: string): Promise<NotificationStats> {
    const [stats] = await db
      .select({
        total: count(),
        unread: sql<number>`count(*) filter (where read = false)`,
        highPriority: sql<number>`count(*) filter (where priority = 'high' or priority = 'critical')`,
        success: sql<number>`count(*) filter (where type = 'success')`
      })
      .from(notifications)
      .where(eq(notifications.userId, userId));

    return {
      total: stats.total,
      unread: stats.unread,
      highPriority: stats.highPriority,
      success: stats.success
    };
  }

  // System notification methods
  async createSystemNotification(data: {
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info' | 'critical';
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'system' | 'issue' | 'product' | 'shipment' | 'user' | 'security' | 'performance' | 'maintenance';
    description?: string;
    source?: string;
    channels?: string[];
    expiresAt?: Date;
    tags?: string[];
  }) {
    // Get all users to send notification to
    const allUsers = await db.select({ id: users.id }).from(users);

    const notificationsToCreate = allUsers.map(user => ({
      ...data,
      userId: user.id,
      createdBy: 'system'
    }));

    const createdNotifications = await db
      .insert(notifications)
      .values(notificationsToCreate)
      .returning();

    return createdNotifications;
  }

  async createIssueNotification(issueId: string, action: string, userId: string) {
    const notificationData = {
      title: `Arıza ${action}`,
      message: `Arıza kaydı ${action} edildi`,
      type: 'info' as const,
      priority: 'medium' as const,
      category: 'issue' as const,
      description: `Arıza ID: ${issueId}`,
      source: 'issue-system',
      channels: ['in-app', 'email'],
      tags: ['issue', action]
    };

    return this.createNotification({
      ...notificationData,
      userId,
      createdBy: 'system'
    });
  }

  async createProductNotification(productId: string, action: string, userId: string) {
    const notificationData = {
      title: `Ürün ${action}`,
      message: `Ürün ${action} edildi`,
      type: 'info' as const,
      priority: 'medium' as const,
      category: 'product' as const,
      description: `Ürün ID: ${productId}`,
      source: 'product-system',
      channels: ['in-app'],
      tags: ['product', action]
    };

    return this.createNotification({
      ...notificationData,
      userId,
      createdBy: 'system'
    });
  }
}
