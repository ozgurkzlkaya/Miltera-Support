import { Context, Next } from "hono";
import { redisClient } from "./redis";

// Performance metrics interface
interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: string;
  userId?: string;
  ip: string;
  userAgent: string;
}

// Error metrics interface
interface ErrorMetrics {
  endpoint: string;
  method: string;
  error: string;
  stack?: string;
  timestamp: string;
  userId?: string;
  ip: string;
}

// Database metrics interface
interface DatabaseMetrics {
  query: string;
  executionTime: number;
  timestamp: string;
  success: boolean;
}

// Cache metrics interface
interface CacheMetrics {
  operation: 'get' | 'set' | 'delete';
  key: string;
  hit: boolean;
  executionTime: number;
  timestamp: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private errors: ErrorMetrics[] = [];
  private dbMetrics: DatabaseMetrics[] = [];
  private cacheMetrics: CacheMetrics[] = [];

  private constructor() {
    this.startPeriodicFlush();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Record API performance metrics
  public recordApiMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Store in Redis for real-time monitoring
    const key = `metrics:api:${Date.now()}`;
    redisClient.set(key, JSON.stringify(metric), 'EX', 3600); // 1 hour TTL
  }

  // Record error metrics
  public recordError(metric: ErrorMetrics): void {
    this.errors.push(metric);
    
    // Store in Redis for real-time monitoring
    const key = `metrics:error:${Date.now()}`;
    redisClient.set(key, JSON.stringify(metric), 'EX', 3600);
  }

  // Record database metrics
  public recordDbMetric(metric: DatabaseMetrics): void {
    this.dbMetrics.push(metric);
    
    // Store in Redis for real-time monitoring
    const key = `metrics:db:${Date.now()}`;
    redisClient.set(key, JSON.stringify(metric), 'EX', 3600);
  }

  // Record cache metrics
  public recordCacheMetric(metric: CacheMetrics): void {
    this.cacheMetrics.push(metric);
    
    // Store in Redis for real-time monitoring
    const key = `metrics:cache:${Date.now()}`;
    redisClient.set(key, JSON.stringify(metric), 'EX', 3600);
  }

  // Get performance statistics
  public async getPerformanceStats(): Promise<any> {
    const apiKeys = await redisClient.keys('metrics:api:*');
    const errorKeys = await redisClient.keys('metrics:error:*');
    const dbKeys = await redisClient.keys('metrics:db:*');
    const cacheKeys = await redisClient.keys('metrics:cache:*');

    const apiMetrics = await Promise.all(
      apiKeys.map(key => redisClient.get(key))
    );
    const errorMetrics = await Promise.all(
      errorKeys.map(key => redisClient.get(key))
    );
    const dbMetrics = await Promise.all(
      dbKeys.map(key => redisClient.get(key))
    );
    const cacheMetrics = await Promise.all(
      cacheKeys.map(key => redisClient.get(key))
    );

    const parsedApiMetrics = apiMetrics
      .filter(Boolean)
      .map(metric => JSON.parse(metric!));

    const parsedErrorMetrics = errorMetrics
      .filter(Boolean)
      .map(metric => JSON.parse(metric!));

    const parsedDbMetrics = dbMetrics
      .filter(Boolean)
      .map(metric => JSON.parse(metric!));

    const parsedCacheMetrics = cacheMetrics
      .filter(Boolean)
      .map(metric => JSON.parse(metric!));

    return {
      api: {
        total: parsedApiMetrics.length,
        averageResponseTime: this.calculateAverage(parsedApiMetrics, 'responseTime'),
        requestsPerMinute: this.calculateRequestsPerMinute(parsedApiMetrics),
        statusCodes: this.groupByStatus(parsedApiMetrics),
        slowestEndpoints: this.getSlowestEndpoints(parsedApiMetrics),
      },
      errors: {
        total: parsedErrorMetrics.length,
        errorsPerMinute: this.calculateRequestsPerMinute(parsedErrorMetrics),
        errorTypes: this.groupByErrorType(parsedErrorMetrics),
        recentErrors: parsedErrorMetrics.slice(-10),
      },
      database: {
        total: parsedDbMetrics.length,
        averageExecutionTime: this.calculateAverage(parsedDbMetrics, 'executionTime'),
        slowestQueries: this.getSlowestQueries(parsedDbMetrics),
        successRate: this.calculateSuccessRate(parsedDbMetrics),
      },
      cache: {
        total: parsedCacheMetrics.length,
        hitRate: this.calculateCacheHitRate(parsedCacheMetrics),
        averageExecutionTime: this.calculateAverage(parsedCacheMetrics, 'executionTime'),
        operations: this.groupByOperation(parsedCacheMetrics),
      },
    };
  }

  // Calculate average for a specific field
  private calculateAverage(metrics: any[], field: string): number {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + (metric[field] || 0), 0);
    return Math.round((sum / metrics.length) * 100) / 100;
  }

  // Calculate requests per minute
  private calculateRequestsPerMinute(metrics: any[]): number {
    if (metrics.length === 0) return 0;
    const oneMinuteAgo = Date.now() - 60000;
    const recentMetrics = metrics.filter(metric => 
      new Date(metric.timestamp).getTime() > oneMinuteAgo
    );
    return recentMetrics.length;
  }

  // Group metrics by status code
  private groupByStatus(metrics: any[]): Record<string, number> {
    return metrics.reduce((acc, metric) => {
      const status = metric.statusCode.toString();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // Get slowest endpoints
  private getSlowestEndpoints(metrics: any[]): any[] {
    return metrics
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, 10)
      .map(metric => ({
        endpoint: metric.endpoint,
        method: metric.method,
        responseTime: metric.responseTime,
        timestamp: metric.timestamp,
      }));
  }

  // Group by error type
  private groupByErrorType(metrics: any[]): Record<string, number> {
    return metrics.reduce((acc, metric) => {
      const errorType = metric.error.split(':')[0];
      acc[errorType] = (acc[errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // Get slowest queries
  private getSlowestQueries(metrics: any[]): any[] {
    return metrics
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10)
      .map(metric => ({
        query: metric.query.substring(0, 100) + '...',
        executionTime: metric.executionTime,
        success: metric.success,
        timestamp: metric.timestamp,
      }));
  }

  // Calculate success rate
  private calculateSuccessRate(metrics: any[]): number {
    if (metrics.length === 0) return 0;
    const successful = metrics.filter(metric => metric.success).length;
    return Math.round((successful / metrics.length) * 100);
  }

  // Calculate cache hit rate
  private calculateCacheHitRate(metrics: any[]): number {
    if (metrics.length === 0) return 0;
    const hits = metrics.filter(metric => metric.hit).length;
    return Math.round((hits / metrics.length) * 100);
  }

  // Group by operation
  private groupByOperation(metrics: any[]): Record<string, number> {
    return metrics.reduce((acc, metric) => {
      acc[metric.operation] = (acc[metric.operation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // Periodic flush to persistent storage
  private startPeriodicFlush(): void {
    setInterval(() => {
      this.flushMetrics();
    }, 60000); // Flush every minute
  }

  // Flush metrics to persistent storage
  private async flushMetrics(): Promise<void> {
    try {
      // Here you would typically send metrics to a monitoring service
      // like DataDog, New Relic, or store in a time-series database
      console.log('Flushing metrics:', {
        api: this.metrics.length,
        errors: this.errors.length,
        db: this.dbMetrics.length,
        cache: this.cacheMetrics.length,
      });

      // Clear in-memory arrays after flushing
      this.metrics = [];
      this.errors = [];
      this.dbMetrics = [];
      this.cacheMetrics = [];
    } catch (error) {
      console.error('Error flushing metrics:', error);
    }
  }
}

// Performance monitoring middleware
export const performanceMonitoringMiddleware = async (c: Context, next: Next) => {
  const startTime = Date.now();
  const monitor = PerformanceMonitor.getInstance();

  try {
    await next();
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Record API metric
    monitor.recordApiMetric({
      endpoint: c.req.path,
      method: c.req.method,
      responseTime,
      statusCode: c.res.status,
      timestamp: new Date().toISOString(),
      userId: c.get('userId'),
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
      userAgent: c.req.header('user-agent') || 'unknown',
    });

    // Add performance headers
    c.header('X-Response-Time', `${responseTime}ms`);
    c.header('X-Performance-Monitor', 'enabled');

  } catch (error) {
    // Record error metric
    monitor.recordError({
      endpoint: c.req.path,
      method: c.req.method,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      userId: c.get('userId'),
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
    });

    throw error;
  }
};

// Database monitoring wrapper
export const monitorDatabaseQuery = async <T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const monitor = PerformanceMonitor.getInstance();
  const startTime = Date.now();

  try {
    const result = await queryFn();
    
    monitor.recordDbMetric({
      query: queryName,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      success: true,
    });

    return result;
  } catch (error) {
    monitor.recordDbMetric({
      query: queryName,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      success: false,
    });

    throw error;
  }
};

// Cache monitoring wrapper
export const monitorCacheOperation = async <T>(
  operation: 'get' | 'set' | 'delete',
  key: string,
  operationFn: () => Promise<T>
): Promise<T> => {
  const monitor = PerformanceMonitor.getInstance();
  const startTime = Date.now();

  try {
    const result = await operationFn();
    
    monitor.recordCacheMetric({
      operation,
      key,
      hit: operation === 'get' ? result !== null : true,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });

    return result;
  } catch (error) {
    monitor.recordCacheMetric({
      operation,
      key,
      hit: false,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
};

// Health check endpoint
export const healthCheck = async (c: Context) => {
  const monitor = PerformanceMonitor.getInstance();
  const stats = await monitor.getPerformanceStats();

  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    performance: stats,
  });
};

// Export the monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();
