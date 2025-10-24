import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { pool, testConnection, closeDatabase } from './config/database';
import { connectRedis, closeRedis, testRedisConnection } from './config/redis';
import { getCacheService } from './services/cache.service';
import { createAuthRoutes } from './routes/auth.routes';
import { createDocumentRoutes } from './routes/document.routes';
import { createStudentRoutes } from './routes/student.routes';
import { createTrackingRoutes } from './routes/tracking.routes';
import { createNotificationRoutes } from './routes/notification.routes';
import { createReportRoutes } from './routes/report.routes';
import { createUserRoutes } from './routes/user.routes';
import { getSchedulerService } from './services/scheduler.service';
import { errorHandler, notFoundHandler, handleUnhandledRejection, handleUncaughtException } from './middleware/error.middleware';
import logger from './utils/logger';

// 載入環境變數
dotenv.config();

// 設定全域錯誤處理
handleUncaughtException();
handleUnhandledRejection();

const app = express();
const PORT = process.env.PORT || 5000;

// 中介軟體
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
  exposedHeaders: ['Content-Type', 'Content-Disposition'],
}));

// 明確設定 charset 為 UTF-8
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 設定所有回應的 Content-Type 為 UTF-8
app.use((_req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// 健康檢查路由
app.get('/api/health', async (_req, res) => {
  const health = {
    success: true,
    message: '外國學生受教權查核系統 API 運行正常',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  };

  res.json(health);
});

// 詳細健康檢查路由（包含依賴服務狀態）
app.get('/api/health/detailed', async (_req, res) => {
  const checks: any = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {}
  };

  // 檢查資料庫連線
  try {
    await pool.query('SELECT 1');
    checks.services.database = { status: 'healthy', message: 'PostgreSQL 連線正常' };
  } catch (error) {
    checks.services.database = { status: 'unhealthy', message: '資料庫連線失敗', error: String(error) };
  }

  // 檢查 Redis 連線
  try {
    const cacheService = getCacheService();
    if (cacheService) {
      const redisHealthy = await testRedisConnection();
      checks.services.redis = redisHealthy 
        ? { status: 'healthy', message: 'Redis 連線正常' }
        : { status: 'unhealthy', message: 'Redis 連線失敗' };
    } else {
      checks.services.redis = { status: 'disabled', message: 'Redis 未啟用' };
    }
  } catch (error) {
    checks.services.redis = { status: 'unhealthy', message: 'Redis 檢查失敗', error: String(error) };
  }

  // 判斷整體健康狀態
  const allHealthy = Object.values(checks.services).every(
    (service: any) => service.status === 'healthy' || service.status === 'disabled'
  );

  checks.status = allHealthy ? 'healthy' : 'degraded';
  checks.success = allHealthy;

  res.status(allHealthy ? 200 : 503).json(checks);
});

// 認證路由
app.use('/api/auth', createAuthRoutes(pool));

// 使用者管理路由
app.use('/api/users', createUserRoutes(pool));

// 文件管理路由
app.use('/api/documents', createDocumentRoutes(pool));

// 學生管理路由
app.use('/api/students', createStudentRoutes(pool));

// 追蹤記錄路由
app.use('/api/tracking', createTrackingRoutes(pool));

// 通知路由
app.use('/api/notifications', createNotificationRoutes(pool));

// 報表路由
app.use('/api/reports', createReportRoutes(pool));

// 404 處理（必須在所有路由之後）
app.use('*', notFoundHandler);

// 全域錯誤處理中介軟體（必須在最後）
app.use(errorHandler);

// 啟動伺服器
const startServer = async () => {
  try {
    // 測試資料庫連線
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error('無法連線到資料庫，伺服器啟動失敗');
      process.exit(1);
    }

    // 連線 Redis（可選，失敗不影響伺服器啟動）
    const redisClient = await connectRedis();
    if (redisClient) {
      const redisConnected = await testRedisConnection();
      if (redisConnected) {
        logger.info('Redis 快取已啟用');
        // 初始化快取服務
        getCacheService(redisClient);
      } else {
        logger.warn('Redis 連線測試失敗，快取功能將不可用');
      }
    } else {
      logger.warn('Redis 未連線，快取功能將不可用');
    }

    // 初始化排程服務
    const scheduler = getSchedulerService(pool);
    scheduler.initialize();

    app.listen(PORT, () => {
      logger.info(`伺服器運行於 http://localhost:${PORT}`);
      logger.info(`API 文件: http://localhost:${PORT}/api/health`);
      logger.info(`認證端點: http://localhost:${PORT}/api/auth`);
      logger.info(`使用者管理端點: http://localhost:${PORT}/api/users`);
      logger.info(`文件管理端點: http://localhost:${PORT}/api/documents`);
      logger.info(`學生管理端點: http://localhost:${PORT}/api/students`);
      logger.info(`追蹤記錄端點: http://localhost:${PORT}/api/tracking`);
      logger.info(`通知端點: http://localhost:${PORT}/api/notifications`);
      logger.info(`報表端點: http://localhost:${PORT}/api/reports`);
    });
  } catch (error) {
    logger.error(`伺服器啟動失敗: ${error}`);
    process.exit(1);
  }
};

// 優雅關閉
process.on('SIGTERM', async () => {
  logger.warn('收到 SIGTERM 信號，正在關閉伺服器...');
  const scheduler = getSchedulerService(pool);
  scheduler.stopAll();
  await closeRedis();
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.warn('收到 SIGINT 信號，正在關閉伺服器...');
  const scheduler = getSchedulerService(pool);
  scheduler.stopAll();
  await closeRedis();
  await closeDatabase();
  process.exit(0);
});

startServer();

export default app;