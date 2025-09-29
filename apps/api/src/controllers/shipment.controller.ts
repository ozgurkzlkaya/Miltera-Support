import { db } from "../db";
import { createControllerAction } from "./base.controller";
import { ResponseHandler } from "../helpers/response.helpers";
import type { HonoEnv } from "../config/env";
import { shipments } from "../db/schema";
import { eq } from "drizzle-orm";
import { ShipmentService } from "../services/shipment.service";

const list = createControllerAction<HonoEnv>(async (c) => {
  try {
    const query = await c.validateRequest("rawQuery", (v) => v);
    const shipmentService = new ShipmentService();
    
    // Get shipments from database using service
    const result = await shipmentService.getShipments(query, query.page || 1, query.limit || 20);
    
    return c.responseJSON(ResponseHandler.success(result));
  } catch (error) {
    console.error('Error getting shipments:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const show = createControllerAction<HonoEnv>("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const shipmentService = new ShipmentService();
    
    // Get shipment from database using service
    const shipment = await shipmentService.getShipmentById(id);
    
    if (!shipment) {
      return c.responseJSON(ResponseHandler.error('NOT_FOUND', 'Shipment not found', 404));
    }
    
    return c.responseJSON(ResponseHandler.success(shipment));
  } catch (error) {
    console.error('Error getting shipment:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const create = createControllerAction<HonoEnv>(async (c) => {
  try {
    const body = await c.req.json();
    const shipmentService = new ShipmentService();
    
    // Create shipment using service
    const shipment = await shipmentService.createShipment({
      ...body,
      createdBy: 'ce2a6761-82e3-48ba-af33-2f49b4b73e35' // Default user ID
    });
    
    return c.responseJSON(ResponseHandler.success(shipment));
  } catch (error) {
    console.error('Error creating shipment:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const update = createControllerAction<HonoEnv>("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const shipmentService = new ShipmentService();
    
    // Update shipment using service
    const shipment = await shipmentService.updateShipment({
      ...body,
      shipmentId: id,
      updatedBy: 'ce2a6761-82e3-48ba-af33-2f49b4b73e35' // Default user ID
    });
    
    return c.responseJSON(ResponseHandler.success(shipment));
  } catch (error) {
    console.error('Error updating shipment:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const destroy = createControllerAction<HonoEnv>("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const shipmentService = new ShipmentService();
    
    // Real deletion using service
    const result = await shipmentService.deleteShipment(id);
    return c.responseJSON(ResponseHandler.success(result));
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const updateStatus = createControllerAction<HonoEnv>("/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const shipmentService = new ShipmentService();
    
    // Update shipment status using service
    const shipment = await shipmentService.updateShipmentStatus({
      ...body,
      shipmentId: id,
      updatedBy: 'ce2a6761-82e3-48ba-af33-2f49b4b73e35' // Default user ID
    });
    
    return c.responseJSON(ResponseHandler.success(shipment));
  } catch (error) {
    console.error('Error updating shipment status:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const getStats = createControllerAction<HonoEnv>(async (c) => {
  try {
    const shipmentService = new ShipmentService();
    
    // Get shipment statistics using service
    const stats = await shipmentService.getShipmentStats();
    
    return c.responseJSON(ResponseHandler.success(stats));
  } catch (error) {
    console.error('Error getting shipment stats:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const ShipmentController = { list, show, create, update, updateStatus, destroy, getStats };

export default ShipmentController;