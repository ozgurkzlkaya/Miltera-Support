import { Hono } from "hono";
import type { Product } from "./types.js";

const products = new Hono().get("/", (c) =>
  c.json({
    data: [
      {
        id: 1,
        name: "Test Product",
      },
    ] as Product[],
  })
);

const app = new Hono().basePath("/api").route("/products", products);

export default app;
export type AppType = typeof app;
