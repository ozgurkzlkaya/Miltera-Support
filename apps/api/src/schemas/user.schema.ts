import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { users } from "../db/schema";
import { z } from "../lib/zod";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

const UserSchema = createSelectSchema(users);
const UserInsertSchema = createInsertSchema(users);
const UserUpdateSchema = createUpdateSchema(users);

type User = InferSelectModel<typeof users>;
type UserInsert = InferInsertModel<typeof users>;
type UserUpdate = Partial<UserInsert>;

export { UserSchema, UserInsertSchema, UserUpdateSchema };
export type { User, UserInsert, UserUpdate };
