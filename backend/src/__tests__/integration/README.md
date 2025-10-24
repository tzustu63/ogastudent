# 整合測試說明

## 概述

此目錄包含外國學生受教權查核系統的整合測試套件。整合測試驗證系統各元件之間的互動和完整的業務流程。

## 測試檔案

- `setup.ts` - 測試環境設定和輔助函數
- `auth.integration.test.ts` - 身份驗證和授權測試
- `student.integration.test.ts` - 學生管理功能測試
- `document.integration.test.ts` - 文件管理功能測試
- `workflow.integration.test.ts` - 端對端工作流程測試

## 執行測試

### 執行所有整合測試
```bash
npm run test:integration
```

### 執行特定測試檔案
```bash
npm test -- auth.integration.test.ts
```

### 執行所有測試（包含單元測試）
```bash
npm test
```

## 測試環境設定

### 資料庫設定

整合測試需要一個獨立的測試資料庫。請確保以下環境變數已設定：

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=foreign_student_verification_test
DB_USER=postgres
DB_PASSWORD=password
```

### Redis 設定（可選）

如果要測試快取功能，請設定 Redis：

```env
REDIS_URL=redis://localhost:6379
```

## 測試資料管理

- 每個測試執行前會清理測試資料
- 測試使用獨立的測試資料庫，不會影響開發或生產資料
- 測試結束後會自動清理資源

## 測試覆蓋範圍

### 身份驗證測試
- 使用者登入
- Token 驗證
- 權限檢查

### 學生管理測試
- 學生列表查詢
- 學生詳情查詢
- 搜尋和篩選
- 完成度計算

### 文件管理測試
- 文件上傳（檔案和網頁連結）
- 文件查詢
- 文件狀態更新
- 文件刪除

### 工作流程測試
- 完整的文件上傳流程
- 權限控制驗證
- 資料一致性檢查

## 最佳實踐

1. **獨立性**: 每個測試應該獨立運行，不依賴其他測試
2. **清理**: 測試前後清理資料，確保測試環境乾淨
3. **真實性**: 使用真實的資料庫和服務，不使用 mock
4. **完整性**: 測試完整的業務流程，包含錯誤處理

## 故障排除

### 資料庫連線失敗
- 確認測試資料庫已建立
- 檢查環境變數設定
- 確認資料庫服務正在運行

### Redis 連線失敗
- Redis 是可選的，連線失敗不會影響大部分測試
- 如需測試快取功能，請確保 Redis 服務運行

### 測試超時
- 增加 Jest 超時設定
- 檢查資料庫查詢效能
- 確認網路連線正常
