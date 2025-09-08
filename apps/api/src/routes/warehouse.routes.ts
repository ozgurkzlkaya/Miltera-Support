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
} from "../dtos/warehouse.dto";
import {
  Error404Schema,
  Error422Schema,
  Error500Schema,
} from "../dtos/base.schema";
import { authMiddleware } from "../helpers/auth.helpers";

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

const warehouseRoute = createRouter<HonoEnv>()
  .use("*", authMiddleware)
  // Location routes
  .openapi(listLocations, WarehouseController.listLocations)
  .openapi(showLocation, WarehouseController.showLocation)
  .openapi(createLocation, WarehouseController.createLocation)
  .openapi(updateLocation, WarehouseController.updateLocation)
  // Inventory routes
  .openapi(getInventory, WarehouseController.getInventory)
  .openapi(getLocationInventory, WarehouseController.getLocationInventory)
  // Statistics routes
  .openapi(getStats, WarehouseController.getStats)
  .openapi(getStockAlerts, WarehouseController.getStockAlerts);

export default warehouseRoute;
