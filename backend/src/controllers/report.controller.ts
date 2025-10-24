import { Request, Response } from 'express';
import { Pool } from 'pg';
import { ReportService } from '../services/report.service';

export class ReportController {
  private reportService: ReportService;

  constructor(pool: Pool) {
    this.reportService = new ReportService(pool);
  }

  /**
   * 取得儀表板統計資料
   * GET /api/reports/dashboard
   */
  getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.reportService.getDashboardStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('取得儀表板統計失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_DASHBOARD_STATS_FAILED',
          message: error instanceof Error ? error.message : '取得儀表板統計失敗'
        }
      });
    }
  };

  /**
   * 取得稽核報表
   * GET /api/reports/audit
   */
  getAuditReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        startDate,
        endDate,
        unitId,
        action,
        page = '1',
        limit = '10'
      } = req.query;

      const result = await this.reportService.getAuditReport({
        startDate: startDate as string,
        endDate: endDate as string,
        unitId: unitId as string,
        action: action as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('取得稽核報表失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_AUDIT_REPORT_FAILED',
          message: error instanceof Error ? error.message : '取得稽核報表失敗'
        }
      });
    }
  };

  /**
   * 匯出稽核報表
   * GET /api/reports/export
   */
  exportAuditReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        startDate,
        endDate,
        unitId,
        action
      } = req.query;

      const buffer = await this.reportService.exportAuditReport({
        startDate: startDate as string,
        endDate: endDate as string,
        unitId: unitId as string,
        action: action as string
      });

      const filename = `audit-report-${new Date().toISOString().split('T')[0]}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error('匯出稽核報表失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'EXPORT_AUDIT_REPORT_FAILED',
          message: error instanceof Error ? error.message : '匯出稽核報表失敗'
        }
      });
    }
  };
}
