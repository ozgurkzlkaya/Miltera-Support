import nodemailer from 'nodemailer';

// Email konfigürasyonu
export const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

// Email transporter oluştur
export const createTransporter = () => {
  return nodemailer.createTransporter(emailConfig);
};

// Email gönderme fonksiyonu
export const sendEmail = async (options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Miltera Teknik Servis" <${emailConfig.auth.user}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // HTML'den text çıkar
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Email şablonları
export const emailTemplates = {
  // Ürün durum değişikliği bildirimi
  productStatusChange: (data: {
    productSerialNumber: string;
    oldStatus: string;
    newStatus: string;
    companyName?: string;
    contactPersonName?: string;
  }) => ({
    subject: `Ürün Durum Değişikliği - ${data.productSerialNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Miltera Teknik Servis</h2>
        <h3>Ürün Durum Değişikliği Bildirimi</h3>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Seri Numara:</strong> ${data.productSerialNumber}</p>
          <p><strong>Müşteri:</strong> ${data.companyName || 'Stok'}</p>
          <p><strong>Eski Durum:</strong> ${data.oldStatus}</p>
          <p><strong>Yeni Durum:</strong> ${data.newStatus}</p>
          <p><strong>Değişiklik Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
        </div>
        
        ${data.contactPersonName ? `<p>Sayın ${data.contactPersonName},</p>` : ''}
        <p>Ürününüzün durumu güncellenmiştir. Detaylı bilgi için portalımızı ziyaret edebilirsiniz.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px;">
            Bu e-posta Miltera Teknik Servis Portalı tarafından otomatik olarak gönderilmiştir.
          </p>
        </div>
      </div>
    `
  }),

  // Arıza kaydı bildirimi
  issueNotification: (data: {
    issueNumber: string;
    companyName: string;
    customerDescription: string;
    issueDate: string;
  }) => ({
    subject: `Yeni Arıza Kaydı - ${data.issueNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Miltera Teknik Servis</h2>
        <h3>Yeni Arıza Kaydı</h3>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Arıza Numarası:</strong> ${data.issueNumber}</p>
          <p><strong>Müşteri:</strong> ${data.companyName}</p>
          <p><strong>Açıklama:</strong> ${data.customerDescription}</p>
          <p><strong>Tarih:</strong> ${new Date(data.issueDate).toLocaleDateString('tr-TR')}</p>
        </div>
        
        <p>Lütfen arıza kaydını inceleyin ve gerekli işlemleri başlatın.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px;">
            Bu e-posta Miltera Teknik Servis Portalı tarafından otomatik olarak gönderilmiştir.
          </p>
        </div>
      </div>
    `
  }),

  // Sevkiyat bildirimi
  shipmentNotification: (data: {
    shipmentNumber: string;
    companyName: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
  }) => ({
    subject: `Sevkiyat Bildirimi - ${data.shipmentNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Miltera Teknik Servis</h2>
        <h3>Sevkiyat Bildirimi</h3>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Sevkiyat Numarası:</strong> ${data.shipmentNumber}</p>
          <p><strong>Müşteri:</strong> ${data.companyName}</p>
          <p><strong>Kargo Takip No:</strong> ${data.trackingNumber || 'Henüz atanmadı'}</p>
          <p><strong>Tahmini Teslimat:</strong> ${data.estimatedDelivery ? new Date(data.estimatedDelivery).toLocaleDateString('tr-TR') : 'Belirtilmedi'}</p>
        </div>
        
        <p>Sevkiyatınızı takip etmek için kargo takip numarasını kullanabilirsiniz.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px;">
            Bu e-posta Miltera Teknik Servis Portalı tarafından otomatik olarak gönderilmiştir.
          </p>
        </div>
      </div>
    `
  }),
};

// Email gönderme yardımcı fonksiyonları
export const emailHelpers = {
  // Ürün durum değişikliği bildirimi gönder
  sendProductStatusChangeNotification: async (data: {
    productSerialNumber: string;
    oldStatus: string;
    newStatus: string;
    companyName?: string;
    contactPersonName?: string;
    recipientEmails: string[];
  }) => {
    const template = emailTemplates.productStatusChange(data);
    return await sendEmail({
      to: data.recipientEmails,
      subject: template.subject,
      html: template.html,
    });
  },

  // Arıza kaydı bildirimi gönder
  sendIssueNotification: async (data: {
    issueNumber: string;
    companyName: string;
    customerDescription: string;
    issueDate: string;
    recipientEmails: string[];
  }) => {
    const template = emailTemplates.issueNotification(data);
    return await sendEmail({
      to: data.recipientEmails,
      subject: template.subject,
      html: template.html,
    });
  },

  // Sevkiyat bildirimi gönder
  sendShipmentNotification: async (data: {
    shipmentNumber: string;
    companyName: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    recipientEmails: string[];
  }) => {
    const template = emailTemplates.shipmentNotification(data);
    return await sendEmail({
      to: data.recipientEmails,
      subject: template.subject,
      html: template.html,
    });
  },
};
