import type { Context as HonoContext, Env, Input } from "hono";
import { createMiddleware } from "hono/factory";
import type {
  BlankInput,
  Handler,
  HandlerResponse,
  Next,
  TypedResponse,
} from "hono/types";
import type { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
} from "../helpers/response.helpers";
import type { HonoEnv } from "../config/env";

type Context<
  E extends Env = any,
  P extends string = any,
  I extends Input = {},
> = HonoContext<E, P, I> & {
  responseJSON: <
    T extends any,
    U extends ContentfulStatusCode,
    R extends ApiSuccessResponse<T, U> | ApiErrorResponse<U>,
  >(
    response: R
  ) => Promise<Response & (
    R extends ApiSuccessResponse<T, infer S> 
      ? TypedResponse<R["json"], S, "json">
      : R extends ApiErrorResponse<infer E>
        ? TypedResponse<R["json"], E, "json">
        : never
  )>;
  responseStatus: (statusCode: number) => Response;
};

type ControllerAction<
  E extends Env = HonoEnv,
  P extends string = "/",
  I extends Input = BlankInput,
  R extends HandlerResponse<any> = any,
> = (c: Context<E, P, I>, next: Next) => R;

function createControllerAction<
  E extends Env = HonoEnv,
  P extends string = "/",
  I extends Input = BlankInput,
  R extends HandlerResponse<any> = any,
>(action: ControllerAction<E, P, I, R>): Handler<E, P, I, R>;

function createControllerAction<
  E extends Env = HonoEnv,
  P extends string = any,
  I extends Input = BlankInput,
  R extends HandlerResponse<any> = any,
>(path: P, action: ControllerAction<E, P, I, R>): Handler<E, P, I, R>;

function createControllerAction<
  E extends Env = HonoEnv,
  P extends string = any,
  I extends Input = BlankInput,
  R extends HandlerResponse<any> = any,
>(
  pathOrAction: string | ControllerAction<E, P, I, R>,
  action?: ControllerAction<E, P, I, R>
): Handler<E, P, I, R> {
  return (action ?? pathOrAction) as any;
}

type InferHandler<T> =
  T extends ControllerAction<infer E, infer P, infer I, infer R>
    ? Handler<E, P, I, R>
    : never;

const buildJSONResponder =
  (c: Context) =>
  <T extends any>(response: ApiSuccessResponse<T> | ApiErrorResponse) => {
    return c.json(response.json, response.statusCode);
  };

const responderMiddleware = createMiddleware(
  // force type to Context
  //@ts-ignore
  async (c: Context, next) => {
    c.responseJSON = buildJSONResponder(c) as any;
    c.responseStatus = (statusCode: number) => {
      return new Response(null, { status: statusCode });
    };

    await next();
  }
);

export { responderMiddleware };
export { createControllerAction, type ControllerAction, type Context };
export type { InferHandler };
