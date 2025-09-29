/**
 * Miltera Fixlog API - User Controller
 * 
 * Bu dosya, kullanıcı yönetimi ile ilgili tüm API endpoint'lerini tanımlar.
 * CRUD operasyonları (Create, Read, Update, Delete) ve kullanıcı işlemlerini yönetir.
 * 
 * Özellikler:
 * - Kullanıcı listesi (pagination, filtering, sorting)
 * - Kullanıcı detayı görüntüleme
 * - Yeni kullanıcı oluşturma
 * - Kullanıcı bilgilerini güncelleme
 * - Kullanıcı silme
 * - Kullanıcı istatistikleri
 * 
 * API Endpoints:
 * - GET /api/v1/users - Kullanıcı listesi
 * - GET /api/v1/users/:id - Kullanıcı detayı
 * - POST /api/v1/users - Yeni kullanıcı oluştur
 * - PUT /api/v1/users/:id - Kullanıcı güncelle
 * - DELETE /api/v1/users/:id - Kullanıcı sil
 * - GET /api/v1/users/stats - Kullanıcı istatistikleri
 * 
 * Güvenlik:
 * - Authentication gerekli (JWT token)
 * - Role-based access control
 * - Input validation (Zod schemas)
 * - SQL injection koruması
 */

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

// User service instance - database işlemleri için
const userService = new UserService(db);

/**
 * Kullanıcı Listesi
 * 
 * Tüm kullanıcıları listeler. Pagination, filtering ve sorting destekler.
 * Query parametreleri: page, limit, search, sort, order
 */
const list = createControllerAction<HonoEnv>(async (c) => {
  // Query parametrelerini al ve validate et
  const query = await c.validateRequest("rawQuery", (v) => v);
  const userListRequestDto = UserListRequestDto.create(query);

  // Service katmanından kullanıcı listesini al
  const userListDto = await userService.getAllUsers(userListRequestDto);

  // DTO'yu JSON'a çevir
  const userList = userListDto.toJSON();

  // Başarılı response döndür
  return c.responseJSON(ResponseHandler.success(userList.data, userList.meta));
});

/**
 * Kullanıcı Detayı
 * 
 * Belirli bir kullanıcının detaylı bilgilerini getirir.
 * URL parametresi: id (kullanıcı ID'si)
 */
const show = createControllerAction<HonoEnv>("/:id", async (c) => {
  // URL'den kullanıcı ID'sini al
  const id = c.req.param("id");

  // Service katmanından kullanıcı bilgilerini al
  const userDto = await userService.getUser(id);
  const user = userDto.toJSON();

  // Başarılı response döndür
  return c.responseJSON(ResponseHandler.success(user));
});

/**
 * Yeni Kullanıcı Oluşturma
 * 
 * Yeni bir kullanıcı hesabı oluşturur.
 * Request body: email, password, name, role, company_id vb.
 */
const create = createControllerAction<HonoEnv>(async (c) => {
  // Request body'yi al ve validate et
  const body = await c.validateRequest("json", (v) => v);
  const userCreateDto = UserCreateDto.create(body);

  // Service katmanında yeni kullanıcı oluştur
  const userDto = await userService.createUser(userCreateDto);
  const user = userDto.toJSON();

  // Başarılı response döndür
  return c.responseJSON(ResponseHandler.success(user));
});

/**
 * Kullanıcı Güncelleme
 * 
 * Mevcut kullanıcının bilgilerini günceller.
 * URL parametresi: id (kullanıcı ID'si)
 * Request body: güncellenecek alanlar
 */
const update = createControllerAction<HonoEnv>("/:id", async (c) => {
  // URL'den kullanıcı ID'sini al
  const id = c.req.param("id");
  
  // Request body'yi al ve validate et
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
