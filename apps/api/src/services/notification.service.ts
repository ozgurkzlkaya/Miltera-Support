import { db } from '../db';
import { issues, products, shipments, companies } from '../db/schema';
import { eq } from 'drizzle-orm';
import { 
  sendNotificationToUser, 
  sendNotificationToRole, 
  sendNotificationToCompany,
  sendNotificationToAll,
  NotificationEvent 
} from '../lib/websocket';

export class NotificationService {
  
  // Issue status change notification
  async sendIssueStatusChangeNotification(issueId: string, newStatus: string, updatedBy: string) {
    try {
      const issue = await db
        .select({
          id: issues.id,
          issueNumber: issues.issueNumber,
          customerDescription: issues.customerDescription,
          status: issues.status,
          company: {
            id: companies.id,
            name: companies.name,
          },
        })
        .from(issues)
        .leftJoin(companies, eq(issues.companyId, companies.id))
        .where(eq(issues.id, issueId))
        .limit(1);

      if (!issue[0]) {
        console.error('Issue not found:', issueId);
        return;
      }

      const issueData = issue[0];
      const notification: NotificationEvent = {
        type: 'issue_status_change',
        title: `Arıza Durumu Güncellendi - ${issueData.issueNumber}`,
        message: `Arıza durumu "${newStatus}" olarak güncellendi.`,
        data: {
          issueId: issueData.id,
          issueNumber: issueData.issueNumber,
          oldStatus: issueData.status,
          newStatus,
          updatedBy,
        },
        timestamp: new Date().toISOString(),
        priority: this.getPriorityForIssueStatus(newStatus),
      };

      // Send to TSP role
      await sendNotificationToRole('TSP', notification);

      // Send to company users if company exists
      if (issueData.company?.id) {
        await sendNotificationToCompany(issueData.company.id, notification);
      }

      // Send to admins
      await sendNotificationToRole('ADMIN', notification);

    } catch (error) {
      console.error('Error sending issue status change notification:', error);
    }
  }

  // Product status change notification
  async sendProductStatusChangeNotification(productId: string, newStatus: string, updatedBy: string) {
    try {
      const product = await db
        .select({
          id: products.id,
          serialNumber: products.serialNumber,
          currentStatus: products.currentStatus,
          company: {
            id: companies.id,
            name: companies.name,
          },
        })
        .from(products)
        .leftJoin(companies, eq(products.companyId, companies.id))
        .where(eq(products.id, productId))
        .limit(1);

      if (!product[0]) {
        console.error('Product not found:', productId);
        return;
      }

      const productData = product[0];
      const notification: NotificationEvent = {
        type: 'product_status_change',
        title: `Ürün Durumu Güncellendi - ${productData.serialNumber}`,
        message: `Ürün durumu "${newStatus}" olarak güncellendi.`,
        data: {
          productId: productData.id,
          serialNumber: productData.serialNumber,
          oldStatus: productData.currentStatus,
          newStatus,
          updatedBy,
        },
        timestamp: new Date().toISOString(),
        priority: this.getPriorityForProductStatus(newStatus),
      };

      // Send to TSP role
      await sendNotificationToRole('TSP', notification);

      // Send to company users if company exists
      if (productData.company?.id) {
        await sendNotificationToCompany(productData.company.id, notification);
      }

      // Send to admins
      await sendNotificationToRole('ADMIN', notification);

    } catch (error) {
      console.error('Error sending product status change notification:', error);
    }
  }

  // Shipment update notification
  async sendShipmentUpdateNotification(shipmentId: string, updateType: string, updatedBy: string) {
    try {
      const shipment = await db
        .select({
          id: shipments.id,
          shipmentNumber: shipments.shipmentNumber,
          status: shipments.status,
          company: {
            id: companies.id,
            name: companies.name,
          },
        })
        .from(shipments)
        .leftJoin(companies, eq(shipments.companyId, companies.id))
        .where(eq(shipments.id, shipmentId))
        .limit(1);

      if (!shipment[0]) {
        console.error('Shipment not found:', shipmentId);
        return;
      }

      const shipmentData = shipment[0];
      const notification: NotificationEvent = {
        type: 'shipment_update',
        title: `Sevkiyat Güncellendi - ${shipmentData.shipmentNumber}`,
        message: `Sevkiyat ${updateType} güncellendi.`,
        data: {
          shipmentId: shipmentData.id,
          shipmentNumber: shipmentData.shipmentNumber,
          updateType,
          updatedBy,
        },
        timestamp: new Date().toISOString(),
        priority: 'medium',
      };

      // Send to TSP role
      await sendNotificationToRole('TSP', notification);

      // Send to company users if company exists
      if (shipmentData.company?.id) {
        await sendNotificationToCompany(shipmentData.company.id, notification);
      }

      // Send to admins
      await sendNotificationToRole('ADMIN', notification);

    } catch (error) {
      console.error('Error sending shipment update notification:', error);
    }
  }

  // System alert notification
  async sendSystemAlertNotification(title: string, message: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') {
    try {
      const notification: NotificationEvent = {
        type: 'system_alert',
        title,
        message,
        timestamp: new Date().toISOString(),
        priority,
      };

      // Send to all users
      await sendNotificationToAll(notification);

    } catch (error) {
      console.error('Error sending system alert notification:', error);
    }
  }

  // New issue notification
  async sendNewIssueNotification(issueId: string) {
    try {
      const issue = await db
        .select({
          id: issues.id,
          issueNumber: issues.issueNumber,
          customerDescription: issues.customerDescription,
          company: {
            id: companies.id,
            name: companies.name,
          },
        })
        .from(issues)
        .leftJoin(companies, eq(issues.companyId, companies.id))
        .where(eq(issues.id, issueId))
        .limit(1);

      if (!issue[0]) {
        console.error('Issue not found:', issueId);
        return;
      }

      const issueData = issue[0];
      const notification: NotificationEvent = {
        type: 'issue_status_change',
        title: `Yeni Arıza Kaydı - ${issueData.issueNumber}`,
        message: `Yeni bir arıza kaydı oluşturuldu: ${issueData.customerDescription?.substring(0, 100)}...`,
        data: {
          issueId: issueData.id,
          issueNumber: issueData.issueNumber,
        },
        timestamp: new Date().toISOString(),
        priority: 'high',
      };

      // Send to TSP role
      await sendNotificationToRole('TSP', notification);

      // Send to admins
      await sendNotificationToRole('ADMIN', notification);

    } catch (error) {
      console.error('Error sending new issue notification:', error);
    }
  }

  // Priority helpers
  private getPriorityForIssueStatus(status: string): 'low' | 'medium' | 'high' | 'urgent' {
    switch (status.toLowerCase()) {
      case 'critical':
      case 'urgent':
        return 'urgent';
      case 'high':
      case 'important':
        return 'high';
      case 'medium':
      case 'normal':
        return 'medium';
      case 'low':
      case 'resolved':
      case 'closed':
        return 'low';
      default:
        return 'medium';
    }
  }

  private getPriorityForProductStatus(status: string): 'low' | 'medium' | 'high' | 'urgent' {
    switch (status.toLowerCase()) {
      case 'defective':
      case 'recall':
        return 'urgent';
      case 'maintenance':
      case 'repair':
        return 'high';
      case 'testing':
      case 'inspection':
        return 'medium';
      case 'active':
      case 'inactive':
      case 'retired':
        return 'low';
      default:
        return 'medium';
    }
  }
}

export const notificationService = new NotificationService();
