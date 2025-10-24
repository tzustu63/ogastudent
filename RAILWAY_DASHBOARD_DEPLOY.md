# 🚀 Railway Dashboard 部署指南

## 專案資訊

- **專案名稱**: 外國學生受教權查核系統
- **專案 ID**: 55fb5408-2291-4593-9510-a386b2911cc2
- **專案連結**: https://railway.app/project/55fb5408-2291-4593-9510-a386b2911cc2

## 步驟 1: 部署後端服務

1. 訪問 [Railway Dashboard](https://railway.app/dashboard)
2. 找到專案 "外國學生受教權查核系統"
3. 點擊 **"New Service"**
4. 選擇 **"GitHub Repo"**
5. 選擇您的 repository
6. 設定 **Root Directory**: `backend`
7. 點擊 **"Deploy"**

## 步驟 2: 添加 PostgreSQL 資料庫

1. 在專案中點擊 **"New"**
2. 選擇 **"Database"** → **"Add PostgreSQL"**
3. Railway 會自動設定 `DATABASE_URL` 環境變數

## 步驟 3: 設定後端環境變數

在後端服務的 **Variables** 頁面添加：

```bash
JWT_SECRET=your-super-secret-jwt-key-1761301037
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp/uploads
FRONTEND_URL=https://your-frontend-url.up.railway.app
```

## 步驟 4: 取得後端網址

1. 在後端服務的 **Settings** → **Networking** 中
2. 點擊 **"Generate Domain"**
3. 複製生成的網址（例如：`https://backend-production-xxxx.up.railway.app`）

## 步驟 5: 部署前端服務

1. 回到專案首頁
2. 點擊 **"New Service"**
3. 選擇 **"GitHub Repo"**
4. 選擇同一個 repository
5. 設定 **Root Directory**: `frontend`
6. 點擊 **"Deploy"**

## 步驟 6: 設定前端環境變數

在前端服務的 **Variables** 頁面添加：

```bash
VITE_API_URL=https://your-backend-url.up.railway.app
NODE_ENV=production
```

## 步驟 7: 更新後端 CORS 設定

1. 回到後端服務的 **Variables** 頁面
2. 更新 `FRONTEND_URL` 為前端網址
3. 後端會自動重新部署

## 步驟 8: 測試部署

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

## 🔧 故障排除

### 常見問題

1. **建置失敗**

   - 檢查 Root Directory 是否設定為 `backend` 或 `frontend`
   - 查看 Build Logs 中的錯誤訊息

2. **資料庫連線失敗**

   - 檢查 `DATABASE_URL` 環境變數是否自動設定
   - 確認 PostgreSQL 服務已啟動

3. **CORS 錯誤**

   - 檢查 `FRONTEND_URL` 設定
   - 確認前端網址正確

4. **檔案上傳失敗**
   - 檢查 `UPLOAD_DIR` 權限
   - 確認檔案大小限制

### 日誌查看

在 Railway Dashboard 中：

1. 點擊服務
2. 點擊 **"View Logs"**
3. 查看即時日誌

## 💰 預估費用

Railway Hobby Plan：

- 後端服務：~$5-8/月
- 前端服務：~$3-5/月
- PostgreSQL：~$5/月
- **總計：約 $13-18/月**（約 NT$400-550）

## 📞 需要協助？

如果遇到問題：

1. 查看 Railway 日誌
2. 檢查環境變數設定
3. 確認資料庫連線狀態
4. 參考 `CURSOR_RAILWAY_CHECKLIST.md`

---

**🎉 部署完成後，您的應用程式將在 Railway 上運行！**
