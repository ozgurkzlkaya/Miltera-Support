CREATE TYPE "public"."issue_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."issue_source" AS ENUM('CUSTOMER', 'TSP', 'FIRST_PRODUCTION');--> statement-breakpoint
CREATE TYPE "public"."issue_status" AS ENUM('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER_APPROVAL', 'REPAIRED', 'CLOSED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."operation_type" AS ENUM('HARDWARE_VERIFICATION', 'CONFIGURATION', 'PRE_TEST', 'REPAIR', 'FINAL_TEST', 'QUALITY_CHECK');--> statement-breakpoint
CREATE TYPE "public"."product_history_event_type" AS ENUM('production', 'test', 'shipping', 'service', 'status_change', 'issue', 'other');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('FIRST_PRODUCTION', 'FIRST_PRODUCTION_ISSUE', 'FIRST_PRODUCTION_SCRAPPED', 'READY_FOR_SHIPMENT', 'SHIPPED', 'ISSUE_CREATED', 'RECEIVED', 'PRE_TEST_COMPLETED', 'UNDER_REPAIR', 'SERVICE_SCRAPPED', 'DELIVERED');--> statement-breakpoint
CREATE TYPE "public"."service_operation_status" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."shipment_status" AS ENUM('PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."shipment_type" AS ENUM('SALES', 'SERVICE_RETURN', 'SERVICE_SEND');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'TSP', 'CUSTOMER');--> statement-breakpoint
CREATE TYPE "public"."warranty_status" AS ENUM('IN_WARRANTY', 'OUT_OF_WARRANTY', 'PENDING');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"phone" text,
	"email" text,
	"contact_person_name" text,
	"contact_person_surname" text,
	"contact_person_email" text,
	"contact_person_phone" text,
	"is_manufacturer" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "internal_issue_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(64) NOT NULL,
	"name" varchar(120) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "internal_issue_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "issue_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "issue_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "issue_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" uuid NOT NULL,
	"product_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_number" varchar(20) NOT NULL,
	"source" "issue_source" NOT NULL,
	"company_id" uuid,
	"category_id" uuid,
	"internal_category_id" uuid,
	"status" "issue_status" NOT NULL,
	"priority" "issue_priority" NOT NULL,
	"customer_description" text,
	"technician_description" text,
	"is_under_warranty" boolean DEFAULT false,
	"estimated_cost" numeric(10, 2),
	"actual_cost" numeric(10, 2),
	"issue_date" timestamp NOT NULL,
	"pre_inspection_date" timestamp,
	"repair_date" timestamp,
	"created_by" uuid NOT NULL,
	"pre_inspected_by" uuid,
	"repaired_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "issues_issue_number_unique" UNIQUE("issue_number")
);
--> statement-breakpoint
CREATE TABLE "jwkss" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"address" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "product_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"event" varchar(255) NOT NULL,
	"event_type" "product_history_event_type" NOT NULL,
	"performed_by" uuid NOT NULL,
	"location_id" uuid,
	"related_issue_id" uuid,
	"related_shipment_id" uuid,
	"related_service_operation_id" uuid,
	"event_timestamp" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "product_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_type_id" uuid NOT NULL,
	"manufacturer_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "product_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_model_id" uuid NOT NULL,
	"serial_number" text,
	"status" "product_status" NOT NULL,
	"owner_id" uuid,
	"production_date" timestamp NOT NULL,
	"production_entry_by" uuid NOT NULL,
	"warranty_start_date" timestamp,
	"warranty_period_months" integer,
	"warranty_status" "warranty_status" DEFAULT 'PENDING',
	"sold_date" timestamp,
	"hardware_verification_date" timestamp,
	"hardware_verification_by" uuid,
	"location_id" uuid,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "public_to_internal_category_map" (
	"public_category_id" uuid NOT NULL,
	"internal_category_id" uuid NOT NULL,
	CONSTRAINT "public_to_internal_category_map_public_category_id_internal_category_id_pk" PRIMARY KEY("public_category_id","internal_category_id")
);
--> statement-breakpoint
CREATE TABLE "service_operations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" uuid NOT NULL,
	"issue_product_id" uuid,
	"operation_type" "operation_type" NOT NULL,
	"performed_by" uuid NOT NULL,
	"status" "service_operation_status" NOT NULL,
	"description" text NOT NULL,
	"findings" text,
	"actions_taken" text,
	"is_under_warranty" boolean DEFAULT false,
	"cost" numeric(10, 2),
	"operation_date" timestamp NOT NULL,
	"duration" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "shipment_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"product_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_number" text NOT NULL,
	"type" "shipment_type" NOT NULL,
	"company_id" uuid NOT NULL,
	"issue_id" uuid,
	"status" "shipment_status" NOT NULL,
	"tracking_number" text,
	"estimated_delivery" timestamp,
	"actual_delivery" timestamp,
	"total_cost" numeric(10, 2),
	"notes" text,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "shipments_shipment_number_unique" UNIQUE("shipment_number")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" NOT NULL,
	"company_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_products" ADD CONSTRAINT "issue_products_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_products" ADD CONSTRAINT "issue_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_category_id_issue_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."issue_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_internal_category_id_internal_issue_categories_id_fk" FOREIGN KEY ("internal_category_id") REFERENCES "public"."internal_issue_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_pre_inspected_by_users_id_fk" FOREIGN KEY ("pre_inspected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_repaired_by_users_id_fk" FOREIGN KEY ("repaired_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_history" ADD CONSTRAINT "product_history_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_history" ADD CONSTRAINT "product_history_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_history" ADD CONSTRAINT "product_history_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_history" ADD CONSTRAINT "product_history_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_history" ADD CONSTRAINT "product_history_related_issue_id_issues_id_fk" FOREIGN KEY ("related_issue_id") REFERENCES "public"."issues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_history" ADD CONSTRAINT "product_history_related_shipment_id_shipments_id_fk" FOREIGN KEY ("related_shipment_id") REFERENCES "public"."shipments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_history" ADD CONSTRAINT "product_history_related_service_operation_id_service_operations_id_fk" FOREIGN KEY ("related_service_operation_id") REFERENCES "public"."service_operations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_models" ADD CONSTRAINT "product_models_product_type_id_product_types_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_models" ADD CONSTRAINT "product_models_manufacturer_id_companies_id_fk" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_product_model_id_product_models_id_fk" FOREIGN KEY ("product_model_id") REFERENCES "public"."product_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_owner_id_companies_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_production_entry_by_users_id_fk" FOREIGN KEY ("production_entry_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_hardware_verification_by_users_id_fk" FOREIGN KEY ("hardware_verification_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_to_internal_category_map" ADD CONSTRAINT "public_to_internal_category_map_public_category_id_issue_categories_id_fk" FOREIGN KEY ("public_category_id") REFERENCES "public"."issue_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_to_internal_category_map" ADD CONSTRAINT "public_to_internal_category_map_internal_category_id_internal_issue_categories_id_fk" FOREIGN KEY ("internal_category_id") REFERENCES "public"."internal_issue_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_operations" ADD CONSTRAINT "service_operations_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_operations" ADD CONSTRAINT "service_operations_issue_product_id_issue_products_id_fk" FOREIGN KEY ("issue_product_id") REFERENCES "public"."issue_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_operations" ADD CONSTRAINT "service_operations_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_issue_product" ON "issue_products" USING btree ("issue_id","product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_shipment_item" ON "shipment_items" USING btree ("shipment_id","product_id");