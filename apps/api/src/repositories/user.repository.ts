import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import type { Schema } from "../db";
import { BaseRepositoryImpl, type BaseRepository } from "./base.repository";
import type { User, UserInsert } from "../schemas/user.schema";
import { encrypt } from "../lib/encryption";

export class UserRepository
  extends BaseRepositoryImpl<User>
  implements BaseRepository<User>
{
  protected table = users;
  protected idColumn = users.id;

  constructor(db: PostgresJsDatabase<Schema>) {
    super(db);
  }

  async create(data: UserInsert): Promise<User> {
    const password = encrypt(data.password);

    return super.create({
      ...data,
      password,
    });
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const password = data.password ? encrypt(data.password) : undefined;

    return super.update(id, {
      ...data,
      password,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.email, email))
      .limit(1);

    return result.length ? (result[0] as User) : null;
  }
}
