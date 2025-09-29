import { createRoute } from "@hono/zod-openapi";
import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import { z } from "../lib/zod";
import { NotificationsController } from "../controllers/notification.controller";
import { buildResponseSuccessSchema } from "../helpers/response.helpers";
import {
  Error404Schema,
  Error422Schema,
  Error500Schema,
} from "../dtos/base.schema";
import { authMiddleware } from "../helpers/auth.helpers"; // Auth middleware aktif

// Notification Schema
const NotificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['success', 'error', 'warning', 'info', 'critical']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['system', 'issue', 'product', 'shipment', 'user', 'security', 'performance', 'maintenance']),
  description: z.string().optional(),
  source: z.string(),
  channels: z.array(z.string()),
  tags: z.array(z.string()),
  read: z.boolean(),
  createdAt: z.string(),
  readAt: z.string().optional(),
  expiresAt: z.string().optional(),
  userId: z.string(),
  createdBy: z.string()
});

const NotificationListSchema = z.object({
  data: z.array(NotificationSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
  })
});

const NotificationStatsSchema = z.object({
  total: z.number(),
  unread: z.number(),
  highPriority: z.number(),
  success: z.number()
});

const NotificationCreateSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['success', 'error', 'warning', 'info', 'critical']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['system', 'issue', 'product', 'shipment', 'user', 'security', 'performance', 'maintenance']),
  description: z.string().optional(),
  source: z.string().optional(),
  channels: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  expiresAt: z.string().optional()
});

// List notifications
const listNotifications = createRoute({
  method: "get",
  path: "/",
  request: {
    query: z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      filter: z.enum(['all', 'unread', 'read']).optional(),
      type: z.string().optional(),
      priority: z.string().optional(),
      category: z.string().optional()
    })
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(NotificationListSchema),
        },
      },
      description: "List all notifications for user",
    },
    401: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Unauthorized",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Get notification by ID
const showNotification = createRoute({
  method: "get",
  path: "/:id",
  request: {
    params: z.object({
      id: z.string()
    })
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(NotificationSchema),
        },
      },
      description: "Get notification by ID",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Notification not found",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Mark notification as read
const markAsRead = createRoute({
  method: "patch",
  path: "/:id/mark-read",
  request: {
    params: z.object({
      id: z.string()
    })
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.object({
            message: z.string()
          })),
        },
      },
      description: "Notification marked as read",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Notification not found",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Mark all notifications as read
const markAllAsRead = createRoute({
  method: "patch",
  path: "/mark-all-read",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.object({
            message: z.string(),
            count: z.number()
          })),
        },
      },
      description: "All notifications marked as read",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Delete notification
const deleteNotification = createRoute({
  method: "delete",
  path: "/:id",
  request: {
    params: z.object({
      id: z.string()
    })
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.object({
            message: z.string()
          })),
        },
      },
      description: "Notification deleted",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Notification not found",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Create notification
const createNotification = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: NotificationCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(NotificationSchema),
        },
      },
      description: "Notification created",
    },
    422: {
      content: {
        "application/json": {
          schema: Error422Schema,
        },
      },
      description: "Validation error",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Get notification statistics
const getStats = createRoute({
  method: "get",
  path: "/stats",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(NotificationStatsSchema),
        },
      },
      description: "Notification statistics",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

const notificationsRoute = createRouter<HonoEnv>()
  .use("*", authMiddleware) // Auth middleware aktif
  .openapi(listNotifications, NotificationsController.list)
  .openapi(showNotification, NotificationsController.show)
  .openapi(markAsRead, NotificationsController.markAsRead)
  .openapi(markAllAsRead, NotificationsController.markAllAsRead)
  .openapi(deleteNotification, NotificationsController.delete)
  .openapi(createNotification, NotificationsController.create)
  .openapi(getStats, NotificationsController.getStats);

// Ayrı bir stats route'u ekleyelim
const statsRoute = createRouter<HonoEnv>()
  .use("*", authMiddleware) // Auth middleware aktif
  .get("/", (c) => c.json({ success: true, data: { total: 0, unread: 0, highPriority: 0, success: 0 } }));

export { statsRoute };

export default notificationsRoute;
