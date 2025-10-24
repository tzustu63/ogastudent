import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { 
  Notification, 
  NotificationType, 
  NotificationStatus,
  NotificationMetadata 
} from '../models/notification';
import { 
  NotificationRepository, 
  NotificationFilter 
} from '../repositories/notification-repository';
import { UserRepository } from '../repositories/user-repository';
import { EmailService, getEmailService } from './email.service';
import { PaginationOptions, PaginatedResult } from '../repositories/base-repository';

export interface CreateNotificationData {
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  content: string;
  metadata?: NotificationMetadata;
  scheduledAt?: Date;
}

export class NotificationService {
  private notificationRepo: NotificationRepository;
  private userRepo: UserRepository;
  private emailService: EmailService;

  constructor(pool: Pool) {
    this.notificationRepo = new NotificationRepository(pool);
    this.userRepo = new UserRepository(pool);
    this.emailService = getEmailService();
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const notificationId = uuidv4();
    
    const notificationData = {
      notification_id: notificationId,
      recipient_id: data.recipientId,
      sender_id: data.senderId,
      type: data.type,
      title: data.title,
      content: data.content,
      status: NotificationStatus.PENDING,
      metadata: data.metadata,
      scheduled_at: data.scheduledAt
    };

    const notification = new Notification(notificationData);
    
    const validation = notification.validateNotification();
    if (!validation.isValid) {
      throw new Error(`通知驗證失敗: ${validation.errors.join(', ')}`);
    }

    const created = await this.notificationRepo.create(notification);
    
    // 如果是即時通知且類型為email，立即發送
    if (data.type === NotificationType.EMAIL && !data.scheduledAt) {
      await this.sendEmailNotification(created);
    }

    return created;
  }

  async sendEmailNotification(notification: Notification): Promise<boolean> {
    try {
      // 獲取收件人資訊
      const recipient = await this.userRepo.findById(notification.recipientId);
      if (!recipient || !recipient.email) {
        console.error('收件人不存在或沒有電子郵件地址');
        await this.notificationRepo.updateStatus(
          notification.notificationId,
          NotificationStatus.FAILED
        );
        return false;
      }

      // 發送郵件
      const success = await this.emailService.sendEmail({
        to: recipient.email,
        subject: notification.title,
        html: notification.content
      });

      if (success) {
        await this.notificationRepo.updateStatus(
          notification.notificationId,
          NotificationStatus.SENT,
          new Date()
        );
        return true;
      } else {
        await this.notificationRepo.updateStatus(
          notification.notificationId,
          NotificationStatus.FAILED
        );
        return false;
      }
    } catch (error) {
      console.error('發送郵件通知失敗:', error);
      await this.notificationRepo.updateStatus(
        notification.notificationId,
        NotificationStatus.FAILED
      );
      return false;
    }
  }

  async getNotificationById(notificationId: string): Promise<Notification | null> {
    return this.notificationRepo.findById(notificationId);
  }

  async getUserNotifications(
    userId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<Notification>> {
    return this.notificationRepo.findByRecipient(userId, options);
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepo.findUnreadByRecipient(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.getUnreadCount(userId);
  }

  async markAsRead(notificationId: string): Promise<Notification | null> {
    return this.notificationRepo.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string): Promise<number> {
    return this.notificationRepo.markAllAsRead(userId);
  }

  async searchNotifications(
    filter: NotificationFilter,
    options?: PaginationOptions
  ): Promise<PaginatedResult<Notification>> {
    return this.notificationRepo.findByFilter(filter, options);
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    return this.notificationRepo.delete(notificationId);
  }

  async processPendingScheduledNotifications(): Promise<number> {
    const pendingNotifications = await this.notificationRepo.findPendingScheduled();
    let processedCount = 0;

    for (const notification of pendingNotifications) {
      try {
        if (notification.type === NotificationType.EMAIL) {
          await this.sendEmailNotification(notification);
        } else {
          // 系統通知直接標記為已發送
          await this.notificationRepo.updateStatus(
            notification.notificationId,
            NotificationStatus.SENT,
            new Date()
          );
        }
        processedCount++;
      } catch (error) {
        console.error(`處理通知失敗 ${notification.notificationId}:`, error);
      }
    }

    return processedCount;
  }

  // 便捷方法：發送文件上傳通知
  async notifyDocumentUpload(
    recipientId: string,
    studentName: string,
    documentType: string,
    uploaderName: string
  ): Promise<Notification> {
    return this.createNotification({
      recipientId,
      type: NotificationType.SYSTEM,
      title: '文件上傳通知',
      content: `學生 ${studentName} 的 ${documentType} 已由 ${uploaderName} 上傳`,
      metadata: {
        category: 'document_upload',
        studentName,
        documentType,
        uploaderName
      }
    });
  }

  // 便捷方法：發送文件提醒
  async notifyDocumentReminder(
    recipientId: string,
    studentName: string,
    missingDocuments: string[]
  ): Promise<Notification> {
    return this.createNotification({
      recipientId,
      type: NotificationType.SYSTEM,
      title: '文件上傳提醒',
      content: `學生 ${studentName} 仍有 ${missingDocuments.length} 項文件尚未上傳`,
      metadata: {
        category: 'document_reminder',
        studentName,
        missingDocuments,
        priority: 'medium'
      }
    });
  }

  // 便捷方法：發送完成通知
  async notifyCompletion(
    recipientId: string,
    studentName: string
  ): Promise<Notification> {
    return this.createNotification({
      recipientId,
      type: NotificationType.SYSTEM,
      title: '文件完成通知',
      content: `學生 ${studentName} 的所有必要文件已完成上傳`,
      metadata: {
        category: 'completion',
        studentName,
        priority: 'high'
      }
    });
  }

  async cleanupOldNotifications(daysOld: number = 90): Promise<number> {
    return this.notificationRepo.deleteOldNotifications(daysOld);
  }
}
