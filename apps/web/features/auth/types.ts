type AuthenticatedSession =
  | {
      access: string;
      accessExpiresAt: Date;
      refresh?: string | undefined;
      refreshExpiresAt?: Date | undefined;
      status: "authenticated";
    }
  | {
      access: string;
      accessExpiresAt: Date;
      refresh: string;
      refreshExpiresAt: Date;
      status: "authenticated";
    };

type Session =
  | AuthenticatedSession
  | {
      access: null;
      accessExpiresAt: null;
      refresh?: string | null;
      refreshExpiresAt?: Date | null;
      status: "unauthenticated" | "loading";
    };

type Auth = {
  session: Session;
  signOut: () => any;
} & (
  | {
      isAuthenticated: false;
      isLoading: false;
      user: null;
    }
  | {
      isAuthenticated: false;
      isLoading: true;
      user: null;
    }
  | {
      isAuthenticated: true;
      isLoading: false;
      user: any;
      role: "admin" | "tsp" | "customer";
      permissions: string[];
    }
);

export type { Session, AuthenticatedSession, Auth };
