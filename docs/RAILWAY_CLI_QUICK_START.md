# 🚀 Railway CLI 快速部署指南

## ✅ 前置條件

Railway CLI 已安裝並登入：
```bash
railway --version
railway whoami
```

如果未登入：
```bash
railway login
```

## 📋 完整部署步驟

### 步驟 1：初始化專案

```bash
# 在專案根目錄執行
railway init
```

或連結到現有專案：
```bash
railway link
```

### 步驟 2：添加資料庫

```bash
railway add --database postgres
```

### 步驟 3：部署後端

```bash
cd backend
railway up
```

### 步驟 4：設定後端環境變數

```bash
# 在 backend 目錄下執行
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_EXPIRES_IN=7d
railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set MAX_FILE_SIZE=10485760
railway variables set UPLOAD_DIR=/tmp/uploads
```

### 步驟 5：取得後端網址

```bash
railway domain
```

或開啟 Dashboard：
```bash
railway open
```

在 Dashboard 的 **Settings** → **Networking** 中生成網域。

### 步驟 6：部署前端

```bash
cd ../frontend
railway up --service frontend
```

### 步驟 7：設定前端環境變數

```bash
# 在 frontend 目錄下執行
# 將 YOUR_BACKEND_URL 替換為步驟 5 取得的後端網址
railway variables set VITE_API_URL=https://YOUR_BACKEND_URL.up.railway.app
railway variables set NODE_ENV=production
```

### 步驟 8：取得前端網址並更新後端 CORS

```bash
# 取得前端網址
railway domain

# 更新後端 CORS（將 YOUR_FRONTEND_URL 替換為前端網址）
cd ../backend
railway variables set FRONTEND_URL=https://YOUR_FRONTEND_URL.up.railway.app
```

### 步驟 9：驗證部署

```bash
# 查看後端日誌
cd backend
railway logs

# 查看前端日誌
cd ../frontend
railway logs

# 測試健康檢查
curl https://YOUR_BACKEND_URL.up.railway.app/api/health
```

## 🎯 一鍵部署腳本

使用提供的自動化腳本：

```bash
./scripts/deploy-railway-cli.sh
```

腳本會自動：
- ✅ 檢查 Railway CLI 狀態
- ✅ 初始化或連結專案
- ✅ 添加資料庫
- ✅ 部署後端和前端
- ✅ 設定環境變數
- ✅ 更新 CORS 設定

## 📝 完整指令列表（複製貼上）

### 後端部署

```bash
# 1. 初始化專案（如果還沒有）
railway init

# 2. 添加資料庫
railway add --database postgres

# 3. 進入後端目錄
cd backend

# 4. 部署後端
railway up

# 5. 設定環境變數
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_EXPIRES_IN=7d
railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set MAX_FILE_SIZE=10485760
railway variables set UPLOAD_DIR=/tmp/uploads

# 6. 取得後端網址（記下來）
railway domain
```

### 前端部署

```bash
# 1. 進入前端目錄
cd ../frontend

# 2. 部署前端
railway up --service frontend

# 3. 設定環境變數（將 YOUR_BACKEND_URL 替換為實際後端網址）
railway variables set VITE_API_URL=https://YOUR_BACKEND_URL.up.railway.app
railway variables set NODE_ENV=production

# 4. 取得前端網址（記下來）
railway domain
```

### 更新後端 CORS

```bash
# 1. 回到後端目錄
cd ../backend

# 2. 更新 CORS（將 YOUR_FRONTEND_URL 替換為實際前端網址）
railway variables set FRONTEND_URL=https://YOUR_FRONTEND_URL.up.railway.app
```

## 🔧 常用指令

```bash
# 查看專案狀態
railway status

# 查看日誌
railway logs

# 查看環境變數
railway variables

# 開啟 Dashboard
railway open

# 連接到資料庫
railway connect postgres
```

## 🚨 常見問題

### Q: `railway up` 失敗

**解決**：
```bash
# 查看詳細錯誤
railway logs

# 檢查專案是否連結
railway status
```

### Q: 找不到服務

**解決**：
```bash
# 查看所有服務
railway service

# 切換服務
railway service <service-name>
```

### Q: 環境變數未生效

**解決**：
```bash
# 確認環境變數
railway variables

# 重新部署
railway up
```

## 📚 詳細文件

- 完整部署指南：`RAILWAY_CLI_DEPLOY.md`
- Dashboard 部署：`RAILWAY_DIRECT_DEPLOY.md`
- Railway 設定：`RAILWAY_SETUP.md`

---

**🎉 完成！您的應用程式已透過 Railway CLI 部署！**


