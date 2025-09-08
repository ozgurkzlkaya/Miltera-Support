import { z } from "../lib/zod";
import { buildResponseSuccessSchema } from "../helpers/response.helpers";

// Base shipment schema
export const ShipmentBaseSchema = z.object({
  type: z.enum(['SALES', 'SERVICE_RETURN', 'SERVICE_SEND']),
  companyId: z.string().uuid(),
  issueId: z.string().uuid().optional(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().datetime().optional(),
  actualDelivery: z.string().datetime().optional(),
  totalCost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// Create shipment schema
export const ShipmentCreateSchema = ShipmentBaseSchema.extend({
  productIds: z.array(z.string().uuid()).min(1, "En az bir ürün seçilmelidir"),
});

// Update shipment schema
export const ShipmentUpdateSchema = ShipmentBaseSchema.partial();

// Status update schema
export const ShipmentStatusUpdateSchema = z.object({
  status: z.enum(['PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

// Shipment item schema
export const ShipmentItemSchema = z.object({
  id: z.string().uuid(),
  shipmentId: z.string().uuid(),
  productId: z.string().uuid(),
  product: z.object({
    id: z.string().uuid(),
    serialNumber: z.string().nullable(),
    status: z.enum([
      'FIRST_PRODUCTION',
      'FIRST_PRODUCTION_ISSUE',
      'FIRST_PRODUCTION_SCRAPPED',
      'READY_FOR_SHIPMENT',
      'SHIPPED',
      'ISSUE_CREATED',
      'RECEIVED',
      'PRE_TEST_COMPLETED',
      'UNDER_REPAIR',
      'SERVICE_SCRAPPED',
      'DELIVERED'
    ]),
    productModel: z.object({
      id: z.string().uuid(),
      name: z.string(),
      productType: z.object({
        id: z.string().uuid(),
        name: z.string(),
      }),
      manufacturer: z.object({
        id: z.string().uuid(),
        name: z.string(),
      }),
    }),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Company schema for shipment
export const CompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  contactPersonName: z.string().nullable(),
  contactPersonSurname: z.string().nullable(),
  contactPersonEmail: z.string().nullable(),
  contactPersonPhone: z.string().nullable(),
});

// Issue schema for shipment
export const IssueSchema = z.object({
  id: z.string().uuid(),
  issueNumber: z.string(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER_APPROVAL', 'REPAIRED', 'CLOSED', 'CANCELLED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  customerDescription: z.string().nullable(),
  issueDate: z.string().datetime(),
});

// User schema for shipment
export const UserSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  role: z.enum(['ADMIN', 'TSP', 'CUSTOMER']),
});

// Main shipment schema
export const ShipmentSchema = z.object({
  id: z.string().uuid(),
  shipmentNumber: z.string(),
  type: z.enum(['SALES', 'SERVICE_RETURN', 'SERVICE_SEND']),
  status: z.enum(['PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  company: CompanySchema,
  issue: IssueSchema.optional(),
  trackingNumber: z.string().nullable(),
  estimatedDelivery: z.string().datetime().nullable(),
  actualDelivery: z.string().datetime().nullable(),
  totalCost: z.number().nullable(),
  notes: z.string().nullable(),
  createdBy: UserSchema,
  updatedBy: UserSchema,
  items: z.array(ShipmentItemSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Shipment list item schema (simplified for list view)
export const ShipmentListItemSchema = z.object({
  id: z.string().uuid(),
  shipmentNumber: z.string(),
  type: z.enum(['SALES', 'SERVICE_RETURN', 'SERVICE_SEND']),
  status: z.enum(['PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  company: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  trackingNumber: z.string().nullable(),
  estimatedDelivery: z.string().datetime().nullable(),
  actualDelivery: z.string().datetime().nullable(),
  totalCost: z.number().nullable(),
  itemCount: z.number(),
  createdBy: z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Pagination schema
export const PaginationSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
  itemsPerPage: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

// Shipment list response schema
export const ShipmentListSchema = z.object({
  items: z.array(ShipmentListItemSchema),
  pagination: PaginationSchema,
});

// Shipment statistics schema
export const ShipmentStatsSchema = z.object({
  totalShipments: z.number(),
  preparingShipments: z.number(),
  shippedShipments: z.number(),
  deliveredShipments: z.number(),
  cancelledShipments: z.number(),
  salesShipments: z.number(),
  serviceShipments: z.number(),
});

// Response schemas
export const ShipmentResponseSchema = buildResponseSuccessSchema(ShipmentSchema);
export const ShipmentListResponseSchema = buildResponseSuccessSchema(ShipmentListSchema);
export const ShipmentStatsResponseSchema = buildResponseSuccessSchema(ShipmentStatsSchema);

// Type exports
export type Shipment = z.infer<typeof ShipmentSchema>;
export type ShipmentListItem = z.infer<typeof ShipmentListItemSchema>;
export type ShipmentCreate = z.infer<typeof ShipmentCreateSchema>;
export type ShipmentUpdate = z.infer<typeof ShipmentUpdateSchema>;
export type ShipmentStatusUpdate = z.infer<typeof ShipmentStatusUpdateSchema>;
export type ShipmentStats = z.infer<typeof ShipmentStatsSchema>;
export type ShipmentList = z.infer<typeof ShipmentListSchema>; 