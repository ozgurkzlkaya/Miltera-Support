import { z } from "../lib/zod";
import { companies, issues } from "../db/schema";
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

/* --- Issue Base Schema --- */

const IssueBaseSchema = BaseSchemaFactory(createSelectSchema(issues));
type IssueBase = z.infer<typeof IssueBaseSchema>;

/* --- Issue List Request --- */

const IssueListRequestSchema = ListMetaRequestSchema.optional();
class IssueListRequestDto extends BaseDto<
  typeof IssueListRequestSchema,
  string
> {
  protected readonly schema = IssueListRequestSchema;
  protected transform(data: IssueListRequestDto["input"]): IssueListRequestDto["value"] {
    return parseQueryString(data);
  }
}

/* --- Issue List Response --- */

const IssueListDataSchema = BaseSchemaFactory(IssueBaseSchema);
const IssueListSchema = z.object({
  data: z.array(IssueListDataSchema),
  meta: ListMetaResponseSchema,
});

class IssueListDto extends BaseResponseDto<
  typeof IssueListSchema,
  { data: IssueBase[]; meta: ListMetaResponse }
> {
  protected readonly schema = IssueListSchema;
  protected transform(data: IssueListDto["input"]): IssueListDto["value"] {
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

/* --- Issue Response --- */

const IssueSchema = BaseSchemaFactory(IssueBaseSchema);
class IssueDto extends BaseResponseDto<typeof IssueSchema, IssueBase> {
  protected readonly schema = IssueSchema;
  protected transform(data: IssueDto["input"]): IssueDto["value"] {
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

/* --- Issue Create Request --- */

const IssueCreateSchema = BaseRequestSchemaFactory(createInsertSchema(issues));

class IssueCreateDto extends BaseDto<
  typeof IssueCreateSchema,
  z.infer<typeof IssueCreateSchema>
> {
  protected readonly schema = IssueCreateSchema;
}

/* --- Issue Update Request --- */

const IssueUpdateSchema = BaseRequestSchemaFactory(createUpdateSchema(issues));

class IssueUpdateDto extends BaseDto<
  typeof IssueUpdateSchema,
  z.infer<typeof IssueUpdateSchema>
> {
  protected readonly schema = IssueUpdateSchema;
}

export {
  IssueListRequestDto,
  IssueListDto,
  IssueDto,
  IssueCreateDto,
  IssueUpdateDto,
};

export {
  IssueBaseSchema,
  IssueListRequestSchema,
  IssueListSchema,
  IssueSchema,
  IssueCreateSchema,
  IssueUpdateSchema,
};
