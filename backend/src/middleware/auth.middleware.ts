import { Request, Response, NextFunction } from 'express';
import authService, { JwtPayload } from '../services/auth.service';
import { UserRole } from '../types';

// 擴展Express Request類型以包含user資訊
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * JWT身份驗證中介軟體
 * 驗證請求中的JWT token並將使用者資訊附加到request物件
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 從Authorization header取得token
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: '未提供身份驗證token',
          suggestions: ['請在Authorization header中提供Bearer token']
        }
      });
      return;
    }

    // 檢查Bearer格式
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN_FORMAT',
          message: 'Token格式錯誤',
          suggestions: ['請使用格式: Authorization: Bearer <token>']
        }
      });
      return;
    }

    const token = parts[1];

    // 驗證token
    try {
      const payload = authService.verifyToken(token);
      req.user = payload;
      next();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'TOKEN_EXPIRED') {
          res.status(401).json({
            success: false,
            error: {
              code: 'TOKEN_EXPIRED',
              message: 'Token已過期',
              suggestions: ['請使用refresh token取得新的access token']
            }
          });
          return;
        }
        if (error.message === 'INVALID_TOKEN') {
          res.status(401).json({
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Token無效',
              suggestions: ['請重新登入取得有效的token']
            }
          });
          return;
        }
      }
      
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: '身份驗證失敗'
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '伺服器內部錯誤'
      }
    });
  }
};

/**
 * 可選的身份驗證中介軟體
 * 如果提供token則驗證，但不強制要求
 */
export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    next();
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    const token = parts[1];
    try {
      const payload = authService.verifyToken(token);
      req.user = payload;
    } catch (error) {
      // 忽略錯誤，繼續處理請求
    }
  }
  
  next();
};

/**
 * 角色驗證中介軟體工廠函數
 * 檢查使用者是否具有指定的角色
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '需要身份驗證'
        }
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '權限不足',
          details: {
            required_roles: allowedRoles,
            user_role: req.user.role
          },
          suggestions: ['請聯繫系統管理員取得相應權限']
        }
      });
      return;
    }

    next();
  };
};

/**
 * 單位驗證中介軟體
 * 檢查使用者是否屬於指定的單位
 */
export const requireUnit = (...allowedUnitIds: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '需要身份驗證'
        }
      });
      return;
    }

    if (!allowedUnitIds.includes(req.user.unit_id)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '單位權限不足',
          details: {
            required_units: allowedUnitIds,
            user_unit: req.user.unit_id
          },
          suggestions: ['此功能僅限特定單位使用']
        }
      });
      return;
    }

    next();
  };
};

/**
 * 檢查使用者是否為管理員或屬於指定單位
 */
export const requireAdminOrUnit = (...allowedUnitIds: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '需要身份驗證'
        }
      });
      return;
    }

    const isAdmin = req.user.role === UserRole.ADMIN;
    const isAllowedUnit = allowedUnitIds.includes(req.user.unit_id);

    if (!isAdmin && !isAllowedUnit) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '權限不足',
          suggestions: ['此功能需要管理員權限或特定單位權限']
        }
      });
      return;
    }

    next();
  };
};

/**
 * 檢查使用者是否為活躍狀態
 * 注意: 此中介軟體需要在authenticate之後使用
 */
export const requireActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '需要身份驗證'
      }
    });
    return;
  }

  // 這裡可以加入檢查使用者是否為活躍狀態的邏輯
  // 例如從資料庫查詢使用者的is_active欄位
  // 目前先簡單通過
  next();
};
