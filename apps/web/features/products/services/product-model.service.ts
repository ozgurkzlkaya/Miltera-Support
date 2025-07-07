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

const getProductModels = async (query?: Query) => {
  const result = await callRPC(
    client.api.v1["product-models"].$get({
      query: query ? temporaryObjectQuery(query) : undefined,
    })
  );

  return result;
};

const getProductModel = async (id: string) => {
  const result = await callRPC(
    client.api.v1["product-models"][":id"].$get({
      param: {
        id,
      },
    })
  );

  return result;
};

const createProductModel = async (payload: any) => {
  const result = await callRPC(
    client.api.v1["product-models"].$post({
      json: payload,
    })
  );

  return result;
};

const updateProductModel = async (id: string, payload: any) => {
  const result = await callRPC(
    client.api.v1["product-models"][":id"].$put({
      param: {
        id,
      },
      //@ts-expect-error
      json: payload
    })
  );

  return result;
};

const deleteProductModel = async (id: string) => {
  await callRPC(
    client.api.v1["product-models"][":id"].$delete({
      param: {
        id,
      },
    })
  );
};

const productModelQueries = {
  _all: () => ["product-models"] as const,
  _list: () => [...productModelQueries._all(), "list"] as const,
  _detail: () => [...productModelQueries._all(), "detail"] as const,

  list: (query?: Query) =>
    queryOptions({
      queryKey: [...productModelQueries._list(), query] as const,
      queryFn: () => getProductModels(query),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: [...productModelQueries._detail(), id] as const,
      queryFn: () => getProductModel(id),
    }),
};

const productModelMutations = {
  create: () =>
    ({
      mutationKey: [...productModelQueries._all(), "create"] as const,
      mutationFn: ({ payload }: { payload: any }) =>
        createProductModel(payload),
      onSuccess() {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: productModelQueries._list(),
        });
      },
    }) satisfies MutationOptions<any, any, any>,
  update: () =>
    ({
      mutationKey: [...productModelQueries._all(), "update"] as const,
      mutationFn: ({ id, payload }: { id: string; payload: any }) =>
        updateProductModel(id, payload),
      onSuccess(_, { id }) {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: productModelQueries._list(),
        });
        queryClient.invalidateQueries(productModelQueries.detail(id));
      },
    }) satisfies MutationOptions<any, any, any>,
  delete: () =>
    ({
      mutationKey: [...productModelQueries._all(), "delete"] as const,
      mutationFn: ({ id }: { id: string }) => deleteProductModel(id),
      onSuccess() {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: productModelQueries._list(),
        });
      },
    }) satisfies MutationOptions<any, any, any>,
};

type UseProductModelsOptions = {
  query?: Query;
  config?: QueryConfig<(typeof productModelQueries)["list"]>;
};

type UseProductModelOptions = {
  id: string | null;
  config?: QueryConfig<(typeof productModelQueries)["detail"]>;
};

type UseCreateProductModelOptions = {
  mutationConfig?: MutationConfig<
    ReturnType<typeof productModelMutations.create>
  >;
};

type UseUpdateProductModelOptions = {
  mutationConfig?: MutationConfig<
    ReturnType<typeof productModelMutations.update>
  >;
};

type UseDeleteProductModelOptions = {
  mutationConfig?: MutationConfig<
    ReturnType<typeof productModelMutations.delete>
  >;
};

const useProductModels = ({ query, config }: UseProductModelsOptions = {}) => {
  return useQuery({
    ...productModelQueries.list(query),
    ...config,
  });
};

const useProductModel = ({ id, config }: UseProductModelOptions) => {
  return useQuery({
    ...productModelQueries.detail(id ?? ""),
    ...config,
    enabled: !!id && config?.enabled !== false,
  });
};

const useCreateProductModel = ({
  mutationConfig,
}: UseCreateProductModelOptions = {}) => {
  return useMutation(
    mergeMutationConfig(productModelMutations.create(), mutationConfig ?? {})
  );
};

const useUpdateProductModel = ({
  mutationConfig,
}: UseUpdateProductModelOptions = {}) => {
  return useMutation(
    mergeMutationConfig(productModelMutations.update(), mutationConfig ?? {})
  );
};

const useDeleteProductModel = ({
  mutationConfig,
}: UseDeleteProductModelOptions = {}) => {
  return useMutation(
    mergeMutationConfig(productModelMutations.delete(), mutationConfig ?? {})
  );
};

export { getProductModels, getProductModel };
export { productModelQueries, useProductModels, useProductModel };
export {
  productModelMutations,
  useCreateProductModel,
  useUpdateProductModel,
  useDeleteProductModel,
};

export type {
  UseProductModelsOptions,
  UseProductModelOptions,
  UseCreateProductModelOptions,
  UseUpdateProductModelOptions,
  UseDeleteProductModelOptions,
};
