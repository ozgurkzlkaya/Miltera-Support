// Push Notifications Service - Firebase bağımlılıkları kaldırıldı

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: {
    [key: string]: any;
  };
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  timestamp?: number;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  desktop: boolean;
  mobile: boolean;
  email: boolean;
  sms: boolean;
}

export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private vapidKey: string;
  private registration: ServiceWorkerRegistration | null = null;
  private token: string | null = null;

  constructor() {
    this.vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY || "your-vapid-key";
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        console.log('Service worker not supported');
        return false;
      }

      // Register service worker
      // this.registration = await navigator.serviceWorker.register('/sw.js');
      // console.log('Service worker registered:', this.registration);

      // Get FCM token
      // await this.getToken();
      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async subscribeToTopic(topic: string): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return false;
    }
  }

  onMessage(callback: (payload: PushNotificationPayload) => void): void {
    // Firebase bağımlılığı kaldırıldı
  }

  async showNotification(payload: PushNotificationPayload): Promise<void> {
    // Firebase bağımlılığı kaldırıldı
  }

  async requestPermission(): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async unsubscribeFromTopic(topic: string): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      return false;
    }
  }

  async deleteToken(): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error deleting FCM token:', error);
      return false;
    }
  }

  async sendNotificationToUser(userId: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return false;
    }
  }

  async sendNotificationToTopic(topic: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to topic:', error);
      return false;
    }
  }

  async sendNotificationToAll(payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to all users:', error);
      return false;
    }
  }

  async getNotificationHistory(): Promise<PushNotificationPayload[]> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return [];
    } catch (error) {
      console.error('Error getting notification history:', error);
      return [];
    }
  }

  async clearNotificationHistory(): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error clearing notification history:', error);
      return false;
    }
  }

  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return {
        enabled: true,
        sound: true,
        vibration: true,
        desktop: true,
        mobile: true,
        email: false,
        sms: false,
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {
        enabled: true,
        sound: true,
        vibration: true,
        desktop: true,
        mobile: true,
        email: false,
        sms: false,
      };
    }
  }

  async updateNotificationSettings(settings: NotificationSettings): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }

  async getNotificationTopics(): Promise<string[]> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return [];
    } catch (error) {
      console.error('Error getting notification topics:', error);
      return [];
    }
  }

  async registerToken(): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error registering token:', error);
      return false;
    }
  }

  async unregisterToken(): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error unregistering token:', error);
      return false;
    }
  }

  async getNotificationStats(): Promise<NotificationStats> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        totalOpened: 0,
        totalClicked: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        totalOpened: 0,
        totalClicked: 0,
        deliveryRate: 0,
        openRate: 0,
        clickRate: 0,
      };
    }
  }

  async sendNotification(payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  async sendNotificationToDevice(deviceToken: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to device:', error);
      return false;
    }
  }

  async sendNotificationToDevices(deviceTokens: string[], payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to devices:', error);
      return false;
    }
  }

  async sendNotificationToUserGroup(userGroup: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user group:', error);
      return false;
    }
  }

  async sendNotificationToUserRole(userRole: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user role:', error);
      return false;
    }
  }

  async sendNotificationToUserStatus(userStatus: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user status:', error);
      return false;
    }
  }

  async sendNotificationToUserLocation(userLocation: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user location:', error);
      return false;
    }
  }

  async sendNotificationToUserDevice(userDevice: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device:', error);
      return false;
    }
  }

  async sendNotificationToUserDeviceType(userDeviceType: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device type:', error);
      return false;
    }
  }

  async sendNotificationToUserDeviceOS(userDeviceOS: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device OS:', error);
      return false;
    }
  }

  async sendNotificationToUserDeviceBrowser(userDeviceBrowser: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device browser:', error);
      return false;
    }
  }

  async sendNotificationToUserDeviceVersion(userDeviceVersion: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device version:', error);
      return false;
    }
  }

  async sendNotificationToUserDeviceLanguage(userDeviceLanguage: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device language:', error);
      return false;
    }
  }

  async sendNotificationToUserDeviceTimezone(userDeviceTimezone: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device timezone:', error);
      return false;
    }
  }

  async sendNotificationToUserDeviceCountry(userDeviceCountry: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device country:', error);
      return false;
    }
  }

  async sendNotificationToUserDeviceRegion(userDeviceRegion: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device region:', error);
      return false;
    }
  }

  async sendNotificationToUserDeviceCity(userDeviceCity: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device city:', error);
      return false;
    }
  }

  async sendNotificationToUserDeviceIP(userDeviceIP: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device IP:', error);
      return false;
    }
  }

  async sendNotificationToUserDeviceUserAgent(userDeviceUserAgent: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device user agent:', error);
      return false;
    }
  }

  async sendNotificationToUserDeviceReferrer(userDeviceReferrer: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device referrer:', error);
      return false;
    }
  }

  async sendNotificationToUserDeviceScreen(userDeviceScreen: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device screen:', error);
      return false;
    }
  }

  async sendNotificationToUserDeviceViewport(userDeviceViewport: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device viewport:', error);
      return false;
    }
  }

  async sendNotificationToUserDeviceColorDepth(userDeviceColorDepth: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device color depth:', error);
      return false;
    }
  }

  async sendNotificationToUserDevicePixelRatio(userDevicePixelRatio: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device pixel ratio:', error);
      return false;
    }
  }

  async sendNotificationToUserDeviceTouchSupport(userDeviceTouchSupport: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // Firebase bağımlılığı kaldırıldı
      return false;
    } catch (error) {
      console.error('Error sending notification to user device touch support:', error);
      return false;
    }
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();

// Export utility functions
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};