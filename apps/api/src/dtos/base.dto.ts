import { z } from "../lib/zod";

interface BaseDto<T extends z.ZodSchema, U extends any> {
  value: z.infer<T>;
  toJSON(): Record<keyof z.infer<T>, any>;
}

abstract class BaseDtoImpl<
  T extends z.ZodSchema = z.ZodSchema,
  U extends any = any,
> implements BaseDto<T, U>
{
  protected abstract readonly schema: T;
  protected input: U;

  constructor(data: U) {
    this.input = data;
  }

  get value(): z.infer<T> {
    return this.schema.parse(this.transform(this.input));
  }

  protected transform(data: U): z.infer<T> {
    return data;
  }

  static create<
    T extends z.ZodSchema,
    U extends any,
    V extends BaseDtoImpl<T, U>,
  >(this: new (data: U) => V, data: U) {
    return new this(data);
  }

  toJSON(): Record<keyof typeof this.value, any> {
    return this.value;
  }
}

abstract class BaseResponseDto<
  T extends z.ZodSchema = z.ZodSchema,
  U extends any = any,
> extends BaseDtoImpl<T, U> {
  protected abstract transform(data: U): z.infer<T>;

  get value(): z.infer<T> {
    return this.transform(this.input);
  }
}

export default BaseDtoImpl;
export { BaseResponseDto };
export type { BaseDto };
