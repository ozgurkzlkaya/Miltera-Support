import twilio from 'twilio';

export interface SMSData {
  to: string;
  message: string;
  from?: string;
  mediaUrl?: string[];
  statusCallback?: string;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: string;
}

export class SMSService {
  private client: twilio.Twilio | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeTwilio();
  }

  private initializeTwilio() {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

      if (accountSid && authToken && phoneNumber) {
        this.client = twilio(accountSid, authToken);
        this.isInitialized = true;
        console.log('✅ Twilio SMS service initialized successfully');
      } else {
        console.warn('⚠️ Twilio credentials not found, SMS service will use console mode');
      }
    } catch (error) {
      console.error('❌ Twilio initialization failed:', error);
    }
  }

  /**
   * Send SMS message
   */
  async sendSMS(data: SMSData): Promise<SMSResponse> {
    try {
      if (this.isInitialized && this.client) {
        // Send real SMS via Twilio
        const message = await this.client.messages.create({
          body: data.message,
          from: data.from || process.env.TWILIO_PHONE_NUMBER,
          to: data.to,
          mediaUrl: data.mediaUrl,
          statusCallback: data.statusCallback,
        });

        console.log('✅ SMS sent via Twilio:', message.sid);
        
        return {
          success: true,
          messageId: message.sid,
          cost: message.price,
        };
      } else {
        // Fallback: Console mode
        console.log('=== SMS GÖNDERİLİYOR (Console Mode) ===');
        console.log('Kime:', data.to);
        console.log('Mesaj:', data.message);
        console.log('Gönderen:', data.from || process.env.TWILIO_PHONE_NUMBER || 'SMS Service');
        console.log('=====================================');
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          success: true,
          messageId: `console_${Date.now()}`,
        };
      }
    } catch (error) {
      console.error('❌ SMS gönderme hatası:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulkSMS(recipients: string[], message: string, from?: string): Promise<SMSResponse[]> {
    const results: SMSResponse[] = [];
    
    for (const recipient of recipients) {
      const result = await this.sendSMS({
        to: recipient,
        message,
        from,
      });
      results.push(result);
      
      // Add delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  /**
   * Send SMS to user by ID
   */
  async sendSMSToUser(userId: string, message: string): Promise<SMSResponse> {
    try {
      // Get user phone number from database
      const { db } = await import('../db');
      const { users } = await import('../db/schema');
      const { eq } = await import('drizzle-orm');
      
      const user = await db.select({ phone: users.phone }).from(users).where(eq(users.id, userId)).limit(1);
      
      if (user.length === 0 || !user[0].phone) {
        return {
          success: false,
          error: 'User not found or phone number not available',
        };
      }
      
      return await this.sendSMS({
        to: user[0].phone,
        message,
      });
    } catch (error) {
      console.error('Error sending SMS to user:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Send SMS to users by role
   */
  async sendSMSToRole(role: string, message: string): Promise<SMSResponse[]> {
    try {
      // Get users with phone numbers by role
      const { db } = await import('../db');
      const { users } = await import('../db/schema');
      const { eq, and, isNotNull } = await import('drizzle-orm');
      
      const usersWithPhone = await db
        .select({ phone: users.phone })
        .from(users)
        .where(
          and(
            eq(users.role, role),
            isNotNull(users.phone)
          )
        );
      
      const phoneNumbers = usersWithPhone
        .map(user => user.phone)
        .filter(phone => phone && phone.trim() !== '');
      
      if (phoneNumbers.length === 0) {
        return [{
          success: false,
          error: 'No users with phone numbers found for this role',
        }];
      }
      
      return await this.sendBulkSMS(phoneNumbers as string[], message);
    } catch (error) {
      console.error('Error sending SMS to role:', error);
      return [{
        success: false,
        error: (error as Error).message,
      }];
    }
  }

  /**
   * Send issue notification SMS
   */
  async sendIssueNotificationSMS(issueId: string, issueNumber: string, priority: string): Promise<SMSResponse> {
    const message = `Yeni arıza bildirimi: ${issueNumber}\nÖncelik: ${priority}\nDetaylar için sisteme giriş yapın.`;
    
    // Get assigned TSP phone number
    try {
      const { db } = await import('../db');
      const { issues, users } = await import('../db/schema');
      const { eq } = await import('drizzle-orm');
      
      const issue = await db
        .select({
          assignedTo: issues.assignedTo,
          phone: users.phone,
        })
        .from(issues)
        .leftJoin(users, eq(issues.assignedTo, users.id))
        .where(eq(issues.id, issueId))
        .limit(1);
      
      if (issue.length === 0 || !issue[0].phone) {
        return {
          success: false,
          error: 'Assigned technician not found or phone number not available',
        };
      }
      
      return await this.sendSMS({
        to: issue[0].phone,
        message,
      });
    } catch (error) {
      console.error('Error sending issue notification SMS:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Send service completion SMS
   */
  async sendServiceCompletionSMS(serviceOperationId: string, customerPhone: string): Promise<SMSResponse> {
    const message = `Servis operasyonunuz tamamlandı. Detaylar için sisteme giriş yapabilirsiniz.`;
    
    return await this.sendSMS({
      to: customerPhone,
      message,
    });
  }

  /**
   * Send shipment notification SMS
   */
  async sendShipmentNotificationSMS(shipmentId: string, trackingNumber: string, customerPhone: string): Promise<SMSResponse> {
    const message = `Sevkiyatınız yola çıktı. Takip numarası: ${trackingNumber}\nDetaylar için sisteme giriş yapın.`;
    
    return await this.sendSMS({
      to: customerPhone,
      message,
    });
  }

  /**
   * Send system alert SMS
   */
  async sendSystemAlertSMS(alertMessage: string, adminPhones: string[]): Promise<SMSResponse[]> {
    const message = `Sistem Uyarısı: ${alertMessage}`;
    
    return await this.sendBulkSMS(adminPhones, message);
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): boolean {
    // Basic phone number validation (can be enhanced)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Format phone number
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present (assuming Turkey +90)
    if (cleaned.length === 10 && cleaned.startsWith('5')) {
      return `+90${cleaned}`;
    }
    
    if (cleaned.length === 11 && cleaned.startsWith('05')) {
      return `+90${cleaned.substring(1)}`;
    }
    
    if (cleaned.length === 13 && cleaned.startsWith('90')) {
      return `+${cleaned}`;
    }
    
    return phone; // Return as is if format is unclear
  }

  /**
   * Get SMS delivery status
   */
  async getDeliveryStatus(messageId: string): Promise<any> {
    try {
      if (this.isInitialized && this.client) {
        const message = await this.client.messages(messageId).fetch();
        return {
          status: message.status,
          errorCode: message.errorCode,
          errorMessage: message.errorMessage,
          dateCreated: message.dateCreated,
          dateUpdated: message.dateUpdated,
          dateSent: message.dateSent,
        };
      } else {
        return {
          status: 'sent',
          message: 'Console mode - status not available',
        };
      }
    } catch (error) {
      console.error('Error getting delivery status:', error);
      return {
        status: 'error',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Check if SMS service is available
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Get service status
   */
  getStatus(): { available: boolean; provider: string } {
    return {
      available: this.isInitialized,
      provider: this.isInitialized ? 'Twilio' : 'Console Mode',
    };
  }
}

// Export singleton instance
export const smsService = new SMSService();
export default smsService;
