import { pgTable, text, timestamp, uuid, boolean, integer, pgEnum, varchar, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations, sql  } from 'drizzle-orm';
import { customTimestamp } from './ponyfill';

// Enums
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'TSP', 'CUSTOMER']);
export const productStatusEnum = pgEnum('product_status', ['NEW', 'IN_SERVICE', 'REPAIRED', 'SHIPPED', 'DELIVERED', 'SCRAPPED']);
export const issueStatusEnum = pgEnum('issue_status', ['OPEN', 'IN_PROGRESS', 'WAITING_PARTS', 'REPAIRED', 'CLOSED', 'CANCELLED']);
export const issuePriorityEnum = pgEnum('issue_priority', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const issueSourceEnum = pgEnum('issue_source', ['CUSTOMER', 'TSP']);
export const operationTypeEnum = pgEnum('operation_type', ['INITIAL_TEST', 'REPAIR', 'FINAL_TEST', 'QUALITY_CHECK']);
export const shipmentTypeEnum = pgEnum('shipment_type', ['SALES', 'SERVICE_RETURN', 'SERVICE_SEND']);
export const shipmentStatusEnum = pgEnum('shipment_status', ['PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
export const serviceOperationStatusEnum = pgEnum('service_operation_status', ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
    
const timestamps = {
	createdAt: timestamp("created_at")
		.defaultNow()
		.notNull(),
	updatedAt: customTimestamp("updated_at")
		.default(sql`now()`)
		.notNull()
        .$onUpdate(() => sql`now()`),
    deletedAt: timestamp('deleted_at'),
}

// Companies table
export const companies = pgTable('companies', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    address: text('address'),
    phone: text('phone'),
    email: text('email'),
    ...timestamps
});

// Users table
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    role: userRoleEnum('role').notNull(),
    companyId: uuid('company_id').references(() => companies.id),
    mustChangePassword: boolean('must_change_password').default(false).notNull(),
    ...timestamps
});

// Accounts table
export const accounts = pgTable("accounts", {
    id: uuid('id').defaultRandom().primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: uuid('user_id').notNull().references(()=> users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
});

// Verifications table
export const verifications = pgTable("verifications", {
    id: uuid('id').defaultRandom().primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
});

// JWKS table
export const jwkss = pgTable("jwkss", {
    id: uuid('id').defaultRandom().primaryKey(),
    publicKey: text('public_key').notNull(),
    privateKey: text('private_key').notNull(),
    createdAt: timestamps.createdAt,
});

// Product Types table
export const productTypes = pgTable('product_types', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    ...timestamps
});

// Product Models table
export const productModels = pgTable('product_models', {
    id: uuid('id').defaultRandom().primaryKey(),
    productTypeId: uuid('product_type_id').references(() => productTypes.id).notNull(),
    manufacturerId: uuid('manufacturer_id').references(() => companies.id).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    ...timestamps
});

// Locations table (for inventory management)
export const locations = pgTable('locations', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(), // e.g., "Warehouse A", "Service Center", "Shelf B-12"
    type: text('type').notNull(), // e.g., "WAREHOUSE", "SHELF", "SERVICE_AREA"
    address: text('address'),
    notes: text('notes'),
    ...timestamps
});

// Products table
export const products = pgTable('products', {
    id: uuid('id').defaultRandom().primaryKey(),
    productModelId: uuid('product_model_id').references(() => productModels.id).notNull(),
    serialNumber: text('serial_number').notNull(),
    status: productStatusEnum('status').notNull(),
    
    // Customer ownership fields (only populated when ownerId is not null = customer-owned)
    ownerId: uuid('owner_id').references(() => companies.id), // The customer company - null = stock, not null = customer-owned

    productionDate: timestamp('production_date').notNull(),
    warrantyStartDate: timestamp('warranty_start_date'),
    warrantyPeriodMonths: integer('warranty_period_months'),
    soldDate: timestamp('sold_date'),
    
    // Location fields (only populated when ownerId is null = stock product, null when sent to customer)
    locationId: uuid('location_id').references(() => locations.id), // null when product is with customer
    
    createdBy: uuid('created_by').references(() => users.id).notNull(),
    updatedBy: uuid('updated_by').references(() => users.id).notNull(),
    ...timestamps
});

export const issueCategories = pgTable('issue_categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 120 }).notNull().unique(),
    description: text('description'),
    displayOrder: integer('display_order').default(0),
    ...timestamps
});

// Internal issue categories table
export const internalIssueCategories = pgTable('internal_issue_categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 64 }).notNull().unique(),
    name: varchar('name', { length: 120 }).notNull(),
    ...timestamps
});

// N↔N mapping between the two lists (public and internal issue categories)
export const publicToInternalCategoryMap = pgTable('public_to_internal_category_map', {
    publicCategoryId: uuid('public_category_id').references(() => issueCategories.id, { onDelete: 'cascade' }).notNull(),
    internalCategoryId: uuid('internal_category_id').references(() => internalIssueCategories.id, { onDelete: 'cascade' }).notNull(),
}, (table) => {
    return [primaryKey({ columns: [table.publicCategoryId, table.internalCategoryId] })]
});

// Issues table
export const issues = pgTable('issues', {
    id: uuid('id').defaultRandom().primaryKey(),
    issueNumber: varchar('issue_number', { length: 20 }).notNull().unique(),
    
    // Source and context
    source: issueSourceEnum('source').notNull(),                          // Who/what created this issue
    companyId: uuid('company_id').references(() => companies.id),         // Customer company (null for internal issues)
    
    // Categories (flexible based on source)
    categoryId: uuid('category_id').references(() => issueCategories.id), // Customer-facing category (optional for internal)
    internalCategoryId: uuid('internal_category_id').references(() => internalIssueCategories.id),
    
    // Status and priority
    status: issueStatusEnum('status').notNull(),
    priority: issuePriorityEnum('priority').notNull(),
    
    // Descriptions
    customerDescription: text('customer_description'),                   // From customer (if customer-reported)
    technicianDescription: text('technician_description'),               // From technician
    
    createdBy: uuid('created_by').references(() => users.id).notNull(),
    ...timestamps
});

// Issue Products junction table - many-to-many relationship
export const issueProducts = pgTable('issue_products', {
    id: uuid('id').defaultRandom().primaryKey(),
    issueId: uuid('issue_id').references(() => issues.id, { onDelete: 'cascade' }).notNull(),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
}, (table) => {
    return [
        // Ensure same product can't be added twice to same issue
        uniqueIndex('unique_issue_product').on(table.issueId, table.productId)
    ];
});

// Service Operations table
export const serviceOperations = pgTable('service_operations', {
    id: uuid('id').defaultRandom().primaryKey(),
    issueId: uuid('issue_id').references(() => issues.id, { onDelete: 'cascade' }).notNull(),
    issueProductId: uuid('issue_product_id').references(() => issueProducts.id, { onDelete: 'cascade' }), // Link to specific product in issue
    operationType: operationTypeEnum('operation_type').notNull(),
    performedBy: uuid('performed_by').references(() => users.id).notNull(),
    status: serviceOperationStatusEnum('status').notNull(),
    description: text('description').notNull(),
    findings: text('findings'),
    actionsTaken: text('actions_taken'),
    operationDate: timestamp('operation_date').notNull(),
    ...timestamps
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
    ...timestamps,
});

// Shipment Items table
export const shipmentItems = pgTable('shipment_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    shipmentId: uuid('shipment_id').references(() => shipments.id, { onDelete: 'cascade' }).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
}, (table) => {
    return [
        // Ensure same item can't be added twice to same shipment
        uniqueIndex('unique_shipment_item').on(table.shipmentId, table.productId)
    ];
});

// Product History Event Types
export const productHistoryEventTypeEnum = pgEnum('product_history_event_type', [
    'production', 'test', 'shipping', 'service', 'status_change', 'issue', 'other'
]);

// Product History table - tracks product lifecycle events
export const productHistory = pgTable('product_history', {
    id: uuid('id').defaultRandom().primaryKey(),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
    
    createdBy: uuid('created_by').references(() => users.id).notNull(),

    // Event information
    event: varchar('event', { length: 255 }).notNull(),                    // Event title
    eventType: productHistoryEventTypeEnum('event_type').notNull(),        // Category for UI grouping
    
    // Actor and context
    performedBy: uuid('performed_by').references(() => users.id).notNull(),       // User who performed the action
    locationId: uuid('location_id').references(() => locations.id),               // Where it happened
    
    // Related entities (optional)
    relatedIssueId: uuid('related_issue_id').references(() => issues.id),
    relatedShipmentId: uuid('related_shipment_id').references(() => shipments.id),
    relatedServiceOperationId: uuid('related_service_operation_id').references(() => serviceOperations.id),

    // Timestamps
    eventTimestamp: timestamp('event_timestamp').notNull(),
    ...timestamps
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
    company: one(companies, {
        fields: [users.companyId],
        references: [companies.id],
    }),
    createdProducts: many(products, { relationName: 'createdBy' }),
    updatedProducts: many(products, { relationName: 'updatedBy' }),
    createdIssues: many(issues),
    serviceOperations: many(serviceOperations),
    createdShipments: many(shipments, { relationName: 'createdBy' }),
    updatedShipments: many(shipments, { relationName: 'updatedBy' }),
    createdProductHistory: many(productHistory, { relationName: 'createdBy' }),
    performedProductHistory: many(productHistory, { relationName: 'performedBy' }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
    users: many(users),
    manufacturedProducts: many(productModels, { relationName: 'manufacturer' }),
    ownedProducts: many(products, { relationName: 'owner' }),
    issues: many(issues),
    shipments: many(shipments),
}));

export const productTypesRelations = relations(productTypes, ({ many }) => ({
    productModels: many(productModels),
}));

export const productModelsRelations = relations(productModels, ({ one, many }) => ({
    productType: one(productTypes, {
        fields: [productModels.productTypeId],
        references: [productTypes.id],
    }),
    manufacturer: one(companies, {
        fields: [productModels.manufacturerId],
        references: [companies.id],
        relationName: 'manufacturer',
    }),
    products: many(products),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
    products: many(products),
    productHistory: many(productHistory),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    productModel: one(productModels, {
        fields: [products.productModelId],
        references: [productModels.id],
    }),
    owner: one(companies, {
        fields: [products.ownerId],
        references: [companies.id],
        relationName: 'owner',
    }),
    location: one(locations, {
        fields: [products.locationId],
        references: [locations.id],
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
    issues: many(issueProducts),
    shipmentItems: many(shipmentItems),
    productHistory: many(productHistory),
}));
    
export const issueCategoriesRelations = relations(issueCategories, ({ many }) => ({
    issues: many(issues),
    mappings: many(publicToInternalCategoryMap),
}));

export const internalIssueCategoriesRelations = relations(internalIssueCategories, ({ many }) => ({
    issues: many(issues),
    mappings: many(publicToInternalCategoryMap),
}));

export const publicToInternalCategoryMapRelations = relations(publicToInternalCategoryMap, ({ one }) => ({
    publicCategory: one(issueCategories, {
        fields: [publicToInternalCategoryMap.publicCategoryId],
        references: [issueCategories.id],
    }),     
    internalCategory: one(internalIssueCategories, {    
        fields: [publicToInternalCategoryMap.internalCategoryId],
        references: [internalIssueCategories.id],
    }),
}));

export const issuesRelations = relations(issues, ({ one, many }) => ({
    company: one(companies, {
        fields: [issues.companyId],
        references: [companies.id],
    }),
    createdBy: one(users, {
        fields: [issues.createdBy],
        references: [users.id],
    }), 
    category: one(issueCategories, {
        fields: [issues.categoryId],
        references: [issueCategories.id],
    }),
    internalCategory: one(internalIssueCategories, {
        fields: [issues.internalCategoryId],
        references: [internalIssueCategories.id],
    }),
    issueProducts: many(issueProducts),
    serviceOperations: many(serviceOperations),
    shipments: many(shipments),
}));

export const issueProductsRelations = relations(issueProducts, ({ one, many }) => ({
    issue: one(issues, {
        fields: [issueProducts.issueId],
        references: [issues.id],
    }),
    product: one(products, {
        fields: [issueProducts.productId],
        references: [products.id],
    }),
    serviceOperations: many(serviceOperations),
}));

export const serviceOperationsRelations = relations(serviceOperations, ({ one }) => ({
    issue: one(issues, {
        fields: [serviceOperations.issueId],
        references: [issues.id],
    }),
    issueProduct: one(issueProducts, {
        fields: [serviceOperations.issueProductId],
        references: [issueProducts.id],
    }),
    performedBy: one(users, {
        fields: [serviceOperations.performedBy],
        references: [users.id],
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
    updatedBy: one(users, {
        fields: [shipments.updatedBy],
        references: [users.id],
        relationName: 'updatedBy',
    }),
    issue: one(issues, {
        fields: [shipments.issueId],
        references: [issues.id],
    }),
    items: many(shipmentItems, { relationName: 'shipment' } ),
}));

export const shipmentItemsRelations = relations(shipmentItems, ({ one }) => ({
    shipment: one(shipments, {
        fields: [shipmentItems.shipmentId],
        references: [shipments.id],
        relationName: 'shipment',
    }),
    product: one(products, {
        fields: [shipmentItems.productId],
        references: [products.id],
    }),
}));

export const productHistoryRelations = relations(productHistory, ({ one }) => ({
    product: one(products, {
        fields: [productHistory.productId],
        references: [products.id],
    }),
    createdBy: one(users, {
        fields: [productHistory.createdBy],
        references: [users.id],
        relationName: 'createdBy',
    }),
    performedBy: one(users, {
        fields: [productHistory.performedBy],
        references: [users.id],
        relationName: 'performedBy',
    }),
    location: one(locations, {
        fields: [productHistory.locationId],
        references: [locations.id],
    }),
    relatedIssue: one(issues, {
        fields: [productHistory.relatedIssueId],
        references: [issues.id],
    }),
    relatedShipment: one(shipments, {       
        fields: [productHistory.relatedShipmentId],
        references: [shipments.id],
    }),
    relatedServiceOperation: one(serviceOperations, {
        fields: [productHistory.relatedServiceOperationId],
        references: [serviceOperations.id],
    }),
})); 