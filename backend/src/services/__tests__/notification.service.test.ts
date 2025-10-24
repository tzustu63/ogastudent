import { Pool } from 'pg';
import { NotificationService } from '../notification.service';
import { NotificationType, NotificationStatus } from '../../models/notification';

// Mock dependencies
jest.mock('../../repositories/notification-repository');
jest.mock('../../repositories/user-repository');
jest.mock('../email.service');

describe('NotificationService', () => {
  let pool: Pool;
  let notificationService: NotificationService;

  beforeEach(() => {
    pool = {} as Pool;
    notificationService = new NotificationService(pool);
  });

  describe('createNotification', () => {
    it('should create a system notification', async () => {
      const notificationData = {
        recipientId: 'user-1',
        senderId: 'user-2',
        type: NotificationType.SYSTEM,
        title: '測試通知',
        content: '這是一則測試通知'
      };

      const mockCreate = jest.fn().mockResolvedValue({
        notificationId: 'notif-1',
        ...notificationData,
        status: NotificationStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: () => ({ notificationId: 'notif-1', ...notificationData })
      });

      (notificationService as any).notificationRepo = {
        create: mockCreate
      };

      const result = await notificationService.createNotification(notificationData);

      expect(result).toBeDefined();
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should validate notification data', async () => {
      const invalidData = {
        recipientId: '',
        type: NotificationType.SYSTEM,
        title: '',
        content: ''
      };

      await expect(
        notificationService.createNotification(invalidData as any)
      ).rejects.toThrow();
    });
  });

  describe('getUnreadNotifications', () => {
    it('should return unread notifications for user', async () => {
      const userId = 'user-1';
      const mockNotifications = [
        {
          notificationId: 'notif-1',
          recipientId: userId,
          type: NotificationType.SYSTEM,
          title: '通知1',
          content: '內容1',
          status: NotificationStatus.PENDING,
          toJSON: () => ({})
        }
      ];

      const mockFindUnread = jest.fn().mockResolvedValue(mockNotifications);
      (notificationService as any).notificationRepo = {
        findUnreadByRecipient: mockFindUnread
      };

      const result = await notificationService.getUnreadNotifications(userId);

      expect(result).toEqual(mockNotifications);
      expect(mockFindUnread).toHaveBeenCalledWith(userId);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notificationId = 'notif-1';
      const mockUpdated = {
        notificationId,
        status: NotificationStatus.READ,
        readAt: new Date()
      };

      const mockMarkAsRead = jest.fn().mockResolvedValue(mockUpdated);
      (notificationService as any).notificationRepo = {
        markAsRead: mockMarkAsRead
      };

      const result = await notificationService.markAsRead(notificationId);

      expect(result).toEqual(mockUpdated);
      expect(mockMarkAsRead).toHaveBeenCalledWith(notificationId);
    });
  });
});
