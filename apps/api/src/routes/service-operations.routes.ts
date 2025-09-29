import { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute, z } from "@hono/zod-openapi";
import ServiceOperationsController from "../controllers/service-operations.controller";
import type { HonoEnv } from "../config/env";
// import { authMiddleware } from "../middlewares/auth.middleware";

// Response helper functions
const buildResponseSuccessSchema = (dataSchema: any) => z.object({
  success: z.literal(true),
  data: dataSchema,
  meta: z.record(z.any()).optional(),
});

const Error400Schema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

const Error404Schema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

const Error500Schema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

import {
  ServiceOperationCreateSchema,
  ServiceOperationUpdateSchema,
  ServiceWorkflowSchema,
} from "../dtos/service-operations.dto";

// Basic service operation schema
const ServiceOperationSchema = z.object({
  id: z.string(),
  issueId: z.string().nullable(),
  productId: z.string(),
  issueProductId: z.string().nullable(),
  technicianId: z.string(),
  operationType: z.string(),
  status: z.string(),
  description: z.string(),
  findings: z.string().nullable(),
  actionsTaken: z.string().nullable(),
  isUnderWarranty: z.boolean(),
  cost: z.string().nullable(),
  duration: z.number().nullable(),
  operationDate: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  performedBy: z.string(),
});

// Create service operation route
const createServiceOperationRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Service Operations'],
  summary: 'Create a new service operation',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ServiceOperationCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(ServiceOperationSchema),
        },
      },
      description: 'Service operation created successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: Error400Schema,
        },
      },
      description: 'Bad request',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
});

// Get service operations route
const getServiceOperationsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Service Operations'],
  summary: 'Get all service operations',
  request: {
    query: z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(z.array(ServiceOperationSchema)),
        },
      },
      description: 'Service operations retrieved successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
});

// Get service operation by ID route
const getServiceOperationRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Service Operations'],
  summary: 'Get service operation by ID',
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(ServiceOperationSchema),
        },
      },
      description: 'Service operation retrieved successfully',
    },
    404: {
      content: {
        'application/json': {
          schema: Error404Schema,
        },
      },
      description: 'Service operation not found',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
});

// Update service operation route
const updateServiceOperationRoute = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Service Operations'],
  summary: 'Update service operation',
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: ServiceOperationUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(ServiceOperationSchema),
        },
      },
      description: 'Service operation updated successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: Error400Schema,
        },
      },
      description: 'Bad request',
    },
    404: {
      content: {
        'application/json': {
          schema: Error404Schema,
        },
      },
      description: 'Service operation not found',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
});

// Delete service operation route
const deleteServiceOperationRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Service Operations'],
  summary: 'Delete service operation',
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(ServiceOperationSchema),
        },
      },
      description: 'Service operation deleted successfully',
    },
    404: {
      content: {
        'application/json': {
          schema: Error404Schema,
        },
      },
      description: 'Service operation not found',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
});

// Get technician performance route
const getTechnicianPerformanceRoute = createRoute({
  method: 'get',
  path: '/technician/{technicianId}/performance',
  tags: ['Service Operations'],
  summary: 'Get technician performance',
  request: {
    params: z.object({
      technicianId: z.string(),
    }),
    query: z.object({
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(z.object({
            totalOperations: z.number(),
            completedOperations: z.number(),
            averageDuration: z.number().nullable(),
            totalCost: z.number().nullable(),
          })),
        },
      },
      description: 'Technician performance retrieved successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
});

// Get all technicians performance route
const getAllTechniciansPerformanceRoute = createRoute({
  method: 'get',
  path: '/technician-performance',
  tags: ['Service Operations'],
  summary: 'Get all technicians performance',
  request: {
    query: z.object({
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(z.array(z.object({
            technicianId: z.string(),
            technicianName: z.string(),
            totalOperations: z.number(),
            completedOperations: z.number(),
            averageDuration: z.number().nullable(),
            totalCost: z.number().nullable(),
          }))),
        },
      },
      description: 'All technicians performance retrieved successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
});

// Get non-warranty operations route
const getNonWarrantyOperationsRoute = createRoute({
  method: 'get',
  path: '/non-warranty',
  tags: ['Service Operations'],
  summary: 'Get non-warranty operations',
  request: {
    query: z.object({
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(z.object({
            totalOperations: z.number(),
            totalCost: z.number().nullable(),
            averageDuration: z.number().nullable(),
          })),
        },
      },
      description: 'Non-warranty operations retrieved successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
});

// Create router
const serviceOperationsRouter = new OpenAPIHono<HonoEnv>();

// Register routes
serviceOperationsRouter.openapi(createServiceOperationRoute, ServiceOperationsController.create);
serviceOperationsRouter.openapi(getServiceOperationsRoute, ServiceOperationsController.list);
serviceOperationsRouter.openapi(getServiceOperationRoute, ServiceOperationsController.show);
serviceOperationsRouter.openapi(updateServiceOperationRoute, ServiceOperationsController.update);
serviceOperationsRouter.openapi(deleteServiceOperationRoute, ServiceOperationsController.delete);
serviceOperationsRouter.openapi(getTechnicianPerformanceRoute, ServiceOperationsController.getTechnicianPerformance);
// serviceOperationsRouter.openapi(getAllTechniciansPerformanceRoute, ServiceOperationsController.getAllTechniciansPerformance);
serviceOperationsRouter.openapi(getNonWarrantyOperationsRoute, ServiceOperationsController.getNonWarrantyOperations);

// Simple test endpoint
serviceOperationsRouter.get('/simple-test', (c) => {
  return c.json({ message: 'Simple test working' });
});

// Simple technician performance endpoint
serviceOperationsRouter.get('/technician-performance', async (c) => {
  try {
    const performance = await ServiceOperationsController.getAllTechniciansPerformance(c);
    return performance;
  } catch (error) {
    console.error('Error in simple technician performance endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

export { serviceOperationsRouter };
export default serviceOperationsRouter;