import { BaseModel } from './base-model';

export enum NotificationType {
  EMAIL = 'email',
  SYSTEM = 'system',
  SMS = 'sms'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  READ = 'read'
}

export interface NotificationMetadata {
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  [key: string]: any;
}

export class Notification extends BaseModel {
  notificationId: string;
  recipientId: string;
  senderId?: string;
  type: NotificationType;
  title: string;
  content: string;
  status: NotificationStatus;
  metadata?: NotificationMetadata;
  scheduledAt?: Date;
  sentAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any) {
    super();
    this.notificationId = data.notification_id;
    this.recipientId = data.recipient_id;
    this.senderId = data.sender_id;
    this.type = data.type as NotificationType;
    this.title = data.title;
    this.content = data.content;
    this.status = data.status as NotificationStatus;
    this.metadata = data.metadata;
    this.scheduledAt = data.scheduled_at ? new Date(data.scheduled_at) : undefined;
    this.sentAt = data.sent_at ? new Date(data.sent_at) : undefined;
    this.readAt = data.read_at ? new Date(data.read_at) : undefined;
    this.createdAt = data.created_at ? new Date(data.created_at) : new Date();
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : new Date();
  }

  protected getValidationSchema(): any {
    // 實作基礎驗證 schema
    return {};
  }

  toJSON(): any {
    return {
      notificationId: this.notificationId,
      recipientId: this.recipientId,
      senderId: this.senderId,
      type: this.type,
      title: this.title,
      content: this.content,
      status: this.status,
      metadata: this.metadata,
      scheduledAt: this.scheduledAt?.toISOString(),
      sentAt: this.sentAt?.toISOString(),
      readAt: this.readAt?.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  validateNotification(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.notificationId || this.notificationId.trim() === '') {
      errors.push('通知ID不能為空');
    }

    if (!this.recipientId || this.recipientId.trim() === '') {
      errors.push('收件人ID不能為空');
    }

    if (!this.type || !Object.values(NotificationType).includes(this.type)) {
      errors.push('通知類型無效');
    }

    if (!this.title || this.title.trim() === '') {
      errors.push('通知標題不能為空');
    }

    if (this.title && this.title.length > 255) {
      errors.push('通知標題不能超過255個字元');
    }

    if (!this.content || this.content.trim() === '') {
      errors.push('通知內容不能為空');
    }

    if (!this.status || !Object.values(NotificationStatus).includes(this.status)) {
      errors.push('通知狀態無效');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  markAsSent(): void {
    this.status = NotificationStatus.SENT;
    this.sentAt = new Date();
  }

  markAsFailed(): void {
    this.status = NotificationStatus.FAILED;
  }

  markAsRead(): void {
    this.status = NotificationStatus.READ;
    this.readAt = new Date();
  }

  isUnread(): boolean {
    return this.status !== NotificationStatus.READ && !this.readAt;
  }

  isPending(): boolean {
    return this.status === NotificationStatus.PENDING;
  }

  isScheduled(): boolean {
    return !!this.scheduledAt && this.scheduledAt > new Date();
  }
}
