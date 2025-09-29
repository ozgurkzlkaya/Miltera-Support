import { pgTable, text, integer, boolean, timestamp, uuid, decimal, jsonb, real } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// Enums - PostgreSQL için enum olarak tanımlandı
export const userRoleEnum = ['ADMIN', 'TSP', 'CUSTOMER'] as const;
export const productStatusEnum = [
    'FIRST_PRODUCTION',           // İlk Üretim
    'FIRST_PRODUCTION_ISSUE',     // İlk Üretim Arıza
    'FIRST_PRODUCTION_SCRAPPED',  // İlk Üretim Hurda
    'READY_FOR_SHIPMENT',         // Sevkiyat Hazır
    'SHIPPED',                    // Sevk Edildi
    'ISSUE_CREATED',              // Arıza Kaydı Oluşturuldu
    'RECEIVED',                   // Cihaz Teslim Alındı
    'PRE_TEST_COMPLETED',         // Servis Ön Testi Yapıldı
    'UNDER_REPAIR',               // Cihaz Tamir Edilmekte
    'SERVICE_SCRAPPED',           // Servis Hurda
    'DELIVERED'                   // Teslim Edildi
] as const;

export const issueStatusEnum = [
    'OPEN',                       // Açık
    'IN_PROGRESS',                // İşlemde
    'WAITING_CUSTOMER_APPROVAL',  // Müşteri Onayı Bekliyor
    'REPAIRED',                   // Tamir Edildi
    'CLOSED',                     // Kapalı
    'CANCELLED'                   // İptal Edildi
] as const;

export const issuePriorityEnum = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export const issueSourceEnum = ['CUSTOMER', 'TSP', 'FIRST_PRODUCTION'] as const;
export const operationTypeEnum = [
    'INITIAL_TEST',               // İlk Test (Fabrikasyon sonrası)
    'FABRICATION_TEST',           // Fabrikasyon Testi
    'HARDWARE_VERIFICATION',      // Donanım Doğrulama
    'CONFIGURATION',              // Konfigürasyon
    'PRE_TEST',                   // Ön Test
    'REPAIR',                     // Tamir
    'FINAL_TEST',                 // Final Test
    'QUALITY_CHECK'               // Kalite Kontrol
] as const;

export const shipmentTypeEnum = ['SALES', 'SERVICE_RETURN', 'SERVICE_SEND'] as const;
export const shipmentStatusEnum = ['PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
export const serviceOperationStatusEnum = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
export const warrantyStatusEnum = ['IN_WARRANTY', 'OUT_OF_WARRANTY', 'PENDING'] as const;

// Notification enums
export const notificationTypeEnum = ['success', 'error', 'warning', 'info', 'critical'] as const;
export const notificationPriorityEnum = ['low', 'medium', 'high', 'critical'] as const;
export const notificationCategoryEnum = ['system', 'issue', 'product', 'shipment', 'user', 'security', 'performance', 'maintenance'] as const;
    
const timestamps = {
	createdAt: timestamp("created_at")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: timestamp("updated_at")
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
    deletedAt: timestamp('deleted_at'),
}

// Companies table - Müşteri ve Üretici Firmalar
export const companies = pgTable('companies', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),                    // Firma İsmi
    address: text('address'),                        // Firma Adresi
    phone: text('phone'),                            // Firma Telefonu
    email: text('email'),                            // Firma E-posta
    contactPersonName: text('contact_person_name'),  // İlgili Kişi Adı
    contactPersonSurname: text('contact_person_surname'), // İlgili Kişi Soyadı
    contactPersonEmail: text('contact_person_email'), // İlgili Kişi E-posta
    contactPersonPhone: text('contact_person_phone'), // İlgili Kişi Telefon
    isManufacturer: boolean('is_manufacturer').default(false), // Üretici mi?
    ...timestamps
});

// Users table - Kullanıcı Yönetimi
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: text('first_name'),                   // Ad - Better-auth uyumluluğu için nullable
    lastName: text('last_name'),                     // Soyad - Better-auth uyumluluğu için nullable
    name: text('name'),                              // Full name for search
    email: text('email').notNull().unique(),         // E-posta (Kullanıcı Adı)
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    role: text('role'),                              // ADMIN, TSP, CUSTOMER - Better-auth uyumluluğu için nullable
    companyId: uuid('company_id').references(() => companies.id), // Müşteri firması (CUSTOMER için)
    isActive: boolean('is_active').default(true).notNull(),
    mustChangePassword: boolean('must_change_password').default(false).notNull(),
    
    // User preferences
    language: text('language').default('tr'),
    timezone: text('timezone').default('Europe/Istanbul'),
    dateFormat: text('date_format').default('DD/MM/YYYY'),
    theme: text('theme').default('light'),
    notifications: text('notifications'), // JSON string for notification preferences
    
    // Security settings
    twoFactorAuth: boolean('two_factor_auth').default(false),
    sessionTimeout: integer('session_timeout').default(30),
    passwordExpiry: integer('password_expiry').default(90),
    loginAlerts: boolean('login_alerts').default(true),
    
    // Additional user info
    phone: text('phone'),
    address: text('address'),
    company: text('company'),
    
    // Password management
    lastPasswordChange: timestamp('last_password_change'),
    
    ...timestamps
});

// Accounts table
export const accounts = pgTable("accounts", {
    id: uuid('id').primaryKey().defaultRandom(),
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
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Verifications table
export const verifications = pgTable("verifications", {
    id: uuid('id').primaryKey().defaultRandom(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// JWKS table
export const jwkss = pgTable("jwkss", {
    id: uuid('id').primaryKey().defaultRandom(),
    publicKey: text('public_key').notNull(),
    privateKey: text('private_key').notNull(),
    createdAt: timestamp('created_at').notNull(),
});

// Product Types table
export const productTypes = pgTable('product_types', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    ...timestamps
});

// Product Models table
export const productModels = pgTable('product_models', {
    id: uuid('id').primaryKey().defaultRandom(),
    productTypeId: uuid('product_type_id').references(() => productTypes.id).notNull(),
    manufacturerId: uuid('manufacturer_id').references(() => companies.id).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    ...timestamps
});

// Locations table (for inventory management)
export const locations = pgTable('locations', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(), // e.g., "Warehouse A", "Service Center", "Shelf B-12"
    type: text('type').notNull(), // e.g., "WAREHOUSE", "SHELF", "SERVICE_AREA"
    address: text('address'),
    notes: text('notes'),
    capacity: integer('capacity'), // Maximum number of products this location can hold
    currentCount: integer('current_count').default(0), // Current number of products in this location
    ...timestamps
});

// Issue Categories table
export const issueCategories = pgTable('issue_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps
});

// Internal Issue Categories table
export const internalIssueCategories = pgTable('internal_issue_categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps
});

// Products table - Ürün Yaşam Döngüsü Takibi
export const products = pgTable('products', {
    id: uuid('id').primaryKey().defaultRandom(),
    productModelId: uuid('product_model_id').references(() => productModels.id).notNull(),
    productTypeId: uuid('product_type_id').references(() => productTypes.id), // Product type reference
    serialNumber: text('serial_number'),              // Cihaz Seri Numarası (Donanım Doğrulama'da girilir)
    status: text('status').notNull(),    // Ürün Durumu (Yaşam Döngüsü)
    currentStatus: text('current_status').notNull(), // Current status for search
    notes: text('notes'), // Product notes
    
    // Müşteri sahipliği (sadece satış yapıldığında doldurulur)
    ownerId: uuid('owner_id').references(() => companies.id), // Müşteri firması - null = stok, not null = müşteriye ait
    companyId: uuid('company_id').references(() => companies.id), // Company reference for search

    // Üretim bilgileri
    productionDate: timestamp('production_date').notNull(), // Üretim Tarihi
    productionEntryBy: uuid('production_entry_by').references(() => users.id).notNull(), // Üretim Girişi Hesabı
    
    // Garanti bilgileri
    warrantyStartDate: timestamp('warranty_start_date'), // Garanti Başlangıç Tarihi
    warrantyPeriodMonths: integer('warranty_period_months'), // Garanti Süresi (Ay)
    warrantyStatus: text('warranty_status').default('PENDING'), // Garanti Durumu
    soldDate: timestamp('sold_date'), // Satış Tarihi
    
    // Konfigürasyon bilgileri
    hardwareVerificationDate: timestamp('hardware_verification_date'), // Donanım Doğrulama Tarihi
    hardwareVerificationBy: uuid('hardware_verification_by').references(() => users.id), // Donanım Doğrulama Hesabı
    
    // Konum bilgileri (sadece stok ürünler için)
    locationId: uuid('location_id').references(() => locations.id), // null when product is with customer
    
    createdBy: uuid('created_by').references(() => users.id).notNull(),
    updatedBy: uuid('updated_by').references(() => users.id).notNull(),
    ...timestamps
});

// Issues table - Arıza Yönetimi
export const issues = pgTable('issues', {
    id: uuid('id').primaryKey().defaultRandom(),
    issueNumber: text('issue_number').notNull().unique(), // YYMMDD-XX format
    productId: uuid('product_id').references(() => products.id),
    customerId: uuid('customer_id').references(() => companies.id),
    companyId: uuid('company_id').references(() => companies.id).notNull(), // Company reference for search
    reportedBy: uuid('reported_by').references(() => users.id).notNull(),
    assignedTo: uuid('assigned_to').references(() => users.id),
    
    title: text('title').notNull(),
    description: text('description').notNull(),
    customerDescription: text('customer_description'), // Customer description
    technicianDescription: text('technician_description'), // Technician description
    status: text('status').notNull(), // issueStatusEnum
    priority: text('priority').notNull(), // issuePriorityEnum
    source: text('source').notNull(), // issueSourceEnum
    
    // Kategori bilgileri
    issueCategoryId: uuid('issue_category_id').references(() => issueCategories.id),
    internalIssueCategoryId: uuid('internal_issue_category_id').references(() => internalIssueCategories.id),
    
    // Garanti ve maliyet bilgileri
    isUnderWarranty: boolean('is_under_warranty').default(false),
    estimatedCost: decimal('estimated_cost', { precision: 10, scale: 2 }).$type<number | null>(),
    actualCost: decimal('actual_cost', { precision: 10, scale: 2 }).$type<number | null>(),
    
    // Tarih bilgileri
    reportedAt: timestamp('reported_at').notNull(),
    assignedAt: timestamp('assigned_at'),
    resolvedAt: timestamp('resolved_at'),
    preInspectionDate: timestamp('pre_inspection_date'),
    repairDate: timestamp('repair_date'),
    
    // İşlem yapan kişiler
    preInspectedBy: uuid('pre_inspected_by').references(() => users.id),
    repairedBy: uuid('repaired_by').references(() => users.id),
    
    ...timestamps
});

// Service Operations table - Teknik Servis Operasyonları
export const serviceOperations = pgTable('service_operations', {
    id: uuid('id').primaryKey().defaultRandom(),
    issueId: uuid('issue_id').references(() => issues.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id).notNull(),
    issueProductId: uuid('issue_product_id').references(() => issueProducts.id), // Issue product reference
    technicianId: uuid('technician_id').references(() => users.id).notNull(),
    performedBy: uuid('performed_by').references(() => users.id).notNull(), // Who performed the operation
    
    operationType: text('operation_type').notNull(), // operationTypeEnum
    status: text('status').notNull(), // serviceOperationStatusEnum
    description: text('description').notNull(),
    notes: text('notes'),
    findings: text('findings'), // Operation findings
    actionsTaken: text('actions_taken'), // Actions taken during operation
    operationDate: timestamp('operation_date').notNull(), // Operation date
    
    // Garanti ve maliyet bilgileri
    isUnderWarranty: boolean('is_under_warranty').default(false),
    cost: decimal('cost', { precision: 10, scale: 2 }),
    
    // Parça ve test bilgileri
    partsUsed: jsonb('parts_used'), // JSON array of parts
    testResults: jsonb('test_results'), // JSON object of test results
    
    // Zaman bilgileri
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    estimatedDuration: integer('estimated_duration'), // minutes
    duration: integer('duration'), // actual duration in minutes
    
    ...timestamps
});

// Shipments table - Sevkiyat Yönetimi
export const shipments = pgTable('shipments', {
    id: uuid('id').primaryKey().defaultRandom(),
    shipmentNumber: text('shipment_number').notNull().unique(),
    type: text('type').notNull(), // shipmentTypeEnum
    status: text('status').notNull(), // shipmentStatusEnum
    
    fromLocationId: uuid('from_location_id').references(() => locations.id),
    toLocationId: uuid('to_location_id').references(() => locations.id),
    fromCompanyId: uuid('from_company_id').references(() => companies.id),
    toCompanyId: uuid('to_company_id').references(() => companies.id),
    companyId: uuid('company_id').references(() => companies.id), // Company reference for search
    productId: uuid('product_id').references(() => products.id), // Product reference
    
    trackingNumber: text('tracking_number'),
    notes: text('notes'), // Shipment notes
    totalCost: decimal('total_cost', { precision: 10, scale: 2 }),
    estimatedDelivery: timestamp('estimated_delivery'), // Estimated delivery date
    actualDelivery: timestamp('actual_delivery'), // Actual delivery date
    shippedAt: timestamp('shipped_at'),
    deliveredAt: timestamp('delivered_at'),
    
    createdBy: uuid('created_by').references(() => users.id).notNull(),
    ...timestamps
});

// Shipment Items table
export const shipmentItems = pgTable('shipment_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    shipmentId: uuid('shipment_id').references(() => shipments.id).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    quantity: integer('quantity').notNull().default(1),
    notes: text('notes'),
    ...timestamps
});

// Issue Products table (for multiple products in one issue)
export const issueProducts = pgTable('issue_products', {
    id: uuid('id').primaryKey().defaultRandom(),
    issueId: uuid('issue_id').references(() => issues.id, { onDelete: 'cascade' }).notNull(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    notes: text('notes'),
    ...timestamps
});

// Product History table - Ürün Geçmişi
export const productHistory = pgTable('product_history', {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id').references(() => products.id).notNull(),
    eventType: text('event_type').notNull(), // 'STATUS_CHANGE', 'LOCATION_CHANGE', 'OWNER_CHANGE', etc.
    event: text('event').notNull(), // Event description
    eventData: jsonb('event_data'), // JSON object
    eventTimestamp: timestamp('event_timestamp').notNull(), // Event timestamp
    locationId: uuid('location_id').references(() => locations.id), // Location at time of event
    performedBy: uuid('performed_by').references(() => users.id).notNull(),
    performedAt: timestamp('performed_at').notNull(),
    createdBy: uuid('created_by').references(() => users.id).notNull(),
    ...timestamps
});

// Relations
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
    }),
    products: many(products),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
    products: many(products),
    shipmentsFrom: many(shipments, { relationName: 'fromLocation' }),
    shipmentsTo: many(shipments, { relationName: 'toLocation' }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
    users: many(users),
    products: many(products),
    issues: many(issues),
    shipments: many(shipments),
    productModels: many(productModels),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
    company: one(companies, {
        fields: [users.companyId],
        references: [companies.id],
    }),
    products: many(products),
    issues: many(issues),
    serviceOperations: many(serviceOperations),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    productModel: one(productModels, {
        fields: [products.productModelId],
        references: [productModels.id],
    }),
    owner: one(companies, {
        fields: [products.ownerId],
        references: [companies.id],
    }),
    location: one(locations, {
        fields: [products.locationId],
        references: [locations.id],
    }),
    issues: many(issues),
    serviceOperations: many(serviceOperations),
    shipments: many(shipments),
    history: many(productHistory),
}));

export const issuesRelations = relations(issues, ({ one, many }) => ({
    product: one(products, {
        fields: [issues.productId],
        references: [products.id],
    }),
    customer: one(companies, {
        fields: [issues.customerId],
        references: [companies.id],
    }),
    reportedBy: one(users, {
        fields: [issues.reportedBy],
        references: [users.id],
    }),
    assignedTo: one(users, {
        fields: [issues.assignedTo],
        references: [users.id],
    }),
    issueCategory: one(issueCategories, {
        fields: [issues.issueCategoryId],
        references: [issueCategories.id],
    }),
    internalIssueCategory: one(internalIssueCategories, {
        fields: [issues.internalIssueCategoryId],
        references: [internalIssueCategories.id],
    }),
    serviceOperations: many(serviceOperations),
    issueProducts: many(issueProducts),
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
    technician: one(users, {
        fields: [serviceOperations.technicianId],
        references: [users.id],
    }),
}));

export const shipmentsRelations = relations(shipments, ({ one, many }) => ({
    fromLocation: one(locations, {
        fields: [shipments.fromLocationId],
        references: [locations.id],
    }),
    toLocation: one(locations, {
        fields: [shipments.toLocationId],
        references: [locations.id],
    }),
    fromCompany: one(companies, {
        fields: [shipments.fromCompanyId],
        references: [companies.id],
    }),
    toCompany: one(companies, {
        fields: [shipments.toCompanyId],
        references: [companies.id],
    }),
    createdBy: one(users, {
        fields: [shipments.createdBy],
        references: [users.id],
    }),
    shipmentItems: many(shipmentItems),
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

export const issueProductsRelations = relations(issueProducts, ({ one }) => ({
    issue: one(issues, {
        fields: [issueProducts.issueId],
        references: [issues.id],
    }),
    product: one(products, {
        fields: [issueProducts.productId],
        references: [products.id],
    }),
}));

// File Attachments table - Dosya Ekleri
export const fileAttachments = pgTable('file_attachments', {
    id: uuid('id').primaryKey().defaultRandom(),
    fileName: text('file_name').notNull(),                    // Dosya adı
    originalFileName: text('original_file_name').notNull(),   // Orijinal dosya adı
    filePath: text('file_path').notNull(),                   // Dosya yolu
    fileUrl: text('file_url'),                               // Cloudinary URL (opsiyonel)
    mimeType: text('mime_type').notNull(),                   // MIME türü
    fileSize: integer('file_size').notNull(),                // Dosya boyutu (bytes)
    fileType: text('file_type').notNull(),                   // Dosya türü (image, document, etc.)
    
    // İlişkili entity bilgileri
    entityType: text('entity_type').notNull(),               // Hangi entity'ye ait (issue, product, shipment)
    entityId: uuid('entity_id').notNull(),                   // Entity ID
    
    // Yükleyen kullanıcı
    uploadedBy: uuid('uploaded_by').references(() => users.id).notNull(),
    
    // Metadata
    description: text('description'),                        // Dosya açıklaması
    tags: jsonb('tags'),                                     // Etiketler (JSON array)
    
    ...timestamps
});

export const fileAttachmentsRelations = relations(fileAttachments, ({ one }) => ({
    uploadedBy: one(users, {
        fields: [fileAttachments.uploadedBy],
        references: [users.id],
    }),
}));

// Notifications table
export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    type: text('type', { enum: notificationTypeEnum }).notNull(),
    priority: text('priority', { enum: notificationPriorityEnum }).notNull(),
    category: text('category', { enum: notificationCategoryEnum }).notNull(),
    description: text('description'),
    source: text('source').notNull().default('system'),
    channels: jsonb('channels').notNull().default(['in-app']),
    tags: jsonb('tags').default([]),
    read: boolean('read').notNull().default(false),
    readAt: timestamp('read_at'),
    expiresAt: timestamp('expires_at'),
    userId: uuid('user_id').references(() => users.id).notNull(),
    createdBy: uuid('created_by').references(() => users.id).notNull(),
    ...timestamps
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
    creator: one(users, {
        fields: [notifications.createdBy],
        references: [users.id],
    }),
}));

export const productHistoryRelations = relations(productHistory, ({ one }) => ({
    product: one(products, {
        fields: [productHistory.productId],
        references: [products.id],
    }),
    performedBy: one(users, {
        fields: [productHistory.performedBy],
        references: [users.id],
    }),
    createdBy: one(users, {
        fields: [productHistory.createdBy],
        references: [users.id],
    }),
    location: one(locations, {
        fields: [productHistory.locationId],
        references: [locations.id],
    }),
}));

// Audit Logs table
export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    action: text('action').notNull(), // CREATE, UPDATE, DELETE, LOGIN, etc.
    entityType: text('entity_type').notNull(), // issue, product, user, etc.
    entityId: uuid('entity_id').notNull(),
    oldValues: text('old_values'), // JSON string of old values
    newValues: text('new_values'), // JSON string of new values
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    metadata: text('metadata'), // JSON string of additional metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Scheduled Reports table
export const scheduledReports = pgTable('scheduled_reports', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    reportType: text('report_type').notNull(), // issues, products, service_operations, etc.
    schedule: text('schedule').notNull(), // Cron expression
    format: text('format').notNull(), // pdf, excel, csv
    recipients: text('recipients').notNull(), // JSON array of email addresses
    smsRecipients: text('sms_recipients'), // JSON array of phone numbers
    filters: text('filters'), // JSON object of filters
    isActive: boolean('is_active').default(true).notNull(),
    lastRun: timestamp('last_run'),
    nextRun: timestamp('next_run'),
    createdBy: uuid('created_by').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Performance Metrics table
export const performanceMetrics = pgTable('performance_metrics', {
    id: uuid('id').primaryKey().defaultRandom(),
    endpoint: text('endpoint').notNull(),
    method: text('method').notNull(),
    responseTime: integer('response_time').notNull(), // in milliseconds
    statusCode: integer('status_code').notNull(),
    userId: uuid('user_id'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    memoryUsage: integer('memory_usage'), // in bytes
    cpuUsage: real('cpu_usage'), // percentage
    errorMessage: text('error_message'),
    metadata: text('metadata'), // JSON string
});

// Comments table for collaboration
export const comments = pgTable('comments', {
    id: uuid('id').primaryKey().defaultRandom(),
    content: text('content').notNull(),
    authorId: uuid('author_id').notNull().references(() => users.id),
    entityType: text('entity_type').notNull(), // issue, product, service_operation
    entityId: uuid('entity_id').notNull(),
    parentId: uuid('parent_id'), // for replies
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Mentions table for collaboration
export const mentions = pgTable('mentions', {
    id: uuid('id').primaryKey().defaultRandom(),
    commentId: uuid('comment_id').notNull().references(() => comments.id),
    userId: uuid('user_id').notNull().references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Inventory Count table
export const inventoryCounts = pgTable('inventory_counts', {
    id: uuid('id').primaryKey().defaultRandom(),
    locationId: uuid('location_id').notNull().references(() => locations.id),
    countedBy: uuid('counted_by').notNull().references(() => users.id),
    countedItems: text('counted_items').notNull(), // JSON array of counted items
    totalItems: integer('total_items').notNull(),
    completedAt: timestamp('completed_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notifications table for collaboration (already defined above)

// Type definitions
export type ProductStatus = typeof productStatusEnum[number];
export type WarrantyStatus = typeof warrantyStatusEnum[number];
export type ProductHistoryEventType = 'STATUS_CHANGE' | 'LOCATION_CHANGE' | 'OWNER_CHANGE' | 'WARRANTY_CHANGE' | 'PRODUCTION_ENTRY' | 'HARDWARE_VERIFICATION' | 'SALE' | 'ISSUE_CREATED' | 'SERVICE_OPERATION'; 