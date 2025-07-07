import { authClient } from "./auth.service";
import { getMaybeNextHeaders } from "../../utils/next";
import type { Auth } from "./AuthProvider";

const getAuth = async () => {
  // supports both server and client calls
  const maybeNextHeaders = await getMaybeNextHeaders();

  const { data } = await authClient.getSession({
    fetchOptions: {
      headers: maybeNextHeaders,
    },
  });

  const isAuthenticated = data !== null;
  const session = data?.session || null;
  const user = data?.user || null;

  return {
    isAuthenticated,
    session,
    user,
  } as Auth & { isLoading: false };
};

export { getAuth };
