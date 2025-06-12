import { createRoute, z } from "@hono/zod-openapi";
import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import UserController from "../controllers/user.controller";
import { UserSchema } from "../schemas/user.schema";
import {
  Error404Schema,
  Error422Schema,
  Error500Schema,
} from "../schemas/base.schema";
import { buildResponseSuccessSchema } from "../helpers/response.helpers";

const list = createRoute({
  method: "get",
  path: "/",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.array(UserSchema)),
        },
      },
      description: "List all users",
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
          schema: buildResponseSuccessSchema(UserSchema),
        },
      },
      description: "Retrieve the user",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "User not found",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Get a user by ID",
    },
  },
});

const create = createRoute({
  method: "post",
  path: "/",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(UserSchema),
        },
      },
      description: "Create a user",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "User not found",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
    422: {
      content: {
        "application/json": {
          schema: Error422Schema,
        },
      },
      description: "Unprocessable entity",
    },
  },
});

const update = createRoute({
  method: "put",
  path: "/:id",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(UserSchema),
        },
      },
      description: "Update a user",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "User not found",
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
  request: {},
  responses: {
    204: {
      description: "Delete a user",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "User not found",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
    422: {
      content: {
        "application/json": {
          schema: Error422Schema,
        },
      },
      description: "Unprocessable entity",
    },
  },
});

const router = createRouter<HonoEnv>()
  .openapi(list, UserController.list)
  .openapi(show, UserController.show)
  .openapi(create, UserController.create)
  .openapi(update, UserController.update)
  .openapi(destroy, UserController.destroy);

export default router;
