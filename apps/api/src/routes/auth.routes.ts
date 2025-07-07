import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import { auth } from "../lib/auth";

const authRoute = createRouter<HonoEnv>().on(["POST", "GET"], "*", (c) =>
  auth.handler(c.req.raw)
);

export default authRoute;
