import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';

let redisClient: RedisClientType | null = null;

// 建立 Redis 連線
export const connectRedis = async (): Promise<RedisClientType | null> => {
  try {
    const client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis 重連次數過多，停止重連');
            return new Error('Redis 連線失敗');
          }
          return retries * 100;
        },
      },
    }) as RedisClientType;

    client.on('error', (err) => {
      logger.error(`Redis 錯誤: ${err.message}`);
    });

    client.on('connect', () => {
      logger.info('Redis 連線成功');
    });

    client.on('reconnecting', () => {
      logger.warn('Redis 正在重新連線...');
    });

    await client.connect();
    redisClient = client;
    return client;
  } catch (error) {
    logger.error(`Redis 連線失敗: ${error}`);
    return null;
  }
};

// 取得 Redis 客戶端
export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

// 關閉 Redis 連線
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis 連線已關閉');
  }
};

// 測試 Redis 連線
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    if (!redisClient) {
      return false;
    }
    await redisClient.ping();
    return true;
  } catch (error) {
    logger.error(`Redis 連線測試失敗: ${error}`);
    return false;
  }
};
