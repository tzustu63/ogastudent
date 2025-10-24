# 🚀 Render 簡易部署指南

## 快速部署到 Render（5 步驟）

### 📋 前置準備
- ✅ 程式碼已推送到 GitHub
- ✅ 已註冊 Render 帳號：https://render.com

---

## 🎯 部署步驟

### 步驟 1：創建 PostgreSQL 資料庫

1. 訪問 https://dashboard.render.com
2. 點擊 **"New +"** → **"PostgreSQL"**
3. 設定：
   - Name: `fsvs-database`
   - Region: Singapore
   - Plan: **Free**（測試用）或 **Starter**（正式用）
4. 點擊 **"Create Database"**
5. 等待創建完成，複製 **Internal Database URL**

---

### 步驟 2：創建 Redis

1. 點擊 **"New +"** → **"Redis"**
2. 設定：
   - Name: `fsvs-redis`
   - Region: Singapore
   - Plan: **Free** 或 **Starter**
3. 點擊 **"Create Redis"**
4. 等待創建完成，複製 **Internal Redis URL**

---

### 步驟 3：部署後端

1. 點擊 **"New +"** → **"Web Service"**
2. 選擇 **"Build and deploy from a Git repository"**
3. 連接你的 GitHub repository
4. 設定：
   - Name: `fsvs-backend`
   - Region: Singapore
   - **Root Directory**: `backend` ⚠️ **重要**
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: **Free** 或 **Starter**

5. 添加環境變數：
   ```
   DATABASE_URL=（步驟 1 的 Internal Database URL）
   REDIS_URL=（步驟 2 的 Internal Redis URL）
   JWT_SECRET=請改成一個長的隨機字串至少32字元
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=5000
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=/tmp/uploads
   FRONTEND_URL=（稍後填入）
   ```

6. 點擊 **"Create Web Service"**
7. 等待部署完成（3-5 分鐘）
8. 複製後端網址（例如：`https://fsvs-backend.onrender.com`）

---

### 步驟 4：部署前端

1. 點擊 **"New +"** → **"Web Service"**
2. 選擇同一個 GitHub repository
3. 設定：
   - Name: `fsvs-frontend`
   - Region: Singapore
   - **Root Directory**: `frontend` ⚠️ **重要**
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Plan: **Free** 或 **Starter**

4. 添加環境變數：
   ```
   VITE_API_URL=（步驟 3.8 的後端網址）
   NODE_ENV=production
   ```

5. 點擊 **"Create Web Service"**
6. 等待部署完成（3-5 分鐘）
7. 複製前端網址（例如：`https://fsvs-frontend.onrender.com`）

---

### 步驟 5：更新後端 CORS 設定

1. 回到後端服務頁面
2. 點擊 **"Environment"**
3. 找到 `FRONTEND_URL`
4. 更新為步驟 4.7 的前端網址
5. 點擊 **"Save Changes"**
6. 等待自動重新部署（1-2 分鐘）

---

## ✅ 驗證部署

### 測試後端
訪問：`https://your-backend.onrender.com/api/health`

應該看到：
```json
{"status":"ok","timestamp":"..."}
```

### 測試前端
訪問：`https://your-frontend.onrender.com`

應該看到登入頁面。

### 測試登入
- 帳號：`admin`
- 密碼：`admin123`

**⚠️ 重要**：首次登入後請立即修改密碼！

---

## 💰 費用

### 免費方案（測試用）
- **總計：$0/月**
- 限制：服務閒置 15 分鐘後休眠，下次訪問需 30-60 秒喚醒

### 付費方案（正式用）
- **總計：$28/月**（約 NT$850）
- 優勢：服務不休眠，效能更好

---

## 🔧 常見問題

### Q: 服務啟動很慢？
**A**: 免費方案會休眠。升級到付費方案可解決。

### Q: 部署失敗？
**A**: 確認 Root Directory 設定正確：
- 後端：`backend`
- 前端：`frontend`

### Q: 前端無法連接後端？
**A**: 檢查：
1. 前端的 `VITE_API_URL` 是否正確
2. 後端的 `FRONTEND_URL` 是否正確
3. 兩個服務都已成功部署

### Q: 如何查看錯誤？
**A**: 點擊服務 → **Logs** 標籤

---

## 🚀 使用 Blueprint 一鍵部署（進階）

如果你想更快速部署：

1. 在 Render Dashboard 點擊 **"New +"** → **"Blueprint"**
2. 連接你的 GitHub repository
3. Render 會自動讀取 `render.yaml` 並創建所有服務
4. 只需設定 `JWT_SECRET` 環境變數即可

---

## 📞 需要協助？

查看完整文件：`RENDER_DEPLOYMENT.md`

---

**準備好了嗎？開始步驟 1！**
