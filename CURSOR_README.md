# 外國學生受教權查核系統 - Cursor 開發版

> Foreign Student Verification System - Optimized for Cursor IDE

## 🚀 快速開始

### 使用 Cursor 開發

此專案已優化為使用 Cursor IDE 進行開發，包含：

- ✅ **MCP 整合** - Railway MCP 伺服器已配置
- ✅ **TypeScript 支援** - 完整的類型檢查和自動完成
- ✅ **ESLint + Prettier** - 程式碼格式化和檢查
- ✅ **熱重載** - 前後端開發伺服器
- ✅ **Docker 支援** - 容器化開發環境

### 安裝依賴

```bash
# 安裝根目錄依賴
npm install

# 安裝所有工作區依賴
npm run install:all
```

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

## 🚀 Railway 部署

### 快速部署

```bash
# 使用部署腳本
npm run deploy:railway
```

### 手動部署

1. **部署後端**

   ```bash
   cd backend
   railway up
   ```

2. **部署前端**
   ```bash
   cd frontend
   railway up
   ```

### 環境變數設定

參考 `railway.env.example` 檔案設定必要的環境變數。

## 📁 專案結構

```
├── backend/           # 後端 API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── controllers/   # API 控制器
│   │   ├── services/     # 業務邏輯服務
│   │   ├── models/       # 資料模型
│   │   ├── routes/       # 路由定義
│   │   ├── middleware/   # 中介軟體
│   │   └── config/       # 配置檔案
│   ├── Dockerfile        # Docker 配置
│   ├── railway.json      # Railway 配置
│   └── nixpacks.toml    # Nixpacks 配置
├── frontend/          # 前端應用 (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/  # React 組件
│   │   ├── pages/       # 頁面組件
│   │   ├── services/    # API 服務
│   │   ├── stores/      # 狀態管理
│   │   └── types/       # TypeScript 類型
│   ├── Dockerfile       # Docker 配置
│   ├── railway.json     # Railway 配置
│   └── nixpacks.toml   # Nixpacks 配置
├── .cursor/           # Cursor IDE 配置
│   ├── settings.json   # 編輯器設定
│   └── extensions.json # 推薦擴展
├── scripts/           # 部署和工具腳本
└── railway.env.example # Railway 環境變數範例
```

## 🛠️ 開發工具

### Cursor IDE 功能

- **MCP 整合**: Railway MCP 伺服器已配置，可直接管理 Railway 專案
- **TypeScript**: 完整的類型檢查和自動完成
- **ESLint**: 程式碼品質檢查
- **Prettier**: 自動格式化
- **Path Intellisense**: 路徑自動完成
- **Auto Rename Tag**: HTML/JSX 標籤自動重命名

### 推薦擴展

已自動安裝的擴展：

- Prettier - Code formatter
- ESLint
- TypeScript Importer
- Path Intellisense
- Auto Rename Tag

## 🔧 配置說明

### 環境變數

#### 後端環境變數

```bash
# 資料庫
DATABASE_URL=postgresql://...  # Railway 自動提供
DB_HOST=localhost
DB_PORT=5432
DB_NAME=foreign_student_verification
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# 應用程式
NODE_ENV=development
PORT=5000

# CORS
FRONTEND_URL=http://localhost:3000
```

#### 前端環境變數

```bash
# API 端點
VITE_API_URL=http://localhost:5000
```

### Railway 部署配置

- `railway.json`: Railway 服務配置
- `nixpacks.toml`: Nixpacks 建置配置
- `Dockerfile`: Docker 容器配置

## 📊 功能特色

### 後端 API

- 🔐 JWT 認證系統
- 👥 使用者角色管理
- 📄 文件上傳和管理
- 🎓 學生資料管理
- 📈 追蹤記錄系統
- 🔔 通知系統
- 📊 報表生成

### 前端應用

- ⚛️ React 18 + TypeScript
- 🎨 Ant Design UI 組件
- 📱 響應式設計
- 🔄 狀態管理 (Zustand)
- 📊 圖表視覺化
- 🌐 多語言支援

## 🚀 部署到 Railway

### 步驟 1: 準備專案

```bash
# 提交所有變更
git add .
git commit -m "準備 Railway 部署"
git push origin main
```

### 步驟 2: 部署後端

1. 訪問 [Railway Dashboard](https://railway.app/dashboard)
2. 創建新專案
3. 選擇 "Deploy from GitHub repo"
4. 選擇您的 repository
5. 設定 Root Directory 為 `backend`
6. 添加 PostgreSQL 資料庫
7. 設定環境變數

### 步驟 3: 部署前端

1. 在同一專案中創建新服務
2. 選擇相同的 repository
3. 設定 Root Directory 為 `frontend`
4. 設定環境變數 `VITE_API_URL`

### 步驟 4: 配置環境變數

#### 後端環境變數

```bash
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend.up.railway.app
```

#### 前端環境變數

```bash
VITE_API_URL=https://your-backend.up.railway.app
NODE_ENV=production
```

## 🔍 故障排除

### 常見問題

1. **資料庫連線失敗**

   - 檢查 `DATABASE_URL` 環境變數
   - 確認 PostgreSQL 服務已啟動

2. **CORS 錯誤**

   - 檢查 `FRONTEND_URL` 設定
   - 確認前端網址正確

3. **檔案上傳失敗**

   - 檢查 `UPLOAD_DIR` 權限
   - 確認檔案大小限制

4. **JWT 認證失敗**
   - 檢查 `JWT_SECRET` 設定
   - 確認 token 未過期

### 日誌查看

```bash
# Railway 日誌
railway logs

# Docker 日誌
docker-compose logs -f
```

## 📚 相關文件

- [Railway 部署指南](./RAILWAY_DEPLOYMENT.md)
- [Railway 設定指南](./RAILWAY_SETUP.md)
- [部署檢查清單](./DEPLOYMENT_CHECKLIST.md)
- [系統角色權限](./SYSTEM_ROLES_AND_PERMISSIONS.md)

## 🤝 貢獻

1. Fork 專案
2. 創建功能分支
3. 提交變更
4. 推送到分支
5. 創建 Pull Request

## 📄 授權

此專案採用 MIT 授權條款。

---

**開發環境**: Cursor IDE + TypeScript + React + Node.js  
**部署平台**: Railway  
**資料庫**: PostgreSQL  
**快取**: Redis  
**容器化**: Docker
