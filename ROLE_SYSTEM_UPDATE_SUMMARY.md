# 角色系統更新總結

## 📋 更新內容

根據需求進行了以下四項主要修改：

### 1. ✅ 刪除學生角色

**後端修改：**
- `backend/src/models/user.ts`
  - 從 `UserRole` enum 中移除 `STUDENT = 'student'`
  - 移除 `isStudent()` 方法
  - 預設角色改為 `UNIT_STAFF`
  - 更新角色顯示名稱對應表

**影響：**
- 系統現在只有 3 個角色：`admin`、`unit_staff`、`auditor`
- 所有新使用者預設為單位職員

---

### 2. ✅ 系統管理員可以管理使用者帳號

**新增檔案：**
- `backend/src/controllers/user.controller.ts` - 使用者管理控制器
- `backend/src/services/user.service.ts` - 使用者管理服務
- `backend/src/routes/user.routes.ts` - 使用者管理路由

**API 端點：**

| 方法 | 路徑 | 功能 | 權限 |
|------|------|------|------|
| GET | `/api/users` | 取得使用者列表 | 僅管理員 |
| GET | `/api/users/:id` | 取得單一使用者 | 管理員或本人 |
| POST | `/api/users` | 創建新使用者 | 僅管理員 |
| PUT | `/api/users/:id` | 更新使用者 | 管理員或本人 |
| DELETE | `/api/users/:id` | 刪除使用者 | 僅管理員 |
| POST | `/api/users/:id/reset-password` | 重設密碼 | 管理員或本人 |

**創建使用者 API 範例：**
```json
POST /api/users
{
  "username": "john_doe",
  "email": "john@example.com",
  "name": "John Doe",
  "password": "secure_password",
  "role": "unit_staff",
  "unit_id": "global_affairs"
}
```

**功能特點：**
- ✅ 管理員可以創建 `unit_staff` 或 `auditor` 角色
- ✅ 創建單位職員時必須指定 `unit_id`
- ✅ 自動驗證使用者名稱和電子郵件唯一性
- ✅ 密碼自動加密（bcrypt）
- ✅ 不能刪除自己的帳號

---

### 3. ✅ 單位職員權限調整

**修改檔案：**
- `backend/src/models/user.ts`

**新增方法：**
```typescript
// 檢查是否可以存取特定單位的資料
canAccessUnit(unitId: string): boolean {
  // 管理員、稽核人員和單位職員都可以存取所有單位資料
  return this.isAdmin() || this.isAuditor() || this.isUnitStaff();
}

// 檢查是否可以上傳特定單位的文件
canUploadForUnit(unitId: string): boolean {
  // 管理員可以上傳所有單位的文件
  if (this.isAdmin()) {
    return true;
  }
  
  // 單位職員只能上傳自己單位的文件
  if (this.isUnitStaff()) {
    return this.unit_id === unitId;
  }
  
  // 稽核人員不能上傳文件
  return false;
}
```

**權限變更：**

| 功能 | 原本 | 現在 |
|------|------|------|
| 查看所有學生資料 | ❌ 只能看自己單位 | ✅ 可以看所有資料 |
| 上傳文件 | ✅ 自己單位 | ✅ 自己單位 |
| 審核文件 | ❌ | ❌ 不具備 |

---

### 4. ✅ 稽核人員權限調整

**修改檔案：**
- `backend/src/models/user.ts`
- `frontend/src/pages/StudentDetailPage.tsx`
- `frontend/src/components/Navigation.tsx`

**新增方法：**
```typescript
// 檢查是否可以審核文件
canReviewDocuments(): boolean {
  // 只有稽核人員和管理員可以審核文件
  return this.isAuditor() || this.isAdmin();
}
```

**前端權限更新：**
```typescript
// StudentDetailPage.tsx
const canUpdateStatus = user?.role === 'admin' || user?.role === 'auditor';
```

**權限變更：**

| 功能 | 原本 | 現在 |
|------|------|------|
| 查看所有資料 | ✅ | ✅ 唯讀 |
| 查看報表 | ✅ | ✅ |
| 匯出報表 | ✅ | ✅ |
| 審核文件 | ❌ | ✅ **新增** |
| 上傳文件 | ❌ | ❌ |
| 修改資料 | ❌ | ❌ |

---

## 🎯 最終角色權限矩陣

### 系統管理員 (admin)

| 功能類別 | 權限 |
|---------|------|
| 使用者管理 | ✅ 創建、編輯、刪除使用者 |
| 學生管理 | ✅ 完整權限 |
| 文件管理 | ✅ 上傳所有單位文件 |
| 文件審核 | ✅ 更新文件狀態 |
| 報表查看 | ✅ 所有報表 |
| 系統設定 | ✅ 完整權限 |

### 單位職員 (unit_staff)

| 功能類別 | 權限 |
|---------|------|
| 使用者管理 | ❌ |
| 學生管理 | ✅ 查看所有學生資料 |
| 文件管理 | ✅ 上傳所屬單位文件 |
| 文件審核 | ❌ 不具備審核功能 |
| 報表查看 | ❌ |
| 系統設定 | ❌ |

### 稽核人員 (auditor)

| 功能類別 | 權限 |
|---------|------|
| 使用者管理 | ❌ |
| 學生管理 | ✅ 查看所有學生資料（唯讀） |
| 文件管理 | ✅ 查看所有文件（唯讀） |
| 文件審核 | ✅ **更新文件狀態** |
| 報表查看 | ✅ 所有報表 |
| 系統設定 | ❌ |

---

## 🔄 導航選單更新

**前端修改：** `frontend/src/components/Navigation.tsx`

```typescript
// 所有角色都可以看到
- 首頁
- 學生管理
- 文件管理  // 新增：原本學生看不到
- 通知

// 管理員和稽核人員可以看到
if (user?.role === 'admin' || user?.role === 'auditor') {
  - 報表統計  // 更新：原本是 admin 或 unit_manager
}

// 只有管理員可以看到
if (user?.role === 'admin') {
  - 系統設定
}
```

---

## 📝 使用情境

### 情境 1：管理員創建單位職員帳號

```bash
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "global_affairs_staff",
  "email": "staff@global.edu.tw",
  "name": "全球處職員",
  "password": "SecurePass123",
  "role": "unit_staff",
  "unit_id": "global_affairs"
}
```

### 情境 2：管理員創建稽核人員帳號

```bash
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "username": "auditor_wang",
  "email": "wang@audit.edu.tw",
  "name": "王稽核",
  "password": "SecurePass123",
  "role": "auditor"
}
```

### 情境 3：單位職員上傳文件

1. 以 `unit_staff` 角色登入（unit_id: `registration`）
2. 進入任何學生詳情頁面（可以看所有學生）
3. 只能上傳註冊組負責的文件類型
4. **無法更新文件狀態**

### 情境 4：稽核人員審核文件

1. 以 `auditor` 角色登入
2. 進入任何學生詳情頁面
3. 可以查看所有文件
4. 點擊「更新狀態」按鈕
5. 選擇狀態：待審核 → 已核准/已拒絕
6. **無法上傳新文件**

---

## 🗄️ 資料庫變更

**不需要修改資料庫結構**，但需要：

1. **清理現有學生角色使用者**（如果有）：
```sql
-- 查看是否有學生角色的使用者
SELECT * FROM users WHERE role = 'student';

-- 刪除或轉換學生角色使用者
DELETE FROM users WHERE role = 'student';
-- 或
UPDATE users SET role = 'unit_staff' WHERE role = 'student';
```

2. **確保所有 unit_staff 都有 unit_id**：
```sql
-- 檢查沒有 unit_id 的單位職員
SELECT * FROM users WHERE role = 'unit_staff' AND unit_id IS NULL;

-- 更新或刪除這些記錄
UPDATE users SET unit_id = 'default_unit' WHERE role = 'unit_staff' AND unit_id IS NULL;
```

---

## ⚠️ 注意事項

### 1. 前後端角色名稱一致性

確保前端使用的角色名稱與後端一致：
- ✅ `admin` - 系統管理員
- ✅ `unit_staff` - 單位職員
- ✅ `auditor` - 稽核人員
- ❌ ~~`student`~~ - 已移除
- ❌ ~~`reviewer`~~ - 不使用，改用 `auditor`
- ❌ ~~`unit_manager`~~ - 不使用，改用 `auditor`

### 2. 單位職員必須有 unit_id

創建或更新為 `unit_staff` 角色時，必須提供 `unit_id`，否則會驗證失敗。

### 3. 權限檢查

- 前端檢查用於 UI 顯示（隱藏按鈕等）
- 後端檢查用於安全防護（API 權限驗證）
- 兩者都必須實作

### 4. 文件審核權限

現在只有以下角色可以更新文件狀態：
- ✅ 系統管理員 (`admin`)
- ✅ 稽核人員 (`auditor`)
- ❌ 單位職員 (`unit_staff`) - 即使是全球處也不行

---

## 🧪 測試建議

### 1. 測試管理員功能
- [ ] 創建 unit_staff 帳號（有 unit_id）
- [ ] 創建 auditor 帳號（無 unit_id）
- [ ] 更新使用者角色
- [ ] 重設使用者密碼
- [ ] 刪除使用者（不能刪除自己）

### 2. 測試單位職員權限
- [ ] 可以查看所有學生資料
- [ ] 只能上傳所屬單位的文件
- [ ] 無法更新文件狀態
- [ ] 無法存取報表頁面

### 3. 測試稽核人員權限
- [ ] 可以查看所有學生資料
- [ ] 可以查看所有文件
- [ ] 可以更新文件狀態
- [ ] 可以查看和匯出報表
- [ ] 無法上傳文件
- [ ] 無法修改學生資料

---

## 📦 修改的檔案清單

### 後端
- ✅ `backend/src/models/user.ts` - 移除 STUDENT 角色，新增權限方法
- ✅ `backend/src/controllers/user.controller.ts` - 新建使用者管理控制器
- ✅ `backend/src/services/user.service.ts` - 新建使用者管理服務
- ✅ `backend/src/routes/user.routes.ts` - 新建使用者管理路由
- ✅ `backend/src/index.ts` - 整合使用者路由

### 前端
- ✅ `frontend/src/pages/StudentDetailPage.tsx` - 更新審核權限判斷
- ✅ `frontend/src/components/Navigation.tsx` - 更新導航選單邏輯

### 文檔
- ✅ `ROLE_SYSTEM_UPDATE_SUMMARY.md` - 本文檔

---

## 🚀 部署步驟

1. **重啟後端伺服器**
   ```bash
   docker compose restart backend
   # 或
   npm run dev:backend
   ```

2. **檢查日誌**
   ```bash
   docker logs fsvs-backend --tail 50
   ```
   應該看到：`使用者管理端點: http://localhost:5000/api/users`

3. **測試 API**
   ```bash
   # 取得使用者列表（需要管理員 token）
   curl http://localhost:5001/api/users \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

4. **前端無需重新編譯**
   - 前端修改會自動熱重載

---

## ✅ 完成狀態

- ✅ 1. 刪除學生角色
- ✅ 2. 管理員可以管理使用者帳號
- ✅ 3. 單位職員權限調整
- ✅ 4. 稽核人員權限調整

所有修改已完成並通過編譯檢查！
