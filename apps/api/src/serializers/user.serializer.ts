import type { User, UserSerialized } from "../schemas/user.schema";

const serializeUser = (user: User): UserSerialized => {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

export { serializeUser };
