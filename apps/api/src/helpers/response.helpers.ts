import type { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";

type ApiResponse<T> = {
  json: {
    success: boolean;
    data?: T;
    error?: {
      code: string;
      message: string;
    };
    meta?: Record<string, any>;
  };
  statusCode: ContentfulStatusCode;
};

const ResponseHandler = {
  success<T>(data: T, meta?: ApiResponse<T>["json"]["meta"]): ApiResponse<T> {
    return {
      json: {
        success: true,
        data,
        meta,
      },
      statusCode: 200,
    };
  },

  error(
    code: string,
    message: string,
    statusCode: ContentfulStatusCode
  ): ApiResponse<never> {
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

  status(statusCode: StatusCode) {
    return {
      statusCode,
    };
  },

  validationError(message: string): ApiResponse<never> {
    return this.error("VALIDATION_ERROR", message, 422);
  },

  notFound(resource: string): ApiResponse<never> {
    return this.error("NOT_FOUND", `${resource} not found`, 404);
  },

  unauthorized(message: string = "Unauthorized"): ApiResponse<never> {
    return this.error("UNAUTHORIZED", message, 401);
  },

  badRequest(message: string): ApiResponse<never> {
    return this.error("BAD_REQUEST", message, 400);
  },

  internalError(message: string = "Internal server error"): ApiResponse<never> {
    return this.error("INTERNAL_ERROR", message, 500);
  },

  forbidden(message: string = "Forbidden"): ApiResponse<never> {
    return this.error("FORBIDDEN", message, 403);
  },
};

export { ResponseHandler };
export type { ApiResponse };
