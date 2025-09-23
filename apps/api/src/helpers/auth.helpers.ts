import { createMiddleware } from "hono/factory";
import { auth, getAuth } from "../lib/auth";

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
  const authResult = await getAuth(c);

  if (!authResult.isAuthenticated || !authResult.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set("user", authResult.user);
  return next();
});

export const adminMiddleware = createMiddleware(async (c, next) => {
  const authResult = await getAuth(c);

  if (!authResult.isAuthenticated || !authResult.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (authResult.user.role !== "ADMIN") {
    return c.json({ error: 'Access denied. Admin role required.' }, 403);
  }

  c.set("user", authResult.user);
  return next();
});