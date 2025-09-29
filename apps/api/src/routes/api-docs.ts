import { Hono } from 'hono';
import { apiVersioningService } from '../lib/api-versioning';

const apiDocs = new Hono();

// API Documentation endpoint
apiDocs.get('/docs', async (c) => {
  const versions = apiVersioningService.getAllVersions();
  
  const documentation = {
    title: 'Miltera FixLog API Documentation',
    description: 'Comprehensive API documentation for Miltera FixLog system',
    version: '1.0.0',
    contact: {
      name: 'Miltera Support',
      email: 'support@miltera.com',
      url: 'https://miltera.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    versions: versions.map(v => ({
      version: v.version,
      deprecated: v.deprecated,
      sunsetDate: v.sunsetDate,
      changelog: v.changelog,
      breakingChanges: v.breakingChanges,
    })),
    endpoints: {
      v1: {
        baseUrl: '/api/v1',
        authentication: {
          type: 'Bearer Token',
          description: 'All endpoints require authentication via Bearer token in Authorization header',
          example: 'Authorization: Bearer <your-token>',
        },
        endpoints: {
          auth: {
            'POST /auth/login': {
              description: 'User login',
              parameters: {
                body: {
                  email: { type: 'string', required: true, description: 'User email' },
                  password: { type: 'string', required: true, description: 'User password' },
                },
              },
              responses: {
                200: { description: 'Login successful', example: { success: true, token: '...', user: { id: 'uuid', email: 'user@example.com' } } },
                401: { description: 'Invalid credentials' },
              },
            },
            'POST /auth/register': {
              description: 'User registration',
              parameters: {
                body: {
                  email: { type: 'string', required: true },
                  password: { type: 'string', required: true },
                  firstName: { type: 'string', required: true },
                  lastName: { type: 'string', required: true },
                },
              },
              responses: {
                201: { description: 'Registration successful' },
                400: { description: 'Validation error' },
              },
            },
            'POST /auth/logout': {
              description: 'User logout',
              responses: {
                200: { description: 'Logout successful' },
              },
            },
          },
          users: {
            'GET /users': {
              description: 'Get all users (Admin only)',
              parameters: {
                query: {
                  page: { type: 'number', default: 1 },
                  limit: { type: 'number', default: 50 },
                },
              },
              responses: {
                200: { description: 'Users list' },
                403: { description: 'Forbidden - Admin access required' },
              },
            },
            'GET /users/:id': {
              description: 'Get user by ID',
              parameters: {
                path: {
                  id: { type: 'string', required: true, description: 'User ID' },
                },
              },
              responses: {
                200: { description: 'User details' },
                404: { description: 'User not found' },
              },
            },
            'PUT /users/:id': {
              description: 'Update user',
              parameters: {
                path: { id: { type: 'string', required: true } },
                body: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string', enum: ['ADMIN', 'TSP', 'USER', 'CUSTOMER'] },
                },
              },
              responses: {
                200: { description: 'User updated' },
                404: { description: 'User not found' },
              },
            },
            'DELETE /users/:id': {
              description: 'Delete user',
              parameters: {
                path: { id: { type: 'string', required: true } },
              },
              responses: {
                200: { description: 'User deleted' },
                404: { description: 'User not found' },
              },
            },
          },
          products: {
            'GET /products': {
              description: 'Get all products',
              parameters: {
                query: {
                  page: { type: 'number', default: 1 },
                  limit: { type: 'number', default: 50 },
                  status: { type: 'string', enum: ['PRODUCTION', 'READY_FOR_SHIPMENT', 'SHIPPED', 'DELIVERED'] },
                },
              },
              responses: {
                200: { description: 'Products list' },
              },
            },
            'POST /products': {
              description: 'Create new product',
              parameters: {
                body: {
                  name: { type: 'string', required: true },
                  description: { type: 'string' },
                  category: { type: 'string', required: true },
                  model: { type: 'string', required: true },
                  serialNumber: { type: 'string', required: true },
                },
              },
              responses: {
                201: { description: 'Product created' },
                400: { description: 'Validation error' },
              },
            },
            'GET /products/:id': {
              description: 'Get product by ID',
              parameters: {
                path: { id: { type: 'string', required: true } },
              },
              responses: {
                200: { description: 'Product details' },
                404: { description: 'Product not found' },
              },
            },
            'PUT /products/:id': {
              description: 'Update product',
              parameters: {
                path: { id: { type: 'string', required: true } },
                body: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string' },
                },
              },
              responses: {
                200: { description: 'Product updated' },
                404: { description: 'Product not found' },
              },
            },
            'DELETE /products/:id': {
              description: 'Delete product',
              parameters: {
                path: { id: { type: 'string', required: true } },
              },
              responses: {
                200: { description: 'Product deleted' },
                404: { description: 'Product not found' },
              },
            },
          },
          issues: {
            'GET /issues': {
              description: 'Get all issues',
              parameters: {
                query: {
                  page: { type: 'number', default: 1 },
                  limit: { type: 'number', default: 50 },
                  status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                },
              },
              responses: {
                200: { description: 'Issues list' },
              },
            },
            'POST /issues': {
              description: 'Create new issue',
              parameters: {
                body: {
                  title: { type: 'string', required: true },
                  description: { type: 'string', required: true },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
                  productId: { type: 'string', required: true },
                },
              },
              responses: {
                201: { description: 'Issue created' },
                400: { description: 'Validation error' },
              },
            },
            'GET /issues/:id': {
              description: 'Get issue by ID',
              parameters: {
                path: { id: { type: 'string', required: true } },
              },
              responses: {
                200: { description: 'Issue details' },
                404: { description: 'Issue not found' },
              },
            },
            'PUT /issues/:id': {
              description: 'Update issue',
              parameters: {
                path: { id: { type: 'string', required: true } },
                body: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string' },
                  priority: { type: 'string' },
                },
              },
              responses: {
                200: { description: 'Issue updated' },
                404: { description: 'Issue not found' },
              },
            },
            'DELETE /issues/:id': {
              description: 'Delete issue',
              parameters: {
                path: { id: { type: 'string', required: true } },
              },
              responses: {
                200: { description: 'Issue deleted' },
                404: { description: 'Issue not found' },
              },
            },
          },
          serviceOperations: {
            'GET /service-operations': {
              description: 'Get all service operations',
              parameters: {
                query: {
                  page: { type: 'number', default: 1 },
                  limit: { type: 'number', default: 50 },
                  status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
                  operationType: { type: 'string', enum: ['INITIAL_TEST', 'FABRICATION_TEST', 'HARDWARE_VERIFICATION', 'CONFIGURATION', 'PRE_TEST', 'REPAIR', 'FINAL_TEST', 'QUALITY_CHECK'] },
                },
              },
              responses: {
                200: { description: 'Service operations list' },
              },
            },
            'POST /service-operations': {
              description: 'Create new service operation',
              parameters: {
                body: {
                  issueId: { type: 'string' },
                  productId: { type: 'string', required: true },
                  operationType: { type: 'string', enum: ['INITIAL_TEST', 'FABRICATION_TEST', 'HARDWARE_VERIFICATION', 'CONFIGURATION', 'PRE_TEST', 'REPAIR', 'FINAL_TEST', 'QUALITY_CHECK'], required: true },
                  description: { type: 'string', required: true },
                  performedBy: { type: 'string', required: true },
                },
              },
              responses: {
                201: { description: 'Service operation created' },
                400: { description: 'Validation error' },
              },
            },
            'GET /service-operations/:id': {
              description: 'Get service operation by ID',
              parameters: {
                path: { id: { type: 'string', required: true } },
              },
              responses: {
                200: { description: 'Service operation details' },
                404: { description: 'Service operation not found' },
              },
            },
            'PUT /service-operations/:id': {
              description: 'Update service operation',
              parameters: {
                path: { id: { type: 'string', required: true } },
                body: {
                  status: { type: 'string' },
                  description: { type: 'string' },
                  findings: { type: 'string' },
                  actionsTaken: { type: 'string' },
                },
              },
              responses: {
                200: { description: 'Service operation updated' },
                404: { description: 'Service operation not found' },
              },
            },
            'DELETE /service-operations/:id': {
              description: 'Delete service operation',
              parameters: {
                path: { id: { type: 'string', required: true } },
              },
              responses: {
                200: { description: 'Service operation deleted' },
                404: { description: 'Service operation not found' },
              },
            },
          },
          shipments: {
            'GET /shipments': {
              description: 'Get all shipments',
              parameters: {
                query: {
                  page: { type: 'number', default: 1 },
                  limit: { type: 'number', default: 50 },
                  status: { type: 'string', enum: ['PENDING', 'SHIPPED', 'DELIVERED', 'RETURNED'] },
                },
              },
              responses: {
                200: { description: 'Shipments list' },
              },
            },
            'POST /shipments': {
              description: 'Create new shipment',
              parameters: {
                body: {
                  trackingNumber: { type: 'string', required: true },
                  productId: { type: 'string', required: true },
                  destination: { type: 'string', required: true },
                  carrier: { type: 'string', required: true },
                },
              },
              responses: {
                201: { description: 'Shipment created' },
                400: { description: 'Validation error' },
              },
            },
            'GET /shipments/:id': {
              description: 'Get shipment by ID',
              parameters: {
                path: { id: { type: 'string', required: true } },
              },
              responses: {
                200: { description: 'Shipment details' },
                404: { description: 'Shipment not found' },
              },
            },
            'PUT /shipments/:id': {
              description: 'Update shipment',
              parameters: {
                path: { id: { type: 'string', required: true } },
                body: {
                  status: { type: 'string' },
                  trackingNumber: { type: 'string' },
                  destination: { type: 'string' },
                },
              },
              responses: {
                200: { description: 'Shipment updated' },
                404: { description: 'Shipment not found' },
              },
            },
            'DELETE /shipments/:id': {
              description: 'Delete shipment',
              parameters: {
                path: { id: { type: 'string', required: true } },
              },
              responses: {
                200: { description: 'Shipment deleted' },
                404: { description: 'Shipment not found' },
              },
            },
          },
          companies: {
            'GET /companies': {
              description: 'Get all companies',
              parameters: {
                query: {
                  page: { type: 'number', default: 1 },
                  limit: { type: 'number', default: 50 },
                },
              },
              responses: {
                200: { description: 'Companies list' },
              },
            },
            'POST /companies': {
              description: 'Create new company',
              parameters: {
                body: {
                  name: { type: 'string', required: true },
                  email: { type: 'string', required: true },
                  phone: { type: 'string', required: true },
                  address: { type: 'string', required: true },
                  isManufacturer: { type: 'boolean', default: false },
                },
              },
              responses: {
                201: { description: 'Company created' },
                400: { description: 'Validation error' },
              },
            },
            'GET /companies/:id': {
              description: 'Get company by ID',
              parameters: {
                path: { id: { type: 'string', required: true } },
              },
              responses: {
                200: { description: 'Company details' },
                404: { description: 'Company not found' },
              },
            },
            'PUT /companies/:id': {
              description: 'Update company',
              parameters: {
                path: { id: { type: 'string', required: true } },
                body: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  address: { type: 'string' },
                  isManufacturer: { type: 'boolean' },
                },
              },
              responses: {
                200: { description: 'Company updated' },
                404: { description: 'Company not found' },
              },
            },
            'DELETE /companies/:id': {
              description: 'Delete company',
              parameters: {
                path: { id: { type: 'string', required: true } },
              },
              responses: {
                200: { description: 'Company deleted' },
                404: { description: 'Company not found' },
              },
            },
          },
          search: {
            'POST /search': {
              description: 'Advanced search across all entities',
              parameters: {
                body: {
                  query: { type: 'string', required: true },
                  entityTypes: { type: 'array', items: { type: 'string' }, enum: ['products', 'issues', 'service-operations', 'shipments', 'companies'] },
                  filters: { type: 'object' },
                  page: { type: 'number', default: 1 },
                  limit: { type: 'number', default: 50 },
                },
              },
              responses: {
                200: { description: 'Search results' },
                400: { description: 'Invalid search parameters' },
              },
            },
          },
          collaboration: {
            'GET /collaboration/comments/:entityType/:entityId': {
              description: 'Get comments for an entity',
              parameters: {
                path: {
                  entityType: { type: 'string', required: true, enum: ['issue', 'product', 'service-operation'] },
                  entityId: { type: 'string', required: true },
                },
              },
              responses: {
                200: { description: 'Comments list' },
                404: { description: 'Entity not found' },
              },
            },
            'POST /collaboration/comments': {
              description: 'Create new comment',
              parameters: {
                body: {
                  entityType: { type: 'string', required: true, enum: ['issue', 'product', 'service-operation'] },
                  entityId: { type: 'string', required: true },
                  content: { type: 'string', required: true },
                  mentions: { type: 'array', items: { type: 'string' } },
                },
              },
              responses: {
                201: { description: 'Comment created' },
                400: { description: 'Validation error' },
              },
            },
            'GET /collaboration/notifications': {
              description: 'Get user notifications',
              responses: {
                200: { description: 'Notifications list' },
              },
            },
            'GET /collaboration/notifications/unread-count': {
              description: 'Get unread notification count',
              responses: {
                200: { description: 'Unread count' },
              },
            },
          },
          backup: {
            'POST /backup/full': {
              description: 'Create full database backup',
              parameters: {
                body: {
                  options: {
                    includeUsers: { type: 'boolean', default: false },
                    includeAuditLogs: { type: 'boolean', default: false },
                    includePerformanceMetrics: { type: 'boolean', default: false },
                    compression: { type: 'boolean', default: true },
                  },
                },
              },
              responses: {
                200: { description: 'Backup created' },
                500: { description: 'Backup failed' },
              },
            },
            'GET /backup/list': {
              description: 'List all backups',
              responses: {
                200: { description: 'Backups list' },
              },
            },
            'DELETE /backup/:filename': {
              description: 'Delete backup file',
              parameters: {
                path: { filename: { type: 'string', required: true } },
              },
              responses: {
                200: { description: 'Backup deleted' },
                404: { description: 'Backup not found' },
              },
            },
          },
        },
      },
    },
    errorCodes: {
      400: 'Bad Request - Invalid parameters',
      401: 'Unauthorized - Authentication required',
      403: 'Forbidden - Insufficient permissions',
      404: 'Not Found - Resource not found',
      409: 'Conflict - Resource already exists',
      422: 'Unprocessable Entity - Validation error',
      500: 'Internal Server Error - Server error',
    },
    rateLimiting: {
      description: 'API requests are rate limited to prevent abuse',
      limits: {
        authenticated: '1000 requests per hour',
        unauthenticated: '100 requests per hour',
      },
      headers: {
        'X-RateLimit-Limit': 'Request limit per hour',
        'X-RateLimit-Remaining': 'Remaining requests',
        'X-RateLimit-Reset': 'Reset time (Unix timestamp)',
      },
    },
    webhooks: {
      description: 'Webhook support for real-time notifications',
      events: [
        'issue.created',
        'issue.updated',
        'issue.resolved',
        'product.status_changed',
        'service_operation.completed',
        'shipment.shipped',
        'shipment.delivered',
      ],
      authentication: 'HMAC-SHA256 signature verification',
    },
  };

  return c.json(documentation);
});

// API Version info endpoint
apiDocs.get('/versions', async (c) => {
  const versions = apiVersioningService.getAllVersions();
  
  return c.json({
    success: true,
    versions: versions.map(v => ({
      version: v.version,
      deprecated: v.deprecated,
      sunsetDate: v.sunsetDate,
      changelog: v.changelog,
      breakingChanges: v.breakingChanges,
    })),
  });
});

// Health check endpoint
apiDocs.get('/health', async (c) => {
  return c.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

export default apiDocs;
