/**
 * Miltera Fixlog API Ana Uygulama Dosyası
 * 
 * Bu dosya, Hono.js framework'ü kullanarak RESTful API'nin ana yapılandırmasını içerir.
 * Tüm route'ları, middleware'leri ve güvenlik ayarlarını burada tanımlarız.
 * 
 * Ana Özellikler:
 * - Tüm API route'larının tanımlanması
 * - CORS, güvenlik ve authentication middleware'leri
 * - Error handling ve logging
 * - API dokümantasyonu endpoint'i
 * - Performance monitoring
 * 
 * Base Path: /api/v1
 * Port: 3015
 */

// Hono.js framework ve temel yapılandırma
import { createHonoApp, createRouter } from "./lib/hono";
import type { HonoEnv } from "./config/env";
import init from "./config/initializers/main";
import { Scalar } from "@scalar/hono-api-reference";

// Tüm API route'ları - her modül için ayrı route dosyası
import authRoute from "./routes/auth.routes";                    // Authentication (login, register, logout)
import usersRoute from "./routes/user.routes";                   // Kullanıcı yönetimi
import productTypesRoute from "./routes/product-type.routes";    // Ürün tipleri
import productModelsRoute from "./routes/product-model.routes";  // Ürün modelleri
import productsRoute from "./routes/product.routes";             // Ürünler
import issuesRoute from "./routes/issue.routes";                 // Sorunlar/Arızalar
import companiesRoute from "./routes/company.routes";            // Şirketler
import locationsRoute from "./routes/location.routes";           // Lokasyonlar
import shipmentsRoute from "./routes/shipment.routes";           // Sevkiyatlar
import warehouseRoute from "./routes/warehouse.routes";          // Depo yönetimi
import serviceOperationsRoute from "./routes/service-operations.routes"; // Servis operasyonları
import reportsRoute from "./routes/reports.routes";              // Raporlar ve analitik
import websocketRoute from "./routes/websocket.routes";          // WebSocket bağlantıları
import fileUploadRoute from "./routes/file-upload.routes";       // Dosya yükleme
import searchRoute from "./routes/search.routes";                // Arama işlemleri
import notificationsRoute, { statsRoute } from "./routes/notifications.routes"; // Bildirimler
import categoriesRoute from "./routes/category.routes";          // Kategoriler
import collaborationRoute from "./routes/collaboration";         // İşbirliği özellikleri
import backupRoute from "./routes/backup";                       // Yedekleme
import apiDocsRoute from "./routes/api-docs";                    // API dokümantasyonu

// Controller'lar - business logic
import productController from "./controllers/product.controller";

// Helper'lar ve middleware'ler
import { ResponseHandler } from "./helpers/response.helpers";
import { setSessionMiddleware, authMiddleware } from "./helpers/auth.helpers";
import { 
  rateLimitMiddleware,           // Rate limiting (DDoS koruması)
  securityHeadersMiddleware,     // Güvenlik header'ları
  requestLoggingMiddleware,      // Request logging
  secureErrorHandler            // Güvenli error handling
} from "./lib/security";
import { fileUploadMiddleware } from "./lib/upload";
import { performanceMonitoringMiddleware } from "./lib/monitoring";
import env from "./config/env";

/**
 * Ana uygulama başlatma fonksiyonu
 * 
 * Bu fonksiyon:
 * 1. Database ve diğer servisleri initialize eder
 * 2. Hono app'i oluşturur ve middleware'leri ekler
 * 3. Tüm route'ları tanımlar
 * 4. CORS, güvenlik ve authentication ayarlarını yapar
 * 5. Error handling'i yapılandırır
 */
async function initializeApp() {
  // Database bağlantısı ve diğer servisleri başlat
  await init();
  
  // Ana Hono uygulamasını oluştur - /api/v1 base path ile
  let app = createHonoApp<HonoEnv>()
    .basePath("/api/v1")
    
    // Güvenlik middleware'leri - sıralama önemli!
    .use("*", securityHeadersMiddleware)        // Güvenlik header'ları ekle
    .use("*", async (c, next) => {
      // CORS (Cross-Origin Resource Sharing) middleware
      // Frontend'in API'ye erişebilmesi için gerekli
      const requestOrigin = c.req.header("origin") || "";
      const allowedOrigins = new Set([
        env.FRONTEND_URL,           // Production frontend URL
        "http://localhost:3000",    // Development frontend URL
      ]);
      
      // Sadece izin verilen origin'lerden gelen isteklere CORS header'ı ekle
      if (allowedOrigins.has(requestOrigin)) {
        c.header("Access-Control-Allow-Origin", requestOrigin);
      }
      
      // İzin verilen HTTP metodları
      c.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      
      // İzin verilen header'lar
      c.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, Accept, Origin"
      );
      
      // Credentials (cookies, authorization headers) gönderilmesine izin ver
      c.header("Access-Control-Allow-Credentials", "true");
      
      // OPTIONS preflight request'leri için hemen cevap döndür
      if (c.req.method === "OPTIONS") {
        return c.text("", 200);
      }
      
      await next();
    })
    .use("*", rateLimitMiddleware)              // Rate limiting (DDoS koruması)
    .use("*", requestLoggingMiddleware)         // Request'leri logla
    .use("*", performanceMonitoringMiddleware)  // Performance monitoring
    
    // Temel endpoint'ler
    .get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }))  // Health check
    .get("/test", (c) => c.json({ message: "Test endpoint working" }))                     // Test endpoint
    
    // Tüm API route'larını tanımla - her modül için ayrı route
    .route("/auth", authRoute)                    // Authentication endpoints
    .route("/users", usersRoute)                  // User management
    .route("/product-types", productTypesRoute)   // Product types
    .route("/product-models", productModelsRoute) // Product models
    .route("/products", productsRoute)            // Products
    .route("/issues", issuesRoute)                // Issues/Problems
    .route("/companies", companiesRoute)          // Companies
    .route("/locations", locationsRoute)          // Locations
    .route("/shipments", shipmentsRoute)          // Shipments
    .route("/warehouse", warehouseRoute)          // Warehouse management
    .route("/service-operations", serviceOperationsRoute) // Service operations
    .route("/reports", reportsRoute)              // Reports and analytics
    .route("/websocket", websocketRoute)          // WebSocket connections
    .route("/file-upload", fileUploadRoute)       // File upload
    .route("/search", searchRoute)                // Search functionality
    .route("/notifications", notificationsRoute)  // Notifications
    .route("/notification-stats", statsRoute)     // Notification statistics
    .route("/categories", categoriesRoute)        // Categories
    .route("/collaboration", collaborationRoute)  // Collaboration features
    .route("/backup", backupRoute)                // Backup functionality
    .route("/docs", apiDocsRoute);                // API documentation

  // Session middleware - kullanıcı oturum bilgilerini yönet
  app.use("*", setSessionMiddleware);
  
  // Authentication middleware - sadece auth route'ları dışındaki endpoint'ler için
  // Auth route'ları (login, register) authentication gerektirmez
  app.use("*", async (c, next) => {
    const path = c.req.path;
    if (path.startsWith('/auth/')) {
      return next(); // Auth route'ları için middleware'i atla
    }
    return authMiddleware(c, next); // Diğer tüm route'lar için authentication gerekli
  });

  // Root endpoint ekle
  app.get("/", (c) => {
    return c.json({
      message: "Miltera FixLog API Server",
      version: "1.0.0",
      status: "running",
      timestamp: new Date().toISOString(),
      endpoints: {
        api: "/api/v1",
        docs: "/api/docs",
        health: "/api/v1/health"
      }
    });
  });

  // Global error handler - tüm hataları yakala ve güvenli şekilde işle
  app.onError((error, c) => {
    return secureErrorHandler(error, c);
  });

  return app;
}

export default initializeApp;
