# 🚀 部署檢查清單

## ✅ 已完成的準備工作

### 1. 程式調整
- ✅ 後端 `package.json` 添加 `start` 腳本
- ✅ 前端 `package.json` 添加 `start` 腳本和 `serve` 依賴
- ✅ 前端 API 配置支援環境變數 (`VITE_API_URL`)
- ✅ 創建 Railway 配置檔案 (`railway.json`)
- ✅ 創建環境變數範例檔案 (`.env.example`)

### 2. 文檔
- ✅ `README.md` - 專案說明
- ✅ `RAILWAY_DEPLOYMENT.md` - Railway 詳細部署指南
- ✅ `GITHUB_SETUP.md` - GitHub 設定指南
- ✅ `DEPLOYMENT_CHECKLIST.md` - 本檢查清單

### 3. 工具
- ✅ `deploy-to-github.sh` - GitHub 推送助手腳本

## 📋 接下來的步驟

### 第一步：推送到 GitHub

#### 選項 A：使用自動化腳本（推薦）

```bash
# 在專案根目錄執行
./deploy-to-github.sh
```

腳本會自動：
1. 初始化 Git（如果需要）
2. 添加並提交所有變更
3. 設定遠端 repository
4. 推送到 GitHub

#### 選項 B：手動執行

```bash
# 1. 初始化 Git
git init

# 2. 添加所有檔案
git add .

# 3. 提交
git commit -m "準備 Railway 部署"

# 4. 在 GitHub 創建 repository，然後執行：
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

詳細說明請參考 [GITHUB_SETUP.md](./GITHUB_SETUP.md)

### 第二步：部署到 Railway

詳細步驟請參考 [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

**快速摘要：**

1. **部署後端**
   - 在 Railway 選擇 GitHub repo 的 `backend` 資料夾
   - 添加 PostgreSQL 資料庫
   - 設定環境變數（JWT_SECRET, FRONTEND_URL 等）
   - 生成網域

2. **部署前端**
   - 在 Railway 選擇 GitHub repo 的 `frontend` 資料夾
   - 設定環境變數（VITE_API_URL）
   - 生成網域

3. **更新 CORS 設定**
   - 將前端網址更新到後端的 `FRONTEND_URL` 環境變數

## 🔑 重要環境變數

### 後端必須設定：
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp/uploads
FRONTEND_URL=https://your-frontend.up.railway.app
```

### 前端必須設定：
```bash
VITE_API_URL=https://your-backend.up.railway.app
NODE_ENV=production
```

### 資料庫（Railway 自動設定）：
- `DATABASE_URL` - PostgreSQL 連線字串（自動）

## 💰 預估費用

- 後端服務：~$5-8/月
- 前端服務：~$3-5/月
- PostgreSQL：~$5/月
- **總計：約 $13-18/月**（約 NT$400-550）

## 🎯 部署後驗證

### 1. 檢查後端
訪問：`https://your-backend.up.railway.app/api/health`

應該看到：
```json
{
  "status": "ok",
  "timestamp": "2024-10-24T..."
}
```

### 2. 檢查前端
訪問：`https://your-frontend.up.railway.app`

應該看到登入頁面。

### 3. 測試登入
使用預設管理員帳號：
- 帳號：`admin`
- 密碼：`admin123`

**重要：首次登入後請立即修改密碼！**

## 🔧 常見問題

### Q1: 前端無法連接後端？
檢查：
- 前端的 `VITE_API_URL` 是否正確（不要有尾隨斜線）
- 後端的 `FRONTEND_URL` 是否正確
- 後端服務是否正常運行（查看 Logs）

### Q2: 資料庫連線失敗？
- 確認 PostgreSQL 服務已啟動
- 檢查 `DATABASE_URL` 是否正確設定
- 查看後端 Logs 的錯誤訊息

### Q3: 部署失敗？
- 查看 Railway 的 Build Logs
- 確認 `railway.json` 配置正確
- 確認 `package.json` 的 `start` 腳本正確

### Q4: 如何查看日誌？
在 Railway 服務頁面：
- 點擊服務
- 選擇 "Deployments"
- 點擊最新的部署
- 查看 "Logs"

## 📞 需要協助？

1. 查看詳細文檔：
   - [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)
   - [GITHUB_SETUP.md](./GITHUB_SETUP.md)

2. 檢查 Railway 日誌和錯誤訊息

3. 確認所有環境變數都正確設定

4. 建立 GitHub Issue 尋求協助

## 🎉 完成！

部署完成後，您將擁有：
- ✅ 自動 HTTPS 加密
- ✅ 自動部署（推送到 GitHub 時）
- ✅ 99.9% 正常運行時間
- ✅ 自動擴展能力
- ✅ 完整的日誌和監控

---

**準備好了嗎？開始第一步：推送到 GitHub！**

```bash
./deploy-to-github.sh
```
