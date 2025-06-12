import { createHonoApp } from "./lib/hono";
import type { HonoEnv } from "./config/env";
import init from "./config/initializers/main";
import { swaggerUI } from "@hono/swagger-ui";

await init();

import users from "./routes/user.routes";
import products from "./routes/product.routes";

const app = createHonoApp<HonoEnv>()
  .basePath("/api")
  .route("/users", users)
  .route("/products", products);

app.get(
  "/docs",
  swaggerUI({
    spec: app.getOpenAPIDocument({
      openapi: "3.0.0",
      info: {
        version: "1.0.0",
        title: "Miltera Fixlog",
      },
    }),

    // supressing type error, ignore this, we don't have spec with json format
    // instead, we render the spec with ui directly
    urls: [],
  })
);

app.get("/health", (c) => c.json({ status: "ok" }));

export default app;
export type AppType = typeof app;
