# 🚀 Render 快速部署指南（實際操作版）

## 📋 前置準備
- ✅ 程式碼已推送到 GitHub: `tzustu63/ogastudent`
- ✅ 已註冊 Render 帳號：https://render.com

---

## 🎯 部署步驟（4 步驟）

### 步驟 1：創建 PostgreSQL 資料庫

1. 訪問 https://dashboard.render.com
2. 點擊右上角 **"New +"**
3. 選擇 **"PostgreSQL"**
4. 填寫資料：
   - **Name**: `fsvs-database`（或任何你喜歡的名稱）
   - **Database**: 保持預設
   - **User**: 保持預設
   - **Region**: 選擇 **Singapore** 或 **Oregon**
   - **PostgreSQL Version**: 保持預設
   - **Instance Type**: 選擇 **Free**（測試用）
5. 點擊底部 **"Create Database"**
6. 等待 1-2 分鐘創建完成
7. 創建完成後，在資料庫頁面找到 **"Internal Database URL"**
8. 點擊複製按鈕，保存這個網址（格式：`postgresql://...`）

---

### 步驟 2：部署後端

1. 回到 Dashboard，點擊 **"New +"**
2. 選擇 **"Web Service"**
3. 點擊 **"Build and deploy from a Git repository"**
4. 點擊 **"Connect account"** 連接 GitHub（如果還沒連接）
5. 找到並選擇你的 repository：`tzustu63/ogastudent`
6. 點擊 **"Connect"**

7. 填寫服務設定：
   - **Name**: `fsvs-backend`（或任何你喜歡的名稱）
   - **Region**: 選擇與資料庫相同的區域
   - **Branch**: `main`
   - **Root Directory**: 輸入 `backend` ⚠️ **非常重要！**
   - **Environment**: 選擇 **Node**
   - **Build Command**: 留空（Render 會自動偵測）
   - **Start Command**: 留空（Render 會自動偵測）

8. 向下滾動，找到 **"Instance Type"**
   - 選擇 **Free**（測試用）或 **Starter**（正式用，$7/月）

9. 點擊 **"Advanced"** 按鈕展開進階設定

10. 在 **"Environment Variables"** 區域，點擊 **"Add Environment Variable"**

11. 逐一添加以下環境變數（每個變數點一次 "Add Environment Variable"）：

| Key | Value |
|-----|-------|
| `DATABASE_URL` | 貼上步驟 1.8 複製的 Internal Database URL |
| `JWT_SECRET` | 輸入一個長的隨機字串（至少 32 字元，例如：`my-super-secret-jwt-key-change-this-12345678`） |
| `JWT_EXPIRES_IN` | `7d` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MAX_FILE_SIZE` | `10485760` |
| `UPLOAD_DIR` | `/tmp/uploads` |
| `FRONTEND_URL` | 先輸入 `https://temp.com`（稍後會更新） |

12. 點擊底部 **"Create Web Service"**

13. 等待 5-8 分鐘讓 Render 建置和部署

14. 部署完成後，在服務頁面頂部會看到網址（例如：`https://fsvs-backend.onrender.com`）

15. **複製這個後端網址**，稍後會用到

---

### 步驟 3：部署前端

1. 回到 Dashboard，點擊 **"New +"**
2. 選擇 **"Web Service"**
3. 選擇 **"Build and deploy from a Git repository"**
4. 選擇同一個 repository：`tzustu63/ogastudent`
5. 點擊 **"Connect"**

6. 填寫服務設定：
   - **Name**: `fsvs-frontend`（或任何你喜歡的名稱）
   - **Region**: 選擇與後端相同的區域
   - **Branch**: `main`
   - **Root Directory**: 輸入 `frontend` ⚠️ **非常重要！**
   - **Environment**: 選擇 **Node**
   - **Build Command**: 留空
   - **Start Command**: 留空

7. **Instance Type**: 選擇 **Free** 或 **Starter**

8. 點擊 **"Advanced"** 展開進階設定

9. 添加環境變數：

| Key | Value |
|-----|-------|
| `VITE_API_URL` | 貼上步驟 2.15 複製的後端網址 |
| `NODE_ENV` | `production` |

10. 點擊 **"Create Web Service"**

11. 等待 5-8 分鐘建置和部署

12. 部署完成後，**複製前端網址**（例如：`https://fsvs-frontend.onrender.com`）

---

### 步驟 4：更新後端 CORS 設定

1. 回到後端服務頁面（點擊左側選單的 `fsvs-backend`）
2. 點擊左側 **"Environment"** 標籤
3. 找到 `FRONTEND_URL` 變數
4. 點擊右側的編輯按鈕（鉛筆圖示）
5. 將值更新為步驟 3.12 複製的前端網址
6. 點擊 **"Save Changes"**
7. 後端會自動重新部署（約 2-3 分鐘）

---

## ✅ 驗證部署

### 1. 測試後端
在瀏覽器訪問：`https://你的後端網址.onrender.com/api/health`

應該看到：
```json
{"status":"ok","timestamp":"2024-..."}
```

### 2. 測試前端
訪問：`https://你的前端網址.onrender.com`

應該看到登入頁面

### 3. 測試登入
- 帳號：`admin`
- 密碼：`admin123`

**⚠️ 重要**：首次登入後請立即修改密碼！

---

## 💰 費用說明

### 免費方案
- PostgreSQL: $0
- Backend: $0
- Frontend: $0
- **總計：$0/月**

**限制**：
- 服務閒置 15 分鐘後會休眠
- 下次訪問需要 30-60 秒喚醒時間
- 適合測試和展示

### 付費方案
- PostgreSQL Starter: $7/月
- Backend Starter: $7/月
- Frontend Starter: $7/月
- **總計：$21/月**（約 NT$640）

**優勢**：
- 服務永不休眠
- 更快的回應速度
- 更多資源
- 適合正式使用

---

## 🔧 常見問題

### Q: 找不到 "Runtime" 或 "Build Command" 選項？
**A**: Render 的介面可能因版本不同而略有差異。重點是：
1. 確保 **Root Directory** 設定正確（`backend` 或 `frontend`）
2. 選擇 **Node** 環境
3. 其他選項可以留空，Render 會自動偵測

### Q: 部署失敗顯示 "Build failed"？
**A**: 點擊 **"Logs"** 查看錯誤訊息。常見原因：
- Root Directory 沒有設定或設定錯誤
- 環境變數缺少或錯誤
- 檢查 Logs 中的具體錯誤訊息

### Q: 服務啟動很慢？
**A**: 免費方案的服務會在閒置後休眠。首次訪問需要 30-60 秒喚醒。這是正常的。

### Q: 前端顯示 "Network Error" 或無法連接後端？
**A**: 檢查：
1. 前端的 `VITE_API_URL` 是否正確（要包含 `https://`）
2. 後端的 `FRONTEND_URL` 是否正確
3. 兩個服務都已成功部署（狀態顯示綠色）

### Q: 如何查看日誌？
**A**: 
1. 進入服務頁面
2. 點擊上方 **"Logs"** 標籤
3. 可以看到即時日誌

### Q: 如何重新部署？
**A**: 
1. 進入服務頁面
2. 點擊右上角 **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📝 重要提醒

1. **Root Directory 必須設定**：這是最常見的錯誤
   - 後端：`backend`
   - 前端：`frontend`

2. **環境變數要完整**：缺少任何一個都可能導致錯誤

3. **網址要包含 https://**：設定 `VITE_API_URL` 和 `FRONTEND_URL` 時

4. **首次部署較慢**：需要 5-8 分鐘，請耐心等待

5. **免費方案會休眠**：這是正常的，不是錯誤

---

## 🎉 部署成功！

如果一切順利，你現在應該有：
- ✅ 一個運行中的資料庫
- ✅ 一個運行中的後端 API
- ✅ 一個運行中的前端網站
- ✅ 可以正常登入和使用的系統

**記得將網址記錄下來！**

---

需要更多協助？查看 `RENDER_DEPLOYMENT.md` 獲取更詳細的說明。
