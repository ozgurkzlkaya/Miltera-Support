import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Schema } from "../db";
import { ResponseHandler } from "../helpers/response.helpers";
import { UserRepository } from "../repositories/user.repository";
import { serializeUser } from "../serializers/user.serializer";
import {
  UserCreateParamsSchema,
  UserUpdateParamsSchema,
  type UserCreateParams,
  type UserUpdateParams,
} from "../schemas/user.schema";

export class UserService {
  private repository: UserRepository;

  constructor(private db: PostgresJsDatabase<Schema>) {
    this.repository = new UserRepository(db);
  }

  async getAllUsers(options?: {
    filters?: Record<string, any>;
    pagination?: { page: number; limit: number };
    sort?: { field: string; direction: "asc" | "desc" };
  }) {
    try {
      const users = (await this.repository.findAll(options)).map((user) =>
        serializeUser(user)
      );
      return ResponseHandler.success(users);
    } catch (error) {
      return ResponseHandler.internalError("Failed to fetch users");
    }
  }

  async getUser(id: string) {
    try {
      const user = await this.repository.findById(id);
      if (!user) {
        return ResponseHandler.notFound("User not found");
      }
      return ResponseHandler.success(serializeUser(user));
    } catch (error) {
      return ResponseHandler.internalError("Failed to fetch user");
    }
  }

  async createUser(data: UserCreateParams) {
    const { data: userData, error: validationError } =
      await UserCreateParamsSchema.safeParseAsync(data);

    if (validationError) {
      return ResponseHandler.validationError(validationError.message);
    }

    // Check if user with email already exists
    const existingUser = await this.repository.findByEmail(userData.email);
    if (existingUser) {
      return ResponseHandler.validationError(
        "User with this email already exists"
      );
    }

    try {
      const user = await this.repository.create(userData);

      const serializedUser = serializeUser(user);
      return ResponseHandler.success(serializedUser);
    } catch (error) {
      return ResponseHandler.internalError("Failed to create user");
    }
  }

  async updateUser(id: string, data: UserUpdateParams) {
    const { data: userData, error: validationError } =
      await UserUpdateParamsSchema.safeParseAsync(data);

    if (validationError) {
      return ResponseHandler.validationError(validationError.message);
    }

    if (userData.email) {
      const existingUser = await this.repository.findByEmail(userData.email);
      if (existingUser && existingUser.id !== id) {
        return ResponseHandler.validationError("Email is already in use");
      }
    }

    try {
      const user = await this.repository.update(id, userData);
      if (!user) {
        return ResponseHandler.notFound("User not found");
      }

      const serializedUser = serializeUser(user);
      return ResponseHandler.success(serializedUser);
    } catch (error) {
      return ResponseHandler.internalError("Failed to update user");
    }
  }

  async deleteUser(id: string) {
    try {
      const success = await this.repository.delete(id);
      if (!success) {
        return ResponseHandler.notFound("User not found");
      }
      return ResponseHandler.status(204);
    } catch (error) {
      return ResponseHandler.internalError("Failed to delete user");
    }
  }
}
