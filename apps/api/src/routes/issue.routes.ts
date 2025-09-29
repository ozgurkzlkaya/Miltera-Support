import { createRoute } from "@hono/zod-openapi";
import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import { z } from "../lib/zod";
import IssueController from "../controllers/issue.controller";
import { buildResponseSuccessSchema } from "../helpers/response.helpers";
import {
  IssueListSchema,
  IssueSchema,
  IssueCreateSchema,
  IssueUpdateSchema,
} from "../dtos/issue.dto";
import {
  Error404Schema,
  Error422Schema,
  Error500Schema,
} from "../dtos/base.schema";
import { authMiddleware } from "../helpers/auth.helpers";

const list = createRoute({
  method: "get",
  path: "/",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(IssueListSchema),
        },
      },
      description: "List all issues",
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
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(IssueSchema),
        },
      },
      description: "Issue details",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Issue not found",
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
          schema: z.object({}), // Basit schema - herhangi bir JSON kabul et
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
      description: "Issue created successfully",
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
      id: z.string(),
    }),
    body: {
      content: {
        "application/json": {
          schema: IssueUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(IssueSchema),
        },
      },
      description: "Issue updated successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Issue not found",
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
      id: z.string(),
    }),
  },
  responses: {
    204: {
      description: "Issue deleted successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Issue not found",
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

// Add product to issue route
const addProduct = createRoute({
  method: "post",
  path: "/:id/products",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            productId: z.string().uuid(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(IssueSchema),
        },
      },
      description: "Product added to issue successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Issue not found",
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

const issuesRoute = createRouter<HonoEnv>()
  // .use("*", authMiddleware) // Geçici olarak kaldırıldı
  .openapi(list, IssueController.list)
  .openapi(show, IssueController.show)
  .openapi(create, IssueController.create)
  .openapi(update, IssueController.update)
  .openapi(destroy, IssueController.destroy)
  .openapi(addProduct, IssueController.addProduct);

export default issuesRoute;
