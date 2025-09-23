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
    // Custom auth implementation
    const { createUser } = await import("../lib/auth");
    
    const user = await createUser(
      userData.email,
      password,
      `${userData.firstName} ${userData.lastName}`.trim(),
      userData.role
    );

    return user;
  }

  create: Repository["create"] = async (data) => {
    // Custom auth implementation - use direct database insert
    const { db } = await import("../db");
    const { users } = await import("../db/schema");
    
    const [user] = await db.insert(users).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return user;
  };

  update: Repository["update"] = async (id, data) => {
    // Custom auth implementation - use direct database update
    const { db } = await import("../db");
    const { users } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    
    const [user] = await db.update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    return user;
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
