import { db } from "../db";
import { createControllerAction } from "./base.controller";
import { ResponseHandler } from "../helpers/response.helpers";
import { ProductService } from "../services/product.service";
import {
  ProductListRequestDto,
  ProductCreateDto,
  ProductCreateBulkDto,
  ProductUpdateDto,
} from "../dtos/product.dto";
import type { User } from "better-auth";

const productService = new ProductService(db);

const list = createControllerAction(async (c) => {
  const query = await c.validateRequest("rawQuery", (v) => v);
  const productListRequestDto = ProductListRequestDto.create(query);

  const productListDto = await productService.getAllProductsWithRelations(
    productListRequestDto
  );

  const productList = productListDto.toJSON();

  return c.responseJSON(
    ResponseHandler.success(productList.data, productList.meta)
  );
});

const show = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");

  const productDto = await productService.getProduct(id);
  const product = productDto.toJSON();

  return c.responseJSON(ResponseHandler.success(product));
});

const create = createControllerAction(async (c) => {
  const body = await c.req.json();
  const productCreateDto = ProductCreateDto.create(body);

  //@ts-ignore
  const user = c.get("user") as User | null;
  const productDto = await productService.createProduct(productCreateDto, user);
  const product = productDto.toJSON();

  return c.responseJSON(ResponseHandler.success(product));
});

const createBulk = createControllerAction(async (c) => {
  const body = await c.req.json();
  const productCreateBulkDto = ProductCreateBulkDto.create(body);

  //@ts-ignore
  const user = c.get("user") as User | null;
  const productListDto = await productService.createBulkProduct(
    productCreateBulkDto,
    user
  );

  const productList = productListDto.toJSON();

  return c.responseJSON(
    ResponseHandler.success(productList.data, productList.meta)
  );
});

const update = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const productUpdateDto = ProductUpdateDto.create(body);

  const productDto = await productService.updateProduct(id, productUpdateDto);
  const product = productDto.toJSON();

  return c.responseJSON(ResponseHandler.success(product));
});

const destroy = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");

  await productService.deleteProduct(id);

  return c.responseStatus(204);
});

const ProductController = { list, show, create, createBulk, update, destroy };

export default ProductController;
