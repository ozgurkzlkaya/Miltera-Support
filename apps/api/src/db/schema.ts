import { pgTable, text, timestamp, uuid, boolean, integer, pgEnum, varchar, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'TSP', 'CUSTOMER']);
export const productStatusEnum = pgEnum('product_status', ['NEW', 'IN_SERVICE', 'REPAIRED', 'SHIPPED', 'DELIVERED', 'SCRAPPED']);
export const issueStatusEnum = pgEnum('issue_status', ['OPEN', 'IN_PROGRESS', 'WAITING_PARTS', 'REPAIRED', 'CLOSED', 'CANCELLED']);
export const issuePriorityEnum = pgEnum('issue_priority', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const operationTypeEnum = pgEnum('operation_type', ['INITIAL_TEST', 'REPAIR', 'FINAL_TEST', 'QUALITY_CHECK']);
export const shipmentTypeEnum = pgEnum('shipment_type', ['SALES', 'SERVICE_RETURN', 'SERVICE_SEND']);
export const shipmentStatusEnum = pgEnum('shipment_status', ['PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
export const serviceOperationStatusEnum = pgEnum('service_operation_status', ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
    
// Companies table
export const companies = pgTable('companies', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    address: text('address'),
    phone: text('phone'),
    email: text('email'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
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
    mustChangePassword: boolean('must_change_password').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

// Product Types table
export const productTypes = pgTable('product_types', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

// Product Models table
export const productModels = pgTable('product_models', {
    id: uuid('id').defaultRandom().primaryKey(),
    productTypeId: uuid('product_type_id').references(() => productTypes.id).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

// Stock Locations table (for inventory management)
export const stockLocations = pgTable('stock_locations', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(), // e.g., "Warehouse A", "Service Center", "Shelf B-12"
    description: text('description'),
    locationType: text('location_type'), // e.g., "WAREHOUSE", "SHELF", "SERVICE_AREA"
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
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
    
    // Customer ownership fields (only populated when ownerId is not null = customer-owned)
    ownerId: uuid('owner_id').references(() => companies.id), // The customer company - null = stock, not null = customer-owned
    warrantyStartDate: timestamp('warranty_start_date'),
    warrantyPeriodMonths: integer('warranty_period_months'),
    soldDate: timestamp('sold_date'),
    
    // Stock location fields (only populated when ownerId is null = stock product)
    stockLocationId: uuid('stock_location_id').references(() => stockLocations.id),
    
    createdBy: uuid('created_by').references(() => users.id).notNull(),
    updatedBy: uuid('updated_by').references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

// Customer-facing list
export const externalIssueCategories = pgTable('external_issue_categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 120 }).notNull().unique(),
    description: text('description'),
    displayOrder: integer('display_order').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

// Technician list (flat)
export const internalIssueCategories = pgTable('internal_issue_categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 64 }).notNull().unique(),
    name: varchar('name', { length: 120 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

// N↔N mapping between the two lists
export const externalToInternalCategoryMap = pgTable('external_to_internal_category_map', {
    externalCategoryId: uuid('external_category_id').references(() => externalIssueCategories.id, { onDelete: 'cascade' }).notNull(),
    internalCategoryId: uuid('internal_category_id').references(() => internalIssueCategories.id, { onDelete: 'cascade' }).notNull(),
}, (table) => {
    return [primaryKey({ columns: [table.externalCategoryId, table.internalCategoryId] })]
});

// Issues table
export const issues = pgTable('issues', {
    id: uuid('id').defaultRandom().primaryKey(),
    issueNumber: varchar('issue_number', { length: 20 }).notNull().unique(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    companyId: uuid('company_id').references(() => companies.id).notNull(),
    customerExternalCategoryId: uuid('customer_external_category_id').references(() => externalIssueCategories.id).notNull(),
    currentInternalCategoryId: uuid('current_internal_category_id').references(() => internalIssueCategories.id),
    status: issueStatusEnum('status').notNull(),
    priority: issuePriorityEnum('priority').notNull(),
    customerDescription: text('customer_description').notNull(),
    technicianDescription: text('technician_description'),
    createdBy: uuid('created_by').references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

// Service Operations table
export const serviceOperations = pgTable('service_operations', {
    id: uuid('id').defaultRandom().primaryKey(),
    issueId: uuid('issue_id').references(() => issues.id, { onDelete: 'cascade' }).notNull(),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
    operationType: operationTypeEnum('operation_type').notNull(),
    performedBy: uuid('performed_by').references(() => users.id).notNull(),
    status: serviceOperationStatusEnum('status').notNull(),
    description: text('description').notNull(),
    findings: text('findings'),
    actionsTaken: text('actions_taken'),
    operationDate: timestamp('operation_date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

// Shipments table
export const shipments = pgTable('shipments', {
    id: uuid('id').defaultRandom().primaryKey(),
    shipmentNumber: text('shipment_number').notNull().unique(),
    type: shipmentTypeEnum('type').notNull(),
    companyId: uuid('company_id').references(() => companies.id).notNull(),
    issueId: uuid('issue_id').references(() => issues.id), // For SERVICE_RETURN/SERVICE_SEND shipments
    status: shipmentStatusEnum('status').notNull(),
    trackingNumber: text('tracking_number'),
    estimatedDelivery: timestamp('estimated_delivery'),
    actualDelivery: timestamp('actual_delivery'),
    notes: text('notes'),
    createdBy: uuid('created_by').references(() => users.id).notNull(),
    updatedBy: uuid('updated_by').references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

// Shipment Items table
export const shipmentItems = pgTable('shipment_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    shipmentId: uuid('shipment_id').references(() => shipments.id, { onDelete: 'cascade' }).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
    company: one(companies, {
        fields: [users.companyId],
        references: [companies.id],
    }),
    createdProducts: many(products, { relationName: 'createdBy' }),
    updatedProducts: many(products, { relationName: 'updatedBy' }),
    createdIssues: many(issues, { relationName: 'issueCreator' }),
    serviceOperations: many(serviceOperations, { relationName: 'performedBy' }),
    createdShipments: many(shipments, { relationName: 'createdBy' }),
    updatedShipments: many(shipments, { relationName: 'updatedBy' }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
    users: many(users),
    manufacturedProducts: many(products, { relationName: 'manufacturer' }),
    ownedProducts: many(products, { relationName: 'owner' }),
    issues: many(issues, { relationName: 'customer' }),
    shipments: many(shipments),
}));

export const productTypesRelations = relations(productTypes, ({ many }) => ({
    productModels: many(productModels),
    products: many(products),
}));

export const productModelsRelations = relations(productModels, ({ one, many }) => ({
    productType: one(productTypes, {
        fields: [productModels.productTypeId],
        references: [productTypes.id],
    }),
    products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    manufacturer: one(companies, {
        fields: [products.manufacturerId],
        references: [companies.id],
        relationName: 'manufacturer',
    }),
    productType: one(productTypes, {
        fields: [products.productTypeId],
        references: [productTypes.id],
    }),
    productModel: one(productModels, {
        fields: [products.productModelId],
        references: [productModels.id],
    }),
    owner: one(companies, {
        fields: [products.ownerId],
        references: [companies.id],
        relationName: 'owner',
    }),
    stockLocation: one(stockLocations, {
        fields: [products.stockLocationId],
        references: [stockLocations.id],
    }),
    createdBy: one(users, {
        fields: [products.createdBy],
        references: [users.id],
        relationName: 'createdBy',
    }),
    updatedBy: one(users, {
        fields: [products.updatedBy],
        references: [users.id],
        relationName: 'updatedBy',
    }),
    issues: many(issues),
    serviceOperations: many(serviceOperations),
    shipmentItems: many(shipmentItems),
}));

export const externalIssueCategoriesRelations = relations(externalIssueCategories, ({ many }) => ({
    issues: many(issues, { relationName: 'customerCategory' }),
    mappings: many(externalToInternalCategoryMap),
}));

export const internalIssueCategoriesRelations = relations(internalIssueCategories, ({ many }) => ({
    issues: many(issues, { relationName: 'internalCategory' }),
    mappings: many(externalToInternalCategoryMap),
}));

export const externalToInternalCategoryMapRelations = relations(externalToInternalCategoryMap, ({ one }) => ({
    externalCategory: one(externalIssueCategories, {
        fields: [externalToInternalCategoryMap.externalCategoryId],
        references: [externalIssueCategories.id],
    }),
    internalCategory: one(internalIssueCategories, {
        fields: [externalToInternalCategoryMap.internalCategoryId],
        references: [internalIssueCategories.id],
    }),
}));

export const issuesRelations = relations(issues, ({ one, many }) => ({
    product: one(products, {
        fields: [issues.productId],
        references: [products.id],
    }),
    company: one(companies, {
        fields: [issues.companyId],
        references: [companies.id],
        relationName: 'customer',
    }),
    createdBy: one(users, {
        fields: [issues.createdBy],
        references: [users.id],
        relationName: 'issueCreator',
    }),
    customerExternalCategory: one(externalIssueCategories, {
        fields: [issues.customerExternalCategoryId],
        references: [externalIssueCategories.id],
        relationName: 'customerCategory',
    }),
    currentInternalCategory: one(internalIssueCategories, {
        fields: [issues.currentInternalCategoryId],
        references: [internalIssueCategories.id],
        relationName: 'internalCategory',
    }),
    serviceOperations: many(serviceOperations),
    shipments: many(shipments), // Related service shipments
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
        fields: [serviceOperations.performedBy],
        references: [users.id],
        relationName: 'performedBy',
    }),
}));

export const shipmentsRelations = relations(shipments, ({ one, many }) => ({
    company: one(companies, {
        fields: [shipments.companyId],
        references: [companies.id],
    }),
    createdBy: one(users, {
        fields: [shipments.createdBy],
        references: [users.id],
        relationName: 'createdBy',
    }),
    issue: one(issues, {
        fields: [shipments.issueId],
        references: [issues.id],
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