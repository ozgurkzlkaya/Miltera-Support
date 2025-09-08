-- Migration: PostgreSQL Schema Update
-- Date: 2025-01-17
-- Description: Update schema for PostgreSQL with all missing tables and fields

-- Create ENUM types
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'TSP', 'CUSTOMER');
CREATE TYPE "public"."product_status" AS ENUM(
    'FIRST_PRODUCTION',           -- İlk Üretim
    'FIRST_PRODUCTION_ISSUE',     -- İlk Üretim Arıza
    'FIRST_PRODUCTION_SCRAPPED',  -- İlk Üretim Hurda
    'READY_FOR_SHIPMENT',         -- Sevkiyat Hazır
    'SHIPPED',                    -- Sevk Edildi
    'ISSUE_CREATED',              -- Arıza Kaydı Oluşturuldu
    'RECEIVED',                   -- Cihaz Teslim Alındı
    'PRE_TEST_COMPLETED',         -- Servis Ön Testi Yapıldı
    'UNDER_REPAIR',               -- Cihaz Tamir Edilmekte
    'SERVICE_SCRAPPED',           -- Servis Hurda
    'DELIVERED'                   -- Teslim Edildi
);

CREATE TYPE "public"."issue_status" AS ENUM(
    'OPEN',                       -- Açık
    'IN_PROGRESS',                -- İşlemde
    'WAITING_CUSTOMER_APPROVAL',  -- Müşteri Onayı Bekliyor
    'REPAIRED',                   -- Tamir Edildi
    'CLOSED',                     -- Kapalı
    'CANCELLED'                   -- İptal Edildi
);

CREATE TYPE "public"."issue_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "public"."issue_source" AS ENUM('CUSTOMER', 'TSP', 'FIRST_PRODUCTION');
CREATE TYPE "public"."operation_type" AS ENUM(
    'HARDWARE_VERIFICATION',      -- Donanım Doğrulama
    'CONFIGURATION',              -- Konfigürasyon
    'PRE_TEST',                   -- Ön Test
    'REPAIR',                     -- Tamir
    'FINAL_TEST',                 -- Final Test
    'QUALITY_CHECK'               -- Kalite Kontrol
);

CREATE TYPE "public"."shipment_type" AS ENUM('SALES', 'SERVICE_RETURN', 'SERVICE_SEND');
CREATE TYPE "public"."shipment_status" AS ENUM('PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE "public"."service_operation_status" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "public"."warranty_status" AS ENUM('IN_WARRANTY', 'OUT_OF_WARRANTY', 'PENDING');

-- Create companies table
CREATE TABLE IF NOT EXISTS "companies" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "address" text,
    "phone" text,
    "email" text,
    "contact_person_name" text,
    "contact_person_surname" text,
    "contact_person_email" text,
    "contact_person_phone" text,
    "is_manufacturer" boolean DEFAULT false,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp
);

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "first_name" text NOT NULL,
    "last_name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "email_verified" boolean DEFAULT false NOT NULL,
    "image" text,
    "role" text NOT NULL,
    "company_id" uuid REFERENCES "companies"("id"),
    "is_active" boolean DEFAULT true NOT NULL,
    "must_change_password" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "account_id" text NOT NULL,
    "provider_id" text NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "access_token" text,
    "refresh_token" text,
    "id_token" text,
    "access_token_expires_at" timestamp,
    "refresh_token_expires_at" timestamp,
    "scope" text,
    "password" text,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create verifications table
CREATE TABLE IF NOT EXISTS "verifications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create jwkss table
CREATE TABLE IF NOT EXISTS "jwkss" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "public_key" text NOT NULL,
    "private_key" text NOT NULL,
    "created_at" timestamp NOT NULL
);

-- Create product_types table
CREATE TABLE IF NOT EXISTS "product_types" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "description" text,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp
);

-- Create product_models table
CREATE TABLE IF NOT EXISTS "product_models" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_type_id" uuid NOT NULL REFERENCES "product_types"("id"),
    "manufacturer_id" uuid NOT NULL REFERENCES "companies"("id"),
    "name" text NOT NULL,
    "description" text,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp
);

-- Create locations table
CREATE TABLE IF NOT EXISTS "locations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "type" text NOT NULL,
    "address" text,
    "notes" text,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp
);

-- Create issue_categories table
CREATE TABLE IF NOT EXISTS "issue_categories" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "description" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp
);

-- Create internal_issue_categories table
CREATE TABLE IF NOT EXISTS "internal_issue_categories" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "description" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp
);

-- Create products table
CREATE TABLE IF NOT EXISTS "products" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_model_id" uuid NOT NULL REFERENCES "product_models"("id"),
    "serial_number" text,
    "status" text NOT NULL,
    "owner_id" uuid REFERENCES "companies"("id"),
    "production_date" timestamp NOT NULL,
    "production_entry_by" uuid NOT NULL REFERENCES "users"("id"),
    "warranty_start_date" timestamp,
    "warranty_period_months" integer,
    "warranty_status" text DEFAULT 'PENDING',
    "sold_date" timestamp,
    "hardware_verification_date" timestamp,
    "hardware_verification_by" uuid REFERENCES "users"("id"),
    "location_id" uuid REFERENCES "locations"("id"),
    "created_by" uuid NOT NULL REFERENCES "users"("id"),
    "updated_by" uuid NOT NULL REFERENCES "users"("id"),
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp
);

-- Create issues table
CREATE TABLE IF NOT EXISTS "issues" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "issue_number" text NOT NULL UNIQUE,
    "product_id" uuid NOT NULL REFERENCES "products"("id"),
    "customer_id" uuid NOT NULL REFERENCES "companies"("id"),
    "reported_by" uuid NOT NULL REFERENCES "users"("id"),
    "assigned_to" uuid REFERENCES "users"("id"),
    "title" text NOT NULL,
    "description" text NOT NULL,
    "status" text NOT NULL,
    "priority" text NOT NULL,
    "source" text NOT NULL,
    "issue_category_id" uuid REFERENCES "issue_categories"("id"),
    "internal_issue_category_id" uuid REFERENCES "internal_issue_categories"("id"),
    "is_under_warranty" boolean DEFAULT false,
    "estimated_cost" decimal(10,2),
    "actual_cost" decimal(10,2),
    "reported_at" timestamp NOT NULL,
    "assigned_at" timestamp,
    "resolved_at" timestamp,
    "pre_inspection_date" timestamp,
    "repair_date" timestamp,
    "pre_inspected_by" uuid REFERENCES "users"("id"),
    "repaired_by" uuid REFERENCES "users"("id"),
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp
);

-- Create service_operations table
CREATE TABLE IF NOT EXISTS "service_operations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "issue_id" uuid NOT NULL REFERENCES "issues"("id"),
    "product_id" uuid NOT NULL REFERENCES "products"("id"),
    "technician_id" uuid NOT NULL REFERENCES "users"("id"),
    "operation_type" text NOT NULL,
    "status" text NOT NULL,
    "description" text NOT NULL,
    "notes" text,
    "is_under_warranty" boolean DEFAULT false,
    "cost" decimal(10,2),
    "parts_used" jsonb,
    "test_results" jsonb,
    "started_at" timestamp,
    "completed_at" timestamp,
    "estimated_duration" integer,
    "duration" integer,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp
);

-- Create shipments table
CREATE TABLE IF NOT EXISTS "shipments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "shipment_number" text NOT NULL UNIQUE,
    "type" text NOT NULL,
    "status" text NOT NULL,
    "from_location_id" uuid REFERENCES "locations"("id"),
    "to_location_id" uuid REFERENCES "locations"("id"),
    "from_company_id" uuid REFERENCES "companies"("id"),
    "to_company_id" uuid REFERENCES "companies"("id"),
    "tracking_number" text,
    "total_cost" decimal(10,2),
    "shipped_at" timestamp,
    "delivered_at" timestamp,
    "created_by" uuid NOT NULL REFERENCES "users"("id"),
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp
);

-- Create shipment_items table
CREATE TABLE IF NOT EXISTS "shipment_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "shipment_id" uuid NOT NULL REFERENCES "shipments"("id"),
    "product_id" uuid NOT NULL REFERENCES "products"("id"),
    "quantity" integer NOT NULL DEFAULT 1,
    "notes" text,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp
);

-- Create issue_products table
CREATE TABLE IF NOT EXISTS "issue_products" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "issue_id" uuid NOT NULL REFERENCES "issues"("id"),
    "product_id" uuid NOT NULL REFERENCES "products"("id"),
    "notes" text,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp
);

-- Create product_history table
CREATE TABLE IF NOT EXISTS "product_history" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "product_id" uuid NOT NULL REFERENCES "products"("id"),
    "event_type" text NOT NULL,
    "event_data" jsonb,
    "performed_by" uuid NOT NULL REFERENCES "users"("id"),
    "performed_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_products_serial_number" ON "products"("serial_number");
CREATE INDEX IF NOT EXISTS "idx_issues_issue_number" ON "issues"("issue_number");
CREATE INDEX IF NOT EXISTS "idx_products_status_created_at" ON "products"("status", "created_at");
CREATE INDEX IF NOT EXISTS "idx_issues_customer_status" ON "issues"("customer_id", "status");
CREATE INDEX IF NOT EXISTS "idx_active_users" ON "users"("email") WHERE "is_active" = true;
CREATE INDEX IF NOT EXISTS "idx_shipments_shipment_number" ON "shipments"("shipment_number");

-- Add comments for better documentation
COMMENT ON TABLE "companies" IS 'Müşteri ve Üretici Firmalar';
COMMENT ON TABLE "users" IS 'Kullanıcı Yönetimi - ADMIN, TSP, CUSTOMER';
COMMENT ON TABLE "products" IS 'Ürün Yaşam Döngüsü Takibi';
COMMENT ON TABLE "issues" IS 'Arıza Kayıtları';
COMMENT ON TABLE "service_operations" IS 'Teknik Servis Operasyonları';
COMMENT ON TABLE "shipments" IS 'Sevkiyat Yönetimi';
COMMENT ON TABLE "shipment_items" IS 'Sevkiyat Kalemleri';
COMMENT ON TABLE "issue_products" IS 'Arıza Ürün İlişkileri';
COMMENT ON TABLE "product_history" IS 'Ürün Geçmişi';
COMMENT ON TABLE "issue_categories" IS 'Arıza Kategorileri';
COMMENT ON TABLE "internal_issue_categories" IS 'İç Arıza Kategorileri';
