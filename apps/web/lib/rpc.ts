/* eslint-disable turbo/no-undeclared-env-vars */

// Simple HTTP client for API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011';

const createApiClient = () => {
  const baseUrl = API_BASE_URL;
  
  const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const url = `${baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return response.text() as T;
  };

  return {
    get: <T>(endpoint: string, options?: RequestInit) => 
      request<T>(endpoint, { ...options, method: 'GET' }),
    
    post: <T>(endpoint: string, data?: any, options?: RequestInit) => 
      request<T>(endpoint, { 
        ...options, 
        method: 'POST', 
        body: data ? JSON.stringify(data) : undefined 
      }),
    
    put: <T>(endpoint: string, data?: any, options?: RequestInit) => 
      request<T>(endpoint, { 
        ...options, 
        method: 'PUT', 
        body: data ? JSON.stringify(data) : undefined 
      }),
    
    delete: <T>(endpoint: string, options?: RequestInit) => 
      request<T>(endpoint, { ...options, method: 'DELETE' }),
    
    patch: <T>(endpoint: string, data?: any, options?: RequestInit) => 
      request<T>(endpoint, { 
        ...options, 
        method: 'PATCH', 
        body: data ? JSON.stringify(data) : undefined 
      }),
  };
};

export const apiClient = createApiClient();

// Create a mock client.api.v1 structure for compatibility with existing services
const createMockApiClient = () => {
  const baseUrl = API_BASE_URL;
  
  const createEndpoint = (path: string) => ({
    get: (options?: any) => {
      const query = options?.query ? `?${new URLSearchParams(options.query).toString()}` : '';
      return fetch(`${baseUrl}/api/v1${path}${query}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json());
    },
    post: (options?: any) => {
      return fetch(`${baseUrl}/api/v1${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: options?.json ? JSON.stringify(options.json) : undefined
      }).then(res => res.json());
    },
    put: (options?: any) => {
      return fetch(`${baseUrl}/api/v1${path}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: options?.json ? JSON.stringify(options.json) : undefined
      }).then(res => res.json());
    },
    delete: (options?: any) => {
      return fetch(`${baseUrl}/api/v1${path}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json());
    }
  });

  const createParamEndpoint = (path: string) => ({
    get: (options?: any) => {
      const param = options?.param;
      const query = options?.query ? `?${new URLSearchParams(options.query).toString()}` : '';
      const url = `${baseUrl}/api/v1${path.replace(':id', param?.id || '')}${query}`;
      return fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json());
    },
    put: (options?: any) => {
      const param = options?.param;
      const url = `${baseUrl}/api/v1${path.replace(':id', param?.id || '')}`;
      return fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: options?.json ? JSON.stringify(options.json) : undefined
      }).then(res => res.json());
    },
    delete: (options?: any) => {
      const param = options?.param;
      const url = `${baseUrl}/api/v1${path.replace(':id', param?.id || '')}`;
      return fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json());
    }
  });

  const createDynamicEndpoint = (path: string) => {
    const endpoint = createEndpoint(path);
    
    // Add support for [":id"] syntax
    endpoint[':id'] = createParamEndpoint(path);
    
    // Add support for additional sub-paths
    if (path === '/products') {
      endpoint.bulk = createEndpoint('/products/bulk');
    }
    
    if (path === '/service-operations') {
      endpoint.workflow = createEndpoint('/service-operations/workflow');
      endpoint['repair-summary'] = createEndpoint('/service-operations/repair-summary');
      endpoint.stats = createEndpoint('/service-operations/stats');
      endpoint['technician-performance'] = createEndpoint('/service-operations/technician-performance');
      endpoint['non-warranty'] = createEndpoint('/service-operations/non-warranty');
    }
    
    return endpoint;
  };

  return {
    api: {
      v1: {
        companies: createDynamicEndpoint('/companies'),
        users: createDynamicEndpoint('/users'),
        products: createDynamicEndpoint('/products'),
        'product-types': createDynamicEndpoint('/product-types'),
        'product-models': createDynamicEndpoint('/product-models'),
        issues: createDynamicEndpoint('/issues'),
        shipments: createDynamicEndpoint('/shipments'),
        locations: createDynamicEndpoint('/locations'),
        warehouse: {
          locations: createDynamicEndpoint('/warehouse/locations'),
          inventory: createEndpoint('/warehouse/inventory'),
          stats: createEndpoint('/warehouse/stats'),
          alerts: createEndpoint('/warehouse/alerts'),
          move: createEndpoint('/warehouse/move'),
          count: createEndpoint('/warehouse/count')
        },
        'service-operations': createDynamicEndpoint('/service-operations'),
        reports: createDynamicEndpoint('/reports'),
        search: createDynamicEndpoint('/search'),
        'file-upload': createDynamicEndpoint('/file-upload'),
        websocket: createDynamicEndpoint('/websocket')
      }
    }
  };
};

// Legacy compatibility
export const client = createMockApiClient();
export const callRPC = async <T>(promise: Promise<T>): Promise<T> => {
  return promise;
};

export const hybridFetch = fetch;
