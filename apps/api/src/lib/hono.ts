import { OpenAPIHono, type OpenAPIHonoOptions } from "@hono/zod-openapi";
import type { Env, Schema } from "hono";
import type { HonoOptions } from "hono/hono-base";
import { responderMiddleware } from "../controllers/base.controller";

const createHonoApp = <
  E extends Env,
  S extends Schema = {},
  BasePath extends string = "/",
>(
  init?: HonoOptions<Env> & OpenAPIHonoOptions<E>
): OpenAPIHono<E, S, BasePath> => {
  return new OpenAPIHono<E, S, BasePath>(init).use(responderMiddleware) as any; // this is fine, ignore type issues
};

const createRouter = <
  E extends Env,
  S extends Schema = {},
  BasePath extends string = "/",
>(
  init?: HonoOptions<Env> & OpenAPIHonoOptions<E>
): OpenAPIHono<E, S, BasePath> => {
  return createHonoApp<E, S, BasePath>(init);
};

export { createHonoApp, createRouter };
