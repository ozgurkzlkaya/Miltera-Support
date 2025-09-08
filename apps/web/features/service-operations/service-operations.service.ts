import { client } from "../../lib/rpc";

// Service Operations API endpoints
export const serviceOperationsAPI = {
  // Basic CRUD Operations
  getOperations: (params?: { page?: number; limit?: number }) => 
    client.api.v1["service-operations"].get({ query: params }),
  getOperation: (id: string) => 
    client.api.v1["service-operations"][":id"].get({ param: { id } }),
  createOperation: (data: any) => 
    client.api.v1["service-operations"].post({ json: data }),
  updateOperation: (id: string, data: any) => 
    client.api.v1["service-operations"][":id"].put({ param: { id }, json: data }),

  // Workflow Operations
  createWorkflow: (data: any) => 
    client.api.v1["service-operations"].workflow.post({ json: data }),
  createRepairSummary: (data: any) => 
    client.api.v1["service-operations"]["repair-summary"].post({ json: data }),

  // Statistics and Reports
  getStats: () => 
    client.api.v1["service-operations"].stats.get(),
  getTechnicianPerformance: (params?: { dateFrom?: string; dateTo?: string }) => 
    client.api.v1["service-operations"]["technician-performance"].get({ query: params }),
  getNonWarrantyOperations: () => 
    client.api.v1["service-operations"]["non-warranty"].get(),
};

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
