import { eq, getTableName } from "drizzle-orm";
import { users } from "../db/schema";
import {
  BaseRepositoryImpl,
  type BaseRepository,
  type InferQueryModel,
  type QueryConfig,
  type QueryOptions,
} from "./base.repository";
import { hashPassword } from "better-auth/crypto";
import { auth } from "../lib/auth";
import type { PaginationResult } from "@miltera/helpers/query-builder";

type UsersTable = typeof users;
type Repository = BaseRepository<UsersTable>;

class UserRepository
  extends BaseRepositoryImpl<UsersTable>
  implements Repository
{
  protected readonly table = users;

  protected readonly allowedFilterFields = [
    "id",
    "email",
    "firstName",
    "lastName",
    "role",
    "createdAt",
    "updatedAt",
    "deletedAt",
  ] as const satisfies [string, ...string[]];

  protected readonly allowedSortFields = [
    "firstName",
    "lastName",
    "email",
    "role",
    "createdAt",
    "updatedAt",
    "deletedAt",
  ] as const satisfies [string, ...string[]];

  protected readonly listQueryWithRelationsDefinition = {
    columns: {
      companyId: false,
    },
    with: {
      company: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  } as const satisfies QueryConfig<"users">;

  async createUserWithPassword(
    userData: Repository["$TEntityInsert"],
    password: string
  ) {
    const ctx = await auth.$context;
    const user = (await ctx.internalAdapter.createUser(
      userData
    )) as Repository["$TEntity"];

    const hashedPassword = await hashPassword(password);
    await ctx.internalAdapter.createAccount({
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: hashedPassword,
    });

    return user;
  }

  create: Repository["create"] = async (data) => {
    const ctx = await auth.$context;
    return ctx.internalAdapter.createUser(data);
  };

  update: Repository["update"] = async (id, data) => {
    const ctx = await auth.$context;
    return ctx.internalAdapter.updateUser(id, data);
  };

  async findByEmail(email: string) {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.email, email))
      .limit(1);

    return result.length ? result[0] : null;
  }
}

type UserListWithRelations = InferQueryModel<
  "users",
  UserRepository["listQueryWithRelationsDefinition"]
>;

export { UserRepository };
export type { UserListWithRelations };
