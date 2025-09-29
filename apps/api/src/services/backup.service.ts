import { db } from '../db';
import { 
  products, 
  issues, 
  serviceOperations, 
  shipments, 
  companies, 
  users,
  comments,
  mentions,
  notifications,
  auditLogs,
  scheduledReports,
  performanceMetrics
} from '../db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { createWriteStream, createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createGzip } from 'zlib';

export interface BackupOptions {
  includeUsers?: boolean;
  includeAuditLogs?: boolean;
  includePerformanceMetrics?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  compression?: boolean;
}

export interface BackupResult {
  id: string;
  filename: string;
  size: number;
  createdAt: Date;
  tables: string[];
  recordCounts: Record<string, number>;
}

export class BackupService {
  private backupDir: string;

  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureBackupDirectory();
  }

  private ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Tam veritabanı yedeği oluşturur
   */
  async createFullBackup(options: BackupOptions = {}): Promise<BackupResult> {
    try {
      const backupId = `backup_${Date.now()}`;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${backupId}_${timestamp}.json`;
      const filepath = path.join(this.backupDir, filename);

      console.log('🔄 Starting full backup...');

      // Tüm tabloları yedekle
      const backupData = {
        metadata: {
          id: backupId,
          createdAt: new Date().toISOString(),
          version: '1.0.0',
          options,
        },
        tables: {} as Record<string, any[]>,
        recordCounts: {} as Record<string, number>,
      };

      // Ana tablolar
      const mainTables = [
        { name: 'products', table: products },
        { name: 'issues', table: issues },
        { name: 'serviceOperations', table: serviceOperations },
        { name: 'shipments', table: shipments },
        { name: 'companies', table: companies },
      ];

      for (const { name, table } of mainTables) {
        console.log(`📊 Backing up ${name}...`);
        const data = await db.select().from(table);
        backupData.tables[name] = data;
        backupData.recordCounts[name] = data.length;
      }

      // Kullanıcılar (opsiyonel)
      if (options.includeUsers) {
        console.log('👥 Backing up users...');
        const usersData = await db.select().from(users);
        backupData.tables.users = usersData;
        backupData.recordCounts.users = usersData.length;
      }

      // İşbirliği tabloları
      console.log('💬 Backing up collaboration data...');
      const commentsData = await db.select().from(comments);
      const mentionsData = await db.select().from(mentions);
      const notificationsData = await db.select().from(notifications);
      
      backupData.tables.comments = commentsData;
      backupData.tables.mentions = mentionsData;
      backupData.tables.notifications = notificationsData;
      backupData.recordCounts.comments = commentsData.length;
      backupData.recordCounts.mentions = mentionsData.length;
      backupData.recordCounts.notifications = notificationsData.length;

      // Audit logs (opsiyonel)
      if (options.includeAuditLogs) {
        console.log('📝 Backing up audit logs...');
        const auditData = await db.select().from(auditLogs);
        backupData.tables.auditLogs = auditData;
        backupData.recordCounts.auditLogs = auditData.length;
      }

      // Scheduled reports
      console.log('📅 Backing up scheduled reports...');
      const reportsData = await db.select().from(scheduledReports);
      backupData.tables.scheduledReports = reportsData;
      backupData.recordCounts.scheduledReports = reportsData.length;

      // Performance metrics (opsiyonel)
      if (options.includePerformanceMetrics) {
        console.log('📈 Backing up performance metrics...');
        const metricsData = await db.select().from(performanceMetrics);
        backupData.tables.performanceMetrics = metricsData;
        backupData.recordCounts.performanceMetrics = metricsData.length;
      }

      // Dosyaya yaz
      const jsonData = JSON.stringify(backupData, null, 2);
      
      if (options.compression) {
        const compressedFilename = filename.replace('.json', '.json.gz');
        const compressedFilepath = path.join(this.backupDir, compressedFilename);
        
        await pipeline(
          createReadStream(Buffer.from(jsonData)),
          createGzip(),
          createWriteStream(compressedFilepath)
        );
        
        const stats = fs.statSync(compressedFilepath);
        
        console.log('✅ Backup completed with compression');
        
        return {
          id: backupId,
          filename: compressedFilename,
          size: stats.size,
          createdAt: new Date(),
          tables: Object.keys(backupData.tables),
          recordCounts: backupData.recordCounts,
        };
      } else {
        fs.writeFileSync(filepath, jsonData);
        const stats = fs.statSync(filepath);
        
        console.log('✅ Backup completed');
        
        return {
          id: backupId,
          filename,
          size: stats.size,
          createdAt: new Date(),
          tables: Object.keys(backupData.tables),
          recordCounts: backupData.recordCounts,
        };
      }
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw new Error('Failed to create backup');
    }
  }

  /**
   * Belirli bir tablo için yedek oluşturur
   */
  async createTableBackup(tableName: string, options: BackupOptions = {}): Promise<BackupResult> {
    try {
      const backupId = `backup_${tableName}_${Date.now()}`;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${backupId}_${timestamp}.json`;
      const filepath = path.join(this.backupDir, filename);

      console.log(`🔄 Starting backup for table: ${tableName}`);

      // Tablo mapping
      const tableMap: Record<string, any> = {
        products,
        issues,
        serviceOperations,
        shipments,
        companies,
        users,
        comments,
        mentions,
        notifications,
        auditLogs,
        scheduledReports,
        performanceMetrics,
      };

      const table = tableMap[tableName];
      if (!table) {
        throw new Error(`Table ${tableName} not found`);
      }

      // Verileri çek
      const data = await db.select().from(table);
      
      const backupData = {
        metadata: {
          id: backupId,
          tableName,
          createdAt: new Date().toISOString(),
          version: '1.0.0',
          options,
        },
        data,
        recordCount: data.length,
      };

      // Dosyaya yaz
      const jsonData = JSON.stringify(backupData, null, 2);
      fs.writeFileSync(filepath, jsonData);
      const stats = fs.statSync(filepath);

      console.log(`✅ Table backup completed: ${tableName}`);

      return {
        id: backupId,
        filename,
        size: stats.size,
        createdAt: new Date(),
        tables: [tableName],
        recordCounts: { [tableName]: data.length },
      };
    } catch (error) {
      console.error(`❌ Table backup failed for ${tableName}:`, error);
      throw new Error(`Failed to create backup for table ${tableName}`);
    }
  }

  /**
   * Yedek dosyalarını listeler
   */
  async listBackups(): Promise<BackupResult[]> {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backups: BackupResult[] = [];

      for (const file of files) {
        if (file.endsWith('.json') || file.endsWith('.json.gz')) {
          const filepath = path.join(this.backupDir, file);
          const stats = fs.statSync(filepath);
          
          // Metadata'yı oku
          try {
            let content: string;
            if (file.endsWith('.json.gz')) {
              // Compressed file - sadece metadata için basit bir yaklaşım
              content = '{}'; // Bu kısım daha gelişmiş bir implementasyon gerektirir
            } else {
              content = fs.readFileSync(filepath, 'utf8');
            }
            
            const data = JSON.parse(content);
            const metadata = data.metadata || {};
            
            backups.push({
              id: metadata.id || file,
              filename: file,
              size: stats.size,
              createdAt: new Date(metadata.createdAt || stats.birthtime),
              tables: metadata.tables || [],
              recordCounts: metadata.recordCounts || {},
            });
          } catch (error) {
            // Metadata okunamazsa basit bilgilerle ekle
            backups.push({
              id: file,
              filename: file,
              size: stats.size,
              createdAt: new Date(stats.birthtime),
              tables: [],
              recordCounts: {},
            });
          }
        }
      }

      return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('❌ Failed to list backups:', error);
      throw new Error('Failed to list backups');
    }
  }

  /**
   * Yedek dosyasını siler
   */
  async deleteBackup(filename: string): Promise<void> {
    try {
      const filepath = path.join(this.backupDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log(`✅ Backup deleted: ${filename}`);
      } else {
        throw new Error(`Backup file not found: ${filename}`);
      }
    } catch (error) {
      console.error(`❌ Failed to delete backup ${filename}:`, error);
      throw new Error(`Failed to delete backup ${filename}`);
    }
  }

  /**
   * Eski yedekleri temizler
   */
  async cleanupOldBackups(keepDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - keepDays);
      
      const backups = await this.listBackups();
      let deletedCount = 0;

      for (const backup of backups) {
        if (backup.createdAt < cutoffDate) {
          await this.deleteBackup(backup.filename);
          deletedCount++;
        }
      }

      console.log(`✅ Cleaned up ${deletedCount} old backups`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Failed to cleanup old backups:', error);
      throw new Error('Failed to cleanup old backups');
    }
  }

  /**
   * Yedek dosyasının boyutunu hesaplar
   */
  async getBackupSize(filename: string): Promise<number> {
    try {
      const filepath = path.join(this.backupDir, filename);
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        return stats.size;
      } else {
        throw new Error(`Backup file not found: ${filename}`);
      }
    } catch (error) {
      console.error(`❌ Failed to get backup size for ${filename}:`, error);
      throw new Error(`Failed to get backup size for ${filename}`);
    }
  }
}

export const backupService = new BackupService();
