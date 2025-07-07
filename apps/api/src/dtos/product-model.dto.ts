import { z } from "../lib/zod";
import { productModels } from "../db/schema";
import BaseDto, { BaseResponseDto } from "./base.dto";
import {
  BaseSchemaFactory,
  BaseRequestSchemaFactory,
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
  ListMetaRequestSchema,
  ListMetaResponseSchema,
  type ListMetaResponse,
} from "./base.schema";
import { ProductTypeBaseSchema } from "./product-type.dto";
import { CompanyBaseSchema } from "./company.dto";

import { parseQueryString } from "@miltera/helpers/query-builder";
import type { ProductModelListWithRelations } from "../repositories/product-model.repository";

/* --- Product Model Base Schema --- */

const ProductModelBaseSchema = BaseSchemaFactory(
  createSelectSchema(productModels)
);
type ProductModelBase = z.infer<typeof ProductModelBaseSchema>;

/* --- Product Model List Request --- */

const ProductModelListRequestSchema = ListMetaRequestSchema.optional();
class ProductModelListRequestDto extends BaseDto<
  typeof ProductModelListRequestSchema,
  string
> {
  protected readonly schema = ProductModelListRequestSchema;
  protected transform(
    data: ProductModelListRequestDto["input"]
  ): ProductModelListRequestDto["value"] {
    return parseQueryString(data);
  }
}

/* --- Product Model List Response --- */

const ProductModelListDataSchema = BaseSchemaFactory(ProductModelBaseSchema)
  .extend({
    productType: ProductTypeBaseSchema.pick({
      id: true,
      name: true,
    }),
    manufacturer: CompanyBaseSchema.pick({
      id: true,
      name: true,
    }),
  })
  .omit({
    productTypeId: true,
    manufacturerId: true,
  });

const ProductModelListSchema = z.object({
  data: z.array(ProductModelListDataSchema),
  meta: ListMetaResponseSchema,
});

class ProductModelListDto extends BaseResponseDto<
  typeof ProductModelListSchema,
  { data: ProductModelListWithRelations[]; meta: ListMetaResponse }
> {
  protected readonly schema = ProductModelListSchema;
  protected transform(
    data: ProductModelListDto["input"]
  ): ProductModelListDto["value"] {
    return data;
  }

  toJSON() {
    // serialization
    const value = this.value;

    return {
      ...value,
      data: value.data.map((data) => ({
        ...data,
        createdAt: data.createdAt.toISOString(),
        updatedAt: data.updatedAt.toISOString(),
      })),
    };
  }
}

/* --- Product Model Response --- */

const ProductModelSchema = BaseSchemaFactory(ProductModelBaseSchema);
class ProductModelDto extends BaseResponseDto<
  typeof ProductModelSchema,
  ProductModelBase
> {
  protected readonly schema = ProductModelSchema;
  protected transform(
    data: ProductModelDto["input"]
  ): ProductModelDto["value"] {
    return data;
  }

  toJSON() {
    // serialization
    const value = this.value;

    return {
      ...value,
      createdAt: value.createdAt.toISOString(),
      updatedAt: value.updatedAt.toISOString(),
    };
  }
}

/* --- Product Model Create Request --- */

const ProductModelCreateSchema = BaseRequestSchemaFactory(
  createInsertSchema(productModels)
);

class ProductModelCreateDto extends BaseDto<
  typeof ProductModelCreateSchema,
  z.infer<typeof ProductModelCreateSchema>
> {
  protected readonly schema = ProductModelCreateSchema;
}

/* --- Product Model Update Request --- */

const ProductModelUpdateSchema = BaseRequestSchemaFactory(
  createUpdateSchema(productModels)
);

class ProductModelUpdateDto extends BaseDto<
  typeof ProductModelUpdateSchema,
  z.infer<typeof ProductModelUpdateSchema>
> {
  protected readonly schema = ProductModelUpdateSchema;
}

export {
  ProductModelListRequestDto,
  ProductModelListDto,
  ProductModelDto,
  ProductModelCreateDto,
  ProductModelUpdateDto,
};

export {
  ProductModelBaseSchema,
  ProductModelListRequestSchema,
  ProductModelListSchema,
  ProductModelSchema,
  ProductModelCreateSchema,
  ProductModelUpdateSchema,
};
