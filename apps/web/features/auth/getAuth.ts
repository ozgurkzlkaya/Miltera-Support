import { Auth } from "./types";

const mockAuth: Auth = {
  isAuthenticated: true,
  isLoading: false,
  session: {
    status: "authenticated",
    access: "access",
    accessExpiresAt: new Date(),
  },
  role: "customer",
  permissions: ["*"],
  user: {},
  signOut: () => {},
};

const getAuth = async () => {
  return mockAuth;
};

export { getAuth };

export { mockAuth };
