-- Migration: Update schema according to requirements document
-- Date: 2025-01-17

-- Drop existing enums and recreate with new values
DROP TYPE IF EXISTS "public"."product_status" CASCADE;
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

DROP TYPE IF EXISTS "public"."issue_status" CASCADE;
CREATE TYPE "public"."issue_status" AS ENUM(
    'OPEN',                       -- Açık
    'IN_PROGRESS',                -- İşlemde
    'WAITING_CUSTOMER_APPROVAL',  -- Müşteri Onayı Bekliyor
    'REPAIRED',                   -- Tamir Edildi
    'CLOSED',                     -- Kapalı
    'CANCELLED'                   -- İptal Edildi
);

DROP TYPE IF EXISTS "public"."issue_source" CASCADE;
CREATE TYPE "public"."issue_source" AS ENUM('CUSTOMER', 'TSP', 'FIRST_PRODUCTION');

DROP TYPE IF EXISTS "public"."operation_type" CASCADE;
CREATE TYPE "public"."operation_type" AS ENUM(
    'HARDWARE_VERIFICATION',      -- Donanım Doğrulama
    'CONFIGURATION',              -- Konfigürasyon
    'PRE_TEST',                   -- Ön Test
    'REPAIR',                     -- Tamir
    'FINAL_TEST',                 -- Final Test
    'QUALITY_CHECK'               -- Kalite Kontrol
);

-- Create new warranty status enum
CREATE TYPE "public"."warranty_status" AS ENUM('IN_WARRANTY', 'OUT_OF_WARRANTY', 'PENDING');

-- Update companies table with new fields
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "contact_person_name" text;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "contact_person_surname" text;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "contact_person_email" text;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "contact_person_phone" text;
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "is_manufacturer" boolean DEFAULT false;

-- Update users table with new fields
ALTER TABLE "users" DROP COLUMN IF EXISTS "name";
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" text NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" text NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;

-- Update products table with new fields
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "production_entry_by" uuid REFERENCES "users"("id") NOT NULL;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "warranty_status" "warranty_status" DEFAULT 'PENDING';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "hardware_verification_date" timestamp;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "hardware_verification_by" uuid REFERENCES "users"("id");

-- Update issues table with new fields
ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "is_under_warranty" boolean DEFAULT false;
ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "estimated_cost" decimal(10,2);
ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "actual_cost" decimal(10,2);
ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "issue_date" timestamp NOT NULL DEFAULT now();
ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "pre_inspection_date" timestamp;
ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "repair_date" timestamp;
ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "pre_inspected_by" uuid REFERENCES "users"("id");
ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "repaired_by" uuid REFERENCES "users"("id");

-- Update service_operations table with new fields
ALTER TABLE "service_operations" ADD COLUMN IF NOT EXISTS "is_under_warranty" boolean DEFAULT false;
ALTER TABLE "service_operations" ADD COLUMN IF NOT EXISTS "cost" decimal(10,2);
ALTER TABLE "service_operations" ADD COLUMN IF NOT EXISTS "duration" integer;

-- Update shipments table with new fields
ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "total_cost" decimal(10,2);

-- Add comments for better documentation
COMMENT ON TABLE "companies" IS 'Müşteri ve Üretici Firmalar';
COMMENT ON TABLE "users" IS 'Kullanıcı Yönetimi - ADMIN, TSP, CUSTOMER';
COMMENT ON TABLE "products" IS 'Ürün Yaşam Döngüsü Takibi';
COMMENT ON TABLE "issues" IS 'Arıza Kayıtları';
COMMENT ON TABLE "service_operations" IS 'Teknik Servis Operasyonları';
COMMENT ON TABLE "shipments" IS 'Sevkiyat Yönetimi'; 