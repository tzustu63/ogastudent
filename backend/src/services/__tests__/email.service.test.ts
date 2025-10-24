import { EmailService } from '../email.service';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    verify: jest.fn().mockResolvedValue(true)
  })
}));

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    // Set environment variables for testing
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'test@test.com';
    process.env.SMTP_PASSWORD = 'testpassword';
    process.env.SMTP_FROM = 'noreply@test.com';

    emailService = new EmailService();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const emailOptions = {
        to: 'recipient@test.com',
        subject: '測試郵件',
        text: '這是測試郵件內容',
        html: '<p>這是測試郵件內容</p>'
      };

      const result = await emailService.sendEmail(emailOptions);

      expect(result).toBe(true);
    });

    it('should handle multiple recipients', async () => {
      const emailOptions = {
        to: ['recipient1@test.com', 'recipient2@test.com'],
        subject: '測試郵件',
        text: '這是測試郵件內容'
      };

      const result = await emailService.sendEmail(emailOptions);

      expect(result).toBe(true);
    });
  });

  describe('verifyConnection', () => {
    it('should verify SMTP connection', async () => {
      const result = await emailService.verifyConnection();

      expect(result).toBe(true);
    });
  });

  describe('sendDocumentUploadNotification', () => {
    it('should send document upload notification', async () => {
      const result = await emailService.sendDocumentUploadNotification(
        'recipient@test.com',
        '張三',
        '畢業證書',
        '李四'
      );

      expect(result).toBe(true);
    });
  });

  describe('isEnabled', () => {
    it('should return true when configured', () => {
      expect(emailService.isEnabled()).toBe(true);
    });
  });
});
