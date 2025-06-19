import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Schema } from "../db";
import { UserRepository } from "../repositories/user.repository";
import { verify } from "../lib/encryption";

export class AuthService {
  private userRepository: UserRepository;

  constructor(private db: PostgresJsDatabase<Schema>) {
    this.userRepository = new UserRepository(db);
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(data.email);
    
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const passwordMatch = verify(data.password, user.password);

    if (!passwordMatch) {
      return { success: false, message: "Invalid password" };
    }

    return { success: true, message: "Login successful" };
  }
}
