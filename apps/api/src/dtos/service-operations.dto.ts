import { z } from "zod";

// Service Operation Schemas
export const ServiceOperationSchema = z.object({
  id: z.string().uuid(),
  issueId: z.string().uuid(),
  issueProductId: z.string().uuid().nullable(),
  operationType: z.enum([
    'HARDWARE_VERIFICATION',
    'CONFIGURATION',
    'PRE_TEST',
    'REPAIR',
    'FINAL_TEST',
    'QUALITY_CHECK'
  ]),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  description: z.string().min(1, "Açıklama gerekli"),
  findings: z.string().optional(),
  actionsTaken: z.string().optional(),
  isUnderWarranty: z.boolean().default(false),
  cost: z.number().positive().optional(),
  duration: z.number().int().positive().optional(),
  operationDate: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Related data
  issue: z.object({
    id: z.string().uuid(),
    issueNumber: z.string(),
    status: z.string(),
  }).optional(),
  performedBy: z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
  }).optional(),
  issueProduct: z.object({
    id: z.string().uuid(),
    product: z.object({
      id: z.string().uuid(),
      serialNumber: z.string().nullable(),
    }),
  }).optional(),
});

export const ServiceOperationCreateSchema = z.object({
  issueId: z.string().uuid(),
  issueProductId: z.string().uuid().optional(),
  operationType: z.enum([
    'HARDWARE_VERIFICATION',
    'CONFIGURATION',
    'PRE_TEST',
    'REPAIR',
    'FINAL_TEST',
    'QUALITY_CHECK'
  ]),
  description: z.string().min(1, "Açıklama gerekli"),
  findings: z.string().optional(),
  actionsTaken: z.string().optional(),
  isUnderWarranty: z.boolean().default(false),
  cost: z.number().positive().optional(),
  duration: z.number().int().positive().optional(),
  performedBy: z.string().uuid(),
});

export const ServiceOperationUpdateSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  description: z.string().min(1, "Açıklama gerekli").optional(),
  findings: z.string().optional(),
  actionsTaken: z.string().optional(),
  isUnderWarranty: z.boolean().optional(),
  cost: z.number().positive().optional(),
  duration: z.number().int().positive().optional(),
  updatedBy: z.string().uuid(),
});

export const ServiceOperationListSchema = z.object({
  operations: z.array(ServiceOperationSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }),
});

// Service Workflow Schemas
export const ServiceWorkflowOperationSchema = z.object({
  operationType: z.enum([
    'HARDWARE_VERIFICATION',
    'CONFIGURATION',
    'PRE_TEST',
    'REPAIR',
    'FINAL_TEST',
    'QUALITY_CHECK'
  ]),
  description: z.string().min(1, "Açıklama gerekli"),
  findings: z.string().optional(),
  actionsTaken: z.string().optional(),
  isUnderWarranty: z.boolean().default(false),
  cost: z.number().positive().optional(),
  duration: z.number().int().positive().optional(),
});

export const ServiceWorkflowSchema = z.object({
  issueId: z.string().uuid(),
  operations: z.array(ServiceWorkflowOperationSchema),
  performedBy: z.string().uuid(),
});

// Repair Summary Schema
export const RepairSummarySchema = z.object({
  issueId: z.string().uuid(),
  summary: z.string().min(1, "Özet gerekli"),
  totalCost: z.number().positive(),
  isUnderWarranty: z.boolean(),
  completedBy: z.string().uuid(),
});

// Statistics Schemas
export const ServiceOperationStatsSchema = z.array(z.object({
  operationType: z.string(),
  status: z.string(),
  count: z.number().int().min(0),
  totalCost: z.number(),
  totalDuration: z.number(),
}));

// Technician Performance Schema
export const TechnicianPerformanceSchema = z.array(z.object({
  technicianId: z.string().uuid(),
  technicianName: z.string(),
  totalOperations: z.number().int().min(0),
  completedOperations: z.number().int().min(0),
  totalCost: z.number(),
  totalDuration: z.number(),
  averageDuration: z.number(),
}));

// Type exports
export type ServiceOperation = z.infer<typeof ServiceOperationSchema>;
export type ServiceOperationCreate = z.infer<typeof ServiceOperationCreateSchema>;
export type ServiceOperationUpdate = z.infer<typeof ServiceOperationUpdateSchema>;
export type ServiceOperationList = z.infer<typeof ServiceOperationListSchema>;
export type ServiceWorkflow = z.infer<typeof ServiceWorkflowSchema>;
export type ServiceWorkflowOperation = z.infer<typeof ServiceWorkflowOperationSchema>;
export type RepairSummary = z.infer<typeof RepairSummarySchema>;
export type ServiceOperationStats = z.infer<typeof ServiceOperationStatsSchema>;
export type TechnicianPerformance = z.infer<typeof TechnicianPerformanceSchema>;
