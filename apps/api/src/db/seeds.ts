import { auth } from "../lib/auth";
import { redisClient } from "../lib/redis";
import { reset, seed } from "drizzle-seed";
import { db } from "./client";
import * as schema from "./schema";
import { UserRepository } from "../repositories/user.repository";

const userRepository = new UserRepository(db);

async function seeder() {
  // await reset(db, schema);
  const user = await userRepository.createUserWithPassword(
    {
      email: "test.user@miltera.com.tr",
      name: "Test User",
      role: "ADMIN",
      mustChangePassword: false,
    },
    "test123"
  );

  console.log(`Created user ${user.email}`);

  await redisClient.quit();
}

seeder();
