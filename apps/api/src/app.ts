import { Hono } from "hono";

const app = new Hono().basePath("/api").get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
export type AppType = typeof app;