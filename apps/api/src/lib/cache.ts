import { Context, Next } from "hono";
import { redisClient } from "./redis";

// Cache configuration
const CACHE_CONFIG = {
  defaultTTL: 300, // 5 minutes
  maxTTL: 3600, // 1 hour
  prefix: "cache:",
};

// Cache middleware for API responses (disabled for development)
export const cacheMiddleware = (ttl: number = CACHE_CONFIG.defaultTTL) => {
  return async (c: Context, next: Next) => {
    // Skip caching in development or if Redis is not available
    if (!redisClient) {
      await next();
      return;
    }

    // Skip caching for non-GET requests
    if (c.req.method !== "GET") {
      await next();
      return;
    }

    const cacheKey = `${CACHE_CONFIG.prefix}${c.req.url}`;
    
    try {
      // Try to get cached response
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        return c.json(parsed.data, parsed.status);
      }
      
      await next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      await next();
    }
  };
};

// Cache utilities
export const cacheUtils = {
  // Set cache value
  set: async (key: string, value: any, ttl: number = CACHE_CONFIG.defaultTTL) => {
    if (!redisClient) return;
    const fullKey = `${CACHE_CONFIG.prefix}${key}`;
    await redisClient.setex(fullKey, ttl, JSON.stringify(value));
  },
  
  // Get cache value
  get: async <T>(key: string): Promise<T | null> => {
    if (!redisClient) return null;
    const fullKey = `${CACHE_CONFIG.prefix}${key}`;
    const value = await redisClient.get(fullKey);
    return value ? JSON.parse(value) : null;
  },
  
  // Delete cache value
  delete: async (key: string) => {
    if (!redisClient) return;
    const fullKey = `${CACHE_CONFIG.prefix}${key}`;
    await redisClient.del(fullKey);
  },
  
  // Clear all cache
  clear: async () => {
    if (!redisClient) return;
    const keys = await redisClient.keys(`${CACHE_CONFIG.prefix}*`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  },
  
  // Invalidate cache by pattern
  invalidatePattern: async (pattern: string) => {
    if (!redisClient) return;
    const keys = await redisClient.keys(`${CACHE_CONFIG.prefix}${pattern}`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  },
  
  // Get cache statistics
  getStats: async () => {
    if (!redisClient) return { totalKeys: 0, memoryUsage: 0 };
    const keys = await redisClient.keys(`${CACHE_CONFIG.prefix}*`);
    return {
      totalKeys: keys.length,
      memoryUsage: 0, // Redis memory usage not available in this version
    };
  },
};

// Cache decorator for functions
export const cacheable = (ttl: number = CACHE_CONFIG.defaultTTL) => {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyName}:${JSON.stringify(args)}`;
      
      try {
        // Try to get from cache
        const cached = await cacheUtils.get(cacheKey);
        if (cached !== null) {
          return cached;
        }
        
        // Execute method and cache result
        const result = await method.apply(this, args);
        await cacheUtils.set(cacheKey, result, ttl);
        
        return result;
      } catch (error) {
        console.error(`Cache error in ${propertyName}:`, error);
        // Fallback to original method
        return method.apply(this, args);
      }
    };
    
    return descriptor;
  };
};

// Database query cache
export const queryCache = {
  // Cache database query results
  cacheQuery: async <T>(
    queryKey: string, 
    queryFn: () => Promise<T>, 
    ttl: number = CACHE_CONFIG.defaultTTL
  ): Promise<T> => {
    const cacheKey = `query:${queryKey}`;
    
    try {
      // Try to get from cache
      const cached = await cacheUtils.get<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
      
      // Execute query and cache result
      const result = await queryFn();
      await cacheUtils.set(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      console.error(`Query cache error for ${queryKey}:`, error);
      // Fallback to original query
      return queryFn();
    }
  },
  
  // Invalidate query cache
  invalidateQuery: async (queryKey: string) => {
    const cacheKey = `query:${queryKey}`;
    await cacheUtils.delete(cacheKey);
  },
  
  // Invalidate all query cache
  invalidateAllQueries: async () => {
    await cacheUtils.invalidatePattern("query:*");
  },
};

// Session cache
export const sessionCache = {
  // Store session data
  storeSession: async (sessionId: string, data: any, ttl: number = 3600) => {
    const cacheKey = `session:${sessionId}`;
    await cacheUtils.set(cacheKey, data, ttl);
  },
  
  // Get session data
  getSession: async <T>(sessionId: string): Promise<T | null> => {
    const cacheKey = `session:${sessionId}`;
    return await cacheUtils.get<T>(cacheKey);
  },
  
  // Delete session
  deleteSession: async (sessionId: string) => {
    const cacheKey = `session:${sessionId}`;
    await cacheUtils.delete(cacheKey);
  },
  
  // Clear all sessions
  clearAllSessions: async () => {
    await cacheUtils.invalidatePattern("session:*");
  },
};

// API response cache with smart invalidation
export const apiCache = {
  // Cache API response
  cacheResponse: async (
    endpoint: string, 
    params: any, 
    response: any, 
    ttl: number = CACHE_CONFIG.defaultTTL
  ) => {
    const cacheKey = `api:${endpoint}:${JSON.stringify(params)}`;
    await cacheUtils.set(cacheKey, response, ttl);
  },
  
  // Get cached API response
  getCachedResponse: async <T>(endpoint: string, params: any): Promise<T | null> => {
    const cacheKey = `api:${endpoint}:${JSON.stringify(params)}`;
    return await cacheUtils.get<T>(cacheKey);
  },
  
  // Invalidate API cache by endpoint
  invalidateEndpoint: async (endpoint: string) => {
    await cacheUtils.invalidatePattern(`api:${endpoint}:*`);
  },
  
  // Invalidate all API cache
  invalidateAll: async () => {
    await cacheUtils.invalidatePattern("api:*");
  },
};
