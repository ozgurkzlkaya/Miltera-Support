import { db } from "../db";
import { createControllerAction } from "./base.controller";
import { ResponseHandler } from "../helpers/response.helpers";
import type { HonoEnv } from "../config/env";
import { locations } from "../db/schema";
import { eq } from "drizzle-orm";

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

const show = createControllerAction<HonoEnv>("/:id", async (c) => {
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

const update = createControllerAction<HonoEnv>("/:id", async (c) => {
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

const destroy = createControllerAction<HonoEnv>("/:id", async (c) => {
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

const WarehouseController = { list, show, create, update, destroy };

export default WarehouseController;