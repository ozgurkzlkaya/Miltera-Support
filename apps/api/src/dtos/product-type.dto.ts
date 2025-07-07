import { z } from "../lib/zod";
import { productTypes } from "../db/schema";
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

import { parseQueryString } from "@miltera/helpers/query-builder";

/* --- Product Type Base Schema --- */

const ProductTypeBaseSchema = BaseSchemaFactory(
  createSelectSchema(productTypes)
);
type ProductTypeBase = z.infer<typeof ProductTypeBaseSchema>;

/* --- Product Type List Request --- */

const ProductTypeListRequestSchema = ListMetaRequestSchema.optional();
class ProductTypeListRequestDto extends BaseDto<
  typeof ProductTypeListRequestSchema,
  string
> {
  protected readonly schema = ProductTypeListRequestSchema;
  protected transform(data: ProductTypeListRequestDto["input"]): ProductTypeListRequestDto["value"] {
    return parseQueryString(data);
  }
}

/* --- Product Type List Response --- */

const ProductTypeListSchema = z.object({
  data: z.array(ProductTypeBaseSchema),
  meta: ListMetaResponseSchema,
});

class ProductTypeListDto extends BaseResponseDto<
  typeof ProductTypeListSchema,
  { data: ProductTypeBase[]; meta: ListMetaResponse }
> {
  protected readonly schema = ProductTypeListSchema;
  protected transform(data: ProductTypeListDto["input"]): ProductTypeListDto["value"] {
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

/* --- Product Type Response --- */

const ProductTypeSchema = ProductTypeBaseSchema;
class ProductTypeDto extends BaseResponseDto<
  typeof ProductTypeSchema,
  ProductTypeBase
> {
  protected readonly schema = ProductTypeSchema;
  protected transform(data: ProductTypeDto["input"]): ProductTypeDto["value"] {
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

/* --- Product Type Create Request --- */

const ProductTypeCreateSchema = BaseRequestSchemaFactory(
  createInsertSchema(productTypes)
);

class ProductTypeCreateDto extends BaseDto<
  typeof ProductTypeCreateSchema,
  z.infer<typeof ProductTypeCreateSchema>
> {
  protected readonly schema = ProductTypeCreateSchema;
}

/* --- Product Type Update Request --- */

const ProductTypeUpdateSchema = BaseRequestSchemaFactory(
  createUpdateSchema(productTypes)
);

class ProductTypeUpdateDto extends BaseDto<
  typeof ProductTypeUpdateSchema,
  z.infer<typeof ProductTypeUpdateSchema>
> {
  protected readonly schema = ProductTypeUpdateSchema;
}

export {
  ProductTypeListRequestDto,
  ProductTypeListDto,
  ProductTypeDto,
  ProductTypeCreateDto,
  ProductTypeUpdateDto,
};

export {
  ProductTypeBaseSchema,
  ProductTypeListRequestSchema,
  ProductTypeListSchema,
  ProductTypeSchema,
  ProductTypeCreateSchema,
  ProductTypeUpdateSchema,
};
