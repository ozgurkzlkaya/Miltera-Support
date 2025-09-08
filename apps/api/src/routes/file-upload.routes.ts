import { createRouter } from "../lib/hono";
import type { HonoEnv } from "../config/env";
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { authMiddleware } from "../helpers/auth.helpers";
import { buildResponseSuccessSchema } from "../helpers/response.helpers";
import { Error404Schema, Error500Schema } from "../dtos/base.schema";
import { fileUploadMiddleware, handleFileUpload } from "../lib/upload";
import { fileUploadService } from "../services/file-upload.service";
import { getAuth } from "../lib/auth";

// File attachment schema
const FileAttachmentSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string(),
  originalFileName: z.string(),
  filePath: z.string(),
  fileUrl: z.string().nullable(),
  mimeType: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  entityType: z.string(),
  entityId: z.string().uuid(),
  uploadedBy: z.string().uuid(),
  description: z.string().nullable(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Upload files route
const uploadFilesRoute = createRoute({
  method: 'post',
  path: '/upload/{entityType}/{entityId}',
  request: {
    params: z.object({
      entityType: z.enum(['issue', 'product', 'shipment', 'service_operation']),
      entityId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(z.object({
            files: z.array(FileAttachmentSchema),
            message: z.string(),
          })),
        },
      },
      description: 'Files uploaded successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: Error404Schema,
        },
      },
      description: 'Invalid request',
    },
    401: {
      content: {
        'application/json': {
          schema: Error404Schema,
        },
      },
      description: 'Unauthorized',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
  tags: ['File Upload'],
  summary: 'Upload files for an entity',
  description: 'Upload files (images, documents, etc.) for a specific entity (issue, product, shipment, service operation)',
});

// Get attachments route
const getAttachmentsRoute = createRoute({
  method: 'get',
  path: '/attachments/{entityType}/{entityId}',
  request: {
    params: z.object({
      entityType: z.enum(['issue', 'product', 'shipment', 'service_operation']),
      entityId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(z.object({
            attachments: z.array(FileAttachmentSchema),
          })),
        },
      },
      description: 'Attachments retrieved successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
  tags: ['File Upload'],
  summary: 'Get attachments for an entity',
  description: 'Get all file attachments for a specific entity',
});

// Delete attachment route
const deleteAttachmentRoute = createRoute({
  method: 'delete',
  path: '/attachments/{attachmentId}',
  request: {
    params: z.object({
      attachmentId: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(z.object({
            message: z.string(),
          })),
        },
      },
      description: 'Attachment deleted successfully',
    },
    404: {
      content: {
        'application/json': {
          schema: Error404Schema,
        },
      },
      description: 'Attachment not found',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
  tags: ['File Upload'],
  summary: 'Delete an attachment',
  description: 'Delete a specific file attachment',
});

// Get file stats route
const getFileStatsRoute = createRoute({
  method: 'get',
  path: '/stats',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: buildResponseSuccessSchema(z.object({
            totalFiles: z.number(),
            totalSize: z.number(),
            byType: z.array(z.object({
              fileType: z.string(),
              count: z.number(),
            })),
          })),
        },
      },
      description: 'File statistics retrieved successfully',
    },
    500: {
      content: {
        'application/json': {
          schema: Error500Schema,
        },
      },
      description: 'Internal server error',
    },
  },
  tags: ['File Upload'],
  summary: 'Get file upload statistics',
  description: 'Get statistics about uploaded files',
});

const fileUploadRouter = createRouter<HonoEnv>()
  .use('*', authMiddleware)
  .openapi(uploadFilesRoute, async (c) => {
    try {
      const auth = await getAuth(c);
      if (!auth.isAuthenticated) {
        return c.json({ success: false, error: { message: 'Unauthorized' } }, 401);
      }

      const { entityType, entityId } = c.req.valid('param');

      // Dosya yükleme işlemini gerçekleştir
      const result = await handleFileUpload(c, entityType, entityId, auth.user.id, {
        useCloudinary: true,
        resizeImage: true,
      });

      if (!result.success) {
        return c.json(result, 400);
      }

      return c.json({
        success: true,
        data: {
          files: result.data,
          message: result.message,
        },
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      return c.json({ success: false, error: { message: 'Internal server error' } }, 500);
    }
  })
  .openapi(getAttachmentsRoute, async (c) => {
    try {
      const { entityType, entityId } = c.req.valid('param');

      const attachments = await fileUploadService.getAttachmentsByEntity(entityType, entityId);

      return c.json({
        success: true,
        data: {
          attachments,
        },
      });
    } catch (error) {
      console.error('Error getting attachments:', error);
      return c.json({ success: false, error: { message: 'Internal server error' } }, 500);
    }
  })
  .openapi(deleteAttachmentRoute, async (c) => {
    try {
      const auth = await getAuth(c);
      if (!auth.isAuthenticated) {
        return c.json({ success: false, error: { message: 'Unauthorized' } }, 401);
      }

      const { attachmentId } = c.req.valid('param');

      await fileUploadService.deleteAttachment(attachmentId, auth.user.id);

      return c.json({
        success: true,
        data: {
          message: 'Dosya eki başarıyla silindi.',
        },
      });
    } catch (error) {
      console.error('Error deleting attachment:', error);
      if (error instanceof Error && error.message.includes('bulunamadı')) {
        return c.json({ success: false, error: { message: 'Dosya eki bulunamadı.' } }, 404);
      }
      return c.json({ success: false, error: { message: 'Internal server error' } }, 500);
    }
  })
  .openapi(getFileStatsRoute, async (c) => {
    try {
      const auth = await getAuth(c);
      if (!auth.isAuthenticated) {
        return c.json({ success: false, error: { message: 'Unauthorized' } }, 401);
      }

      // Sadece admin ve TSP kullanıcıları istatistikleri görebilir
      if (auth.user.role !== 'ADMIN' && auth.user.role !== 'TSP') {
        return c.json({ success: false, error: { message: 'Forbidden' } }, 403);
      }

      const stats = await fileUploadService.getFileStats();

      return c.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error getting file stats:', error);
      return c.json({ success: false, error: { message: 'Internal server error' } }, 500);
    }
  });

export default fileUploadRouter;
