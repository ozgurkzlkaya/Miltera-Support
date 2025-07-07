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

const getProductTypes = async (query?: Query) => {
  const result = await callRPC(
    client.api.v1["product-types"].$get({
      query: query ? temporaryObjectQuery(query) : undefined,
    })
  );

  return result;
};

const getProductType = async (id: string) => {
  const result = await callRPC(
    client.api.v1["product-types"][":id"].$get({
      param: {
        id,
      },
    })
  );

  return result;
};

const createProductType = async (payload: any) => {
  const result = await callRPC(
    client.api.v1["product-types"].$post({
      json: payload,
    })
  );

  return result;
};

const updateProductType = async (id: string, payload: any) => {
  const result = await callRPC(
    client.api.v1["product-types"][":id"].$put({
      param: {
        id,
      },
      //@ts-expect-error
      json: payload,
    })
  );

  return result;
};

const deleteProductType = async (id: string) => {
  await callRPC(
    client.api.v1["product-types"][":id"].$delete({
      param: {
        id,
      },
    })
  );
};

const productTypeQueries = {
  _all: () => ["product-types"] as const,
  _list: () => [...productTypeQueries._all(), "list"] as const,
  _detail: () => [...productTypeQueries._all(), "detail"] as const,

  list: (query?: Query) =>
    queryOptions({
      queryKey: [...productTypeQueries._list(), query] as const,
      queryFn: () => getProductTypes(query),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: [...productTypeQueries._detail(), id] as const,
      queryFn: () => getProductType(id),
    }),
};

const productTypeMutations = {
  create: () =>
    ({
      mutationKey: [...productTypeQueries._all(), "create"] as const,
      mutationFn: ({ payload }: { payload: any }) => createProductType(payload),
      onSuccess() {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: productTypeQueries._list(),
        });
      },
    }) satisfies MutationOptions<any, any, any>,
  update: () =>
    ({
      mutationKey: [...productTypeQueries._all(), "update"] as const,
      mutationFn: ({ id, payload }: { id: string; payload: any }) =>
        updateProductType(id, payload),
      onSuccess(_, { id }) {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: productTypeQueries._list(),
        });
        queryClient.invalidateQueries(productTypeQueries.detail(id));
      },
    }) satisfies MutationOptions<any, any, any>,
  delete: () =>
    ({
      mutationKey: [...productTypeQueries._all(), "delete"] as const,
      mutationFn: ({ id }: { id: string }) => deleteProductType(id),
      onSuccess() {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: productTypeQueries._list(),
        });
      },
    }) satisfies MutationOptions<any, any, any>,
};

type UseProductTypesOptions = {
  query?: Query;
  config?: QueryConfig<(typeof productTypeQueries)["list"]>;
};

type UseProductTypeOptions = {
  id: string | null;
  config?: QueryConfig<(typeof productTypeQueries)["detail"]>;
};

type UseCreateProductTypeOptions = {
  mutationConfig?: MutationConfig<
    ReturnType<typeof productTypeMutations.create>
  >;
};

type UseUpdateProductTypeOptions = {
  mutationConfig?: MutationConfig<
    ReturnType<typeof productTypeMutations.update>
  >;
};

type UseDeleteProductTypeOptions = {
  mutationConfig?: MutationConfig<
    ReturnType<typeof productTypeMutations.delete>
  >;
};

const useProductTypes = ({ query, config }: UseProductTypesOptions = {}) => {
  return useQuery({
    ...productTypeQueries.list(query),
    ...config,
  });
};

const useProductType = ({ id, config }: UseProductTypeOptions) => {
  return useQuery({
    ...productTypeQueries.detail(id ?? ""),
    ...config,
    enabled: !!id && config?.enabled !== false,
  });
};

const useCreateProductType = ({
  mutationConfig,
}: UseCreateProductTypeOptions = {}) => {
  return useMutation(
    mergeMutationConfig(productTypeMutations.create(), mutationConfig ?? {})
  );
};

const useUpdateProductType = ({
  mutationConfig,
}: UseUpdateProductTypeOptions = {}) => {
  return useMutation(
    mergeMutationConfig(productTypeMutations.update(), mutationConfig ?? {})
  );
};

const useDeleteProductType = ({
  mutationConfig,
}: UseDeleteProductTypeOptions = {}) => {
  return useMutation(
    mergeMutationConfig(productTypeMutations.delete(), mutationConfig ?? {})
  );
};

export { getProductTypes, getProductType };
export { productTypeQueries, useProductTypes, useProductType };
export {
  productTypeMutations,
  useCreateProductType,
  useUpdateProductType,
  useDeleteProductType,
};

export type {
  UseProductTypesOptions,
  UseProductTypeOptions,
  UseCreateProductTypeOptions,
  UseUpdateProductTypeOptions,
  UseDeleteProductTypeOptions,
};
