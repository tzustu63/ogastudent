# 報表頁面修復說明

## 問題描述

報表頁面 (`http://localhost:3000/reports`) 無法正常運作，因為：

1. 前端呼叫 `/api/reports/dashboard` 和 `/api/reports/audit`
2. 後端沒有對應的路由（只有 `/api/tracking/reports/audit`）
3. API 回應格式不一致

## 修復內容

### 1. 新增後端報表路由

**檔案：`backend/src/routes/report.routes.ts`**
- 創建獨立的報表路由
- 支援三個端點：
  - `GET /api/reports/dashboard` - 儀表板統計
  - `GET /api/reports/audit` - 稽核報表
  - `GET /api/reports/export` - 匯出報表

### 2. 新增報表控制器

**檔案：`backend/src/controllers/report.controller.ts`**
- 處理報表相關的 HTTP 請求
- 統一錯誤處理
- 標準化回應格式

### 3. 新增報表服務

**檔案：`backend/src/services/report.service.ts`**
- `getDashboardStats()` - 計算儀表板統計資料
  - 學生總數和在學學生數
  - 平均完成度
  - 待處理和已完成文件數
  - 各類型文件統計
  - 最近活動記錄

- `getAuditReport()` - 產生稽核報表
  - 支援日期範圍篩選
  - 支援單位和操作類型篩選
  - 支援分頁

- `exportAuditReport()` - 匯出為 CSV/Excel
  - 支援中文（加入 BOM）
  - 最多匯出 10000 筆記錄

### 4. 整合到主應用程式

**檔案：`backend/src/index.ts`**
- 加入報表路由：`app.use('/api/reports', createReportRoutes(pool))`
- 更新啟動日誌

### 5. 修正前端服務

**檔案：`frontend/src/services/report.service.ts`**
- 修正 API 回應解析
- 正確處理 `{ success: boolean; data: ... }` 格式

## API 端點

### 儀表板統計
```
GET /api/reports/dashboard
```

**回應：**
```json
{
  "success": true,
  "data": {
    "totalStudents": 100,
    "activeStudents": 95,
    "averageCompletion": 75.5,
    "pendingDocuments": 20,
    "completedDocuments": 150,
    "documentsByType": [...],
    "recentActivities": [...]
  }
}
```

### 稽核報表
```
GET /api/reports/audit?startDate=2024-01-01&endDate=2024-12-31&page=1&limit=10
```

**回應：**
```json
{
  "success": true,
  "data": {
    "records": [...],
    "total": 100
  }
}
```

### 匯出報表
```
GET /api/reports/export?startDate=2024-01-01&endDate=2024-12-31
```

**回應：** CSV/Excel 檔案

## 測試步驟

1. **重啟後端伺服器**
   ```bash
   npm run dev:backend
   ```

2. **檢查啟動日誌**
   應該看到：`報表端點: http://localhost:5001/api/reports`

3. **測試 API**
   ```bash
   # 測試儀表板
   curl http://localhost:5001/api/reports/dashboard \
     -H "Authorization: Bearer YOUR_TOKEN"

   # 測試稽核報表
   curl http://localhost:5001/api/reports/audit?page=1&limit=10 \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **測試前端**
   - 開啟 `http://localhost:3000/reports`
   - 應該能看到三個分頁：儀表板、稽核報表、追蹤記錄
   - 所有資料應該正常載入

## 資料庫查詢

報表服務會執行以下查詢：

1. **學生統計** - 從 `students` 表
2. **文件統計** - 從 `student_documents` 表
3. **完成度計算** - JOIN `students` 和 `student_documents`
4. **文件類型統計** - JOIN `document_types` 和 `student_documents`
5. **最近活動** - 從 `tracking_records` 表

確保這些表都有資料，否則統計會顯示 0。

## 注意事項

1. **權限控制**：所有報表端點都需要身份驗證
2. **效能**：大量資料時可能需要加入快取
3. **匯出限制**：最多匯出 10000 筆記錄
4. **中文支援**：CSV 檔案加入 BOM 以支援 Excel 開啟中文

## 未來改進

- [ ] 加入 Redis 快取提升效能
- [ ] 支援更多匯出格式（真正的 Excel XLSX）
- [ ] 加入圖表資料 API
- [ ] 支援自訂報表範本
- [ ] 加入排程自動產生報表
