/**
 * Miltera Fixlog Database Schema
 * 
 * Bu dosya, PostgreSQL veritabanının tüm tablolarını Drizzle ORM ile tanımlar.
 * Tüm CRUD işlemleri bu schema'ya göre yapılır.
 * 
 * Ana Tablolar:
 * - users: Kullanıcı bilgileri
 * - companies: Şirket bilgileri
 * - products: Ürün bilgileri
 * - issues: Sorun/Arıza kayıtları
 * - service_operations: Servis operasyonları
 * - warehouse: Depo yönetimi
 * - notifications: Bildirimler
 * - audit_logs: Audit kayıtları
 * - performance_metrics: Performance metrikleri
 * 
 * Özellikler:
 * - UUID primary keys
 * - Timestamp tracking
 * - Foreign key relationships
 * - JSONB support
 * - Audit logging
 * - Performance monitoring
 */

import { pgTable, uuid, text, timestamp, integer, real, boolean, foreignKey, jsonb, unique, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const auditLogs = pgTable("audit_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	action: text().notNull(),
	entityType: text("entity_type").notNull(),
	entityId: uuid("entity_id").notNull(),
	oldValues: text("old_values"),
	newValues: text("new_values"),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	metadata: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const performanceMetrics = pgTable("performance_metrics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	endpoint: text().notNull(),
	method: text().notNull(),
	responseTime: integer("response_time").notNull(),
	statusCode: integer("status_code").notNull(),
	userId: uuid("user_id"),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	memoryUsage: integer("memory_usage"),
	cpuUsage: real("cpu_usage"),
	errorMessage: text("error_message"),
	metadata: text(),
});

export const scheduledReports = pgTable("scheduled_reports", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	reportType: text("report_type").notNull(),
	schedule: text().notNull(),
	format: text().notNull(),
	recipients: text().notNull(),
	smsRecipients: text("sms_recipients"),
	filters: text(),
	isActive: boolean("is_active").default(true).notNull(),
	lastRun: timestamp("last_run", { mode: 'string' }),
	nextRun: timestamp("next_run", { mode: 'string' }),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const comments = pgTable("comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	content: text().notNull(),
	authorId: uuid("author_id").notNull(),
	entityType: text("entity_type").notNull(),
	entityId: uuid("entity_id").notNull(),
	parentId: uuid("parent_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "comments_author_id_users_id_fk"
		}),
]);

export const mentions = pgTable("mentions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	commentId: uuid("comment_id").notNull(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.commentId],
			foreignColumns: [comments.id],
			name: "mentions_comment_id_comments_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mentions_user_id_users_id_fk"
		}),
]);

export const fileAttachments = pgTable("file_attachments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	fileName: text("file_name").notNull(),
	originalFileName: text("original_file_name").notNull(),
	filePath: text("file_path").notNull(),
	fileUrl: text("file_url"),
	mimeType: text("mime_type").notNull(),
	fileSize: integer("file_size").notNull(),
	fileType: text("file_type").notNull(),
	entityType: text("entity_type").notNull(),
	entityId: uuid("entity_id").notNull(),
	uploadedBy: uuid("uploaded_by").notNull(),
	description: text(),
	tags: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [users.id],
			name: "file_attachments_uploaded_by_users_id_fk"
		}),
]);

export const internalIssueCategories = pgTable("internal_issue_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const companies = pgTable("companies", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	address: text(),
	phone: text(),
	email: text(),
	contactPersonName: text("contact_person_name"),
	contactPersonSurname: text("contact_person_surname"),
	contactPersonEmail: text("contact_person_email"),
	contactPersonPhone: text("contact_person_phone"),
	isManufacturer: boolean("is_manufacturer").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const accounts = pgTable("accounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: uuid("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const issueCategories = pgTable("issue_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productModelId: uuid("product_model_id").notNull(),
	productTypeId: uuid("product_type_id"),
	serialNumber: text("serial_number"),
	status: text().notNull(),
	currentStatus: text("current_status").notNull(),
	notes: text(),
	ownerId: uuid("owner_id"),
	companyId: uuid("company_id"),
	productionDate: timestamp("production_date", { mode: 'string' }).notNull(),
	productionEntryBy: uuid("production_entry_by").notNull(),
	warrantyStartDate: timestamp("warranty_start_date", { mode: 'string' }),
	warrantyPeriodMonths: integer("warranty_period_months"),
	warrantyStatus: text("warranty_status").default('PENDING'),
	soldDate: timestamp("sold_date", { mode: 'string' }),
	hardwareVerificationDate: timestamp("hardware_verification_date", { mode: 'string' }),
	hardwareVerificationBy: uuid("hardware_verification_by"),
	locationId: uuid("location_id"),
	createdBy: uuid("created_by").notNull(),
	updatedBy: uuid("updated_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.productModelId],
			foreignColumns: [productModels.id],
			name: "products_product_model_id_product_models_id_fk"
		}),
	foreignKey({
			columns: [table.productTypeId],
			foreignColumns: [productTypes.id],
			name: "products_product_type_id_product_types_id_fk"
		}),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [companies.id],
			name: "products_owner_id_companies_id_fk"
		}),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "products_company_id_companies_id_fk"
		}),
	foreignKey({
			columns: [table.productionEntryBy],
			foreignColumns: [users.id],
			name: "products_production_entry_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.hardwareVerificationBy],
			foreignColumns: [users.id],
			name: "products_hardware_verification_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.locationId],
			foreignColumns: [locations.id],
			name: "products_location_id_locations_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "products_created_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "products_updated_by_users_id_fk"
		}),
]);

export const jwkss = pgTable("jwkss", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	publicKey: text("public_key").notNull(),
	privateKey: text("private_key").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
});

export const productTypes = pgTable("product_types", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const locations = pgTable("locations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	type: text().notNull(),
	address: text(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	capacity: integer(),
	currentCount: integer("current_count").default(0),
});

export const productHistory = pgTable("product_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	eventType: text("event_type").notNull(),
	event: text().notNull(),
	eventData: jsonb("event_data"),
	eventTimestamp: timestamp("event_timestamp", { mode: 'string' }).notNull(),
	locationId: uuid("location_id"),
	performedBy: uuid("performed_by").notNull(),
	performedAt: timestamp("performed_at", { mode: 'string' }).notNull(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_history_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.locationId],
			foreignColumns: [locations.id],
			name: "product_history_location_id_locations_id_fk"
		}),
	foreignKey({
			columns: [table.performedBy],
			foreignColumns: [users.id],
			name: "product_history_performed_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "product_history_created_by_users_id_fk"
		}),
]);

export const issues = pgTable("issues", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	issueNumber: text("issue_number").notNull(),
	productId: uuid("product_id"),
	customerId: uuid("customer_id"),
	companyId: uuid("company_id").notNull(),
	reportedBy: uuid("reported_by").notNull(),
	assignedTo: uuid("assigned_to"),
	title: text().notNull(),
	description: text().notNull(),
	customerDescription: text("customer_description"),
	technicianDescription: text("technician_description"),
	status: text().notNull(),
	priority: text().notNull(),
	source: text().notNull(),
	issueCategoryId: uuid("issue_category_id"),
	internalIssueCategoryId: uuid("internal_issue_category_id"),
	isUnderWarranty: boolean("is_under_warranty").default(false),
	estimatedCost: numeric("estimated_cost", { precision: 10, scale:  2 }),
	actualCost: numeric("actual_cost", { precision: 10, scale:  2 }),
	reportedAt: timestamp("reported_at", { mode: 'string' }).notNull(),
	assignedAt: timestamp("assigned_at", { mode: 'string' }),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	preInspectionDate: timestamp("pre_inspection_date", { mode: 'string' }),
	repairDate: timestamp("repair_date", { mode: 'string' }),
	preInspectedBy: uuid("pre_inspected_by"),
	repairedBy: uuid("repaired_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "issues_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [companies.id],
			name: "issues_customer_id_companies_id_fk"
		}),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "issues_company_id_companies_id_fk"
		}),
	foreignKey({
			columns: [table.reportedBy],
			foreignColumns: [users.id],
			name: "issues_reported_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [users.id],
			name: "issues_assigned_to_users_id_fk"
		}),
	foreignKey({
			columns: [table.issueCategoryId],
			foreignColumns: [issueCategories.id],
			name: "issues_issue_category_id_issue_categories_id_fk"
		}),
	foreignKey({
			columns: [table.preInspectedBy],
			foreignColumns: [users.id],
			name: "issues_pre_inspected_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.repairedBy],
			foreignColumns: [users.id],
			name: "issues_repaired_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.internalIssueCategoryId],
			foreignColumns: [internalIssueCategories.id],
			name: "issues_internal_issue_category_id_internal_issue_categories_id_"
		}),
	unique("issues_issue_number_unique").on(table.issueNumber),
]);

export const productModels = pgTable("product_models", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productTypeId: uuid("product_type_id").notNull(),
	manufacturerId: uuid("manufacturer_id").notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.productTypeId],
			foreignColumns: [productTypes.id],
			name: "product_models_product_type_id_product_types_id_fk"
		}),
	foreignKey({
			columns: [table.manufacturerId],
			foreignColumns: [companies.id],
			name: "product_models_manufacturer_id_companies_id_fk"
		}),
]);

export const shipmentItems = pgTable("shipment_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	shipmentId: uuid("shipment_id").notNull(),
	productId: uuid("product_id").notNull(),
	quantity: integer().default(1).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.shipmentId],
			foreignColumns: [shipments.id],
			name: "shipment_items_shipment_id_shipments_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "shipment_items_product_id_products_id_fk"
		}),
]);

export const serviceOperations = pgTable("service_operations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	issueId: uuid("issue_id"),
	productId: uuid("product_id").notNull(),
	issueProductId: uuid("issue_product_id"),
	technicianId: uuid("technician_id").notNull(),
	performedBy: uuid("performed_by").notNull(),
	operationType: text("operation_type").notNull(),
	status: text().notNull(),
	description: text().notNull(),
	notes: text(),
	findings: text(),
	actionsTaken: text("actions_taken"),
	operationDate: timestamp("operation_date", { mode: 'string' }).notNull(),
	isUnderWarranty: boolean("is_under_warranty").default(false),
	cost: numeric({ precision: 10, scale:  2 }),
	partsUsed: jsonb("parts_used"),
	testResults: jsonb("test_results"),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	estimatedDuration: integer("estimated_duration"),
	duration: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "service_operations_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.issueProductId],
			foreignColumns: [issueProducts.id],
			name: "service_operations_issue_product_id_issue_products_id_fk"
		}),
	foreignKey({
			columns: [table.technicianId],
			foreignColumns: [users.id],
			name: "service_operations_technician_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.performedBy],
			foreignColumns: [users.id],
			name: "service_operations_performed_by_users_id_fk"
		}),
	foreignKey({
			columns: [table.issueId],
			foreignColumns: [issues.id],
			name: "service_operations_issue_id_issues_id_fk"
		}).onDelete("cascade"),
]);

export const verifications = pgTable("verifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	name: text(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	role: text(),
	companyId: uuid("company_id"),
	isActive: boolean("is_active").default(true).notNull(),
	mustChangePassword: boolean("must_change_password").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "users_company_id_companies_id_fk"
		}),
	unique("users_email_unique").on(table.email),
]);

export const issueProducts = pgTable("issue_products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	issueId: uuid("issue_id").notNull(),
	productId: uuid("product_id").notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "issue_products_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.issueId],
			foreignColumns: [issues.id],
			name: "issue_products_issue_id_issues_id_fk"
		}).onDelete("cascade"),
]);

export const shipments = pgTable("shipments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	shipmentNumber: text("shipment_number").notNull(),
	type: text().notNull(),
	status: text().notNull(),
	fromLocationId: uuid("from_location_id"),
	toLocationId: uuid("to_location_id"),
	fromCompanyId: uuid("from_company_id"),
	toCompanyId: uuid("to_company_id"),
	companyId: uuid("company_id"),
	productId: uuid("product_id"),
	trackingNumber: text("tracking_number"),
	notes: text(),
	totalCost: numeric("total_cost", { precision: 10, scale:  2 }),
	estimatedDelivery: timestamp("estimated_delivery", { mode: 'string' }),
	actualDelivery: timestamp("actual_delivery", { mode: 'string' }),
	shippedAt: timestamp("shipped_at", { mode: 'string' }),
	deliveredAt: timestamp("delivered_at", { mode: 'string' }),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.fromLocationId],
			foreignColumns: [locations.id],
			name: "shipments_from_location_id_locations_id_fk"
		}),
	foreignKey({
			columns: [table.toLocationId],
			foreignColumns: [locations.id],
			name: "shipments_to_location_id_locations_id_fk"
		}),
	foreignKey({
			columns: [table.fromCompanyId],
			foreignColumns: [companies.id],
			name: "shipments_from_company_id_companies_id_fk"
		}),
	foreignKey({
			columns: [table.toCompanyId],
			foreignColumns: [companies.id],
			name: "shipments_to_company_id_companies_id_fk"
		}),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companies.id],
			name: "shipments_company_id_companies_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "shipments_product_id_products_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "shipments_created_by_users_id_fk"
		}),
	unique("shipments_shipment_number_unique").on(table.shipmentNumber),
]);

export const inventoryCounts = pgTable("inventory_counts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	locationId: uuid("location_id").notNull(),
	countedBy: uuid("counted_by").notNull(),
	countedItems: text("counted_items").notNull(),
	totalItems: integer("total_items").notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.locationId],
			foreignColumns: [locations.id],
			name: "inventory_counts_location_id_locations_id_fk"
		}),
	foreignKey({
			columns: [table.countedBy],
			foreignColumns: [users.id],
			name: "inventory_counts_counted_by_users_id_fk"
		}),
]);

export const notifications = pgTable("notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	type: text().notNull(),
	priority: text().notNull(),
	category: text().notNull(),
	description: text(),
	source: text().default('system').notNull(),
	channels: jsonb().default(["in-app"]).notNull(),
	tags: jsonb().default([]),
	read: boolean().default(false).notNull(),
	readAt: timestamp("read_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	userId: uuid("user_id").notNull(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "notifications_created_by_users_id_fk"
		}),
]);
