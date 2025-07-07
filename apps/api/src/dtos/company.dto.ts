import { z } from "../lib/zod";
import { companies } from "../db/schema";
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

/* --- Company Base Schema --- */

const CompanyBaseSchema = BaseSchemaFactory(createSelectSchema(companies));
type CompanyBase = z.infer<typeof CompanyBaseSchema>;

/* --- Company List Request --- */

const CompanyListRequestSchema = ListMetaRequestSchema.optional();
class CompanyListRequestDto extends BaseDto<
  typeof CompanyListRequestSchema,
  string
> {
  protected readonly schema = CompanyListRequestSchema;
  protected transform(
    data: CompanyListRequestDto["input"]
  ): CompanyListRequestDto["value"] {
    return parseQueryString(data);
  }
}

/* --- Company List Response --- */

const CompanyListDataSchema = BaseSchemaFactory(CompanyBaseSchema);
const CompanyListSchema = z.object({
  data: z.array(CompanyListDataSchema),
  meta: ListMetaResponseSchema,
});

class CompanyListDto extends BaseResponseDto<
  typeof CompanyListSchema,
  { data: CompanyBase[]; meta: ListMetaResponse }
> {
  protected readonly schema = CompanyListSchema;
  protected transform(data: CompanyListDto["input"]): CompanyListDto["value"] {
    return data;
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

/* --- Company Response --- */

const CompanySchema = BaseSchemaFactory(CompanyBaseSchema);
class CompanyDto extends BaseResponseDto<typeof CompanySchema, CompanyBase> {
  protected readonly schema = CompanySchema;
  protected transform(data: CompanyDto["input"]): CompanyDto["value"] {
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

/* --- Company Create Request --- */

const CompanyCreateSchema = BaseRequestSchemaFactory(
  createInsertSchema(companies)
);

class CompanyCreateDto extends BaseDto<
  typeof CompanyCreateSchema,
  z.infer<typeof CompanyCreateSchema>
> {
  protected readonly schema = CompanyCreateSchema;
}

/* --- Company Update Request --- */

const CompanyUpdateSchema = BaseRequestSchemaFactory(
  createUpdateSchema(companies)
);

class CompanyUpdateDto extends BaseDto<
  typeof CompanyUpdateSchema,
  z.infer<typeof CompanyUpdateSchema>
> {
  protected readonly schema = CompanyUpdateSchema;
}

export {
  CompanyListRequestDto,
  CompanyListDto,
  CompanyDto,
  CompanyCreateDto,
  CompanyUpdateDto,
};

export {
  CompanyBaseSchema,
  CompanyListRequestSchema,
  CompanyListSchema,
  CompanySchema,
  CompanyCreateSchema,
  CompanyUpdateSchema,
};
