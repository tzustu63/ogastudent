# Railway 設定指南

## ✅ 已完成的設定

- ✅ Railway CLI 已安裝
- ✅ 已登入帳號：ss248@gms.tcu.edu.tw
- ✅ Fetch MCP 已設定（可用於呼叫 Railway API）

## 🚀 使用 Railway 部署

### 方式 1：使用 Railway CLI（推薦）

#### 初始化專案

```bash
# 在專案根目錄執行
railway init

# 或連結到現有專案
railway link
```

#### 部署後端

```bash
# 進入後端目錄
cd backend

# 創建服務
railway up

# 或使用 railway.json 配置
railway up --service backend
```

#### 部署前端

```bash
# 進入前端目錄
cd frontend

# 創建服務
railway up

# 或使用 railway.json 配置
railway up --service frontend
```

#### 添加資料庫

```bash
# 添加 PostgreSQL
railway add --database postgres

# 查看資料庫連線資訊
railway variables
```

#### 設定環境變數

```bash
# 設定單個變數
railway variables set JWT_SECRET=your-secret-key

# 從檔案載入
railway variables set --from .env
```

### 方式 2：使用 Railway Dashboard

1. 訪問：https://railway.app/dashboard
2. 點擊 "New Project"
3. 選擇 "Deploy from GitHub repo"
4. 選擇你的 repository
5. 設定服務和環境變數

### 方式 3：使用 Railway API（透過 Fetch MCP）

Railway 使用 GraphQL API，你可以透過 Fetch MCP 來呼叫。

**API Endpoint**: `https://backboard.railway.app/graphql/v2`

**需要的 Header**:
- `Authorization: Bearer YOUR_RAILWAY_TOKEN`
- `Content-Type: application/json`

**取得 API Token**:
```bash
# 查看當前 token
railway whoami --json
```

## 📋 Railway 專案結構建議

### 後端配置（backend/railway.json）

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 前端配置（frontend/railway.json）

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 🔧 常用 Railway CLI 命令

```bash
# 查看專案狀態
railway status

# 查看日誌
railway logs

# 查看環境變數
railway variables

# 開啟專案 Dashboard
railway open

# 連接到資料庫
railway connect postgres

# 執行命令
railway run npm install

# 部署
railway up

# 刪除服務
railway down
```

## 💰 Railway 費用

### Hobby Plan（個人使用）
- **$5/月** 基礎費用
- 包含 $5 使用額度
- 超出部分按用量計費

### 預估費用
- 後端服務：~$5-8/月
- 前端服務：~$3-5/月
- PostgreSQL：~$5/月
- **總計：約 $13-18/月**（約 NT$400-550）

## 🔗 相關連結

- Railway Dashboard: https://railway.app/dashboard
- Railway 文件: https://docs.railway.app
- Railway CLI 文件: https://docs.railway.app/develop/cli
- Railway API 文件: https://docs.railway.app/reference/public-api

## 📝 下一步

1. 決定使用哪種部署方式（CLI 或 Dashboard）
2. 初始化 Railway 專案
3. 設定環境變數
4. 部署服務

需要協助嗎？告訴我你想要：
- 使用 Railway CLI 部署
- 使用 Railway Dashboard 部署
- 透過 API 自動化部署
