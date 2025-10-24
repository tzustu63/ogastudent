import request from 'supertest';
import express from 'express';
import { Pool } from 'pg';
import { createAuthRoutes } from '../../routes/auth.routes';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  cleanupTestData,
  createTestUser,
} from './setup';

describe('Authentication Integration Tests', () => {
  let app: express.Application;
  let pool: Pool;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    pool = env.pool;

    app = express();
    app.use(express.json());
    app.use('/api/auth', createAuthRoutes(pool));
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  beforeEach(async () => {
    await cleanupTestData(pool);
  });

  describe('POST /api/auth/login', () => {
    it('應該成功登入並返回 JWT token', async () => {
      // 建立測試使用者
      await createTestUser(pool, {
        username: 'test_user',
        email: 'test@example.com',
        name: 'Test User',
        unitId: 'unit_001',
        role: 'staff',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test_user',
          password: 'test_password',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
    });

    it('應該拒絕無效的登入憑證', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'invalid_user',
          password: 'wrong_password',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('應該返回已認證使用者的資訊', async () => {
      // 建立測試使用者並取得 token
      await createTestUser(pool, {
        username: 'test_user',
        email: 'test@example.com',
        name: 'Test User',
        unitId: 'unit_001',
        role: 'staff',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test_user',
          password: 'test_password',
        });

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe('test_user');
    });

    it('應該拒絕未認證的請求', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
