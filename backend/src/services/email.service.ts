import nodemailer, { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure?: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export class EmailService {
  private transporter: Transporter | null = null;
  private config: EmailConfig;
  private isConfigured: boolean = false;

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || ''
      },
      from: process.env.SMTP_FROM || 'noreply@university.edu.tw'
    };

    this.initialize();
  }

  private initialize(): void {
    try {
      if (!this.config.auth.user || !this.config.auth.pass) {
        console.warn('⚠️  郵件服務未配置：缺少 SMTP 認證資訊');
        this.isConfigured = false;
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth
      });

      this.isConfigured = true;
      console.log('✅ 郵件服務已初始化');
    } catch (error) {
      console.error('❌ 郵件服務初始化失敗:', error);
      this.isConfigured = false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.error('❌ 郵件服務未配置，無法發送郵件');
      return false;
    }

    try {
      const mailOptions = {
        from: this.config.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        attachments: options.attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ 郵件發送成功:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ 郵件發送失敗:', error);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ SMTP 連線驗證成功');
      return true;
    } catch (error) {
      console.error('❌ SMTP 連線驗證失敗:', error);
      return false;
    }
  }

  // 預定義的郵件模板
  async sendDocumentUploadNotification(
    recipientEmail: string,
    studentName: string,
    documentType: string,
    uploaderName: string
  ): Promise<boolean> {
    const subject = `文件上傳通知 - ${studentName}`;
    const html = `
      <h2>文件上傳通知</h2>
      <p>您好，</p>
      <p>學生 <strong>${studentName}</strong> 的文件已更新：</p>
      <ul>
        <li>文件類型：${documentType}</li>
        <li>上傳者：${uploaderName}</li>
        <li>上傳時間：${new Date().toLocaleString('zh-TW')}</li>
      </ul>
      <p>請登入系統查看詳細資訊。</p>
      <hr>
      <p style="color: #666; font-size: 12px;">此為系統自動發送的郵件，請勿直接回覆。</p>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject,
      html
    });
  }

  async sendDocumentReminderNotification(
    recipientEmail: string,
    studentName: string,
    missingDocuments: string[]
  ): Promise<boolean> {
    const subject = `文件提醒 - ${studentName}`;
    const html = `
      <h2>文件上傳提醒</h2>
      <p>您好，</p>
      <p>學生 <strong>${studentName}</strong> 仍有以下文件尚未上傳：</p>
      <ul>
        ${missingDocuments.map(doc => `<li>${doc}</li>`).join('')}
      </ul>
      <p>請盡快完成文件上傳作業。</p>
      <hr>
      <p style="color: #666; font-size: 12px;">此為系統自動發送的郵件，請勿直接回覆。</p>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject,
      html
    });
  }

  async sendCompletionNotification(
    recipientEmail: string,
    studentName: string
  ): Promise<boolean> {
    const subject = `文件完成通知 - ${studentName}`;
    const html = `
      <h2>文件完成通知</h2>
      <p>您好，</p>
      <p>學生 <strong>${studentName}</strong> 的所有必要文件已完成上傳。</p>
      <p>請登入系統進行查核作業。</p>
      <hr>
      <p style="color: #666; font-size: 12px;">此為系統自動發送的郵件，請勿直接回覆。</p>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject,
      html
    });
  }

  isEnabled(): boolean {
    return this.isConfigured;
  }
}

// 單例模式
let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}
