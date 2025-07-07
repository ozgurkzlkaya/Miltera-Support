import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { db } from "../db";
import * as schema from "../db/schema";
import { redisClient } from "./redis";

const auth = betterAuth({
  basePath: "/api/v1/auth", // must be manually set see: routes/auth.routes.ts and app.ts
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url, token }, request) {
      // TODO: implement email sending
      console.log(user, url, token);
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        // enum: ["ADMIN", "TSP", "CUSTOMER"],
        required: true,
        input: false, // don't allow user to set role
      },
      companyId: {
        type: "string",
        input: false,
      },
      mustChangePassword: {
        type: "boolean",
        required: true,
        defaultValue: true,
        input: false,
      },
    },
  },
  plugins: [
    jwt({
      jwks: {
        disablePrivateKeyEncryption: true,
      },
      jwt: {
        definePayload: ({ user }) => {
          return {
            id: user.id,
            email: user.email,
            role: user.role,
          };
        },
      },
    }),
  ],
  advanced: {
    database: {
      generateId: false,
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  secondaryStorage: {
    get: async (key) => {
      const value = await redisClient.get(key);
      return value ? value : null;
    },
    set: async (key, value, ttl) => {
      if (ttl) await redisClient.set(key, value, "EX", ttl);
      else await redisClient.set(key, value);
    },
    delete: async (key) => {
      await redisClient.del(key);
    },
  },
});

export { auth };
