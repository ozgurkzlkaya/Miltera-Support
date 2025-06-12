import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { products } from "../db/schema";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

const ProductSchema = createSelectSchema(products);
const ProductInsertSchema = createInsertSchema(products);
const ProductUpdateSchema = createUpdateSchema(products);

type Product = InferSelectModel<typeof products>;
type ProductInsert = InferInsertModel<typeof products>;
type ProductUpdate = Partial<ProductInsert>;

export { ProductSchema, ProductInsertSchema, ProductUpdateSchema };
export type { Product, ProductInsert, ProductUpdate };
