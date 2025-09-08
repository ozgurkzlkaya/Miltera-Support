import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth";

const setSessionMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

export { setSessionMiddleware };

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});