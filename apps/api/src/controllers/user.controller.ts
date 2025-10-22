import { db } from "../db";
import { createControllerAction } from "./base.controller";
import { ResponseHandler } from "../helpers/response.helpers";
import { UserService } from "../services/user.service";
import {
  UserListRequestDto,
  UserCreateDto,
  UserUpdateDto,
} from "../dtos/user.dto";
import type { HonoEnv } from "../config/env";

const userService = new UserService(db);

const list = createControllerAction<HonoEnv>(async (c) => {
  const query = await c.validateRequest("rawQuery", (v) => v);
  const userListRequestDto = UserListRequestDto.create(query);

  const userListDto = await userService.getAllUsers(userListRequestDto);

  const userList = userListDto.toJSON();

  return c.responseJSON(ResponseHandler.success(userList.data, userList.meta));
});

const show = createControllerAction<HonoEnv>("/:id", async (c) => {

  const id = c.req.param("id");

  const userDto = await userService.getUser(id);
  const user = userDto.toJSON();

  return c.responseJSON(ResponseHandler.success(user));
});

const create = createControllerAction<HonoEnv>(async (c) => {

  const body = await c.validateRequest("json", (v) => v);
  const userCreateDto = UserCreateDto.create(body);

  const userDto = await userService.createUser(userCreateDto);
  const user = userDto.toJSON();

  return c.responseJSON(ResponseHandler.success(user));
});

const update = createControllerAction<HonoEnv>("/:id", async (c) => {

  const id = c.req.param("id");
  const body = await c.validateRequest("json", (v) => v);
  const userUpdateDto = UserUpdateDto.create(body);

  const userDto = await userService.updateUser(id, userUpdateDto);
  const user = userDto.toJSON();

  return c.responseJSON(ResponseHandler.success(user));
});

const destroy = createControllerAction<HonoEnv>("/:id", async (c) => {

  const id = c.req.param("id");

  await userService.deleteUser(id);

  return c.responseStatus(204);
});

const UserController = { list, show, create, update, destroy };

export default UserController;
