import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

// 錯誤回應介面
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    suggestions?: string[];
    stack?: string;
  };
}

// 全域錯誤處理中介軟體
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 預設錯誤值
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = '伺服器內部錯誤';
  let details: any = undefined;
  let suggestions: string[] | undefined = undefined;
  let isOperational = false;

  // 如果是自定義錯誤
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
    suggestions = err.suggestions;
    isOperational = err.isOperational;
  }

  // 記錄錯誤
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: (req as any).user?.userId,
    statusCode,
    code,
    message,
    details,
    stack: err.stack,
  };

  if (isOperational) {
    logger.warn(`Operational Error: ${JSON.stringify(errorLog)}`);
  } else {
    logger.error(`System Error: ${JSON.stringify(errorLog)}`);
  }

  // 建立錯誤回應
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
      suggestions,
    },
  };

  // 在開發環境中包含堆疊追蹤
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // 發送錯誤回應
  res.status(statusCode).json(errorResponse);
};

// 非同步錯誤包裝器
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 錯誤處理
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    `找不到請求的資源: ${req.method} ${req.url}`,
    404,
    'NOT_FOUND',
    true
  );
  next(error);
};

// 處理未捕獲的 Promise 拒絕
export const handleUnhandledRejection = (): void => {
  process.on('unhandledRejection', (reason: Error) => {
    logger.error(`Unhandled Rejection: ${reason.message}`, { stack: reason.stack });
    // 在生產環境中，可能需要優雅地關閉伺服器
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
};

// 處理未捕獲的例外
export const handleUncaughtException = (): void => {
  process.on('uncaughtException', (error: Error) => {
    logger.error(`Uncaught Exception: ${error.message}`, { stack: error.stack });
    // 未捕獲的例外是嚴重錯誤，應該終止程序
    process.exit(1);
  });
};
