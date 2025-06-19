import Products from "../../../features/products/Products";
import getPageWrapper from "../../../components/PageWrapper";
import { getProductsQueryOptions } from "../../../features/products/product.service";

export default async function PostsPage() {
  const { queryClient, PageWrapper } = getPageWrapper();

  const products = await queryClient.fetchQuery(getProductsQueryOptions());

  return (
    <PageWrapper>
      <Products products={products} />
    </PageWrapper>
  );
}
