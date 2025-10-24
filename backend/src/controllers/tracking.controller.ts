import { Request, Response } from 'express';
import { TrackingService } from '../services/tracking.service';
import { ReportService } from '../services/report.service';
import { ActionType } from '../models/tracking-record';
import { Pool } from 'pg';

export class TrackingController {
  private trackingService: TrackingService;
  private reportService: ReportService;

  constructor(trackingService: TrackingService, pool: Pool) {
    this.trackingService = trackingService;
    this.reportService = new ReportService(pool);
  }

  // 取得追蹤記錄列表（支援多種篩選條件）
  getTrackingRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        student_id,
        document_id,
        user_id,
        action_type,
        date_from,
        date_to,
        ip_address,
        page = '1',
        limit = '20',
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      // 建構篩選條件
      const filters: any = {};
      if (student_id) filters.student_id = student_id as string;
      if (document_id) filters.document_id = document_id as string;
      if (user_id) filters.user_id = user_id as string;
      if (action_type) filters.action_type = action_type as ActionType;
      if (date_from) filters.date_from = new Date(date_from as string);
      if (date_to) filters.date_to = new Date(date_to as string);
      if (ip_address) filters.ip_address = ip_address as string;

      // 分頁選項
      const paginationOptions = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sort_by as string,
        sortOrder: (sort_order as string).toUpperCase() as 'ASC' | 'DESC'
      };

      const result = await this.trackingService.getTrackingRecords(filters, paginationOptions);

      res.json({
        success: true,
        data: result.data.map(record => record.toApiResponse()),
        pagination: result.pagination
      });
    } catch (error: any) {
      console.error('取得追蹤記錄失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_TRACKING_RECORDS_FAILED',
          message: '取得追蹤記錄失敗',
          details: error.message
        }
      });
    }
  };

  // 取得單一追蹤記錄
  getTrackingRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recordId } = req.params;

      const record = await this.trackingService.getTrackingRecord(recordId);

      if (!record) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TRACKING_RECORD_NOT_FOUND',
            message: '找不到追蹤記錄'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: record.toApiResponse()
      });
    } catch (error: any) {
      console.error('取得追蹤記錄失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_TRACKING_RECORD_FAILED',
          message: '取得追蹤記錄失敗',
          details: error.message
        }
      });
    }
  };

  // 取得學生的追蹤記錄
  getStudentTrackingRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params;
      const {
        page = '1',
        limit = '20',
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      const paginationOptions = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sort_by as string,
        sortOrder: (sort_order as string).toUpperCase() as 'ASC' | 'DESC'
      };

      const result = await this.trackingService.getTrackingRecordsByStudent(
        studentId,
        paginationOptions
      );

      res.json({
        success: true,
        data: result.data.map(record => record.toApiResponse()),
        pagination: result.pagination
      });
    } catch (error: any) {
      console.error('取得學生追蹤記錄失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_STUDENT_TRACKING_RECORDS_FAILED',
          message: '取得學生追蹤記錄失敗',
          details: error.message
        }
      });
    }
  };

  // 取得文件的追蹤記錄
  getDocumentTrackingRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const { documentId } = req.params;
      const {
        page = '1',
        limit = '20',
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      const paginationOptions = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sort_by as string,
        sortOrder: (sort_order as string).toUpperCase() as 'ASC' | 'DESC'
      };

      const result = await this.trackingService.getTrackingRecordsByDocument(
        documentId,
        paginationOptions
      );

      res.json({
        success: true,
        data: result.data.map(record => record.toApiResponse()),
        pagination: result.pagination
      });
    } catch (error: any) {
      console.error('取得文件追蹤記錄失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_DOCUMENT_TRACKING_RECORDS_FAILED',
          message: '取得文件追蹤記錄失敗',
          details: error.message
        }
      });
    }
  };

  // 取得使用者的追蹤記錄
  getUserTrackingRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const {
        page = '1',
        limit = '20',
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      const paginationOptions = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sort_by as string,
        sortOrder: (sort_order as string).toUpperCase() as 'ASC' | 'DESC'
      };

      const result = await this.trackingService.getTrackingRecordsByUser(
        userId,
        paginationOptions
      );

      res.json({
        success: true,
        data: result.data.map(record => record.toApiResponse()),
        pagination: result.pagination
      });
    } catch (error: any) {
      console.error('取得使用者追蹤記錄失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_USER_TRACKING_RECORDS_FAILED',
          message: '取得使用者追蹤記錄失敗',
          details: error.message
        }
      });
    }
  };

  // 取得最近的活動記錄
  getRecentActivities = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = '50' } = req.query;

      const records = await this.trackingService.getRecentActivities(parseInt(limit as string));

      res.json({
        success: true,
        data: records.map(record => record.toApiResponse())
      });
    } catch (error: any) {
      console.error('取得最近活動記錄失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_RECENT_ACTIVITIES_FAILED',
          message: '取得最近活動記錄失敗',
          details: error.message
        }
      });
    }
  };

  // 取得使用者活動統計
  getUserActivityStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { days = '30' } = req.query;

      const stats = await this.trackingService.getUserActivityStats(
        userId,
        parseInt(days as string)
      );

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('取得使用者活動統計失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_USER_ACTIVITY_STATS_FAILED',
          message: '取得使用者活動統計失敗',
          details: error.message
        }
      });
    }
  };

  // 取得系統活動統計
  getSystemActivityStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { days = '30' } = req.query;

      const stats = await this.trackingService.getSystemActivityStats(
        parseInt(days as string)
      );

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('取得系統活動統計失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_SYSTEM_ACTIVITY_STATS_FAILED',
          message: '取得系統活動統計失敗',
          details: error.message
        }
      });
    }
  };

  // 產生稽核報表
  generateAuditReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        unit_id,
        date_from,
        date_to,
        student_id,
        document_type_id,
        action_type
      } = req.query;

      const filters: any = {};
      if (unit_id) filters.unit_id = unit_id as string;
      if (student_id) filters.student_id = student_id as string;
      if (document_type_id) filters.document_type_id = document_type_id as string;
      if (action_type) filters.action_type = action_type as string;
      if (date_from) filters.date_from = new Date(date_from as string);
      if (date_to) filters.date_to = new Date(date_to as string);

      const report = await this.reportService.generateAuditReport(filters);

      res.json({
        success: true,
        data: report
      });
    } catch (error: any) {
      console.error('產生稽核報表失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GENERATE_AUDIT_REPORT_FAILED',
          message: '產生稽核報表失敗',
          details: error.message
        }
      });
    }
  };

  // 產生完成度報表
  generateCompletionReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { unit_id, program } = req.query;

      const filters: any = {};
      if (unit_id) filters.unit_id = unit_id as string;
      if (program) filters.program = program as string;

      const report = await this.reportService.generateCompletionReport(filters);

      res.json({
        success: true,
        data: report
      });
    } catch (error: any) {
      console.error('產生完成度報表失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GENERATE_COMPLETION_REPORT_FAILED',
          message: '產生完成度報表失敗',
          details: error.message
        }
      });
    }
  };

  // 匯出稽核報表
  exportAuditReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        unit_id,
        date_from,
        date_to,
        student_id,
        document_type_id,
        action_type,
        format = 'csv'
      } = req.query;

      const filters: any = {};
      if (unit_id) filters.unit_id = unit_id as string;
      if (student_id) filters.student_id = student_id as string;
      if (document_type_id) filters.document_type_id = document_type_id as string;
      if (action_type) filters.action_type = action_type as string;
      if (date_from) filters.date_from = new Date(date_from as string);
      if (date_to) filters.date_to = new Date(date_to as string);

      if (format === 'csv') {
        const csvContent = await this.reportService.exportAuditReportToCSV(filters);

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="audit_report_${Date.now()}.csv"`);
        res.send('\uFEFF' + csvContent); // 添加BOM以支援中文
      } else {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FORMAT',
            message: '不支援的匯出格式'
          }
        });
      }
    } catch (error: any) {
      console.error('匯出稽核報表失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'EXPORT_AUDIT_REPORT_FAILED',
          message: '匯出稽核報表失敗',
          details: error.message
        }
      });
    }
  };

  // 匯出完成度報表
  exportCompletionReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { format = 'csv' } = req.query;

      if (format === 'csv') {
        const csvContent = await this.reportService.exportCompletionReportToCSV();

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="completion_report_${Date.now()}.csv"`);
        res.send('\uFEFF' + csvContent); // 添加BOM以支援中文
      } else {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FORMAT',
            message: '不支援的匯出格式'
          }
        });
      }
    } catch (error: any) {
      console.error('匯出完成度報表失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'EXPORT_COMPLETION_REPORT_FAILED',
          message: '匯出完成度報表失敗',
          details: error.message
        }
      });
    }
  };
}
