import { createRoute } from "@hono/zod-openapi";
import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import { z } from "../lib/zod";
import ProductTypeController from "../controllers/product-type.controller";
import { buildResponseSuccessSchema } from "../helpers/response.helpers";
import {
  Error404Schema,
  Error422Schema,
  Error500Schema,
  ListMetaRequestParamsSchema,
} from "../dtos/base.schema";
import {
  ProductTypeListSchema,
  ProductTypeSchema,
  ProductTypeCreateSchema,
  ProductTypeUpdateSchema,
} from "../dtos/product-type.dto";

const list = createRoute({
  method: "get",
  path: "/",
  request: {
    query: ListMetaRequestParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ProductTypeListSchema),
        },
      },
      description: "List all product types",
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
      id: z.string(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ProductTypeSchema),
        },
      },
      description: "Product type details",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Product type not found",
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
          schema: ProductTypeCreateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ProductTypeSchema),
        },
      },
      description: "Product type created successfully",
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
          schema: ProductTypeUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ProductTypeSchema),
        },
      },
      description: "Product type updated successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Product type not found",
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
      description: "Product type deleted successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Product type not found",
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

const productTypesRoute = createRouter<HonoEnv>()
  .openapi(list, ProductTypeController.list)
  .openapi(show, ProductTypeController.show)
  .openapi(create, ProductTypeController.create)
  .openapi(update, ProductTypeController.update)
  .openapi(destroy, ProductTypeController.destroy);

export default productTypesRoute;
