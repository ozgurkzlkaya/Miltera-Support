import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { redisClient } from './redis';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { auth } from './auth';

import env from '../config/env';

// WebSocket event types
export interface NotificationEvent {
  type: 'issue_status_change' | 'product_status_change' | 'shipment_update' | 'system_alert';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UserConnection {
  userId: string;
  socketId: string;
  role: string;
  companyId?: string;
  lastSeen: Date;
}

// WebSocket server instance
let io: SocketIOServer | null = null;

// Connected users map
const connectedUsers = new Map<string, UserConnection>();

// Initialize WebSocket server
export const initializeWebSocket = (httpServer: HTTPServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token using better-auth
      const headers = new Headers();
      headers.set('authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
      const session = await auth.api.getSession({ headers });
      
      if (!session || !session.user) {
        return next(new Error('Invalid token'));
      }

      // Get user details from database
      const user = await db
        .select({
          id: users.id,
          email: users.email,
          role: users.role,
          companyId: users.companyId,
        })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

      if (!user[0]) {
        return next(new Error('User not found'));
      }

      socket.data.user = user[0];
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const user = socket.data.user;
    
    console.log(`User connected: ${user.email} (${user.id})`);

    // Store user connection
    connectedUsers.set(socket.id, {
      userId: user.id,
      socketId: socket.id,
      role: user.role,
      companyId: user.companyId,
      lastSeen: new Date()
    });

    // Join user-specific room
    socket.join(`user:${user.id}`);

    // Join role-based room
    socket.join(`role:${user.role}`);

    // Join company room if applicable
    if (user.companyId) {
      socket.join(`company:${user.companyId}`);
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.email} (${user.id})`);
      connectedUsers.delete(socket.id);
      
      // Update last seen in Redis
      redisClient.setex(`user:${user.id}:lastSeen`, 3600, new Date().toISOString());
    });

    // Handle custom events
    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`User ${user.email} joined room: ${room}`);
    });

    socket.on('leave_room', (room: string) => {
      socket.leave(room);
      console.log(`User ${user.email} left room: ${room}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { room: string; userId: string }) => {
      socket.to(data.room).emit('user_typing', {
        userId: data.userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data: { room: string; userId: string }) => {
      socket.to(data.room).emit('user_typing', {
        userId: data.userId,
        isTyping: false
      });
    });

    // Handle read receipts
    socket.on('mark_read', (notificationId: string) => {
      // Mark notification as read in database
      markNotificationAsRead(user.id, notificationId);
    });
  });

  return io;
};

// Get WebSocket server instance
export const getIO = () => {
  if (!io) {
    throw new Error('WebSocket server not initialized');
  }
  return io;
};

// Send notification to specific user
export const sendNotificationToUser = (userId: string, notification: NotificationEvent) => {
  if (!io) return;

  io.to(`user:${userId}`).emit('notification', notification);
  
  // Store notification in Redis for offline users
  redisClient.lpush(`notifications:${userId}`, JSON.stringify(notification));
  redisClient.expire(`notifications:${userId}`, 86400); // 24 hours
};

// Send notification to all users with specific role
export const sendNotificationToRole = (role: string, notification: NotificationEvent) => {
  if (!io) return;

  io.to(`role:${role}`).emit('notification', notification);
};

// Send notification to all users in a company
export const sendNotificationToCompany = (companyId: string, notification: NotificationEvent) => {
  if (!io) return;

  io.to(`company:${companyId}`).emit('notification', notification);
};

// Send notification to all connected users
export const sendNotificationToAll = (notification: NotificationEvent) => {
  if (!io) return;

  io.emit('notification', notification);
};

// Send notification to specific room
export const sendNotificationToRoom = (room: string, notification: NotificationEvent) => {
  if (!io) return;

  io.to(room).emit('notification', notification);
};

// Get connected users count
export const getConnectedUsersCount = () => {
  return connectedUsers.size;
};

// Get connected users by role
export const getConnectedUsersByRole = (role: string) => {
  return Array.from(connectedUsers.values()).filter(user => user.role === role);
};

// Get connected users by company
export const getConnectedUsersByCompany = (companyId: string) => {
  return Array.from(connectedUsers.values()).filter(user => user.companyId === companyId);
};

// Check if user is online
export const isUserOnline = (userId: string) => {
  return Array.from(connectedUsers.values()).some(user => user.userId === userId);
};

// Get user's offline notifications
export const getOfflineNotifications = async (userId: string) => {
  try {
    const notifications = await redisClient.lrange(`notifications:${userId}`, 0, -1);
    return notifications.map(notification => JSON.parse(notification));
  } catch (error) {
    console.error('Error getting offline notifications:', error);
    return [];
  }
};

// Clear user's offline notifications
export const clearOfflineNotifications = async (userId: string) => {
  try {
    await redisClient.del(`notifications:${userId}`);
  } catch (error) {
    console.error('Error clearing offline notifications:', error);
  }
};

// Mark notification as read (placeholder - implement with your notification table)
const markNotificationAsRead = async (userId: string, notificationId: string) => {
  try {
    // TODO: Implement with your notification table
    console.log(`Marking notification ${notificationId} as read for user ${userId}`);
    
    // Store read status in Redis for now
    await redisClient.setex(`notification:${notificationId}:read:${userId}`, 86400, 'true');
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Get user's unread notification count
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const notifications = await getOfflineNotifications(userId);
    let unreadCount = 0;
    
    for (const notification of notifications) {
      const isRead = await redisClient.get(`notification:${notification.timestamp}:read:${userId}`);
      if (!isRead) {
        unreadCount++;
      }
    }
    
    return unreadCount;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

// Send real-time status updates
export const sendStatusUpdate = (entityType: string, entityId: string, status: string, updatedBy: string) => {
  if (!io) return;

  const update = {
    type: 'status_update',
    entityType,
    entityId,
    status,
    updatedBy,
    timestamp: new Date().toISOString(),
  };

  io.emit('status_update', update);
};

// Send real-time data updates
export const sendDataUpdate = (entityType: string, entityId: string, data: any, updatedBy: string) => {
  if (!io) return;

  const update = {
    type: 'data_update',
    entityType,
    entityId,
    data,
    updatedBy,
    timestamp: new Date().toISOString(),
  };

  io.emit('data_update', update);
};

// Send typing indicators
export const sendTypingIndicator = (room: string, userId: string, isTyping: boolean) => {
  if (!io) return;

  io.to(room).emit('typing_indicator', {
    userId,
    isTyping,
    timestamp: new Date().toISOString(),
  });
};

// Send activity updates
export const sendActivityUpdate = (userId: string, activity: string, data?: any) => {
  if (!io) return;

  const update = {
    type: 'activity_update',
    userId,
    activity,
    data,
    timestamp: new Date().toISOString(),
  };

  // Send to user's room
  io.to(`user:${userId}`).emit('activity_update', update);
  
  // Send to admin room if it's an important activity
  if (['login', 'logout', 'data_export', 'bulk_operation'].includes(activity)) {
    io.to('role:ADMIN').emit('activity_update', update);
  }
};


