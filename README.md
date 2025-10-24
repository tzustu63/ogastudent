# 外國學生受教權查核系統 (Foreign Student Verification System)

一個以學生為中心的網站平台，讓各個單位能夠上傳佐證資料或連結到特定網頁，供全球處與教育部確認學生學習狀況。

## 系統特色

- 🎯 **以學生為中心**: 所有資料以學生為核心進行組織和管理
- 🔐 **權限管理**: 不同單位只能上傳其負責的資料類型
- 📊 **追蹤記錄**: 完整記錄所有操作歷程，包含上傳者、時間、備註
- 📈 **進度監控**: 即時監控各學生資料完成度和整體進度
- 🔍 **稽核功能**: 提供完整的稽核報表和資料追蹤

## 技術架構

### 前端
- **框架**: React 18 + TypeScript
- **UI 庫**: Ant Design
- **狀態管理**: Zustand
- **路由**: React Router
- **建置工具**: Vite

### 後端
- **運行環境**: Node.js + Express
- **語言**: TypeScript
- **資料庫**: PostgreSQL
- **快取**: Redis
- **檔案儲存**: AWS S3 / MinIO
- **身份驗證**: JWT + LDAP

### 部署
- **容器化**: Docker + Docker Compose
- **開發環境**: 本地開發容器
- **生產環境**: Kubernetes (可選)

## 快速開始

### 前置需求
- Docker 20.10+
- Docker Compose 2.0+
- Git

### 5 分鐘快速啟動

```bash
# 1. 複製專案
git clone <repository-url>
cd foreign-student-verification-system

# 2. 啟動開發環境
docker compose up -d

# 3. 初始化資料庫
./scripts/init-database.sh

# 4. 訪問應用
# 前端: http://localhost:3000
# 後端: http://localhost:5001/api/health
# MinIO: http://localhost:9001
```

詳細說明請參考 [快速開始指南](QUICKSTART.md)

## 文件

- 📖 [快速開始指南](QUICKSTART.md) - 5 分鐘快速啟動
- 🚀 [部署指南](DEPLOYMENT.md) - 完整的部署說明
- 🔧 [維護文件](MAINTENANCE.md) - 系統維護和故障排除
- 📜 [腳本說明](scripts/README.md) - 部署和維護腳本使用說明

## 部署

### 開發環境

```bash
docker compose up -d
```

### 生產環境

```bash
# 1. 設定環境變數
cp .env.production.example .env.production
nano .env.production

# 2. 執行部署
./scripts/deploy.sh production

# 3. 驗證部署
./scripts/health-check.sh
```

詳細部署流程請參考 [部署指南](DEPLOYMENT.md)

## 開發指令

```bash
# 安裝所有依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置專案
npm run build

# 執行測試
npm run test

# 程式碼檢查
npm run lint

# 修正程式碼格式
npm run lint:fix
```

## 專案結構

```
foreign-student-verification-system/
├── backend/                 # 後端 API
│   ├── src/
│   │   ├── controllers/     # API 控制器
│   │   ├── models/         # 資料模型
│   │   ├── services/       # 業務邏輯
│   │   ├── middleware/     # 中介軟體
│   │   ├── routes/         # 路由定義
│   │   ├── utils/          # 工具函數
│   │   ├── config/         # 配置檔案
│   │   └── types/          # TypeScript 類型
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # 前端應用
│   ├── src/
│   │   ├── components/     # React 元件
│   │   ├── pages/          # 頁面元件
│   │   ├── hooks/          # 自訂 Hooks
│   │   ├── services/       # API 服務
│   │   ├── stores/         # 狀態管理
│   │   ├── utils/          # 工具函數
│   │   └── types/          # TypeScript 類型
│   ├── package.json
│   └── tsconfig.json
├── .kiro/                  # Kiro 規格文件
│   └── specs/
├── docker-compose.yml      # Docker 編排
└── README.md
```

## 資料庫設計

系統採用 PostgreSQL 作為主要資料庫，包含以下核心資料表：

- `students`: 學生基本資料
- `users`: 系統使用者
- `units`: 學校單位
- `document_types`: 文件類型定義
- `student_documents`: 學生文件記錄
- `tracking_records`: 操作追蹤記錄

## API 文件

API 遵循 RESTful 設計原則，主要端點包括：

- `GET /api/health` - 系統健康檢查
- `POST /api/auth/login` - 使用者登入
- `GET /api/students` - 取得學生清單
- `POST /api/documents/upload` - 上傳文件
- `GET /api/reports/completion` - 完成度報表

## 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 聯絡資訊

如有任何問題或建議，請聯繫：
- 專案維護者: [維護者姓名]
- Email: [email@university.edu.tw]
- 專案網址: [repository-url]