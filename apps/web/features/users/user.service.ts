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

const getUsers = async (query?: Query) => {
  const result = await callRPC(
    client.api.v1["users"].$get({
      query: query ? temporaryObjectQuery(query) : undefined,
    })
  );

  return result;
};

const getUser = async (id: string) => {
  const result = await callRPC(
    client.api.v1["users"][":id"].$get({
      param: {
        id,
      },
    })
  );

  return result;
};

const createUser = async (payload: any) => {
  const result = await callRPC(
    client.api.v1["users"].$post({
      json: payload,
    })
  );

  return result;
};

const updateUser = async (id: string, payload: any) => {
  const result = await callRPC(
    client.api.v1["users"][":id"].$put({
      param: {
        id,
      },
      //@ts-expect-error
      json: payload,
    })
  );

  return result;
};

const deleteUser = async (id: string) => {
  await callRPC(
    client.api.v1["users"][":id"].$delete({
      param: {
        id,
      },
    })
  );
};

const userQueries = {
  _all: () => ["users"] as const,
  _list: () => [...userQueries._all(), "list"] as const,
  _detail: () => [...userQueries._all(), "detail"] as const,

  list: (query?: Query) =>
    queryOptions({
      queryKey: [...userQueries._list(), query] as const,
      queryFn: () => getUsers(query),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: [...userQueries._detail(), id] as const,
      queryFn: () => getUser(id),
    }),
};

const userMutations = {
  create: () =>
    ({
      mutationKey: [...userQueries._all(), "create"] as const,
      mutationFn: ({ payload }: { payload: any }) => createUser(payload),
      onSuccess() {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: userQueries._list(),
        });
      },
    }) satisfies MutationOptions<any, any, any>,
  update: () =>
    ({
      mutationKey: [...userQueries._all(), "update"] as const,
      mutationFn: ({ id, payload }: { id: string; payload: any }) =>
        updateUser(id, payload),
      onSuccess(_, { id }) {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: userQueries._list(),
        });
        queryClient.invalidateQueries(userQueries.detail(id));
      },
    }) satisfies MutationOptions<any, any, any>,
  delete: () =>
    ({
      mutationKey: [...userQueries._all(), "delete"] as const,
      mutationFn: ({ id }: { id: string }) => deleteUser(id),
      onSuccess() {
        const queryClient = getQueryClient();

        queryClient.invalidateQueries({
          queryKey: userQueries._list(),
        });
      },
    }) satisfies MutationOptions<any, any, any>,
};

type UseUsersOptions = {
  query?: Query;
  config?: QueryConfig<(typeof userQueries)["list"]>;
};

type UseCreateUserOptions = {
  mutationConfig?: MutationConfig<ReturnType<typeof userMutations.create>>;
};

type UseUpdateUserOptions = {
  mutationConfig?: MutationConfig<ReturnType<typeof userMutations.update>>;
};

type UseDeleteUserOptions = {
  mutationConfig?: MutationConfig<ReturnType<typeof userMutations.delete>>;
};

const useUsers = ({ query, config }: UseUsersOptions = {}) => {
  return useQuery({
    ...userQueries.list(query),
    ...config,
  });
};

const useCreateUser = ({ mutationConfig }: UseCreateUserOptions = {}) => {
  return useMutation(
    mergeMutationConfig(userMutations.create(), mutationConfig ?? {})
  );
};

const useUpdateUser = ({ mutationConfig }: UseUpdateUserOptions = {}) => {
  return useMutation(
    mergeMutationConfig(userMutations.update(), mutationConfig ?? {})
  );
};

const useDeleteUser = ({ mutationConfig }: UseDeleteUserOptions = {}) => {
  return useMutation(
    mergeMutationConfig(userMutations.delete(), mutationConfig ?? {})
  );
};

export { getUsers, getUser };
export { userQueries, useUsers };
export { userMutations, useCreateUser, useUpdateUser, useDeleteUser };

export type {
  UseUsersOptions,
  UseCreateUserOptions,
  UseUpdateUserOptions,
  UseDeleteUserOptions,
};
