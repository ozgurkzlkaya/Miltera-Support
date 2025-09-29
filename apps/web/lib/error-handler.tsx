// Enhanced Error Handling System
import React from 'react';

interface ErrorContext {
  userId?: string;
  userRole?: string;
  component?: string;
  action?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
  stack?: string;
}

interface ErrorReport {
  id: string;
  message: string;
  type: 'api' | 'render' | 'validation' | 'network' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: ErrorContext;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

class ErrorHandler {
  private errors: ErrorReport[] = [];
  private maxErrors = 100;
  private reportEndpoint = '/api/v1/errors';

  constructor() {
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message,
        type: 'render',
        severity: 'high',
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        type: 'api',
        severity: 'medium',
        stack: event.reason?.stack,
      });
    });
  }

  public handleError(error: {
    message: string;
    type: ErrorReport['type'];
    severity: ErrorReport['severity'];
    stack?: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    context?: Partial<ErrorContext>;
  }) {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: error.message,
      type: error.type,
      severity: error.severity,
      context: {
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        stack: error.stack,
        ...error.context,
      },
      resolved: false,
    };

    this.errors.push(errorReport);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Error Handler] ${error.severity.toUpperCase()}: ${error.message}`, {
        type: error.type,
        context: errorReport.context,
        stack: error.stack,
      });
    }

    // Report critical errors immediately
    if (error.severity === 'critical') {
      this.reportError(errorReport);
    }

    return errorReport.id;
  }

  public handleApiError(error: any, context?: Partial<ErrorContext>) {
    let message = 'API Error';
    let severity: ErrorReport['severity'] = 'medium';

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      message = `API Error ${status}: ${error.response.data?.message || error.message}`;
      
      if (status >= 500) {
        severity = 'high';
      } else if (status === 401 || status === 403) {
        severity = 'medium';
      } else {
        severity = 'low';
      }
    } else if (error.request) {
      // Network error
      message = 'Network Error: Unable to connect to server';
      severity = 'high';
    } else {
      // Other error
      message = error.message || 'Unknown API Error';
      severity = 'medium';
    }

    return this.handleError({
      message,
      type: 'api',
      severity,
      stack: error.stack,
      context,
    });
  }

  public handleValidationError(errors: any[], context?: Partial<ErrorContext>) {
    const message = `Validation Error: ${errors.map(e => e.message).join(', ')}`;
    
    return this.handleError({
      message,
      type: 'validation',
      severity: 'low',
      context,
    });
  }

  public handleNetworkError(error: any, context?: Partial<ErrorContext>) {
    return this.handleError({
      message: `Network Error: ${error.message}`,
      type: 'network',
      severity: 'high',
      stack: error.stack,
      context,
    });
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async reportError(errorReport: ErrorReport) {
    try {
      const token = localStorage.getItem('auth_token');
      
      await fetch(this.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(errorReport),
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  public getErrors(filter?: {
    type?: ErrorReport['type'];
    severity?: ErrorReport['severity'];
    resolved?: boolean;
  }) {
    let filteredErrors = [...this.errors];

    if (filter?.type) {
      filteredErrors = filteredErrors.filter(e => e.type === filter.type);
    }

    if (filter?.severity) {
      filteredErrors = filteredErrors.filter(e => e.severity === filter.severity);
    }

    if (filter?.resolved !== undefined) {
      filteredErrors = filteredErrors.filter(e => e.resolved === filter.resolved);
    }

    return filteredErrors;
  }

  public getErrorSummary() {
    const total = this.errors.length;
    const unresolved = this.errors.filter(e => !e.resolved).length;
    const byType = this.errors.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const bySeverity = this.errors.reduce((acc, e) => {
      acc[e.severity] = (acc[e.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      unresolved,
      byType,
      bySeverity,
    };
  }

  public markErrorResolved(errorId: string, resolvedBy?: string) {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      error.resolvedAt = new Date();
      error.resolvedBy = resolvedBy;
    }
  }

  public clearResolvedErrors() {
    this.errors = this.errors.filter(e => !e.resolved);
  }
}

// React Hook for Error Handling
export function useErrorHandler() {
  const errorHandler = new ErrorHandler();
  
  return {
    handleError: errorHandler.handleError.bind(errorHandler),
    handleApiError: errorHandler.handleApiError.bind(errorHandler),
    handleValidationError: errorHandler.handleValidationError.bind(errorHandler),
    handleNetworkError: errorHandler.handleNetworkError.bind(errorHandler),
    getErrors: errorHandler.getErrors.bind(errorHandler),
    getErrorSummary: errorHandler.getErrorSummary.bind(errorHandler),
    markErrorResolved: errorHandler.markErrorResolved.bind(errorHandler),
    clearResolvedErrors: errorHandler.clearResolvedErrors.bind(errorHandler),
  };
}

// Higher-order component for error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) {
  return class ErrorBoundary extends React.Component<P, { hasError: boolean; error?: Error }> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      const errorHandler = new ErrorHandler();
      errorHandler.handleError({
        message: error.message,
        type: 'render',
        severity: 'high',
        stack: error.stack,
        context: {
          component: Component.displayName || Component.name,
          action: 'componentDidCatch',
        },
      });
    }

    render() {
      if (this.state.hasError) {
        if (fallback) {
          return React.createElement(fallback, {
            error: this.state.error!,
            resetError: () => this.setState({ hasError: false, error: undefined }),
          });
        }

        return (
          <div className="error-boundary">
            <h2>Something went wrong</h2>
            <p>{this.state.error?.message}</p>
            <button onClick={() => this.setState({ hasError: false, error: undefined })}>
              Try again
            </button>
          </div>
        );
      }

      return React.createElement(Component, this.props);
    }
  };
}

export default ErrorHandler;
