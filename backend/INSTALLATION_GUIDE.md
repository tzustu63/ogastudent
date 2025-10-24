# 安裝指南 - 系統整合和優化

## 新增依賴套件

本次更新新增了以下功能和依賴套件：

### 已包含的套件
- `winston` - 日誌系統（已在 package.json 中）
- `redis` - Redis 快取客戶端（已在 package.json 中）

### 需要安裝的新套件
```bash
cd backend
npm install
```

這將安裝 `package.json` 中新增的開發依賴：
- `supertest` - HTTP 測試工具
- `@types/supertest` - TypeScript 類型定義

## 環境設定

### 1. 更新環境變數

在 `backend/.env` 檔案中新增以下配置：

```env
# 日誌級別
LOG_LEVEL=info

# Redis 配置
REDIS_URL=redis://localhost:6379
```

### 2. 設定 Redis（可選）

Redis 用於快取功能，如果不安裝 Redis，系統仍可正常運行，但不會有快取功能。

#### 使用 Docker 安裝 Redis
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

#### 使用 Homebrew 安裝（macOS）
```bash
brew install redis
brew services start redis
```

#### 使用 apt 安裝（Ubuntu/Debian）
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### 3. 建立日誌目錄

日誌目錄已自動建立，但請確保應用程式有寫入權限：

```bash
cd backend
mkdir -p logs
chmod 755 logs
```

### 4. 執行資料庫遷移

新增了效能優化索引，請執行遷移：

```bash
cd backend
npm run migrate
```

## 測試設定

### 1. 建立測試資料庫

```sql
CREATE DATABASE foreign_student_verification_test;
```

### 2. 設定測試環境變數

建立 `backend/.env.test` 檔案：

```env
NODE_ENV=test
DB_NAME=foreign_student_verification_test
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
REDIS_URL=redis://localhost:6379
```

### 3. 執行測試

```bash
# 執行所有測試
npm test

# 只執行整合測試
npm run test:integration

# 只執行單元測試
npm run test:unit
```

## 驗證安裝

### 1. 啟動伺服器

```bash
npm run dev
```

### 2. 檢查日誌

伺服器啟動時應該看到：

```
[timestamp] info: 伺服器運行於 http://localhost:5000
[timestamp] info: Redis 快取已啟用
```

如果 Redis 未連線，會看到警告訊息，但不影響系統運行。

### 3. 測試錯誤處理

訪問不存在的端點：
```bash
curl http://localhost:5000/api/nonexistent
```

應該返回標準化的錯誤回應：
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "找不到請求的資源: GET /api/nonexistent"
  }
}
```

### 4. 檢查日誌檔案

```bash
ls -la backend/logs/
# 應該看到 error.log 和 all.log
```

## 故障排除

### Redis 連線失敗

如果看到 Redis 連線錯誤：
```
[timestamp] error: Redis 連線失敗
```

解決方案：
1. 確認 Redis 服務正在運行
2. 檢查 `REDIS_URL` 環境變數
3. 如果不需要快取功能，可以忽略此錯誤

### 日誌檔案權限錯誤

如果無法寫入日誌：
```bash
chmod 755 backend/logs
```

### 測試資料庫連線失敗

確認測試資料庫已建立並且環境變數正確：
```bash
psql -U postgres -c "CREATE DATABASE foreign_student_verification_test;"
```

## 效能驗證

### 1. 檢查資料庫索引

```sql
\c foreign_student_verification
\di
```

應該看到新增的索引（以 `idx_` 開頭）。

### 2. 測試快取功能

第一次請求：
```bash
time curl http://localhost:5000/api/students
```

第二次請求（應該更快）：
```bash
time curl http://localhost:5000/api/students
```

### 3. 查看快取統計

在應用程式中：
```typescript
const cacheService = getCacheService(redisClient);
const stats = await cacheService.getStats();
console.log(stats);
```

## 下一步

系統整合和優化已完成，接下來可以：

1. 執行整合測試確保所有功能正常
2. 監控日誌檔案了解系統運行狀況
3. 根據需要調整快取策略和 TTL
4. 繼續進行任務 11：部署配置和系統完善

## 相關文件

- [系統整合總結](./SYSTEM_INTEGRATION_SUMMARY.md)
- [整合測試說明](./src/__tests__/integration/README.md)
- [環境變數範例](./.env.example)
