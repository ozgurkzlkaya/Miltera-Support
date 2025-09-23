import { db } from "../db";
import { createControllerAction } from "./base.controller";
import { ResponseHandler } from "../helpers/response.helpers";
import { ProductService } from "../services/product.service";
import type { HonoEnv } from "../config/env";

const productService = new ProductService();

const list = createControllerAction<HonoEnv>(async (c) => {
  try {
    const query = await c.validateRequest("rawQuery", (v) => v);
    
    const products = await productService.getProductsForList();
    
    return c.responseJSON(ResponseHandler.success(products));
  } catch (error) {
    console.error('Error getting products:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const show = createControllerAction<HonoEnv>("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const product = await productService.getProduct(id);
    
    return c.responseJSON(ResponseHandler.success(product));
  } catch (error) {
    console.error('Error getting product:', error);
    return c.responseJSON(ResponseHandler.error('NOT_FOUND', 'Product not found', 404));
  }
});

const create = createControllerAction<HonoEnv>(async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate request body
    const { productModelId, quantity, productionDate, locationId, createdBy } = body;
    
    if (!productModelId || !quantity || !productionDate || !createdBy) {
      return c.responseJSON(ResponseHandler.error('VALIDATION_ERROR', 'Missing required fields', 400));
    }
    
    const product = await productService.createProducts(body);
    
    return c.responseJSON(ResponseHandler.success(product));
  } catch (error) {
    console.error('Error creating product:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', (error as Error).message || 'Internal server error', 500));
  }
});

const update = createControllerAction<HonoEnv>("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const product = await productService.updateProduct(id, body);
    
    return c.responseJSON(ResponseHandler.success(product));
  } catch (error) {
    console.error('Error updating product:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const destroy = createControllerAction<HonoEnv>("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    await productService.deleteProduct(id);
    
    return c.responseJSON(ResponseHandler.success(null));
  } catch (error) {
    console.error('Error deleting product:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_ERROR', 'Internal server error', 500));
  }
});

const ProductController = { list, show, create, update, destroy };

export default ProductController;