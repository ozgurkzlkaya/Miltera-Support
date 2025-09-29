// Enhanced Reports Service with real API calls
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

class ReportsService {
  private baseUrl = 'http://localhost:3015/api/v1/reports';

  private async makeRequest(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch data`);
    }
    
    return response.json();
  }

  // Dashboard Statistics
  async getDashboardStats() {
    return this.makeRequest(`${this.baseUrl}/dashboard`);
  }

  // Companies Count
  async getCompaniesCount() {
    return this.makeRequest(`${this.baseUrl}/companies-count`);
  }

  // Users Count
  async getUsersCount() {
    return this.makeRequest(`${this.baseUrl}/users-count`);
  }

  // Recent Activity
  async getRecentActivity(limit?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const url = params.toString() 
      ? `${this.baseUrl}/recent-activity?${params}` 
      : `${this.baseUrl}/recent-activity`;
    
    return this.makeRequest(url);
  }

  // Trends Data
  async getTrendsData(days?: number) {
    const params = new URLSearchParams();
    if (days) params.append('days', days.toString());
    
    const url = params.toString() 
      ? `${this.baseUrl}/trends?${params}` 
      : `${this.baseUrl}/trends`;
    
    return this.makeRequest(url);
  }

  // Product Analysis
  async getProductAnalysis(params?: { 
    startDate?: string; 
    endDate?: string; 
    groupBy?: string; 
  }) {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.groupBy) searchParams.append('groupBy', params.groupBy);

    const url = searchParams.toString() 
      ? `${this.baseUrl}/products?${searchParams}` 
      : `${this.baseUrl}/products`;
    
    return this.makeRequest(url);
  }

  // Issue Analysis
  async getIssueAnalysis(params?: { 
    startDate?: string; 
    endDate?: string; 
    category?: string; 
  }) {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.category) searchParams.append('category', params.category);

    const url = searchParams.toString() 
      ? `${this.baseUrl}/issues?${searchParams}` 
      : `${this.baseUrl}/issues`;
    
    return this.makeRequest(url);
  }

  // Performance Report
  async getPerformanceReport(params?: { 
    startDate?: string; 
    endDate?: string; 
    technicianId?: string; 
  }) {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.technicianId) searchParams.append('technicianId', params.technicianId);

    const url = searchParams.toString() 
      ? `${this.baseUrl}/performance?${searchParams}` 
      : `${this.baseUrl}/performance`;
    
    return this.makeRequest(url);
  }

  // Generate Custom Report
  async generateCustomReport(data: {
    reportType: 'products' | 'issues' | 'shipments' | 'performance';
    dateRange: {
      startDate: string;
      endDate: string;
    };
    filters?: Record<string, any>;
    groupBy?: string[];
  }) {
    return this.makeRequest(`${this.baseUrl}/custom`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Export Report
  async exportReport(id: string, format: 'pdf' | 'excel' | 'csv' = 'pdf') {
    const response = await fetch(`${this.baseUrl}/${id}/export?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    return response.blob();
  }
}

export const reportsService = new ReportsService();

// React Query Hooks
export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => reportsService.getDashboardStats(),
    refetchInterval: 30000, // 30 seconds
  });
};

export const useGetCompaniesCount = () => {
  return useQuery({
    queryKey: ["companies-count"],
    queryFn: () => reportsService.getCompaniesCount(),
    refetchInterval: 60000, // 1 minute
  });
};

export const useGetUsersCount = () => {
  return useQuery({
    queryKey: ["users-count"],
    queryFn: () => reportsService.getUsersCount(),
    refetchInterval: 60000, // 1 minute
  });
};

export const useGetRecentActivity = (limit?: number) => {
  return useQuery({
    queryKey: ["recent-activity", limit],
    queryFn: () => reportsService.getRecentActivity(limit),
    refetchInterval: 15000, // 15 seconds
  });
};

export const useGetTrendsData = (days?: number) => {
  return useQuery({
    queryKey: ["trends-data", days],
    queryFn: () => reportsService.getTrendsData(days),
    refetchInterval: 30000, // 30 seconds
  });
};

export const useGetProductAnalysis = (params?: { 
  startDate?: string; 
  endDate?: string; 
  groupBy?: string; 
}) => {
  return useQuery({
    queryKey: ["product-analysis", params],
    queryFn: () => reportsService.getProductAnalysis(params),
  });
};

export const useGetIssueAnalysis = (params?: { 
  startDate?: string; 
  endDate?: string; 
  category?: string; 
}) => {
  return useQuery({
    queryKey: ["issue-analysis", params],
    queryFn: () => reportsService.getIssueAnalysis(params),
  });
};

export const useGetPerformanceReport = (params?: { 
  startDate?: string; 
  endDate?: string; 
  technicianId?: string; 
}) => {
  return useQuery({
    queryKey: ["performance-report", params],
    queryFn: () => reportsService.getPerformanceReport(params),
  });
};

export const useGenerateCustomReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      reportType: 'products' | 'issues' | 'shipments' | 'performance';
      dateRange: {
        startDate: string;
        endDate: string;
      };
      filters?: Record<string, any>;
      groupBy?: string[];
    }) => reportsService.generateCustomReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

export const useExportReport = () => {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'pdf' | 'excel' | 'csv' }) => 
      reportsService.exportReport(id, format),
  });
};
