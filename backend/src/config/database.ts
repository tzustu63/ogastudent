import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'foreign_student_verification',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // 明確指定使用 UTF-8 編碼
  client_encoding: 'UTF8',
};

export const pool = new Pool(dbConfig);

// 測試資料庫連線
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ 資料庫連線成功');
    return true;
  } catch (error) {
    console.error('❌ 資料庫連線失敗:', error);
    return false;
  }
};

// 優雅關閉資料庫連線
export const closeDatabase = async (): Promise<void> => {
  await pool.end();
  console.log('🔌 資料庫連線已關閉');
};