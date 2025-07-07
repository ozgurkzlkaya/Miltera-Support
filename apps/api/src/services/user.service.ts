import type { Database } from "../db";
import { UserRepository } from "../repositories/user.repository";
import {
  UserListRequestDto,
  UserListDto,
  UserDto,
  UserCreateDto,
  UserUpdateDto,
} from "../dtos/user.dto";

class UserService {
  private repository: UserRepository;

  constructor(private db: Database) {
    this.repository = new UserRepository(db);
  }

  async getAllUsers(
    userListRequestDto: UserListRequestDto
  ): Promise<UserListDto> {
    const options = userListRequestDto.value;
    const { data, pagination } =
      await this.repository.findAllWithRelations(options);

    return UserListDto.create({
      data,
      meta: {
        filters: options?.filters,
        sort: options?.sort,
        pagination,
      } as any, // TODO,
    });
  }

  /**
   * Get user
   */
  async getUser(id: string) {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    return UserDto.create(user);
  }

  /**
   * Create a new user
   */
  async createUser(userCreateDto: UserCreateDto) {
    const { password, ...userData } = userCreateDto.value;

    const user = await this.repository.createUserWithPassword(
      userData,
      password
    );

    return UserDto.create(user);
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, userUpdateDto: UserUpdateDto) {
    const user = await this.repository.update(id, userUpdateDto.value);

    if (!user) {
      throw new Error("User not found");
    }

    return UserDto.create(user);
  }

  /**
   * Soft delete a user
   */
  async deleteUser(id: string): Promise<void> {
    const isFound = await this.repository.delete(id);

    if (!isFound) {
      throw new Error("User not found");
    }
  }
}

export { UserService };
