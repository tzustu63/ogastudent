import { Router } from 'express';
import { Pool } from 'pg';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

export const createUserRoutes = (pool: Pool): Router => {
  const router = Router();
  const userController = new UserController(pool);

  // 所有路由都需要身份驗證
  router.use(authenticate);

  // GET /api/users - 取得使用者列表（只有管理員）
  router.get('/', userController.getUsers);

  // GET /api/users/:id - 取得單一使用者
  router.get('/:id', userController.getUser);

  // POST /api/users - 創建新使用者（只有管理員）
  router.post('/', userController.createUser);

  // PUT /api/users/:id - 更新使用者
  router.put('/:id', userController.updateUser);

  // DELETE /api/users/:id - 刪除使用者（只有管理員）
  router.delete('/:id', userController.deleteUser);

  // POST /api/users/:id/reset-password - 重設密碼
  router.post('/:id/reset-password', userController.resetPassword);

  return router;
};
