/* eslint-disable @typescript-eslint/no-explicit-any */

// https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
import { cache } from "react";
import {
  QueryClient,
  defaultShouldDehydrateQuery,
  type UseMutationOptions,
  type DefaultOptions,
} from "@tanstack/react-query";

const queryConfig = {
  queries: {
    // throwOnError: true,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60,
  },
  dehydrate: {
    // include pending queries in dehydration
    shouldDehydrateQuery: (query) =>
      defaultShouldDehydrateQuery(query) || query.state.status === "pending",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shouldRedactErrors: (error) => {
      // We should not catch Next.js server errors
      // as that's how Next.js detects dynamic pages
      // so we cannot redact them.
      // Next.js also automatically redacts errors for us
      // with better digests.
      return false;
    },
  },
} satisfies DefaultOptions;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

const serverGetQueryClient = cache(makeQueryClient);

function getQueryClient() {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  } else {
    // Server: always make a new query client
    // This ensures that data is not shared between different users and requests, while still only creating the QueryClient once per request
    return serverGetQueryClient();
  }
}

type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> = Awaited<
  ReturnType<FnType>
>;

type QueryConfig<T extends (...args: any[]) => any> = Omit<
  ReturnType<T>,
  "queryKey" | "queryFn"
>;

type MutationConfig<
  MOptions extends { mutationFn: (...args: any) => Promise<any> },
> = UseMutationOptions<
  ApiFnReturnType<MOptions["mutationFn"]>,
  Error,
  Parameters<MOptions["mutationFn"]>[0]
>;

const mergeMutationConfig = <
  MOptions extends { mutationFn: (...args: any) => Promise<any> },
>(
  ...configs: MutationConfig<MOptions>[]
) => {
  return configs.reduce((acc, config) => {
    return {
      ...acc,
      ...config,
      onSuccess: (...args) => {
        acc.onSuccess?.(...args);
        config.onSuccess?.(...args);
      },
      onError: (...args) => {
        acc.onError?.(...args);
        config.onError?.(...args);
      },
      onSettled: (...args) => {
        acc.onSettled?.(...args);
        config.onSettled?.(...args);
      },
    };
  }, {} as MutationConfig<MOptions>);
};

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: Response & {
      data: Record<string, any>;
    };
  }
}

export { getQueryClient, queryConfig, mergeMutationConfig };
export type { QueryConfig, MutationConfig };
