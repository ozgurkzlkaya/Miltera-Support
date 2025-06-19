import { queryOptions, useQuery } from "@tanstack/react-query";
import type { QueryConfig } from "../../lib/react-query";
import { callRPC, client } from "../../lib/rpc";

const getProducts = async () => {
  const data = await callRPC(client.api.products.$get());
  return data;
};

const getProductsQueryOptions = () => {
  return queryOptions({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });
};

type UseProductsOptions = {
  queryConfig?: QueryConfig<typeof getProductsQueryOptions>;
};

const useProducts = ({ queryConfig = {} }: UseProductsOptions = {}) => {
  return useQuery({
    ...getProductsQueryOptions(),
    ...queryConfig,
  });
};

export { getProducts };
export { getProductsQueryOptions, useProducts };
export type { UseProductsOptions };
