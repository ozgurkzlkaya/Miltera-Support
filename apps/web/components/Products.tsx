import type { Product } from "../features/products/product.types";

type ProductProps = {
  products: Product[];
};

const Products = ({ products }: ProductProps) => {
  return <>{JSON.stringify(products)}</>;
};

export { Products };
