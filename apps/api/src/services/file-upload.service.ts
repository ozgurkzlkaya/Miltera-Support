import { db } from '../db';
import { fileAttachments } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// Cloudinary konfigürasyonu
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface FileUploadOptions {
  entityType: 'issue' | 'product' | 'shipment' | 'service_operation';
  entityId: string;
  uploadedBy: string;
  description?: string;
  tags?: string[];
  useCloudinary?: boolean;
  resizeImage?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export interface FileInfo {
  fileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  fileType: string;
  buffer: Buffer;
}

export class FileUploadService {
  private uploadsDir = join(process.cwd(), 'uploads');
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
  ];

  constructor() {
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory() {
    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Dosya türünü belirler
   */
  private getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
    return 'other';
  }

  /**
   * Dosya validasyonu yapar
   */
  private validateFile(fileInfo: FileInfo): void {
    if (fileInfo.fileSize > this.maxFileSize) {
      throw new Error(`Dosya boyutu çok büyük. Maksimum ${this.maxFileSize / (1024 * 1024)}MB olmalıdır.`);
    }

    if (!this.allowedMimeTypes.includes(fileInfo.mimeType)) {
      throw new Error('Desteklenmeyen dosya türü.');
    }
  }

  /**
   * Dosyayı local storage'a kaydeder
   */
  private async saveToLocalStorage(fileInfo: FileInfo, entityType: string, entityId: string): Promise<string> {
    const entityDir = join(this.uploadsDir, entityType, entityId);
    if (!existsSync(entityDir)) {
      mkdirSync(entityDir, { recursive: true });
    }

    const filePath = join(entityDir, fileInfo.fileName);
    const writeStream = createWriteStream(filePath);
    
    await pipeline(Readable.from(fileInfo.buffer), writeStream);
    
    return filePath;
  }

  /**
   * Resim dosyasını yeniden boyutlandırır
   */
  private async resizeImage(buffer: Buffer, maxWidth: number = 1920, maxHeight: number = 1080): Promise<Buffer> {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    if (metadata.width && metadata.height) {
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        return await image
          .resize(maxWidth, maxHeight, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .jpeg({ quality: 85 })
          .toBuffer();
      }
    }
    
    return buffer;
  }

  /**
   * Dosyayı Cloudinary'ye yükler
   */
  private async uploadToCloudinary(fileInfo: FileInfo, entityType: string, entityId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `fixlog/${entityType}/${entityId}`,
          resource_type: 'auto',
          transformation: fileInfo.fileType === 'image' ? [
            { width: 1920, height: 1080, crop: 'limit' },
            { quality: 'auto:good' }
          ] : undefined
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result!.secure_url);
          }
        }
      );

      uploadStream.end(fileInfo.buffer);
    });
  }

  /**
   * Dosya yükler
   */
  async uploadFile(fileInfo: FileInfo, options: FileUploadOptions) {
    try {
      // Dosya validasyonu
      this.validateFile(fileInfo);

      // Resim dosyalarını yeniden boyutlandır
      let processedBuffer = fileInfo.buffer;
      if (options.resizeImage && fileInfo.fileType === 'image') {
        processedBuffer = await this.resizeImage(
          fileInfo.buffer, 
          options.maxWidth || 1920, 
          options.maxHeight || 1080
        );
        fileInfo.fileSize = processedBuffer.length;
      }

      // Local storage'a kaydet
      const localFilePath = await this.saveToLocalStorage(fileInfo, options.entityType, options.entityId);

      // Cloudinary'ye yükle (opsiyonel)
      let cloudinaryUrl: string | null = null;
      if (options.useCloudinary && process.env.CLOUDINARY_CLOUD_NAME) {
        try {
          cloudinaryUrl = await this.uploadToCloudinary(fileInfo, options.entityType, options.entityId);
        } catch (error) {
          console.error('Cloudinary upload failed:', error);
          // Cloudinary başarısız olsa bile local storage'da devam et
        }
      }

      // Veritabanına kaydet
      const attachment = await db.insert(fileAttachments).values({
        fileName: fileInfo.fileName,
        originalFileName: fileInfo.originalFileName,
        filePath: localFilePath,
        fileUrl: cloudinaryUrl,
        mimeType: fileInfo.mimeType,
        fileSize: fileInfo.fileSize,
        fileType: fileInfo.fileType,
        entityType: options.entityType,
        entityId: options.entityId,
        uploadedBy: options.uploadedBy,
        description: options.description,
        tags: options.tags || [],
      }).returning();

      return attachment[0];
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Entity'ye ait dosyaları getirir
   */
  async getAttachmentsByEntity(entityType: string, entityId: string) {
    return await db
      .select()
      .from(fileAttachments)
      .where(
        and(
          eq(fileAttachments.entityType, entityType),
          eq(fileAttachments.entityId, entityId)
        )
      )
      .orderBy(fileAttachments.createdAt);
  }

  /**
   * Dosya ekini getirir
   */
  async getAttachmentById(attachmentId: string) {
    const result = await db
      .select()
      .from(fileAttachments)
      .where(eq(fileAttachments.id, attachmentId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Dosya ekini siler
   */
  async deleteAttachment(attachmentId: string, userId: string) {
    const attachment = await this.getAttachmentById(attachmentId);
    if (!attachment) {
      throw new Error('Dosya eki bulunamadı.');
    }

    // Sadece yükleyen kullanıcı veya admin silebilir
    // TODO: Admin kontrolü eklenebilir

    // Local dosyayı sil
    try {
      const fs = await import('fs/promises');
      await fs.unlink(attachment.filePath);
    } catch (error) {
      console.error('Local file deletion failed:', error);
    }

    // Cloudinary'den sil
    if (attachment.fileUrl && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const publicId = this.extractPublicIdFromUrl(attachment.fileUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (error) {
        console.error('Cloudinary deletion failed:', error);
      }
    }

    // Veritabanından sil
    await db
      .delete(fileAttachments)
      .where(eq(fileAttachments.id, attachmentId));

    return { success: true };
  }

  /**
   * Cloudinary URL'den public ID çıkarır
   */
  private extractPublicIdFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
        const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
        return publicIdWithExtension.split('.')[0]; // Extension'ı kaldır
      }
    } catch (error) {
      console.error('Error extracting public ID:', error);
    }
    return null;
  }

  /**
   * Dosya istatistiklerini getirir
   */
  async getFileStats() {
    const stats = await db
      .select({
        totalFiles: db.select({ count: fileAttachments.id }).from(fileAttachments),
        totalSize: db.select({ sum: fileAttachments.fileSize }).from(fileAttachments),
        byType: db.select({ 
          fileType: fileAttachments.fileType,
          count: fileAttachments.id 
        }).from(fileAttachments).groupBy(fileAttachments.fileType),
      })
      .from(fileAttachments);

    return stats;
  }
}

export const fileUploadService = new FileUploadService();
