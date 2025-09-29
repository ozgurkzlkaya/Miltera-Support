import { z } from "zod";

// Service Operation Schemas
export const ServiceOperationSchema = z.object({
  id: z.string().uuid(),
  issueId: z.string().uuid().nullable(),
  issueProductId: z.string().uuid().nullable(),
  operationType: z.enum([
    'INITIAL_TEST',           // İlk Test (Fabrikasyon sonrası)
    'FABRICATION_TEST',       // Fabrikasyon Testi
    'HARDWARE_VERIFICATION',  // Donanım Doğrulama
    'CONFIGURATION',          // Konfigürasyon
    'PRE_TEST',              // Ön Test
    'REPAIR',                // Tamir
    'FINAL_TEST',            // Final Test
    'QUALITY_CHECK'          // Kalite Kontrolü
  ]),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  description: z.string().min(1, "Açıklama gerekli"),
  findings: z.string().optional(),
  actionsTaken: z.string().optional(),
  isUnderWarranty: z.boolean().default(false),
  cost: z.number().nonnegative().optional(),
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
  issueId: z.string().uuid().optional().or(z.literal("")),
  issueProductId: z.string().uuid().optional().or(z.literal("")),
  operationType: z.enum([
    'INITIAL_TEST',           // İlk Test (Fabrikasyon sonrası)
    'FABRICATION_TEST',       // Fabrikasyon Testi
    'HARDWARE_VERIFICATION',  // Donanım Doğrulama
    'CONFIGURATION',          // Konfigürasyon
    'PRE_TEST',              // Ön Test
    'REPAIR',                // Tamir
    'FINAL_TEST',            // Final Test
    'QUALITY_CHECK'          // Kalite Kontrolü
  ]),
  description: z.string().min(1, "Açıklama gerekli"),
  findings: z.string().optional().or(z.literal("")),
  actionsTaken: z.string().optional().or(z.literal("")),
  isUnderWarranty: z.boolean().default(false),
  cost: z.number().nonnegative().optional(),
  duration: z.number().int().positive().optional(),
  performedBy: z.string().uuid("Geçerli bir kullanıcı ID'si gerekli"),
});

export const ServiceOperationUpdateSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  operationType: z.enum([
    'INITIAL_TEST',           // İlk Test (Fabrikasyon sonrası)
    'FABRICATION_TEST',       // Fabrikasyon Testi
    'HARDWARE_VERIFICATION',  // Donanım Doğrulama
    'CONFIGURATION',          // Konfigürasyon
    'PRE_TEST',              // Ön Test
    'REPAIR',                // Tamir
    'FINAL_TEST',            // Final Test
    'QUALITY_CHECK'          // Kalite Kontrolü
  ]).optional(),
  description: z.string().min(1, "Açıklama gerekli").optional(),
  findings: z.string().optional(),
  actionsTaken: z.string().optional(),
  isUnderWarranty: z.boolean().optional(),
  cost: z.number().positive().optional(),
  duration: z.number().int().positive().optional(),
  updatedBy: z.string().uuid("Geçerli bir kullanıcı ID'si gerekli"),
});

// Service Workflow Schema
export const ServiceWorkflowSchema = z.object({
  issueId: z.string().uuid(),
  operations: z.array(z.object({
    operationType: z.enum([
      'INITIAL_TEST',           // İlk Test (Fabrikasyon sonrası)
      'FABRICATION_TEST',       // Fabrikasyon Testi
      'HARDWARE_VERIFICATION',  // Donanım Doğrulama
      'CONFIGURATION',          // Konfigürasyon
      'PRE_TEST',              // Ön Test
      'REPAIR',                // Tamir
      'FINAL_TEST',            // Final Test
      'QUALITY_CHECK'          // Kalite Kontrolü
    ]),
    description: z.string().min(1, "Açıklama gerekli"),
    findings: z.string().optional(),
    actionsTaken: z.string().optional(),
    isUnderWarranty: z.boolean().default(false),
    cost: z.number().nonnegative().optional(),
    duration: z.number().int().positive().optional(),
    performedBy: z.string().uuid("Geçerli bir kullanıcı ID'si gerekli"),
  })).min(1, "En az bir operasyon gerekli"),
});

// Repair Summary Schema
export const RepairSummarySchema = z.object({
  issueId: z.string().uuid(),
  totalCost: z.number().positive(),
  totalDuration: z.number().int().positive(),
  isUnderWarranty: z.boolean(),
  completedBy: z.string().uuid("Geçerli bir kullanıcı ID'si gerekli"),
});

// Type exports
export type ServiceOperation = z.infer<typeof ServiceOperationSchema>;
export type ServiceOperationCreate = z.infer<typeof ServiceOperationCreateSchema>;
export type ServiceOperationUpdate = z.infer<typeof ServiceOperationUpdateSchema>;
export type ServiceWorkflow = z.infer<typeof ServiceWorkflowSchema>;
export type RepairSummary = z.infer<typeof RepairSummarySchema>;