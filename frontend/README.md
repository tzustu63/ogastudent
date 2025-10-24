# 外國學生受教權查核系統 - 前端

## 專案結構

```
src/
├── components/          # React 元件
│   ├── Common/         # 共用元件 (Loading, ErrorDisplay, Form components)
│   ├── Document/       # 文件相關元件 (Upload, Preview, WebLink)
│   ├── Layout/         # 佈局元件 (Header, Sidebar, Footer)
│   ├── Report/         # 報表元件 (Dashboard, AuditReport, Tracking)
│   ├── Student/        # 學生相關元件 (List, Profile, Search)
│   ├── Navigation.tsx  # 導航選單
│   ├── ProtectedRoute.tsx  # 路由保護
│   └── UserInfo.tsx    # 使用者資訊顯示
├── pages/              # 頁面元件
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── StudentsPage.tsx
│   ├── StudentDetailPage.tsx
│   └── ReportsPage.tsx
├── services/           # API 服務層
│   ├── api.ts          # Axios 配置和攔截器
│   ├── auth.service.ts
│   ├── student.service.ts
│   ├── document.service.ts
│   └── report.service.ts
├── stores/             # Zustand 狀態管理
│   ├── authStore.ts
│   ├── studentStore.ts
│   └── documentStore.ts
└── types/              # TypeScript 類型定義

## 主要功能

### 1. 身份驗證
- JWT token 管理
- 自動 token 刷新
- 受保護路由
- 角色權限控制

### 2. 學生管理
- 學生列表查詢和篩選
- 學生詳細資料查看
- 文件完成度追蹤

### 3. 文件管理
- 檔案上傳 (拖拉上傳)
- 網頁連結管理
- 文件預覽
- 文件狀態追蹤

### 4. 報表統計
- 儀表板統計
- 稽核報表
- 追蹤記錄查詢
- 報表匯出

## 技術堆疊

- **框架**: React 18 + TypeScript
- **UI 庫**: Ant Design 5
- **狀態管理**: Zustand
- **路由**: React Router v6
- **HTTP 客戶端**: Axios
- **圖表**: @ant-design/plots
- **日期處理**: dayjs
- **測試**: Vitest + Testing Library

## 環境設定

1. 複製環境變數檔案：
```bash
cp .env.example .env
```

2. 設定 API 端點：
```
VITE_API_BASE_URL=http://localhost:3000/api
```

## 開發指令

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建置
npm run build

# 測試
npm test

# Lint
npm run lint
```

## API 服務

所有 API 請求都會自動：
- 添加 JWT token 到 Authorization header
- 處理 401 錯誤並重定向到登入頁
- 顯示錯誤訊息
- 處理網路錯誤

## 狀態管理

使用 Zustand 進行狀態管理，主要 stores：

- **authStore**: 使用者認證狀態
- **studentStore**: 學生資料狀態
- **documentStore**: 文件管理狀態

## 路由結構

```
/login              - 登入頁面
/                   - 首頁 (需登入)
/students           - 學生列表 (需登入)
/students/:id       - 學生詳細資料 (需登入)
/reports            - 報表統計 (需登入，限管理員)
```

## 元件測試

測試檔案位於 `src/components/__tests__/`，涵蓋：
- 登入表單驗證
- 路由保護
- 文件上傳
- 學生列表顯示

## 注意事項

1. 所有日期使用 dayjs 處理
2. 表單驗證使用 Ant Design Form
3. 錯誤處理統一在 API 攔截器中處理
4. 使用 TypeScript 確保類型安全
