import { createControllerAction } from "./base.controller";
import { WarehouseService } from "../services/warehouse.service";
import { createSuccessResponse, createErrorResponse } from "../helpers/response.helpers";
import type { HonoEnv } from "../config/env";
import type { 
  LocationCreate, 
  LocationUpdate, 
  WarehouseInventory, 
  WarehouseStats, 
  StockAlerts,
  BulkMoveProducts,
  InventoryCount 
} from "../dtos/warehouse.dto";

const warehouseService = new WarehouseService();

const WarehouseController = {
  // Location Management
  listLocations: createControllerAction(async (c) => {
    try {
      const locations = await warehouseService.getLocations();
      return c.responseJSON(createSuccessResponse(locations));
    } catch (error) {
      console.error('Error listing locations:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  showLocation: createControllerAction(async (c) => {
    try {
      const { id } = c.req.param();
      const location = await warehouseService.getLocationById(id);
      
      if (!location) {
        return c.responseJSON(createErrorResponse(404, 'Location not found'));
      }
      
      return c.responseJSON(createSuccessResponse(location));
    } catch (error) {
      console.error('Error showing location:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  createLocation: createControllerAction(async (c) => {
    try {
      const body = await c.req.json() as LocationCreate;
      const location = await warehouseService.createLocation(body);
      return c.responseJSON(createSuccessResponse(location));
    } catch (error) {
      console.error('Error creating location:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  updateLocation: createControllerAction(async (c) => {
    try {
      const { id } = c.req.param();
      const body = await c.req.json() as LocationUpdate;
      const location = await warehouseService.updateLocation({
        locationId: id,
        ...body
      });
      
      if (!location) {
        return c.responseJSON(createErrorResponse(404, 'Location not found'));
      }
      
      return c.responseJSON(createSuccessResponse(location));
    } catch (error) {
      console.error('Error updating location:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  // Inventory Management
  getInventory: createControllerAction(async (c) => {
    try {
      const inventory = await warehouseService.getWarehouseInventory();
      return c.responseJSON(createSuccessResponse(inventory));
    } catch (error) {
      console.error('Error getting inventory:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  getLocationInventory: createControllerAction(async (c) => {
    try {
      const { id } = c.req.param();
      const inventory = await warehouseService.getLocationInventory(id);
      return c.responseJSON(createSuccessResponse(inventory));
    } catch (error) {
      console.error('Error getting location inventory:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  // Statistics
  getStats: createControllerAction(async (c) => {
    try {
      const stats = await warehouseService.getWarehouseStats();
      return c.responseJSON(createSuccessResponse(stats));
    } catch (error) {
      console.error('Error getting warehouse stats:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  getStockAlerts: createControllerAction(async (c) => {
    try {
      const alerts = await warehouseService.getStockAlerts();
      return c.responseJSON(createSuccessResponse(alerts));
    } catch (error) {
      console.error('Error getting stock alerts:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  // Additional warehouse operations
  bulkMoveProducts: createControllerAction(async (c) => {
    try {
      const body = await c.req.json() as BulkMoveProducts;
      const result = await warehouseService.bulkMoveProducts(body);
      return c.responseJSON(createSuccessResponse(result));
    } catch (error) {
      console.error('Error moving products:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  performInventoryCount: createControllerAction(async (c) => {
    try {
      const body = await c.req.json() as InventoryCount;
      const result = await warehouseService.performInventoryCount(body);
      return c.responseJSON(createSuccessResponse(result));
    } catch (error) {
      console.error('Error performing inventory count:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),
};

export default WarehouseController;
