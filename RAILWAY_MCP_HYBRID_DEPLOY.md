# 🚀 Railway 混合部署方案

## 階段 1：使用 Railway Dashboard 進行初始部署

### 1. 部署後端服務

1. 訪問 [Railway Dashboard](https://railway.app/dashboard)
2. 找到專案 "外國學生受教權查核系統"
3. 點擊 **"New Service"**
4. 選擇 **"GitHub Repo"**
5. 選擇您的 repository
6. 設定 **Root Directory**: `backend`
7. 點擊 **"Deploy"**

### 2. 添加 PostgreSQL 資料庫

1. 在專案中點擊 **"New"**
2. 選擇 **"Database"** → **"Add PostgreSQL"**

### 3. 部署前端服務

1. 點擊 **"New Service"**
2. 選擇 **"GitHub Repo"**
3. 選擇同一個 repository
4. 設定 **Root Directory**: `frontend`
5. 點擊 **"Deploy"**

## 階段 2：使用 Railway MCP 進行管理

部署完成後，您可以使用以下 Railway MCP 功能：

### 環境變數管理

```bash
# 查看環境變數
railway variables

# 設定環境變數
railway variables set JWT_SECRET=your-secret-key
railway variables set NODE_ENV=production
```

### 日誌監控

```bash
# 查看日誌
railway logs

# 查看特定服務日誌
railway logs --service backend
```

### 網域管理

```bash
# 生成網域
railway domain

# 查看網域
railway domain --json
```

## 階段 3：自動化管理腳本

部署完成後，我可以為您創建自動化管理腳本：

### 環境變數自動設定

```bash
# 後端環境變數
railway variables set JWT_SECRET=your-super-secret-jwt-key-$(date +%s)
railway variables set JWT_EXPIRES_IN=7d
railway variables set NODE_ENV=production
railway variables set PORT=5000
```

### 前端環境變數

```bash
# 前端環境變數（需要先取得後端網址）
railway variables set VITE_API_URL=https://your-backend-url.up.railway.app
railway variables set NODE_ENV=production
```

## 🎯 為什麼這個方案最好？

1. **可靠性** - Railway Dashboard 是最穩定的部署方式
2. **效率** - 初始部署後，Railway MCP 可以快速管理
3. **靈活性** - 結合兩種方式的優點
4. **可維護性** - 後續管理更簡單

## 📋 下一步行動

1. **立即開始**：使用 Railway Dashboard 部署
2. **部署完成後**：我可以幫您使用 Railway MCP 進行管理
3. **自動化**：創建管理腳本

---

**Railway MCP 確實有用，但主要用於管理已部署的服務，而不是初始部署。**
