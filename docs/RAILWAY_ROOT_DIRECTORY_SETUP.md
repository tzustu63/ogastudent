# 🔧 Railway Root Directory 設定指南

## 📋 什麼是 Root Directory？

Root Directory 告訴 Railway 從哪個資料夾開始建置和部署你的應用程式。對於 monorepo 專案，這個設定非常重要。

## 🚀 方法 1：在 Dashboard 中設定（推薦）

### 步驟 1：進入服務設定

1. 登入 [Railway Dashboard](https://railway.app/dashboard)
2. 選擇你的專案
3. 點擊要設定的服務（例如後端服務）

### 步驟 2：設定 Root Directory

根據 Railway 官方文件，正確的設定位置是：

1. 點擊服務進入服務頁面
2. 點擊 **"Settings"** 標籤
3. 在 Settings 頁面中找到 **"Root Directory"** 欄位
4. 輸入：`backend`
5. 點擊 **"Deploy"** 或按 **"⇧ Enter"** 儲存變更

**重要**：設定完成後，Railway 會自動重新部署服務。

### 步驟 3：確認設定

設定完成後，你應該會看到：
- ✅ Root Directory: `backend`
- ✅ 服務會自動重新部署

## 🛠️ 方法 2：建立服務時設定

### 新建服務時設定

1. 點擊 **"New Service"**
2. 選擇 **"GitHub Repo"**
3. 選擇你的 repository
4. 在配置頁面中：
   - **Service Name**: `backend`
   - **Root Directory**: `backend` ⚠️ **重要！**
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. 點擊 **"Deploy"**

## 📱 詳細步驟截圖指南

### 1. 進入專案

```
Railway Dashboard → 選擇專案 → 點擊服務
```

### 2. 找到設定位置

**位置 1：Settings → Service**
```
服務頁面 → Settings 標籤 → Service 區塊 → Root Directory
```

**位置 2：Deployments → Configure**
```
服務頁面 → Deployments 標籤 → 最新部署 → Settings
```

### 3. 輸入設定

```
Root Directory: backend
```

### 4. 儲存並重新部署

點擊 **Save** 後，Railway 會：
- ✅ 儲存設定
- ✅ 自動觸發重新部署
- ✅ 從 `backend/` 資料夾開始建置

## 🔍 驗證設定是否正確

### 檢查 Build Logs

1. 進入 **Deployments** 標籤
2. 點擊最新的部署
3. 查看 **Build Logs**

**正確的 logs 應該顯示**：
```bash
context: backend/
Using Nixpacks
setup      │ nodejs_18, npm-9_x
install    │ npm ci
build      │ npm run build  
start      │ npm start
```

**錯誤的 logs 會顯示**：
```bash
context: ./
# 這表示從根目錄建置，不是從 backend/
```

### 檢查檔案結構

在 Build Logs 中，你應該看到：
```bash
COPY . /app/.
# 複製的是 backend/ 資料夾的內容，不是整個專案
```

## ⚠️ 常見問題和解決方法

### 問題 1：找不到 Root Directory 設定

**可能原因**：
- 使用舊版 Railway 介面
- 權限不足

**解決方法**：
1. 重新整理頁面
2. 確認你是專案擁有者
3. 嘗試不同的瀏覽器

### 問題 2：設定後仍然從根目錄建置

**檢查步驟**：
1. 確認設定已儲存
2. 手動觸發重新部署
3. 檢查 Build Logs 中的 context

**解決方法**：
```bash
# 手動重新部署
點擊 "Redeploy" 按鈕
```

### 問題 3：部署失敗

**常見原因**：
- `backend/` 資料夾中沒有 `package.json`
- Build 或 Start 命令錯誤

**檢查清單**：
- ✅ `backend/package.json` 存在
- ✅ `backend/` 中有正確的程式碼
- ✅ Build Command: `npm run build`
- ✅ Start Command: `npm start`

## 🎯 最佳實踐

### 1. 服務命名

```
後端服務名稱: backend
前端服務名稱: frontend
```

### 2. 完整配置

**後端服務**：
```
Service Name: backend
Root Directory: backend
Build Command: npm run build
Start Command: npm start
Health Check Path: /api/health
```

**前端服務**：
```
Service Name: frontend  
Root Directory: frontend
Build Command: npm run build
Start Command: npx serve -s dist -l $PORT
Health Check Path: /
```

### 3. 環境變數

設定 Root Directory 後，記得設定對應的環境變數：

**後端**：
```bash
NODE_ENV=production
JWT_SECRET=your-secret
DATABASE_URL=postgresql://...
```

**前端**：
```bash
NODE_ENV=production
VITE_API_URL=https://your-backend-url.up.railway.app
```

## 📋 檢查清單

部署前確認：

- [ ] Root Directory 設為 `backend`
- [ ] Build Command 正確
- [ ] Start Command 正確  
- [ ] 環境變數已設定
- [ ] Health Check Path 正確
- [ ] Build Logs 顯示正確的 context

## 🚨 重要提醒

1. **Root Directory 是相對於 repository 根目錄的路徑**
2. **設定後會自動重新部署**
3. **確保目標資料夾包含完整的應用程式**
4. **前端和後端需要分別設定不同的 Root Directory**

設定完成後，你的 Railway 服務就會從正確的資料夾開始建置和部署！
