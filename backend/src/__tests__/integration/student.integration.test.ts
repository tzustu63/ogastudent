import request from 'supertest';
import express from 'express';
import { Pool } from 'pg';
import { createStudentRoutes } from '../../routes/student.routes';
import { authenticate } from '../../middleware/auth.middleware';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  cleanupTestData,
  createTestUser,
  createTestStudent,
} from './setup';

describe('Student Management Integration Tests', () => {
  let app: express.Application;
  let pool: Pool;
  let authToken: string;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    pool = env.pool;

    app = express();
    app.use(express.json());
    app.use('/api/students', authenticate, createStudentRoutes(pool));
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  beforeEach(async () => {
    await cleanupTestData(pool);

    // 建立測試使用者並取得 token
    const user = await createTestUser(pool, {
      username: 'test_staff',
      email: 'staff@example.com',
      name: 'Test Staff',
      unitId: 'unit_001',
      role: 'staff',
    });

    // 模擬 token（實際應該透過登入取得）
    authToken = 'mock_token';
  });

  describe('GET /api/students', () => {
    it('應該返回學生列表', async () => {
      // 建立測試學生
      await createTestStudent(pool, {
        studentId: 'S001',
        name: 'Test Student 1',
        email: 'student1@example.com',
        nationality: 'Taiwan',
        program: 'Computer Science',
      });

      await createTestStudent(pool, {
        studentId: 'S002',
        name: 'Test Student 2',
        email: 'student2@example.com',
        nationality: 'Japan',
        program: 'Business',
      });

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('應該支援搜尋和篩選', async () => {
      await createTestStudent(pool, {
        studentId: 'S001',
        name: 'John Doe',
        email: 'john@example.com',
        nationality: 'USA',
        program: 'Computer Science',
      });

      const response = await request(app)
        .get('/api/students?search=John')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/students/:id', () => {
    it('應該返回特定學生的詳細資訊', async () => {
      const student = await createTestStudent(pool, {
        studentId: 'S001',
        name: 'Test Student',
        email: 'student@example.com',
        nationality: 'Taiwan',
        program: 'Computer Science',
      });

      const response = await request(app)
        .get(`/api/students/${student.student_id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.student_id).toBe('S001');
    });

    it('應該返回 404 當學生不存在', async () => {
      const response = await request(app)
        .get('/api/students/NONEXISTENT')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/students/:id/completion', () => {
    it('應該返回學生的資料完成度', async () => {
      const student = await createTestStudent(pool, {
        studentId: 'S001',
        name: 'Test Student',
        email: 'student@example.com',
        nationality: 'Taiwan',
        program: 'Computer Science',
      });

      const response = await request(app)
        .get(`/api/students/${student.student_id}/completion`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('completionRate');
      expect(response.body.data).toHaveProperty('totalDocuments');
      expect(response.body.data).toHaveProperty('uploadedDocuments');
    });
  });
});
