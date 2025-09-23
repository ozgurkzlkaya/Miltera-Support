import { db } from "../db";
import { createControllerAction } from "./base.controller";
import { ResponseHandler } from "../helpers/response.helpers";
import type { HonoEnv } from "../config/env";
import { issueCategories } from "../db/schema";
import { eq } from "drizzle-orm";

const list = createControllerAction<HonoEnv>(async (c) => {
  try {
    // Get categories from database
    const categories = await db.select().from(issueCategories);
    
    return c.responseJSON(ResponseHandler.success(categories));
  } catch (error) {
    console.error('Error getting categories:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const show = createControllerAction<HonoEnv>("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Get category from database
    const category = await db.select().from(issueCategories).where(eq(issueCategories.id, id)).limit(1);
    
    if (category.length === 0) {
      return c.responseJSON(ResponseHandler.error('NOT_FOUND', 'Category not found', 404));
    }
    
    return c.responseJSON(ResponseHandler.success(category[0]));
  } catch (error) {
    console.error('Error getting category:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const create = createControllerAction<HonoEnv>(async (c) => {
  try {
    const body = await c.req.json();
    
    // Create category in database
    const category = await db.insert(issueCategories).values(body).returning();
    
    return c.responseJSON(ResponseHandler.success(category[0]));
  } catch (error) {
    console.error('Error creating category:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const update = createControllerAction<HonoEnv>("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    // Update category in database
    const category = await db.update(issueCategories).set(body).where(eq(issueCategories.id, id)).returning();
    
    if (category.length === 0) {
      return c.responseJSON(ResponseHandler.error('NOT_FOUND', 'Category not found', 404));
    }
    
    return c.responseJSON(ResponseHandler.success(category[0]));
  } catch (error) {
    console.error('Error updating category:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const destroy = createControllerAction<HonoEnv>("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Delete category from database
    await db.delete(issueCategories).where(eq(issueCategories.id, id));
    
    return c.responseJSON(ResponseHandler.success(null));
  } catch (error) {
    console.error('Error deleting category:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const CategoryController = { list, show, create, update, destroy };

export default CategoryController;
