import { createRoute } from "@hono/zod-openapi";
import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import { z } from "../lib/zod";
import WarehouseController from "../controllers/warehouse.controller";
import { buildResponseSuccessSchema } from "../helpers/response.helpers";
import {
  LocationCreateSchema,
  LocationListSchema,
  LocationSchema,
  LocationUpdateSchema,
  WarehouseInventorySchema,
  WarehouseStatsSchema,
  StockAlertsSchema,
  BulkMoveProductsSchema,
  InventoryCountSchema,
} from "../dtos/warehouse.dto";
import {
  Error404Schema,
  Error422Schema,
  Error500Schema,
} from "../dtos/base.schema";
import { authMiddleware } from "../helpers/auth.helpers";

// Basic CRUD Routes
const list = createRoute({
  method: "get",
  path: "/",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.array(z.object({}))),
        },
      },
      description: "List warehouse locations",
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
  path: "/locations/:id",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.object({})),
        },
      },
      description: "Warehouse location details",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Location not found",
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
          schema: z.object({}),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.object({})),
        },
      },
      description: "Warehouse location created successfully",
    },
    422: {
      content: {
        "application/json": {
          schema: Error422Schema,
        },
      },
      description: "Unprocessable entity",
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
  path: "/locations/:id",
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({}),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.object({})),
        },
      },
      description: "Warehouse location updated successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Location not found",
    },
    422: {
      content: {
        "application/json": {
          schema: Error422Schema,
        },
      },
      description: "Unprocessable entity",
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
  path: "/locations/:id",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    204: {
      description: "Warehouse location deleted successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Location not found",
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

// Location Routes
const listLocations = createRoute({
  method: "get",
  path: "/locations",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(LocationListSchema),
        },
      },
      description: "List all locations",
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

const showLocation = createRoute({
  method: "get",
  path: "/locations/:id",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(LocationSchema),
        },
      },
      description: "Location details",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Location not found",
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

const createLocation = createRoute({
  method: "post",
  path: "/locations",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LocationCreateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(LocationSchema),
        },
      },
      description: "Location created successfully",
    },
    422: {
      content: {
        "application/json": {
          schema: Error422Schema,
        },
      },
      description: "Unprocessable entity",
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

const updateLocation = createRoute({
  method: "put",
  path: "/locations/:id",
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: LocationUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(LocationSchema),
        },
      },
      description: "Location updated successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Location not found",
    },
    422: {
      content: {
        "application/json": {
          schema: Error422Schema,
        },
      },
      description: "Unprocessable entity",
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

const destroyLocation = createRoute({
  method: "delete",
  path: "/locations/:id",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    204: {
      description: "Location deleted successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Location not found",
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

// Warehouse Inventory Routes
const getInventory = createRoute({
  method: "get",
  path: "/inventory",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(WarehouseInventorySchema),
        },
      },
      description: "Warehouse inventory",
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

const getLocationInventory = createRoute({
  method: "get",
  path: "/locations/:id/inventory",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.array(z.any())),
        },
      },
      description: "Location inventory",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Location not found",
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

// Warehouse Statistics Routes
const getStats = createRoute({
  method: "get",
  path: "/stats",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(WarehouseStatsSchema),
        },
      },
      description: "Warehouse statistics",
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

const getStockAlerts = createRoute({
  method: "get",
  path: "/alerts",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(StockAlertsSchema),
        },
      },
      description: "Stock alerts",
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

const bulkMoveProducts = createRoute({
  method: "post",
  path: "/bulk-move",
  request: {
    body: {
      content: {
        "application/json": {
          schema: BulkMoveProductsSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.array(z.object({
            productId: z.string().uuid(),
            success: z.boolean(),
            message: z.string().optional(),
          }))),
        },
      },
      description: "Bulk move products result",
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

// Location Capacity Management Routes
const updateLocationCapacity = createRoute({
  method: "put",
  path: "/locations/:id/capacity",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            capacity: z.number().int().min(1),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.object({
            success: z.boolean(),
            message: z.string(),
          })),
        },
      },
      description: "Location capacity updated successfully",
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

const getLocationCapacity = createRoute({
  method: "get",
  path: "/locations/:id/capacity",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.object({
            locationId: z.string().uuid(),
            locationName: z.string(),
            current: z.number().int().min(0),
            capacity: z.number().int().min(0),
            available: z.number().int(),
            utilizationRate: z.number(),
            status: z.enum(['OK', 'WARNING', 'FULL']),
          })),
        },
      },
      description: "Location capacity information",
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

const getAllLocationCapacities = createRoute({
  method: "get",
  path: "/locations/capacities",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.array(z.object({
            locationId: z.string().uuid(),
            locationName: z.string(),
            current: z.number().int().min(0),
            capacity: z.number().int().min(0),
            available: z.number().int(),
            utilizationRate: z.number(),
            status: z.enum(['OK', 'WARNING', 'FULL']),
          }))),
        },
      },
      description: "All location capacities",
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

// Analytics Routes
const getWarehouseAnalytics = createRoute({
  method: "get",
  path: "/analytics",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.object({
            totalStats: z.object({
              totalLocations: z.number().int().min(0),
              usedLocations: z.number().int().min(0),
              totalStockProducts: z.number().int().min(0),
              totalCustomerProducts: z.number().int().min(0),
              statusStats: z.array(z.object({
                status: z.string(),
                count: z.number().int().min(0),
              })),
            }),
            locationAnalytics: z.array(z.object({
              locationId: z.string().uuid(),
              locationName: z.string(),
              current: z.number().int().min(0),
              capacity: z.number().int().min(0),
              available: z.number().int(),
              utilizationRate: z.number(),
              status: z.enum(['OK', 'WARNING', 'FULL']),
            })),
            productStatusAnalytics: z.array(z.object({
              status: z.string(),
              count: z.number().int().min(0),
            })),
            manufacturerAnalytics: z.array(z.object({
              manufacturerId: z.string().uuid(),
              manufacturerName: z.string(),
              count: z.number().int().min(0),
            })),
            monthlyTrends: z.array(z.object({
              month: z.string(),
              count: z.number().int().min(0),
            })),
            topLocations: z.array(z.object({
              locationId: z.string().uuid(),
              locationName: z.string(),
              count: z.number().int().min(0),
            })),
          })),
        },
      },
      description: "Warehouse analytics data",
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

const getWarehousePerformanceReport = createRoute({
  method: "get",
  path: "/performance-report",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.object({
            performanceMetrics: z.object({
              totalLocations: z.number().int().min(0),
              usedLocations: z.number().int().min(0),
              utilizationRate: z.number(),
              totalProducts: z.number().int().min(0),
              averageProductsPerLocation: z.number(),
            }),
            capacityAnalysis: z.array(z.object({
              locationId: z.string().uuid(),
              locationName: z.string(),
              current: z.number().int().min(0),
              capacity: z.number().int().min(0),
              available: z.number().int(),
              utilizationRate: z.number(),
              status: z.enum(['OK', 'WARNING', 'FULL']),
              efficiency: z.number(),
            })),
            recommendations: z.array(z.object({
              type: z.enum(['error', 'warning', 'info']),
              message: z.string(),
              priority: z.enum(['low', 'medium', 'high']),
            })),
            analytics: z.any(), // Full analytics object
          })),
        },
      },
      description: "Warehouse performance report",
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

const getInventoryCountHistory = createRoute({
  method: "get",
  path: "/inventory-count-history",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.array(z.object({
            id: z.string().uuid(),
            locationId: z.string().uuid(),
            locationName: z.string(),
            countedBy: z.string().uuid(),
            countedByUser: z.object({
              id: z.string().uuid(),
              firstName: z.string(),
              lastName: z.string(),
              email: z.string().email(),
            }),
            countedItems: z.array(z.object({
              productId: z.string().uuid(),
              success: z.boolean(),
              expectedQuantity: z.number().int().min(0),
              actualQuantity: z.number().int().min(0),
              difference: z.number().int(),
              notes: z.string().optional(),
            })),
            totalItems: z.number().int().min(0),
            completedAt: z.string().datetime(),
            createdAt: z.string().datetime(),
          }))),
        },
      },
      description: "Inventory count history retrieved successfully",
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

const inventoryCount = createRoute({
  method: "post",
  path: "/inventory-count",
  request: {
    body: {
      content: {
        "application/json": {
          schema: InventoryCountSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.array(z.object({
            productId: z.string().uuid(),
            success: z.boolean(),
            expectedQuantity: z.number(),
            actualQuantity: z.number(),
            difference: z.number(),
            error: z.string().optional(),
          }))),
        },
      },
      description: "Inventory count result",
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

const warehouseRoute = createRouter<HonoEnv>()
  .openapi(list, WarehouseController.list)
  .openapi(show, WarehouseController.show)
  .openapi(create, WarehouseController.create)
  .openapi(update, WarehouseController.update)
  .openapi(destroy, WarehouseController.destroy)
  .openapi(listLocations, WarehouseController.listLocations)
  .openapi(showLocation, WarehouseController.showLocation)
  .openapi(createLocation, WarehouseController.createLocation)
  .openapi(updateLocation, WarehouseController.updateLocation)
  .openapi(destroyLocation, WarehouseController.destroyLocation)
  .openapi(getInventory, WarehouseController.getInventory)
  .openapi(getLocationInventory, WarehouseController.getLocationInventory)
  .openapi(getStats, WarehouseController.getStats)
  .openapi(getStockAlerts, WarehouseController.getStockAlerts)
  .openapi(bulkMoveProducts, WarehouseController.bulkMoveProducts)
  .openapi(inventoryCount, WarehouseController.inventoryCount)
  .openapi(updateLocationCapacity, WarehouseController.updateLocationCapacity)
  .openapi(getLocationCapacity, WarehouseController.getLocationCapacity)
  .openapi(getAllLocationCapacities, WarehouseController.getAllLocationCapacities)
  .openapi(getWarehouseAnalytics, WarehouseController.getWarehouseAnalytics)
  .openapi(getWarehousePerformanceReport, WarehouseController.getWarehousePerformanceReport)
  .openapi(getInventoryCountHistory, WarehouseController.getInventoryCountHistory);

export default warehouseRoute;
