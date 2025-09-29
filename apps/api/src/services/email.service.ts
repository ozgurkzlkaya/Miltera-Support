import { db } from '../db';
import { users, companies, shipments, issues, products, serviceOperations } from '../db/schema';
import { eq } from 'drizzle-orm';
import sgMail from '@sendgrid/mail';

export interface EmailTemplate {
  subject: string;
  body: string;
  recipients: string[];
}

export interface ShipmentEmailData {
  shipmentNumber: string;
  companyName: string;
  companyEmail: string;
  contactPersonName: string;
  contactPersonEmail: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  itemCount: number;
  totalCost?: number;
  shipmentType: 'SALES' | 'SERVICE_RETURN' | 'SERVICE_SEND';
}

export interface IssueEmailData {
  issueNumber: string;
  companyName: string;
  companyEmail: string;
  contactPersonName: string;
  contactPersonEmail: string;
  customerDescription: string;
  issueDate: string;
  status: string;
}

export interface ProductStatusEmailData {
  productSerialNumber: string;
  productName: string;
  companyName: string;
  companyEmail: string;
  contactPersonName: string;
  contactPersonEmail: string;
  oldStatus: string;
  newStatus: string;
  statusChangeDate: string;
}

export interface TSPAssignmentEmailData {
  issueId: string;
  issueNumber: string;
  technicianName: string;
  technicianEmail: string;
  priority: string;
  assignedAt: string;
}

export class EmailService {
  private isInitialized = false;

  constructor() {
    this.initializeSendGrid();
  }

  private initializeSendGrid() {
    try {
      const apiKey = process.env.SENDGRID_API_KEY;
      if (apiKey) {
        sgMail.setApiKey(apiKey);
        this.isInitialized = true;
        console.log('✅ SendGrid initialized successfully');
      } else {
        console.warn('⚠️ SENDGRID_API_KEY not found, using console mode');
      }
    } catch (error) {
      console.error('❌ SendGrid initialization failed:', error);
    }
  }

  // E-posta gönderme fonksiyonu (SendGrid + fallback)
  private async sendEmail(to: string[], subject: string, body: string): Promise<boolean> {
    try {
      if (this.isInitialized && process.env.SENDGRID_API_KEY) {
        // Gerçek SendGrid ile gönder
        const msg = {
          to: to,
          from: process.env.SENDGRID_FROM_EMAIL || 'noreply@miltera.com',
          subject: subject,
          text: body,
          html: this.convertToHtml(body),
        };

        await sgMail.send(msg);
        console.log('✅ Email sent via SendGrid to:', to.join(', '));
        return true;
      } else {
        // Fallback: Console mode
        console.log('=== E-POSTA GÖNDERİLİYOR (Console Mode) ===');
        console.log('Kime:', to.join(', '));
        console.log('Konu:', subject);
        console.log('İçerik:', body);
        console.log('==========================================');
        
        // Simüle edilmiş gecikme
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      }
    } catch (error) {
      console.error('❌ E-posta gönderme hatası:', error);
      return false;
    }
  }

  // Text'i HTML'e çevir
  private convertToHtml(text: string): string {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  }

  // Satış sebebiyle gönderim bildirimi
  async sendSalesShipmentNotification(shipmentId: string): Promise<boolean> {
    try {
      const shipment = await db
        .select({
          id: shipments.id,
          shipmentNumber: shipments.shipmentNumber,
          type: shipments.type,
          trackingNumber: shipments.trackingNumber,
          estimatedDelivery: shipments.estimatedDelivery,
          totalCost: shipments.totalCost,
          company: {
            id: companies.id,
            name: companies.name,
            email: companies.email,
            contactPersonName: companies.contactPersonName,
            contactPersonEmail: companies.contactPersonEmail,
          },
        })
        .from(shipments)
        .leftJoin(companies, eq(shipments.companyId, companies.id))
        .where(eq(shipments.id, shipmentId))
        .limit(1);

      if (!shipment[0]) {
        console.error('Sevkiyat bulunamadı:', shipmentId);
        return false;
      }

      const data = shipment[0];
      
      // Müşteriye bildirim
      if (data.company?.contactPersonEmail) {
        const customerSubject = `Sevkiyat Bildirimi - ${data.shipmentNumber}`;
        const customerBody = this.generateSalesShipmentCustomerEmail(data);
        
        await this.sendEmail(
          [data.company.contactPersonEmail],
          customerSubject,
          customerBody
        );
      }

      // Muhasebeye bildirim
      const accountingEmails = await this.getAccountingEmails();
      if (accountingEmails.length > 0) {
        const accountingSubject = `Yeni Satış Sevkiyatı - ${data.shipmentNumber}`;
        const accountingBody = this.generateSalesShipmentAccountingEmail(data);
        
        await this.sendEmail(
          accountingEmails,
          accountingSubject,
          accountingBody
        );
      }

      // Yöneticilere bildirim
      const adminEmails = await this.getAdminEmails();
      if (adminEmails.length > 0) {
        const adminSubject = `Yeni Satış Sevkiyatı - ${data.shipmentNumber}`;
        const adminBody = this.generateSalesShipmentAdminEmail(data);
        
        await this.sendEmail(
          adminEmails,
          adminSubject,
          adminBody
        );
      }

      return true;
    } catch (error) {
      console.error('Satış sevkiyat bildirimi hatası:', error);
      return false;
    }
  }

  // Müşteri arıza kaydı bildirimi
  async sendIssueNotification(issueId: string): Promise<boolean> {
    try {
      const issue = await db
        .select({
          id: issues.id,
          issueNumber: issues.issueNumber,
          customerDescription: issues.customerDescription,
          issueDate: issues.reportedAt,
          status: issues.status,
          company: {
            id: companies.id,
            name: companies.name,
            email: companies.email,
            contactPersonName: companies.contactPersonName,
            contactPersonEmail: companies.contactPersonEmail,
          },
        })
        .from(issues)
        .leftJoin(companies, eq(issues.companyId, companies.id))
        .where(eq(issues.id, issueId))
        .limit(1);

      if (!issue[0]) {
        console.error('Arıza kaydı bulunamadı:', issueId);
        return false;
      }

      const data = issue[0];

      // TSP'lere bildirim
      const tspEmails = await this.getTSPEmails();
      if (tspEmails.length > 0) {
        const tspSubject = `Yeni Arıza Kaydı - ${data.issueNumber}`;
        const tspBody = this.generateIssueTSPEmail(data);
        
        await this.sendEmail(
          tspEmails,
          tspSubject,
          tspBody
        );
      }

      // Yöneticilere bildirim
      const adminEmails = await this.getAdminEmails();
      if (adminEmails.length > 0) {
        const adminSubject = `Yeni Arıza Kaydı - ${data.issueNumber}`;
        const adminBody = this.generateIssueAdminEmail(data);
        
        await this.sendEmail(
          adminEmails,
          adminSubject,
          adminBody
        );
      }

      return true;
    } catch (error) {
      console.error('Arıza kaydı bildirimi hatası:', error);
      return false;
    }
  }

  // Arıza kaydıyla teslim bildirimi
  async sendIssueDeliveryNotification(issueId: string): Promise<boolean> {
    try {
      const issue = await db
        .select({
          id: issues.id,
          issueNumber: issues.issueNumber,
          company: {
            id: companies.id,
            name: companies.name,
            contactPersonName: companies.contactPersonName,
            contactPersonEmail: companies.contactPersonEmail,
          },
        })
        .from(issues)
        .leftJoin(companies, eq(issues.companyId, companies.id))
        .where(eq(issues.id, issueId))
        .limit(1);

      if (!issue[0] || !issue[0].company?.contactPersonEmail) {
        return false;
      }

      const data = issue[0];
      const subject = `Arıza Kaydı Teslim Alındı - ${data.issueNumber}`;
      const body = this.generateIssueDeliveryEmail(data);

      return await this.sendEmail(
        [data.company!.contactPersonEmail!],
        subject,
        body
      );
    } catch (error) {
      console.error('Arıza teslim bildirimi hatası:', error);
      return false;
    }
  }

  // Servis öncesi inceleme bildirimi
  async sendPreServiceInspectionNotification(issueId: string): Promise<boolean> {
    try {
      const issue = await db
        .select({
          id: issues.id,
          issueNumber: issues.issueNumber,
          company: {
            id: companies.id,
            name: companies.name,
            contactPersonName: companies.contactPersonName,
            contactPersonEmail: companies.contactPersonEmail,
          },
        })
        .from(issues)
        .leftJoin(companies, eq(issues.companyId, companies.id))
        .where(eq(issues.id, issueId))
        .limit(1);

      if (!issue[0]) {
        return false;
      }

      const data = issue[0];
      const emails = [];

      // Müşteri yetkilisine bildirim
      if (data.company?.contactPersonEmail) {
        emails.push(data.company.contactPersonEmail);
      }

      // Müşteri kullanıcılarına bildirim
      if (data.company?.id) {
        const customerEmails = await this.getCustomerEmails(data.company.id);
        emails.push(...customerEmails);
      }

      if (emails.length === 0) {
        return false;
      }

      const subject = `Servis Öncesi İnceleme - ${data.issueNumber}`;
      const body = this.generatePreServiceInspectionEmail(data);

      return await this.sendEmail(emails, subject, body);
    } catch (error) {
      console.error('Servis öncesi inceleme bildirimi hatası:', error);
      return false;
    }
  }

  // Servis sebebiyle gönderim bildirimi
  async sendServiceShipmentNotification(shipmentId: string): Promise<boolean> {
    try {
      const shipment = await db
        .select({
          id: shipments.id,
          shipmentNumber: shipments.shipmentNumber,
          trackingNumber: shipments.trackingNumber,
          estimatedDelivery: shipments.estimatedDelivery,
          company: {
            id: companies.id,
            name: companies.name,
            contactPersonName: companies.contactPersonName,
            contactPersonEmail: companies.contactPersonEmail,
          },
        })
        .from(shipments)
        .leftJoin(companies, eq(shipments.companyId, companies.id))
        .where(eq(shipments.id, shipmentId))
        .limit(1);

      if (!shipment[0]) {
        return false;
      }

      const data = shipment[0];
      const emails = [];

      // Müşteri yetkilisine bildirim
      if (data.company?.contactPersonEmail) {
        emails.push(data.company.contactPersonEmail);
      }

      // Müşteri kullanıcılarına bildirim
      if (data.company?.id) {
        const customerEmails = await this.getCustomerEmails(data.company.id);
        emails.push(...customerEmails);
      }

      if (emails.length === 0) {
        return false;
      }

      const subject = `Servis Sevkiyatı - ${data.shipmentNumber}`;
      const body = this.generateServiceShipmentEmail(data);

      return await this.sendEmail(emails, subject, body);
    } catch (error) {
      console.error('Servis sevkiyat bildirimi hatası:', error);
      return false;
    }
  }

  // Cihaz hurdaya ayrıldı bildirimi
  async sendProductScrappedNotification(productId: string): Promise<boolean> {
    try {
      const product = await db
        .select({
          id: products.id,
          serialNumber: products.serialNumber,
          company: {
            id: companies.id,
            name: companies.name,
            contactPersonName: companies.contactPersonName,
            contactPersonEmail: companies.contactPersonEmail,
          },
        })
        .from(products)
        .leftJoin(companies, eq(products.ownerId, companies.id))
        .where(eq(products.id, productId))
        .limit(1);

      if (!product[0] || !product[0].company?.contactPersonEmail) {
        return false;
      }

      const data = product[0];
      const subject = `Cihaz Hurdaya Ayrıldı - ${data.serialNumber}`;
      const body = this.generateProductScrappedEmail(data);

      return await this.sendEmail(
        [data.company!.contactPersonEmail!],
        subject,
        body
      );
    } catch (error) {
      console.error('Cihaz hurda bildirimi hatası:', error);
      return false;
    }
  }

  // Ürün durum değişikliği bildirimi
  async sendProductStatusChangeNotification(
    productId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<boolean> {
    try {
      const product = await db
        .select({
          id: products.id,
          serialNumber: products.serialNumber,
          status: products.status,
          company: {
            id: companies.id,
            name: companies.name,
            contactPersonName: companies.contactPersonName,
            contactPersonEmail: companies.contactPersonEmail,
          },
        })
        .from(products)
        .leftJoin(companies, eq(products.ownerId, companies.id))
        .where(eq(products.id, productId))
        .limit(1);

      if (!product[0]) {
        return false;
      }

      const data = product[0];
      const emails = [];

      // Müşteriye bildirim (eğer ürün müşteriye aitse)
      if (data.company?.contactPersonEmail) {
        emails.push(data.company.contactPersonEmail);
      }

      // TSP'lere bildirim (önemli durum değişiklikleri için)
      const importantStatusChanges = ['READY_FOR_SHIPMENT', 'SHIPPED', 'ISSUE_CREATED', 'RECEIVED', 'UNDER_REPAIR'];
      if (importantStatusChanges.includes(newStatus)) {
        const tspEmails = await this.getTSPEmails();
        emails.push(...tspEmails);
      }

      // Yöneticilere bildirim
      const adminEmails = await this.getAdminEmails();
      emails.push(...adminEmails);

      if (emails.length === 0) {
        return false;
      }

      const subject = `Ürün Durum Değişikliği - ${data.serialNumber || 'Seri No Yok'}`;
      const body = this.generateProductStatusChangeEmail(data, oldStatus, newStatus);

      return await this.sendEmail(emails, subject, body);
    } catch (error) {
      console.error('Ürün durum değişikliği bildirimi hatası:', error);
      return false;
    }
  }

  // Servis operasyonu bildirimi
  async sendServiceOperationNotification(operationId: string): Promise<boolean> {
    try {
      const op = await db
        .select({
          id: serviceOperations.id,
          operationType: serviceOperations.operationType,
          status: serviceOperations.status,
          description: serviceOperations.description,
          findings: serviceOperations.findings,
          actionsTaken: serviceOperations.actionsTaken,
          operationDate: serviceOperations.operationDate,
          product: {
            id: products.id,
            serialNumber: products.serialNumber,
            ownerId: products.ownerId,
          },
          issue: {
            id: issues.id,
            issueNumber: issues.issueNumber,
            companyId: issues.companyId,
          },
          technician: {
            id: users.id,
            email: users.email,
            name: users.name,
            firstName: users.firstName,
            lastName: users.lastName,
          },
        })
        .from(serviceOperations)
        .leftJoin(products, eq(serviceOperations.productId, products.id))
        .leftJoin(issues, eq(serviceOperations.issueId, issues.id))
        .leftJoin(users, eq(serviceOperations.performedBy, users.id))
        .where(eq(serviceOperations.id, operationId))
        .limit(1);

      if (!op[0]) {
        console.error('Servis operasyonu bulunamadı:', operationId);
        return false;
      }

      const data = op[0];

      // Alıcı listesi: teknisyen, adminler, müşteri yetkilisi (varsa)
      const recipients: string[] = [];

      if (data.technician?.email) {
        recipients.push(data.technician.email);
      }

      const adminEmails = await this.getAdminEmails();
      recipients.push(...adminEmails);

      // Müşteri yetkilisi e-postası (ürün sahibinden veya issue.companyId'den)
      let customerEmails: string[] = [];
      const companyId = data.issue?.companyId;
      if (companyId) {
        const company = await db
          .select({
            contactPersonEmail: companies.contactPersonEmail,
          })
          .from(companies)
          .where(eq(companies.id, companyId))
          .limit(1);
        if (company[0]?.contactPersonEmail) customerEmails.push(company[0].contactPersonEmail);
        // Ayrıca şirkete bağlı kullanıcılar
        customerEmails.push(...(await this.getCustomerEmails(companyId)));
      }
      recipients.push(...customerEmails);

      // Alıcı yoksa gönderme
      if (recipients.length === 0) return false;

      const subject = `Servis Operasyonu: ${data.operationType} (${data.product?.serialNumber || 'Seri No Yok'})`;
      const body = [
        `Servis operasyonu bilgileri:`,
        '',
        `- Operasyon Türü: ${data.operationType}`,
        `- Durum: ${data.status}`,
        `- Ürün Seri No: ${data.product?.serialNumber || '—'}`,
        data.issue?.issueNumber ? `- İlgili Arıza: ${data.issue.issueNumber}` : undefined,
        `- Tarih: ${data.operationDate ? new Date(data.operationDate as unknown as string).toLocaleString('tr-TR') : new Date().toLocaleString('tr-TR')}`,
        data.description ? `- Açıklama: ${data.description}` : undefined,
        data.findings ? `- Bulgular: ${data.findings}` : undefined,
        data.actionsTaken ? `- Yapılan İşlemler: ${data.actionsTaken}` : undefined,
        '',
        `Miltera Teknik Servis`
      ]
        .filter(Boolean)
        .join('\n');

      return await this.sendEmail(Array.from(new Set(recipients)), subject, body);
    } catch (error) {
      console.error('Servis operasyonu bildirimi hatası:', error);
      return false;
    }
  }

  // Tamir tamamlama bildirimi
  async sendRepairCompletionNotification(issueId: string, operationId: string): Promise<boolean> {
    try {
      // Arıza ve operasyon detaylarını al
      const issueRes = await db
        .select({
          id: issues.id,
          issueNumber: issues.issueNumber,
          companyId: issues.companyId,
          productId: issues.productId,
        })
        .from(issues)
        .where(eq(issues.id, issueId))
        .limit(1);

      const opRes = await db
        .select({
          id: serviceOperations.id,
          operationType: serviceOperations.operationType,
          completedAt: serviceOperations.completedAt,
          performedBy: serviceOperations.performedBy,
          productId: serviceOperations.productId,
        })
        .from(serviceOperations)
        .where(eq(serviceOperations.id, operationId))
        .limit(1);

      if (!issueRes[0] || !opRes[0]) {
        console.error('Arıza veya operasyon bulunamadı:', issueId, operationId);
        return false;
      }

      const issueData = issueRes[0];
      const opData = opRes[0];

      // Alıcılar: müşteri yetkilisi + adminler + teknisyen
      const recipients: string[] = [];

      if (issueData.companyId) {
        const company = await db
          .select({
            contactPersonEmail: companies.contactPersonEmail,
          })
          .from(companies)
          .where(eq(companies.id, issueData.companyId))
          .limit(1);
        if (company[0]?.contactPersonEmail) recipients.push(company[0].contactPersonEmail);
        recipients.push(...(await this.getCustomerEmails(issueData.companyId)));
      }

      recipients.push(...(await this.getAdminEmails()));

      if (opData.performedBy) {
        const tech = await db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.id, opData.performedBy))
          .limit(1);
        if (tech[0]?.email) recipients.push(tech[0].email);
      }

      if (recipients.length === 0) return false;

      // Ürün seri no
      let serial: string | null = null;
      const prodId = opData.productId || issueData.productId;
      if (prodId) {
        const prod = await db
          .select({ serialNumber: products.serialNumber })
          .from(products)
          .where(eq(products.id, prodId))
          .limit(1);
        serial = prod[0]?.serialNumber ?? null;
      }

      const subject = `Tamir Tamamlandı - ${issueData.issueNumber}${serial ? ` (${serial})` : ''}`;
      const body = [
        `Merhaba,`,
        '',
        `${issueData.issueNumber} numaralı arıza için tamir işlemi tamamlanmıştır.`,
        serial ? `- Ürün Seri No: ${serial}` : undefined,
        `- Operasyon: ${opData.operationType}`,
        `- Tamamlanma Tarihi: ${opData.completedAt ? new Date(opData.completedAt as unknown as string).toLocaleString('tr-TR') : new Date().toLocaleString('tr-TR')}`,
        '',
        `Detaylar için portaldaki arıza kaydını inceleyebilirsiniz.`,
        '',
        `Miltera Teknik Servis`,
      ]
        .filter(Boolean)
        .join('\n');

      return await this.sendEmail(Array.from(new Set(recipients)), subject, body);
    } catch (error) {
      console.error('Tamir tamamlama bildirimi hatası:', error);
      return false;
    }
  }

  // E-posta şablonları
  private generateSalesShipmentCustomerEmail(data: any): string {
    return `
Sayın ${data.company.contactPersonName},

${data.company.name} firması için hazırlanan sevkiyatınız tamamlanmıştır.

Sevkiyat Detayları:
- Sevkiyat Numarası: ${data.shipmentNumber}
- Kargo Takip No: ${data.trackingNumber || 'Henüz atanmadı'}
- Tahmini Teslimat: ${data.estimatedDelivery ? new Date(data.estimatedDelivery).toLocaleDateString('tr-TR') : 'Belirtilmedi'}

Sevkiyatınızı takip etmek için kargo takip numarasını kullanabilirsiniz.

İyi çalışmalar,
Miltera Teknik Servis
    `.trim();
  }

  private generateSalesShipmentAccountingEmail(data: any): string {
    return `
Yeni satış sevkiyatı oluşturuldu.

Sevkiyat Detayları:
- Sevkiyat Numarası: ${data.shipmentNumber}
- Müşteri: ${data.company.name}
- Toplam Maliyet: ${data.totalCost ? `${data.totalCost.toLocaleString('tr-TR')} ₺` : 'Belirtilmedi'}

İrsaliye ve fatura işlemleri için gerekli adımları atabilirsiniz.

Miltera Teknik Servis
    `.trim();
  }

  private generateSalesShipmentAdminEmail(data: any): string {
    return `
Yeni satış sevkiyatı oluşturuldu.

Sevkiyat Detayları:
- Sevkiyat Numarası: ${data.shipmentNumber}
- Müşteri: ${data.company.name}
- İletişim: ${data.company.contactPersonName} (${data.company.contactPersonEmail})
- Kargo Takip: ${data.trackingNumber || 'Henüz atanmadı'}

Miltera Teknik Servis
    `.trim();
  }

  private generateIssueTSPEmail(data: any): string {
    return `
Yeni arıza kaydı oluşturuldu.

Arıza Detayları:
- Arıza Numarası: ${data.issueNumber}
- Müşteri: ${data.company.name}
- Açıklama: ${data.customerDescription}
- Tarih: ${new Date(data.issueDate).toLocaleDateString('tr-TR')}

Lütfen arıza kaydını inceleyin ve gerekli işlemleri başlatın.

Miltera Teknik Servis
    `.trim();
  }

  private generateIssueAdminEmail(data: any): string {
    return `
Yeni arıza kaydı oluşturuldu.

Arıza Detayları:
- Arıza Numarası: ${data.issueNumber}
- Müşteri: ${data.company.name}
- İletişim: ${data.company.contactPersonName} (${data.company.contactPersonEmail})
- Durum: ${data.status}

Miltera Teknik Servis
    `.trim();
  }

  private generateIssueDeliveryEmail(data: any): string {
    return `
Sayın ${data.company.contactPersonName},

${data.issueNumber} numaralı arıza kaydınızla ilgili cihazınız teslim alınmıştır.

Arıza kaydınız inceleme sürecine alınmıştır. İnceleme sonuçları size ayrıca bildirilecektir.

İyi çalışmalar,
Miltera Teknik Servis
    `.trim();
  }

  private generatePreServiceInspectionEmail(data: any): string {
    return `
Sayın İlgili,

${data.issueNumber} numaralı arıza kaydı için servis öncesi inceleme tamamlanmıştır.

İnceleme sonuçları ve yapılacak işlemler size ayrıca bildirilecektir.

Miltera Teknik Servis
    `.trim();
  }

  private generateServiceShipmentEmail(data: any): string {
    return `
Sayın İlgili,

${data.shipmentNumber} numaralı servis sevkiyatınız hazırlanmıştır.

Sevkiyat Detayları:
- Kargo Takip No: ${data.trackingNumber || 'Henüz atanmadı'}
- Tahmini Teslimat: ${data.estimatedDelivery ? new Date(data.estimatedDelivery).toLocaleDateString('tr-TR') : 'Belirtilmedi'}

İyi çalışmalar,
Miltera Teknik Servis
    `.trim();
  }

  private generateProductScrappedEmail(data: any): string {
    return `
Sayın ${data.company.contactPersonName},

${data.serialNumber} seri numaralı cihazınız hurdaya ayrılmıştır.

Cihaz tamir edilemeyecek durumda olduğu için hurda olarak değerlendirilmiştir.

Detaylı bilgi için bizimle iletişime geçebilirsiniz.

Miltera Teknik Servis
    `.trim();
  }

  private generateProductStatusChangeEmail(data: any, oldStatus: string, newStatus: string): string {
    const getStatusLabel = (status: string) => {
      const statusLabels: { [key: string]: string } = {
        'FIRST_PRODUCTION': 'İlk Üretim',
        'FIRST_PRODUCTION_ISSUE': 'İlk Üretim Arıza',
        'FIRST_PRODUCTION_SCRAPPED': 'İlk Üretim Hurda',
        'READY_FOR_SHIPMENT': 'Sevkiyat Hazır',
        'SHIPPED': 'Sevk Edildi',
        'ISSUE_CREATED': 'Arıza Kaydı Oluşturuldu',
        'RECEIVED': 'Cihaz Teslim Alındı',
        'PRE_TEST_COMPLETED': 'Servis Ön Testi Yapıldı',
        'UNDER_REPAIR': 'Cihaz Tamir Edilmekte',
        'SERVICE_SCRAPPED': 'Servis Hurda',
        'DELIVERED': 'Teslim Edildi'
      };
      return statusLabels[status] || status;
    };

    return `
Ürün durum değişikliği bildirimi.

Ürün Detayları:
- Seri Numara: ${data.serialNumber || 'Henüz atanmadı'}
- Müşteri: ${data.company?.name || 'Stok'}
- Eski Durum: ${getStatusLabel(oldStatus)}
- Yeni Durum: ${getStatusLabel(newStatus)}
- Değişiklik Tarihi: ${new Date().toLocaleDateString('tr-TR')}

${data.company?.contactPersonName ? `Sayın ${data.company.contactPersonName},` : ''}

Ürününüzün durumu güncellenmiştir. Detaylı bilgi için portalımızı ziyaret edebilirsiniz.

Miltera Teknik Servis
    `.trim();
  }

  // Kullanıcı e-posta listelerini alma
  private async getAccountingEmails(): Promise<string[]> {
    // Şimdilik admin kullanıcılarını muhasebe alıcısı olarak kullan
    const admins = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.role, 'ADMIN'));
    return admins.map(a => a.email).filter(Boolean);
  }

  private async getAdminEmails(): Promise<string[]> {
    const admins = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.role, 'ADMIN'));

    return admins.map(admin => admin.email);
  }

  private async getTSPEmails(): Promise<string[]> {
    const tsps = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.role, 'TSP'));

    return tsps.map(tsp => tsp.email);
  }

  private async getCustomerEmails(companyId: string): Promise<string[]> {
    const customers = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.companyId, companyId));

    return customers.map(customer => customer.email);
  }

  /**
   * TSP atama bildirimi gönder
   */
  async sendIssueAssignmentNotification(data: TSPAssignmentEmailData): Promise<boolean> {
    const subject = `Yeni Arıza Ataması - ${data.issueNumber}`;
    const body = this.generateTSPAssignmentEmail(data);
    
    return await this.sendEmail([data.technicianEmail], subject, body);
  }

  private generateTSPAssignmentEmail(data: TSPAssignmentEmailData): string {
    const getPriorityLabel = (priority: string) => {
      const priorityLabels: { [key: string]: string } = {
        'LOW': 'Düşük',
        'MEDIUM': 'Orta',
        'HIGH': 'Yüksek',
        'CRITICAL': 'Kritik'
      };
      return priorityLabels[priority] || priority;
    };

    return `
Yeni arıza ataması bildirimi.

Merhaba ${data.technicianName},

Size yeni bir arıza atanmıştır:

Arıza Detayları:
- Arıza Numarası: ${data.issueNumber}
- Öncelik: ${getPriorityLabel(data.priority)}
- Atama Tarihi: ${new Date(data.assignedAt).toLocaleString('tr-TR')}

Lütfen sistem üzerinden arıza detaylarını inceleyin ve gerekli işlemleri başlatın.

Miltera Teknik Servis
    `.trim();
  }
} 