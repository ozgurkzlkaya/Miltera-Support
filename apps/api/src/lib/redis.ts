import Redis from "ioredis";
import env from "../config/env";

// Redis client with fallback for development
let redisClient: Redis | null = null;

// Disable Redis for development - set to null to avoid connection attempts
if (process.env.NODE_ENV === 'production' && env.REDIS_URL) {
  try {
    redisClient = new Redis(env.REDIS_URL, {
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
} else {
  console.log('Redis disabled for development environment');
  redisClient = null;
}

export { redisClient };
