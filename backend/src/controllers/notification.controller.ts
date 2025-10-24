import { Request, Response } from 'express';
import { Pool } from 'pg';
import { NotificationService, CreateNotificationData } from '../services/notification.service';
import { NotificationType } from '../models/notification';
import { NotificationFilter } from '../repositories/notification-repository';

export class NotificationController {
  private notificationService: NotificationService;

  constructor(pool: Pool) {
    this.notificationService = new NotificationService(pool);
  }

  // GET /api/notifications - 獲取使用者的通知列表
  getUserNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '未授權的請求'
          }
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unreadOnly === 'true';

      const filter: NotificationFilter = {
        recipientId: userId
      };

      if (unreadOnly) {
        filter.unreadOnly = true;
      }

      const result = await this.notificationService.searchNotifications(filter, { page, limit });

      res.json({
        success: true,
        data: result.data.map(n => n.toJSON()),
        pagination: result.pagination
      });
    } catch (error) {
      console.error('獲取通知列表失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '獲取通知列表失敗'
        }
      });
    }
  };

  // GET /api/notifications/unread - 獲取未讀通知
  getUnreadNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '未授權的請求'
          }
        });
        return;
      }

      const notifications = await this.notificationService.getUnreadNotifications(userId);

      res.json({
        success: true,
        data: notifications.map(n => n.toJSON()),
        count: notifications.length
      });
    } catch (error) {
      console.error('獲取未讀通知失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '獲取未讀通知失敗'
        }
      });
    }
  };

  // GET /api/notifications/unread/count - 獲取未讀通知數量
  getUnreadCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '未授權的請求'
          }
        });
        return;
      }

      const count = await this.notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('獲取未讀通知數量失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '獲取未讀通知數量失敗'
        }
      });
    }
  };

  // GET /api/notifications/:id - 獲取特定通知
  getNotificationById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const notification = await this.notificationService.getNotificationById(id);

      if (!notification) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '找不到該通知'
          }
        });
        return;
      }

      // 確認使用者有權限查看此通知
      if (notification.recipientId !== userId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '無權限查看此通知'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: notification.toJSON()
      });
    } catch (error) {
      console.error('獲取通知失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '獲取通知失敗'
        }
      });
    }
  };

  // POST /api/notifications - 創建新通知
  createNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { recipientId, type, title, content, metadata, scheduledAt } = req.body;

      if (!recipientId || !type || !title || !content) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '缺少必要欄位'
          }
        });
        return;
      }

      const notificationData: CreateNotificationData = {
        recipientId,
        senderId: userId,
        type: type as NotificationType,
        title,
        content,
        metadata
      };

      if (scheduledAt) {
        notificationData.scheduledAt = new Date(scheduledAt);
      }

      const notification = await this.notificationService.createNotification(notificationData);

      res.status(201).json({
        success: true,
        data: notification.toJSON(),
        message: '通知創建成功'
      });
    } catch (error) {
      console.error('創建通知失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : '創建通知失敗'
        }
      });
    }
  };

  // PUT /api/notifications/:id/read - 標記通知為已讀
  markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      // 先檢查通知是否存在且屬於該使用者
      const notification = await this.notificationService.getNotificationById(id);
      if (!notification) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '找不到該通知'
          }
        });
        return;
      }

      if (notification.recipientId !== userId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '無權限操作此通知'
          }
        });
        return;
      }

      const updated = await this.notificationService.markAsRead(id);

      res.json({
        success: true,
        data: updated?.toJSON(),
        message: '通知已標記為已讀'
      });
    } catch (error) {
      console.error('標記通知為已讀失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '標記通知為已讀失敗'
        }
      });
    }
  };

  // PUT /api/notifications/read-all - 標記所有通知為已讀
  markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '未授權的請求'
          }
        });
        return;
      }

      const count = await this.notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        data: { count },
        message: `已標記 ${count} 則通知為已讀`
      });
    } catch (error) {
      console.error('標記所有通知為已讀失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '標記所有通知為已讀失敗'
        }
      });
    }
  };

  // DELETE /api/notifications/:id - 刪除通知
  deleteNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      // 先檢查通知是否存在且屬於該使用者
      const notification = await this.notificationService.getNotificationById(id);
      if (!notification) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '找不到該通知'
          }
        });
        return;
      }

      if (notification.recipientId !== userId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '無權限刪除此通知'
          }
        });
        return;
      }

      await this.notificationService.deleteNotification(id);

      res.json({
        success: true,
        message: '通知已刪除'
      });
    } catch (error) {
      console.error('刪除通知失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '刪除通知失敗'
        }
      });
    }
  };

  // GET /api/notifications/settings - 獲取提醒設定
  getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRole = (req as any).user?.role;
      
      // 只有管理員可以查看設定
      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '無權限查看設定'
          }
        });
        return;
      }

      const { getSchedulerService } = await import('../services/scheduler.service');
      const scheduler = getSchedulerService(this.notificationService['notificationRepo']['pool']);
      const settings = scheduler.getSettings();

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('獲取提醒設定失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '獲取提醒設定失敗'
        }
      });
    }
  };

  // PUT /api/notifications/settings - 更新提醒設定
  updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRole = (req as any).user?.role;
      
      // 只有管理員可以更新設定
      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '無權限更新設定'
          }
        });
        return;
      }

      const { enabled, schedule, reminderDays, targetRoles } = req.body;

      const { getSchedulerService } = await import('../services/scheduler.service');
      const scheduler = getSchedulerService(this.notificationService['notificationRepo']['pool']);
      
      const updates: any = {};
      if (enabled !== undefined) updates.enabled = enabled;
      if (schedule) updates.schedule = schedule;
      if (reminderDays !== undefined) updates.reminderDays = reminderDays;
      if (targetRoles) updates.targetRoles = targetRoles;

      scheduler.updateSettings(updates);
      const settings = scheduler.getSettings();

      res.json({
        success: true,
        data: settings,
        message: '提醒設定已更新'
      });
    } catch (error) {
      console.error('更新提醒設定失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '更新提醒設定失敗'
        }
      });
    }
  };

  // POST /api/notifications/trigger/:taskName - 手動觸發排程任務
  triggerTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRole = (req as any).user?.role;
      const { taskName } = req.params;
      
      // 只有管理員可以觸發任務
      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '無權限觸發任務'
          }
        });
        return;
      }

      const { getSchedulerService } = await import('../services/scheduler.service');
      const scheduler = getSchedulerService(this.notificationService['notificationRepo']['pool']);
      
      await scheduler.triggerTask(taskName);

      res.json({
        success: true,
        message: `任務 ${taskName} 已執行`
      });
    } catch (error) {
      console.error('觸發任務失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : '觸發任務失敗'
        }
      });
    }
  };
}
