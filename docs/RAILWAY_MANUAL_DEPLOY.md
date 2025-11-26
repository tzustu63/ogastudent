# 🚀 Railway 手動部署完整指南

## 📋 部署前準備

### 1. 確保程式碼已推送到 GitHub

```bash
# 檢查 Git 狀態
git status

# 如果有未提交的變更
git add .
git commit -m "準備手動部署到 Railway"
git push origin main
```

## 🔧 步驟 1：建立 Railway 專案並部署後端

### 1.1 登入 Railway

1. 訪問：https://railway.app
2. 點擊 **"Login"**
3. 使用 GitHub 帳號登入

### 1.2 建立新專案

1. 點擊 **"New Project"**
2. 選擇 **"Deploy from GitHub repo"**
3. 選擇你的 repository（應該是 `kuoyuming/InternationalStudent` 或類似）
4. 點擊 **"Deploy Now"**

### 1.3 設定後端服務

1. Railway 會自動偵測到 monorepo 結構
2. 在部署頁面，找到 **"Configure"** 或 **"Settings"**
3. 設定以下項目：
   - **Service Name**: `backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. 點擊 **"Deploy"**

### 1.4 等待後端部署完成

- 查看 Build Logs，確保沒有錯誤
- 部署成功後會顯示綠色勾號

## 🗄️ 步驟 2：添加 PostgreSQL 資料庫

### 2.1 添加資料庫

1. 在專案頁面，點擊 **"New"**
2. 選擇 **"Database"**
3. 選擇 **"Add PostgreSQL"**
4. Railway 會自動建立資料庫

### 2.2 確認資料庫連線

1. 點擊 PostgreSQL 服務
2. 進入 **"Variables"** 頁面
3. 確認有 `DATABASE_URL` 變數

## ⚙️ 步驟 3：設定後端環境變數

### 3.1 進入後端服務設定

1. 點擊後端服務（名稱應該是 `backend`）
2. 進入 **"Variables"** 頁面

### 3.2 添加必要的環境變數

點擊 **"New Variable"** 並依序添加：

```bash
# JWT 設定（必須）
JWT_SECRET=your-super-secret-jwt-key-please-change-this-$(date +%s)
JWT_EXPIRES_IN=7d

# 應用程式設定
NODE_ENV=production
PORT=5000

# 檔案上傳設定
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp/uploads

# 暫時設定（稍後會更新）
FRONTEND_URL=https://localhost:3000
CORS_ORIGIN=https://localhost:3000
```

### 3.3 取得後端網址

1. 在後端服務頁面，進入 **"Settings"** → **"Networking"**
2. 點擊 **"Generate Domain"**
3. 複製生成的網址（例如：`https://backend-production-xxxx.up.railway.app`）
4. **記下這個網址，稍後需要用到**

### 3.4 測試後端

訪問：`https://your-backend-url.up.railway.app/api/health`

應該看到：
```json
{
  "success": true,
  "message": "外國學生受教權查核系統 API 運行正常"
}
```

## 🌐 步驟 4：部署前端服務

### 4.1 建立前端服務

1. 回到專案首頁
2. 點擊 **"New Service"**
3. 選擇 **"GitHub Repo"**
4. 選擇同一個 repository

### 4.2 設定前端服務（重要！）

1. **Service Name**: `frontend`
2. **Root Directory**: `frontend` ⚠️ **這個很重要！**
3. **Build Command**: `npm run build`
4. **Start Command**: `npx serve -s dist -l $PORT`

### 4.3 確認設定正確

在 **"Settings"** → **"Service"** 中確認：
- ✅ Root Directory 是 `frontend`
- ✅ Start Command 是 `npx serve -s dist -l $PORT`

### 4.4 部署前端

點擊 **"Deploy"** 並等待完成

## 🔗 步驟 5：設定前端環境變數和 CORS

### 5.1 設定前端環境變數

1. 點擊前端服務
2. 進入 **"Variables"** 頁面
3. 添加以下變數：

```bash
# API 連線設定
VITE_API_URL=https://your-backend-url.up.railway.app

# 應用程式設定
NODE_ENV=production
```

### 5.2 取得前端網址

1. 在前端服務頁面，進入 **"Settings"** → **"Networking"**
2. 點擊 **"Generate Domain"**
3. 複製生成的網址（例如：`https://frontend-production-xxxx.up.railway.app`）

### 5.3 更新後端 CORS 設定

1. 回到後端服務的 **"Variables"** 頁面
2. 更新以下變數：

```bash
FRONTEND_URL=https://your-frontend-url.up.railway.app
CORS_ORIGIN=https://your-frontend-url.up.railway.app
```

3. 後端會自動重新部署

## ✅ 步驟 6：測試完整系統

### 6.1 測試後端

訪問：`https://your-backend-url.up.railway.app/api/health`

### 6.2 測試前端

1. 訪問：`https://your-frontend-url.up.railway.app`
2. 應該看到登入頁面
3. 嘗試登入測試

### 6.3 測試 API 連線

在前端頁面按 F12 開啟開發者工具，檢查：
- ✅ 沒有 CORS 錯誤
- ✅ API 請求成功
- ✅ 能正常登入

## 🔧 常見問題排除

### 問題 1：前端顯示資料庫錯誤

**原因**：Root Directory 沒有設定為 `frontend`

**解決**：
1. 進入前端服務 Settings → Service
2. 設定 Root Directory 為 `frontend`
3. 重新部署

### 問題 2：CORS 錯誤

**解決**：
1. 確認後端 `FRONTEND_URL` 和 `CORS_ORIGIN` 設定正確
2. 確認前端 `VITE_API_URL` 設定正確

### 問題 3：API 連線失敗

**檢查**：
1. 後端服務是否正常運行
2. 前端環境變數是否正確
3. 網路連線是否正常

## 📋 部署完成檢查清單

- [ ] 後端服務部署成功
- [ ] PostgreSQL 資料庫已添加
- [ ] 後端環境變數已設定
- [ ] 後端健康檢查通過
- [ ] 前端服務部署成功
- [ ] 前端 Root Directory 設為 `frontend`
- [ ] 前端環境變數已設定
- [ ] CORS 設定已更新
- [ ] 前端頁面可正常訪問
- [ ] 登入功能正常

## 🎉 部署成功！

恭喜！你的應用程式已成功部署到 Railway。

**後端網址**：`https://your-backend-url.up.railway.app`
**前端網址**：`https://your-frontend-url.up.railway.app`

記得將這些網址保存起來，以便日後管理和維護。
