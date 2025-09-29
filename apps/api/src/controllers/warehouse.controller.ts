import { db } from "../db";
import { createControllerAction } from "./base.controller";
import { ResponseHandler } from "../helpers/response.helpers";
import type { HonoEnv } from "../config/env";
import { locations } from "../db/schema";
import { eq } from "drizzle-orm";
import { WarehouseService } from "../services/warehouse.service";

const list = createControllerAction<HonoEnv>(async (c) => {
  try {
    const query = await c.validateRequest("rawQuery", (v) => v);
    
    // Get locations from database
    const warehouseLocations = await db.select().from(locations);
    
    return c.responseJSON(ResponseHandler.success(warehouseLocations));
    } catch (error) {
    console.error('Error getting warehouse locations:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const show = createControllerAction<HonoEnv>("/locations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Get location from database
    const location = await db.select().from(locations).where(eq(locations.id, id)).limit(1);
    
    if (location.length === 0) {
      return c.responseJSON(ResponseHandler.error('NOT_FOUND', 'Location not found', 404));
    }
    
    return c.responseJSON(ResponseHandler.success(location[0]));
    } catch (error) {
    console.error('Error getting warehouse location:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const create = createControllerAction<HonoEnv>(async (c) => {
  try {
    const body = await c.req.json();
    
    // Create location in database
    const location = await db.insert(locations).values(body).returning();
    
    return c.responseJSON(ResponseHandler.success(location[0]));
    } catch (error) {
    console.error('Error creating warehouse location:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const update = createControllerAction<HonoEnv>("/locations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    // Update location in database
    const location = await db.update(locations).set(body).where(eq(locations.id, id)).returning();
    
    if (location.length === 0) {
      return c.responseJSON(ResponseHandler.error('NOT_FOUND', 'Location not found', 404));
    }
    
    return c.responseJSON(ResponseHandler.success(location[0]));
  } catch (error) {
    console.error('Error updating warehouse location:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const destroy = createControllerAction<HonoEnv>("/locations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Delete location from database
    await db.delete(locations).where(eq(locations.id, id));
    
    return c.responseJSON(ResponseHandler.success(null));
    } catch (error) {
    console.error('Error deleting warehouse location:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
    }
});

// Inventory endpoints
const getInventory = createControllerAction<HonoEnv>(async (c) => {
    try {
    const warehouseService = new WarehouseService();
      const inventory = await warehouseService.getWarehouseInventory();
    
    return c.responseJSON(ResponseHandler.success(inventory));
    } catch (error) {
    console.error('Error getting warehouse inventory:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
    }
});

const getLocationInventory = createControllerAction<HonoEnv>("/locations/:id/inventory", async (c) => {
    try {
    const id = c.req.param("id");
    const warehouseService = new WarehouseService();
      const inventory = await warehouseService.getLocationInventory(id);
    
    return c.responseJSON(ResponseHandler.success(inventory));
    } catch (error) {
      console.error('Error getting location inventory:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
    }
});

const getStats = createControllerAction<HonoEnv>(async (c) => {
    try {
    const warehouseService = new WarehouseService();
      const stats = await warehouseService.getWarehouseStats();
    
    return c.responseJSON(ResponseHandler.success(stats));
    } catch (error) {
      console.error('Error getting warehouse stats:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
    }
});

const getStockAlerts = createControllerAction<HonoEnv>(async (c) => {
    try {
    const warehouseService = new WarehouseService();
      const alerts = await warehouseService.getStockAlerts();
    
    return c.responseJSON(ResponseHandler.success(alerts));
    } catch (error) {
      console.error('Error getting stock alerts:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const bulkMoveProducts = createControllerAction<HonoEnv>(async (c) => {
  try {
    const body = await c.req.json();
    const { productIds, targetLocationId, movedBy, reason } = body;
    
    const warehouseService = new WarehouseService();
    const result = await warehouseService.bulkMoveProducts({
      productIds,
      targetLocationId,
      movedBy,
      reason
    });
    
    return c.responseJSON(ResponseHandler.success(result));
  } catch (error) {
    console.error('Error in bulk move products:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const inventoryCount = createControllerAction<HonoEnv>(async (c) => {
  try {
    const body = await c.req.json();
    const { locationId, countedBy, countedItems } = body;
    
    const warehouseService = new WarehouseService();
    const result = await warehouseService.performInventoryCount({
      locationId,
      countedBy,
      countedItems
    });
    
    return c.responseJSON(ResponseHandler.success(result));
  } catch (error) {
    console.error('Error in inventory count:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const updateLocationCapacity = createControllerAction<HonoEnv>("/locations/:id/capacity", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { capacity } = body;

    const warehouseService = new WarehouseService();
    const result = await warehouseService.updateLocationCapacity(id, capacity);

    return c.responseJSON(ResponseHandler.success(result));
  } catch (error) {
    console.error('Error updating location capacity:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const getLocationCapacity = createControllerAction<HonoEnv>("/locations/:id/capacity", async (c) => {
  try {
    const id = c.req.param("id");
    
    const warehouseService = new WarehouseService();
    const result = await warehouseService.checkLocationCapacity(id);

    return c.responseJSON(ResponseHandler.success(result));
  } catch (error) {
    console.error('Error getting location capacity:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const getAllLocationCapacities = createControllerAction<HonoEnv>(async (c) => {
  try {
    const warehouseService = new WarehouseService();
    const result = await warehouseService.getAllLocationCapacities();

    return c.responseJSON(ResponseHandler.success(result));
  } catch (error) {
    console.error('Error getting all location capacities:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const getWarehouseAnalytics = createControllerAction<HonoEnv>(async (c) => {
  try {
    const warehouseService = new WarehouseService();
    const result = await warehouseService.getWarehouseAnalytics();

    return c.responseJSON(ResponseHandler.success(result));
  } catch (error) {
    console.error('Error getting warehouse analytics:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const getWarehousePerformanceReport = createControllerAction<HonoEnv>(async (c) => {
  try {
    const warehouseService = new WarehouseService();
    const result = await warehouseService.getWarehousePerformanceReport();

    return c.responseJSON(ResponseHandler.success(result));
  } catch (error) {
    console.error('Error getting warehouse performance report:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const getInventoryCountHistory = createControllerAction<HonoEnv>(async (c) => {
  try {
    const locationId = c.req.query('locationId');
    const limit = parseInt(c.req.query('limit') || '20');
    
    const warehouseService = new WarehouseService();
    const history = await warehouseService.getInventoryCountHistory(locationId, limit);
    
    return c.responseJSON(ResponseHandler.success(history));
  } catch (error) {
    console.error('Error getting inventory count history:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

// Location specific methods
const listLocations = createControllerAction<HonoEnv>(async (c) => {
  try {
    const warehouseLocations = await db.select().from(locations);
    return c.responseJSON(ResponseHandler.success(warehouseLocations));
  } catch (error) {
    console.error('Error getting locations:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const showLocation = createControllerAction<HonoEnv>("/locations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const location = await db.select().from(locations).where(eq(locations.id, id)).limit(1);
    
    if (location.length === 0) {
      return c.responseJSON(ResponseHandler.error('NOT_FOUND', 'Location not found', 404));
    }
    
    return c.responseJSON(ResponseHandler.success(location[0]));
  } catch (error) {
    console.error('Error getting location:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const createLocation = createControllerAction<HonoEnv>(async (c) => {
  try {
    const body = await c.req.json();
    const location = await db.insert(locations).values(body).returning();
    return c.responseJSON(ResponseHandler.success(location[0]));
  } catch (error) {
    console.error('Error creating location:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const updateLocation = createControllerAction<HonoEnv>("/locations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const location = await db.update(locations).set(body).where(eq(locations.id, id)).returning();
    
    if (location.length === 0) {
      return c.responseJSON(ResponseHandler.error('NOT_FOUND', 'Location not found', 404));
    }
    
    return c.responseJSON(ResponseHandler.success(location[0]));
    } catch (error) {
    console.error('Error updating location:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const destroyLocation = createControllerAction<HonoEnv>("/locations/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db.delete(locations).where(eq(locations.id, id));
    return c.responseJSON(ResponseHandler.success(null));
    } catch (error) {
    console.error('Error deleting location:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const WarehouseController = { 
  list, 
  show, 
  create, 
  update, 
  destroy,
  listLocations,
  showLocation,
  createLocation,
  updateLocation,
  destroyLocation,
  getInventory,
  getLocationInventory,
  getStats,
  getStockAlerts,
  bulkMoveProducts,
  inventoryCount,
  updateLocationCapacity,
  getLocationCapacity,
  getAllLocationCapacities,
  getWarehouseAnalytics,
  getWarehousePerformanceReport,
  getInventoryCountHistory
};

export default WarehouseController;
