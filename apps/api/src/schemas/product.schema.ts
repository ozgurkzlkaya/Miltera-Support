import { createSchemaFactory } from "drizzle-zod";
import { products } from "../db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { z } from "../lib/zod";

const { createSelectSchema, createInsertSchema, createUpdateSchema } =
  createSchemaFactory({ zodInstance: z });

const ProductRawSchema = createSelectSchema(products);
const ProductSchema = ProductRawSchema;
const ProductSerializedSchema = ProductSchema.extend({
  updatedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  productionDate: z.string().datetime(),
  warrantyStartDate: z.union([z.string().datetime(), z.null()]),
});

const ProductCreateParamsRawSchema = createInsertSchema(products);
const ProductCreateParamsSchema = ProductCreateParamsRawSchema;

const ProductUpdateParamsRawSchema = createUpdateSchema(products);
const ProductUpdateParamsSchema = ProductUpdateParamsRawSchema;

type ProductRaw = InferSelectModel<typeof products>;
type Product = z.infer<typeof ProductSchema>;
type ProductSerialized = z.infer<typeof ProductSerializedSchema>;

type ProductCreateParams = z.infer<typeof ProductCreateParamsRawSchema>;
type ProductUpdateParams = z.infer<typeof ProductUpdateParamsRawSchema>;

export {
  ProductRawSchema,
  ProductCreateParamsRawSchema,
  ProductUpdateParamsRawSchema,
};
export { ProductSchema, ProductCreateParamsSchema, ProductUpdateParamsSchema };

export type {
  ProductRaw,
  Product,
  ProductSerialized,
  ProductCreateParams,
  ProductUpdateParams,
};
