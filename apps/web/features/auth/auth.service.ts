import { createAuthClient } from "better-auth/react";
import { hybridFetch } from "../../lib/rpc";

const authClient = createAuthClient({
  baseURL: "http://localhost:3000/api/v1/auth",
  fetchOptions: {
    customFetchImpl: hybridFetch,
  },
});

const { useSession, signIn, signUp, signOut } = authClient;

type Session = typeof authClient.$Infer.Session.session;
type User = typeof authClient.$Infer.Session.user & {
  role: "CUSTOMER" | "TECHNICIAN" | "ADMIN";
  companyId?: string;
};

export { useSession, signIn, signUp, signOut, authClient };
export type { Session, User };
