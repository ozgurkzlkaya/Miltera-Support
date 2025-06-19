import { createContext, useContext } from "react";
import type { Auth } from "./types";
import { mockAuth } from "./getAuth";

const AuthContext = createContext<Auth | null>(null);

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

type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth: Auth = mockAuth;

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export { AuthProvider, useAuth, useAuthenticatedAuth };
