# 🚀 Railway 直接部署指南

根據 `direct deplot.md` 的設定要求，本指南說明如何在 Railway Dashboard 中直接部署此專案。

## 📋 部署前準備

### 1. 確認程式碼已準備好

- ✅ 後端 Port 使用 `process.env.PORT`（已設定）
- ✅ 前端 Port 使用 `$PORT`（已設定）
- ✅ Health check endpoints 已設定
  - 後端：`/api/health`
  - 前端：`/`
- ✅ Nixpacks 配置已設定
- ✅ Railway.json 配置已設定

## 🎯 部署步驟

### 步驟 1：部署後端服務

1. 訪問 [Railway Dashboard](https://railway.app/dashboard)
2. 點擊 **"New Project"**
3. 選擇 **"Deploy from GitHub repo"**
4. 選擇您的 repository
5. **重要設定**：

   **Source 設定**：
   - **Root Directory**: `backend`
   - **Branch**: `main`
   - **Wait for CI**: 建議勾選（如果有設定 GitHub Actions）

   **Networking 設定**：
   - **Public Networking**: 開啟
   - **Port**: `5000`（或 Railway 自動偵測的 Port）
   - 點擊 **"Generate Domain"** 取得後端網址

   **Build 設定**：
   - **Builder**: `Railpack Default`（或 `NIXPACKS`）
   - **Custom Build Command**: 留空（使用 nixpacks.toml）
   - **Watch Paths**: `/backend/**`

   **Deploy 設定**：
   - **Custom Start Command**: `npm start`（已在 railway.json 設定）
   - **Healthcheck Path**: `/api/health`
   - **Healthcheck Timeout**: `300`
   - **Restart Policy**: `On Failure`
   - **Regions**: `Southeast Asia (Singapore)`（建議）
   - **Serverless**: 測試階段可開啟，正式環境建議關閉

6. 點擊 **"Deploy"**

### 步驟 2：添加 PostgreSQL 資料庫

1. 在後端專案中，點擊 **"New"**
2. 選擇 **"Database"** → **"Add PostgreSQL"**
3. Railway 會自動創建資料庫並設定 `DATABASE_URL` 環境變數

### 步驟 3：設定後端環境變數

在後端服務的 **Variables** 頁面添加：

```bash
# JWT 設定（必須）
JWT_SECRET=your-super-secret-jwt-key-please-change-this-to-random-string
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

**注意**：`DATABASE_URL` 會由 Railway 自動設定，不需要手動添加。

### 步驟 4：取得後端網址

1. 在後端服務的 **Settings** → **Networking** 中
2. 複製生成的網址（例如：`https://your-backend.up.railway.app`）

### 步驟 5：部署前端服務

1. 回到 Railway 專案首頁
2. 點擊 **"New"** → **"GitHub Repo"**
3. 選擇同一個 repository
4. **重要設定**：

   **Source 設定**：
   - **Root Directory**: `frontend`
   - **Branch**: `main`
   - **Wait for CI**: 建議勾選

   **Networking 設定**：
   - **Public Networking**: 開啟
   - **Port**: `8080`（或 Railway 自動偵測的 Port）
   - 點擊 **"Generate Domain"** 取得前端網址

   **Build 設定**：
   - **Builder**: `Railpack Default`（或 `NIXPACKS`）
   - **Custom Build Command**: 留空（使用 nixpacks.toml）
   - **Watch Paths**: `/frontend/**`

   **Deploy 設定**：
   - **Custom Start Command**: `npx serve -s dist -l $PORT`（已在 railway.json 設定）
   - **Healthcheck Path**: `/`
   - **Healthcheck Timeout**: `300`
   - **Restart Policy**: `On Failure`
   - **Regions**: `Southeast Asia (Singapore)`（建議）
   - **Serverless**: 測試階段可開啟，正式環境建議關閉

5. 點擊 **"Deploy"**

### 步驟 6：設定前端環境變數

在前端服務的 **Variables** 頁面添加：

```bash
# 後端 API 網址（使用步驟 4 取得的網址）
VITE_API_URL=https://your-backend.up.railway.app

NODE_ENV=production
```

### 步驟 7：更新後端 CORS 設定

1. 回到後端服務的 **Variables** 頁面
2. 更新 `FRONTEND_URL` 為步驟 5 取得的前端網址
3. 後端會自動重新部署

## ✅ 驗證部署

### 檢查後端

訪問：`https://your-backend-url.up.railway.app/api/health`

預期回應：

```json
{
  "success": true,
  "message": "外國學生受教權查核系統 API 運行正常",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0"
}
```

### 檢查前端

訪問：`https://your-frontend-url.up.railway.app`

應該能看到登入頁面。

### 預設管理員帳號

- 帳號：`admin`
- 密碼：`admin123`（首次登入後請立即修改）

## 🔧 重要設定說明

### Port 設定

- **後端**：程式碼使用 `process.env.PORT || 5000`，Railway 會自動注入 `$PORT`
- **前端**：使用 `npx serve -s dist -l $PORT`，Railway 會自動注入 `$PORT`

### Health Check

- **後端**：`/api/health` - 基本健康檢查
- **前端**：`/` - 首頁作為健康檢查端點

### Watch Paths

- **後端**：`/backend/**` - 只有 backend 資料夾變更時才重新部署
- **前端**：`/frontend/**` - 只有 frontend 資料夾變更時才重新部署

### Build 和 Start 分離

- **Build**：在 Build Phase 執行（`npm run build`）
- **Start**：在 Deploy Phase 執行（`npm start` 或 `npx serve`）

## 🚨 常見問題

### Q1: 部署失敗怎麼辦？

查看 Railway 的 **Logs** 頁面，檢查錯誤訊息。常見問題：
- 環境變數設定錯誤
- 資料庫連線失敗
- Port 設定不正確（確保使用 `$PORT`）
- Build 失敗

### Q2: Port 設定錯誤

確保：
- 後端使用 `process.env.PORT`
- 前端使用 `$PORT`（在 start command 中）
- Railway Dashboard 的 Port 設定與程式碼一致

### Q3: Health Check 失敗

檢查：
- Health check path 是否正確
- 服務是否正常啟動
- Port 是否正確監聽

### Q4: 前端無法連接後端？

檢查：
- 前端的 `VITE_API_URL` 是否正確
- 後端的 `FRONTEND_URL` 是否正確
- CORS 設定是否正確

## 📝 設定檢查清單

部署前確認：

- [ ] 後端 Root Directory 設為 `backend`
- [ ] 前端 Root Directory 設為 `frontend`
- [ ] 後端 Watch Paths 設為 `/backend/**`
- [ ] 前端 Watch Paths 設為 `/frontend/**`
- [ ] 後端 Port 設定正確（或使用自動偵測）
- [ ] 前端 Port 設定正確（或使用自動偵測）
- [ ] 後端 Healthcheck Path 設為 `/api/health`
- [ ] 前端 Healthcheck Path 設為 `/`
- [ ] 所有環境變數已設定
- [ ] 資料庫已添加並連線

## 💰 預估費用

Railway Hobby Plan：
- 後端服務：~$5-8/月
- 前端服務：~$3-5/月
- PostgreSQL：~$5/月
- **總計：約 $13-18/月**（約 NT$400-550）

---

**🎉 部署完成後，您的應用程式將在 Railway 上運行！**


