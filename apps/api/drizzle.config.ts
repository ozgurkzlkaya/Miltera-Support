/**
 * Miltera Fixlog - Drizzle ORM Yapılandırması
 * 
 * Bu dosya, Drizzle ORM'nin veritabanı bağlantısı ve migration ayarlarını tanımlar.
 * Database schema değişiklikleri bu config'e göre yönetilir.
 * 
 * Özellikler:
 * - PostgreSQL database connection
 * - Schema migration management
 * - Database studio integration
 * - Environment-based configuration
 * 
 * Kullanım:
 * - npx drizzle-kit generate: Migration oluştur
 * - npx drizzle-kit migrate: Migration'ları uygula
 * - npx drizzle-kit studio: Database studio'yu aç
 */

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",                    // PostgreSQL database
  schema: "./src/db/schema.ts",            // Schema dosyası yolu
  dbCredentials: {
    host: "localhost",                      // Database host
    port: 5432,                            // PostgreSQL default port
    user: "postgres",                      // Database user
    password: "postgres",                  // Database password
    database: "fixlog",                    // Database name
    ssl: false,                            // SSL bağlantısı (development için false)
  },
  out: "./drizzle",                        // Migration dosyalarının çıktı dizini
});
