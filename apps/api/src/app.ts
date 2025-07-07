import { createHonoApp, createRouter } from "./lib/hono";
import type { HonoEnv } from "./config/env";
import init from "./config/initializers/main";
import { Scalar } from "@scalar/hono-api-reference";

await init();

import authRoute from "./routes/auth.routes";
import usersRoute from "./routes/user.routes";
import productTypesRoute from "./routes/product-type.routes";
import productModelsRoute from "./routes/product-model.routes";
import productsRoute from "./routes/product.routes";
import issuesRoute from "./routes/issue.routes";
import companiesRoute from "./routes/company.routes";
import locationsRoute from "./routes/location.routes";

import { ResponseHandler } from "./helpers/response.helpers";
import { setSessionMiddleware } from "./helpers/auth.helpers";

// main (/api/v1/*)
let app = createHonoApp<HonoEnv>()
  .basePath("/api/v1")
  // .get("/test", (c) => c.json(JSON.stringify(c.get("session") ?? {})))
  .route("/auth", authRoute)
  .route("/users", usersRoute)
  .route("/product-types", productTypesRoute)
  .route("/product-models", productModelsRoute)
  .route("/products", productsRoute)
  .route("/issues", issuesRoute)
  .route("/companies", companiesRoute)
  .route("/locations", locationsRoute);

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
  const err = ResponseHandler.internalError();
  console.log(error);
  return c.json(err.json, err.statusCode);
});

export default app;
