import { relations } from "drizzle-orm/relations";
import { users, comments, mentions, fileAttachments, accounts, productModels, products, productTypes, companies, locations, productHistory, issues, issueCategories, internalIssueCategories, shipments, shipmentItems, serviceOperations, issueProducts, inventoryCounts, notifications } from "./schema";

export const commentsRelations = relations(comments, ({one, many}) => ({
	user: one(users, {
		fields: [comments.authorId],
		references: [users.id]
	}),
	mentions: many(mentions),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	comments: many(comments),
	mentions: many(mentions),
	fileAttachments: many(fileAttachments),
	accounts: many(accounts),
	products_productionEntryBy: many(products, {
		relationName: "products_productionEntryBy_users_id"
	}),
	products_hardwareVerificationBy: many(products, {
		relationName: "products_hardwareVerificationBy_users_id"
	}),
	products_createdBy: many(products, {
		relationName: "products_createdBy_users_id"
	}),
	products_updatedBy: many(products, {
		relationName: "products_updatedBy_users_id"
	}),
	productHistories_performedBy: many(productHistory, {
		relationName: "productHistory_performedBy_users_id"
	}),
	productHistories_createdBy: many(productHistory, {
		relationName: "productHistory_createdBy_users_id"
	}),
	issues_reportedBy: many(issues, {
		relationName: "issues_reportedBy_users_id"
	}),
	issues_assignedTo: many(issues, {
		relationName: "issues_assignedTo_users_id"
	}),
	issues_preInspectedBy: many(issues, {
		relationName: "issues_preInspectedBy_users_id"
	}),
	issues_repairedBy: many(issues, {
		relationName: "issues_repairedBy_users_id"
	}),
	serviceOperations_technicianId: many(serviceOperations, {
		relationName: "serviceOperations_technicianId_users_id"
	}),
	serviceOperations_performedBy: many(serviceOperations, {
		relationName: "serviceOperations_performedBy_users_id"
	}),
	company: one(companies, {
		fields: [users.companyId],
		references: [companies.id]
	}),
	shipments: many(shipments),
	inventoryCounts: many(inventoryCounts),
	notifications_userId: many(notifications, {
		relationName: "notifications_userId_users_id"
	}),
	notifications_createdBy: many(notifications, {
		relationName: "notifications_createdBy_users_id"
	}),
}));

export const mentionsRelations = relations(mentions, ({one}) => ({
	comment: one(comments, {
		fields: [mentions.commentId],
		references: [comments.id]
	}),
	user: one(users, {
		fields: [mentions.userId],
		references: [users.id]
	}),
}));

export const fileAttachmentsRelations = relations(fileAttachments, ({one}) => ({
	user: one(users, {
		fields: [fileAttachments.uploadedBy],
		references: [users.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	productModel: one(productModels, {
		fields: [products.productModelId],
		references: [productModels.id]
	}),
	productType: one(productTypes, {
		fields: [products.productTypeId],
		references: [productTypes.id]
	}),
	company_ownerId: one(companies, {
		fields: [products.ownerId],
		references: [companies.id],
		relationName: "products_ownerId_companies_id"
	}),
	company_companyId: one(companies, {
		fields: [products.companyId],
		references: [companies.id],
		relationName: "products_companyId_companies_id"
	}),
	user_productionEntryBy: one(users, {
		fields: [products.productionEntryBy],
		references: [users.id],
		relationName: "products_productionEntryBy_users_id"
	}),
	user_hardwareVerificationBy: one(users, {
		fields: [products.hardwareVerificationBy],
		references: [users.id],
		relationName: "products_hardwareVerificationBy_users_id"
	}),
	location: one(locations, {
		fields: [products.locationId],
		references: [locations.id]
	}),
	user_createdBy: one(users, {
		fields: [products.createdBy],
		references: [users.id],
		relationName: "products_createdBy_users_id"
	}),
	user_updatedBy: one(users, {
		fields: [products.updatedBy],
		references: [users.id],
		relationName: "products_updatedBy_users_id"
	}),
	productHistories: many(productHistory),
	issues: many(issues),
	shipmentItems: many(shipmentItems),
	serviceOperations: many(serviceOperations),
	issueProducts: many(issueProducts),
	shipments: many(shipments),
}));

export const productModelsRelations = relations(productModels, ({one, many}) => ({
	products: many(products),
	productType: one(productTypes, {
		fields: [productModels.productTypeId],
		references: [productTypes.id]
	}),
	company: one(companies, {
		fields: [productModels.manufacturerId],
		references: [companies.id]
	}),
}));

export const productTypesRelations = relations(productTypes, ({many}) => ({
	products: many(products),
	productModels: many(productModels),
}));

export const companiesRelations = relations(companies, ({many}) => ({
	products_ownerId: many(products, {
		relationName: "products_ownerId_companies_id"
	}),
	products_companyId: many(products, {
		relationName: "products_companyId_companies_id"
	}),
	issues_customerId: many(issues, {
		relationName: "issues_customerId_companies_id"
	}),
	issues_companyId: many(issues, {
		relationName: "issues_companyId_companies_id"
	}),
	productModels: many(productModels),
	users: many(users),
	shipments_fromCompanyId: many(shipments, {
		relationName: "shipments_fromCompanyId_companies_id"
	}),
	shipments_toCompanyId: many(shipments, {
		relationName: "shipments_toCompanyId_companies_id"
	}),
	shipments_companyId: many(shipments, {
		relationName: "shipments_companyId_companies_id"
	}),
}));

export const locationsRelations = relations(locations, ({many}) => ({
	products: many(products),
	productHistories: many(productHistory),
	shipments_fromLocationId: many(shipments, {
		relationName: "shipments_fromLocationId_locations_id"
	}),
	shipments_toLocationId: many(shipments, {
		relationName: "shipments_toLocationId_locations_id"
	}),
	inventoryCounts: many(inventoryCounts),
}));

export const productHistoryRelations = relations(productHistory, ({one}) => ({
	product: one(products, {
		fields: [productHistory.productId],
		references: [products.id]
	}),
	location: one(locations, {
		fields: [productHistory.locationId],
		references: [locations.id]
	}),
	user_performedBy: one(users, {
		fields: [productHistory.performedBy],
		references: [users.id],
		relationName: "productHistory_performedBy_users_id"
	}),
	user_createdBy: one(users, {
		fields: [productHistory.createdBy],
		references: [users.id],
		relationName: "productHistory_createdBy_users_id"
	}),
}));

export const issuesRelations = relations(issues, ({one, many}) => ({
	product: one(products, {
		fields: [issues.productId],
		references: [products.id]
	}),
	company_customerId: one(companies, {
		fields: [issues.customerId],
		references: [companies.id],
		relationName: "issues_customerId_companies_id"
	}),
	company_companyId: one(companies, {
		fields: [issues.companyId],
		references: [companies.id],
		relationName: "issues_companyId_companies_id"
	}),
	user_reportedBy: one(users, {
		fields: [issues.reportedBy],
		references: [users.id],
		relationName: "issues_reportedBy_users_id"
	}),
	user_assignedTo: one(users, {
		fields: [issues.assignedTo],
		references: [users.id],
		relationName: "issues_assignedTo_users_id"
	}),
	issueCategory: one(issueCategories, {
		fields: [issues.issueCategoryId],
		references: [issueCategories.id]
	}),
	user_preInspectedBy: one(users, {
		fields: [issues.preInspectedBy],
		references: [users.id],
		relationName: "issues_preInspectedBy_users_id"
	}),
	user_repairedBy: one(users, {
		fields: [issues.repairedBy],
		references: [users.id],
		relationName: "issues_repairedBy_users_id"
	}),
	internalIssueCategory: one(internalIssueCategories, {
		fields: [issues.internalIssueCategoryId],
		references: [internalIssueCategories.id]
	}),
	serviceOperations: many(serviceOperations),
	issueProducts: many(issueProducts),
}));

export const issueCategoriesRelations = relations(issueCategories, ({many}) => ({
	issues: many(issues),
}));

export const internalIssueCategoriesRelations = relations(internalIssueCategories, ({many}) => ({
	issues: many(issues),
}));

export const shipmentItemsRelations = relations(shipmentItems, ({one}) => ({
	shipment: one(shipments, {
		fields: [shipmentItems.shipmentId],
		references: [shipments.id]
	}),
	product: one(products, {
		fields: [shipmentItems.productId],
		references: [products.id]
	}),
}));

export const shipmentsRelations = relations(shipments, ({one, many}) => ({
	shipmentItems: many(shipmentItems),
	location_fromLocationId: one(locations, {
		fields: [shipments.fromLocationId],
		references: [locations.id],
		relationName: "shipments_fromLocationId_locations_id"
	}),
	location_toLocationId: one(locations, {
		fields: [shipments.toLocationId],
		references: [locations.id],
		relationName: "shipments_toLocationId_locations_id"
	}),
	company_fromCompanyId: one(companies, {
		fields: [shipments.fromCompanyId],
		references: [companies.id],
		relationName: "shipments_fromCompanyId_companies_id"
	}),
	company_toCompanyId: one(companies, {
		fields: [shipments.toCompanyId],
		references: [companies.id],
		relationName: "shipments_toCompanyId_companies_id"
	}),
	company_companyId: one(companies, {
		fields: [shipments.companyId],
		references: [companies.id],
		relationName: "shipments_companyId_companies_id"
	}),
	product: one(products, {
		fields: [shipments.productId],
		references: [products.id]
	}),
	user: one(users, {
		fields: [shipments.createdBy],
		references: [users.id]
	}),
}));

export const serviceOperationsRelations = relations(serviceOperations, ({one}) => ({
	product: one(products, {
		fields: [serviceOperations.productId],
		references: [products.id]
	}),
	issueProduct: one(issueProducts, {
		fields: [serviceOperations.issueProductId],
		references: [issueProducts.id]
	}),
	user_technicianId: one(users, {
		fields: [serviceOperations.technicianId],
		references: [users.id],
		relationName: "serviceOperations_technicianId_users_id"
	}),
	user_performedBy: one(users, {
		fields: [serviceOperations.performedBy],
		references: [users.id],
		relationName: "serviceOperations_performedBy_users_id"
	}),
	issue: one(issues, {
		fields: [serviceOperations.issueId],
		references: [issues.id]
	}),
}));

export const issueProductsRelations = relations(issueProducts, ({one, many}) => ({
	serviceOperations: many(serviceOperations),
	product: one(products, {
		fields: [issueProducts.productId],
		references: [products.id]
	}),
	issue: one(issues, {
		fields: [issueProducts.issueId],
		references: [issues.id]
	}),
}));

export const inventoryCountsRelations = relations(inventoryCounts, ({one}) => ({
	location: one(locations, {
		fields: [inventoryCounts.locationId],
		references: [locations.id]
	}),
	user: one(users, {
		fields: [inventoryCounts.countedBy],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user_userId: one(users, {
		fields: [notifications.userId],
		references: [users.id],
		relationName: "notifications_userId_users_id"
	}),
	user_createdBy: one(users, {
		fields: [notifications.createdBy],
		references: [users.id],
		relationName: "notifications_createdBy_users_id"
	}),
}));