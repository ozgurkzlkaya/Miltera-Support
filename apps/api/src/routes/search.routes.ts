import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { buildResponseSuccessSchema } from "../helpers/response.helpers";
import { Error404Schema, Error500Schema } from "../dtos/base.schema";
import { authMiddleware } from "../helpers/auth.helpers";
import { SearchService } from "../services/search.service";
import { getAuth } from "../lib/auth";

// Search request schema
const SearchRequestSchema = z.object({
  entityType: z.enum(['products', 'issues', 'shipments', 'companies', 'users']),
  query: z.string().optional(),
  filters: z.object({
    status: z.union([z.string(), z.array(z.string())]).optional(),
    priority: z.union([z.string(), z.array(z.string())]).optional(),
    type: z.union([z.string(), z.array(z.string())]).optional(),
    dateRange: z.object({
      field: z.string(),
      from: z.string().optional(),
      to: z.string().optional(),
    }).optional(),
    companyId: z.string().uuid().optional(),
    assignedTo: z.string().uuid().optional(),
    locationId: z.string().uuid().optional(),
    warrantyStatus: z.string().optional(),
    productTypeId: z.string().uuid().optional(),
    productModelId: z.string().uuid().optional(),
  }).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  includeArchived: z.boolean().default(false),
});

// Search suggestions request schema
const SearchSuggestionsRequestSchema = z.object({
  entityType: z.enum(['products', 'issues', 'shipments', 'companies']),
  query: z.string().min(2),
  limit: z.number().min(1).max(50).default(10),
});

// Search facets request schema
const SearchFacetsRequestSchema = z.object({
  entityType: z.enum(['products', 'issues', 'shipments']),
});

// Search route
const searchRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: SearchRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(z.object({
            data: z.array(z.any()),
            totalCount: z.number(),
            totalPages: z.number(),
            currentPage: z.number(),
            hasNextPage: z.boolean(),
            hasPreviousPage: z.boolean(),
            facets: z.record(z.any()).optional(),
          })),
        },
      },
      description: 'Search results retrieved successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: Error404Schema,
        },
      },
      description: 'Invalid request',
    },
    401: {
      content: {
        'application/json': {
          schema: Error404Schema,
        },
      },
      description: 'Unauthorized',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
  tags: ['Search'],
  summary: 'Advanced search',
  description: 'Perform advanced search across all entities with filters, sorting, and pagination',
});

// Search suggestions route
const searchSuggestionsRoute = createRoute({
  method: 'get',
  path: '/suggestions',
  request: {
    query: SearchSuggestionsRequestSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(z.object({
            suggestions: z.array(z.string()),
          })),
        },
      },
      description: 'Search suggestions retrieved successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: Error404Schema,
        },
      },
      description: 'Invalid request',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
  tags: ['Search'],
  summary: 'Get search suggestions',
  description: 'Get autocomplete suggestions for search queries',
});

// Search facets route
const searchFacetsRoute = createRoute({
  method: 'get',
  path: '/facets',
  request: {
    query: SearchFacetsRequestSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(z.object({
            facets: z.record(z.any()),
          })),
        },
      },
      description: 'Search facets retrieved successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
  tags: ['Search'],
  summary: 'Get search facets',
  description: 'Get available filter options and counts for search',
});

// Global search route
const globalSearchRoute = createRoute({
  method: 'get',
  path: '/global',
  request: {
    query: z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(50).default(10),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(z.object({
            results: z.object({
              products: z.array(z.any()),
              issues: z.array(z.any()),
              shipments: z.array(z.any()),
              companies: z.array(z.any()),
            }),
            totalCount: z.number(),
          })),
        },
      },
      description: 'Global search results retrieved successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: Error404Schema,
        },
      },
      description: 'Invalid request',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
  tags: ['Search'],
  summary: 'Global search',
  description: 'Search across all entities with a single query',
});

const searchRouter = createRouter<HonoEnv>()
  .use('*', authMiddleware)
  .openapi(searchRoute, async (c) => {
    try {
      const auth = await getAuth(c);
      if (!auth.isAuthenticated) {
        return c.json({ success: false, error: { message: 'Unauthorized' } }, 401);
      }

      const body = await c.req.json();
      const { entityType, query, filters, sortBy, sortOrder, page, limit, includeArchived } = body;

      // Role-based access control
      if (auth.user.role === 'CUSTOMER') {
        // Customers can only search their own data
        if (filters && !filters.companyId) {
          filters.companyId = auth.user.companyId;
        }
      }

      const result = await SearchService.search({
        entityType,
        query,
        filters,
        sortBy,
        sortOrder,
        page,
        limit,
        includeArchived,
      });

      // Get facets for the first page
      let facets;
      if (page === 1) {
        facets = await SearchService.getSearchFacets(entityType);
      }

      return c.json({
        success: true,
        data: {
          ...result,
          facets,
        },
      });
    } catch (error) {
      console.error('Error performing search:', error);
      return c.json({ success: false, error: { message: 'Internal server error' } }, 500);
    }
  })
  .openapi(searchSuggestionsRoute, async (c) => {
    try {
      const { entityType, query, limit } = c.req.valid('query');

      const suggestions = await SearchService.getSearchSuggestions(entityType, query, limit);

      return c.json({
        success: true,
        data: {
          suggestions,
        },
      });
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return c.json({ success: false, error: { message: 'Internal server error' } }, 500);
    }
  })
  .openapi(searchFacetsRoute, async (c) => {
    try {
      const { entityType } = c.req.valid('query');

      const facets = await SearchService.getSearchFacets(entityType);

      return c.json({
        success: true,
        data: {
          facets,
        },
      });
    } catch (error) {
      console.error('Error getting search facets:', error);
      return c.json({ success: false, error: { message: 'Internal server error' } }, 500);
    }
  })
  .openapi(globalSearchRoute, async (c) => {
    try {
      const auth = await getAuth(c);
      if (!auth.isAuthenticated) {
        return c.json({ success: false, error: { message: 'Unauthorized' } }, 401);
      }

      const { query, limit } = c.req.valid('query');

      // Perform search across all entities
      const [products, issues, shipments, companies] = await Promise.all([
        SearchService.search({
          entityType: 'products',
          query,
          page: 1,
          limit: Math.ceil(limit / 4),
        }),
        SearchService.search({
          entityType: 'issues',
          query,
          page: 1,
          limit: Math.ceil(limit / 4),
        }),
        SearchService.search({
          entityType: 'shipments',
          query,
          page: 1,
          limit: Math.ceil(limit / 4),
        }),
        SearchService.search({
          entityType: 'companies',
          query,
          page: 1,
          limit: Math.ceil(limit / 4),
        }),
      ]);

      const totalCount = products.totalCount + issues.totalCount + shipments.totalCount + companies.totalCount;

      return c.json({
        success: true,
        data: {
          results: {
            products: products.data,
            issues: issues.data,
            shipments: shipments.data,
            companies: companies.data,
          },
          totalCount,
        },
      });
    } catch (error) {
      console.error('Error performing global search:', error);
      return c.json({ success: false, error: { message: 'Internal server error' } }, 500);
    }
  });

export default searchRouter;
