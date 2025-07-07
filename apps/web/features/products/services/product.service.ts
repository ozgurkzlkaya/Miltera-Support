import {
  MutationOptions,
  queryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import {
  getQueryClient,
  mergeMutationConfig,
  MutationConfig,
  type QueryConfig,
} from "../../../lib/react-query";
import { callRPC, client } from "../../../lib/rpc";
import {
  type Query,
  temporaryObjectQuery,
} from "@miltera/helpers/query-builder";

const getProducts = async (query?: Query) => {
  const result = await callRPC(
    client.api.v1["products"].$get({
      query: query ? temporaryObjectQuery(query) : undefined,
    })
  );

  return result;
};

const getProduct = async (id: string) => {
  const result = await callRPC(
    client.api.v1["products"][":id"].$get({
      param: {
        id,
      },
    })
  );

  return result;
};

const createProduct = async (payload: any) => {
  const result = await callRPC(
    client.api.v1["products"].$post({
      json: payload,
    })
  );

  return result;
};

const createBulkProduct = async (payload: any) => {
  const result = await callRPC(
    client.api.v1["products"]["bulk"].$post({
      json: payload,
    })
  );

  return result;
};

const updateProduct = async (id: string, payload: any) => {
  const result = await callRPC(
    client.api.v1["products"][":id"].$put({
      param: {
        id,
      },
      //@ts-expect-error
      json: payload
    })
  );

  return result;
};

const deleteProduct = async (id: string) => {
  await callRPC(
    client.api.v1["products"][":id"].$delete({
      param: {
        id,
      },
    })
  );
};

const productQueries = {
  _all: () => ["products"] as const,
  _list: () => [...productQueries._all(), "list"] as const,
  _detail: () => [...productQueries._all(), "detail"] as const,

  list: (query?: Query) =>
    queryOptions({
      queryKey: [...productQueries._list(), query] as const,
      queryFn: () => getProducts(query),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: [...productQueries._detail(), id] as const,
      queryFn: () => getProduct(id),
    }),
};

const productMutations = {
  create: () =>
    ({
      mutationKey: [...productQueries._all(), "create"] as const,
      mutationFn: ({ payload }: { payload: any }) => createProduct(payload),
      onSuccess() {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: productQueries._list(),
        });
      },
    }) satisfies MutationOptions<any, any, any>,
  createBulk: () =>
    ({
      mutationKey: [...productQueries._all(), "createBulk"] as const,
      mutationFn: ({ payload }: { payload: any }) => createBulkProduct(payload),
      onSuccess() {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: productQueries._list(),
        });
      },
    }) satisfies MutationOptions<any, any, any>,
  update: () =>
    ({
      mutationKey: [...productQueries._all(), "update"] as const,
      mutationFn: ({ id, payload }: { id: string; payload: any }) =>
        updateProduct(id, payload),
      onSuccess(_, { id }) {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: productQueries._list(),
        });
        queryClient.invalidateQueries(productQueries.detail(id));
      },
    }) satisfies MutationOptions<any, any, any>,
  delete: () =>
    ({
      mutationKey: [...productQueries._all(), "delete"] as const,
      mutationFn: ({ id }: { id: string }) => deleteProduct(id),
      onSuccess() {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: productQueries._list(),
        });
      },
    }) satisfies MutationOptions<any, any, any>,
};

type UseProductsOptions = {
  query?: Query;
  config?: QueryConfig<(typeof productQueries)["list"]>;
};

type UseProductOptions = {
  id: string | null;
  config?: QueryConfig<(typeof productQueries)["detail"]>;
};

type UseCreateProductOptions = {
  mutationConfig?: MutationConfig<ReturnType<typeof productMutations.create>>;
};

type UseCreateBulkProductOptions = {
  mutationConfig?: MutationConfig<
    ReturnType<typeof productMutations.createBulk>
  >;
};

type UseUpdateProductOptions = {
  mutationConfig?: MutationConfig<ReturnType<typeof productMutations.update>>;
};

type UseDeleteProductOptions = {
  mutationConfig?: MutationConfig<ReturnType<typeof productMutations.delete>>;
};

const useProducts = ({ query, config }: UseProductsOptions = {}) => {
  return useQuery({
    ...productQueries.list(query),
    ...config,
  });
};

const useProduct = ({ id, config }: UseProductOptions) => {
  return useQuery({
    ...productQueries.detail(id ?? ""),
    ...config,
    enabled: !!id && config?.enabled !== false,
  });
};

const useCreateProduct = ({ mutationConfig }: UseCreateProductOptions = {}) => {
  return useMutation(
    mergeMutationConfig(productMutations.create(), mutationConfig ?? {})
  );
};

const useCreateBulkProduct = ({
  mutationConfig,
}: UseCreateBulkProductOptions = {}) => {
  return useMutation(
    mergeMutationConfig(productMutations.createBulk(), mutationConfig ?? {})
  );
};

const useUpdateProduct = ({ mutationConfig }: UseUpdateProductOptions = {}) => {
  return useMutation(
    mergeMutationConfig(productMutations.update(), mutationConfig ?? {})
  );
};

const useDeleteProduct = ({ mutationConfig }: UseDeleteProductOptions = {}) => {
  return useMutation(
    mergeMutationConfig(productMutations.delete(), mutationConfig ?? {})
  );
};

export {
  getProducts,
  getProduct,
  createProduct,
  createBulkProduct,
  updateProduct,
};
export { productQueries, useProducts, useProduct };
export {
  productMutations,
  useCreateProduct,
  useCreateBulkProduct,
  useUpdateProduct,
  useDeleteProduct,
};

export type {
  UseProductsOptions,
  UseProductOptions,
  UseCreateProductOptions,
  UseCreateBulkProductOptions,
  UseUpdateProductOptions,
  UseDeleteProductOptions,
};
