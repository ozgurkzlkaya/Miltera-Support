import { createRoute } from "@hono/zod-openapi";
import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import ProductController from "../controllers/product.controller";

const list = createRoute({
  method: "get",
  path: "/",
  request: {},
  responses: {},
});

const show = createRoute({
  method: "get",
  path: "/:id",
  request: {},
  responses: {},
});

const create = createRoute({
  method: "post",
  path: "/",
  request: {},
  responses: {},
});

const update = createRoute({
  method: "put",
  path: "/:id",
  request: {},
  responses: {},
});

const destroy = createRoute({
  method: "delete",
  path: "/:id",
  request: {},
  responses: {},
});

const router = createRouter<HonoEnv>()
  .openapi(list, ProductController.list)
  .openapi(show, ProductController.show)
  .openapi(create, ProductController.create)
  .openapi(update, ProductController.update)
  .openapi(destroy, ProductController.destroy);

export default router;
