# 編碼問題完整修正總結

## 已修正的問題

### 1. ✅ Modal 屬性警告
- **問題**: `destroyOnClose` 在新版 Ant Design 中已棄用
- **修正**: 改回使用 `destroyOnHidden`
- **檔案**: `frontend/src/components/Document/DocumentUploadModal.tsx`

### 2. ✅ React Router 警告
- **問題**: React Router v7 future flags 警告
- **修正**: 在 BrowserRouter 中添加 future flags
  ```tsx
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
  ```
- **檔案**: `frontend/src/main.tsx`

### 3. ✅ 中文編碼問題 - 前端層

#### Axios 配置
- **修正**: 明確設定 UTF-8 編碼
  ```typescript
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
  },
  responseType: 'json',
  responseEncoding: 'utf8',
  ```
- **檔案**: `frontend/src/services/api.ts`

#### Vite 代理配置
- **修正**: 在 proxy 中強制設定 Content-Type
  ```typescript
  configure: (proxy, _options) => {
    proxy.on('proxyRes', (proxyRes, _req, _res) => {
      proxyRes.headers['content-type'] = 'application/json; charset=utf-8';
    });
  }
  ```
- **檔案**: `frontend/vite.config.ts`

### 4. ✅ 中文編碼問題 - 後端層

#### Express 中介軟體
- **修正**: 統一設定所有回應的 Content-Type
  ```typescript
  app.use((_req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });
  ```
- **檔案**: `backend/src/index.ts`

#### CORS 配置
- **修正**: 明確設定 CORS 並暴露 Content-Type header
  ```typescript
  app.use(cors({
    origin: true,
    credentials: true,
    exposedHeaders: ['Content-Type', 'Content-Disposition'],
  }));
  ```
- **檔案**: `backend/src/index.ts`

#### Response Helper
- **新增**: 統一的回應處理工具，確保所有回應都使用 UTF-8
- **檔案**: `backend/src/utils/response.helper.ts`

### 5. ✅ 中文編碼問題 - 資料庫層

#### PostgreSQL 配置
- **已存在**: 資料庫連接已設定 `client_encoding: 'UTF8'`
- **檔案**: `backend/src/config/database.ts`

#### Docker Compose
- **修正**: PostgreSQL 容器環境變數
  ```yaml
  environment:
    POSTGRES_INITDB_ARGS: "--encoding=UTF8 --lc-collate=zh_TW.UTF-8 --lc-ctype=zh_TW.UTF-8"
    LANG: zh_TW.UTF-8
    LC_ALL: zh_TW.UTF-8
  command: postgres -c client_encoding=UTF8
  ```
- **修正**: Backend 容器環境變數
  ```yaml
  environment:
    LANG: zh_TW.UTF-8
    LC_ALL: zh_TW.UTF-8
  ```
- **檔案**: `docker-compose.yml`

## 如何重啟服務

### 方法 1: 使用修復腳本（推薦）
```bash
./scripts/fix-encoding-and-restart.sh
```

### 方法 2: 手動重啟
```bash
# 停止服務
docker compose down

# 重新建置並啟動
docker compose up -d --build

# 檢查狀態
docker compose ps
curl http://localhost:5001/api/health
```

## 驗證修正

### 1. 檢查瀏覽器控制台
- 不應該再有 Modal 或 React Router 警告
- 中文應該正確顯示

### 2. 檢查網路請求
在瀏覽器開發者工具的 Network 標籤中：
- 檢查 Response Headers 應該包含: `Content-Type: application/json; charset=utf-8`
- 檢查 Response 內容中的中文應該正確顯示

### 3. 測試功能
- 登入系統
- 上傳文件（測試中文檔名和備註）
- 查看學生列表（測試中文姓名）
- 檢查所有中文內容是否正確顯示

## 如果問題仍然存在

### 檢查清單
1. ✅ 確認已重啟所有 Docker 容器
2. ✅ 清除瀏覽器快取並重新載入頁面（Cmd+Shift+R 或 Ctrl+Shift+R）
3. ✅ 檢查資料庫中的資料是否已經是亂碼（如果是，需要重新匯入）
4. ✅ 檢查 .env 檔案是否有正確的配置

### 資料庫資料已經是亂碼的情況
如果資料庫中的資料已經儲存為亂碼，需要：
```bash
# 1. 備份現有資料
./scripts/backup-database.sh

# 2. 重置資料庫
./scripts/reset-database.sh

# 3. 重新匯入正確編碼的資料
# 或重新建立測試資料
```

## 技術細節

### UTF-8 編碼鏈路
```
瀏覽器 (UTF-8)
  ↓
Vite Dev Server (UTF-8 proxy)
  ↓
Express Server (UTF-8 middleware)
  ↓
PostgreSQL (UTF-8 client_encoding)
  ↓
Express Response (UTF-8 Content-Type)
  ↓
Vite Proxy (UTF-8 header)
  ↓
Axios (UTF-8 responseEncoding)
  ↓
React Component (UTF-8 display)
```

每一層都已經明確設定為 UTF-8，確保中文在整個流程中不會出現編碼問題。

## 相關檔案清單

### 前端
- `frontend/src/main.tsx` - React Router future flags
- `frontend/src/components/Document/DocumentUploadModal.tsx` - Modal 屬性
- `frontend/src/services/api.ts` - Axios UTF-8 配置
- `frontend/vite.config.ts` - Vite proxy UTF-8 配置
- `frontend/index.html` - HTML meta charset

### 後端
- `backend/src/index.ts` - Express UTF-8 middleware
- `backend/src/config/database.ts` - PostgreSQL UTF-8 配置
- `backend/src/utils/response.helper.ts` - 統一回應處理

### 基礎設施
- `docker-compose.yml` - Docker 容器 UTF-8 環境變數

### 腳本
- `scripts/fix-encoding-and-restart.sh` - 一鍵修復重啟腳本
