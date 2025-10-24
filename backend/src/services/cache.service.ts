import { RedisClientType } from 'redis';
import logger from '../utils/logger';

export class CacheService {
  private client: RedisClientType | null;
  private defaultTTL: number = 3600; // 預設 1 小時

  constructor(client: RedisClientType | null) {
    this.client = client;
  }

  // 檢查快取是否可用
  private isAvailable(): boolean {
    return this.client !== null && this.client.isOpen;
  }

  // 設定快取
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.isAvailable()) {
      logger.warn('Redis 不可用，跳過快取設定');
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      const expiry = ttl || this.defaultTTL;
      await this.client!.setEx(key, expiry, serializedValue);
      logger.debug(`快取已設定: ${key} (TTL: ${expiry}s)`);
      return true;
    } catch (error) {
      logger.error(`設定快取失敗: ${error}`);
      return false;
    }
  }

  // 取得快取
  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable()) {
      logger.warn('Redis 不可用，跳過快取讀取');
      return null;
    }

    try {
      const value = await this.client!.get(key);
      if (!value) {
        logger.debug(`快取未命中: ${key}`);
        return null;
      }
      logger.debug(`快取命中: ${key}`);
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`讀取快取失敗: ${error}`);
      return null;
    }
  }

  // 刪除快取
  async delete(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client!.del(key);
      logger.debug(`快取已刪除: ${key}`);
      return true;
    } catch (error) {
      logger.error(`刪除快取失敗: ${error}`);
      return false;
    }
  }

  // 刪除符合模式的所有快取
  async deletePattern(pattern: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length > 0) {
        await this.client!.del(keys);
        logger.debug(`已刪除 ${keys.length} 個快取項目 (模式: ${pattern})`);
      }
      return true;
    } catch (error) {
      logger.error(`刪除快取模式失敗: ${error}`);
      return false;
    }
  }

  // 檢查快取是否存在
  async exists(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`檢查快取存在失敗: ${error}`);
      return false;
    }
  }

  // 設定快取過期時間
  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client!.expire(key, ttl);
      logger.debug(`快取過期時間已更新: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      logger.error(`設定快取過期時間失敗: ${error}`);
      return false;
    }
  }

  // 清除所有快取
  async flush(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client!.flushDb();
      logger.info('所有快取已清除');
      return true;
    } catch (error) {
      logger.error(`清除快取失敗: ${error}`);
      return false;
    }
  }

  // 取得快取統計資訊
  async getStats(): Promise<any> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const info = await this.client!.info('stats');
      return info;
    } catch (error) {
      logger.error(`取得快取統計失敗: ${error}`);
      return null;
    }
  }
}

// 單例模式
let cacheServiceInstance: CacheService | null = null;

export const getCacheService = (client?: RedisClientType | null): CacheService | null => {
  if (client !== undefined) {
    // 如果提供了 client，更新或建立實例
    cacheServiceInstance = new CacheService(client);
  }
  return cacheServiceInstance;
};
