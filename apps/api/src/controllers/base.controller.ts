import type { Context as HonoContext, Env, Input } from "hono";
import { createMiddleware } from "hono/factory";
import { validator } from "hono/validator";
import type {
  BlankInput,
  Handler,
  HandlerResponse,
  Next,
  TypedResponse,
  ValidationTargets,
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
  ) => Promise<
    Response &
      (R extends ApiSuccessResponse<T, infer S>
        ? TypedResponse<R["json"], S, "json">
        : R extends ApiErrorResponse<infer E>
          ? TypedResponse<R["json"], E, "json">
          : never)
  >;
  responseStatus: (
    statusCode: StatusCode
  ) => Response & TypedResponse<null, StatusCode, "body">;
  validateRequest: <
    InputType,
    OutputType,
    TargetType extends keyof ValidationTargets | "rawQuery",
  >(
    target: TargetType,
    validatorFn: (
      value: unknown extends InputType
        ? "rawQuery" extends TargetType
          ? string
          : // @ts-ignore
            ValidationTargets[TargetType]
        : InputType,
      c: HonoContext
    ) => OutputType | Promise<OutputType>
  ) => Promise<OutputType>;
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
    c.responseStatus = (statusCode: StatusCode) => {
      c.status(statusCode);
      return c.body(null);
    };

    c.validateRequest = async (target, validatorFn) => {
      if (target === "rawQuery") {
        const value = c.req.raw.url.split("?")?.[1] ?? "";
        return await validatorFn(value as any, c);
      } else {
        await validator(target, validatorFn)(c, async () => {});
        return c.req.valid(target as never);
      }
    };

    await next();
  }
);

export { responderMiddleware };
export { createControllerAction, type ControllerAction, type Context };
export type { InferHandler };
