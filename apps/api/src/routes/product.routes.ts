import { createRoute } from "@hono/zod-openapi";
import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import { z } from "../lib/zod";
import ProductController from "../controllers/product.controller";
import { buildResponseSuccessSchema } from "../helpers/response.helpers";
import {
  Error404Schema,
  Error422Schema,
  Error500Schema,
} from "../schemas/base.schema";
import {
  ProductSchema,
  ProductCreateParamsSchema,
  ProductUpdateParamsSchema,
} from "../schemas/product.schema";

const list = createRoute({
  method: "get",
  path: "/",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.array(ProductSchema)),
        },
      },
      description: "Retrieve the user",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Retrieve the user",
    },
  },
});

const show = createRoute({
  method: "get",
  path: "/:id",
  request: {
    params: ProductSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ProductSchema),
        },
      },
      description: "Product details",
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
          schema: ProductCreateParamsSchema,
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
      description: "Product created successfully",
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
    params: ProductUpdateParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: ProductUpdateParamsSchema,
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
    params: ProductUpdateParamsSchema,
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

const router = createRouter<HonoEnv>()
  .openapi(list, ProductController.list)
  .openapi(show, ProductController.show)
  .openapi(create, ProductController.create)
  .openapi(update, ProductController.update)
  .openapi(destroy, ProductController.destroy);

export default router;
