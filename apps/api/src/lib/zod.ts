import { extendZodWithOpenApi } from "@hono/zod-openapi";
import { z } from "zod";
extendZodWithOpenApi(z);

import type { z as zv4 } from "zod/v4";

type ZodInfer<T extends zv4.ZodType<any, any, any>> = T["_output"];

export { z, type ZodInfer };
