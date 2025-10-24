import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

export function createNotificationRoutes(pool: Pool): Router {
  const router = Router();
  const controller = new NotificationController(pool);

  // 所有路由都需要身份驗證
  router.use(authenticate);

  // GET /api/notifications - 獲取使用者的通知列表
  router.get('/', controller.getUserNotifications);

  // GET /api/notifications/unread - 獲取未讀通知
  router.get('/unread', controller.getUnreadNotifications);

  // GET /api/notifications/unread/count - 獲取未讀通知數量
  router.get('/unread/count', controller.getUnreadCount);

  // PUT /api/notifications/read-all - 標記所有通知為已讀
  router.put('/read-all', controller.markAllAsRead);

  // GET /api/notifications/:id - 獲取特定通知
  router.get('/:id', controller.getNotificationById);

  // POST /api/notifications - 創建新通知
  router.post('/', controller.createNotification);

  // PUT /api/notifications/:id/read - 標記通知為已讀
  router.put('/:id/read', controller.markAsRead);

  // DELETE /api/notifications/:id - 刪除通知
  router.delete('/:id', controller.deleteNotification);

  // GET /api/notifications/settings - 獲取提醒設定
  router.get('/settings', controller.getSettings);

  // PUT /api/notifications/settings - 更新提醒設定
  router.put('/settings', controller.updateSettings);

  // POST /api/notifications/trigger/:taskName - 手動觸發排程任務
  router.post('/trigger/:taskName', controller.triggerTask);

  return router;
}
