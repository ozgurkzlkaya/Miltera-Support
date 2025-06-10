import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "../lib/react-query";
import { getProductsQueryOptions } from "../features/products/product.service";
import { Products } from "../components/Products";

export default async function Home() {
  const queryClient = getQueryClient();
  const queryOptions = getProductsQueryOptions();
  const products = await queryClient.fetchQuery(queryOptions);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Products products={products.data} />
    </HydrationBoundary>
  );
}
