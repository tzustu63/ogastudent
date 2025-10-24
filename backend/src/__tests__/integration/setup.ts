import { Pool } from 'pg';
import { connectRedis, closeRedis } from '../../config/redis';
import { RedisClientType } from 'redis';

// 測試資料庫連線池
let testPool: Pool;
let testRedisClient: RedisClientType | null;

// 設定測試環境
export const setupTestEnvironment = async (): Promise<{
  pool: Pool;
  redisClient: RedisClientType | null;
}> => {
  // 建立測試資料庫連線
  testPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'foreign_student_verification_test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  });

  // 連線 Redis（測試環境可選）
  testRedisClient = await connectRedis();

  return { pool: testPool, redisClient: testRedisClient };
};

// 清理測試環境
export const teardownTestEnvironment = async (): Promise<void> => {
  if (testPool) {
    await testPool.end();
  }
  if (testRedisClient) {
    await closeRedis();
  }
};

// 清理測試資料
export const cleanupTestData = async (pool: Pool): Promise<void> => {
  await pool.query('DELETE FROM tracking_records');
  await pool.query('DELETE FROM notifications');
  await pool.query('DELETE FROM student_documents');
  await pool.query('DELETE FROM students');
  await pool.query('DELETE FROM users WHERE username LIKE \'test_%\'');
};

// 建立測試使用者
export const createTestUser = async (
  pool: Pool,
  userData: {
    username: string;
    email: string;
    name: string;
    unitId: string;
    role: string;
  }
): Promise<any> => {
  const result = await pool.query(
    `INSERT INTO users (username, email, name, unit_id, role, password_hash, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, true)
     RETURNING *`,
    [
      userData.username,
      userData.email,
      userData.name,
      userData.unitId,
      userData.role,
      'test_password_hash',
    ]
  );
  return result.rows[0];
};

// 建立測試學生
export const createTestStudent = async (
  pool: Pool,
  studentData: {
    studentId: string;
    name: string;
    email: string;
    nationality: string;
    program: string;
  }
): Promise<any> => {
  const result = await pool.query(
    `INSERT INTO students (student_id, name, email, nationality, program, status)
     VALUES ($1, $2, $3, $4, $5, 'active')
     RETURNING *`,
    [
      studentData.studentId,
      studentData.name,
      studentData.email,
      studentData.nationality,
      studentData.program,
    ]
  );
  return result.rows[0];
};

// 建立測試文件
export const createTestDocument = async (
  pool: Pool,
  documentData: {
    studentId: string;
    typeId: string;
    uploaderId: string;
    contentType: string;
    filePath?: string;
    webUrl?: string;
    remarks?: string;
  }
): Promise<any> => {
  const result = await pool.query(
    `INSERT INTO student_documents (student_id, type_id, uploader_id, content_type, file_path, web_url, remarks, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'uploaded')
     RETURNING *`,
    [
      documentData.studentId,
      documentData.typeId,
      documentData.uploaderId,
      documentData.contentType,
      documentData.filePath || null,
      documentData.webUrl || null,
      documentData.remarks || null,
    ]
  );
  return result.rows[0];
};
