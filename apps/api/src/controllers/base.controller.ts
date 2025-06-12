import type { Context as HonoContext, Env, Input } from "hono";
import { createMiddleware } from "hono/factory";
import type {
  BlankInput,
  Handler,
  HandlerResponse,
  Next,
  TypedResponse,
} from "hono/types";
import type { ApiResponse } from "../helpers/response.helpers";
import type { HonoEnv } from "../config/env";

type Context<
  E extends Env = any,
  P extends string = any,
  I extends Input = {},
> = HonoContext<E, P, I> & {
  responseJSON: <R extends ApiResponse<any>>(
    response: R
  ) => Response &
    TypedResponse<NonNullable<R["json"]>, R["statusCode"], "json">;
  responseStatus: (statusCode: number) => Response;
};

type ControllerAction<
  E extends Env = HonoEnv,
  P extends string = any,
  I extends Input = BlankInput,
  R extends HandlerResponse<any> = any,
> = (c: Context<E, P, I>, next: Next) => R;

function createControllerAction<
  E extends Env = HonoEnv,
  P extends string = any,
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
  <T extends any>(response: ApiResponse<T>) => {
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
