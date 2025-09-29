import * as cron from 'node-cron';
import { db } from '../db';
import { scheduledReports } from '../db/schema';
import { eq, and, lte, gte } from 'drizzle-orm';
import { EmailService } from './email.service';
import { smsService } from './sms.service';

export interface ScheduledReportConfig {
  id?: string;
  name: string;
  description?: string;
  reportType: 'issues' | 'products' | 'service_operations' | 'shipments' | 'companies' | 'users' | 'custom';
  schedule: string; // Cron expression
  format: 'pdf' | 'excel' | 'csv';
  recipients: string[]; // Email addresses
  smsRecipients?: string[]; // Phone numbers
  filters?: Record<string, any>;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ScheduledReportsService {
  private static instance: ScheduledReportsService;
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  static getInstance(): ScheduledReportsService {
    if (!ScheduledReportsService.instance) {
      ScheduledReportsService.instance = new ScheduledReportsService();
    }
    return ScheduledReportsService.instance;
  }

  /**
   * Initialize scheduled reports service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔄 Initializing scheduled reports service...');
      
      // Load active scheduled reports from database
      const activeReports = await this.getActiveReports();
      
      // Schedule each report
      for (const report of activeReports) {
        await this.scheduleReport(report);
      }
      
      console.log(`✅ Scheduled ${activeReports.length} reports`);
    } catch (error) {
      console.error('❌ Error initializing scheduled reports service:', error);
    }
  }

  /**
   * Create a new scheduled report
   */
  async createScheduledReport(config: ScheduledReportConfig): Promise<ScheduledReportConfig> {
    try {
      const reportData = {
        id: crypto.randomUUID(),
        name: config.name,
        description: config.description,
        reportType: config.reportType,
        schedule: config.schedule,
        format: config.format,
        recipients: JSON.stringify(config.recipients),
        smsRecipients: config.smsRecipients ? JSON.stringify(config.smsRecipients) : null,
        filters: config.filters ? JSON.stringify(config.filters) : null,
        isActive: config.isActive,
        nextRun: this.calculateNextRun(config.schedule),
        createdBy: config.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.insert(scheduledReports).values(reportData).returning();
      const newReport = result[0];

      // Schedule the report if it's active
      if (config.isActive) {
        await this.scheduleReport(newReport);
      }

      return this.mapToConfig(newReport);
    } catch (error) {
      console.error('Error creating scheduled report:', error);
      throw error;
    }
  }

  /**
   * Update a scheduled report
   */
  async updateScheduledReport(id: string, config: Partial<ScheduledReportConfig>): Promise<ScheduledReportConfig> {
    try {
      // Stop existing task
      this.stopReport(id);

      const updateData: any = {
        ...config,
        updatedAt: new Date(),
      };

      if (config.schedule) {
        updateData.nextRun = this.calculateNextRun(config.schedule);
      }

      if (config.recipients) {
        updateData.recipients = JSON.stringify(config.recipients);
      }

      if (config.smsRecipients) {
        updateData.smsRecipients = JSON.stringify(config.smsRecipients);
      }

      if (config.filters) {
        updateData.filters = JSON.stringify(config.filters);
      }

      const result = await db
        .update(scheduledReports)
        .set(updateData)
        .where(eq(scheduledReports.id, id))
        .returning();

      const updatedReport = result[0];

      // Schedule the report if it's active
      if (updatedReport.isActive) {
        await this.scheduleReport(updatedReport);
      }

      return this.mapToConfig(updatedReport);
    } catch (error) {
      console.error('Error updating scheduled report:', error);
      throw error;
    }
  }

  /**
   * Delete a scheduled report
   */
  async deleteScheduledReport(id: string): Promise<void> {
    try {
      // Stop the task
      this.stopReport(id);

      // Delete from database
      await db.delete(scheduledReports).where(eq(scheduledReports.id, id));
    } catch (error) {
      console.error('Error deleting scheduled report:', error);
      throw error;
    }
  }

  /**
   * Get all scheduled reports
   */
  async getScheduledReports(): Promise<ScheduledReportConfig[]> {
    try {
      const reports = await db.select().from(scheduledReports).orderBy(scheduledReports.createdAt);
      return reports.map(report => this.mapToConfig(report));
    } catch (error) {
      console.error('Error getting scheduled reports:', error);
      throw error;
    }
  }

  /**
   * Get active scheduled reports
   */
  async getActiveReports(): Promise<any[]> {
    try {
      return await db
        .select()
        .from(scheduledReports)
        .where(eq(scheduledReports.isActive, true));
    } catch (error) {
      console.error('Error getting active reports:', error);
      return [];
    }
  }

  /**
   * Schedule a report
   */
  private async scheduleReport(report: any): Promise<void> {
    try {
      // Validate cron expression
      if (!cron.validate(report.schedule)) {
        console.error(`Invalid cron expression for report ${report.id}: ${report.schedule}`);
        return;
      }

      // Stop existing task if any
      this.stopReport(report.id);

      // Create new task
      const task = cron.schedule(report.schedule, async () => {
        await this.executeReport(report);
      }, {
        scheduled: true,
        timezone: 'Europe/Istanbul',
      });

      this.tasks.set(report.id, task);
      console.log(`📅 Scheduled report: ${report.name} (${report.schedule})`);
    } catch (error) {
      console.error(`Error scheduling report ${report.id}:`, error);
    }
  }

  /**
   * Stop a scheduled report
   */
  private stopReport(id: string): void {
    const task = this.tasks.get(id);
    if (task) {
      task.stop();
      this.tasks.delete(id);
      console.log(`⏹️ Stopped scheduled report: ${id}`);
    }
  }

  /**
   * Execute a scheduled report
   */
  private async executeReport(report: any): Promise<void> {
    try {
      console.log(`🔄 Executing scheduled report: ${report.name}`);

      // Update last run time
      await db
        .update(scheduledReports)
        .set({
          lastRun: new Date(),
          nextRun: this.calculateNextRun(report.schedule),
        })
        .where(eq(scheduledReports.id, report.id));

      // Generate report data
      const reportData = await this.generateReportData(report);

      // Generate file
      const fileName = `${report.name}-${new Date().toISOString().split('T')[0]}`;
      let fileBuffer: Buffer;

      switch (report.format) {
        case 'pdf':
          fileBuffer = await this.generatePDF(reportData, fileName);
          break;
        case 'excel':
          fileBuffer = await this.generateExcel(reportData, fileName);
          break;
        case 'csv':
          fileBuffer = await this.generateCSV(reportData, fileName);
          break;
        default:
          throw new Error(`Unsupported format: ${report.format}`);
      }

      // Send via email
      const recipients = JSON.parse(report.recipients);
      if (recipients.length > 0) {
        await this.sendReportViaEmail(recipients, report.name, fileBuffer, report.format, fileName);
      }

      // Send via SMS if configured
      const smsRecipients = report.smsRecipients ? JSON.parse(report.smsRecipients) : [];
      if (smsRecipients.length > 0) {
        await this.sendReportViaSMS(smsRecipients, report.name);
      }

      console.log(`✅ Scheduled report executed successfully: ${report.name}`);
    } catch (error) {
      console.error(`❌ Error executing scheduled report ${report.name}:`, error);
    }
  }

  /**
   * Generate report data based on type
   */
  private async generateReportData(report: any): Promise<any[]> {
    const filters = report.filters ? JSON.parse(report.filters) : {};
    
    switch (report.reportType) {
      case 'issues':
        return await this.getIssuesData(filters);
      case 'products':
        return await this.getProductsData(filters);
      case 'service_operations':
        return await this.getServiceOperationsData(filters);
      case 'shipments':
        return await this.getShipmentsData(filters);
      case 'companies':
        return await this.getCompaniesData(filters);
      case 'users':
        return await this.getUsersData(filters);
      default:
        return [];
    }
  }

  /**
   * Get issues data
   */
  private async getIssuesData(filters: any): Promise<any[]> {
    const { issues } = await import('../db/schema');
    let query = db.select().from(issues);
    
    // Apply filters
    if (filters.status) {
      query = query.where(eq(issues.status, filters.status));
    }
    
    if (filters.priority) {
      query = query.where(eq(issues.priority, filters.priority));
    }
    
    if (filters.dateFrom) {
      query = query.where(gte(issues.reportedAt, new Date(filters.dateFrom)));
    }
    
    if (filters.dateTo) {
      query = query.where(lte(issues.reportedAt, new Date(filters.dateTo)));
    }
    
    const result = await query;
    return result;
  }

  /**
   * Get products data
   */
  private async getProductsData(filters: any): Promise<any[]> {
    const { products } = await import('../db/schema');
    let query = db.select().from(products);
    
    if (filters.status) {
      query = query.where(eq(products.currentStatus, filters.status));
    }
    
    const result = await query;
    return result;
  }

  /**
   * Get service operations data
   */
  private async getServiceOperationsData(filters: any): Promise<any[]> {
    const { serviceOperations } = await import('../db/schema');
    let query = db.select().from(serviceOperations);
    
    if (filters.operationType) {
      query = query.where(eq(serviceOperations.operationType, filters.operationType));
    }
    
    if (filters.status) {
      query = query.where(eq(serviceOperations.status, filters.status));
    }
    
    const result = await query;
    return result;
  }

  /**
   * Get shipments data
   */
  private async getShipmentsData(filters: any): Promise<any[]> {
    const { shipments } = await import('../db/schema');
    let query = db.select().from(shipments);
    
    if (filters.status) {
      query = query.where(eq(shipments.status, filters.status));
    }
    
    const result = await query;
    return result;
  }

  /**
   * Get companies data
   */
  private async getCompaniesData(filters: any): Promise<any[]> {
    const { companies } = await import('../db/schema');
    const result = await db.select().from(companies);
    return result;
  }

  /**
   * Get users data
   */
  private async getUsersData(filters: any): Promise<any[]> {
    const { users } = await import('../db/schema');
    let query = db.select().from(users);
    
    if (filters.role) {
      query = query.where(eq(users.role, filters.role));
    }
    
    const result = await query;
    return result;
  }

  /**
   * Generate PDF report
   */
  private async generatePDF(data: any[], fileName: string): Promise<Buffer> {
    // Gerçek PDF oluşturma - şimdilik basit text buffer döndür
    const content = data.map(item => JSON.stringify(item)).join('\n');
    return Buffer.from(content, 'utf-8');
  }

  /**
   * Generate Excel report
   */
  private async generateExcel(data: any[], fileName: string): Promise<Buffer> {
    // Gerçek Excel oluşturma - şimdilik CSV format döndür
    if (data.length === 0) return Buffer.from('');
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    const csvContent = [headers, ...rows].join('\n');
    return Buffer.from(csvContent, 'utf-8');
  }

  /**
   * Generate CSV report
   */
  private async generateCSV(data: any[], fileName: string): Promise<Buffer> {
    // Gerçek CSV oluşturma
    if (data.length === 0) return Buffer.from('');
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    const csvContent = [headers, ...rows].join('\n');
    return Buffer.from(csvContent, 'utf-8');
  }

  /**
   * Send report via email
   */
  private async sendReportViaEmail(
    recipients: string[],
    reportName: string,
    fileBuffer: Buffer,
    format: string,
    fileName: string
  ): Promise<void> {
    try {
      const subject = `Otomatik Rapor: ${reportName}`;
      const body = `
Merhaba,

${reportName} raporu otomatik olarak oluşturulmuştur.

Rapor Detayları:
- Rapor Adı: ${reportName}
- Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}
- Format: ${format.toUpperCase()}

Rapor ekte bulunmaktadır.

Miltera Teknik Servis
      `.trim();

      // Send email with attachment
      const emailService = new EmailService();
      await emailService.sendEmail(recipients, subject, body);
      console.log(`📧 Report sent via email to: ${recipients.join(', ')}`);
    } catch (error) {
      console.error('Error sending report via email:', error);
    }
  }

  /**
   * Send report via SMS
   */
  private async sendReportViaSMS(recipients: string[], reportName: string): Promise<void> {
    try {
      const message = `${reportName} raporu oluşturuldu ve e-posta ile gönderildi.`;
      
      for (const recipient of recipients) {
        await smsService.sendSMS({
          to: recipient,
          message,
        });
      }
      
      console.log(`📱 Report notification sent via SMS to: ${recipients.join(', ')}`);
    } catch (error) {
      console.error('Error sending report via SMS:', error);
    }
  }

  /**
   * Calculate next run time
   */
  private calculateNextRun(schedule: string): Date {
    // This is a simplified calculation
    // In a real implementation, you'd use a proper cron parser
    const now = new Date();
    const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Next day
    return nextRun;
  }

  /**
   * Map database record to config
   */
  private mapToConfig(record: any): ScheduledReportConfig {
    return {
      id: record.id,
      name: record.name,
      description: record.description,
      reportType: record.reportType,
      schedule: record.schedule,
      format: record.format,
      recipients: JSON.parse(record.recipients),
      smsRecipients: record.smsRecipients ? JSON.parse(record.smsRecipients) : [],
      filters: record.filters ? JSON.parse(record.filters) : {},
      isActive: record.isActive,
      lastRun: record.lastRun,
      nextRun: record.nextRun,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  /**
   * Get service status
   */
  getStatus(): { active: boolean; taskCount: number } {
    return {
      active: this.tasks.size > 0,
      taskCount: this.tasks.size,
    };
  }

  /**
   * Stop all scheduled reports
   */
  stopAll(): void {
    for (const [id, task] of this.tasks) {
      task.stop();
    }
    this.tasks.clear();
    console.log('⏹️ All scheduled reports stopped');
  }
}

// Export singleton instance
export const scheduledReportsService = ScheduledReportsService.getInstance();
export default scheduledReportsService;
