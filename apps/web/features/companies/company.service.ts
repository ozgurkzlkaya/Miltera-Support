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
} from "../../lib/react-query";
import { callRPC, client } from "../../lib/rpc";
import {
  type Query,
  temporaryObjectQuery,
} from "@miltera/helpers/query-builder";

const getCompanies = async (query?: Query) => {
  const result = await callRPC(
    client.api.v1["companies"].$get({
      query: query ? temporaryObjectQuery(query) : undefined,
    })
  );

  return result;
};

const getCompany = async (id: string) => {
  const result = await callRPC(
    client.api.v1["companies"][":id"].$get({
      param: {
        id,
      },
    })
  );

  return result;
};

const createCompany = async (payload: any) => {
  const result = await callRPC(
    client.api.v1["companies"].$post({
      json: payload,
    })
  );

  return result;
};

const updateCompany = async (id: string, payload: any) => {
  const result = await callRPC(
    client.api.v1["companies"][":id"].$put({
      param: {
        id,
      },
      //@ts-expect-error
      json: payload
    })
  );

  return result;
};

const deleteCompany = async (id: string) => {
  await callRPC(
    client.api.v1["companies"][":id"].$delete({
      param: {
        id,
      },
    })
  );
};

const companyQueries = {
  _all: () => ["companies"] as const,
  _list: () => [...companyQueries._all(), "list"] as const,
  _detail: () => [...companyQueries._all(), "detail"] as const,

  list: (query?: Query) =>
    queryOptions({
      queryKey: [...companyQueries._list(), query] as const,
      queryFn: () => getCompanies(query),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: [...companyQueries._detail(), id] as const,
      queryFn: () => getCompany(id),
    }),
};

const companyMutations = {
  create: () =>
    ({
      mutationKey: [...companyQueries._all(), "create"] as const,
      mutationFn: ({ payload }: { payload: any }) =>
        createCompany(payload),
      onSuccess() {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: companyQueries._list(),
        });
      },
    }) satisfies MutationOptions<any, any, any>,
  update: () =>
    ({
      mutationKey: [...companyQueries._all(), "update"] as const,
      mutationFn: ({ id, payload }: { id: string; payload: any }) =>
        updateCompany(id, payload),
      onSuccess(_, { id }) {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: companyQueries._list(),
        });
        queryClient.invalidateQueries(companyQueries.detail(id));
      },
    }) satisfies MutationOptions<any, any, any>,
  delete: () =>
    ({
      mutationKey: [...companyQueries._all(), "delete"] as const,
      mutationFn: ({ id }: { id: string }) => deleteCompany(id),
      onSuccess() {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: companyQueries._list(),
        });
      },
    }) satisfies MutationOptions<any, any, any>,
};

type UseCompaniesOptions = {
  query?: Query;
  config?: QueryConfig<(typeof companyQueries)["list"]>;
};

type UseCompanyOptions = {
  id: string | null;
  config?: QueryConfig<(typeof companyQueries)["detail"]>;
};

type UseCreateCompanyOptions = {
  mutationConfig?: MutationConfig<
    ReturnType<typeof companyMutations.create>
  >;
};

type UseUpdateCompanyOptions = {
  mutationConfig?: MutationConfig<
    ReturnType<typeof companyMutations.update>
  >;
};

type UseDeleteCompanyOptions = {
  mutationConfig?: MutationConfig<
    ReturnType<typeof companyMutations.delete>
  >;
};

const useCompanies = ({ query, config }: UseCompaniesOptions = {}) => {
  return useQuery({
    ...companyQueries.list(query),
    ...config,
  });
};

const useCompany = ({ id, config }: UseCompanyOptions) => {
  return useQuery({
    ...companyQueries.detail(id ?? ""),
    ...config,
    enabled: !!id && config?.enabled !== false,
  });
};

const useCreateCompany = ({
  mutationConfig,
}: UseCreateCompanyOptions = {}) => {
  return useMutation(
    mergeMutationConfig(companyMutations.create(), mutationConfig ?? {})
  );
};

const useUpdateCompany = ({
  mutationConfig,
}: UseUpdateCompanyOptions = {}) => {
  return useMutation(
    mergeMutationConfig(companyMutations.update(), mutationConfig ?? {})
  );
};

const useDeleteCompany = ({
  mutationConfig,
}: UseDeleteCompanyOptions = {}) => {
  return useMutation(
    mergeMutationConfig(companyMutations.delete(), mutationConfig ?? {})
  );
};

export { getCompanies, getCompany };
export { companyQueries, useCompanies, useCompany };
export {
  companyMutations,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
};

export type {
  UseCompaniesOptions,
  UseCompanyOptions,
  UseCreateCompanyOptions,
  UseUpdateCompanyOptions,
  UseDeleteCompanyOptions,
};
