import { useContext } from "react";
import { AuthContext, type Auth } from "./AuthProvider";

const useAuth = () => {
  const auth = useContext(AuthContext);

  if (auth === null) {
    throw new Error(`useAuth must be used within a AuthContextProvider.`);
  }

  return auth;
};

const useAuthenticatedAuth = () => {
  return useAuth() as Auth & { isAuthenticated: true };
};

export { useAuth, useAuthenticatedAuth };
