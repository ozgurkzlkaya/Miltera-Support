import { db } from "../db/client";
import type { ControllerAction } from "./base.controller";
import { UserService } from "../services/user.service";

const userService = new UserService(db);

const list: ControllerAction = async (c) => {
  const query = c.req.query();
  const { role, company, isActive, page, limit, sort } = query;

  const filters = {
    ...(role && { role }),
    ...(company && { companyId: company }),
    ...(isActive && { isActive: isActive === "true" }),
  };

  const response = await userService.getAllUsers({
    filters,
    pagination:
      page && limit ? { page: Number(page), limit: Number(limit) } : undefined,
    sort: sort ? { field: sort, direction: "asc" } : undefined,
  });

  return c.json(response.json, response.statusCode);
};

const show: ControllerAction = async (c) => {
  const id = c.req.param("id");
  const response = await userService.getUser(id);

  return c.json(response.json, response.statusCode);
};

const create: ControllerAction = async (c) => {
  const body = await c.req.json();
  const response = await userService.createUser(body);

  return c.json(response.json, response.statusCode);
};

const update: ControllerAction = async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const response = await userService.updateUser(id, body);

  return c.json(response.json, response.statusCode);
};

const destroy: ControllerAction = async (c) => {
  const id = c.req.param("id");
  const response = await userService.deleteUser(id);

  return new Response(null, { status: response.statusCode });
};

export default {
  list,
  show,
  create,
  update,
  destroy,
};
