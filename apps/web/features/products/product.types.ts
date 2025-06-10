import type { Product } from "@miltera/api/types";

type ProductsResponse = {
  data: Product[];
};

export type { Product, ProductsResponse };
