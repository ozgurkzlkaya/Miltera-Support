import { Button } from "@miltera/ui/Button";
import type { Product } from "../features/products/product.types";

type ProductProps = {
  products: Product[];
};

const Products = ({ products }: ProductProps) => {
  return (
    <>
      {JSON.stringify(products)}
      <br /> <br />
      <div>
        <Button variant="contained" color="primary">
          Click Me
        </Button>
      </div>
    </>
  );
};

export { Products };
