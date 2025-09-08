import Redis from "ioredis";
import env from "../config/env";

const redisClient = new Redis(env.REDIS_URL);

export { redisClient };
