import { db } from "../db";
import { createControllerAction } from "./base.controller";
import { ResponseHandler } from "../helpers/response.helpers";
import { ProductModelService } from "../services/product-model.service";
import {
  ProductModelListRequestDto,
  ProductModelCreateDto,
  ProductModelUpdateDto,
} from "../dtos/product-model.dto";

const productModelService = new ProductModelService(db);

const list = createControllerAction(async (c) => {
  const query = await c.validateRequest("rawQuery", (v) => v);
  const productModelListRequestDto = ProductModelListRequestDto.create(query);

  const productModelListDto = await productModelService.getAllProductModels(
    productModelListRequestDto
  );

  const productModelList = productModelListDto.toJSON();

  return c.responseJSON(
    ResponseHandler.success(productModelList.data, productModelList.meta)
  );
});

const show = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");

  const productModelDto = await productModelService.getProductModel(id);

  const productModel = productModelDto.toJSON();

  return c.responseJSON(ResponseHandler.success(productModel));
});

const create = createControllerAction(async (c) => {
  const body = await c.req.json();
  const productModelCreateDto = ProductModelCreateDto.create(body);

  const productModelDto = await productModelService.createProductModel(
    productModelCreateDto
  );
  const productModel = productModelDto.toJSON();

  return c.responseJSON(ResponseHandler.success(productModel));
});

const update = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const productModelUpdateDto = ProductModelUpdateDto.create(body);

  const productModelDto = await productModelService.updateProductModel(
    id,
    productModelUpdateDto
  );
  const productModel = productModelDto.toJSON();

  return c.responseJSON(ResponseHandler.success(productModel));
});

const destroy = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");

  await productModelService.deleteProductModel(id);

  return c.responseStatus(204);
});

const ProductModelController = { list, show, create, update, destroy };

export default ProductModelController;
