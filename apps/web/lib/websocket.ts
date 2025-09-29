import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';

// Notification types
export interface NotificationEvent {
  type: 'issue_status_change' | 'product_status_change' | 'shipment_update' | 'system_alert';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read?: boolean;
}

// WebSocket store
interface WebSocketStore {
  socket: Socket | null;
  isConnected: boolean;
  notifications: NotificationEvent[];
  unreadCount: number;
  connect: (token: string) => void;
  disconnect: () => void;
  addNotification: (notification: NotificationEvent) => void;
  markAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}

// WebSocket store
export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  notifications: [],
  unreadCount: 0,

  connect: (token: string) => {
    // WebSocket temporarily disabled - API WebSocket is disabled
    // console.log('WebSocket connection disabled - API WebSocket is not running');
    return;
    
    const url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3028';
    const bearer = token?.startsWith('Bearer ') ? token : `Bearer ${token}`;

    const socket = io(url, {
      path: "/socket.io",
      auth: { token: bearer },
      query: { token: bearer },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 3,
      withCredentials: true,
      forceNew: true,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      set({ socket, isConnected: true });
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      set({ isConnected: false });
    });

    socket.on('connect_error', (error: any) => {
      // Only log connection errors in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('WebSocket connection error:', error?.message || error);
      }
      set({ isConnected: false });
    });

    socket.on('error', (error: any) => {
      console.error('WebSocket error:', error?.message || error);
    });

    socket.on('notification', (notification: NotificationEvent) => {
      console.log('Received notification:', notification);
      get().addNotification(notification);
    });

    socket.on('status_update', (update: any) => {
      console.log('Status update received:', update);
    });

    socket.on('data_update', (update: any) => {
      console.log('Data update received:', update);
    });

    socket.on('activity_update', (update: any) => {
      console.log('Activity update received:', update);
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  addNotification: (notification: NotificationEvent) => {
    const { notifications } = get();
    const newNotifications = [notification, ...notifications];
    const unreadCount = newNotifications.filter(n => !n.read).length;
    
    set({ 
      notifications: newNotifications.slice(0, 50), // Keep only last 50 notifications
      unreadCount 
    });

    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.type,
      });
    }

    // Play notification sound
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch((error) => {
        // Silently ignore audio play errors (file might not exist)
        if (process.env.NODE_ENV === 'development') {
          console.debug('Notification sound play failed:', error);
        }
      });
    } catch (error) {
      // Silently ignore audio errors
      if (process.env.NODE_ENV === 'development') {
        console.debug('Notification sound error:', error);
      }
    }
  },

  markAsRead: (notificationId: string) => {
    const { socket, notifications } = get();
    
    // Mark notification as read locally
    const updatedNotifications = notifications.map(n => 
      n.data?.id === notificationId ? { ...n, read: true } : n
    );
    
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    set({ notifications: updatedNotifications, unreadCount });

    // Send read receipt to server
    if (socket) {
      socket.emit('mark_read', notificationId);
    }
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  joinRoom: (room: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('join_room', room);
    }
  },

  leaveRoom: (room: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('leave_room', room);
    }
  },
}));

// WebSocket hook for components
export const useWebSocket = () => {
  const store = useWebSocketStore();
  
  return {
    ...store,
    // Helper methods
    sendTypingStart: (room: string, userId: string) => {
      store.socket?.emit('typing_start', { room, userId });
    },
    
    sendTypingStop: (room: string, userId: string) => {
      store.socket?.emit('typing_stop', { room, userId });
    },
  };
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Initialize WebSocket connection
export const initializeWebSocket = (token: string) => {
  console.log('🔌 Initializing WebSocket connection...');
  const { connect } = useWebSocketStore.getState();
  connect(token);
};

// Cleanup WebSocket connection
export const cleanupWebSocket = () => {
  const { disconnect } = useWebSocketStore.getState();
  disconnect();
};
