import { pgTable, text, timestamp, uuid, boolean, integer, json, pgEnum, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'TSP', 'CUSTOMER']);
export const productStatusEnum = pgEnum('product_status', ['NEW', 'IN_SERVICE', 'REPAIRED', 'SHIPPED', 'DELIVERED', 'SCRAPPED']);
export const issueStatusEnum = pgEnum('issue_status', ['OPEN', 'IN_PROGRESS', 'WAITING_PARTS', 'REPAIRED', 'CLOSED', 'CANCELLED']);
export const issuePriorityEnum = pgEnum('issue_priority', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const warrantyStatusEnum = pgEnum('warranty_status', ['IN_WARRANTY', 'OUT_OF_WARRANTY', 'PENDING']);
export const operationTypeEnum = pgEnum('operation_type', ['INITIAL_TEST', 'REPAIR', 'FINAL_TEST', 'QUALITY_CHECK']);
export const shipmentTypeEnum = pgEnum('shipment_type', ['SALES', 'SERVICE_RETURN', 'SERVICE_SEND']);
export const shipmentStatusEnum = pgEnum('shipment_status', ['PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);

// Companies table
export const companies = pgTable('companies', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    address: text('address'),
    phone: text('phone'),
    email: text('email'),
    taxNumber: text('tax_number'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users table
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    role: userRoleEnum('role').notNull(),
    companyId: uuid('company_id').references(() => companies.id),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Product Types table
export const productTypes = pgTable('product_types', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Product Models table
export const productModels = pgTable('product_models', {
    id: uuid('id').defaultRandom().primaryKey(),
    productTypeId: uuid('product_type_id').references(() => productTypes.id).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Products table
export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    manufacturerId: uuid('manufacturer_id').references(() => companies.id).notNull(),
    productTypeId: uuid('product_type_id').references(() => productTypes.id).notNull(),
    productModelId: uuid('product_model_id').references(() => productModels.id).notNull(),
    serialNumber: text('serial_number'),
    productionDate: timestamp('production_date').notNull(),
    currentStatus: productStatusEnum('current_status').notNull(),
    warrantyStartDate: timestamp('warranty_start_date'),
    warrantyPeriodMonths: integer('warranty_period_months'),
    companyId: uuid('company_id').references(() => companies.id),
    createdById: uuid('created_by_id').references(() => users.id).notNull(),
    lastUpdatedById: uuid('last_updated_by_id').references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Issue Types table
export const issueTypes = pgTable('issue_types', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Issues table
export const issues = pgTable('issues', {
    id: uuid('id').defaultRandom().primaryKey(),
    issueNumber: text('issue_number').notNull().unique(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    customerId: uuid('customer_id').references(() => users.id).notNull(),
    issueTypeId: uuid('issue_type_id').references(() => issueTypes.id).notNull(),
    description: text('description').notNull(),
    status: issueStatusEnum('status').notNull(),
    priority: issuePriorityEnum('priority').notNull(),
    warrantyStatus: warrantyStatusEnum('warranty_status').notNull(),
    estimatedCost: decimal('estimated_cost', { precision: 10, scale: 2 }),
    actualCost: decimal('actual_cost', { precision: 10, scale: 2 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Service Operations table
export const serviceOperations = pgTable('service_operations', {
    id: uuid('id').defaultRandom().primaryKey(),
    issueId: uuid('issue_id').references(() => issues.id).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    operationType: operationTypeEnum('operation_type').notNull(),
    performedById: uuid('performed_by_id').references(() => users.id).notNull(),
    description: text('description').notNull(),
    findings: text('findings'),
    actionsTaken: text('actions_taken'),
    partsUsed: json('parts_used').$type<Array<{ partId: string; quantity: number }>>(),
    testResults: json('test_results'),
    operationDate: timestamp('operation_date').notNull(),
    duration: integer('duration'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Shipments table
export const shipments = pgTable('shipments', {
    id: uuid('id').defaultRandom().primaryKey(),
    shipmentNumber: text('shipment_number').notNull().unique(),
    type: shipmentTypeEnum('type').notNull(),
    companyId: uuid('company_id').references(() => companies.id).notNull(),
    createdById: uuid('created_by_id').references(() => users.id).notNull(),
    status: shipmentStatusEnum('status').notNull(),
    trackingNumber: text('tracking_number'),
    estimatedDelivery: timestamp('estimated_delivery'),
    actualDelivery: timestamp('actual_delivery'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Shipment Items table
export const shipmentItems = pgTable('shipment_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    shipmentId: uuid('shipment_id').references(() => shipments.id).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    quantity: integer('quantity').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
    company: one(companies, {
        fields: [users.companyId],
        references: [companies.id],
    }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    manufacturer: one(companies, {
        fields: [products.manufacturerId],
        references: [companies.id],
    }),
    productType: one(productTypes, {
        fields: [products.productTypeId],
        references: [productTypes.id],
    }),
    productModel: one(productModels, {
        fields: [products.productModelId],
        references: [productModels.id],
    }),
    company: one(companies, {
        fields: [products.companyId],
        references: [companies.id],
    }),
    createdBy: one(users, {
        fields: [products.createdById],
        references: [users.id],
    }),
    lastUpdatedBy: one(users, {
        fields: [products.lastUpdatedById],
        references: [users.id],
    }),
    serviceOperations: many(serviceOperations),
}));

export const issuesRelations = relations(issues, ({ one, many }) => ({
    product: one(products, {
        fields: [issues.productId],
        references: [products.id],
    }),
    customer: one(users, {
        fields: [issues.customerId],
        references: [users.id],
    }),
    issueType: one(issueTypes, {
        fields: [issues.issueTypeId],
        references: [issueTypes.id],
    }),
    serviceOperations: many(serviceOperations),
}));

export const serviceOperationsRelations = relations(serviceOperations, ({ one }) => ({
    issue: one(issues, {
        fields: [serviceOperations.issueId],
        references: [issues.id],
    }),
    product: one(products, {
        fields: [serviceOperations.productId],
        references: [products.id],
    }),
    performedBy: one(users, {
        fields: [serviceOperations.performedById],
        references: [users.id],
    }),
}));

export const shipmentsRelations = relations(shipments, ({ one, many }) => ({
    company: one(companies, {
        fields: [shipments.companyId],
        references: [companies.id],
    }),
    createdBy: one(users, {
        fields: [shipments.createdById],
        references: [users.id],
    }),
    items: many(shipmentItems),
}));

export const shipmentItemsRelations = relations(shipmentItems, ({ one }) => ({
    shipment: one(shipments, {
        fields: [shipmentItems.shipmentId],
        references: [shipments.id],
    }),
    product: one(products, {
        fields: [shipmentItems.productId],
        references: [products.id],
    }),
})); 