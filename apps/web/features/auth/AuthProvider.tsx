"use client";

import { createContext } from "react";
import { useSession, type User, type Session } from "./auth.service";

type Auth =
  | {
      isLoading: false;
      isAuthenticated: true;
      user: User;
      session: Session;
    }
  | { isLoading: true; isAuthenticated: false; user: null; session: null }
  | { isLoading: false; isAuthenticated: false; user: null; session: null };

const AuthContext = createContext<Auth | null>(null);

type AuthProviderProps = {
  value?: Auth;
  children: React.ReactNode;
};

const AuthProvider = ({ value, children }: AuthProviderProps) => {
  // accepts value from server component
  // if value is provided, it will be used for the initialization of the auth context
  // then it will fetch the auth data on client

  const authClientData = useSession();
  const auth =
    value && value.isAuthenticated && authClientData.isPending
      ? {
          isLoading: false,
          isAuthenticated: true,
          user: value.user,
          session: value.session,
        }
      : {
          isLoading: authClientData.isPending,
          isAuthenticated: authClientData.data !== null,
          user: authClientData.data?.user || null,
          session: authClientData.data?.session || null,
        };

  return (
    <AuthContext.Provider
      value={
        auth as {
          isAuthenticated: boolean;
          user: User | null;
          session: Session | null;
          isLoading: boolean;
        } as Auth
      }
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
export type { Auth };
