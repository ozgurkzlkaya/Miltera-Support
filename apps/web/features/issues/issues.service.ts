// Real API calls with fetch

export interface Issue {
  id: string;
  issueNumber: string;
  source: 'CUSTOMER' | 'TSP' | 'FIRST_PRODUCTION';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER_APPROVAL' | 'REPAIRED' | 'CLOSED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  customerDescription?: string;
  technicianDescription?: string;
  isUnderWarranty: boolean;
  estimatedCost?: number;
  actualCost?: number;
  issueDate: string;
  preInspectionDate?: string;
  repairDate?: string;
  company?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  preInspectedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  repairedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  products?: Array<{
    id: string;
    product: {
      id: string;
      serialNumber: string;
      productModel: {
        name: string;
        productType: {
          name: string;
        };
      };
    };
  }>;
}

export interface IssueFilter {
  status?: string[];
  priority?: string[];
  source?: string[];
  companyId?: string;
  categoryId?: string;
  isUnderWarranty?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface IssueListResponse {
  data: Issue[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters?: IssueFilter;
  };
}

export interface CreateIssueRequest {
  source: 'CUSTOMER' | 'TSP' | 'FIRST_PRODUCTION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  customerDescription?: string;
  technicianDescription?: string;
  isUnderWarranty: boolean;
  estimatedCost?: number;
  companyId?: string;
  categoryId: string;
  productIds?: string[];
}

export interface UpdateIssueRequest {
  status?: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER_APPROVAL' | 'REPAIRED' | 'CLOSED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  customerDescription?: string;
  technicianDescription?: string;
  isUnderWarranty?: boolean;
  estimatedCost?: number;
  actualCost?: number;
  preInspectionDate?: string;
  repairDate?: string;
  preInspectedBy?: string;
  repairedBy?: string;
}

class IssuesService {
  private baseUrl = 'http://localhost:3015/api/v1/issues';

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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getIssues(params?: {
    page?: number;
    limit?: number;
    filters?: IssueFilter;
    sort?: string;
  }): Promise<IssueListResponse> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.set('page', (params?.page || 1).toString());
      searchParams.set('limit', (params?.limit || 20).toString());
      searchParams.set('sort', params?.sort || 'createdAt:desc');
      
      if (params?.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => searchParams.append(key, v.toString()));
            } else {
              searchParams.set(key, value.toString());
            }
          }
        });
      }
      
      const response = await this.makeRequest(`${this.baseUrl}?${searchParams}`);
      return response;
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw new Error('Failed to fetch issues');
    }
  }

  async getIssue(id: string): Promise<Issue> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching issue:', error);
      throw new Error('Failed to fetch issue');
    }
  }

  async createIssue(data: CreateIssueRequest): Promise<Issue> {
    try {
      const response = await this.makeRequest(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.data;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw new Error('Failed to create issue');
    }
  }

  async updateIssue(id: string, data: UpdateIssueRequest): Promise<Issue> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating issue:', error);
      throw new Error('Failed to update issue');
    }
  }

  async deleteIssue(id: string): Promise<void> {
    try {
      await this.makeRequest(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting issue:', error);
      throw new Error('Failed to delete issue');
    }
  }

  async getIssueCategories(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await this.makeRequest('http://localhost:3015/api/v1/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching issue categories:', error);
      throw new Error('Failed to fetch issue categories');
    }
  }

  async getIssueStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    closed: number;
    underWarranty: number;
    outOfWarranty: number;
  }> {
    try {
      const response = await this.makeRequest(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching issue stats:', error);
      throw new Error('Failed to fetch issue stats');
    }
  }
}

export const issuesService = new IssuesService();
