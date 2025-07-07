import queryString from "query-string";
import * as z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

const FilterOperatorSchema = z.enum([
  "$eq",
  "$eqi",
  "$ne",
  "$nei",
  "$lt",
  "$lte",
  "$gt",
  "$gte",
  "$in",
  "$notIn",
  "$contains",
  "$notContains",
  "$containsi",
  "$notContainsi",
  "$null",
  "$notNull",
  "$between",
  "$startsWith",
  "$startsWithi",
  "$endsWith",
  "$endsWithi",
  "$or",
  "$and",
  "$not",
]);

const FiltersSchema = z.record(
  z.string(),
  z.record(FilterOperatorSchema, z.unknown())
);

const defaultSortOrder = "asc";
const SortSchema = z.array(
  z.object({
    field: z.string(),
    order: z.enum(["asc", "desc"]).default(defaultSortOrder),
  })
);

const defaultPageSize = 10; // hardcoded for now
const maxPageSize = 100; // hardcoded for now

const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(maxPageSize).default(defaultPageSize),
});

const PaginationResultSchema = PaginationSchema.extend({
  pageCount: z.number(),
  total: z.number(),
});

const QuerySchema = z.object({
  filters: FiltersSchema.optional(),
  sort: SortSchema.optional(),
  pagination: PaginationSchema.optional(),
});

type FilterOperator = z.infer<typeof FilterOperatorSchema>;
type Filters = z.infer<typeof FiltersSchema>;
type Sort = z.infer<typeof SortSchema>;
type Pagination = z.infer<typeof PaginationSchema>;
type PaginationResult = z.infer<typeof PaginationResultSchema>;
type Query = z.infer<typeof QuerySchema>;

const getQuerySchema = <
  T extends [string, ...string[]],
  U extends [string, ...string[]],
>(
  allowedFilterFields?: T,
  allowedSortFields?: U
) => {
  const ExtendedQuerySchema = QuerySchema.extend({
    filters: allowedFilterFields
      ? z
          .record(z.enum(allowedFilterFields), FiltersSchema._def.valueType)
          .optional()
      : QuerySchema.shape.filters,
    sort: allowedSortFields
      ? z
          .array(
            SortSchema._def.type.extend({
              field: z.enum(allowedSortFields),
            })
          )
          .optional()
      : QuerySchema.shape.sort,
  });

  return ExtendedQuerySchema;
};

const filtersRegex = /^filters\[([^\]]+)\](?:\[([^\]]+)\])?$/;

const _parseQueryString = (q: string) => {
  const parsed = queryString.parse(q, {
    arrayFormat: "index",
  });

  const filters: Filters = {};
  const sort: Sort = [];

  Object.entries(parsed).forEach(([key, value]) => {
    if (!value) return;

    const filterMatch = key.match(filtersRegex);

    if (filterMatch) {
      const [, field, operator] = filterMatch;
      if (field && operator) {
        if (operator === "$between") {
          const val = (value as string).split(",");

          filters[field] = {
            ...(filters[field] ?? {}),
            $gte: val[0] as string,
            $lte: val[1] as string,
          };

          return;
        }

        filters[field] = {
          ...(filters[field] ?? {}),
          [operator]: value,
        };
      }
    }
  });

  if (Array.isArray(parsed.sort)) {
    parsed.sort.forEach((item) => {
      if (!item) return;
      const [field, order = defaultSortOrder] = item.split(":");
      if (!field) return;

      sort.push({ field, order: order as Sort[number]["order"] });
    });
  } else if (parsed.sort) {
    const [field, order = defaultSortOrder] = parsed.sort.split(":");
    if (!field) return;
    sort.push({ field, order: order as Sort[number]["order"] });
  }

  const pagination = { page: parsed.page, pageSize: parsed.pageSize };
  return { filters, sort, pagination };
};

const parseQueryString = <
  T extends [string, ...string[]],
  U extends [string, ...string[]],
>(
  q: string,
  allowedFilterFields?: T,
  allowedSortFields?: U
) => {
  const ExtendedQuerySchema = getQuerySchema(
    allowedFilterFields,
    allowedSortFields
  );

  return ExtendedQuerySchema.parse(_parseQueryString(q));
};

const parseQueryStringAsyncSafe = async <
  T extends [string, ...string[]],
  U extends [string, ...string[]],
>(
  q: string,
  allowedFilterFields?: T,
  allowedSortFields?: U
) => {
  const ExtendedQuerySchema = getQuerySchema(
    allowedFilterFields,
    allowedSortFields
  );

  return ExtendedQuerySchema.safeParseAsync(_parseQueryString(q));
};

const parseQueryStringAsync = async <
  T extends [string, ...string[]],
  U extends [string, ...string[]],
>(
  q: string,
  allowedFilterFields?: T,
  allowedSortFields?: U
) => {
  const ExtendedQuerySchema = getQuerySchema(
    allowedFilterFields,
    allowedSortFields
  );

  return ExtendedQuerySchema.parseAsync(_parseQueryString(q));
};

const serializeQuery = (query: Query) => {
  const filters = query.filters ?? {};
  const sort = query.sort ?? [];
  const pagination = query.pagination ?? {};

  const serializedFilters = Object.entries(filters)
    .flatMap(([key, value]) =>
      Object.entries(value).map(
        ([operator, val]) => `filters[${key}][${operator}]=${val}`
      )
    )
    .join("&");

  const serializedSort = sort
    .map((item, index) => {
      return `sort[${index}]=${item.field}:${item.order}`;
    })
    .join("&");

  const serializedPagination = queryString.stringify(pagination);

  return (
    serializedPagination +
    (serializedFilters ? `&${serializedFilters}` : "") +
    (serializedSort ? `&${serializedSort}` : "")
  );
};

const temporaryObjectQuery = (query: Query) => {
  const q = serializeQuery(query);
  if (!q) return undefined;

  return Object.fromEntries(new URLSearchParams(q));
};

export {
  parseQueryString,
  parseQueryStringAsync,
  parseQueryStringAsyncSafe,
  serializeQuery,
  temporaryObjectQuery,
};
export { defaultPageSize, maxPageSize };
export {
  FilterOperatorSchema,
  FiltersSchema,
  SortSchema,
  PaginationSchema,
  PaginationResultSchema,
  QuerySchema,
  getQuerySchema,
};
export type {
  FilterOperator,
  Filters,
  Sort,
  Pagination,
  PaginationResult,
  Query,
};
