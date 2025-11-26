# 🚀 Railway 部署檢查清單 - Cursor 開發版

## ✅ 已完成的配置

### Cursor IDE 配置

- ✅ `.cursor/settings.json` - 編輯器設定
- ✅ `.cursor/extensions.json` - 推薦擴展
- ✅ Railway MCP 伺服器已配置
- ✅ TypeScript 支援完整
- ✅ ESLint + Prettier 配置

### Railway 部署配置

- ✅ `railway.toml` - 根目錄配置
- ✅ `backend/railway.json` - 後端 Railway 配置
- ✅ `frontend/railway.json` - 前端 Railway 配置
- ✅ `backend/nixpacks.toml` - 後端 Nixpacks 配置
- ✅ `frontend/nixpacks.toml` - 前端 Nixpacks 配置
- ✅ `railway.env.example` - 環境變數範例

### 程式碼優化

- ✅ 後端支援 `DATABASE_URL` 環境變數
- ✅ CORS 配置支援 Railway 部署
- ✅ SSL 連線配置
- ✅ 健康檢查端點
- ✅ TypeScript 錯誤已修復
- ✅ 建置測試通過

### Docker 配置

- ✅ `backend/Dockerfile` - 後端容器配置
- ✅ `frontend/Dockerfile` - 前端容器配置
- ✅ `docker-compose.yml` - 開發環境
- ✅ `docker-compose.prod.yml` - 生產環境

## 🚀 部署步驟

### 1. 準備專案

```bash
# 提交所有變更
git add .
git commit -m "準備 Railway 部署 - Cursor 開發版"
git push origin main
```

### 2. 部署後端

1. 訪問 [Railway Dashboard](https://railway.app/dashboard)
2. 點擊 **"New Project"**
3. 選擇 **"Deploy from GitHub repo"**
4. 選擇您的 repository
5. 設定 **Root Directory** 為 `backend`
6. 點擊 **"Deploy"**

### 3. 添加 PostgreSQL 資料庫

1. 在後端專案中，點擊 **"New"**
2. 選擇 **"Database"** → **"Add PostgreSQL"**
3. Railway 會自動設定 `DATABASE_URL` 環境變數

### 4. 設定後端環境變數

在後端服務的 **Variables** 頁面添加：

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

### 5. 取得後端網址

1. 部署完成後，在後端服務的 **Settings** → **Networking** 中
2. 點擊 **"Generate Domain"**
3. 複製生成的網址（例如：`https://your-backend.up.railway.app`）

### 6. 部署前端

1. 回到 Railway 專案首頁
2. 點擊 **"New"** → **"GitHub Repo"**
3. 選擇同一個 repository
4. 設定 **Root Directory** 為 `frontend`
5. 點擊 **"Deploy"**

### 7. 設定前端環境變數

在前端服務的 **Variables** 頁面添加：

```bash
# 後端 API 網址（使用步驟 5 取得的網址）
VITE_API_URL=https://your-backend.up.railway.app

NODE_ENV=production
```

### 8. 生成前端網址

1. 在前端服務的 **Settings** → **Networking** 中
2. 點擊 **"Generate Domain"**
3. 複製生成的網址（例如：`https://your-frontend.up.railway.app`）

### 9. 更新後端 CORS 設定

1. 回到後端服務的 **Variables** 頁面
2. 更新 `FRONTEND_URL` 為步驟 8 取得的前端網址
3. 後端會自動重新部署

### 10. 初始化資料庫

1. 在後端服務中，點擊右上角的 **"..."** → **"View Logs"**
2. 等待部署完成
3. 資料庫會在首次啟動時自動初始化

## 🔍 驗證部署

### 檢查後端

訪問：`https://your-backend.up.railway.app/api/health`

預期回應：

```json
{
  "success": true,
  "message": "外國學生受教權查核系統 API 運行正常",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0"
}
```

### 檢查前端

訪問：`https://your-frontend.up.railway.app`

應該能看到登入頁面。

### 預設管理員帳號

- 帳號：`admin`
- 密碼：`admin123`（首次登入後請立即修改）

## 🛠️ 使用 Cursor 開發

### 開發模式

```bash
# 啟動前後端開發伺服器
npm run dev

# 或分別啟動
npm run dev:backend  # 後端: http://localhost:5000
npm run dev:frontend  # 前端: http://localhost:3000
```

### Docker 開發環境

```bash
# 啟動完整開發環境（包含資料庫）
npm run docker:dev

# 停止環境
npm run docker:down
```

### Railway MCP 功能

在 Cursor 中，您可以使用 Railway MCP 功能：

- 檢查 Railway 狀態
- 查看日誌
- 管理環境變數
- 部署服務

## 🔧 故障排除

### 常見問題

1. **建置失敗**

   - 檢查 TypeScript 錯誤：`npm run build`
   - 檢查依賴安裝：`npm install`

2. **資料庫連線失敗**

   - 檢查 `DATABASE_URL` 環境變數
   - 確認 PostgreSQL 服務已啟動

3. **CORS 錯誤**

   - 檢查 `FRONTEND_URL` 設定
   - 確認前端網址正確

4. **檔案上傳失敗**
   - 檢查 `UPLOAD_DIR` 權限
   - 確認檔案大小限制

### 日誌查看

```bash
# Railway 日誌
railway logs

# Docker 日誌
docker-compose logs -f
```

## 📊 預估費用

Railway Hobby Plan：

- 後端服務：~$5-8/月
- 前端服務：~$3-5/月
- PostgreSQL：~$5/月
- **總計：約 $13-18/月**（約 NT$400-550）

## 📚 相關文件

- [CURSOR_README.md](./CURSOR_README.md) - Cursor 開發指南
- [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) - 詳細部署指南
- [RAILWAY_SETUP.md](./RAILWAY_SETUP.md) - Railway 設定指南
- [railway.env.example](./railway.env.example) - 環境變數範例

## ✅ 部署完成檢查

- [ ] 後端服務正常運行
- [ ] 前端服務正常運行
- [ ] 資料庫連線正常
- [ ] 健康檢查通過
- [ ] 登入功能正常
- [ ] 檔案上傳功能正常
- [ ] CORS 設定正確
- [ ] 環境變數設定完整

---

**🎉 恭喜！您的專案已成功配置為 Cursor 開發環境並準備好在 Railway 上部署！**
