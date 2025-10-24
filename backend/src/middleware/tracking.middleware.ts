import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { TrackingService } from '../services/tracking.service';
import { ActionType } from '../models/tracking-record';

// 擴展Request介面以包含追蹤資訊
declare global {
  namespace Express {
    interface Request {
      trackingService?: TrackingService;
      trackingData?: {
        action_type?: ActionType;
        student_id?: string;
        document_id?: string;
        metadata?: Record<string, any>;
      };
    }
  }
}

// 建立追蹤服務中介軟體
export const createTrackingMiddleware = (pool: Pool) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.trackingService = new TrackingService(pool);
    next();
  };
};

// 自動記錄操作的中介軟體
export const autoTrackAction = (actionType: ActionType, options?: {
  extractStudentId?: (req: Request) => string | undefined;
  extractDocumentId?: (req: Request) => string | undefined;
  extractMetadata?: (req: Request) => Record<string, any> | undefined;
  description?: string;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 儲存原始的res.json方法
    const originalJson = res.json.bind(res);

    // 覆寫res.json方法以在回應後記錄追蹤
    res.json = function (body: any) {
      // 只在成功回應時記錄追蹤
      if (res.statusCode >= 200 && res.statusCode < 300 && body.success !== false) {
        // 非同步記錄追蹤，不阻塞回應
        setImmediate(async () => {
          try {
            const trackingService = req.trackingService;
            const user = (req as any).user;

            if (!trackingService || !user) {
              return;
            }

            const studentId = options?.extractStudentId?.(req) || req.trackingData?.student_id;
            const documentId = options?.extractDocumentId?.(req) || req.trackingData?.document_id;
            const metadata = options?.extractMetadata?.(req) || req.trackingData?.metadata;

            const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
              || req.socket.remoteAddress;
            const userAgent = req.headers['user-agent'];

            await trackingService.createTrackingRecord({
              user_id: user.user_id,
              student_id: studentId,
              document_id: documentId,
              action_type: actionType,
              description: options?.description,
              metadata,
              ip_address: ipAddress,
              user_agent: userAgent
            });
          } catch (error) {
            console.error('追蹤記錄失敗:', error);
          }
        });
      }

      return originalJson(body);
    };

    next();
  };
};

// 手動記錄追蹤的輔助函數
export const trackAction = async (
  req: Request,
  actionType: ActionType,
  options?: {
    student_id?: string;
    document_id?: string;
    description?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> => {
  try {
    const trackingService = req.trackingService;
    const user = (req as any).user;

    if (!trackingService || !user) {
      return;
    }

    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
      || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await trackingService.createTrackingRecord({
      user_id: user.user_id,
      student_id: options?.student_id,
      document_id: options?.document_id,
      action_type: actionType,
      description: options?.description,
      metadata: options?.metadata,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  } catch (error) {
    console.error('追蹤記錄失敗:', error);
  }
};
