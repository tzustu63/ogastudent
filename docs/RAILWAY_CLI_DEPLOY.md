# 🚀 Railway CLI 直接部署指南

本指南提供使用 Railway CLI 直接部署的完整步驟和指令。

## ✅ 前置檢查

### 1. 確認 Railway CLI 已安裝並登入

```bash
# 檢查 Railway CLI
railway --version

# 檢查登入狀態
railway whoami
```

如果未登入，執行：
```bash
railway login
```

### 2. 確認專案狀態

```bash
# 檢查是否已連結專案
railway status
```

## 📋 部署步驟

### 步驟 1：初始化 Railway 專案（如果還沒有）

在專案根目錄執行：

```bash
# 初始化新專案（會創建新的 Railway 專案）
railway init

# 或連結到現有專案（如果有）
railway link
```

**注意**：
- `railway init` 會創建新專案並自動連結
- `railway link` 會連結到現有專案（需要專案 ID）

### 步驟 2：添加 PostgreSQL 資料庫

```bash
# 在專案根目錄執行
railway add --database postgres
```

這會：
- 創建 PostgreSQL 資料庫
- 自動設定 `DATABASE_URL` 環境變數

### 步驟 3：部署後端服務

```bash
# 進入後端目錄
cd backend

# 部署後端（會自動偵測 railway.json 和 nixpacks.toml）
railway up

# 或指定服務名稱
railway up --service backend
```

**部署選項**：
- `--detach`: 背景執行，不等待完成
- `--service <name>`: 指定服務名稱

### 步驟 4：設定後端環境變數

```bash
# 在 backend 目錄下執行
cd backend

# 設定單個環境變數
railway variables set JWT_SECRET=your-super-secret-jwt-key-$(date +%s)
railway variables set JWT_EXPIRES_IN=7d
railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set MAX_FILE_SIZE=10485760
railway variables set UPLOAD_DIR=/tmp/uploads

# 設定 CORS（稍後更新為前端網址）
railway variables set FRONTEND_URL=https://your-frontend.up.railway.app

# Email 設定（可選）
railway variables set SMTP_HOST=smtp.gmail.com
railway variables set SMTP_PORT=587
railway variables set SMTP_USER=your-email@gmail.com
railway variables set SMTP_PASSWORD=your-app-password
```

**或從檔案載入**（如果有 `.env` 檔案）：
```bash
railway variables set --from .env
```

**查看已設定的環境變數**：
```bash
railway variables
```

### 步驟 5：取得後端網址

```bash
# 查看服務資訊（包含網址）
railway domain

# 或查看詳細資訊
railway status
```

**或使用 Railway Dashboard**：
```bash
railway open
```

在 Dashboard 的 **Settings** → **Networking** 中：
- 點擊 **"Generate Domain"** 取得網址
- 複製網址（例如：`https://your-backend.up.railway.app`）

### 步驟 6：部署前端服務

```bash
# 回到專案根目錄
cd ..

# 進入前端目錄
cd frontend

# 部署前端
railway up --service frontend
```

**注意**：如果這是同一個專案下的新服務，Railway 會自動偵測。

### 步驟 7：設定前端環境變數

```bash
# 在 frontend 目錄下執行
cd frontend

# 設定後端 API 網址（使用步驟 5 取得的網址）
railway variables set VITE_API_URL=https://your-backend.up.railway.app
railway variables set NODE_ENV=production
```

### 步驟 8：取得前端網址並更新後端 CORS

```bash
# 查看前端網址
railway domain

# 或
railway status
```

**更新後端 CORS 設定**：
```bash
# 切換到後端目錄
cd ../backend

# 更新 FRONTEND_URL
railway variables set FRONTEND_URL=https://your-frontend.up.railway.app
```

### 步驟 9：驗證部署

```bash
# 查看後端日誌
cd backend
railway logs

# 查看前端日誌
cd ../frontend
railway logs

# 檢查服務狀態
railway status
```

**測試健康檢查**：
```bash
# 測試後端
curl https://your-backend.up.railway.app/api/health

# 測試前端
curl https://your-frontend.up.railway.app
```

## 🔧 常用 Railway CLI 命令

### 專案管理

```bash
# 查看專案狀態
railway status

# 開啟 Railway Dashboard
railway open

# 查看專案資訊
railway project
```

### 服務管理

```bash
# 查看所有服務
railway service

# 切換服務
railway service <service-name>

# 刪除服務
railway service delete <service-name>
```

### 環境變數管理

```bash
# 查看所有環境變數
railway variables

# 設定環境變數
railway variables set KEY=value

# 刪除環境變數
railway variables delete KEY

# 從檔案載入
railway variables set --from .env

# 匯出環境變數
railway variables > .env.railway
```

### 部署管理

```bash
# 部署服務
railway up

# 部署並背景執行
railway up --detach

# 查看部署歷史
railway logs --deployment

# 回滾到上一個版本
railway rollback
```

### 日誌管理

```bash
# 查看即時日誌
railway logs

# 查看特定服務日誌
railway logs --service backend

# 查看最近 100 行日誌
railway logs --tail 100

# 持續監看日誌
railway logs --follow
```

### 資料庫管理

```bash
# 連接到 PostgreSQL
railway connect postgres

# 查看資料庫連線資訊
railway variables | grep DATABASE_URL
```

### 網域管理

```bash
# 查看網域
railway domain

# 生成網域
railway domain generate

# 查看網域詳細資訊
railway domain --json
```

## 📝 完整部署腳本範例

### 後端部署腳本

```bash
#!/bin/bash
set -e

echo "🚀 開始部署後端..."

cd backend

# 部署
railway up --detach

# 等待部署完成
sleep 10

# 設定環境變數
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_EXPIRES_IN=7d
railway variables set NODE_ENV=production
railway variables set PORT=5000
railway variables set MAX_FILE_SIZE=10485760
railway variables set UPLOAD_DIR=/tmp/uploads

# 取得後端網址
BACKEND_URL=$(railway domain --json | jq -r '.domain')
echo "✅ 後端網址: $BACKEND_URL"

# 更新 CORS（稍後更新）
railway variables set FRONTEND_URL=https://your-frontend.up.railway.app

echo "✅ 後端部署完成！"
```

### 前端部署腳本

```bash
#!/bin/bash
set -e

echo "🚀 開始部署前端..."

cd frontend

# 部署
railway up --detach

# 等待部署完成
sleep 10

# 設定環境變數（需要後端網址）
railway variables set VITE_API_URL=$BACKEND_URL
railway variables set NODE_ENV=production

# 取得前端網址
FRONTEND_URL=$(railway domain --json | jq -r '.domain')
echo "✅ 前端網址: $FRONTEND_URL"

# 更新後端 CORS
cd ../backend
railway variables set FRONTEND_URL=$FRONTEND_URL

echo "✅ 前端部署完成！"
```

## 🚨 常見問題排除

### Q1: `railway up` 失敗

**檢查**：
```bash
# 查看詳細錯誤
railway logs

# 檢查專案是否連結
railway status

# 檢查 railway.json 配置
cat railway.json
```

### Q2: 環境變數未生效

**解決**：
```bash
# 確認環境變數已設定
railway variables

# 重新部署以套用變數
railway up
```

### Q3: Port 設定錯誤

**檢查**：
```bash
# 查看 Railway 設定的 Port
railway status

# 確認程式碼使用 process.env.PORT
grep -r "process.env.PORT" backend/src
```

### Q4: 資料庫連線失敗

**檢查**：
```bash
# 查看 DATABASE_URL
railway variables | grep DATABASE_URL

# 測試資料庫連線
railway connect postgres
```

### Q5: 服務找不到

**解決**：
```bash
# 查看所有服務
railway service

# 切換到正確的服務
railway service <service-name>

# 或重新連結專案
railway link
```

## 📋 部署檢查清單

部署前確認：

- [ ] Railway CLI 已安裝並登入
- [ ] 專案已初始化或連結
- [ ] PostgreSQL 資料庫已添加
- [ ] 後端環境變數已設定
- [ ] 後端已部署並取得網址
- [ ] 前端環境變數已設定（包含後端網址）
- [ ] 前端已部署並取得網址
- [ ] 後端 CORS 已更新為前端網址
- [ ] 健康檢查端點正常
- [ ] 應用程式可正常存取

## 🎯 快速部署指令（一鍵執行）

### 後端快速部署

```bash
cd backend && \
railway up --detach && \
railway variables set JWT_SECRET=$(openssl rand -hex 32) && \
railway variables set JWT_EXPIRES_IN=7d && \
railway variables set NODE_ENV=production && \
railway variables set PORT=5000 && \
railway variables set MAX_FILE_SIZE=10485760 && \
railway variables set UPLOAD_DIR=/tmp/uploads && \
echo "✅ 後端部署完成！網址: $(railway domain --json | jq -r '.domain')"
```

### 前端快速部署（需要先取得後端網址）

```bash
BACKEND_URL="https://your-backend.up.railway.app" && \
cd frontend && \
railway up --detach && \
railway variables set VITE_API_URL=$BACKEND_URL && \
railway variables set NODE_ENV=production && \
FRONTEND_URL=$(railway domain --json | jq -r '.domain') && \
cd ../backend && \
railway variables set FRONTEND_URL=$FRONTEND_URL && \
echo "✅ 前端部署完成！網址: $FRONTEND_URL"
```

## 💡 進階技巧

### 使用 Railway Config File (railway.toml)

在專案根目錄創建 `railway.toml`：

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### 自動化部署腳本

創建 `scripts/deploy-railway-cli.sh`：

```bash
#!/bin/bash
set -e

# 檢查 Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI 未安裝"
    exit 1
fi

# 部署後端
echo "🚀 部署後端..."
cd backend
railway up --detach
cd ..

# 部署前端
echo "🚀 部署前端..."
cd frontend
railway up --detach
cd ..

echo "✅ 部署完成！"
```

---

**🎉 完成！您的應用程式已透過 Railway CLI 部署！**

