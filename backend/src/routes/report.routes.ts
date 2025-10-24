import { Router } from 'express';
import { Pool } from 'pg';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

export const createReportRoutes = (pool: Pool): Router => {
  const router = Router();
  const reportController = new ReportController(pool);

  // 所有路由都需要身份驗證
  router.use(authenticate);

  // GET /api/reports/dashboard - 取得儀表板統計資料
  router.get('/dashboard', reportController.getDashboardStats);

  // GET /api/reports/audit - 取得稽核報表
  router.get('/audit', reportController.getAuditReport);

  // GET /api/reports/export - 匯出稽核報表
  router.get('/export', reportController.exportAuditReport);

  return router;
};
