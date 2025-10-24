# Render 部署指南（Monorepo 專案）

## ⚠️ 重要提示

此專案是 **monorepo** 結構，包含 `backend` 和 `frontend` 兩個獨立的應用程式。
在 Render 部署時，需要**分別部署**這兩個服務。

## 🔧 Render 平台優勢

- ✅ 支援 Docker 和原生 Node.js 部署
- ✅ 提供免費的 PostgreSQL 和 Redis
- ✅ 自動從 GitHub 部署
- ✅ 免費 SSL 憑證
- ✅ 簡單的環境變數管理
- ✅ 有免費層級可用（適合測試）

## 📋 部署前準備

### 1. 推送到 GitHub

```bash
# 初始化 Git（如果還沒有）
git init

# 添加所有檔案
git add .

# 提交
git commit -m "準備 Render 部署"

# 在 GitHub 創建新的 repository（建議設為 private）
# 然後執行：
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

## 🚀 Render 部署步驟

### 步驟 1：創建 PostgreSQL 資料庫

1. 訪問 [Render Dashboard](https://dashboard.render.com)
2. 使用 GitHub 帳號登入
3. 點擊 **"New +"** → **"PostgreSQL"**
4. 設定資料庫：
   - **Name**: `fsvs-database`
   - **Database**: `foreign_student_verification`
   - **User**: `postgres`（自動生成）
   - **Region**: 選擇最近的區域（Singapore 或 Oregon）
   - **Plan**: 選擇 **Free** 或 **Starter ($7/月)**
5. 點擊 **"Create Database"**
6. 等待資料庫創建完成（約 1-2 分鐘）
7. **重要**：複製 **Internal Database URL**（格式：`postgresql://...`）

### 步驟 2：部署後端服務

⚠️ **關於 Redis**：
- Redis 在此系統中是**可選的**，主要用於快取功能
- Render 免費方案不提供 Redis 服務
- 系統已設計成沒有 Redis 也能正常運行
- 如需 Redis（付費方案 $7/月），可在部署後添加

1. 點擊 **"New +"** → **"Web Service"**
2. 選擇 **"Build and deploy from a Git repository"**
3. 點擊 **"Connect"** 連接你的 GitHub repository
4. 選擇你的 repository
5. 設定後端服務：
   - **Name**: `fsvs-backend`
   - **Region**: 與資料庫相同區域（Singapore 或 Oregon）
   - **Branch**: `main`
   - **Root Directory**: `backend` ⚠️ **非常重要！必須填寫**
   - **Environment**: 選擇 `Node`
   - **Build Command**: 留空（Render 會自動偵測）或填 `npm install && npm run build`
   - **Start Command**: 留空（Render 會自動偵測）或填 `npm start`
   - **Instance Type**: 選擇 **Free** 或 **Starter ($7/月)**

6. 點擊 **"Advanced"** 展開進階設定

7. 添加環境變數（Environment Variables）：

```bash
# 資料庫連線（使用步驟 1 複製的 Internal Database URL）
DATABASE_URL=postgresql://postgres:xxxxx@dpg-xxxxx-a/foreign_student_verification

# JWT 設定（必須）
JWT_SECRET=請改成一個長的隨機字串至少32字元以上
JWT_EXPIRES_IN=7d

# 應用程式設定
NODE_ENV=production
PORT=5000

# 檔案上傳設定
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp/uploads

# CORS 設定（稍後填入前端網址）
FRONTEND_URL=https://your-frontend.onrender.com
```

💡 **提示**：
- 不需要設定 REDIS_URL，系統會自動在沒有 Redis 的情況下運行
- Render 會自動偵測 `package.json` 並執行建置
- Build Command 和 Start Command 可以留空讓 Render 自動偵測

8. 點擊 **"Create Web Service"**
9. 等待部署完成（首次約 5-8 分鐘）
10. 部署完成後，點擊服務名稱，複製網址（例如：`https://fsvs-backend.onrender.com`）

### 步驟 3：部署前端服務

1. 點擊 **"New +"** → **"Web Service"**
2. 選擇 **"Build and deploy from a Git repository"**
3. 選擇同一個 GitHub repository
4. 設定前端服務：
   - **Name**: `fsvs-frontend`
   - **Region**: 與後端相同區域
   - **Branch**: `main`
   - **Root Directory**: `frontend` ⚠️ **非常重要！必須填寫**
   - **Environment**: 選擇 `Node`
   - **Build Command**: 留空或填 `npm install && npm run build`
   - **Start Command**: 留空或填 `npm run start`
   - **Instance Type**: 選擇 **Free** 或 **Starter ($7/月)**

5. 點擊 **"Advanced"** 展開進階設定

6. 添加環境變數：

```bash
# 後端 API 網址（使用步驟 3.9 複製的後端網址）
VITE_API_URL=https://fsvs-backend.onrender.com

NODE_ENV=production
```

6. 點擊 **"Create Web Service"**
7. 等待部署完成（約 3-5 分鐘）
8. 部署完成後，複製前端網址（例如：`https://fsvs-frontend.onrender.com`）

### 步驟 4：更新後端 CORS 設定

1. 回到後端服務頁面
2. 點擊左側 **"Environment"**
3. 找到 `FRONTEND_URL` 變數
4. 更新為步驟 3.8 的前端網址
5. 點擊 **"Save Changes"**
6. 後端會自動重新部署（約 1-2 分鐘）

### 步驟 5：初始化資料庫

資料庫會在後端首次啟動時自動初始化。

如需手動執行遷移：
1. 進入後端服務頁面
2. 點擊 **"Shell"** 標籤
3. 執行：`npm run migrate`

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

## 💰 預估費用

### 免費方案（適合測試）
- PostgreSQL Free: $0
- Backend Free: $0
- Frontend Free: $0
- **總計：$0/月**

**限制**：
- 服務閒置 15 分鐘後會休眠
- 下次訪問需要 30-60 秒喚醒
- 每月 750 小時免費運行時間
- 無 Redis 快取功能

### 付費方案（適合正式使用）
- PostgreSQL Starter: $7/月
- Backend Starter: $7/月
- Frontend Starter: $7/月
- Redis Starter（可選）: $7/月
- **總計：$21/月**（約 NT$640）
- **含 Redis：$28/月**（約 NT$850）

**優勢**：
- 服務不會休眠
- 更好的效能
- 更多資源
- 可選擇添加 Redis 快取

## 🔧 Render 配置檔案

為了更方便部署，我們已經創建了 `render.yaml` 配置檔案。

使用 Blueprint 一鍵部署：
1. 在 Render Dashboard 點擊 **"New +"** → **"Blueprint"**
2. 連接你的 GitHub repository
3. Render 會自動讀取 `render.yaml` 並創建所有服務
4. 只需設定環境變數即可

## 💡 關於 Redis 快取

### Redis 的作用
- 快取常用資料，減少資料庫查詢
- 提升系統回應速度
- 降低資料庫負載

### 是否需要 Redis？
- **測試/小型部署**：不需要，系統已設計成可選
- **正式/大流量部署**：建議使用，可提升效能

### 如何添加 Redis（付費方案）
1. 在 Render Dashboard 點擊 **"New +"** → **"Redis"**
2. 選擇 **Starter Plan** ($7/月)
3. 創建完成後，複製 **Internal Redis URL**
4. 在後端服務的 Environment 中添加：
   ```
   REDIS_URL=redis://red-xxxxx:6379
   ```
5. 儲存後後端會自動重新部署並啟用快取功能

## 📊 監控與日誌

### 查看日誌
1. 進入服務頁面
2. 點擊 **"Logs"** 標籤
3. 可以看到即時日誌和歷史記錄

### 監控效能
1. 進入服務頁面
2. 點擊 **"Metrics"** 標籤
3. 可以看到 CPU、記憶體、請求數等指標

### 設定告警
1. 進入服務頁面
2. 點擊 **"Settings"** → **"Notifications"**
3. 可以設定部署失敗、服務異常等告警

## 🔄 自動部署

Render 會自動監控 GitHub repository：
- 推送到 `main` 分支會自動觸發部署
- 可以在服務設定中關閉自動部署
- 支援 Pull Request 預覽環境

```bash
# 更新程式碼並自動部署
git add .
git commit -m "更新功能"
git push origin main
```

## 🔒 安全建議

1. **修改預設密碼**：首次登入後立即修改 admin 密碼
2. **JWT Secret**：使用強隨機字串（至少 32 字元）
3. **環境變數**：不要將敏感資訊提交到 Git
4. **定期備份**：定期備份資料庫
5. **監控日誌**：定期檢查錯誤日誌
6. **HTTPS**：Render 自動提供 SSL 憑證

## 🔧 常見問題

### Q1: 服務啟動很慢？
**A**: 免費方案的服務會在閒置後休眠，首次訪問需要 30-60 秒喚醒。升級到付費方案可解決此問題。

### Q2: 部署失敗怎麼辦？
**A**: 查看 **Logs** 頁面的錯誤訊息。常見問題：
- Root Directory 設定錯誤（必須是 `backend` 或 `frontend`）
- 環境變數設定錯誤
- 資料庫連線失敗
- Build Command 或 Start Command 錯誤

### Q3: 如何連接資料庫？
**A**: 使用 **Internal Database URL**（以 `postgresql://` 開頭），不要使用 External URL。

### Q4: 前端無法連接後端？
**A**: 檢查：
1. 前端的 `VITE_API_URL` 是否正確（使用後端的完整網址）
2. 後端的 `FRONTEND_URL` 是否正確（使用前端的完整網址）
3. 兩個服務都已成功部署且正在運行

### Q5: 如何備份資料庫？
**A**: 
1. 進入 PostgreSQL 服務頁面
2. 點擊 **"Backups"** 標籤
3. 點擊 **"Create Backup"** 手動備份
4. 付費方案支援自動定期備份

### Q6: 如何查看資料庫內容？
**A**: 
1. 進入 PostgreSQL 服務頁面
2. 點擊 **"Connect"** 取得連線資訊
3. 使用 pgAdmin 或 DBeaver 等工具連接
4. 或使用 Render 的 **"Shell"** 功能執行 SQL

### Q7: 檔案上傳到哪裡？
**A**: 目前配置使用 `/tmp/uploads`（臨時儲存）。正式環境建議：
- 使用 AWS S3
- 使用 Cloudinary
- 使用 Render Disk（付費功能）

### Q8: 如何設定自訂網域？
**A**: 
1. 進入服務頁面
2. 點擊 **"Settings"** → **"Custom Domain"**
3. 添加你的網域並設定 DNS
4. Render 會自動配置 SSL 憑證

## 🚀 效能優化建議

### 1. 使用 CDN
- 前端靜態資源可以使用 Cloudflare CDN
- 加速全球訪問速度

### 2. 資料庫優化
- 定期清理舊資料
- 添加適當的索引
- 使用連線池

### 3. 快取策略
- 使用 Redis 快取常用資料
- 設定適當的快取過期時間

### 4. 監控與告警
- 設定效能監控
- 配置告警通知
- 定期檢查日誌

## 📞 需要協助？

如有問題，請：
1. 查看 Render 服務的 Logs 頁面
2. 檢查環境變數設定
3. 確認資料庫連線狀態
4. 查看 Render 官方文件：https://render.com/docs
5. 查看本專案的 GitHub Issues

## 🔗 相關連結

- Render 官網：https://render.com
- Render 文件：https://render.com/docs
- Render 社群：https://community.render.com
- Render 狀態頁面：https://status.render.com

---

**部署完成後，記得將前後端網址記錄下來！**

**建議**：先使用免費方案測試，確認一切正常後再升級到付費方案。
