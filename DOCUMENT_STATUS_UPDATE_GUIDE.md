# 文件狀態審核功能使用指南

## 功能概述

此功能允許具有審核權限的用戶（全球處職員、審核人員或管理員）更新已上傳文件的審核狀態。

## 文件狀態說明

系統支援以下四種文件狀態：

1. **待審核 (pending)** - 橙色標籤 🟠
   - 文件剛上傳，等待審核
   - 預設狀態

2. **審核中 (under_review)** - 藍色標籤，旋轉圖示 🔵
   - 文件正在審核過程中
   - 表示審核人員已開始處理

3. **已核准 (approved)** - 綠色標籤 ✅
   - 文件審核通過
   - 符合要求

4. **已拒絕 (rejected)** - 紅色標籤 ❌
   - 文件審核未通過
   - 需要重新上傳或修正
   - **必須填寫拒絕原因**

## 如何更新文件狀態

### 方法一：從學生詳情頁面

1. 進入學生詳情頁面
2. 在「文件檢查清單」中找到要審核的文件
3. 點擊文件右側的「更新狀態」按鈕
4. 在彈出的對話框中：
   - 選擇新的狀態
   - 填寫備註說明（拒絕時必填）
5. 點擊「確認更新」

### 方法二：從文件列表

1. 在任何顯示文件列表的頁面
2. 找到要審核的文件
3. 點擊「更新狀態」按鈕
4. 按照相同步驟完成狀態更新

## 權限控制

只有以下用戶可以更新文件狀態：
- 管理員 (role: 'admin')
- 審核人員 (role: 'reviewer')
- 全球處職員 (unit_id: 'global_affairs')

其他用戶只能查看文件狀態，無法更新。

## API端點

### 更新文件狀態
```
PUT /api/documents/:id/status
```

**請求參數：**
```json
{
  "status": "approved",  // pending | under_review | approved | rejected
  "remarks": "審核通過"   // 選填，拒絕時必填
}
```

**回應：**
```json
{
  "success": true,
  "message": "文件狀態更新成功",
  "data": {
    "document_id": "...",
    "status": "approved",
    "status_display_name": "已核准",
    ...
  }
}
```

## 實作細節

### 前端元件

1. **DocumentStatusModal** (`frontend/src/components/Document/DocumentStatusModal.tsx`)
   - 狀態更新對話框
   - 表單驗證（拒絕時必須填寫原因）
   - 狀態選項顯示

2. **DocumentChecklist** (`frontend/src/components/Student/DocumentChecklist.tsx`)
   - 整合狀態更新按鈕
   - 顯示優化的狀態標籤
   - 權限控制

3. **DocumentList** (`frontend/src/components/Student/DocumentList.tsx`)
   - 支援狀態更新功能
   - 可選的權限控制

### 後端服務

1. **DocumentService.updateDocumentStatus**
   - 更新文件狀態
   - 記錄追蹤日誌
   - 驗證權限

2. **DocumentController.updateDocumentStatus**
   - API端點處理
   - 錯誤處理
   - 回應格式化

## 追蹤記錄

每次狀態更新都會自動記錄：
- 操作者
- 操作時間
- 舊狀態 → 新狀態
- 備註說明

可在追蹤記錄中查看完整的審核歷程。

## 注意事項

1. **拒絕原因必填**：當狀態更新為「已拒絕」時，必須填寫拒絕原因
2. **權限檢查**：系統會自動檢查用戶權限，無權限用戶看不到「更新狀態」按鈕
3. **自動刷新**：狀態更新成功後，頁面會自動重新載入學生資料
4. **通知機制**：未來可擴展為狀態更新後自動通知相關人員

## 測試建議

1. 測試不同角色的權限控制
2. 測試拒絕時的必填驗證
3. 測試狀態更新後的資料刷新
4. 測試追蹤記錄是否正確記錄

## 未來擴展

- [ ] 批量狀態更新
- [ ] 狀態更新通知（Email/系統通知）
- [ ] 狀態變更歷史查詢
- [ ] 狀態篩選功能
- [ ] 審核工作流程（多級審核）
