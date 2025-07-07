import { db } from "../db";
import { createControllerAction } from "./base.controller";
import { ResponseHandler } from "../helpers/response.helpers";
import { ProductTypeService } from "../services/product-type.service";
import {
  ProductTypeListRequestDto,
  ProductTypeCreateDto,
  ProductTypeUpdateDto,
} from "../dtos/product-type.dto";

const productTypeService = new ProductTypeService(db);

const list = createControllerAction(async (c) => {
  const query = await c.validateRequest("rawQuery", (v) => v);
  const productTypeListRequestDto = ProductTypeListRequestDto.create(query);

  const productTypeListDto = await productTypeService.getAllProductTypes(
    productTypeListRequestDto
  );

  const productTypeList = productTypeListDto.toJSON();

  return c.responseJSON(
    ResponseHandler.success(productTypeList.data, productTypeList.meta)
  );
});

const show = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");

  const productTypeDto = await productTypeService.getProductType(id);
  const productType = productTypeDto.toJSON();

  return c.responseJSON(ResponseHandler.success(productType));
});

const create = createControllerAction(async (c) => {
  const body = await c.validateRequest("json", (v) => v);
  const productTypeCreateDto = ProductTypeCreateDto.create(body);

  const productTypeDto =
    await productTypeService.createProductType(productTypeCreateDto);

  const productType = productTypeDto.toJSON();

  return c.responseJSON(ResponseHandler.success(productType));
});

const update = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.validateRequest("json", (v) => v);
  const productTypeUpdateDto = ProductTypeUpdateDto.create(body);

  const productTypeDto = await productTypeService.updateProductType(
    id,
    productTypeUpdateDto
  );

  const productType = productTypeDto.toJSON();

  return c.responseJSON(ResponseHandler.success(productType));
});

const destroy = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");

  await productTypeService.deleteProductType(id);

  return c.responseStatus(204);
});

const ProductTypeController = { list, show, create, update, destroy };

export default ProductTypeController;
