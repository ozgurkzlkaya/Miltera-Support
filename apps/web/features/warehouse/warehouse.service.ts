// Real API calls with fetch
class WarehouseAPI {
  private baseUrl = 'http://localhost:3015/api/v1/warehouse';

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

  // Location Management
  async getLocations() {
    return this.makeRequest(`${this.baseUrl}/locations`);
  }

  async getLocation(id: string) {
    return this.makeRequest(`${this.baseUrl}/locations/${id}`);
  }

  async createLocation(data: any) {
    return this.makeRequest(`${this.baseUrl}/locations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLocation(id: string, data: any) {
    return this.makeRequest(`${this.baseUrl}/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Inventory Management
  async getInventory() {
    return this.makeRequest(`${this.baseUrl}/inventory`);
  }

  async getLocationInventory(id: string) {
    return this.makeRequest(`${this.baseUrl}/locations/${id}/inventory`);
  }

  // Statistics
  async getStats() {
    return this.makeRequest(`${this.baseUrl}/stats`);
  }

  async getStockAlerts() {
    return this.makeRequest(`${this.baseUrl}/alerts`);
  }

  // Additional operations
  async bulkMoveProducts(data: any) {
    return this.makeRequest(`${this.baseUrl}/move`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async performInventoryCount(data: any) {
    return this.makeRequest(`${this.baseUrl}/count`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const warehouseAPI = new WarehouseAPI();

// Types
export interface Location {
  id: string;
  name: string;
  type: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationCreate {
  name: string;
  type: string;
  address?: string;
  notes?: string;
  createdBy: string;
}

export interface LocationUpdate {
  name?: string;
  type?: string;
  address?: string;
  notes?: string;
  updatedBy: string;
}

export interface WarehouseInventoryItem {
  locationId: string;
  locationName: string;
  locationType: string;
  status: string | null;
  count: number;
}

export interface WarehouseStats {
  totalLocations: number;
  usedLocations: number;
  totalStockProducts: number;
  totalCustomerProducts: number;
  statusStats: Array<{
    status: string;
    count: number;
  }>;
}

export interface StockAlert {
  type: string;
  message: string;
  details: Array<{
    locationId?: string;
    locationName?: string;
    count?: number;
    id?: string;
    name?: string;
    type?: string;
  }>;
}
