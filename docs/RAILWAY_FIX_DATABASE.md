# 🔧 修復 Railway 資料庫連線問題

## 問題

後端服務無法連線到資料庫，錯誤訊息：
```
ECONNREFUSED ::1:5432
ECONNREFUSED 127.0.0.1:5432
```

## 原因

後端服務缺少 `DATABASE_URL` 環境變數。Railway 的資料庫服務會自動提供 `DATABASE_URL`，但需要手動將它設定到後端服務。

## 解決方法

### 方法 1：使用 Railway CLI（推薦）

```bash
# 1. 切換到 Postgres 服務
railway service Postgres

# 2. 取得完整的 DATABASE_URL
railway variables | grep DATABASE_URL

# 3. 複製完整的 DATABASE_URL（例如：postgresql://user:password@host:port/dbname）

# 4. 切換到後端服務
railway service backend

# 5. 設定 DATABASE_URL（將 YOUR_DATABASE_URL 替換為實際值）
railway variables set DATABASE_URL="YOUR_DATABASE_URL"

# 6. 設定其他必要的環境變數
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_EXPIRES_IN=7d
railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set MAX_FILE_SIZE=10485760
railway variables set UPLOAD_DIR=/tmp/uploads
```

### 方法 2：使用 Railway Dashboard

1. 訪問 Railway Dashboard: `railway open`
2. 點擊 **Postgres** 服務
3. 在 **Variables** 頁面找到 `DATABASE_URL`
4. 複製完整的 `DATABASE_URL`
5. 點擊 **backend** 服務
6. 在 **Variables** 頁面點擊 **"New Variable"**
7. 設定：
   - **Name**: `DATABASE_URL`
   - **Value**: 貼上剛才複製的 `DATABASE_URL`
8. 點擊 **"Add"**

### 方法 3：使用 Railway 的共享變數功能

Railway 支援在專案層級共享變數，但最簡單的方式是直接複製 `DATABASE_URL`。

## 驗證修復

設定完成後，後端服務會自動重新部署。檢查：

```bash
# 查看後端日誌
railway service backend
railway logs

# 應該看到：
# ✅ 資料庫連線成功
```

## 完整環境變數清單

後端服務需要的環境變數：

```bash
# 資料庫（必須）
DATABASE_URL=postgresql://user:password@host:port/dbname

# JWT 設定（必須）
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# 應用程式設定
NODE_ENV=production
PORT=5000

# 檔案上傳設定
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp/uploads

# CORS 設定（稍後填入前端網址）
FRONTEND_URL=https://your-frontend.up.railway.app

# Email 設定（可選）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 快速修復指令

```bash
# 取得 DATABASE_URL 並設定到後端
DATABASE_URL=$(railway service Postgres && railway variables | grep DATABASE_URL | awk '{print $3}')
railway service backend
railway variables set DATABASE_URL="$DATABASE_URL"
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_EXPIRES_IN=7d
railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set MAX_FILE_SIZE=10485760
railway variables set UPLOAD_DIR=/tmp/uploads
```

---

**設定完成後，後端服務會自動重新部署並連線到資料庫！**


