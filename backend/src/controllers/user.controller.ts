import { Request, Response } from 'express';
import { Pool } from 'pg';
import { UserService } from '../services/user.service';
import { UserRole } from '../models/user';

export class UserController {
  private userService: UserService;

  constructor(pool: Pool) {
    this.userService = new UserService(pool);
  }

  /**
   * 取得所有使用者列表
   * GET /api/users
   */
  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const currentUser = (req as any).user;

      // 只有管理員可以查看使用者列表
      if (currentUser?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '沒有權限執行此操作'
          }
        });
        return;
      }

      const { page = '1', limit = '20', role, unit_id } = req.query;

      const users = await this.userService.getUsers({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        role: role as string,
        unit_id: unit_id as string
      });

      res.json({
        success: true,
        data: users.data.map((user: any) => user.toApiResponse()),
        pagination: users.pagination
      });
    } catch (error) {
      console.error('取得使用者列表失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_USERS_FAILED',
          message: error instanceof Error ? error.message : '取得使用者列表失敗'
        }
      });
    }
  };

  /**
   * 取得單一使用者
   * GET /api/users/:id
   */
  getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      // 只有管理員可以查看其他使用者資料
      if (currentUser?.role !== 'admin' && currentUser?.user_id !== id) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '沒有權限執行此操作'
          }
        });
        return;
      }

      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '使用者不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: user.toApiResponse()
      });
    } catch (error) {
      console.error('取得使用者失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_USER_FAILED',
          message: error instanceof Error ? error.message : '取得使用者失敗'
        }
      });
    }
  };

  /**
   * 創建新使用者
   * POST /api/users
   */
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const currentUser = (req as any).user;

      // 只有管理員可以創建使用者
      if (currentUser?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '沒有權限執行此操作'
          }
        });
        return;
      }

      const { username, email, name, password, role, unit_id } = req.body;

      // 驗證必填欄位
      if (!username || !email || !name || !password || !role) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: '缺少必填欄位',
            details: {
              required: ['username', 'email', 'name', 'password', 'role']
            }
          }
        });
        return;
      }

      // 驗證角色
      if (!Object.values(UserRole).includes(role as UserRole)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ROLE',
            message: '無效的角色',
            details: {
              validRoles: Object.values(UserRole)
            }
          }
        });
        return;
      }

      // 如果是單位職員，必須提供 unit_id
      if (role === UserRole.UNIT_STAFF && !unit_id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_UNIT_ID',
            message: '單位職員必須指定所屬單位'
          }
        });
        return;
      }

      const user = await this.userService.createUser({
        username,
        email,
        name,
        password,
        role: role as UserRole,
        unit_id
      });

      res.status(201).json({
        success: true,
        message: '使用者創建成功',
        data: user.toApiResponse()
      });
    } catch (error) {
      console.error('創建使用者失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_USER_FAILED',
          message: error instanceof Error ? error.message : '創建使用者失敗'
        }
      });
    }
  };

  /**
   * 更新使用者
   * PUT /api/users/:id
   */
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      // 只有管理員可以更新其他使用者
      if (currentUser?.role !== 'admin' && currentUser?.user_id !== id) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '沒有權限執行此操作'
          }
        });
        return;
      }

      const { email, name, role, unit_id, is_active } = req.body;

      // 如果要變更角色，只有管理員可以
      if (role && currentUser?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '只有管理員可以變更角色'
          }
        });
        return;
      }

      const user = await this.userService.updateUser(id, {
        email,
        name,
        role: role as UserRole,
        unit_id,
        is_active
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '使用者不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: '使用者更新成功',
        data: user.toApiResponse()
      });
    } catch (error) {
      console.error('更新使用者失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_USER_FAILED',
          message: error instanceof Error ? error.message : '更新使用者失敗'
        }
      });
    }
  };

  /**
   * 刪除使用者
   * DELETE /api/users/:id
   */
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;

      // 只有管理員可以刪除使用者
      if (currentUser?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '沒有權限執行此操作'
          }
        });
        return;
      }

      // 不能刪除自己
      if (currentUser?.user_id === id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_DELETE_SELF',
            message: '不能刪除自己的帳號'
          }
        });
        return;
      }

      const deleted = await this.userService.deleteUser(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '使用者不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: '使用者刪除成功'
      });
    } catch (error) {
      console.error('刪除使用者失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_USER_FAILED',
          message: error instanceof Error ? error.message : '刪除使用者失敗'
        }
      });
    }
  };

  /**
   * 重設使用者密碼
   * POST /api/users/:id/reset-password
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      const currentUser = (req as any).user;

      // 只有管理員可以重設其他使用者密碼
      if (currentUser?.role !== 'admin' && currentUser?.user_id !== id) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '沒有權限執行此操作'
          }
        });
        return;
      }

      if (!newPassword) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_PASSWORD',
            message: '請提供新密碼'
          }
        });
        return;
      }

      await this.userService.resetPassword(id, newPassword);

      res.json({
        success: true,
        message: '密碼重設成功'
      });
    } catch (error) {
      console.error('重設密碼失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'RESET_PASSWORD_FAILED',
          message: error instanceof Error ? error.message : '重設密碼失敗'
        }
      });
    }
  };
}
