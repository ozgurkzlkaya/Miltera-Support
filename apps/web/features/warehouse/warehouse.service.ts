import { client } from "../../lib/rpc";

// Warehouse API endpoints
export const warehouseAPI = {
  // Location Management
  getLocations: () => client.api.v1.warehouse.locations.get(),
  getLocation: (id: string) => client.api.v1.warehouse.locations[":id"].get({ param: { id } }),
  createLocation: (data: any) => client.api.v1.warehouse.locations.post({ json: data }),
  updateLocation: (id: string, data: any) => client.api.v1.warehouse.locations[":id"].put({ param: { id }, json: data }),

  // Inventory Management
  getInventory: () => client.api.v1.warehouse.inventory.get(),
  getLocationInventory: (id: string) => client.api.v1.warehouse.locations[":id"].inventory.get({ param: { id } }),

  // Statistics
  getStats: () => client.api.v1.warehouse.stats.get(),
  getStockAlerts: () => client.api.v1.warehouse.alerts.get(),

  // Additional operations
  bulkMoveProducts: (data: any) => client.api.v1.warehouse.move.post({ json: data }),
  performInventoryCount: (data: any) => client.api.v1.warehouse.count.post({ json: data }),
};

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
