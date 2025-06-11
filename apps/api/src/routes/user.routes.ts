import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import UserController from "../controllers/user.controller";

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

const router = new OpenAPIHono()
  .openapi(list, UserController.list)
  .openapi(show, UserController.show)
  .openapi(create, UserController.create)
  .openapi(update, UserController.update)
  .openapi(destroy, UserController.destroy);

export default router;
