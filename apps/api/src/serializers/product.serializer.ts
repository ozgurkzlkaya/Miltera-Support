import type { ProductRaw, ProductSerialized } from "../schemas/product.schema";

export function serializeProduct(product: ProductRaw): ProductSerialized {
  return {
    ...product,
    updatedAt: product.updatedAt.toISOString(),
    createdAt: product.createdAt.toISOString(),
    productionDate: product.productionDate.toISOString(),
    warrantyStartDate: product.warrantyStartDate?.toISOString() ?? null,
  };
}
