import Redis from "ioredis";
import env from "../config/env";

// Redis client with fallback for development
let redisClient: Redis | null = null;

try {
  redisClient = new Redis(env.REDIS_URL, {
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });
  
  redisClient.on('error', (err) => {
    console.warn('Redis connection failed, continuing without cache:', err.message);
    redisClient = null;
  });
} catch (error) {
  console.warn('Redis initialization failed, continuing without cache:', error);
  redisClient = null;
}

export { redisClient };
