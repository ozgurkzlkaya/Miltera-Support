import { createRoute } from "@hono/zod-openapi";
import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import { z } from "../lib/zod";
import ProductController from "../controllers/product.controller";
import { buildResponseSuccessSchema } from "../helpers/response.helpers";
import {
  ProductCreateBulkSchema,
  ProductCreateSchema,
  ProductListSchema,
  ProductSchema,
  ProductUpdateSchema,
} from "../dtos/product.dto";
import {
  Error404Schema,
  Error422Schema,
  Error500Schema,
} from "../dtos/base.schema";
import { authMiddleware } from "../helpers/auth.helpers";
import { db } from "../db";
import { products, productHistory, issues, serviceOperations } from "../db/schema";
import { eq } from "drizzle-orm";
import * as XLSX from 'xlsx';

const list = createRoute({
  method: "get",
  path: "/",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ProductListSchema),
        },
      },
      description: "List all products",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

const show = createRoute({
  method: "get",
  path: "/:id",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ProductSchema),
        },
      },
      description: "Product found",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Product not found",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

const create = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ProductCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ProductSchema),
        },
      },
      description: "Product created successfully",
    },
    422: {
      content: {
        "application/json": {
          schema: Error422Schema,
        },
      },
      description: "Validation error",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

const update = createRoute({
  method: "put",
  path: "/:id",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: ProductUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ProductSchema),
        },
      },
      description: "Product updated successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Product not found",
    },
    422: {
      content: {
        "application/json": {
          schema: Error422Schema,
        },
      },
      description: "Validation error",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

const destroy = createRoute({
  method: "delete",
  path: "/:id",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    204: {
      description: "Product deleted successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Product not found",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

const hardwareVerification = createRoute({
  method: "post",
  path: "/:id/hardware-verification",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            findings: z.string().optional(),
            actionsTaken: z.string().optional(),
            status: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ProductSchema),
        },
      },
      description: "Hardware verification completed",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Product not found",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

const productsRoute = createRouter<HonoEnv>()
  // .use("*", authMiddleware) // Geçici olarak devre dışı
  .openapi(list, ProductController.list)
  .openapi(show, ProductController.show)
  .openapi(create, ProductController.create)
  .openapi(update, ProductController.update)
  .openapi(destroy, ProductController.destroy)
  .openapi(hardwareVerification, ProductController.hardwareVerification)
  .post("/export", async (c) => {
    try {
      console.log("Export endpoint called");
      
      // Get query parameters safely
      const url = new URL(c.req.url);
      const format = url.searchParams.get('format') || 'excel';
      const status = url.searchParams.get('status') || '';
      const dateFrom = url.searchParams.get('dateFrom') || '';
      const dateTo = url.searchParams.get('dateTo') || '';
      
      console.log("Export params:", { format, status, dateFrom, dateTo });
      
      // Get products with filters
      let query = db.select().from(products);
      
      if (status && status !== '') {
        query = query.where(eq(products.status, status as any));
      }
      
      const allProducts = await query;
      console.log("Found products:", allProducts.length);
      
      // Convert to export format
      if (format === "excel") {
        const worksheet = XLSX.utils.json_to_sheet(allProducts.map(p => ({
          id: p.id,
          serialNumber: p.serialNumber,
          status: p.status,
          productionDate: p.productionDate,
          warrantyStart: p.warrantyStart,
          warrantyEnd: p.warrantyEnd,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })));
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
        
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
        
        c.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        c.header("Content-Disposition", "attachment; filename=products.xlsx");
        
        return c.body(buffer);
      } else if (format === "csv") {
        const csv = allProducts.map(p => 
          `${p.id},${p.serialNumber},${p.status},${p.productionDate},${p.warrantyStart},${p.warrantyEnd},${p.createdAt},${p.updatedAt}`
        ).join('\n');
        
        c.header("Content-Type", "text/csv");
        c.header("Content-Disposition", "attachment; filename=products.csv");
        
        return c.text(csv);
      }
      
      return c.json({ success: false, error: "Unsupported format" }, 400);
    } catch (error) {
      console.error("Export error:", error);
      return c.json({ success: false, error: "Export failed" }, 500);
    }
  })
  .post("/import", async (c) => {
    try {
      const formData = await c.req.formData();
      const file = formData.get("file") as File;
      const format = formData.get("format") as string || "excel";
      
      if (!file) {
        return c.json({ success: false, error: "No file provided" }, 400);
      }
      
      const buffer = await file.arrayBuffer();
      let data: any[] = [];
      
      if (format === "excel") {
        const workbook = XLSX.read(buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(worksheet);
      } else if (format === "csv") {
        const text = new TextDecoder().decode(buffer);
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        data = lines.slice(1).map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim();
            return obj;
          }, {} as any);
        });
      }
      
      let imported = 0;
      const errors: string[] = [];
      
      for (const item of data) {
        try {
          await db.insert(products).values({
            serialNumber: item.serialNumber || `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            status: item.status || "FIRST_PRODUCTION",
            productionDate: item.productionDate ? new Date(item.productionDate) : new Date(),
            warrantyStart: item.warrantyStart ? new Date(item.warrantyStart) : new Date(),
            warrantyEnd: item.warrantyEnd ? new Date(item.warrantyEnd) : new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          imported++;
        } catch (error) {
          errors.push(`Failed to import ${item.serialNumber}: ${error}`);
        }
      }
      
      return c.json({ success: true, data: { imported, errors } });
    } catch (error) {
      console.error("Import error:", error);
      return c.json({ success: false, error: "Import failed" }, 500);
    }
  })
  .delete("/delete/:id", async (c) => {
    const id = c.req.param("id");
    console.log('Delete route: Attempting to delete product:', id);
    
    try {
      // Check for related records first
      const relatedIssues = await db.select().from(issues).where(eq(issues.productId, id)).limit(1);
      const relatedOperations = await db.select().from(serviceOperations).where(eq(serviceOperations.productId, id)).limit(1);
      
      if (relatedIssues.length > 0 || relatedOperations.length > 0) {
        return c.json({ 
          success: false, 
          error: 'Cannot delete product: There are related records that cannot be automatically deleted. Please delete related issues and service operations first.' 
        }, 409);
      }
      
      // Delete product history first
      await db.delete(productHistory).where(eq(productHistory.productId, id));
      
      // Then delete the product
      const deletedProduct = await db.delete(products).where(eq(products.id, id)).returning();
      
      if (deletedProduct.length === 0) {
        return c.json({ success: false, error: 'Product not found' }, 404);
      }
      
      console.log('Product deleted successfully:', deletedProduct[0]);
      return c.json({ success: true, data: deletedProduct[0] });
    } catch (error: any) {
      console.error('Delete error:', error);
      
      // Handle foreign key constraint violations
      if (error.code === '23503') {
        return c.json({ 
          success: false, 
          error: 'Cannot delete product: There are related records that cannot be automatically deleted. Please delete related issues and service operations first.' 
        }, 409);
      }
      
      return c.json({ success: false, error: 'Internal server error' }, 500);
    }
  });

export default productsRoute;