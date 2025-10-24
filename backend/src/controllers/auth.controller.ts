import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { UserRepository } from '../repositories/user-repository';
import { Pool } from 'pg';
import { LoginCredentials, LoginResponse, RefreshTokenRequest, RefreshTokenResponse } from '../types';

export class AuthController {
  private userRepository: UserRepository;

  constructor(pool: Pool) {
    this.userRepository = new UserRepository(pool);
  }

  /**
   * 使用者登入 (本地認證)
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password }: LoginCredentials = req.body;

      // 驗證輸入
      if (!username || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_CREDENTIALS',
            message: '請提供使用者名稱和密碼',
            suggestions: ['確認username和password欄位已填寫']
          }
        });
        return;
      }

      // 查詢使用者
      const user = await this.userRepository.findByUsername(username);
      
      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: '使用者名稱或密碼錯誤'
          }
        });
        return;
      }

      // 檢查使用者是否啟用
      if (!user.is_active) {
        res.status(403).json({
          success: false,
          error: {
            code: 'USER_DISABLED',
            message: '此帳號已被停用',
            suggestions: ['請聯繫系統管理員']
          }
        });
        return;
      }

      // 驗證密碼
      const isPasswordValid = await authService.verifyPassword(password, user.password_hash || '');
      
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: '使用者名稱或密碼錯誤'
          }
        });
        return;
      }

      // 產生token pair
      const tokens = authService.generateTokenPair(user.toJSON() as any);

      // 更新最後登入時間
      await this.userRepository.updateLastLogin(user.user_id);

      // 回傳登入成功資訊
      const response: LoginResponse = {
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          unit_id: user.unit_id || ''
        },
        tokens: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in
        }
      };

      res.status(200).json({
        success: true,
        data: response,
        message: '登入成功'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: '登入失敗',
          details: error instanceof Error ? error.message : '未知錯誤'
        }
      });
    }
  };

  /**
   * 使用者登出
   * POST /api/auth/logout
   */
  logout = async (_req: Request, res: Response): Promise<void> => {
    try {
      // 在實際應用中，這裡可以將token加入黑名單
      // 或者在Redis中記錄已登出的token
      
      res.status(200).json({
        success: true,
        message: '登出成功'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_FAILED',
          message: '登出失敗'
        }
      });
    }
  };

  /**
   * 刷新access token
   * POST /api/auth/refresh
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refresh_token }: RefreshTokenRequest = req.body;

      if (!refresh_token) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REFRESH_TOKEN',
            message: '請提供refresh token'
          }
        });
        return;
      }

      // 驗證並產生新的access token
      try {
        const newAccessToken = authService.refreshAccessToken(refresh_token);

        const response: RefreshTokenResponse = {
          access_token: newAccessToken,
          expires_in: authService['parseExpiresIn'](process.env.JWT_EXPIRES_IN || '24h')
        };

        res.status(200).json({
          success: true,
          data: response,
          message: 'Token刷新成功'
        });
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'TOKEN_EXPIRED') {
            res.status(401).json({
              success: false,
              error: {
                code: 'REFRESH_TOKEN_EXPIRED',
                message: 'Refresh token已過期',
                suggestions: ['請重新登入']
              }
            });
            return;
          }
          if (error.message === 'INVALID_TOKEN') {
            res.status(401).json({
              success: false,
              error: {
                code: 'INVALID_REFRESH_TOKEN',
                message: 'Refresh token無效',
                suggestions: ['請重新登入']
              }
            });
            return;
          }
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REFRESH_FAILED',
          message: 'Token刷新失敗'
        }
      });
    }
  };

  /**
   * 取得當前使用者資訊
   * GET /api/auth/me
   */
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
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

      // 從資料庫取得完整的使用者資訊
      const user = await this.userRepository.findById(req.user.user_id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '找不到使用者'
          }
        });
        return;
      }

      // 不回傳密碼雜湊
      const userData = user.toJSON();
      delete (userData as any).password_hash;

      res.status(200).json({
        success: true,
        data: userData
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_USER_FAILED',
          message: '取得使用者資訊失敗'
        }
      });
    }
  };

  /**
   * 變更密碼
   * POST /api/auth/change-password
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
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

      const { current_password, new_password } = req.body;

      // 驗證輸入
      if (!current_password || !new_password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: '請提供當前密碼和新密碼'
          }
        });
        return;
      }

      // 驗證新密碼強度
      if (new_password.length < 8) {
        res.status(400).json({
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: '密碼長度至少需要8個字元',
            suggestions: ['使用包含大小寫字母、數字和特殊字元的強密碼']
          }
        });
        return;
      }

      // 取得使用者
      const user = await this.userRepository.findById(req.user.user_id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '找不到使用者'
          }
        });
        return;
      }

      // 驗證當前密碼
      const isCurrentPasswordValid = await authService.verifyPassword(
        current_password,
        user.password_hash || ''
      );

      if (!isCurrentPasswordValid) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CURRENT_PASSWORD',
            message: '當前密碼錯誤'
          }
        });
        return;
      }

      // 雜湊新密碼
      const newPasswordHash = await authService.hashPassword(new_password);

      // 更新密碼
      user.password_hash = newPasswordHash;
      await this.userRepository.update(user.user_id, user.toDatabaseUpdate());

      res.status(200).json({
        success: true,
        message: '密碼變更成功'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CHANGE_PASSWORD_FAILED',
          message: '密碼變更失敗'
        }
      });
    }
  };
}
