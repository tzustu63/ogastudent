# 🚀 Railway 完整設定指南

## ✅ GitHub 已更新完成

**提交 ID**: `c8f2dfb`  
**GitHub 連結**: https://github.com/tzustu63/ogastudent

## 📋 現在開始 Railway 設定

### 步驟 1：登入 Railway

1. 訪問：https://railway.app
2. 點擊 **"Login"**
3. 使用 GitHub 帳號登入
4. 授權 Railway 存取你的 GitHub

### 步驟 2：建立專案和後端服務

#### 2.1 建立空白專案
1. 點擊 **"+ New Project"** 或按 **"⌘ K"**
2. 選擇 **"Empty project"**
3. 專案會自動建立

#### 2.2 重新命名專案
1. 點擊專案名稱或進入 **Settings**
2. 更改為：`外國學生受教權查核系統`
3. 點擊 **"Update"**

#### 2.3 建立後端服務
1. 點擊 **"+ Create"** 按鈕
2. 選擇 **"Empty Service"** ⚠️ **重要：不要選擇 GitHub repo**
3. 右鍵點擊服務，重新命名為 `backend`

#### 2.4 設定後端 Root Directory
1. 點擊 `backend` 服務進入設定頁面
2. 點擊 **"Settings"** 標籤
3. 找到 **"Root Directory"** 欄位
4. 輸入：`backend`
5. 點擊 **"Deploy"** 或按 **"⇧ Enter"** 儲存

#### 2.5 連接 GitHub Repository
1. 在同一個 Settings 頁面
2. 找到 **"Source"** 或 **"Connect Repo"** 區塊
3. 點擊 **"Connect"**
4. 選擇 `tzustu63/ogastudent` repository
5. 點擊 **"Deploy"**

### 步驟 3：添加 PostgreSQL 資料庫

1. 回到專案首頁
2. 點擊 **"+ Create"**
3. 選擇 **"Database"**
4. 選擇 **"Add PostgreSQL"**
5. Railway 會自動建立資料庫並設定 `DATABASE_URL`

### 步驟 4：設定後端環境變數

#### 4.1 進入後端變數設定
1. 點擊 `backend` 服務
2. 點擊 **"Variables"** 標籤

#### 4.2 添加必要環境變數
點擊 **"New Variable"** 依序添加：

```bash
# JWT 設定（必須）
JWT_SECRET=your-super-secret-jwt-key-$(date +%s)
JWT_EXPIRES_IN=7d

# 應用程式設定
NODE_ENV=production

# 檔案上傳設定
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp/uploads

# CORS 設定（稍後更新）
FRONTEND_URL=https://localhost:3000
CORS_ORIGIN=https://localhost:3000
```

#### 4.3 取得後端網址
1. 點擊 **"Settings"** → **"Networking"**
2. 點擊 **"Generate Domain"**
3. **記下網址**（例如：`https://backend-production-xxxx.up.railway.app`）

### 步驟 5：測試後端部署

訪問：`https://your-backend-url.up.railway.app/api/health`

**成功的回應**：
```json
{
  "success": true,
  "message": "外國學生受教權查核系統 API 運行正常"
}
```

### 步驟 6：建立前端服務

#### 6.1 建立前端服務
1. 回到專案首頁
2. 點擊 **"+ Create"** → **"Empty Service"**
3. 重新命名為 `frontend`

#### 6.2 設定前端 Root Directory
1. 點擊 `frontend` 服務
2. 進入 **"Settings"**
3. 設定 **"Root Directory"**: `frontend`
4. 點擊 **"Deploy"** 儲存

#### 6.3 連接同一個 Repository
1. 在 Settings 中連接 `tzustu63/ogastudent`
2. 點擊 **"Deploy"**

### 步驟 7：設定前端環境變數

#### 7.1 添加前端環境變數
```bash
# API 連線設定
VITE_API_URL=https://your-backend-url.up.railway.app

# 應用程式設定  
NODE_ENV=production
```

#### 7.2 取得前端網址
1. 進入 **Settings** → **Networking**
2. 點擊 **"Generate Domain"**
3. **記下前端網址**

### 步驟 8：更新後端 CORS 設定

1. 回到後端服務的 **Variables**
2. 更新以下變數：
```bash
FRONTEND_URL=https://your-frontend-url.up.railway.app
CORS_ORIGIN=https://your-frontend-url.up.railway.app
```

### 步驟 9：最終測試

#### 9.1 測試後端
- 訪問：`https://your-backend-url.up.railway.app/api/health`
- 應該看到成功回應

#### 9.2 測試前端
- 訪問：`https://your-frontend-url.up.railway.app`
- 應該看到登入頁面

#### 9.3 測試完整功能
- 嘗試登入
- 檢查 F12 開發者工具沒有 CORS 錯誤
- 確認 API 請求成功

## 🔧 如果遇到問題

### 建置錯誤
- 參考：`docs/RAILWAY_BUILD_ERROR_FIX.md`

### Root Directory 設定問題
- 參考：`docs/RAILWAY_ROOT_DIRECTORY_OFFICIAL.md`

### 一般問題排除
- 參考：`docs/RAILWAY_CLI_TROUBLESHOOTING.md`

## 📋 完成檢查清單

- [ ] 後端服務建立並設定 Root Directory 為 `backend`
- [ ] PostgreSQL 資料庫已添加
- [ ] 後端環境變數已設定
- [ ] 後端網域已生成且健康檢查通過
- [ ] 前端服務建立並設定 Root Directory 為 `frontend`
- [ ] 前端環境變數已設定（包含後端 API URL）
- [ ] 前端網域已生成
- [ ] 後端 CORS 已更新為前端網址
- [ ] 前端頁面可正常訪問
- [ ] 登入功能正常運作

## 🎉 部署完成！

恭喜！你的應用程式已成功部署到 Railway。

**後端網址**：`https://your-backend-url.up.railway.app`  
**前端網址**：`https://your-frontend-url.up.railway.app`

記得將這些網址保存起來，以便日後管理和維護。
