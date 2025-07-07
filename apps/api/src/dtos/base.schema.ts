import {
  createSchemaFactory,
  type CreateSelectSchema,
  type CreateInsertSchema,
  type CreateUpdateSchema,
} from "drizzle-zod";
import {
  QuerySchema,
  PaginationResultSchema,
  type PaginationResult,
} from "@miltera/helpers/query-builder";
import { z } from "../lib/zod";
import { buildResponseErrorSchema } from "../helpers/response.helpers";

const { createSelectSchema, createInsertSchema, createUpdateSchema } = (() => {
  const {
    createSelectSchema: _createSelectSchema,
    createInsertSchema: _createInsertSchema,
    createUpdateSchema: _createUpdateSchema,
  } = createSchemaFactory({
    zodInstance: z,
    coerce: {
      date: true,
    },
  });

  const patchSchema = (schema: z.ZodSchema) => {
    if (schema instanceof z.ZodObject && schema.shape.updatedAt) {
      // customTimestamp in ./db/polyfill.ts breaks the schema
      // so we need to extend it with a date type
      schema.shape.updatedAt = z.coerce.date();
    }

    return schema;
  };

  const createSelectSchema = ((...params: any[]) =>
    patchSchema((_createSelectSchema as any)(...params))) as CreateSelectSchema;

  const createInsertSchema = ((...params: any[]) =>
    patchSchema((_createInsertSchema as any)(...params))) as CreateInsertSchema;

  const createUpdateSchema = ((...params: any[]) =>
    patchSchema((_createUpdateSchema as any)(...params))) as CreateUpdateSchema;

  return {
    createSelectSchema,
    createInsertSchema,
    createUpdateSchema,
  };
})();

const BaseSchemaFactory = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => {
  return schema.omit({
    deletedAt: true,
  } as any) as z.ZodObject<Omit<T, "deletedAt">>;
};

const BaseRequestSchemaFactory = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
) => {
  const baseSchema = BaseSchemaFactory(schema);

  return baseSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  } as any) as z.ZodObject<
    Omit<(typeof baseSchema)["shape"], "id" | "createdAt" | "updatedAt">
  >;
};

const ListMetaRequestSchema = QuerySchema;
const ListMetaResponseSchema = QuerySchema.extend({
  pagination: PaginationResultSchema,
}).openapi({
  example: {
    pagination: {
      page: 1,
      pageSize: 10,
      total: 1000,
      pageCount: 100,
    },
    sort: [{ field: "createdAt", order: "desc" }],
    filters: {
      name: {
        $eq: "test",
      },
    },
  },
});

const ListMetaRequestParamsSchema = z.object({
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
  "sort[]": z.string().optional(),
  "filters[field][operator]": z.string().optional(),
});

type ListMetaRequest = z.infer<typeof ListMetaRequestSchema>;
type ListMetaResponse = z.infer<typeof ListMetaResponseSchema>;

type ListMetaRequestParams = z.infer<typeof ListMetaRequestParamsSchema>;

const Error400Schema = buildResponseErrorSchema(z.string(), z.string());
const Error404Schema = buildResponseErrorSchema(z.string(), z.string());
const Error422Schema = buildResponseErrorSchema(z.string(), z.string());
const Error500Schema = buildResponseErrorSchema(z.string(), z.string());

export {
  BaseSchemaFactory,
  BaseRequestSchemaFactory,
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
};
export {
  ListMetaRequestSchema,
  ListMetaResponseSchema,
  ListMetaRequestParamsSchema,
  Error400Schema,
  Error404Schema,
  Error422Schema,
  Error500Schema,
};
export type {
  ListMetaRequest,
  ListMetaResponse,
  ListMetaRequestParams,
  PaginationResult,
};
