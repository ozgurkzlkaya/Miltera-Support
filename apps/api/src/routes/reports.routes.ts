import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { authMiddleware } from "../helpers/auth.helpers";
import { buildResponseSuccessSchema } from "../helpers/response.helpers";
import { Error404Schema, Error500Schema } from "../dtos/base.schema";
import { ReportsService } from "../services/reports.service";

// Dashboard statistics schema
const DashboardStatsSchema = z.object({
  totalProducts: z.number(),
  activeIssues: z.number(),
  completedRepairs: z.number(),
  totalShipments: z.number(),
  productsByStatus: z.record(z.string(), z.number()),
  issuesByStatus: z.record(z.string(), z.number()),
  recentActivity: z.array(z.object({
    id: z.string(),
    type: z.string(),
    description: z.string(),
    timestamp: z.string(),
  })),
});

// Product analysis schema
const ProductAnalysisSchema = z.object({
  totalProducts: z.number(),
  productsByType: z.record(z.string(), z.number()),
  productsByStatus: z.record(z.string(), z.number()),
  warrantyStatus: z.record(z.string(), z.number()),
  monthlyProduction: z.array(z.object({
    month: z.string(),
    count: z.number(),
  })),
});

// Issue analysis schema
const IssueAnalysisSchema = z.object({
  totalIssues: z.number(),
  issuesByCategory: z.record(z.string(), z.number()),
  issuesByPriority: z.record(z.string(), z.number()),
  averageResolutionTime: z.number(),
  issuesByMonth: z.array(z.object({
    month: z.string(),
    count: z.number(),
  })),
});

// Performance report schema
const PerformanceReportSchema = z.object({
  technicianPerformance: z.array(z.object({
    technicianId: z.string(),
    technicianName: z.string(),
    totalOperations: z.number(),
    completedOperations: z.number(),
    averageDuration: z.number(),
    successRate: z.number(),
  })),
  teamPerformance: z.object({
    totalOperations: z.number(),
    averageResolutionTime: z.number(),
    customerSatisfaction: z.number(),
  }),
});

// Custom report request schema
const CustomReportRequestSchema = z.object({
  reportType: z.enum(['products', 'issues', 'shipments', 'performance']),
  dateRange: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  filters: z.record(z.string(), z.any()).optional(),
  groupBy: z.array(z.string()).optional(),
});

const getDashboardStats = createRoute({
  method: "get",
  path: "/dashboard",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(DashboardStatsSchema),
        },
      },
      description: "Dashboard statistics",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Yeni endpoint'ler
const getCompaniesCount = createRoute({
  method: "get",
  path: "/companies-count",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.object({
            count: z.number(),
          })),
        },
      },
      description: "Companies count",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

const getUsersCount = createRoute({
  method: "get",
  path: "/users-count",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.object({
            count: z.number(),
          })),
        },
      },
      description: "Users count",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

const getRecentActivity = createRoute({
  method: "get",
  path: "/recent-activity",
  request: {
    query: z.object({
      limit: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.array(z.object({
            id: z.string(),
            type: z.string(),
            title: z.string(),
            description: z.string(),
            timestamp: z.string(),
            status: z.string().optional(),
            priority: z.string().optional(),
          }))),
        },
      },
      description: "Recent activity",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

const getTrendsData = createRoute({
  method: "get",
  path: "/trends",
  request: {
    query: z.object({
      days: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.object({
            issuesCreated: z.number(),
            issuesResolved: z.number(),
            productsAdded: z.number(),
            shipmentsCreated: z.number(),
          })),
        },
      },
      description: "Trends data",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

const getProductAnalysis = createRoute({
  method: "get",
  path: "/products",
  request: {
    query: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      groupBy: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(ProductAnalysisSchema),
        },
      },
      description: "Product analysis report",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

const getIssueAnalysis = createRoute({
  method: "get",
  path: "/issues",
  request: {
    query: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      category: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(IssueAnalysisSchema),
        },
      },
      description: "Issue analysis report",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

const getPerformanceReport = createRoute({
  method: "get",
  path: "/performance",
  request: {
    query: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      technicianId: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(PerformanceReportSchema),
        },
      },
      description: "Performance report",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

const generateCustomReport = createRoute({
  method: "post",
  path: "/custom",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CustomReportRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.object({
            reportId: z.string(),
            status: z.string(),
            estimatedCompletionTime: z.number(),
          })),
        },
      },
      description: "Custom report generation started",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

const exportReport = createRoute({
  method: "get",
  path: "/{id}/export",
  request: {
    params: z.object({
      id: z.string(),
    }),
    query: z.object({
      format: z.enum(['pdf', 'excel', 'csv']).default('pdf'),
    }),
  },
  responses: {
    200: {
      content: {
        "application/pdf": {
          schema: z.any(),
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
          schema: z.any(),
        },
        "text/csv": {
          schema: z.any(),
        },
      },
      description: "Report exported successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: Error404Schema,
        },
      },
      description: "Report not found",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

const reportsRoute = createRouter<HonoEnv>()
  .use("*", authMiddleware)
  .openapi(getDashboardStats, async (c) => {
    try {
      const stats = await ReportsService.getDashboardStats();
      
      return c.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .openapi(getCompaniesCount, async (c) => {
    try {
      const count = await ReportsService.getCompaniesCount();
      return c.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      console.error("Error getting companies count:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .openapi(getUsersCount, async (c) => {
    try {
      const count = await ReportsService.getUsersCount();
      return c.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      console.error("Error getting users count:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .openapi(getRecentActivity, async (c) => {
    try {
      const limit = c.req.query("limit");
      const activity = await ReportsService.getRecentActivity(limit ? parseInt(limit, 10) : undefined);
      return c.json({
        success: true,
        data: activity,
      });
    } catch (error) {
      console.error("Error getting recent activity:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .openapi(getTrendsData, async (c) => {
    try {
      const days = c.req.query("days");
      const trends = await ReportsService.getTrendsData(days ? parseInt(days, 10) : undefined);
      return c.json({
        success: true,
        data: trends,
      });
    } catch (error) {
      console.error("Error getting trends data:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .openapi(getProductAnalysis, async (c) => {
    try {
      const { startDate, endDate } = c.req.valid("query");
      const analysis = await ReportsService.getProductAnalysis(startDate, endDate);

      return c.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      console.error("Error getting product analysis:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .openapi(getIssueAnalysis, async (c) => {
    try {
      const { startDate, endDate, category } = c.req.valid("query");
      const analysis = await ReportsService.getIssueAnalysis(startDate, endDate, category);

      return c.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      console.error("Error getting issue analysis:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .openapi(getPerformanceReport, async (c) => {
    try {
      const { startDate, endDate, technicianId } = c.req.valid("query");
      const report = await ReportsService.getPerformanceReport(startDate, endDate, technicianId);

      return c.json({
        success: true,
        data: report,
      });
    } catch (error) {
      console.error("Error getting performance report:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .openapi(generateCustomReport, async (c) => {
    try {
      const body = await c.req.json();
      
      // TODO: Implement custom report generation logic
      const reportId = crypto.randomUUID();
      
      return c.json({
        success: true,
        data: {
          reportId,
          status: "processing",
          estimatedCompletionTime: 300, // seconds
        },
      });
    } catch (error) {
      console.error("Error generating custom report:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .openapi(exportReport, async (c) => {
    try {
      const { id } = c.req.valid("param");
      const { format } = c.req.valid("query");
      
      // TODO: Implement report export logic
      const mockData = "Mock report data";
      
      if (format === "pdf") {
        return c.body(mockData, 200, {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="report-${id}.pdf"`,
        });
      } else if (format === "excel") {
        return c.body(mockData, 200, {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="report-${id}.xlsx"`,
        });
      } else {
        return c.body(mockData, 200, {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="report-${id}.csv"`,
        });
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  });

export default reportsRoute;
