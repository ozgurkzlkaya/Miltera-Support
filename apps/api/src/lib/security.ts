import { Context, Next } from "hono";
import { redisClient } from "./redis";

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
};

// Security headers configuration
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

// Rate limiting middleware
export const rateLimitMiddleware = async (c: Context, next: Next) => {
  const clientIP = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
  const key = `rate_limit:${clientIP}`;
  
  try {
    if (!redisClient) {
      // Redis disabled, skip rate limiting
      return next();
    }
    
    const current = await redisClient.get(key);
    const requests = current ? parseInt(current) : 0;
    
    if (requests >= RATE_LIMIT_CONFIG.maxRequests) {
      return c.json(
        { 
          success: false, 
          error: { 
            code: "RATE_LIMIT_EXCEEDED", 
            message: RATE_LIMIT_CONFIG.message 
          } 
        }, 
        429
      );
    }
    
    // Increment request count
    await redisClient.incr(key);
    
    // Set expiry if this is the first request
    if (requests === 0) {
      await redisClient.expire(key, Math.floor(RATE_LIMIT_CONFIG.windowMs / 1000));
    }
    
    // Add rate limit headers
    c.header("X-RateLimit-Limit", RATE_LIMIT_CONFIG.maxRequests.toString());
    c.header("X-RateLimit-Remaining", (RATE_LIMIT_CONFIG.maxRequests - requests - 1).toString());
    c.header("X-RateLimit-Reset", new Date(Date.now() + RATE_LIMIT_CONFIG.windowMs).toISOString());
    
    await next();
  } catch (error) {
    console.error("Rate limiting error:", error);
    await next();
  }
};

// Security headers middleware
export const securityHeadersMiddleware = async (c: Context, next: Next) => {
  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    c.header(key, value);
  });
  
  await next();
};

// CORS configuration
export const corsConfig = {
  origin: [
    "https://service.miltera.com.tr",
    "https://staging-service.miltera.com.tr",
    "http://localhost:3000", // Development
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin"
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Input validation middleware
export const inputValidationMiddleware = async (c: Context, next: Next) => {
  // Check for potentially malicious content in request body
  const contentType = c.req.header("content-type");
  
  if (contentType?.includes("application/json")) {
    try {
      const body = await c.req.json();
      
      // Check for SQL injection patterns
      const sqlPatterns = [
        /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
        /(\b(exec|execute|script|javascript|vbscript)\b)/i,
        /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
      ];
      
      const bodyString = JSON.stringify(body);
      
      for (const pattern of sqlPatterns) {
        if (pattern.test(bodyString)) {
          return c.json(
            { 
              success: false, 
              error: { 
                code: "INVALID_INPUT", 
                message: "Invalid input detected" 
              } 
            }, 
            400
          );
        }
      }
    } catch (error) {
      // If JSON parsing fails, continue (might be a different content type)
    }
  }
  
  await next();
};

// Authentication middleware with enhanced security
export const enhancedAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { 
        success: false, 
        error: { 
          code: "UNAUTHORIZED", 
          message: "Authentication required" 
        } 
      }, 
      401
    );
  }
  
  const token = authHeader.substring(7);
  
  // Check if token is blacklisted
  const isBlacklisted = await redisClient.get(`blacklist:${token}`);
  if (isBlacklisted) {
    return c.json(
      { 
        success: false, 
        error: { 
          code: "TOKEN_INVALID", 
          message: "Token has been revoked" 
        } 
      }, 
      401
    );
  }
  
  await next();
};

// Request logging middleware
export const requestLoggingMiddleware = async (c: Context, next: Next) => {
  const startTime = Date.now();
  const clientIP = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
  const userAgent = c.req.header("user-agent") || "unknown";
  const method = c.req.method;
  const path = c.req.path;
  
  await next();
  
  const duration = Date.now() - startTime;
  const status = c.res.status;
  
  // Log request details
  console.log({
    timestamp: new Date().toISOString(),
    method,
    path,
    status,
    duration: `${duration}ms`,
    ip: clientIP,
    userAgent,
  });
  
  // Log security events
  if (status === 401 || status === 403) {
    console.warn({
      type: "SECURITY_EVENT",
      timestamp: new Date().toISOString(),
      event: status === 401 ? "UNAUTHORIZED_ACCESS" : "FORBIDDEN_ACCESS",
      ip: clientIP,
      path,
      userAgent,
    });
  }
};

// Error handling middleware with security considerations
export const secureErrorHandler = async (error: Error, c: Context) => {
  // Don't expose internal error details in production
  const isProduction = process.env.NODE_ENV === "production";
  
  if (isProduction) {
    return c.json(
      { 
        success: false, 
        error: { 
          code: "INTERNAL_ERROR", 
          message: "An internal error occurred" 
        } 
      }, 
      500
    );
  }
  
  // In development, provide more details
  return c.json(
    { 
      success: false, 
      error: { 
        code: "INTERNAL_ERROR", 
        message: error.message,
        stack: error.stack 
      } 
    }, 
    500
  );
};

// Password strength validation
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Session management utilities
export const sessionUtils = {
  // Blacklist a token
  blacklistToken: async (token: string, expiresIn: number = 3600) => {
    await redisClient.set(`blacklist:${token}`, "1", "EX", expiresIn);
  },
  
  // Check if token is blacklisted
  isTokenBlacklisted: async (token: string): Promise<boolean> => {
    const result = await redisClient.get(`blacklist:${token}`);
    return result !== null;
  },
  
  // Store user session data
  storeSession: async (userId: string, sessionData: any, expiresIn: number = 3600) => {
    await redisClient.set(`session:${userId}`, JSON.stringify(sessionData), "EX", expiresIn);
  },
  
  // Get user session data
  getSession: async (userId: string): Promise<any | null> => {
    const data = await redisClient.get(`session:${userId}`);
    return data ? JSON.parse(data) : null;
  },
  
  // Clear user session
  clearSession: async (userId: string) => {
    await redisClient.del(`session:${userId}`);
  },
};
