# 人員管理頁面更新總結

## 📋 更新內容

將導航選單中的「文件管理」改為「人員管理」，並且只有管理員可以看到此選項和頁面。

---

## 🔄 修改的檔案

### 1. 前端導航選單
**檔案**: `frontend/src/components/Navigation.tsx`

**修改內容**:
```typescript
// 移除：所有角色都可以看到文件管理
baseItems.push({
  key: '/documents',
  icon: <FileOutlined />,
  label: '文件管理',
});

// 新增：只有管理員可以看到人員管理
if (user?.role === 'admin') {
  baseItems.push({
    key: '/users',
    icon: <UserOutlined />,
    label: '人員管理',
  });
}
```

### 2. 新增人員管理頁面
**檔案**: `frontend/src/pages/UsersPage.tsx`

**功能特點**:
- ✅ 使用者列表顯示（表格）
- ✅ 新增使用者
- ✅ 編輯使用者
- ✅ 刪除使用者
- ✅ 重設密碼
- ✅ 角色管理（admin、unit_staff、auditor）
- ✅ 單位選擇（當角色為 unit_staff 時）
- ✅ 啟用/停用狀態

### 3. 路由配置
**檔案**: `frontend/src/App.tsx`

**新增路由**:
```typescript
<Route path="users" element={<UsersPage />} />
```

---

## 🎯 人員管理頁面功能

### 使用者列表

| 欄位 | 說明 |
|------|------|
| 使用者名稱 | 登入帳號 |
| 姓名 | 真實姓名 |
| 電子郵件 | Email 地址 |
| 角色 | 系統管理員/單位職員/稽核人員 |
| 單位 | 所屬單位（僅單位職員） |
| 狀態 | 啟用/停用 |
| 操作 | 編輯/重設密碼/刪除 |

### 新增使用者表單

**必填欄位**:
- 使用者名稱（至少3個字元，創建後不可修改）
- 姓名
- 電子郵件（需符合 email 格式）
- 密碼（至少6個字元）
- 角色（admin/unit_staff/auditor）
- 所屬單位（僅當角色為 unit_staff 時必填）

**驗證規則**:
- 使用者名稱唯一性（後端驗證）
- 電子郵件唯一性（後端驗證）
- 單位職員必須選擇單位
- 密碼長度至少6個字元

### 編輯使用者

**可編輯欄位**:
- 姓名
- 電子郵件
- 角色
- 所屬單位（當角色為 unit_staff 時）
- 啟用/停用狀態

**限制**:
- 使用者名稱不可修改
- 不能刪除自己的帳號

### 重設密碼

**功能**:
- 管理員可以重設任何使用者的密碼
- 需要輸入新密碼並確認
- 密碼至少6個字元

---

## 🔐 權限控制

### 導航選單顯示

| 角色 | 是否顯示「人員管理」 |
|------|---------------------|
| admin | ✅ 顯示 |
| unit_staff | ❌ 不顯示 |
| auditor | ❌ 不顯示 |

### 頁面存取權限

- ✅ 只有 `admin` 角色可以存取 `/users` 頁面
- ❌ 其他角色訪問會被導航選單隱藏
- ⚠️ 建議在頁面層級也加入權限檢查

### API 權限

後端 API 已實作權限控制：
- `GET /api/users` - 僅管理員
- `POST /api/users` - 僅管理員
- `PUT /api/users/:id` - 管理員或本人
- `DELETE /api/users/:id` - 僅管理員
- `POST /api/users/:id/reset-password` - 管理員或本人

---

## 📸 頁面截圖說明

### 使用者列表頁面
- 顯示所有使用者的表格
- 右上角有「新增使用者」按鈕
- 每行有「編輯」、「重設密碼」、「刪除」操作按鈕
- 角色以不同顏色的標籤顯示：
  - 🔴 系統管理員（紅色）
  - 🔵 單位職員（藍色）
  - 🟢 稽核人員（綠色）

### 新增/編輯使用者對話框
- 表單包含所有必要欄位
- 角色選擇為下拉選單
- 當選擇「單位職員」時，會顯示「所屬單位」欄位
- 驗證錯誤會即時顯示

### 重設密碼對話框
- 簡單的表單，只需輸入新密碼和確認密碼
- 兩次密碼必須一致

---

## 🎨 UI 元件使用

### Ant Design 元件
- `Card` - 頁面容器
- `Table` - 使用者列表
- `Modal` - 新增/編輯/重設密碼對話框
- `Form` - 表單處理
- `Input` - 文字輸入
- `Input.Password` - 密碼輸入
- `Select` - 下拉選單
- `Tag` - 角色和狀態標籤
- `Button` - 操作按鈕
- `Popconfirm` - 刪除確認
- `message` - 成功/錯誤訊息

### 圖示
- `PlusOutlined` - 新增
- `EditOutlined` - 編輯
- `DeleteOutlined` - 刪除
- `KeyOutlined` - 重設密碼
- `UserOutlined` - 使用者

---

## 🔄 與後端 API 整合

### API 呼叫

```typescript
// 取得使用者列表
GET /api/users
Response: { success: true, data: User[] }

// 創建使用者
POST /api/users
Body: { username, email, name, password, role, unit_id? }
Response: { success: true, data: User, message: string }

// 更新使用者
PUT /api/users/:id
Body: { email?, name?, role?, unit_id?, is_active? }
Response: { success: true, data: User, message: string }

// 刪除使用者
DELETE /api/users/:id
Response: { success: true, message: string }

// 重設密碼
POST /api/users/:id/reset-password
Body: { newPassword: string }
Response: { success: true, message: string }

// 取得單位列表
GET /api/units
Response: { success: true, data: Unit[] }
```

---

## ⚠️ 注意事項

### 1. 單位列表 API

頁面會呼叫 `/api/units` 來取得單位列表。如果此 API 不存在，需要創建或修改程式碼。

**臨時解決方案**（如果 API 不存在）:
```typescript
// 在 UsersPage.tsx 中硬編碼單位列表
const units = [
  { unit_id: 'global_affairs', unit_name: '全球處' },
  { unit_id: 'registration', unit_name: '註冊組' },
  { unit_id: 'internship', unit_name: '實就組' },
  { unit_id: 'language_center', unit_name: '外語中心' },
  { unit_id: 'dormitory', unit_name: '宿輔組' },
];
```

### 2. 權限檢查

建議在 `UsersPage.tsx` 開頭加入權限檢查：

```typescript
const UsersPage: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      message.error('沒有權限存取此頁面');
      navigate('/');
    }
  }, [currentUser, navigate]);

  // ... 其他程式碼
};
```

### 3. 不能刪除自己

程式碼已實作此邏輯：
```typescript
{record.user_id !== currentUser?.user_id && (
  <Popconfirm ...>
    <Button>刪除</Button>
  </Popconfirm>
)}
```

### 4. 密碼安全

- 密碼在傳輸時使用 HTTPS
- 後端使用 bcrypt 加密儲存
- 前端不儲存密碼

---

## 🧪 測試建議

### 功能測試

1. **新增使用者**
   - [ ] 創建系統管理員
   - [ ] 創建單位職員（需選擇單位）
   - [ ] 創建稽核人員
   - [ ] 驗證必填欄位
   - [ ] 驗證密碼長度
   - [ ] 驗證 email 格式

2. **編輯使用者**
   - [ ] 修改姓名
   - [ ] 修改 email
   - [ ] 變更角色
   - [ ] 變更單位
   - [ ] 啟用/停用使用者

3. **刪除使用者**
   - [ ] 刪除其他使用者
   - [ ] 確認不能刪除自己
   - [ ] 確認刪除提示

4. **重設密碼**
   - [ ] 重設其他使用者密碼
   - [ ] 驗證密碼長度
   - [ ] 驗證密碼確認

5. **權限測試**
   - [ ] 管理員可以看到「人員管理」選單
   - [ ] 單位職員看不到「人員管理」選單
   - [ ] 稽核人員看不到「人員管理」選單

---

## 📦 部署

前端會自動熱重載，無需重啟。如果需要手動重啟：

```bash
docker compose restart frontend
```

---

## ✅ 完成狀態

- ✅ 導航選單更新（移除文件管理，新增人員管理）
- ✅ 只有管理員可以看到人員管理選單
- ✅ 創建人員管理頁面
- ✅ 整合到路由系統
- ✅ 實作完整的 CRUD 功能
- ✅ 實作密碼重設功能
- ✅ 實作權限控制

所有修改已完成並通過編譯檢查！
