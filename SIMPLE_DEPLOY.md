# 🚀 簡易部署指南

## 快速部署到 Railway（3 步驟）

### 📋 前置準備
- ✅ 程式碼已推送到 GitHub：`https://github.com/tzustu63/ogastudent`
- ✅ 已註冊 Railway 帳號：https://railway.app

---

## 🎯 部署步驟

### 步驟 1：部署後端 + 資料庫

1. 訪問 https://railway.app
2. 點擊 **"New Project"**
3. 選擇 **"Deploy from GitHub repo"**
4. 選擇 `tzustu63/ogastudent`
5. **重要**：在配置頁面設定：
   - **Root Directory**: `backend`
6. 點擊 **"Add variables"** 或 **"Deploy"**

7. 添加 PostgreSQL：
   - 點擊 **"+ New"**
   - 選擇 **"Database"** → **"Add PostgreSQL"**

8. 設定環境變數（點擊後端服務 → Variables）：
   ```
   JWT_SECRET=請改成一個長的隨機字串至少32字元
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=/tmp/uploads
   FRONTEND_URL=稍後填入
   ```

9. 生成後端網域：
   - Settings → Networking → Generate Domain
   - 複製網址（例如：`https://backend-production-xxxx.up.railway.app`）

---

### 步驟 2：部署前端

1. 回到專案首頁，點擊 **"+ New"**
2. 選擇 **"GitHub Repo"**
3. 選擇 `tzustu63/ogastudent`
4. **重要**：設定：
   - **Root Directory**: `frontend`
5. 點擊 **"Deploy"**

6. 設定環境變數（點擊前端服務 → Variables）：
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   NODE_ENV=production
   ```
   （使用步驟 1.9 複製的後端網址）

7. 生成前端網域：
   - Settings → Networking → Generate Domain
   - 複製網址（例如：`https://frontend-production-xxxx.up.railway.app`）

---

### 步驟 3：更新 CORS 設定

1. 回到後端服務
2. Variables → 找到 `FRONTEND_URL`
3. 更新為步驟 2.7 的前端網址
4. 儲存（後端會自動重新部署）

---

## ✅ 驗證部署

### 測試後端
訪問：`https://your-backend-url.up.railway.app/api/health`

應該看到：
```json
{"status":"ok","timestamp":"..."}
```

### 測試前端
訪問：`https://your-frontend-url.up.railway.app`

應該看到登入頁面。

### 測試登入
- 帳號：`admin`
- 密碼：`admin123`

**重要**：首次登入後請立即修改密碼！

---

## 💰 費用

約 **$13-18/月**（約 NT$400-550）

---

## 🔧 常見問題

### Q: 建置失敗？
**A**: 確認 Root Directory 設定正確：
- 後端：`backend`
- 前端：`frontend`

### Q: 前端無法連接後端？
**A**: 檢查：
1. 前端的 `VITE_API_URL` 是否正確
2. 後端的 `FRONTEND_URL` 是否正確
3. 兩個服務都已成功部署

### Q: 如何查看錯誤？
**A**: 點擊服務 → Deployments → 最新部署 → View Logs

---

## 📞 需要協助？

如果遇到問題，請提供：
1. 錯誤訊息截圖
2. Build Logs 內容
3. Root Directory 設定截圖

---

**準備好了嗎？開始步驟 1！**
