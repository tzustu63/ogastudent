import request from 'supertest';
import express from 'express';
import { Pool } from 'pg';
import { createAuthRoutes } from '../../routes/auth.routes';
import { createStudentRoutes } from '../../routes/student.routes';
import { createDocumentRoutes } from '../../routes/document.routes';
import { createTrackingRoutes } from '../../routes/tracking.routes';
import { authenticate } from '../../middleware/auth.middleware';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  cleanupTestData,
  createTestUser,
  createTestStudent,
} from './setup';

describe('End-to-End Workflow Integration Tests', () => {
  let app: express.Application;
  let pool: Pool;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    pool = env.pool;

    // 設定完整的應用程式
    app = express();
    app.use(express.json());
    app.use('/api/auth', createAuthRoutes(pool));
    app.use('/api/students', authenticate, createStudentRoutes(pool));
    app.use('/api/documents', authenticate, createDocumentRoutes(pool));
    app.use('/api/tracking', authenticate, createTrackingRoutes(pool));
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  beforeEach(async () => {
    await cleanupTestData(pool);
  });

  describe('完整的文件上傳和查核流程', () => {
    it('應該完成從登入到文件上傳的完整流程', async () => {
      // 步驟 1: 建立測試使用者
      await createTestUser(pool, {
        username: 'test_staff',
        email: 'staff@example.com',
        name: 'Test Staff',
        unitId: 'unit_001',
        role: 'staff',
      });

      // 步驟 2: 登入取得 token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test_staff',
          password: 'test_password',
        });

      expect(loginResponse.status).toBe(200);
      const token = loginResponse.body.data.token;

      // 步驟 3: 建立學生
      const student = await createTestStudent(pool, {
        studentId: 'S001',
        name: 'Test Student',
        email: 'student@example.com',
        nationality: 'Taiwan',
        program: 'Computer Science',
      });

      // 步驟 4: 查詢學生資訊
      const studentResponse = await request(app)
        .get(`/api/students/${student.student_id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(studentResponse.status).toBe(200);
      expect(studentResponse.body.data.student_id).toBe('S001');

      // 步驟 5: 上傳文件（網頁連結）
      const documentResponse = await request(app)
        .post('/api/documents/link')
        .set('Authorization', `Bearer ${token}`)
        .send({
          studentId: student.student_id,
          typeId: 'type_001',
          webUrl: 'https://example.com/document',
          remarks: 'Test document for verification',
        });

      expect(documentResponse.status).toBe(201);
      const documentId = documentResponse.body.data.document_id;

      // 步驟 6: 查詢學生的文件列表
      const documentsResponse = await request(app)
        .get(`/api/students/${student.student_id}/documents`)
        .set('Authorization', `Bearer ${token}`);

      expect(documentsResponse.status).toBe(200);
      expect(documentsResponse.body.data.length).toBeGreaterThan(0);

      // 步驟 7: 查詢學生的完成度
      const completionResponse = await request(app)
        .get(`/api/students/${student.student_id}/completion`)
        .set('Authorization', `Bearer ${token}`);

      expect(completionResponse.status).toBe(200);
      expect(completionResponse.body.data).toHaveProperty('completionRate');

      // 步驟 8: 查詢追蹤記錄
      const trackingResponse = await request(app)
        .get('/api/tracking')
        .query({ studentId: student.student_id })
        .set('Authorization', `Bearer ${token}`);

      expect(trackingResponse.status).toBe(200);
      expect(trackingResponse.body.success).toBe(true);
    });

    it('應該正確處理權限控制', async () => {
      // 建立不同角色的使用者
      await createTestUser(pool, {
        username: 'test_student',
        email: 'student@example.com',
        name: 'Test Student User',
        unitId: 'unit_002',
        role: 'student',
      });

      // 學生登入
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test_student',
          password: 'test_password',
        });

      const token = loginResponse.body.data.token;

      // 學生嘗試上傳文件（應該被拒絕）
      const uploadResponse = await request(app)
        .post('/api/documents/link')
        .set('Authorization', `Bearer ${token}`)
        .send({
          studentId: 'S001',
          typeId: 'type_001',
          webUrl: 'https://example.com/document',
        });

      expect(uploadResponse.status).toBe(403);
      expect(uploadResponse.body.success).toBe(false);
    });
  });

  describe('資料一致性測試', () => {
    it('應該確保文件和追蹤記錄的一致性', async () => {
      // 建立使用者和學生
      await createTestUser(pool, {
        username: 'test_staff',
        email: 'staff@example.com',
        name: 'Test Staff',
        unitId: 'unit_001',
        role: 'staff',
      });

      const student = await createTestStudent(pool, {
        studentId: 'S001',
        name: 'Test Student',
        email: 'student@example.com',
        nationality: 'Taiwan',
        program: 'Computer Science',
      });

      // 登入
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test_staff',
          password: 'test_password',
        });

      const token = loginResponse.body.data.token;

      // 上傳文件
      const documentResponse = await request(app)
        .post('/api/documents/link')
        .set('Authorization', `Bearer ${token}`)
        .send({
          studentId: student.student_id,
          typeId: 'type_001',
          webUrl: 'https://example.com/document',
          remarks: 'Test document',
        });

      const documentId = documentResponse.body.data.document_id;

      // 驗證追蹤記錄已建立
      const trackingResponse = await request(app)
        .get('/api/tracking')
        .query({ documentId })
        .set('Authorization', `Bearer ${token}`);

      expect(trackingResponse.status).toBe(200);
      expect(trackingResponse.body.data.length).toBeGreaterThan(0);

      // 刪除文件
      await request(app)
        .delete(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${token}`);

      // 驗證追蹤記錄仍然存在（保留歷史記錄）
      const trackingAfterDelete = await request(app)
        .get('/api/tracking')
        .query({ documentId })
        .set('Authorization', `Bearer ${token}`);

      expect(trackingAfterDelete.status).toBe(200);
    });
  });
});
