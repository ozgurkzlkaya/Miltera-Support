import { extendZodWithOpenApi } from "@hono/zod-openapi";
import * as z from "zod";
extendZodWithOpenApi(z);

export { z };
