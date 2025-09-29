import { createControllerAction } from "./base.controller";
import { NotificationsService } from "../services/notifications.service";
import { createSuccessResponse, createErrorResponse } from "../helpers/response.helpers";
import type { HonoEnv } from "../config/env";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const notificationsService = new NotificationsService();

// Test user fonksiyonu kaldırıldı - gerçek auth sistemi kullanılıyor

const NotificationsController = {
  // Get all notifications for a user
  list: createControllerAction(async (c) => {
    try {
      const query = c.req.query();
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '20');
      const filter = query.filter as string;
      const type = query.type as string;
      const priority = query.priority as string;
      const category = query.category as string;
      
      // Gerçek auth kullanıcısını kullan
      const user = c.get("user");
      
      if (!user) {
        return c.responseJSON(createErrorResponse(401, 'User not authenticated'));
      }
      
      const userId = user.id;
      
      try {
        const result = await notificationsService.getNotificationsByUserId(
          userId,
          { filter, type, priority, category },
          page,
          limit
        );
        return c.responseJSON(createSuccessResponse(result));
      } catch (dbError) {
        console.log('Database error, returning empty list:', dbError.message);
        // Database hatası durumunda boş liste döndür
        const emptyResult = {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        };
        return c.responseJSON(createSuccessResponse(emptyResult));
      }
    } catch (error) {
      console.error('Error listing notifications:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      return c.responseJSON(createErrorResponse(500, 'Internal server error: ' + error.message));
    }
  }),

  // Get notification by ID
  show: createControllerAction(async (c) => {
    try {
      const { id } = c.req.param();
      const user = c.get("user");
      
      if (!user) {
        return c.responseJSON(createErrorResponse(401, "User not authenticated"));
      }

      const notification = await notificationsService.getNotificationById(id, user.id);
      
      if (!notification) {
        return c.responseJSON(createErrorResponse(404, 'Notification not found'));
      }
      
      return c.responseJSON(createSuccessResponse(notification));
    } catch (error) {
      console.error('Error showing notification:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  // Mark notification as read
  markAsRead: createControllerAction(async (c) => {
    try {
      const { id } = c.req.param();
      const session = c.get("session");
      
      // Gerçek auth kullanıcısını kullan
      const user = c.get("user");
      
      if (!user) {
        return c.responseJSON(createErrorResponse(401, 'User not authenticated'));
      }
      
      const userId = user.id;

      const result = await notificationsService.markAsRead(id, userId);
      
      if (!result) {
        return c.responseJSON(createErrorResponse(404, 'Notification not found'));
      }
      
      return c.responseJSON(createSuccessResponse({ message: 'Notification marked as read' }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  // Mark all notifications as read
  markAllAsRead: createControllerAction(async (c) => {
    try {
      const session = c.get("session");
      
      // Gerçek auth kullanıcısını kullan
      const user = c.get("user");
      
      if (!user) {
        return c.responseJSON(createErrorResponse(401, 'User not authenticated'));
      }
      
      const userId = user.id;

      const result = await notificationsService.markAllAsRead(userId);
      
      return c.responseJSON(createSuccessResponse({ 
        message: 'All notifications marked as read',
        count: result.count 
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  // Delete notification
  delete: createControllerAction(async (c) => {
    try {
      const { id } = c.req.param();
      const session = c.get("session");
      
      // Gerçek auth kullanıcısını kullan
      const user = c.get("user");
      
      if (!user) {
        return c.responseJSON(createErrorResponse(401, 'User not authenticated'));
      }
      
      const userId = user.id;

      const result = await notificationsService.deleteNotification(id, userId);
      
      if (!result) {
        return c.responseJSON(createErrorResponse(404, 'Notification not found'));
      }
      
      return c.responseJSON(createSuccessResponse({ message: 'Notification deleted' }));
    } catch (error) {
      console.error('Error deleting notification:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  // Create notification
  create: createControllerAction(async (c) => {
    try {
      const body = await c.req.json();
      
      // Gerçek auth kullanıcısını kullan
      const user = c.get("user");
      
      if (!user) {
        return c.responseJSON(createErrorResponse(401, 'User not authenticated'));
      }
      
      const userId = user.id;
      
      try {
        const notification = await notificationsService.createNotification({
          title: body.title,
          message: body.message,
          type: body.type,
          priority: body.priority,
          category: body.category,
          description: body.description,
          source: body.source || 'system',
          channels: body.channels || ['web'],
          tags: body.tags || [],
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
          userId: userId,
          createdBy: userId
        });
        
        return c.responseJSON(createSuccessResponse(notification), 201);
      } catch (dbError) {
        console.error('Database error creating notification:', dbError.message);
        return c.responseJSON(createErrorResponse(500, 'Database error: ' + dbError.message));
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  // Get notification statistics
  getStats: createControllerAction(async (c) => {
    try {
      // Gerçek auth kullanıcısını kullan
      const user = c.get("user");
      
      if (!user) {
        return c.responseJSON(createErrorResponse(401, 'User not authenticated'));
      }
      
      const userId = user.id;
      
      const stats = await notificationsService.getNotificationStats(userId);
      return c.responseJSON(createSuccessResponse(stats));
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),
};

export { NotificationsController };
