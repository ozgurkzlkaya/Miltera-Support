CREATE TABLE "file_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" text NOT NULL,
	"original_file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_url" text,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_type" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"description" text,
	"tags" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "public_to_internal_category_map" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "public_to_internal_category_map" CASCADE;--> statement-breakpoint
ALTER TABLE "internal_issue_categories" DROP CONSTRAINT "internal_issue_categories_code_unique";--> statement-breakpoint
ALTER TABLE "issue_categories" DROP CONSTRAINT "issue_categories_name_unique";--> statement-breakpoint
ALTER TABLE "issue_products" DROP CONSTRAINT "issue_products_issue_id_issues_id_fk";
--> statement-breakpoint
ALTER TABLE "issue_products" DROP CONSTRAINT "issue_products_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "issues" DROP CONSTRAINT "issues_category_id_issue_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "issues" DROP CONSTRAINT "issues_internal_category_id_internal_issue_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "issues" DROP CONSTRAINT "issues_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "product_history" DROP CONSTRAINT "product_history_related_issue_id_issues_id_fk";
--> statement-breakpoint
ALTER TABLE "product_history" DROP CONSTRAINT "product_history_related_shipment_id_shipments_id_fk";
--> statement-breakpoint
ALTER TABLE "product_history" DROP CONSTRAINT "product_history_related_service_operation_id_service_operations_id_fk";
--> statement-breakpoint
ALTER TABLE "product_history" DROP CONSTRAINT "product_history_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "service_operations" DROP CONSTRAINT "service_operations_issue_id_issues_id_fk";
--> statement-breakpoint
ALTER TABLE "service_operations" DROP CONSTRAINT "service_operations_issue_product_id_issue_products_id_fk";
--> statement-breakpoint
ALTER TABLE "shipment_items" DROP CONSTRAINT "shipment_items_shipment_id_shipments_id_fk";
--> statement-breakpoint
ALTER TABLE "shipments" DROP CONSTRAINT "shipments_issue_id_issues_id_fk";
--> statement-breakpoint
ALTER TABLE "shipments" DROP CONSTRAINT "shipments_updated_by_users_id_fk";
--> statement-breakpoint
DROP INDEX "unique_issue_product";--> statement-breakpoint
DROP INDEX "unique_shipment_item";--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "internal_issue_categories" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "internal_issue_categories" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "internal_issue_categories" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "issue_categories" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "issue_categories" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "issue_categories" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "issue_number" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "source" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "company_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "priority" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "jwkss" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "locations" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "locations" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "product_history" ALTER COLUMN "event" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "product_history" ALTER COLUMN "event_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "product_history" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "product_history" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "product_models" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "product_models" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "product_types" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "product_types" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "warranty_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "warranty_status" SET DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "service_operations" ALTER COLUMN "operation_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "service_operations" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "service_operations" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "service_operations" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "shipments" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "shipments" ALTER COLUMN "company_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "shipments" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "shipments" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "shipments" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "verifications" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "verifications" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "internal_issue_categories" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "internal_issue_categories" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "issue_categories" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "issue_products" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "issue_products" ADD COLUMN "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "issue_products" ADD COLUMN "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "issue_products" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "product_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "customer_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "reported_by" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "assigned_to" uuid;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "issue_category_id" uuid;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "internal_issue_category_id" uuid;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "reported_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "assigned_at" timestamp;--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "resolved_at" timestamp;--> statement-breakpoint
ALTER TABLE "product_history" ADD COLUMN "event_data" jsonb;--> statement-breakpoint
ALTER TABLE "product_history" ADD COLUMN "performed_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "product_type_id" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "current_status" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "company_id" uuid;--> statement-breakpoint
ALTER TABLE "service_operations" ADD COLUMN "product_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "service_operations" ADD COLUMN "technician_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "service_operations" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "service_operations" ADD COLUMN "parts_used" jsonb;--> statement-breakpoint
ALTER TABLE "service_operations" ADD COLUMN "test_results" jsonb;--> statement-breakpoint
ALTER TABLE "service_operations" ADD COLUMN "started_at" timestamp;--> statement-breakpoint
ALTER TABLE "service_operations" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "service_operations" ADD COLUMN "estimated_duration" integer;--> statement-breakpoint
ALTER TABLE "shipment_items" ADD COLUMN "quantity" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "shipment_items" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "shipment_items" ADD COLUMN "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "shipment_items" ADD COLUMN "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE "shipment_items" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "shipments" ADD COLUMN "from_location_id" uuid;--> statement-breakpoint
ALTER TABLE "shipments" ADD COLUMN "to_location_id" uuid;--> statement-breakpoint
ALTER TABLE "shipments" ADD COLUMN "from_company_id" uuid;--> statement-breakpoint
ALTER TABLE "shipments" ADD COLUMN "to_company_id" uuid;--> statement-breakpoint
ALTER TABLE "shipments" ADD COLUMN "product_id" uuid;--> statement-breakpoint
ALTER TABLE "shipments" ADD COLUMN "shipped_at" timestamp;--> statement-breakpoint
ALTER TABLE "shipments" ADD COLUMN "delivered_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_products" ADD CONSTRAINT "issue_products_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_products" ADD CONSTRAINT "issue_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_customer_id_companies_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_issue_category_id_issue_categories_id_fk" FOREIGN KEY ("issue_category_id") REFERENCES "public"."issue_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_internal_issue_category_id_internal_issue_categories_id_fk" FOREIGN KEY ("internal_issue_category_id") REFERENCES "public"."internal_issue_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_history" ADD CONSTRAINT "product_history_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_product_type_id_product_types_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_operations" ADD CONSTRAINT "service_operations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_operations" ADD CONSTRAINT "service_operations_technician_id_users_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_operations" ADD CONSTRAINT "service_operations_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_operations" ADD CONSTRAINT "service_operations_issue_product_id_issue_products_id_fk" FOREIGN KEY ("issue_product_id") REFERENCES "public"."issue_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_from_location_id_locations_id_fk" FOREIGN KEY ("from_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_to_location_id_locations_id_fk" FOREIGN KEY ("to_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_from_company_id_companies_id_fk" FOREIGN KEY ("from_company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_to_company_id_companies_id_fk" FOREIGN KEY ("to_company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internal_issue_categories" DROP COLUMN "code";--> statement-breakpoint
ALTER TABLE "issue_categories" DROP COLUMN "display_order";--> statement-breakpoint
ALTER TABLE "issues" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "issues" DROP COLUMN "internal_category_id";--> statement-breakpoint
ALTER TABLE "issues" DROP COLUMN "issue_date";--> statement-breakpoint
ALTER TABLE "issues" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "product_history" DROP COLUMN "related_issue_id";--> statement-breakpoint
ALTER TABLE "product_history" DROP COLUMN "related_shipment_id";--> statement-breakpoint
ALTER TABLE "product_history" DROP COLUMN "related_service_operation_id";--> statement-breakpoint
ALTER TABLE "shipments" DROP COLUMN "issue_id";--> statement-breakpoint
ALTER TABLE "shipments" DROP COLUMN "updated_by";--> statement-breakpoint
DROP TYPE "public"."issue_priority";--> statement-breakpoint
DROP TYPE "public"."issue_source";--> statement-breakpoint
DROP TYPE "public"."issue_status";--> statement-breakpoint
DROP TYPE "public"."operation_type";--> statement-breakpoint
DROP TYPE "public"."product_history_event_type";--> statement-breakpoint
DROP TYPE "public"."product_status";--> statement-breakpoint
DROP TYPE "public"."service_operation_status";--> statement-breakpoint
DROP TYPE "public"."shipment_status";--> statement-breakpoint
DROP TYPE "public"."shipment_type";--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
DROP TYPE "public"."warranty_status";