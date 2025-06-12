import { db } from "../db";
import { createControllerAction } from "./base.controller";
import { ProductService } from "../services/product.service";

const productService = new ProductService(db);

const list = createControllerAction(async (c) => {
  const query = c.req.query();
  const { name, category, isActive, page, limit, sort } = query;

  const filters = {
    ...(name && { name }),
    ...(category && { category }),
    ...(isActive && { isActive: isActive === "true" }),
  };

  const response = await productService.getAllProducts({
    filters,
    pagination:
      page && limit ? { page: Number(page), limit: Number(limit) } : undefined,
    sort: sort ? { field: sort, direction: "asc" } : undefined,
  });

  return c.responseJSON(response);
});

const show = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");

  const response = await productService.getProductById(id);

  return c.responseJSON(response);
});

const create = createControllerAction(async (c) => {
  const body = await c.req.json();

  const response = await productService.createProduct(body);

  return c.responseJSON(response);
});

const update = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const response = await productService.updateProduct(id, body);

  return c.responseJSON(response);
});

const destroy = createControllerAction(async (c) => {
  const id = c.req.param("id");

  const response = await productService.deleteProduct(id);

  return c.responseStatus(response.statusCode);
});

export default { list, show, create, update, destroy };
