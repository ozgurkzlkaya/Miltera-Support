import { createSchemaFactory } from "drizzle-zod";
import { users } from "../db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { z } from "../lib/zod";

const { createSelectSchema, createInsertSchema, createUpdateSchema } =
  createSchemaFactory({ zodInstance: z });

const UserRawSchema = createSelectSchema(users);
const UserSchema = UserRawSchema;
const UserSerializedSchema = UserSchema.extend({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const UserCreateParamsRawSchema = createInsertSchema(users);
const UserCreateParamsSchema = UserCreateParamsRawSchema;

const UserUpdateParamsRawSchema = createUpdateSchema(users);
const UserUpdateParamsSchema = UserUpdateParamsRawSchema;

type UserRaw = InferSelectModel<typeof users>;
type User = z.infer<typeof UserSchema>;
type UserSerialized = z.infer<typeof UserSerializedSchema>;

type UserCreateParams = z.infer<typeof UserCreateParamsRawSchema>;
type UserUpdateParams = z.infer<typeof UserUpdateParamsRawSchema>;

export { UserRawSchema, UserCreateParamsRawSchema, UserUpdateParamsRawSchema };
export { UserSchema, UserCreateParamsSchema, UserUpdateParamsSchema };

export type {
  UserRaw,
  User,
  UserSerialized,
  UserCreateParams,
  UserUpdateParams,
};
