# 🚀 本機開發環境設定指南

## 📋 前置需求

### 1. 檢查 Node.js 版本
```bash
node --version  # 需要 >= 18.0.0
npm --version   # 需要 >= 9.0.0
```

### 2. 檢查 PostgreSQL
```bash
# 檢查是否已安裝 PostgreSQL
psql --version

# 如果沒有安裝，使用 Homebrew 安裝（macOS）
brew install postgresql
brew services start postgresql
```

## 🔧 環境設定

### 步驟 1：安裝依賴
```bash
# 在專案根目錄執行
npm install

# 安裝後端依賴
cd backend
npm install

# 安裝前端依賴
cd ../frontend
npm install

# 回到根目錄
cd ..
```

### 步驟 2：設定後端環境變數
```bash
# 複製環境變數範例檔案
cp backend/.env.example backend/.env

# 編輯環境變數
nano backend/.env
# 或使用你喜歡的編輯器
code backend/.env
```

**backend/.env 內容範例**：
```env
# 資料庫設定
DATABASE_URL=postgresql://username:password@localhost:5432/international_student_db

# JWT 設定
JWT_SECRET=your-super-secret-jwt-key-for-development
JWT_EXPIRES_IN=7d

# 應用程式設定
NODE_ENV=development
PORT=5000

# CORS 設定
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# 檔案上傳設定
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Redis 設定（可選）
REDIS_URL=redis://localhost:6379

# 郵件設定（可選，用於測試）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 步驟 3：建立資料庫
```bash
# 連接到 PostgreSQL
psql -U postgres

# 建立資料庫
CREATE DATABASE international_student_db;

# 建立使用者（可選）
CREATE USER dev_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE international_student_db TO dev_user;

# 退出
\q
```

### 步驟 4：執行資料庫遷移
```bash
# 在專案根目錄執行
npm run db:migrate

# 或直接在 backend 目錄執行
cd backend
npm run migrate
```

## 🚀 啟動專案

### 方法 1：同時啟動前後端（推薦）
```bash
# 在專案根目錄執行
npm run dev
```

這會同時啟動：
- **後端**：http://localhost:5000
- **前端**：http://localhost:3000

### 方法 2：分別啟動

#### 啟動後端
```bash
# 在專案根目錄或 backend 目錄執行
npm run dev:backend

# 或
cd backend
npm run dev
```

#### 啟動前端
```bash
# 在專案根目錄或 frontend 目錄執行
npm run dev:frontend

# 或
cd frontend
npm run dev
```

### 方法 3：生產模式測試
```bash
# 建置專案
npm run build

# 啟動生產模式
npm start
```

## 🔍 驗證啟動成功

### 檢查後端
1. 訪問：http://localhost:5000/api/health
2. 應該看到：
```json
{
  "success": true,
  "message": "外國學生受教權查核系統 API 運行正常"
}
```

### 檢查前端
1. 訪問：http://localhost:3000
2. 應該看到登入頁面

### 檢查資料庫連線
```bash
# 在 backend 目錄執行
npm run test

# 或檢查後端日誌
npm run dev
# 應該看到 "✅ 資料庫連線成功"
```

## 🛠️ 開發工具

### 1. 程式碼檢查
```bash
# 檢查所有程式碼
npm run lint

# 自動修復
npm run lint:fix
```

### 2. 執行測試
```bash
# 執行所有測試
npm run test

# 只測試後端
cd backend && npm run test

# 只測試前端
cd frontend && npm run test
```

### 3. 資料庫管理
```bash
# 重置資料庫
npm run db:setup

# 備份資料庫
./scripts/backup-database.sh

# 還原資料庫
./scripts/restore-database.sh
```

## ⚠️ 常見問題

### 問題 1：資料庫連線失敗
**解決方法**：
1. 確認 PostgreSQL 正在運行
2. 檢查 `DATABASE_URL` 設定
3. 確認資料庫和使用者已建立

### 問題 2：端口被佔用
**解決方法**：
```bash
# 檢查端口使用情況
lsof -i :5000  # 後端
lsof -i :3000  # 前端

# 終止佔用端口的程序
kill -9 <PID>
```

### 問題 3：依賴安裝失敗
**解決方法**：
```bash
# 清除快取
npm cache clean --force

# 刪除 node_modules 重新安裝
rm -rf node_modules package-lock.json
npm install
```

### 問題 4：TypeScript 編譯錯誤
**解決方法**：
```bash
# 重新建置
cd backend
npm run build

# 檢查 TypeScript 設定
npx tsc --noEmit
```

## 📋 開發檢查清單

- [ ] Node.js >= 18.0.0 已安裝
- [ ] PostgreSQL 已安裝並運行
- [ ] 專案依賴已安裝
- [ ] 環境變數已設定
- [ ] 資料庫已建立
- [ ] 資料庫遷移已執行
- [ ] 後端啟動成功（http://localhost:5000）
- [ ] 前端啟動成功（http://localhost:3000）
- [ ] 健康檢查通過
- [ ] 登入頁面可正常顯示

## 🎉 開發完成！

現在你可以開始開發了：
- **後端 API**：http://localhost:5000
- **前端應用**：http://localhost:3000
- **API 文件**：http://localhost:5000/api/health

祝你開發愉快！ 🚀




