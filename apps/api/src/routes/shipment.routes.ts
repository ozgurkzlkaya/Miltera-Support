import { createRoute } from "@hono/zod-openapi";
import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import { z } from "../lib/zod";
import ShipmentController from "../controllers/shipment.controller";
import { buildResponseSuccessSchema } from "../helpers/response.helpers";
import {
  ShipmentCreateSchema,
  ShipmentListSchema,
  ShipmentSchema,
  ShipmentUpdateSchema,
  ShipmentStatusUpdateSchema,
} from "../dtos/shipment.dto";
import {
  Error404Schema,
  Error422Schema,
  Error500Schema,
} from "../dtos/base.schema";
import { authMiddleware } from "../helpers/auth.helpers";

const list = createRoute({
  method: "get",
  path: "/",
  request: {
    query: z.object({
      status: z.enum(['PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
      type: z.enum(['SALES', 'SERVICE_RETURN', 'SERVICE_SEND']).optional(),
      companyId: z.string().uuid().optional(),
      issueId: z.string().uuid().optional(),
      search: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ShipmentListSchema),
        },
      },
      description: "List all shipments",
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
          schema: buildResponseSuccessSchema(ShipmentSchema),
        },
      },
      description: "Shipment details",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Shipment not found",
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
          schema: ShipmentCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ShipmentSchema),
        },
      },
      description: "Shipment created successfully",
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
  path: "/:id",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: ShipmentUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ShipmentSchema),
        },
      },
      description: "Shipment updated successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Shipment not found",
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

const updateStatus = createRoute({
  method: "patch",
  path: "/:id/status",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: ShipmentStatusUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ShipmentSchema),
        },
      },
      description: "Shipment status updated successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Shipment not found",
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
  path: "/:id",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    204: {
      description: "Shipment deleted successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Shipment not found",
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

const addItems = createRoute({
  method: "post",
  path: "/:id/items",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            productIds: z.array(z.string().uuid()).min(1),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ShipmentSchema),
        },
      },
      description: "Items added to shipment successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Shipment not found",
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

const updateTracking = createRoute({
  method: "patch",
  path: "/:id/tracking",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            trackingNumber: z.string().optional(),
            estimatedDelivery: z.string().datetime().optional(),
            actualDelivery: z.string().datetime().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ShipmentSchema),
        },
      },
      description: "Tracking information updated successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Shipment not found",
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

const searchByNumber = createRoute({
  method: "get",
  path: "/search/:shipmentNumber",
  request: {
    params: z.object({
      shipmentNumber: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ShipmentSchema),
        },
      },
      description: "Shipment found",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Shipment not found",
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

const searchByTracking = createRoute({
  method: "get",
  path: "/tracking/:trackingNumber",
  request: {
    params: z.object({
      trackingNumber: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ShipmentSchema),
        },
      },
      description: "Shipment found",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Shipment not found",
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

const getStats = createRoute({
  method: "get",
  path: "/stats/overview",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.object({
            totalShipments: z.number(),
            preparingShipments: z.number(),
            shippedShipments: z.number(),
            deliveredShipments: z.number(),
            cancelledShipments: z.number(),
            salesShipments: z.number(),
            serviceShipments: z.number(),
          })),
        },
      },
      description: "Shipment statistics",
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

const shipmentsRoute = createRouter<HonoEnv>()
  .use("*", authMiddleware)
  .openapi(list, ShipmentController.list)
  .openapi(show, ShipmentController.show)
  .openapi(create, ShipmentController.create)
  .openapi(update, ShipmentController.update)
  .openapi(updateStatus, ShipmentController.updateStatus)
  .openapi(destroy, ShipmentController.destroy)
  .openapi(addItems, ShipmentController.addItems)
  .openapi(updateTracking, ShipmentController.updateTracking)
  .openapi(searchByNumber, ShipmentController.searchByNumber)
  .openapi(searchByTracking, ShipmentController.searchByTracking)
  .openapi(getStats, ShipmentController.getStats);

export default shipmentsRoute; 