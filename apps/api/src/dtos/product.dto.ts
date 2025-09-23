import { z } from "../lib/zod";
import { products } from "../db/schema";
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

import { ProductModelBaseSchema } from "./product-model.dto";
import { ProductTypeBaseSchema } from "./product-type.dto";
import { LocationBaseSchema } from "./location.dto";
import { CompanyBaseSchema } from "./company.dto";

import { parseQueryString } from "@miltera/helpers/query-builder";
import type { ProductListWithRelations } from "../repositories/product.repository";

/* --- Product Base Schema --- */

const ProductBaseSchema = BaseSchemaFactory(createSelectSchema(products));
type ProductBase = z.infer<typeof ProductBaseSchema>;

/* --- Product List Request --- */

const ProductListRequestSchema = ListMetaRequestSchema.optional();
class ProductListRequestDto extends BaseDto<
  typeof ProductListRequestSchema,
  string
> {
  protected readonly schema = ProductListRequestSchema;
  protected transform(
    data: ProductListRequestDto["input"]
  ): ProductListRequestDto["value"] {
    return parseQueryString(data);
  }
}

/* --- Product List Response --- */

const ProductListDataSchema = BaseSchemaFactory(ProductBaseSchema)
  .extend({
    productModel: ProductModelBaseSchema.extend({
      productType: ProductTypeBaseSchema.pick({
        id: true,
        name: true,
      }),
      manufacturer: CompanyBaseSchema.pick({
        id: true,
        name: true,
      }),
    }).pick({
      id: true,
      name: true,
      productType: true,
      manufacturer: true,
    }),
    location: z.union([
      LocationBaseSchema.pick({
        id: true,
        name: true,
      }),
      z.null(),
    ]),
    owner: z.union([
      CompanyBaseSchema.pick({
        id: true,
        name: true,
      }),
      z.null(),
    ]),
  })
  .omit({
    productModelId: true,
    ownerId: true,
    locationId: true,
  });
const ProductListSchema = z.object({
  data: z.array(ProductListDataSchema),
  meta: ListMetaResponseSchema,
});
class ProductListDto extends BaseResponseDto<
  typeof ProductListSchema,
  { data: ProductListWithRelations[]; meta: ListMetaResponse }
> {
  protected readonly schema = ProductListSchema;
  protected transform(data: ProductListDto["input"]): ProductListDto["value"] {
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

/* --- Product Response --- */

const ProductSchema = BaseSchemaFactory(ProductBaseSchema);
class ProductDto extends BaseResponseDto<typeof ProductSchema, ProductBase> {
  protected readonly schema = ProductSchema;
  protected transform(data: ProductDto["input"]): ProductDto["value"] {
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

/* --- Product Create Request --- */

const ProductCreateSchema = z.object({
  productModelId: z.string().uuid(),
  quantity: z.number().int().min(1),
  productionDate: z.string().or(z.date()),
  locationId: z.string().uuid().optional(),
  createdBy: z.string().uuid(),
});

class ProductCreateDto extends BaseDto<
  typeof ProductCreateSchema,
  z.infer<typeof ProductCreateSchema>
> {
  protected readonly schema = ProductCreateSchema;
}

const ProductCreateBulkSchema = z.object({
  common: ProductCreateSchema.partial().optional(),
  resources: z.array(ProductCreateSchema.partial()),
});
class ProductCreateBulkDto extends BaseDto<
  typeof ProductCreateBulkSchema,
  z.infer<typeof ProductCreateBulkSchema>
> {
  protected readonly schema = ProductCreateBulkSchema;
}

/* --- Product Update Request --- */

const ProductUpdateSchema = BaseRequestSchemaFactory(
  createUpdateSchema(products)
).omit({
  createdBy: true,
  updatedBy: true,
});
class ProductUpdateDto extends BaseDto<
  typeof ProductUpdateSchema,
  z.infer<typeof ProductUpdateSchema>
> {
  protected readonly schema = ProductUpdateSchema;
}

export {
  ProductListRequestDto,
  ProductListDto,
  ProductDto,
  ProductCreateDto,
  ProductCreateBulkDto,
  ProductUpdateDto,
};

export {
  ProductBaseSchema,
  ProductListRequestSchema,
  ProductListSchema,
  ProductSchema,
  ProductCreateSchema,
  ProductCreateBulkSchema,
  ProductUpdateSchema,
};
