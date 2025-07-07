import type { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";
import { z } from "../lib/zod";

type ApiSuccessResponse<
  T,
  U extends ContentfulStatusCode = ContentfulStatusCode,
> = {
  json: {
    success: true;
    data: T;
    meta?: Record<string, any>;
  };
  statusCode: U;
};

type ApiErrorResponse<U extends ContentfulStatusCode = ContentfulStatusCode> = {
  json: {
    success: false;
    error: {
      code: string;
      message: string;
    };
    meta?: Record<string, any>;
  };
  statusCode: U;
};

const ResponseHandler = {
  success<T>(
    data: T,
    meta?: ApiSuccessResponse<T>["json"]["meta"]
  ): ApiSuccessResponse<T, 200> {
    return {
      json: {
        success: true,
        data,
        meta,
      },
      statusCode: 200,
    };
  },

  error<S extends ContentfulStatusCode>(
    code: string,
    message: string,
    statusCode: S
  ): ApiErrorResponse<S> {
    return {
      json: {
        success: false,
        error: {
          code,
          message,
        },
      },
      statusCode,
    };
  },

  status<U extends StatusCode>(statusCode: U) {
    return {
      statusCode,
      json: undefined,
    } as const;
  },

  validationError(message: string) {
    return this.error("VALIDATION_ERROR", message, 422);
  },

  notFound(resource: string) {
    return this.error("NOT_FOUND", `${resource} not found`, 404);
  },

  unauthorized(message = "Unauthorized") {
    return this.error("UNAUTHORIZED", message, 401);
  },

  badRequest(message: string) {
    return this.error("BAD_REQUEST", message, 400);
  },

  internalError(message = "Internal Server Error") {
    return this.error("INTERNAL_SERVER_ERROR", message, 500);
  },

  forbidden(message = "Forbidden") {
    return this.error("FORBIDDEN", message, 403);
  },
};

const buildResponseSuccessSchema = <T extends z.ZodRawShape>(
  dataSchema: z.ZodObject<T>
) =>
  z.object({
    success: z.literal(true),
    data: dataSchema.shape.data ?? dataSchema,
    ...(dataSchema.shape.meta ? { meta: dataSchema.shape.meta } : {}),
  });

const buildResponseErrorSchema = <
  T extends z.ZodString | z.ZodLiteral<string>,
  U extends z.ZodString | z.ZodLiteral<string>,
>(
  code: T,
  message: U
) =>
  z.object({
    success: z.literal(false),
    error: z.object({
      code: code,
      message: message,
    }),
  });

export { ResponseHandler };
export { buildResponseSuccessSchema, buildResponseErrorSchema };
export type { ApiSuccessResponse, ApiErrorResponse };
