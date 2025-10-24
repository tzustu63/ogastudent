# 完整編碼問題修復指南

## 問題根源

### 發現的問題
檔名顯示為 `é¦¬ä¾è¥¿äºæçè¡ç¨.pdf` 而不是 `馬來西亞的行程.pdf`

### 根本原因
**Multer 預設使用 Latin-1 解碼 multipart/form-data 中的檔名**

#### 編碼流程問題：
```
瀏覽器上傳 "馬來西亞.pdf"
  ↓ (UTF-8 字節: E9 A6 AC E4 BE 86...)
Multer 用 Latin-1 解碼
  ↓ (每個字節變成一個字符: é¦¬ä¾†...)
存入 PostgreSQL (UTF-8)
  ↓ (再次 UTF-8 編碼: C3 A9 C2 A6 C2 AC...)
結果：雙重編碼，顯示亂碼
```

## 已實施的修正

### 1. ✅ Multer 編碼修正

**檔案**: `backend/src/middleware/upload.middleware.ts`

**修正內容**:
```typescript
// 新增編碼修正中介軟體
export const fixFilenameEncoding = (req: Request, _res: any, next: any) => {
  if (req.file && req.file.originalname) {
    try {
      // Multer 預設用 latin1 解碼，我們需要轉回 UTF-8
      const latin1Buffer = Buffer.from(req.file.originalname, 'latin1');
      req.file.originalname = latin1Buffer.toString('utf8');
    } catch (error) {
      console.error('檔名編碼轉換失敗:', error);
    }
  }
  next();
};
```

**效果**: 新上傳的檔案檔名會正確儲存為 UTF-8

### 2. ✅ Docker 配置優化

**檔案**: `docker-compose.yml`

**修正內容**:
- PostgreSQL: `LANG: C.UTF-8` (更通用的 UTF-8 locale)
- Backend: `LANG: C.UTF-8`
- 移除特定地區的 locale (`zh_TW.UTF-8` → `C.UTF-8`)

**原因**: `C.UTF-8` 是最通用的 UTF-8 locale，避免地區特定問題

### 3. ✅ 資料庫修復腳本

**檔案**: `scripts/fix-database-encoding.sh`

**功能**:
1. 檢查當前資料庫中的檔名
2. 預覽修正結果
3. 備份資料
4. 執行編碼轉換
5. 驗證修正結果

**轉換邏輯**:
```sql
UPDATE student_documents
SET file_name = convert_from(convert_to(file_name, 'LATIN1'), 'UTF8')
WHERE file_name IS NOT NULL
AND file_name ~ '[^\x00-\x7F]';  -- 只修正非 ASCII 字符
```

### 4. ✅ 前端配置

**已完成的配置**:
- Axios: `responseEncoding: 'utf8'`
- Vite proxy: 強制 `Content-Type: application/json; charset=utf-8`
- React Router: 添加 future flags（消除警告）
- Modal: 使用正確的 `destroyOnHidden` 屬性

### 5. ✅ 後端配置

**已完成的配置**:
- Express: 統一設定 `Content-Type: application/json; charset=utf-8`
- CORS: 正確暴露 headers
- PostgreSQL: `client_encoding: UTF8`

## 執行修復

### 方法 1: 一鍵完整修復（推薦）

```bash
./scripts/complete-encoding-fix.sh
```

這個腳本會：
1. 停止現有服務
2. 重新建置並啟動服務
3. 等待服務就緒
4. 檢查健康狀態
5. 修正資料庫中的檔名

### 方法 2: 分步執行

#### 步驟 1: 重啟服務套用新配置
```bash
docker compose down
docker compose up -d --build
```

#### 步驟 2: 等待服務啟動
```bash
sleep 30
docker compose ps
```

#### 步驟 3: 修正資料庫檔名
```bash
./scripts/fix-database-encoding.sh
```

### 方法 3: 僅修正資料庫（服務已在運行）

```bash
./scripts/fix-database-encoding.sh
```

## 驗證修復

### 1. 檢查後端 API

```bash
curl http://localhost:5001/api/health
```

應該看到正確的中文：
```json
{
  "success": true,
  "message": "外國學生受教權查核系統 API 運行正常",
  ...
}
```

### 2. 檢查資料庫編碼

```bash
docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c "
SELECT file_name FROM student_documents WHERE file_name IS NOT NULL LIMIT 5;
"
```

應該看到正確的中文檔名，而不是亂碼。

### 3. 測試檔案上傳

1. 開啟瀏覽器: http://localhost:3000
2. 登入系統（testuser / password123）
3. 上傳一個中文檔名的檔案，例如：`測試文件.pdf`
4. 檢查檔名是否正確顯示

### 4. 檢查網路請求

在瀏覽器開發者工具的 Network 標籤：
- Response Headers 應包含: `Content-Type: application/json; charset=utf-8`
- Response 內容中的中文應正確顯示

## 技術細節

### UTF-8 編碼鏈路（修正後）

```
瀏覽器 (UTF-8)
  ↓
Vite Dev Server (UTF-8 proxy)
  ↓
Express Server (UTF-8 middleware)
  ↓
Multer (Latin-1 → UTF-8 轉換) ← 新增修正
  ↓
PostgreSQL (UTF-8 client_encoding)
  ↓
Express Response (UTF-8 Content-Type)
  ↓
Vite Proxy (UTF-8 header)
  ↓
Axios (UTF-8 responseEncoding)
  ↓
React Component (UTF-8 display)
```

### 為什麼選擇 C.UTF-8？

| Locale | 優點 | 缺點 |
|--------|------|------|
| `zh_TW.UTF-8` | 支援繁體中文排序 | 需要安裝語言包，可能不存在 |
| `en_US.UTF-8` | 廣泛支援 | 需要安裝語言包 |
| `C.UTF-8` | **內建，最通用** | 排序規則簡單（按 Unicode） |

**結論**: `C.UTF-8` 是最可靠的選擇，在所有系統上都可用。

### Multer 編碼問題的歷史

- **HTTP 規範問題**: RFC 2388 沒有明確規定檔名編碼
- **瀏覽器行為**: 現代瀏覽器使用 UTF-8，但 HTTP header 傳統上是 ASCII
- **Multer 預設**: 為了向後兼容，使用 Latin-1
- **解決方案**: 手動轉換 Latin-1 → UTF-8

## 故障排除

### 問題 1: 修正後檔名還是亂碼

**可能原因**: 資料庫修復腳本未執行或執行失敗

**解決方案**:
```bash
# 檢查資料庫中的檔名
docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c "
SELECT file_name FROM student_documents LIMIT 5;
"

# 重新執行修復
./scripts/fix-database-encoding.sh
```

### 問題 2: 新上傳的檔案還是亂碼

**可能原因**: 後端服務未重啟

**解決方案**:
```bash
docker compose restart backend
```

### 問題 3: 資料庫修復後檔名變成其他亂碼

**可能原因**: 資料已經損壞太嚴重，或轉換邏輯不適用

**解決方案**:
```bash
# 從備份還原
docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c "
DELETE FROM student_documents;
INSERT INTO student_documents SELECT * FROM student_documents_backup_encoding;
"

# 重新上傳檔案
```

### 問題 4: Docker 容器無法啟動

**可能原因**: Locale 不存在

**解決方案**:
檢查 Docker 日誌：
```bash
docker compose logs postgres
docker compose logs backend
```

如果看到 locale 錯誤，確認 `docker-compose.yml` 使用 `C.UTF-8`

## 預防措施

### 1. 定期檢查編碼

創建監控腳本：
```bash
#!/bin/bash
# 檢查是否有新的編碼問題
docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c "
SELECT COUNT(*) as 可能有問題的檔名
FROM student_documents 
WHERE file_name ~ '[^\x00-\x7F]'
AND file_name ~ 'Ã|Â|©|ª|«';
"
```

### 2. 測試中文檔名

在 CI/CD 中加入測試：
```typescript
describe('File Upload Encoding', () => {
  it('should handle Chinese filename correctly', async () => {
    const filename = '測試文件.pdf';
    // ... 上傳測試
    expect(savedFilename).toBe(filename);
  });
});
```

### 3. 文檔化

在 README 中說明：
- 系統支援 UTF-8 檔名
- 上傳檔案時保持原始檔名
- 避免使用特殊字符（`/ \ : * ? " < > |`）

## 相關檔案清單

### 修改的檔案
- `backend/src/middleware/upload.middleware.ts` - Multer 編碼修正
- `docker-compose.yml` - Locale 配置
- `frontend/src/main.tsx` - React Router future flags
- `frontend/src/services/api.ts` - Axios UTF-8 配置
- `frontend/vite.config.ts` - Vite proxy UTF-8
- `backend/src/index.ts` - Express UTF-8 middleware

### 新增的檔案
- `scripts/fix-database-encoding.sql` - SQL 修復腳本
- `scripts/fix-database-encoding.sh` - 資料庫修復腳本
- `scripts/complete-encoding-fix.sh` - 一鍵完整修復
- `COMPLETE_ENCODING_FIX.md` - 本文件

### 參考檔案
- `ENCODING_FIX_SUMMARY.md` - 之前的修復總結
- `scripts/FIX_CHINESE_ENCODING.md` - 檔名編碼問題說明

## 總結

所有編碼問題已完整修復：

✅ **前端**: React Router 警告、Modal 警告、Axios UTF-8 配置
✅ **後端**: Multer 編碼轉換、Express UTF-8 middleware
✅ **資料庫**: UTF-8 配置、檔名修復腳本
✅ **基礎設施**: Docker 使用通用 C.UTF-8 locale
✅ **工具**: 一鍵修復腳本、驗證腳本

執行 `./scripts/complete-encoding-fix.sh` 即可完成所有修復！
