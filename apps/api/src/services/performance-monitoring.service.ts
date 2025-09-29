import { db } from '../db';
import { performanceMetrics } from '../db/schema';
import { eq, gte, lte, desc } from 'drizzle-orm';

export interface PerformanceMetric {
  id?: string;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  memoryUsage?: number;
  cpuUsage?: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  slowestEndpoints: Array<{
    endpoint: string;
    averageTime: number;
    requestCount: number;
  }>;
  errorEndpoints: Array<{
    endpoint: string;
    errorCount: number;
    errorRate: number;
  }>;
  hourlyStats: Array<{
    hour: string;
    requests: number;
    averageTime: number;
    errors: number;
  }>;
}

export class PerformanceMonitoringService {
  private static instance: PerformanceMonitoringService;
  private metrics: PerformanceMetric[] = [];
  private isEnabled = true;

  static getInstance(): PerformanceMonitoringService {
    if (!PerformanceMonitoringService.instance) {
      PerformanceMonitoringService.instance = new PerformanceMonitoringService();
    }
    return PerformanceMonitoringService.instance;
  }

  /**
   * Record a performance metric
   */
  async recordMetric(metric: PerformanceMetric): Promise<void> {
    try {
      if (!this.isEnabled) return;

      const metricData = {
        id: crypto.randomUUID(),
        endpoint: metric.endpoint,
        method: metric.method,
        responseTime: metric.responseTime,
        statusCode: metric.statusCode,
        userId: metric.userId || null,
        ipAddress: metric.ipAddress || null,
        userAgent: metric.userAgent || null,
        timestamp: metric.timestamp || new Date(),
        memoryUsage: metric.memoryUsage || null,
        cpuUsage: metric.cpuUsage || null,
        errorMessage: metric.errorMessage || null,
        metadata: metric.metadata ? JSON.stringify(metric.metadata) : null,
      };

      // Store in memory for quick access
      this.metrics.push(metricData);

      // Store in database (async)
      this.storeInDatabase(metricData);

      // Keep only last 1000 metrics in memory
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }
    } catch (error) {
      console.error('Error recording performance metric:', error);
    }
  }

  /**
   * Store metric in database
   */
  private async storeInDatabase(metric: any): Promise<void> {
    try {
      await db.insert(performanceMetrics).values(metric);
    } catch (error) {
      console.error('Error storing metric in database:', error);
    }
  }

  /**
   * Get performance statistics
   */
  async getPerformanceStats(
    startDate?: Date,
    endDate?: Date,
    endpoint?: string
  ): Promise<PerformanceStats> {
    try {
      let query = db.select().from(performanceMetrics);

      // Apply filters
      if (startDate) {
        query = query.where(gte(performanceMetrics.timestamp, startDate));
      }
      if (endDate) {
        query = query.where(lte(performanceMetrics.timestamp, endDate));
      }
      if (endpoint) {
        query = query.where(eq(performanceMetrics.endpoint, endpoint));
      }

      const metrics = await query.orderBy(desc(performanceMetrics.timestamp));

      // Calculate statistics
      const totalRequests = metrics.length;
      const averageResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests || 0;
      const errorCount = metrics.filter(m => m.statusCode >= 400).length;
      const errorRate = (errorCount / totalRequests) * 100 || 0;

      // Group by endpoint for slowest endpoints
      const endpointStats = new Map<string, { totalTime: number; count: number }>();
      metrics.forEach(metric => {
        const key = `${metric.method} ${metric.endpoint}`;
        const existing = endpointStats.get(key) || { totalTime: 0, count: 0 };
        endpointStats.set(key, {
          totalTime: existing.totalTime + metric.responseTime,
          count: existing.count + 1,
        });
      });

      const slowestEndpoints = Array.from(endpointStats.entries())
        .map(([endpoint, stats]) => ({
          endpoint,
          averageTime: stats.totalTime / stats.count,
          requestCount: stats.count,
        }))
        .sort((a, b) => b.averageTime - a.averageTime)
        .slice(0, 10);

      // Group by endpoint for error endpoints
      const errorStats = new Map<string, { errors: number; total: number }>();
      metrics.forEach(metric => {
        const key = `${metric.method} ${metric.endpoint}`;
        const existing = errorStats.get(key) || { errors: 0, total: 0 };
        errorStats.set(key, {
          errors: existing.errors + (metric.statusCode >= 400 ? 1 : 0),
          total: existing.total + 1,
        });
      });

      const errorEndpoints = Array.from(errorStats.entries())
        .filter(([, stats]) => stats.errors > 0)
        .map(([endpoint, stats]) => ({
          endpoint,
          errorCount: stats.errors,
          errorRate: (stats.errors / stats.total) * 100,
        }))
        .sort((a, b) => b.errorRate - a.errorRate)
        .slice(0, 10);

      // Hourly statistics
      const hourlyStats = new Map<string, { requests: number; totalTime: number; errors: number }>();
      metrics.forEach(metric => {
        const hour = new Date(metric.timestamp).toISOString().slice(0, 13) + ':00:00';
        const existing = hourlyStats.get(hour) || { requests: 0, totalTime: 0, errors: 0 };
        hourlyStats.set(hour, {
          requests: existing.requests + 1,
          totalTime: existing.totalTime + metric.responseTime,
          errors: existing.errors + (metric.statusCode >= 400 ? 1 : 0),
        });
      });

      const hourlyStatsArray = Array.from(hourlyStats.entries())
        .map(([hour, stats]) => ({
          hour,
          requests: stats.requests,
          averageTime: stats.totalTime / stats.requests,
          errors: stats.errors,
        }))
        .sort((a, b) => a.hour.localeCompare(b.hour));

      return {
        totalRequests,
        averageResponseTime,
        errorRate,
        slowestEndpoints,
        errorEndpoints,
        hourlyStats: hourlyStatsArray,
      };
    } catch (error) {
      console.error('Error getting performance stats:', error);
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        slowestEndpoints: [],
        errorEndpoints: [],
        hourlyStats: [],
      };
    }
  }

  /**
   * Get real-time metrics
   */
  getRealTimeMetrics(): PerformanceMetric[] {
    // Return last 100 metrics from memory
    return this.metrics.slice(-100);
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    metrics: {
      averageResponseTime: number;
      errorRate: number;
      memoryUsage: number;
      cpuUsage: number;
    };
    alerts: string[];
  }> {
    try {
      const stats = await this.getPerformanceStats();
      const alerts: string[] = [];

      // Check response time
      if (stats.averageResponseTime > 2000) {
        alerts.push('Yüksek yanıt süresi tespit edildi');
      }

      // Check error rate
      if (stats.errorRate > 5) {
        alerts.push('Yüksek hata oranı tespit edildi');
      }

      // Check memory usage (mock data)
      const memoryUsage = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100;
      if (memoryUsage > 80) {
        alerts.push('Yüksek bellek kullanımı tespit edildi');
      }

      // Check CPU usage - gerçek sistem bilgisi kullan
      const cpuUsage = process.cpuUsage().user / 1000000; // Convert to seconds
      if (cpuUsage > 80) {
        alerts.push('Yüksek CPU kullanımı tespit edildi');
      }

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (alerts.length > 0) {
        status = alerts.length > 2 ? 'critical' : 'warning';
      }

      return {
        status,
        metrics: {
          averageResponseTime: stats.averageResponseTime,
          errorRate: stats.errorRate,
          memoryUsage,
          cpuUsage,
        },
        alerts,
      };
    } catch (error) {
      console.error('Error getting system health:', error);
      return {
        status: 'critical',
        metrics: {
          averageResponseTime: 0,
          errorRate: 100,
          memoryUsage: 0,
          cpuUsage: 0,
        },
        alerts: ['Sistem sağlık kontrolü başarısız'],
      };
    }
  }

  /**
   * Get performance alerts
   */
  async getPerformanceAlerts(): Promise<Array<{
    id: string;
    type: 'slow_response' | 'high_error_rate' | 'memory_usage' | 'cpu_usage';
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    resolved: boolean;
  }>> {
    try {
      // Get recent metrics
      const recentMetrics = this.metrics.slice(-100);
      const alerts: any[] = [];

      // Check for slow responses
      const slowResponses = recentMetrics.filter(m => m.responseTime > 3000);
      if (slowResponses.length > 5) {
        alerts.push({
          id: crypto.randomUUID(),
          type: 'slow_response',
          message: `${slowResponses.length} yavaş yanıt tespit edildi`,
          severity: 'high',
          timestamp: new Date(),
          resolved: false,
        });
      }

      // Check for high error rate
      const errors = recentMetrics.filter(m => m.statusCode >= 400);
      if (errors.length > 10) {
        alerts.push({
          id: crypto.randomUUID(),
          type: 'high_error_rate',
          message: `${errors.length} hata tespit edildi`,
          severity: 'critical',
          timestamp: new Date(),
          resolved: false,
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error getting performance alerts:', error);
      return [];
    }
  }

  /**
   * Clean up old metrics
   */
  async cleanupOldMetrics(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      await db
        .delete(performanceMetrics)
        .where(lte(performanceMetrics.timestamp, cutoffDate));

      console.log(`Cleaned up performance metrics older than ${daysToKeep} days`);
    } catch (error) {
      console.error('Error cleaning up old metrics:', error);
    }
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`Performance monitoring ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get monitoring status
   */
  getStatus(): { enabled: boolean; metricsCount: number } {
    return {
      enabled: this.isEnabled,
      metricsCount: this.metrics.length,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = [];
    console.log('Performance metrics reset');
  }
}

// Export singleton instance
export const performanceMonitoringService = PerformanceMonitoringService.getInstance();
export default performanceMonitoringService;
