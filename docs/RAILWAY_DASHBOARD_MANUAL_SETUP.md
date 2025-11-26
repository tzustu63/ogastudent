# 🚀 Railway Dashboard 手動設定完整指南

## 📋 前提準備

在開始之前，請先修復 package-lock.json 問題：

```bash
cd backend
rm package-lock.json
npm install
cd ..
git add backend/package-lock.json
git commit -m "修復 package-lock.json"
git push origin main
```

## 🌐 步驟 1：登入 Railway Dashboard

1. 訪問：https://railway.app
2. 點擊右上角 **"Login"**
3. 選擇 **"Login with GitHub"**
4. 授權 Railway 存取你的 GitHub 帳號

## 🏗️ 步驟 2：建立新專案

### 2.1 建立空白專案
1. 登入後，點擊 **"+ New Project"**
2. 選擇 **"Empty Project"** ⚠️ **重要：不要選擇 Deploy from GitHub**
3. 專案會自動建立並進入專案頁面

### 2.2 重新命名專案
1. 點擊左上角的專案名稱
2. 或點擊右上角的 **"Settings"**
3. 在 **"General"** 區塊找到 **"Project Name"**
4. 改為：`外國學生受教權查核系統`
5. 點擊 **"Save"**

## 🔧 步驟 3：建立後端服務

### 3.1 新增空白服務
1. 在專案頁面，點擊 **"+ New Service"**
2. 選擇 **"Empty Service"** ⚠️ **重要：不要選擇 GitHub Repo**
3. 服務會出現在專案畫布上

### 3.2 重新命名服務
1. 右鍵點擊新建立的服務
2. 選擇 **"Rename"** 或 **"Settings"**
3. 將服務名稱改為：`backend`
4. 按 **Enter** 確認

### 3.3 設定 Root Directory
1. 點擊 `backend` 服務進入服務頁面
2. 點擊 **"Settings"** 標籤
3. 在 Settings 頁面中找到 **"Root Directory"** 欄位
4. 輸入：`backend`
5. 點擊 **"Save"** 或 **"Deploy"**

### 3.4 連接 GitHub Repository
1. 在同一個 Settings 頁面
2. 找到 **"Source"** 區塊
3. 點擊 **"Connect Repo"** 或 **"Connect"**
4. 選擇 `tzustu63/ogastudent` repository
5. 點擊 **"Connect"**
6. 點擊 **"Deploy"** 開始部署

## 🗄️ 步驟 4：添加 PostgreSQL 資料庫

### 4.1 新增資料庫
1. 回到專案首頁（點擊左上角專案名稱）
2. 點擊 **"+ New"**
3. 選擇 **"Database"**
4. 選擇 **"Add PostgreSQL"**
5. 資料庫會自動建立並出現在專案中

### 4.2 確認資料庫連線
1. 點擊 PostgreSQL 服務
2. 點擊 **"Variables"** 標籤
3. 確認有 `DATABASE_URL` 變數（會自動生成）

## ⚙️ 步驟 5：設定後端環境變數

### 5.1 進入後端變數設定
1. 點擊 `backend` 服務
2. 點擊 **"Variables"** 標籤

### 5.2 添加環境變數
點擊 **"+ New Variable"** 依序添加以下變數：

**變數 1：JWT_SECRET**
- **Name**: `JWT_SECRET`
- **Value**: `your-super-secret-jwt-key-$(隨機數字)`
- 點擊 **"Add"**

**變數 2：JWT_EXPIRES_IN**
- **Name**: `JWT_EXPIRES_IN`
- **Value**: `7d`
- 點擊 **"Add"**

**變數 3：NODE_ENV**
- **Name**: `NODE_ENV`
- **Value**: `production`
- 點擊 **"Add"**

**變數 4：MAX_FILE_SIZE**
- **Name**: `MAX_FILE_SIZE`
- **Value**: `10485760`
- 點擊 **"Add"**

**變數 5：UPLOAD_DIR**
- **Name**: `UPLOAD_DIR`
- **Value**: `/tmp/uploads`
- 點擊 **"Add"**

**變數 6：FRONTEND_URL（暫時）**
- **Name**: `FRONTEND_URL`
- **Value**: `https://localhost:3000`
- 點擊 **"Add"**

**變數 7：CORS_ORIGIN（暫時）**
- **Name**: `CORS_ORIGIN`
- **Value**: `https://localhost:3000`
- 點擊 **"Add"**

### 5.3 生成後端網域
1. 點擊 **"Settings"** 標籤
2. 找到 **"Networking"** 區塊
3. 點擊 **"Generate Domain"**
4. **記下生成的網址**（例如：`https://backend-production-xxxx.up.railway.app`）

### 5.4 測試後端
1. 訪問：`https://your-backend-url.up.railway.app/api/health`
2. 應該看到：
```json
{
  "success": true,
  "message": "外國學生受教權查核系統 API 運行正常"
}
```

## 🌐 步驟 6：建立前端服務

### 6.1 新增前端服務
1. 回到專案首頁
2. 點擊 **"+ New Service"**
3. 選擇 **"Empty Service"**
4. 重新命名為：`frontend`

### 6.2 設定前端 Root Directory
1. 點擊 `frontend` 服務
2. 點擊 **"Settings"** 標籤
3. 設定 **"Root Directory"**: `frontend`
4. 點擊 **"Save"**

### 6.3 連接 Repository
1. 在 Settings 中找到 **"Source"** 區塊
2. 連接 `tzustu63/ogastudent` repository
3. 點擊 **"Deploy"**

## 🔗 步驟 7：設定前端環境變數

### 7.1 添加前端環境變數
1. 點擊 `frontend` 服務
2. 點擊 **"Variables"** 標籤
3. 添加以下變數：

**變數 1：VITE_API_URL**
- **Name**: `VITE_API_URL`
- **Value**: `https://your-backend-url.up.railway.app`（使用步驟 5.3 記下的網址）
- 點擊 **"Add"**

**變數 2：NODE_ENV**
- **Name**: `NODE_ENV`
- **Value**: `production`
- 點擊 **"Add"**

### 7.2 生成前端網域
1. 點擊 **"Settings"** 標籤
2. 在 **"Networking"** 區塊點擊 **"Generate Domain"**
3. **記下前端網址**（例如：`https://frontend-production-xxxx.up.railway.app`）

## 🔄 步驟 8：更新後端 CORS 設定

### 8.1 更新後端環境變數
1. 回到 `backend` 服務
2. 點擊 **"Variables"** 標籤
3. 找到 `FRONTEND_URL` 變數，點擊編輯
4. 更新為前端網址：`https://your-frontend-url.up.railway.app`
5. 找到 `CORS_ORIGIN` 變數，點擊編輯
6. 更新為前端網址：`https://your-frontend-url.up.railway.app`
7. 點擊 **"Save"**

### 8.2 等待重新部署
- 更新環境變數後，後端會自動重新部署
- 等待部署完成（綠色勾號）

## ✅ 步驟 9：最終測試

### 9.1 測試後端
- 訪問：`https://your-backend-url.up.railway.app/api/health`
- 確認回應正常

### 9.2 測試前端
- 訪問：`https://your-frontend-url.up.railway.app`
- 應該看到登入頁面

### 9.3 測試完整功能
- 嘗試登入
- 按 F12 檢查沒有 CORS 錯誤
- 確認 API 請求成功

## 📋 完成檢查清單

- [ ] 專案已建立並重新命名
- [ ] 後端服務已建立，Root Directory 設為 `backend`
- [ ] PostgreSQL 資料庫已添加
- [ ] 後端環境變數已設定（7個變數）
- [ ] 後端網域已生成且健康檢查通過
- [ ] 前端服務已建立，Root Directory 設為 `frontend`
- [ ] 前端環境變數已設定（2個變數）
- [ ] 前端網域已生成
- [ ] 後端 CORS 已更新為前端網址
- [ ] 前端頁面可正常訪問
- [ ] 登入功能正常運作

## 🎉 部署完成！

恭喜！你已經成功使用 Railway Dashboard 部署了你的應用程式。

**記住這些網址**：
- **後端**：`https://your-backend-url.up.railway.app`
- **前端**：`https://your-frontend-url.up.railway.app`

## 🚨 如果遇到問題

### 建置錯誤
- 檢查 Build Logs 中的錯誤訊息
- 確認 Root Directory 設定正確
- 參考：`docs/RAILWAY_BUILD_ERROR_FIX.md`

### 找不到 Root Directory 設定
- 確保建立的是 **Empty Service**，不是直接從 GitHub 部署
- 參考：`docs/RAILWAY_ROOT_DIRECTORY_OFFICIAL.md`

### CORS 錯誤
- 確認後端 `FRONTEND_URL` 和 `CORS_ORIGIN` 設定正確
- 確認前端 `VITE_API_URL` 設定正確
