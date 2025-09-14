import { createHonoApp, createRouter } from "./lib/hono";
import type { HonoEnv } from "./config/env";
import init from "./config/initializers/main";
import { Scalar } from "@scalar/hono-api-reference";

import authRoute from "./routes/auth.routes";
import usersRoute from "./routes/user.routes";
import productTypesRoute from "./routes/product-type.routes";
import productModelsRoute from "./routes/product-model.routes";
import productsRoute from "./routes/product.routes";
import issuesRoute from "./routes/issue.routes";
import companiesRoute from "./routes/company.routes";
import locationsRoute from "./routes/location.routes";
import shipmentsRoute from "./routes/shipment.routes";
import warehouseRoute from "./routes/warehouse.routes";
import serviceOperationsRoute from "./routes/service-operations.routes";
import reportsRoute from "./routes/reports.routes";
import websocketRoute from "./routes/websocket.routes";
import fileUploadRoute from "./routes/file-upload.routes";
import searchRoute from "./routes/search.routes";
import notificationsRoute from "./routes/notifications.routes";

// Yeni controller'lar
import { productController } from "./controllers/product.controller";
import { issueController } from "./controllers/issue.controller";

import { ResponseHandler } from "./helpers/response.helpers";
import { setSessionMiddleware } from "./helpers/auth.helpers";
import { 
  rateLimitMiddleware, 
  securityHeadersMiddleware, 
  requestLoggingMiddleware,
  secureErrorHandler 
} from "./lib/security";
import { fileUploadMiddleware } from "./lib/upload";
import { performanceMonitoringMiddleware } from "./lib/monitoring";

// Initialize function
async function initializeApp() {
  await init();
  
  // main (/api/v1/*)
  let app = createHonoApp<HonoEnv>()
    .basePath("/api/v1")
    .use("*", securityHeadersMiddleware)
    .use("*", async (c, next) => {
      // CORS middleware
      c.header("Access-Control-Allow-Origin", "http://localhost:3002");
      c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      c.header("Access-Control-Allow-Credentials", "true");
      
      if (c.req.method === "OPTIONS") {
        return c.text("", 200);
      }
      
      await next();
    })
    // .use("*", rateLimitMiddleware)
    // .use("*", requestLoggingMiddleware)
    // .use("*", performanceMonitoringMiddleware)
    // .use("*", fileUploadMiddleware())
    // .get("/test", (c) => c.json(JSON.stringify(c.get("session") ?? {})))
    .get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }))
    .get("/test", (c) => c.json({ message: "Test endpoint working" }))
    .route("/auth", authRoute)
    .route("/users", usersRoute)
    .route("/product-types", productTypesRoute)
    .route("/product-models", productModelsRoute)
    .route("/products", productsRoute)
    .route("/issues", issuesRoute)
    .route("/companies", companiesRoute)
    .route("/locations", locationsRoute)
    .route("/shipments", shipmentsRoute)
    .route("/warehouse", warehouseRoute)
    .route("/service-operations", serviceOperationsRoute)
    .route("/reports", reportsRoute)
    .route("/websocket", websocketRoute)
    .route("/file-upload", fileUploadRoute)
    .route("/search", searchRoute)
    .route("/notifications", notificationsRoute)
    // Yeni API endpoint'leri
    .route("/products", productController)
    .route("/issues", issueController);

  app.use("*", setSessionMiddleware);

  const _app: typeof app = (createHonoApp as any)().route("/", app);

  // docs & health (/api/docs & /api/health)
  app = _app.route(
    "/",
    createRouter()
      .basePath("/api")
      .get(
        "/docs",
        Scalar({
          content: _app.getOpenAPIDocument({
            openapi: "3.0.0",
            info: {
              version: "1.0.0",
              title: "Miltera Fixlog",
            },
          }),
        })
      )
      .get("/health", (c) => c.json({ status: "ok" }))
  );

  app.onError((error, c) => {
    return secureErrorHandler(error, c);
  });

  return app;
}

export default initializeApp;
