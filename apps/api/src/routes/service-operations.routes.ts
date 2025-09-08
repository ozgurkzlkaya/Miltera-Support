import { createRoute } from "@hono/zod-openapi";
import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import { z } from "../lib/zod";
import ServiceOperationsController from "../controllers/service-operations.controller";
import { buildResponseSuccessSchema } from "../helpers/response.helpers";
import {
  ServiceOperationCreateSchema,
  ServiceOperationListSchema,
  ServiceOperationSchema,
  ServiceOperationUpdateSchema,
  ServiceWorkflowSchema,
  RepairSummarySchema,
  ServiceOperationStatsSchema,
  TechnicianPerformanceSchema,
} from "../dtos/service-operations.dto";
import {
  Error404Schema,
  Error422Schema,
  Error500Schema,
} from "../dtos/base.schema";
import { authMiddleware } from "../helpers/auth.helpers";

// Service Operations Routes
const listOperations = createRoute({
  method: "get",
  path: "/",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ServiceOperationListSchema),
        },
      },
      description: "List all service operations",
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

const showOperation = createRoute({
  method: "get",
  path: "/:id",
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ServiceOperationSchema),
        },
      },
      description: "Service operation details",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Service operation not found",
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

const createOperation = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ServiceOperationCreateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ServiceOperationSchema),
        },
      },
      description: "Service operation created successfully",
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

const updateOperation = createRoute({
  method: "put",
  path: "/:id",
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: ServiceOperationUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ServiceOperationSchema),
        },
      },
      description: "Service operation updated successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Service operation not found",
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

// Service Workflow Routes
const createWorkflow = createRoute({
  method: "post",
  path: "/workflow",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ServiceWorkflowSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.array(ServiceOperationSchema)),
        },
      },
      description: "Service workflow created successfully",
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

const createRepairSummary = createRoute({
  method: "post",
  path: "/repair-summary",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RepairSummarySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ServiceOperationSchema),
        },
      },
      description: "Repair summary created successfully",
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

// Statistics and Reports Routes
const getStats = createRoute({
  method: "get",
  path: "/stats",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ServiceOperationStatsSchema),
        },
      },
      description: "Service operation statistics",
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

const getTechnicianPerformance = createRoute({
  method: "get",
  path: "/technician-performance",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(TechnicianPerformanceSchema),
        },
      },
      description: "Technician performance report",
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

const getNonWarrantyOperations = createRoute({
  method: "get",
  path: "/non-warranty",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.array(ServiceOperationSchema)),
        },
      },
      description: "Non-warranty operations",
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

const serviceOperationsRoute = createRouter<HonoEnv>()
  .use("*", authMiddleware)
  // Basic CRUD operations
  .openapi(listOperations, ServiceOperationsController.list)
  .openapi(showOperation, ServiceOperationsController.show)
  .openapi(createOperation, ServiceOperationsController.create)
  .openapi(updateOperation, ServiceOperationsController.update)
  // Workflow operations
  .openapi(createWorkflow, ServiceOperationsController.createWorkflow)
  .openapi(createRepairSummary, ServiceOperationsController.createRepairSummary)
  // Statistics and reports
  .openapi(getStats, ServiceOperationsController.getStats)
  .openapi(getTechnicianPerformance, ServiceOperationsController.getTechnicianPerformance)
  .openapi(getNonWarrantyOperations, ServiceOperationsController.getNonWarrantyOperations);

export default serviceOperationsRoute;
