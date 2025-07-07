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

const getLocations = async (query?: Query) => {
  const result = await callRPC(
    client.api.v1["locations"].$get({
      query: query ? temporaryObjectQuery(query) : undefined,
    })
  );

  return result;
};

const getLocation = async (id: string) => {
  const result = await callRPC(
    client.api.v1["locations"][":id"].$get({
      param: {
        id,
      },
    })
  );

  return result;
};

const createLocation = async (payload: any) => {
  const result = await callRPC(
    client.api.v1["locations"].$post({
      json: payload,
    })
  );

  return result;
};

const updateLocation = async (id: string, payload: any) => {
  const result = await callRPC(
    client.api.v1["locations"][":id"].$put({
      param: {
        id,
      },
      //@ts-expect-error
      json: payload,
    })
  );

  return result;
};

const deleteLocation = async (id: string) => {
  await callRPC(
    client.api.v1["locations"][":id"].$delete({
      param: {
        id,
      },
    })
  );
};

const locationQueries = {
  _all: () => ["locations"] as const,
  _list: () => [...locationQueries._all(), "list"] as const,
  _detail: () => [...locationQueries._all(), "detail"] as const,

  list: (query?: Query) =>
    queryOptions({
      queryKey: [...locationQueries._list(), query] as const,
      queryFn: () => getLocations(query),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: [...locationQueries._detail(), id] as const,
      queryFn: () => getLocation(id),
    }),
};

const locationMutations = {
  create: () =>
    ({
      mutationKey: [...locationQueries._all(), "create"] as const,
      mutationFn: ({ payload }: { payload: any }) => createLocation(payload),
      onSuccess() {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: locationQueries._list(),
        });
      },
    }) satisfies MutationOptions<any, any, any>,
  update: () =>
    ({
      mutationKey: [...locationQueries._all(), "update"] as const,
      mutationFn: ({ id, payload }: { id: string; payload: any }) =>
        updateLocation(id, payload),
      onSuccess(_, { id }) {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: locationQueries._list(),
        });
        queryClient.invalidateQueries(locationQueries.detail(id));
      },
    }) satisfies MutationOptions<any, any, any>,
  delete: () =>
    ({
      mutationKey: [...locationQueries._all(), "delete"] as const,
      mutationFn: ({ id }: { id: string }) => deleteLocation(id),
      onSuccess() {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: locationQueries._list(),
        });
      },
    }) satisfies MutationOptions<any, any, any>,
};

type UseLocationsOptions = {
  query?: Query;
  config?: QueryConfig<(typeof locationQueries)["list"]>;
};

type UseLocationOptions = {
  id: string | null;
  config?: QueryConfig<(typeof locationQueries)["detail"]>;
};

type UseCreateLocationOptions = {
  mutationConfig?: MutationConfig<ReturnType<typeof locationMutations.create>>;
};

type UseUpdateLocationOptions = {
  mutationConfig?: MutationConfig<ReturnType<typeof locationMutations.update>>;
};

type UseDeleteLocationOptions = {
  mutationConfig?: MutationConfig<ReturnType<typeof locationMutations.delete>>;
};

const useLocations = ({ query, config }: UseLocationsOptions = {}) => {
  return useQuery({
    ...locationQueries.list(query),
    ...config,
  });
};

const useLocation = ({ id, config }: UseLocationOptions) => {
  return useQuery({
    ...locationQueries.detail(id ?? ""),
    ...config,
    enabled: !!id && config?.enabled !== false,
  });
};

const useCreateLocation = ({
  mutationConfig,
}: UseCreateLocationOptions = {}) => {
  return useMutation(
    mergeMutationConfig(locationMutations.create(), mutationConfig ?? {})
  );
};

const useUpdateLocation = ({
  mutationConfig,
}: UseUpdateLocationOptions = {}) => {
  return useMutation(
    mergeMutationConfig(locationMutations.update(), mutationConfig ?? {})
  );
};

const useDeleteLocation = ({
  mutationConfig,
}: UseDeleteLocationOptions = {}) => {
  return useMutation(
    mergeMutationConfig(locationMutations.delete(), mutationConfig ?? {})
  );
};

export { getLocations, getLocation };
export { locationQueries, useLocations, useLocation };
export {
  locationMutations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
};

export type {
  UseLocationsOptions,
  UseLocationOptions,
  UseCreateLocationOptions,
  UseUpdateLocationOptions,
  UseDeleteLocationOptions,
};
