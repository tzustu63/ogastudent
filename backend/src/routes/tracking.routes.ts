import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { TrackingService } from '../services/tracking.service';
import { TrackingController } from '../controllers/tracking.controller';
import { authenticate } from '../middleware/auth.middleware';
import { createTrackingMiddleware } from '../middleware/tracking.middleware';

export const createTrackingRoutes = (pool: Pool): Router => {
  const router = Router();
  const trackingService = new TrackingService(pool);
  const trackingController = new TrackingController(trackingService, pool);

  // 套用追蹤服務中介軟體到所有路由
  router.use(createTrackingMiddleware(pool));

  // 所有路由都需要身份驗證
  router.use(authenticate);

  // GET /api/tracking - 取得追蹤記錄列表（支援多種篩選條件）
  router.get('/', trackingController.getTrackingRecords);

  // GET /api/tracking/recent - 取得最近的活動記錄
  router.get('/recent', trackingController.getRecentActivities);

  // GET /api/tracking/stats/system - 取得系統活動統計
  router.get('/stats/system', trackingController.getSystemActivityStats);

  // GET /api/tracking/stats/user/:userId - 取得使用者活動統計
  router.get('/stats/user/:userId', trackingController.getUserActivityStats);

  // 報表相關路由
  // GET /api/tracking/reports/audit - 產生稽核報表
  router.get('/reports/audit', trackingController.generateAuditReport);

  // GET /api/tracking/reports/completion - 產生完成度報表
  router.get('/reports/completion', trackingController.generateCompletionReport);

  // GET /api/tracking/reports/export/audit - 匯出稽核報表
  router.get('/reports/export/audit', trackingController.exportAuditReport);

  // GET /api/tracking/reports/export/completion - 匯出完成度報表
  router.get('/reports/export/completion', trackingController.exportCompletionReport);

  // GET /api/tracking/:recordId - 取得單一追蹤記錄
  router.get('/:recordId', trackingController.getTrackingRecord);

  // GET /api/tracking/student/:studentId - 取得學生的追蹤記錄
  router.get('/student/:studentId', trackingController.getStudentTrackingRecords);

  // GET /api/tracking/document/:documentId - 取得文件的追蹤記錄
  router.get('/document/:documentId', trackingController.getDocumentTrackingRecords);

  // GET /api/tracking/user/:userId - 取得使用者的追蹤記錄
  router.get('/user/:userId', trackingController.getUserTrackingRecords);

  return router;
};
