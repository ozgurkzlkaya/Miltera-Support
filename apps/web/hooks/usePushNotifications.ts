import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService, PushNotificationPayload } from '../lib/push-notifications';

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  desktop: boolean;
  mobile: boolean;
  email: boolean;
  sms: boolean;
  categories: {
    issues: boolean;
    products: boolean;
    serviceOperations: boolean;
    shipments: boolean;
    system: boolean;
    marketing: boolean;
  };
}

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    vibration: true,
    desktop: true,
    mobile: true,
    email: false,
    sms: false,
    categories: {
      issues: true,
      products: true,
      serviceOperations: true,
      shipments: true,
      system: true,
      marketing: false,
    },
  });
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize push notifications
  const initialize = useCallback(async () => {
    try {
      // Firebase bağımlılığı kaldırıldı - basit destek kontrolü
      const supported = 'Notification' in window && 'serviceWorker' in navigator;
      setIsSupported(supported);
      
      if (!supported) {
        console.warn('Push notifications not supported');
        return false;
      }

      const success = await pushNotificationService.initialize();
      setIsInitialized(success);
      
      // Basit permission kontrolü
      const permission = Notification.permission === 'granted';
      setHasPermission(permission);
      
      // Token al
      const tokenValue = await pushNotificationService.getToken();
      setToken(tokenValue);
      
      return success;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    try {
      const permission = await pushNotificationService.requestPermission();
      setHasPermission(permission);
      return permission;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }, []);

  // Send notification to user
  const sendToUser = useCallback(async (userId: string, payload: PushNotificationPayload) => {
    try {
      return await pushNotificationService.sendNotificationToUser(userId, payload);
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return false;
    }
  }, []);

  // Send notification to role
  const sendToRole = useCallback(async (role: string, payload: PushNotificationPayload) => {
    try {
      return await pushNotificationService.sendNotificationToUserRole(role, payload);
    } catch (error) {
      console.error('Error sending notification to role:', error);
      return false;
    }
  }, []);

  // Load notification history
  const loadHistory = useCallback(async (page: number = 1, limit: number = 20) => {
    try {
      const data = await pushNotificationService.getNotificationHistory();
      if (data) {
        // Convert PushNotificationPayload[] to NotificationHistoryItem[]
        const historyItems: NotificationHistoryItem[] = data.map((item: any, index: number) => ({
          id: item.id || `notification-${index}`,
          title: item.title || 'Bildirim',
          body: item.body || '',
          type: item.type || 'general',
          read: item.read || false,
          createdAt: item.createdAt || new Date().toISOString(),
          data: item.data || {},
        }));
        setHistory(historyItems);
        setUnreadCount(historyItems.filter(item => !item.read).length);
      }
    } catch (error) {
      console.error('Error loading notification history:', error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Basit local update
      setHistory(prev => 
        prev.map(item => 
          item.id === notificationId ? { ...item, read: true } : item
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, []);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      const success = await pushNotificationService.clearNotificationHistory();
      if (success) {
        setHistory([]);
        setUnreadCount(0);
      }
      return success;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      return false;
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      
      // Save to localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
      
      // Send to server
      const userToken = localStorage.getItem('auth_token');
      if (userToken) {
        await fetch('http://localhost:3015/api/v1/notifications/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify(updatedSettings),
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }, [settings]);

  // Load settings from localStorage
  const loadSettings = useCallback(() => {
    try {
      const saved = localStorage.getItem('notificationSettings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  // Test notification
  const sendTestNotification = useCallback(async () => {
    try {
      const payload: PushNotificationPayload = {
        title: 'Test Bildirimi',
        body: 'Bu bir test bildirimidir.',
        icon: '/favicon.ico',
        data: {
          type: 'test',
          timestamp: Date.now(),
        },
      };

      // Show local notification
      if (hasPermission) {
        await pushNotificationService.showNotification(payload);
      }

      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }, [hasPermission]);

  // Initialize on mount
  useEffect(() => {
    loadSettings();
    initialize();
  }, [initialize, loadSettings]);

  // Load history on mount
  useEffect(() => {
    if (isInitialized) {
      loadHistory();
    }
  }, [isInitialized, loadHistory]);

  // Listen for push notification events
  useEffect(() => {
    const handlePushNotification = (event: CustomEvent) => {
      console.log('Push notification received:', event.detail);
      
      // Add to history
      const newNotification: NotificationHistoryItem = {
        id: event.detail.messageId || Date.now().toString(),
        title: event.detail.notification?.title || 'Yeni Bildirim',
        body: event.detail.notification?.body || 'Bir bildiriminiz var',
        type: event.detail.data?.type || 'general',
        read: false,
        createdAt: new Date().toISOString(),
        data: event.detail.data,
      };

      setHistory(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    window.addEventListener('push-notification', handlePushNotification as EventListener);

    return () => {
      window.removeEventListener('push-notification', handlePushNotification as EventListener);
    };
  }, []);

  return {
    // State
    isSupported,
    hasPermission,
    isInitialized,
    token,
    settings,
    history,
    unreadCount,
    
    // Actions
    initialize,
    requestPermission,
    sendToUser,
    sendToRole,
    loadHistory,
    markAsRead,
    clearAll,
    updateSettings,
    sendTestNotification,
    
    // Utilities
    isEnabled: settings.enabled && hasPermission,
    canSendNotifications: isSupported && hasPermission && isInitialized,
  };
};