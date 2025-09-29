// Enhanced API Client with performance monitoring and error handling
export class APIClient {
  private baseUrl: string;
  private defaultTimeout = 10000; // 10 seconds
  private defaultRetries = 3;
  private defaultRetryDelay = 1000; // 1 second

  constructor(baseUrl: string = 'http://localhost:3015/api/v1') {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit & {
      timeout?: number;
      retries?: number;
      retryDelay?: number;
    } = {}
  ): Promise<T> {
    const { 
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      ...requestOptions 
    } = options;

    const token = localStorage.getItem('auth_token');
    
    const config: RequestInit = {
      ...requestOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...requestOptions.headers,
      },
    };

    return this.executeWithRetry<T>(endpoint, config, retries, retryDelay, timeout);
  }

  private async executeWithRetry<T>(
    endpoint: string,
    config: RequestInit,
    retries: number,
    retryDelay: number,
    timeout: number
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      const startTime = performance.now();
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Log performance metrics
        this.logPerformanceMetrics(endpoint, {
          duration,
          status: response.status,
          attempt: attempt + 1,
        });

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            // If response is not JSON, use default error message
          }
          
          const error = new Error(errorMessage) as any;
          error.status = response.status;
          error.isRetryable = this.isRetryableError(response.status);
          
          if (error.isRetryable && attempt < retries) {
            lastError = error;
            await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
            continue;
          }
          
          throw error;
        }

        // Handle empty responses (like DELETE operations)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
          return {} as T;
        }

        return response.json();
      } catch (error: unknown) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.logPerformanceMetrics(endpoint, {
          duration,
          error: error instanceof Error ? error.message : String(error),
          attempt: attempt + 1,
        });

        if (error instanceof Error && error.name === 'AbortError') {
          const timeoutError = new Error(`Request timeout after ${timeout}ms`);
          timeoutError.name = 'TimeoutError';
          throw timeoutError;
        }

        if (error instanceof Error && error.name === 'TypeError' && error.message === 'Failed to fetch') {
          const networkError = new Error('Network error: Unable to connect to server');
          networkError.name = 'NetworkError';
          
          if (attempt < retries) {
            lastError = networkError;
            await this.delay(retryDelay * Math.pow(2, attempt));
            continue;
          }
          
          throw networkError;
        }

        if (error instanceof Error && (error as any).isRetryable && attempt < retries) {
          lastError = error;
          await this.delay(retryDelay * Math.pow(2, attempt));
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  private isRetryableError(status: number): boolean {
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private logPerformanceMetrics(endpoint: string, metrics: {
    duration: number;
    status?: number;
    error?: string;
    attempt: number;
  }) {
    if (process.env.NODE_ENV === 'development') {
      const method = 'GET'; // Could be extracted from config
      const status = metrics.status ? `(${metrics.status})` : '(error)';
      // Performance logging disabled for production
    }

    // You could send metrics to analytics service here
    // this.sendMetricsToAnalytics(endpoint, metrics);
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const url = searchParams.toString() 
      ? `${endpoint}?${searchParams}` 
      : endpoint;
    
    return this.makeRequest<T>(url, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

// Default API client instance
export const apiClient = new APIClient();

// Specialized API clients for different modules
export const productsAPI = new APIClient('http://localhost:3015/api/v1/products');
export const companiesAPI = new APIClient('http://localhost:3015/api/v1/companies');
export const issuesAPI = new APIClient('http://localhost:3015/api/v1/issues');
export const warehouseAPI = new APIClient('http://localhost:3015/api/v1/warehouse');
export const serviceOperationsAPI = new APIClient('http://localhost:3015/api/v1/service-operations');
export const notificationsAPI = new APIClient('http://localhost:3015/api/v1/notifications');

// Response types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Utility functions
export const handleAPIError = (error: unknown): string => {
  if (error instanceof APIError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes('Network error');
};

export const isAuthError = (error: unknown): boolean => {
  return error instanceof APIError && error.status === 401;
};
