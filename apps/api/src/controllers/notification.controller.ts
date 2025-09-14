import { createControllerAction } from "./base.controller";
import { NotificationsService } from "../services/notifications.service";
import { createSuccessResponse, createErrorResponse } from "../helpers/response.helpers";
import type { HonoEnv } from "../config/env";

const notificationsService = new NotificationsService();

const NotificationsController = {
  // Get all notifications for a user
  list: createControllerAction(async (c) => {
    try {
      const session = c.get("session");
      if (!session?.user?.id) {
        return c.responseJSON(createErrorResponse(401, "Unauthorized"));
      }

      const query = c.req.query();
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '20');
      const filter = query.filter as string;
      
      const result = await notificationsService.getNotificationsByUserId(
        session.user.id, 
        { filter }, 
        page, 
        limit
      );
      
      return c.responseJSON(createSuccessResponse(result));
    } catch (error) {
      console.error('Error listing notifications:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  // Get notification by ID
  show: createControllerAction(async (c) => {
    try {
      const { id } = c.req.param();
      const session = c.get("session");
      
      if (!session?.user?.id) {
        return c.responseJSON(createErrorResponse(401, "Unauthorized"));
      }

      const notification = await notificationsService.getNotificationById(id, session.user.id);
      
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
      
      if (!session?.user?.id) {
        return c.responseJSON(createErrorResponse(401, "Unauthorized"));
      }

      const result = await notificationsService.markAsRead(id, session.user.id);
      
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
      
      if (!session?.user?.id) {
        return c.responseJSON(createErrorResponse(401, "Unauthorized"));
      }

      const result = await notificationsService.markAllAsRead(session.user.id);
      
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
      
      if (!session?.user?.id) {
        return c.responseJSON(createErrorResponse(401, "Unauthorized"));
      }

      const result = await notificationsService.deleteNotification(id, session.user.id);
      
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
      const session = c.get("session");
      
      if (!session?.user?.id) {
        return c.responseJSON(createErrorResponse(401, "Unauthorized"));
      }

      const body = await c.req.json();
      
      const notification = await notificationsService.createNotification({
        ...body,
        createdBy: session.user.id
      });
      
      return c.responseJSON(createSuccessResponse(notification), 201);
    } catch (error) {
      console.error('Error creating notification:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  // Get notification statistics
  getStats: createControllerAction(async (c) => {
    try {
      const session = c.get("session");
      
      if (!session?.user?.id) {
        return c.responseJSON(createErrorResponse(401, "Unauthorized"));
      }

      const stats = await notificationsService.getNotificationStats(session.user.id);
      
      return c.responseJSON(createSuccessResponse(stats));
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),
};

export { NotificationsController };
