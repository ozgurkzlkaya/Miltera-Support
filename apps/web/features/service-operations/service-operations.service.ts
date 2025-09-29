// Real API calls with fetch
class ServiceOperationsAPI {
  private baseUrl = 'http://localhost:3015/api/v1/service-operations';

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

  // Basic CRUD Operations
  async getOperations(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const url = searchParams.toString() 
      ? `${this.baseUrl}?${searchParams}` 
      : this.baseUrl;
    
    return this.makeRequest(url);
  }

  async getOperation(id: string) {
    return this.makeRequest(`${this.baseUrl}/${id}`);
  }

  async createOperation(data: any) {
    return this.makeRequest(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOperation(id: string, data: any) {
    return this.makeRequest(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Workflow Operations
  async createWorkflow(data: any) {
    return this.makeRequest(`${this.baseUrl}/workflow`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createRepairSummary(data: any) {
    return this.makeRequest(`${this.baseUrl}/repair-summary`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Statistics and Reports
  async getStats() {
    return this.makeRequest(`${this.baseUrl}/stats`);
  }

  async getTechnicianPerformance(params?: { dateFrom?: string; dateTo?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo);
    
    const url = searchParams.toString() 
      ? `${this.baseUrl}/technician-performance?${searchParams}` 
      : `${this.baseUrl}/technician-performance`;
    
    return this.makeRequest(url);
  }

  async getNonWarrantyOperations() {
    return this.makeRequest(`${this.baseUrl}/non-warranty`);
  }
}

export const serviceOperationsAPI = new ServiceOperationsAPI();

// Types
export interface ServiceOperation {
  id: string;
  issueId: string;
  issueProductId: string | null;
  operationType: 'HARDWARE_VERIFICATION' | 'CONFIGURATION' | 'PRE_TEST' | 'REPAIR' | 'FINAL_TEST' | 'QUALITY_CHECK';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description: string;
  findings?: string;
  actionsTaken?: string;
  isUnderWarranty: boolean;
  cost?: number;
  duration?: number;
  operationDate: string;
  createdAt: string;
  updatedAt: string;
  issue?: {
    id: string;
    issueNumber: string;
    status: string;
  };
  performedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  issueProduct?: {
    id: string;
    product: {
      id: string;
      serialNumber: string | null;
    };
  };
}

export interface ServiceOperationCreate {
  issueId: string;
  issueProductId?: string;
  operationType: 'HARDWARE_VERIFICATION' | 'CONFIGURATION' | 'PRE_TEST' | 'REPAIR' | 'FINAL_TEST' | 'QUALITY_CHECK';
  description: string;
  findings?: string;
  actionsTaken?: string;
  isUnderWarranty: boolean;
  cost?: number;
  duration?: number;
  performedBy: string;
}

export interface ServiceOperationUpdate {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description?: string;
  findings?: string;
  actionsTaken?: string;
  isUnderWarranty?: boolean;
  cost?: number;
  duration?: number;
  updatedBy: string;
}

export interface ServiceOperationList {
  operations: ServiceOperation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ServiceWorkflowOperation {
  operationType: 'HARDWARE_VERIFICATION' | 'CONFIGURATION' | 'PRE_TEST' | 'REPAIR' | 'FINAL_TEST' | 'QUALITY_CHECK';
  description: string;
  findings?: string;
  actionsTaken?: string;
  isUnderWarranty: boolean;
  cost?: number;
  duration?: number;
}

export interface ServiceWorkflow {
  issueId: string;
  operations: ServiceWorkflowOperation[];
  performedBy: string;
}

export interface RepairSummary {
  issueId: string;
  summary: string;
  totalCost: number;
  isUnderWarranty: boolean;
  completedBy: string;
}

export interface ServiceOperationStats {
  operationType: string;
  status: string;
  count: number;
  totalCost: number;
  totalDuration: number;
}

export interface TechnicianPerformance {
  technicianId: string;
  technicianName: string;
  totalOperations: number;
  completedOperations: number;
  totalCost: number;
  totalDuration: number;
  averageDuration: number;
}
