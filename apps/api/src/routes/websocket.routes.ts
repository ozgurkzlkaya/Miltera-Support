import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { buildResponseSuccessSchema } from "../helpers/response.helpers";
import { Error404Schema, Error500Schema } from "../dtos/base.schema";
import { authMiddleware } from "../helpers/auth.helpers";
import { getIO, getConnectedUsersCount, getConnectedUsersByRole } from "../lib/websocket";
import { notificationService } from "../services/notification.service";

// Test notification schema
const TestNotificationSchema = z.object({
  type: z.enum(['issue_status_change', 'product_status_change', 'shipment_update', 'system_alert']),
  title: z.string(),
  message: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  target: z.enum(['user', 'role', 'all']),
  targetId: z.string().optional(), // userId or role name
});

// WebSocket status schema
const WebSocketStatusSchema = z.object({
  isConnected: z.boolean(),
  connectedUsers: z.number(),
  usersByRole: z.record(z.string(), z.number()),
});

// Test notification route
const testNotificationRoute = createRoute({
  method: 'post',
  path: '/test-notification',
  request: {
    body: {
      content: {
        'application/json': {
          schema: TestNotificationSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(z.object({
            message: z.string(),
            sentTo: z.number(),
          })),
        },
      },
      description: 'Test notification sent successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: Error404Schema,
        },
      },
      description: 'Invalid request',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
  tags: ['WebSocket'],
  summary: 'Send test notification',
  description: 'Send a test notification to test WebSocket functionality',
});

// WebSocket status route
const websocketStatusRoute = createRoute({
  method: 'get',
  path: '/status',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(WebSocketStatusSchema),
        },
      },
      description: 'WebSocket status retrieved successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
  tags: ['WebSocket'],
  summary: 'Get WebSocket status',
  description: 'Get current WebSocket connection status and statistics',
});

// Send system alert route
const systemAlertRoute = createRoute({
  method: 'post',
  path: '/system-alert',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            title: z.string(),
            message: z.string(),
            priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(z.object({
            message: z.string(),
            sentTo: z.number(),
          })),
        },
      },
      description: 'System alert sent successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
  tags: ['WebSocket'],
  summary: 'Send system alert',
  description: 'Send a system alert to all connected users',
});

const websocketRouter = createRouter<HonoEnv>()
  .use('*', authMiddleware)
  .openapi(testNotificationRoute, async (c) => {
    try {
      const body = await c.req.json();
      const { type, title, message, priority, target, targetId } = body;
      const session = c.get('session');

      let sentTo = 0;
      const io = getIO();

      switch (target) {
        case 'user':
          if (!targetId) {
            return c.json({ success: false, error: { message: 'Target user ID is required' } }, 400);
          }
          await sendNotificationToUser(targetId, {
            type,
            title,
            message,
            timestamp: new Date().toISOString(),
            priority,
          });
          sentTo = 1;
          break;

        case 'role':
          if (!targetId) {
            return c.json({ success: false, error: { message: 'Target role is required' } }, 400);
          }
          await sendNotificationToRole(targetId, {
            type,
            title,
            message,
            timestamp: new Date().toISOString(),
            priority,
          });
          sentTo = io.to(`role:${targetId}`).sockets.size;
          break;

        case 'all':
          await sendNotificationToAll({
            type,
            title,
            message,
            timestamp: new Date().toISOString(),
            priority,
          });
          sentTo = io.sockets.sockets.size;
          break;

        default:
          return c.json({ success: false, error: { message: 'Invalid target' } }, 400);
      }

      return c.json({
        success: true,
        data: {
          message: 'Test notification sent successfully',
          sentTo,
        },
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      return c.json({ success: false, error: { message: 'Internal server error' } }, 500);
    }
  })
  .openapi(websocketStatusRoute, async (c) => {
    try {
      const io = getIO();
      const connectedUsers = io.sockets.sockets.size;

      // Get users by role
      const usersByRole: Record<string, number> = {};
      const sockets = Array.from(io.sockets.sockets.values());
      
      for (const socket of sockets) {
        const role = socket.data.user?.role || 'unknown';
        usersByRole[role] = (usersByRole[role] || 0) + 1;
      }

      return c.json({
        success: true,
        data: {
          isConnected: true,
          connectedUsers,
          usersByRole,
        },
      });
    } catch (error) {
      console.error('Error getting WebSocket status:', error);
      return c.json({ success: false, error: { message: 'Internal server error' } }, 500);
    }
  })
  .openapi(systemAlertRoute, async (c) => {
    try {
      const body = await c.req.json();
      const { title, message, priority } = body;

      await notificationService.sendSystemAlertNotification(title, message, priority);

      const io = getIO();
      const sentTo = io.sockets.sockets.size;

      return c.json({
        success: true,
        data: {
          message: 'System alert sent successfully',
          sentTo,
        },
      });
    } catch (error) {
      console.error('Error sending system alert:', error);
      return c.json({ success: false, error: { message: 'Internal server error' } }, 500);
    }
  });

export default websocketRouter;
