import { z } from "zod";

// Location Schemas
export const LocationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Konum adı gerekli"),
  type: z.string().min(1, "Konum türü gerekli"),
  address: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const LocationCreateSchema = z.object({
  name: z.string().min(1, "Konum adı gerekli"),
  type: z.string().min(1, "Konum türü gerekli"),
  address: z.string().optional(),
  notes: z.string().optional(),
  createdBy: z.string().uuid(),
});

export const LocationUpdateSchema = z.object({
  name: z.string().min(1, "Konum adı gerekli").optional(),
  type: z.string().min(1, "Konum türü gerekli").optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  updatedBy: z.string().uuid(),
});

export const LocationListSchema = z.array(LocationSchema);

// Warehouse Inventory Schemas
export const WarehouseInventoryItemSchema = z.object({
  locationId: z.string().uuid(),
  locationName: z.string(),
  locationType: z.string(),
  status: z.string().nullable(),
  count: z.number().int().min(0),
});

export const WarehouseInventorySchema = z.array(WarehouseInventoryItemSchema);

// Warehouse Statistics Schemas
export const WarehouseStatsSchema = z.object({
  totalLocations: z.number().int().min(0),
  usedLocations: z.number().int().min(0),
  totalStockProducts: z.number().int().min(0),
  totalCustomerProducts: z.number().int().min(0),
  statusStats: z.array(z.object({
    status: z.string(),
    count: z.number().int().min(0),
  })),
});

// Stock Alerts Schemas
export const StockAlertDetailSchema = z.object({
  locationId: z.string().uuid().optional(),
  locationName: z.string().optional(),
  count: z.number().int().min(0).optional(),
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
});

export const StockAlertSchema = z.object({
  type: z.string(),
  message: z.string(),
  details: z.array(StockAlertDetailSchema),
});

export const StockAlertsSchema = z.array(StockAlertSchema);

// Bulk Move Products Schema
export const BulkMoveProductsSchema = z.object({
  productIds: z.array(z.string().uuid()),
  targetLocationId: z.string().uuid(),
  movedBy: z.string().uuid(),
  reason: z.string().optional(),
});

// Inventory Count Schema
export const InventoryCountItemSchema = z.object({
  productId: z.string().uuid(),
  expectedQuantity: z.number().int().min(0),
  actualQuantity: z.number().int().min(0),
  notes: z.string().optional(),
});

export const InventoryCountSchema = z.object({
  locationId: z.string().uuid(),
  countedBy: z.string().uuid(),
  countedItems: z.array(InventoryCountItemSchema),
});

// Type exports
export type Location = z.infer<typeof LocationSchema>;
export type LocationCreate = z.infer<typeof LocationCreateSchema>;
export type LocationUpdate = z.infer<typeof LocationUpdateSchema>;
export type LocationList = z.infer<typeof LocationListSchema>;
export type WarehouseInventory = z.infer<typeof WarehouseInventorySchema>;
export type WarehouseStats = z.infer<typeof WarehouseStatsSchema>;
export type StockAlerts = z.infer<typeof StockAlertsSchema>;
export type BulkMoveProducts = z.infer<typeof BulkMoveProductsSchema>;
export type InventoryCount = z.infer<typeof InventoryCountSchema>;
