import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "../lib/react-query";

const getPageWrapper = () => {
  const queryClient = getQueryClient();

  return {
    queryClient,
    PageWrapper: ({ children }: any) => (
      <HydrationBoundary state={dehydrate(queryClient)}>
        {children}
      </HydrationBoundary>
    ),
  };
};

export default getPageWrapper;
