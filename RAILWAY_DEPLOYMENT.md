# Railway 部署指南（Monorepo 專案）

## ⚠️ 重要提示

此專案是 **monorepo** 結構，包含 `backend` 和 `frontend` 兩個獨立的應用程式。
在 Railway 部署時，需要**分別部署**這兩個服務。

## 🔧 已完成的配置

- ✅ `backend/nixpacks.toml` - 後端 Nixpacks 配置
- ✅ `frontend/nixpacks.toml` - 前端 Nixpacks 配置
- ✅ `backend/railway.json` - 後端 Railway 配置
- ✅ `frontend/railway.json` - 前端 Railway 配置

# Railway 部署指南

## 📋 部署前準備

### 1. 推送到 GitHub

```bash
# 初始化 Git（如果還沒有）
git init

# 添加所有檔案
git add .

# 提交
git commit -m "準備 Railway 部署"

# 在 GitHub 創建新的 repository（建議設為 private）
# 然後執行：
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

## 🚀 Railway 部署步驟

### 步驟 1：部署後端

1. 訪問 [Railway.app](https://railway.app)
2. 使用 GitHub 帳號登入
3. 點擊 **"New Project"**
4. 選擇 **"Deploy from GitHub repo"**
5. 選擇您的 repository：`tzustu63/ogastudent`
6. **重要**：Railway 會偵測到 monorepo，在配置頁面：
   - 找到 **"Root Directory"** 或 **"Watch Paths"** 設定
   - 輸入：`backend`
   - 或在 **"Settings"** → **"Service"** → **"Root Directory"** 設定為 `backend`
7. 點擊 **"Deploy"**

**如果部署失敗，請檢查**：
- Root Directory 是否設定為 `backend`
- 查看 Build Logs 中的錯誤訊息

### 步驟 2：添加 PostgreSQL 資料庫

1. 在後端專案中，點擊 **"New"**
2. 選擇 **"Database"** → **"Add PostgreSQL"**
3. Railway 會自動創建資料庫並設定 `DATABASE_URL` 環境變數

### 步驟 3：設定後端環境變數

在後端服務的 **Variables** 頁面添加以下環境變數：

```bash
# JWT 設定（必須）
JWT_SECRET=your-super-secret-jwt-key-please-change-this-to-random-string
JWT_EXPIRES_IN=7d

# 應用程式設定
NODE_ENV=production
PORT=5000

# 檔案上傳設定
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp/uploads

# CORS 設定（稍後填入前端網址）
FRONTEND_URL=https://your-frontend.up.railway.app

# Email 設定（可選）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**重要**：`DATABASE_URL` 會由 Railway 自動設定，不需要手動添加。

### 步驟 4：取得後端網址

1. 部署完成後，在後端服務的 **Settings** → **Networking** 中
2. 點擊 **"Generate Domain"**
3. 複製生成的網址（例如：`https://your-backend.up.railway.app`）

### 步驟 5：部署前端

1. 回到 Railway 專案首頁
2. 點擊 **"New"** → **"GitHub Repo"**
3. 選擇同一個 repository
4. 選擇 **`frontend`** 資料夾
5. 點擊 **"Deploy"**

### 步驟 6：設定前端環境變數

在前端服務的 **Variables** 頁面添加：

```bash
# 後端 API 網址（使用步驟 4 取得的網址）
VITE_API_URL=https://your-backend.up.railway.app

NODE_ENV=production
```

### 步驟 7：生成前端網址

1. 在前端服務的 **Settings** → **Networking** 中
2. 點擊 **"Generate Domain"**
3. 複製生成的網址（例如：`https://your-frontend.up.railway.app`）

### 步驟 8：更新後端 CORS 設定

1. 回到後端服務的 **Variables** 頁面
2. 更新 `FRONTEND_URL` 為步驟 7 取得的前端網址
3. 後端會自動重新部署

### 步驟 9：初始化資料庫

1. 在後端服務中，點擊右上角的 **"..."** → **"View Logs"**
2. 等待部署完成
3. 資料庫會在首次啟動時自動初始化

## ✅ 驗證部署

訪問前端網址，您應該能看到登入頁面。

預設管理員帳號：
- 帳號：`admin`
- 密碼：`admin123`（首次登入後請立即修改）

## 💰 預估費用

Railway 採用用量計費：

- **Hobby Plan**（個人使用）：
  - $5/月 基礎費用
  - 包含 $5 額度
  - 超出部分按用量計費
  
- **預估月費**：
  - 後端服務：~$5-8
  - 前端服務：~$3-5
  - PostgreSQL：~$5
  - **總計：約 $13-18/月**（約 NT$400-550）

## 🔧 常見問題

### Q1: 部署失敗怎麼辦？

查看 Railway 的 **Logs** 頁面，檢查錯誤訊息。常見問題：
- 環境變數設定錯誤
- 資料庫連線失敗
- 建置錯誤

### Q2: 如何查看日誌？

點擊服務 → **View Logs** 可以看到即時日誌。

### Q3: 如何更新程式？

只需推送到 GitHub：
```bash
git add .
git commit -m "更新功能"
git push
```
Railway 會自動偵測並重新部署。

### Q4: 如何備份資料庫？

在 PostgreSQL 服務中：
1. 點擊 **"..."** → **"Backup"**
2. Railway 會自動備份

### Q5: 前端無法連接後端？

檢查：
1. 前端的 `VITE_API_URL` 是否正確
2. 後端的 `FRONTEND_URL` 是否正確
3. 後端服務是否正常運行

## 🔒 安全建議

1. **修改預設密碼**：首次登入後立即修改 admin 密碼
2. **JWT Secret**：使用強隨機字串
3. **環境變數**：不要將敏感資訊提交到 Git
4. **定期備份**：定期備份資料庫
5. **監控日誌**：定期檢查錯誤日誌

## 📞 需要協助？

如有問題，請：
1. 查看 Railway 日誌
2. 檢查環境變數設定
3. 確認資料庫連線狀態
4. 查看本專案的 GitHub Issues

---

**部署完成後，記得將前後端網址記錄下來！**
