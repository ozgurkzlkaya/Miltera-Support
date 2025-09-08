import { Context, Next } from 'hono';
import { FileUploadService, FileInfo } from '../services/file-upload.service';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

export interface FileUploadMiddlewareOptions {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  maxFiles?: number;
}

/**
 * Hono için dosya yükleme middleware'i
 */
export const fileUploadMiddleware = (options: FileUploadMiddlewareOptions = {}) => {
  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB
    allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv',
      'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
    ],
    maxFiles = 10
  } = options;

  return async (c: Context, next: Next) => {
    try {
      const contentType = c.req.header('content-type') || '';
      
      if (!contentType.includes('multipart/form-data')) {
        return next();
      }

      const formData = await c.req.formData();
      const files: UploadedFile[] = [];
      const fields: Record<string, any> = {};

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          // Dosya validasyonu
          if (files.length >= maxFiles) {
            return c.json({ 
              success: false, 
              error: { message: `Maksimum ${maxFiles} dosya yüklenebilir.` } 
            }, 400);
          }

          if (value.size > maxFileSize) {
            return c.json({ 
              success: false, 
              error: { message: `Dosya boyutu çok büyük. Maksimum ${maxFileSize / (1024 * 1024)}MB olmalıdır.` } 
            }, 400);
          }

          if (!allowedMimeTypes.includes(value.type)) {
            return c.json({ 
              success: false, 
              error: { message: 'Desteklenmeyen dosya türü.' } 
            }, 400);
          }

          const buffer = await value.arrayBuffer();
          const uploadedFile: UploadedFile = {
            fieldname: key,
            originalname: value.name,
            encoding: '7bit',
            mimetype: value.type,
            size: value.size,
            buffer: Buffer.from(buffer)
          };

          files.push(uploadedFile);
        } else {
          // Form alanları
          fields[key] = value;
        }
      }

      // Context'e dosyaları ve alanları ekle
      c.set('uploadedFiles', files);
      c.set('formFields', fields);

      await next();
    } catch (error) {
      console.error('File upload middleware error:', error);
      return c.json({ 
        success: false, 
        error: { message: 'Dosya yükleme hatası.' } 
      }, 500);
    }
  };
};

/**
 * Dosya bilgilerini FileInfo formatına dönüştürür
 */
export const convertToFileInfo = (uploadedFile: UploadedFile): FileInfo => {
  const fileUploadService = new FileUploadService();
  const fileType = fileUploadService['getFileType'](uploadedFile.mimetype);
  
  return {
    fileName: `${Date.now()}-${uploadedFile.originalname}`,
    originalFileName: uploadedFile.originalname,
    mimeType: uploadedFile.mimetype,
    fileSize: uploadedFile.size,
    fileType,
    buffer: uploadedFile.buffer
  };
};

/**
 * Dosya yükleme helper fonksiyonu
 */
export const handleFileUpload = async (
  c: Context,
  entityType: string,
  entityId: string,
  uploadedBy: string,
  options: {
    description?: string;
    tags?: string[];
    useCloudinary?: boolean;
    resizeImage?: boolean;
  } = {}
) => {
  const files = c.get('uploadedFiles') as UploadedFile[];
  const formFields = c.get('formFields') as Record<string, any>;

  if (!files || files.length === 0) {
    return c.json({ 
      success: false, 
      error: { message: 'Dosya bulunamadı.' } 
    }, 400);
  }

  const fileUploadService = new FileUploadService();
  const uploadedFiles = [];

  for (const uploadedFile of files) {
    try {
      const fileInfo = convertToFileInfo(uploadedFile);
      const attachment = await fileUploadService.uploadFile(fileInfo, {
        entityType: entityType as any,
        entityId,
        uploadedBy,
        description: options.description || formFields.description,
        tags: options.tags || (formFields.tags ? JSON.parse(formFields.tags) : []),
        useCloudinary: options.useCloudinary,
        resizeImage: options.resizeImage,
      });

      uploadedFiles.push(attachment);
    } catch (error) {
      console.error('File upload error:', error);
      return c.json({ 
        success: false, 
        error: { message: error instanceof Error ? error.message : 'Dosya yükleme hatası.' } 
      }, 500);
    }
  }

  return {
    success: true,
    data: uploadedFiles,
    message: `${uploadedFiles.length} dosya başarıyla yüklendi.`
  };
};
