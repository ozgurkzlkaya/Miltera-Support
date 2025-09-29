import { createRoute } from "@hono/zod-openapi";
import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import { z } from "../lib/zod";
import { createUser, authenticateUser, generateToken, changePassword } from "../lib/auth";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { buildResponseSuccessSchema } from "../helpers/response.helpers";
import {
  Error400Schema,
  Error401Schema,
  Error422Schema,
  Error500Schema,
} from "../dtos/base.schema";

// Auth schemas
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['USER', 'ADMIN', 'TECHNICIAN']).optional().default('USER'),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
});

const UpdatePreferencesSchema = z.object({
  language: z.string().optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
    systemUpdates: z.boolean().optional(),
    serviceAlerts: z.boolean().optional(),
    maintenanceNotifications: z.boolean().optional(),
  }).optional(),
});

const UpdateSecuritySchema = z.object({
  twoFactorAuth: z.boolean().optional(),
  sessionTimeout: z.number().optional(),
  passwordExpiry: z.number().optional(),
  loginAlerts: z.boolean().optional(),
});

const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: z.string(),
    isActive: z.boolean(),
    emailVerified: z.boolean(),
  }),
  token: z.string(),
});

// Login route
const login = createRoute({
  method: "post",
  path: "/login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(AuthResponseSchema),
        },
      },
      description: "Login successful",
    },
    401: {
      content: {
        "application/json": {
          schema: Error401Schema,
        },
      },
      description: "Invalid credentials",
    },
    422: {
      content: {
        "application/json": {
          schema: Error422Schema,
        },
      },
      description: "Validation error",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Register route
const register = createRoute({
  method: "post",
  path: "/register",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RegisterSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(AuthResponseSchema),
        },
      },
      description: "User created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: Error400Schema,
        },
      },
      description: "User already exists",
    },
    422: {
      content: {
        "application/json": {
          schema: Error422Schema,
        },
      },
      description: "Validation error",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Change password route
const changePasswordRoute = createRoute({
  method: "post",
  path: "/change-password",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ChangePasswordSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(z.object({ message: z.string() })),
        },
      },
      description: "Password changed successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: Error401Schema,
        },
      },
      description: "Invalid current password",
    },
    422: {
      content: {
        "application/json": {
          schema: Error422Schema,
        },
      },
      description: "Validation error",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Get profile route
const getProfileRoute = createRoute({
  method: "get",
  path: "/profile",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(AuthResponseSchema.shape.user),
        },
      },
      description: "User profile retrieved successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: Error401Schema,
        },
      },
      description: "User not authenticated",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Update profile route
const updateProfileRoute = createRoute({
  method: "put",
  path: "/profile",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateProfileSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(AuthResponseSchema.shape.user),
        },
      },
      description: "Profile updated successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: Error401Schema,
        },
      },
      description: "User not authenticated",
    },
    422: {
      content: {
        "application/json": {
          schema: Error422Schema,
        },
      },
      description: "Validation error",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Update preferences route
const updatePreferencesRoute = createRoute({
  method: "put",
  path: "/preferences",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdatePreferencesSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(UpdatePreferencesSchema),
        },
      },
      description: "Preferences updated successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: Error401Schema,
        },
      },
      description: "User not authenticated",
    },
    422: {
      content: {
        "application/json": {
          schema: Error422Schema,
        },
      },
      description: "Validation error",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Update security settings route
const updateSecurityRoute = createRoute({
  method: "put",
  path: "/security",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateSecuritySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(UpdateSecuritySchema),
        },
      },
      description: "Security settings updated successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: Error401Schema,
        },
      },
      description: "User not authenticated",
    },
    422: {
      content: {
        "application/json": {
          schema: Error422Schema,
        },
      },
      description: "Validation error",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Get preferences route
const getPreferencesRoute = createRoute({
  method: "get",
  path: "/preferences",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(UpdatePreferencesSchema),
        },
      },
      description: "User preferences retrieved successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: Error401Schema,
        },
      },
      description: "User not authenticated",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Get security settings route
const getSecurityRoute = createRoute({
  method: "get",
  path: "/security",
  request: {},
  responses: {
    200: {
      content: {
        "application/json": {
          schema: buildResponseSuccessSchema(UpdateSecuritySchema),
        },
      },
      description: "Security settings retrieved successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: Error401Schema,
        },
      },
      description: "User not authenticated",
    },
    500: {
      content: {
        "application/json": {
          schema: Error500Schema,
        },
      },
      description: "Internal server error",
    },
  },
});

// Auth controllers
const AuthController = {
  login: async (c: any) => {
    try {
      const { email, password } = await c.req.json();
      
      const user = await authenticateUser(email, password);
      const token = generateToken(user);
      
      return c.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return c.json({ error: 'Invalid credentials' }, 401);
    }
  },

  register: async (c: any) => {
    try {
      const { email, password, name, role } = await c.req.json();
      
      const user = await createUser(email, password, name, role);
      const token = generateToken(user);
      
      return c.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
          },
          token,
        },
      }, 201);
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message.includes('already exists')) {
        return c.json({ error: 'User already exists' }, 400);
      }
      return c.json({ error: 'Registration failed' }, 500);
    }
  },

  getProfile: async (c: any) => {
    try {
      // JWT token'dan user bilgisini al
      const authHeader = c.req.header("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: 'User not authenticated' }, 401);
      }
      
      const token = authHeader.substring(7);
      const { verifyToken } = await import("../lib/auth");
      const payload = verifyToken(token) as any;
      
      // Kullanıcı bilgilerini veritabanından al
      const [user] = await db.select().from(users).where(eq(users.id, payload.id));
      
      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }
      
      return c.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          phone: user.phone,
          address: user.address,
          company: user.company,
          lastPasswordChange: user.lastPasswordChange,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return c.json({ error: 'Profile retrieval failed' }, 500);
    }
  },

  changePassword: async (c: any) => {
    try {
      const { currentPassword, newPassword } = await c.req.json();
      
      // JWT token'dan user bilgisini al
      const authHeader = c.req.header("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: 'User not authenticated' }, 401);
      }
      
      const token = authHeader.substring(7);
      const { verifyToken } = await import("../lib/auth");
      const payload = verifyToken(token) as any;
      
      // Kullanıcı bilgilerini veritabanından al
      const [user] = await db.select().from(users).where(eq(users.id, payload.id));
      
      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }
      
      await changePassword(user.id, currentPassword, newPassword);
      
      return c.json({
        success: true,
        data: { message: 'Password changed successfully' },
      });
    } catch (error) {
      console.error('Change password error:', error);
      if (error.message.includes('incorrect')) {
        return c.json({ error: 'Current password is incorrect' }, 401);
      }
      return c.json({ error: 'Password change failed' }, 500);
    }
  },

  updateProfile: async (c: any) => {
    try {
      const { name, email, phone, address, company } = await c.req.json();
      
      // JWT token'dan user bilgisini al
      const authHeader = c.req.header("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: 'User not authenticated' }, 401);
      }
      
      const token = authHeader.substring(7);
      const { verifyToken } = await import("../lib/auth");
      const payload = verifyToken(token) as any;
      
      // Kullanıcı bilgilerini veritabanından al
      const [user] = await db.select().from(users).where(eq(users.id, payload.id));
      
      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }
      
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (address) updateData.address = address;
      if (company) updateData.company = company;
      
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, user.id))
        .returning();
      
      return c.json({
        success: true,
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
          emailVerified: updatedUser.emailVerified,
          lastPasswordChange: updatedUser.lastPasswordChange,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return c.json({ error: 'Profile update failed' }, 500);
    }
  },

  updatePreferences: async (c: any) => {
    try {
      const preferences = await c.req.json();
      
      // JWT token'dan user bilgisini al
      const authHeader = c.req.header("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: 'User not authenticated' }, 401);
      }
      
      const token = authHeader.substring(7);
      const { verifyToken } = await import("../lib/auth");
      const payload = verifyToken(token) as any;
      
      // Kullanıcı bilgilerini veritabanından al
      const [user] = await db.select().from(users).where(eq(users.id, payload.id));
      
      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }
      
      const updateData: any = {};
      if (preferences.language) updateData.language = preferences.language;
      if (preferences.timezone) updateData.timezone = preferences.timezone;
      if (preferences.dateFormat) updateData.dateFormat = preferences.dateFormat;
      if (preferences.theme) updateData.theme = preferences.theme;
      if (preferences.notifications) updateData.notifications = JSON.stringify(preferences.notifications);
      
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, user.id));
      
      return c.json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      return c.json({ error: 'Preferences update failed' }, 500);
    }
  },

  updateSecurity: async (c: any) => {
    try {
      const security = await c.req.json();
      
      // JWT token'dan user bilgisini al
      const authHeader = c.req.header("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: 'User not authenticated' }, 401);
      }
      
      const token = authHeader.substring(7);
      const { verifyToken } = await import("../lib/auth");
      const payload = verifyToken(token) as any;
      
      // Kullanıcı bilgilerini veritabanından al
      const [user] = await db.select().from(users).where(eq(users.id, payload.id));
      
      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }
      
      const updateData: any = {};
      if (security.twoFactorAuth !== undefined) updateData.twoFactorAuth = security.twoFactorAuth;
      if (security.sessionTimeout) updateData.sessionTimeout = security.sessionTimeout;
      if (security.passwordExpiry) updateData.passwordExpiry = security.passwordExpiry;
      if (security.loginAlerts !== undefined) updateData.loginAlerts = security.loginAlerts;
      
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, user.id));
      
      return c.json({
        success: true,
        data: security,
      });
    } catch (error) {
      console.error('Update security error:', error);
      return c.json({ error: 'Security settings update failed' }, 500);
    }
  },

  getPreferences: async (c: any) => {
    try {
      // JWT token'dan user bilgisini al
      const authHeader = c.req.header("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: 'User not authenticated' }, 401);
      }
      
      const token = authHeader.substring(7);
      const { verifyToken } = await import("../lib/auth");
      const payload = verifyToken(token) as any;
      
      // Kullanıcı bilgilerini veritabanından al
      const [user] = await db.select().from(users).where(eq(users.id, payload.id));
      
      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }
      
      const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id));
      
      const preferences = {
        language: userData.language || 'tr',
        timezone: userData.timezone || 'Europe/Istanbul',
        dateFormat: userData.dateFormat || 'DD/MM/YYYY',
        theme: userData.theme || 'light',
        notifications: userData.notifications ? JSON.parse(userData.notifications) : {
          email: true,
          push: true,
          sms: false,
          systemUpdates: true,
          serviceAlerts: true,
          maintenanceNotifications: false
        }
      };
      
      return c.json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      console.error('Get preferences error:', error);
      return c.json({ error: 'Failed to get preferences' }, 500);
    }
  },

  getSecurity: async (c: any) => {
    try {
      // JWT token'dan user bilgisini al
      const authHeader = c.req.header("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ error: 'User not authenticated' }, 401);
      }
      
      const token = authHeader.substring(7);
      const { verifyToken } = await import("../lib/auth");
      const payload = verifyToken(token) as any;
      
      // Kullanıcı bilgilerini veritabanından al
      const [user] = await db.select().from(users).where(eq(users.id, payload.id));
      
      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }
      
      const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id));
      
      const security = {
        twoFactorAuth: userData.twoFactorAuth || false,
        sessionTimeout: userData.sessionTimeout || 30,
        passwordExpiry: userData.passwordExpiry || 90,
        loginAlerts: userData.loginAlerts || true
      };
      
      return c.json({
        success: true,
        data: security,
      });
    } catch (error) {
      console.error('Get security error:', error);
      return c.json({ error: 'Failed to get security settings' }, 500);
    }
  },
};

const authRoute = createRouter<HonoEnv>()
  .openapi(login, AuthController.login)
  .openapi(register, AuthController.register)
  .openapi(changePasswordRoute, AuthController.changePassword)
  .openapi(getProfileRoute, AuthController.getProfile)
  .openapi(updateProfileRoute, AuthController.updateProfile)
  .openapi(updatePreferencesRoute, AuthController.updatePreferences)
  .openapi(updateSecurityRoute, AuthController.updateSecurity)
  .openapi(getPreferencesRoute, AuthController.getPreferences)
  .openapi(getSecurityRoute, AuthController.getSecurity);

export default authRoute;