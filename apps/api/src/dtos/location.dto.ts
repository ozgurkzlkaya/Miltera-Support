import { z } from "../lib/zod";
import { locations } from "../db/schema";
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

/* --- Location Base Schema --- */

const LocationBaseSchema = BaseSchemaFactory(createSelectSchema(locations));
type LocationBase = z.infer<typeof LocationBaseSchema>;

/* --- Location List Request --- */

const LocationListRequestSchema = ListMetaRequestSchema.optional();
class LocationListRequestDto extends BaseDto<
  typeof LocationListRequestSchema,
  string
> {
  protected readonly schema = LocationListRequestSchema;
  protected transform(data: LocationListRequestDto["input"]): LocationListRequestDto["value"] {
    return parseQueryString(data);
  }
}

/* --- Location List Response --- */

const LocationListDataSchema = BaseSchemaFactory(LocationBaseSchema);
const LocationListSchema = z.object({
  data: z.array(LocationListDataSchema),
  meta: ListMetaResponseSchema,
});

class LocationListDto extends BaseResponseDto<
  typeof LocationListSchema,
  { data: LocationBase[]; meta: ListMetaResponse }
> {
  protected readonly schema = LocationListSchema;
  protected transform(data: LocationListDto["input"]): LocationListDto["value"] {
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

/* --- Location Response --- */

const LocationSchema = BaseSchemaFactory(LocationBaseSchema);
class LocationDto extends BaseResponseDto<typeof LocationSchema, LocationBase> {
  protected readonly schema = LocationSchema;
  protected transform(data: LocationDto["input"]): LocationDto["value"] {
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

/* --- Location Create Request --- */

const LocationCreateSchema = BaseRequestSchemaFactory(
  createInsertSchema(locations)
);

class LocationCreateDto extends BaseDto<
  typeof LocationCreateSchema,
  z.infer<typeof LocationCreateSchema>
> {
  protected readonly schema = LocationCreateSchema;
}

/* --- Location Update Request --- */

const LocationUpdateSchema = BaseRequestSchemaFactory(
  createUpdateSchema(locations)
);

class LocationUpdateDto extends BaseDto<
  typeof LocationUpdateSchema,
  z.infer<typeof LocationUpdateSchema>
> {
  protected readonly schema = LocationUpdateSchema;
}

export {
  LocationListRequestDto,
  LocationListDto,
  LocationDto,
  LocationCreateDto,
  LocationUpdateDto,
};

export {
  LocationBaseSchema,
  LocationListRequestSchema,
  LocationListSchema,
  LocationSchema,
  LocationCreateSchema,
  LocationUpdateSchema,
};
