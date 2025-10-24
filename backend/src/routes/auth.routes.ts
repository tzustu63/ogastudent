import { Router } from 'express';
import { Pool } from 'pg';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

export function createAuthRoutes(pool: Pool): Router {
  const router = Router();
  const authController = new AuthController(pool);

  /**
   * @route   POST /api/auth/login
   * @desc    使用者登入 (本地認證)
   * @access  Public
   */
  router.post('/login', authController.login);

  /**
   * @route   POST /api/auth/logout
   * @desc    使用者登出
   * @access  Private
   */
  router.post('/logout', authenticate, authController.logout);

  /**
   * @route   POST /api/auth/refresh
   * @desc    刷新access token
   * @access  Public
   */
  router.post('/refresh', authController.refreshToken);

  /**
   * @route   GET /api/auth/me
   * @desc    取得當前使用者資訊
   * @access  Private
   */
  router.get('/me', authenticate, authController.getCurrentUser);

  /**
   * @route   POST /api/auth/change-password
   * @desc    變更密碼
   * @access  Private
   */
  router.post('/change-password', authenticate, authController.changePassword);

  return router;
}
