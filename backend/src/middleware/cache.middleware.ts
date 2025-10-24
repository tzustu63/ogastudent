import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../services/cache.service';
import logger from '../utils/logger';

// 快取中介軟體工廠函數
export const cacheMiddleware = (
  cacheService: CacheService,
  options: {
    ttl?: number;
    keyGenerator?: (req: Request) => string;
    condition?: (req: Request) => boolean;
  } = {}
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 只快取 GET 請求
    if (req.method !== 'GET') {
      return next();
    }

    // 檢查條件
    if (options.condition && !options.condition(req)) {
      return next();
    }

    // 產生快取鍵
    const cacheKey = options.keyGenerator
      ? options.keyGenerator(req)
      : `cache:${req.method}:${req.originalUrl}`;

    try {
      // 嘗試從快取取得資料
      const cachedData = await cacheService.get(cacheKey);

      if (cachedData) {
        logger.debug(`快取命中: ${cacheKey}`);
        return res.json(cachedData);
      }

      // 快取未命中，繼續處理請求
      logger.debug(`快取未命中: ${cacheKey}`);

      // 覆寫 res.json 以儲存回應到快取
      const originalJson = res.json.bind(res);
      res.json = function (data: any) {
        // 只快取成功的回應
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, data, options.ttl).catch((err) => {
            logger.error(`儲存快取失敗: ${err}`);
          });
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error(`快取中介軟體錯誤: ${error}`);
      next();
    }
  };
};

// 清除快取中介軟體
export const clearCacheMiddleware = (
  cacheService: CacheService,
  patternGenerator: (req: Request) => string
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const pattern = patternGenerator(req);
      await cacheService.deletePattern(pattern);
      logger.debug(`已清除快取模式: ${pattern}`);
    } catch (error) {
      logger.error(`清除快取失敗: ${error}`);
    }
    next();
  };
};

// 預定義的快取鍵產生器
export const cacheKeyGenerators = {
  // 學生列表快取鍵
  studentList: (req: Request): string => {
    const query = new URLSearchParams(req.query as any).toString();
    return `cache:students:list:${query}`;
  },

  // 學生詳情快取鍵
  studentDetail: (req: Request): string => {
    return `cache:students:${req.params.id}`;
  },

  // 文件列表快取鍵
  documentList: (req: Request): string => {
    const studentId = req.params.studentId || req.query.studentId;
    return `cache:documents:student:${studentId}`;
  },

  // 報表快取鍵
  report: (req: Request): string => {
    const query = new URLSearchParams(req.query as any).toString();
    return `cache:reports:${query}`;
  },

  // 統計資料快取鍵
  statistics: (req: Request): string => {
    return `cache:statistics:${req.originalUrl}`;
  },
};

// 預定義的快取模式產生器
export const cachePatternGenerators = {
  // 清除特定學生的所有快取
  studentAll: (req: Request): string => {
    return `cache:students:${req.params.id}*`;
  },

  // 清除學生列表快取
  studentList: (): string => {
    return 'cache:students:list:*';
  },

  // 清除文件相關快取
  documentAll: (req: Request): string => {
    const studentId = req.params.studentId;
    return `cache:documents:student:${studentId}*`;
  },

  // 清除所有報表快取
  reportAll: (): string => {
    return 'cache:reports:*';
  },
};
