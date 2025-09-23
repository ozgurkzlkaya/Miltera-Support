import { z } from 'zod';

// API Response schemas
const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  message: z.string().optional(),
});

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

const ProductAnalysisSchema = z.object({
  totalProducts: z.number(),
  productsByStatus: z.record(z.string(), z.number()),
  warrantyStatus: z.record(z.string(), z.number()),
  monthlyProduction: z.array(z.object({
    month: z.string(),
    count: z.number(),
  })),
});

const IssueAnalysisSchema = z.object({
  totalIssues: z.number(),
  issuesByPriority: z.record(z.string(), z.number()),
  averageResolutionTime: z.number(),
  issuesByMonth: z.array(z.object({
    month: z.string(),
    count: z.number(),
  })),
});

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

// API Client
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api/v1';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  // Generic HTTP methods
  async get<T>(endpoint: string, options?: { params?: Record<string, any> }): Promise<{ data: T }> {
    let url = endpoint;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v.toString()));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
      url += `?${searchParams.toString()}`;
    }
    return this.request<{ data: T }>(url);
  }

  async post<T>(endpoint: string, data?: any): Promise<{ data: T }> {
    return this.request<{ data: T }>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<{ data: T }> {
    return this.request<{ data: T }>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<{ data: T }> {
    return this.request<{ data: T }>(endpoint, {
      method: 'DELETE',
    });
  }

  // Dashboard API methods
  async getDashboardStats() {
    const response = await this.request<{ success: boolean; data: any }>('/reports/dashboard');
    return ApiResponseSchema.parse(response).data as z.infer<typeof DashboardStatsSchema>;
  }

  async getProductAnalysis(params?: { startDate?: string; endDate?: string }) {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const endpoint = `/reports/products${queryParams ? `?${queryParams}` : ''}`;
    const response = await this.request<{ success: boolean; data: any }>(endpoint);
    return ApiResponseSchema.parse(response).data as z.infer<typeof ProductAnalysisSchema>;
  }

  async getIssueAnalysis(params?: { startDate?: string; endDate?: string; category?: string }) {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const endpoint = `/reports/issues${queryParams ? `?${queryParams}` : ''}`;
    const response = await this.request<{ success: boolean; data: any }>(endpoint);
    return ApiResponseSchema.parse(response).data as z.infer<typeof IssueAnalysisSchema>;
  }

  async getPerformanceReport(params?: { startDate?: string; endDate?: string; technicianId?: string }) {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const endpoint = `/reports/performance${queryParams ? `?${queryParams}` : ''}`;
    const response = await this.request<{ success: boolean; data: any }>(endpoint);
    return ApiResponseSchema.parse(response).data as z.infer<typeof PerformanceReportSchema>;
  }

  // Yeni API metodları
  async getCompaniesCount() {
    const response = await this.request<{ success: boolean; data: any }>('/reports/companies-count');
    return ApiResponseSchema.parse(response).data.count as number;
  }

  async getUsersCount() {
    const response = await this.request<{ success: boolean; data: any }>('/reports/users-count');
    return ApiResponseSchema.parse(response).data.count as number;
  }

  async getRecentActivity(params?: { limit?: number }) {
    const queryParams = params ? new URLSearchParams({ limit: params.limit?.toString() || '20' }).toString() : '';
    const endpoint = `/reports/recent-activity${queryParams ? `?${queryParams}` : ''}`;
    const response = await this.request<{ success: boolean; data: any }>(endpoint);
    return ApiResponseSchema.parse(response).data as Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      timestamp: string;
      status?: string;
      priority?: string;
    }>;
  }

  async getTrendsData(params?: { days?: number }) {
    const queryParams = params ? new URLSearchParams({ days: params.days?.toString() || '7' }).toString() : '';
    const endpoint = `/reports/trends${queryParams ? `?${queryParams}` : ''}`;
    const response = await this.request<{ success: boolean; data: any }>(endpoint);
    return ApiResponseSchema.parse(response).data as {
      issuesCreated: number;
      issuesResolved: number;
      productsAdded: number;
      shipmentsCreated: number;
    };
  }

  // Müşteri portalı için özel metodlar
  async getCustomerIssues(customerId: string) {
    const response = await this.request<{ success: boolean; data: any }>(`/issues?customerId=${customerId}`);
    return ApiResponseSchema.parse(response).data;
  }

  async getCustomerProducts(customerId: string) {
    const response = await this.request<{ success: boolean; data: any }>(`/products?companyId=${customerId}`);
    return ApiResponseSchema.parse(response).data;
  }

  async createCustomerIssue(issueData: any) {
    const response = await this.request<{ success: boolean; data: any }>('/issues', {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
    return ApiResponseSchema.parse(response).data;
  }

  // Arama metodları
  async searchProducts(params: {
    query?: string;
    status?: string[];
    warrantyStatus?: string[];
    serialNumber?: string;
    dateRange?: { startDate: string; endDate: string };
  }) {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.status) params.status.forEach(s => queryParams.append('status', s));
    if (params.warrantyStatus) params.warrantyStatus.forEach(w => queryParams.append('warrantyStatus', w));
    if (params.serialNumber) queryParams.append('serialNumber', params.serialNumber);
    if (params.dateRange) {
      queryParams.append('startDate', params.dateRange.startDate);
      queryParams.append('endDate', params.dateRange.endDate);
    }

    const endpoint = `/products/search?${queryParams.toString()}`;
    const response = await this.request<{ success: boolean; data: any }>(endpoint);
    return ApiResponseSchema.parse(response).data;
  }

  async searchIssues(params: {
    query?: string;
    status?: string[];
    priority?: string[];
    category?: string[];
    issueNumber?: string;
    dateRange?: { startDate: string; endDate: string };
  }) {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.status) params.status.forEach(s => queryParams.append('status', s));
    if (params.priority) params.priority.forEach(p => queryParams.append('priority', p));
    if (params.category) params.category.forEach(c => queryParams.append('category', c));
    if (params.issueNumber) queryParams.append('issueNumber', params.issueNumber);
    if (params.dateRange) {
      queryParams.append('startDate', params.dateRange.startDate);
      queryParams.append('endDate', params.dateRange.endDate);
    }

    const endpoint = `/issues/search?${queryParams.toString()}`;
    const response = await this.request<{ success: boolean; data: any }>(endpoint);
    return ApiResponseSchema.parse(response).data;
  }

  async searchShipments(params: {
    query?: string;
    status?: string[];
    shipmentNumber?: string;
    dateRange?: { startDate: string; endDate: string };
  }) {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.status) params.status.forEach(s => queryParams.append('status', s));
    if (params.shipmentNumber) queryParams.append('shipmentNumber', params.shipmentNumber);
    if (params.dateRange) {
      queryParams.append('startDate', params.dateRange.startDate);
      queryParams.append('endDate', params.dateRange.endDate);
    }

    const endpoint = `/shipments/search?${queryParams.toString()}`;
    const response = await this.request<{ success: boolean; data: any }>(endpoint);
    return ApiResponseSchema.parse(response).data;
  }
}

export const apiClient = new ApiClient();
