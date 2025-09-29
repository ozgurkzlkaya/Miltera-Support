// Real API calls with fetch
class NotificationsAPI {
  private baseUrl = 'http://localhost:3015/api/v1/notifications';

  private async makeRequest(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // Get notifications
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    filter?: string;
    type?: string;
    priority?: string;
    category?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.filter) searchParams.append('filter', params.filter);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.category) searchParams.append('category', params.category);
    
    const url = searchParams.toString() 
      ? `${this.baseUrl}?${searchParams}` 
      : this.baseUrl;
    
    return this.makeRequest(url);
  }

  // Get notification by ID
  async getNotification(id: string) {
    return this.makeRequest(`${this.baseUrl}/${id}`);
  }

  // Create notification
  async createNotification(data: any) {
    return this.makeRequest(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update notification
  async updateNotification(id: string, data: any) {
    return this.makeRequest(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete notification
  async deleteNotification(id: string) {
    return this.makeRequest(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }

  // Mark as read
  async markAsRead(id: string) {
    return this.makeRequest(`${this.baseUrl}/${id}/read`, {
      method: 'PATCH',
    });
  }

  // Mark all as read
  async markAllAsRead() {
    return this.makeRequest(`${this.baseUrl}/read-all`, {
      method: 'PATCH',
    });
  }

  // Get notification stats
  async getNotificationStats() {
    return this.makeRequest('http://localhost:3015/api/v1/notification-stats');
  }
}

export const notificationsAPI = new NotificationsAPI();

// Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface NotificationCreate {
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  userId: string;
}

export interface NotificationUpdate {
  title?: string;
  message?: string;
  type?: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category?: string;
  isRead?: boolean;
}

export interface NotificationListResponse {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    INFO: number;
    WARNING: number;
    ERROR: number;
    SUCCESS: number;
  };
  byPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
}
