# 開發環境認證說明

## 問題：上傳檔案時出現 400 或 401 錯誤

### 原因
系統需要使用者認證才能上傳檔案。如果沒有登入或 token 無效，會出現錯誤。

### 解決方案

#### 方案 1：正常登入（推薦）
1. 確保後端和資料庫正在運行
2. 訪問登入頁面
3. 使用有效的帳號登入
4. 登入後 token 會自動儲存在 localStorage
5. 之後的請求會自動帶上 token

#### 方案 2：開發模式 - 繞過認證（僅用於開發）

如果需要在開發環境中快速測試，可以暫時繞過認證：

**修改 `backend/src/routes/document.routes.ts`：**

```typescript
export function createDocumentRoutes(pool: Pool): Router {
  const router = Router();
  const documentController = new DocumentController(pool);

  // 開發模式：註解掉認證中間件
  // router.use(authenticate);
  
  // 開發模式：添加假的使用者資訊
  if (process.env.NODE_ENV === 'development') {
    router.use((req, _res, next) => {
      (req as any).user = {
        user_id: 'dev_user_001',
        username: 'dev_user',
        role: 'admin',
        unit_id: 'global_affairs',
        email: 'dev@example.com'
      };
      next();
    });
  } else {
    router.use(authenticate);
  }
  
  // ... 其他路由
}
```

**重要**：這個修改僅用於開發環境，不要在生產環境使用！

#### 方案 3：使用 API 測試工具創建測試帳號

使用 Postman 或 curl 創建測試帳號：

```bash
# 1. 創建測試使用者（如果有註冊 API）
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "password": "test123",
    "email": "test@example.com",
    "unit_id": "global_affairs",
    "role": "staff"
  }'

# 2. 登入取得 token
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "password": "test123"
  }'

# 3. 複製回傳的 token
# 4. 在瀏覽器 Console 中執行：
localStorage.setItem('auth_token', 'YOUR_TOKEN_HERE');
```

### 檢查當前認證狀態

在瀏覽器 Console 中執行：

```javascript
// 檢查是否有 token
console.log('Token:', localStorage.getItem('auth_token'));

// 檢查使用者資訊
console.log('User:', localStorage.getItem('user_info'));

// 測試 API 連接
fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
})
.then(r => r.json())
.then(console.log);
```

### 常見錯誤碼

- **400 Bad Request**: 缺少必填欄位或欄位格式錯誤
- **401 Unauthorized**: 未登入或 token 無效/過期
- **403 Forbidden**: 已登入但沒有權限（單位不符）
- **404 Not Found**: 文件類型不存在

### 調試步驟

1. **檢查後端日誌**：
```bash
docker compose logs -f backend
```

2. **檢查瀏覽器 Network 標籤**：
   - 查看請求的 Headers 是否包含 Authorization
   - 查看回應的錯誤訊息

3. **檢查資料庫**：
```bash
docker compose exec postgres psql -U postgres -d foreign_student_verification

# 查看使用者
SELECT * FROM users;

# 查看單位
SELECT * FROM units;

# 查看文件類型
SELECT * FROM document_types;
```

### 初始化測試資料

如果資料庫是空的，需要先初始化基礎資料：

```bash
# 執行資料庫遷移
docker compose exec backend npm run migrate

# 或使用初始化腳本
./scripts/init-database.sh
```

確保有：
- 至少一個使用者帳號
- 至少一個單位（unit）
- 文件類型（document_types）
