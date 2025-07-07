import { z } from "../lib/zod";
import BaseDto, { BaseResponseDto } from "./base.dto";

/* --- Auth Login Request --- */

const AuthLoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

class AuthLoginRequestDto extends BaseDto<
  typeof AuthLoginRequestSchema,
  z.infer<typeof AuthLoginRequestSchema>
> {
  protected readonly schema = AuthLoginRequestSchema;
}

/* --- Auth Login Response --- */

const AuthLoginSchema = z.object({
  accessToken: z.string(),
});

class AuthLoginDto extends BaseResponseDto<
  typeof AuthLoginSchema,
  z.infer<typeof AuthLoginSchema>
> {
  protected readonly schema = AuthLoginSchema;
  protected transform(data: AuthLoginDto["input"]): AuthLoginDto["value"] {
    return data;
  }
}

/* --- Auth Register Request --- */

const AuthRegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  data: z.object({
    firstName: z.string(),
    lastName: z.string(),
    role: z.enum(["ADMIN", "TSP", "CUSTOMER"]),
  }),
});

class AuthRegisterRequestDto extends BaseDto<
  typeof AuthRegisterRequestSchema,
  z.infer<typeof AuthRegisterRequestSchema>
> {
  protected readonly schema = AuthRegisterRequestSchema;
}

/* --- Auth Register Response --- */

const AuthRegisterSchema = z.object({
  accessToken: z.string(),
});

class AuthRegisterDto extends BaseResponseDto<
  typeof AuthRegisterSchema,
  z.infer<typeof AuthRegisterSchema>
> {
  protected readonly schema = AuthRegisterSchema;
  protected transform(
    data: AuthRegisterDto["input"]
  ): AuthRegisterDto["value"] {
    return data;
  }
}

export {
  AuthLoginRequestDto,
  AuthLoginDto,
  AuthRegisterRequestDto,
  AuthRegisterDto,
};

export {
  AuthLoginRequestSchema,
  AuthLoginSchema,
  AuthRegisterRequestSchema,
  AuthRegisterSchema,
};
