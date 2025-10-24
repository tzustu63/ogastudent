# 修正中文檔名編碼問題

## 問題描述
檔名顯示為亂碼（例如：`å¯¦ç¿è¨ªè¦ç´éè¡¨-ååæ.docx`），這是 UTF-8 編碼問題。

## 已修正的代碼

### 1. 後端上傳 (`backend/src/middleware/upload.middleware.ts`)
- ✅ 保留中文字符，只移除檔案系統不允許的特殊字符

### 2. 後端下載 (`backend/src/controllers/document.controller.ts`)
- ✅ 使用 RFC 5987 格式的 Content-Disposition header
- ✅ 同時提供 ASCII 備用檔名和 UTF-8 編碼檔名

### 3. 資料庫連接 (`backend/src/config/database.ts`)
- ✅ 明確指定 `client_encoding: 'UTF8'`

### 4. Express 應用 (`backend/src/index.ts`)
- ✅ 設定回應 Content-Type 為 `application/json; charset=utf-8`

### 5. 前端下載 (`frontend/src/services/document.service.ts`)
- ✅ 從 Content-Disposition header 解析 UTF-8 編碼的檔名

## 檢查步驟

### 1. 檢查資料庫編碼
```bash
# 進入 PostgreSQL 容器
docker compose exec postgres psql -U postgres -d foreign_student_verification

# 執行檢查腳本
\i /path/to/scripts/fix-encoding.sql
```

或直接執行：
```bash
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "SHOW server_encoding;"
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "SHOW client_encoding;"
```

應該顯示：
- `server_encoding: UTF8`
- `client_encoding: UTF8`

### 2. 檢查現有資料
```sql
SELECT 
    document_id,
    file_name,
    encode(file_name::bytea, 'hex') as hex_encoding
FROM student_documents 
WHERE file_name IS NOT NULL
LIMIT 5;
```

### 3. 重啟服務
```bash
# 重啟後端服務以套用新配置
docker compose restart backend

# 或完全重啟
docker compose down
docker compose up -d
```

## 如果資料已經損壞

如果資料庫中已經儲存了錯誤編碼的檔名，需要：

### 選項 1: 重新上傳檔案
最簡單的方法是刪除舊檔案並重新上傳。

### 選項 2: 修正資料庫中的資料
如果檔名是以錯誤的編碼儲存，可能需要轉換：

```sql
-- 備份資料
CREATE TABLE student_documents_backup AS SELECT * FROM student_documents;

-- 嘗試修正編碼（根據實際情況調整）
UPDATE student_documents
SET file_name = convert_from(convert_to(file_name, 'LATIN1'), 'UTF8')
WHERE file_name IS NOT NULL;
```

**警告**: 在執行任何 UPDATE 操作前，請先備份資料庫！

## 測試

### 1. 上傳測試
上傳一個中文檔名的檔案，例如：`測試文件.docx`

### 2. 檢查資料庫
```sql
SELECT file_name FROM student_documents ORDER BY uploaded_at DESC LIMIT 1;
```
應該正確顯示：`測試文件.docx`

### 3. 下載測試
點擊「查看」→「下載」，檢查：
- 下載的檔名是否正確
- 檔案內容是否完整

### 4. 檢查 HTTP Headers
在瀏覽器開發者工具的 Network 標籤中，檢查下載請求的 Response Headers：
```
Content-Disposition: attachment; filename="______.docx"; filename*=UTF-8''%E6%B8%AC%E8%A9%A6%E6%96%87%E4%BB%B6.docx
```

`filename*=UTF-8''` 後面應該是正確的 URL 編碼中文。

## 預防措施

1. **資料庫初始化時確保 UTF-8**
   ```sql
   CREATE DATABASE foreign_student_verification
   WITH ENCODING 'UTF8'
   LC_COLLATE = 'zh_TW.UTF-8'
   LC_CTYPE = 'zh_TW.UTF-8';
   ```

2. **Docker Compose 環境變數**
   在 `docker-compose.yml` 中設定：
   ```yaml
   postgres:
     environment:
       POSTGRES_INITDB_ARGS: "--encoding=UTF8 --lc-collate=zh_TW.UTF-8 --lc-ctype=zh_TW.UTF-8"
   ```

3. **定期檢查**
   定期執行編碼檢查腳本，確保資料完整性。

## 常見問題

### Q: 為什麼顯示亂碼？
A: 可能原因：
1. 資料庫編碼不是 UTF-8
2. 資料傳輸過程中編碼轉換錯誤
3. 前端顯示時編碼解析錯誤

### Q: 修正後舊資料還是亂碼？
A: 舊資料可能已經以錯誤的編碼儲存，需要重新上傳或使用資料庫轉換工具修正。

### Q: 下載檔名正確但顯示還是亂碼？
A: 檢查前端組件是否正確從 API 取得資料，確認 API 回應的 Content-Type 包含 `charset=utf-8`。
