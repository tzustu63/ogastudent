import { Response } from 'express';

/**
 * 統一的 API 回應格式，確保 UTF-8 編碼
 */
export class ResponseHelper {
  /**
   * 成功回應
   */
  static success(res: Response, data: any, message?: string, statusCode: number = 200) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(statusCode).json({
      success: true,
      data,
      ...(message && { message }),
    });
  }

  /**
   * 錯誤回應
   */
  static error(res: Response, message: string, statusCode: number = 400, details?: any) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        ...(details && { details }),
      },
    });
  }

  /**
   * 分頁回應
   */
  static paginated(res: Response, data: any[], pagination: any, statusCode: number = 200) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(statusCode).json({
      success: true,
      data,
      pagination,
    });
  }
}
