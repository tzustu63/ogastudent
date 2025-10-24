import request from 'supertest';
import express from 'express';
import { Pool } from 'pg';
import { createDocumentRoutes } from '../../routes/document.routes';
import { authenticate } from '../../middleware/auth.middleware';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
  cleanupTestData,
  createTestUser,
  createTestStudent,
  createTestDocument,
} from './setup';

describe('Document Management Integration Tests', () => {
  let app: express.Application;
  let pool: Pool;
  let authToken: string;
  let testStudent: any;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    pool = env.pool;

    app = express();
    app.use(express.json());
    app.use('/api/documents', authenticate, createDocumentRoutes(pool));
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  beforeEach(async () => {
    await cleanupTestData(pool);

    // 建立測試使用者
    await createTestUser(pool, {
      username: 'test_staff',
      email: 'staff@example.com',
      name: 'Test Staff',
      unitId: 'unit_001',
      role: 'staff',
    });

    // 建立測試學生
    testStudent = await createTestStudent(pool, {
      studentId: 'S001',
      name: 'Test Student',
      email: 'student@example.com',
      nationality: 'Taiwan',
      program: 'Computer Science',
    });

    authToken = 'mock_token';
  });

  describe('POST /api/documents/link', () => {
    it('應該成功新增網頁連結', async () => {
      const response = await request(app)
        .post('/api/documents/link')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          studentId: testStudent.student_id,
          typeId: 'type_001',
          webUrl: 'https://example.com/document',
          remarks: 'Test document link',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('document_id');
    });

    it('應該驗證 URL 格式', async () => {
      const response = await request(app)
        .post('/api/documents/link')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          studentId: testStudent.student_id,
          typeId: 'type_001',
          webUrl: 'invalid-url',
          remarks: 'Test document link',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/documents/:id', () => {
    it('應該返回文件詳細資訊', async () => {
      const document = await createTestDocument(pool, {
        studentId: testStudent.student_id,
        typeId: 'type_001',
        uploaderId: 'user_001',
        contentType: 'web_link',
        webUrl: 'https://example.com/document',
        remarks: 'Test document',
      });

      const response = await request(app)
        .get(`/api/documents/${document.document_id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.document_id).toBe(document.document_id);
    });
  });

  describe('PUT /api/documents/:id/status', () => {
    it('應該更新文件狀態', async () => {
      const document = await createTestDocument(pool, {
        studentId: testStudent.student_id,
        typeId: 'type_001',
        uploaderId: 'user_001',
        contentType: 'web_link',
        webUrl: 'https://example.com/document',
      });

      const response = await request(app)
        .put(`/api/documents/${document.document_id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'verified',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('verified');
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('應該刪除文件', async () => {
      const document = await createTestDocument(pool, {
        studentId: testStudent.student_id,
        typeId: 'type_001',
        uploaderId: 'user_001',
        contentType: 'web_link',
        webUrl: 'https://example.com/document',
      });

      const response = await request(app)
        .delete(`/api/documents/${document.document_id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // 驗證文件已被刪除
      const checkResponse = await request(app)
        .get(`/api/documents/${document.document_id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(checkResponse.status).toBe(404);
    });
  });
});
