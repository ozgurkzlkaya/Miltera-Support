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
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3011', {
      auth: {
        token: `Bearer ${token}`
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      set({ socket, isConnected: true });
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      set({ isConnected: false });
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      set({ isConnected: false });
    });

    socket.on('notification', (notification: NotificationEvent) => {
      console.log('Received notification:', notification);
      get().addNotification(notification);
    });

    socket.on('status_update', (update: any) => {
      console.log('Status update received:', update);
      // Handle real-time status updates
      // This could trigger UI updates or refresh data
    });

    socket.on('data_update', (update: any) => {
      console.log('Data update received:', update);
      // Handle real-time data updates
      // This could trigger UI updates or refresh data
    });

    socket.on('activity_update', (update: any) => {
      console.log('Activity update received:', update);
      // Handle activity updates
    });

    socket.on('user_typing', (data: { userId: string; isTyping: boolean }) => {
      // Handle typing indicators
      console.log('User typing:', data);
    });

    socket.on('typing_indicator', (data: { userId: string; isTyping: boolean; timestamp: string }) => {
      // Handle typing indicators
      console.log('Typing indicator:', data);
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
      audio.play().catch(() => {
        // Ignore audio play errors
      });
    } catch (error) {
      // Ignore audio errors
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
  // WebSocket geçici olarak devre dışı - API sunucusunda Socket.IO yok
  console.log('WebSocket initialization skipped - API server does not support Socket.IO yet');
  // const { connect } = useWebSocketStore.getState();
  // connect(token);
};

// Cleanup WebSocket connection
export const cleanupWebSocket = () => {
  const { disconnect } = useWebSocketStore.getState();
  disconnect();
};
