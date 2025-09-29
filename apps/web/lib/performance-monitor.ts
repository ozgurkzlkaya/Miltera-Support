// Performance Monitoring System
import React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  type: 'api' | 'render' | 'navigation' | 'user-interaction';
  metadata?: Record<string, any>;
}

interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, percentage of requests to monitor
  maxMetrics: number; // Maximum number of metrics to keep in memory
  reportInterval: number; // How often to report metrics (ms)
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private config: PerformanceConfig = {
    enabled: true,
    sampleRate: 1.0, // Monitor all requests in development
    maxMetrics: 1000,
    reportInterval: 30000, // 30 seconds
  };
  private reportTimer?: NodeJS.Timeout;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.startReporting();
    }
  }

  private initializeWebVitals() {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      // This would require the web-vitals library
      // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
    }

    // Monitor API response times
    this.interceptFetch();
    
    // Monitor page navigation
    this.monitorNavigation();
  }

  private interceptFetch() {
    const originalFetch = window.fetch;
    const self = this;

    window.fetch = async function(...args) {
      const startTime = performance.now();
      const url = args[0] as string;
      
      try {
        const response = await originalFetch.apply(this, args);
        const endTime = performance.now();
        
        self.recordMetric({
          name: 'api_response_time',
          value: endTime - startTime,
          timestamp: new Date(),
          type: 'api',
          metadata: {
            url,
            status: response.status,
            method: 'GET', // Could be extracted from args
          }
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        self.recordMetric({
          name: 'api_error',
          value: endTime - startTime,
          timestamp: new Date(),
          type: 'api',
          metadata: {
            url,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        });
        
        throw error;
      }
    };
  }

  private monitorNavigation() {
    // Monitor route changes
    let navigationStart = performance.now();
    
    // This would integrate with Next.js router
    // router.events.on('routeChangeStart', () => {
    //   navigationStart = performance.now();
    // });
    
    // router.events.on('routeChangeComplete', () => {
    //   const navigationTime = performance.now() - navigationStart;
    //   this.recordMetric({
    //     name: 'navigation_time',
    //     value: navigationTime,
    //     timestamp: new Date(),
    //     type: 'navigation',
    //   });
    // });
  }

  public recordMetric(metric: PerformanceMetric) {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return;
    }

    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.name}: ${metric.value}ms`, metric.metadata);
    }
  }

  public recordApiCall(url: string, duration: number, status: number, error?: string) {
    this.recordMetric({
      name: 'api_call',
      value: duration,
      timestamp: new Date(),
      type: 'api',
      metadata: {
        url,
        status,
        error,
      }
    });
  }

  public recordRenderTime(componentName: string, duration: number) {
    this.recordMetric({
      name: 'render_time',
      value: duration,
      timestamp: new Date(),
      type: 'render',
      metadata: {
        component: componentName,
      }
    });
  }

  public recordUserInteraction(action: string, duration: number) {
    this.recordMetric({
      name: 'user_interaction',
      value: duration,
      timestamp: new Date(),
      type: 'user-interaction',
      metadata: {
        action,
      }
    });
  }

  public getMetrics(type?: PerformanceMetric['type']) {
    if (type) {
      return this.metrics.filter(m => m.type === type);
    }
    return [...this.metrics];
  }

  public getAverageMetric(name: string, timeWindow?: number) {
    let filteredMetrics = this.metrics.filter(m => m.name === name);
    
    if (timeWindow) {
      const cutoff = new Date(Date.now() - timeWindow);
      filteredMetrics = filteredMetrics.filter(m => m.timestamp > cutoff);
    }
    
    if (filteredMetrics.length === 0) return 0;
    
    const sum = filteredMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / filteredMetrics.length;
  }

  public getPerformanceSummary() {
    const now = new Date();
    const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > last5Minutes);
    
    const apiMetrics = recentMetrics.filter(m => m.type === 'api');
    const renderMetrics = recentMetrics.filter(m => m.type === 'render');
    const navigationMetrics = recentMetrics.filter(m => m.type === 'navigation');
    
    return {
      totalMetrics: this.metrics.length,
      recentMetrics: recentMetrics.length,
      averageApiResponseTime: this.getAverageMetric('api_response_time', 5 * 60 * 1000),
      averageRenderTime: this.getAverageMetric('render_time', 5 * 60 * 1000),
      averageNavigationTime: this.getAverageMetric('navigation_time', 5 * 60 * 1000),
      apiErrors: apiMetrics.filter(m => m.name === 'api_error').length,
      slowApiCalls: apiMetrics.filter(m => m.name === 'api_response_time' && m.value > 1000).length,
      slowRenders: renderMetrics.filter(m => m.value > 100).length,
    };
  }

  private startReporting() {
    this.reportTimer = setInterval(() => {
      this.reportMetrics();
    }, this.config.reportInterval);
  }

  private async reportMetrics() {
    if (this.metrics.length === 0) return;
    
    const summary = this.getPerformanceSummary();
    
    // In development, just log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance Summary]', summary);
    }
    
    // In production, you could send to analytics service
    // await this.sendToAnalytics(summary);
  }

  public destroy() {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
    }
  }
}

// React Hook for Performance Monitoring
export function usePerformanceMonitor() {
  const monitor = new PerformanceMonitor();
  
  return {
    recordApiCall: monitor.recordApiCall.bind(monitor),
    recordRenderTime: monitor.recordRenderTime.bind(monitor),
    recordUserInteraction: monitor.recordUserInteraction.bind(monitor),
    getMetrics: monitor.getMetrics.bind(monitor),
    getAverageMetric: monitor.getAverageMetric.bind(monitor),
    getPerformanceSummary: monitor.getPerformanceSummary.bind(monitor),
  };
}

// Higher-order component for monitoring render times
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    const monitor = usePerformanceMonitor();
    const startTime = performance.now();
    
    React.useEffect(() => {
      const endTime = performance.now();
      monitor.recordRenderTime(
        componentName || Component.displayName || Component.name,
        endTime - startTime
      );
    });
    
    return React.createElement(Component, props);
  };
}

export default PerformanceMonitor;
