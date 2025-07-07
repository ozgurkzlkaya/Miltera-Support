import { z } from "../lib/zod";
import { users } from "../db/schema";
import BaseDto, { BaseResponseDto } from "./base.dto";
import {
  BaseSchemaFactory,
  BaseRequestSchemaFactory,
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
  ListMetaRequestSchema,
  ListMetaResponseSchema,
  type ListMetaResponse,
} from "./base.schema";

import { parseQueryString } from "@miltera/helpers/query-builder";

/* --- User Base Schema --- */

const UserBaseSchema = BaseSchemaFactory(createSelectSchema(users));
type UserBase = z.infer<typeof UserBaseSchema>;

/* --- User List Request --- */

const UserListRequestSchema = ListMetaRequestSchema.optional();
class UserListRequestDto extends BaseDto<typeof UserListRequestSchema, string> {
  protected readonly schema = UserListRequestSchema;
  protected transform(
    data: UserListRequestDto["input"]
  ): UserListRequestDto["value"] {
    return parseQueryString(data);
  }
}

/* --- User List Response --- */

const UserListDataSchema = BaseSchemaFactory(UserBaseSchema)
  .omit({
    mustChangePassword: true,
    companyId: true,
  })
  .extend({
    company: z.object({
      id: z.string(),
      name: z.string(),
    }),
  });
const UserListSchema = z.object({
  data: z.array(UserListDataSchema),
  meta: ListMetaResponseSchema,
});

class UserListDto extends BaseResponseDto<
  typeof UserListSchema,
  {
    data: (Omit<UserBase, "companyId"> & {
      company: { id: string; name: string };
    })[];
    meta: ListMetaResponse;
  }
> {
  protected readonly schema = UserListSchema;

  protected transform(data: UserListDto["input"]): UserListDto["value"] {
    const transformed = {
      ...data,
      data: data.data.map(({ mustChangePassword, ...d }) => {
        return d;
      }),
    };

    return transformed;
  }

  toJSON() {
    // serialization
    const value = this.value;

    return {
      ...value,
      data: value.data.map((data) => ({
        ...data,
        createdAt: data.createdAt.toISOString(),
        updatedAt: data.updatedAt.toISOString(),
      })),
    };
  }
}

/* --- User Response --- */

const UserSchema = BaseSchemaFactory(UserBaseSchema).pick({
  id: true,
  name: true,
  email: true,
  role: true,
  companyId: true,
  createdAt: true,
  updatedAt: true,
});
class UserDto extends BaseResponseDto<typeof UserSchema, UserBase> {
  protected readonly schema = UserSchema;
  protected transform(data: UserDto["input"]): UserDto["value"] {
    return data;
  }

  toJSON() {
    // serialization
    const value = this.value;

    return {
      ...value,
      createdAt: value.createdAt.toISOString(),
      updatedAt: value.updatedAt.toISOString(),
    };
  }
}

/* --- User Create Request --- */

const UserCreateSchema = BaseRequestSchemaFactory(createInsertSchema(users))
  .pick({
    name: true,
    email: true,
    role: true,
    companyId: true,
  })
  .extend({
    password: z.string(),
  });
class UserCreateDto extends BaseDto<
  typeof UserCreateSchema,
  z.infer<typeof UserCreateSchema>
> {
  protected readonly schema = UserCreateSchema;
}

/* --- User Update Request --- */

const UserUpdateSchema = BaseRequestSchemaFactory(
  createUpdateSchema(users)
).pick({
  name: true,
  email: true,
  role: true,
  companyId: true,
});
class UserUpdateDto extends BaseDto<
  typeof UserUpdateSchema,
  z.infer<typeof UserUpdateSchema>
> {
  protected readonly schema = UserUpdateSchema;
}

export {
  UserListRequestDto,
  UserListDto,
  UserDto,
  UserCreateDto,
  UserUpdateDto,
};

export {
  UserBaseSchema,
  UserListRequestSchema,
  UserListSchema,
  UserSchema,
  UserCreateSchema,
  UserUpdateSchema,
};
