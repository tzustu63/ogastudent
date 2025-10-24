-- 修正資料庫中檔名編碼問題
-- 這個腳本會將錯誤編碼的檔名（UTF-8 被當作 Latin-1 儲存）轉換回正確的 UTF-8

-- 1. 先備份資料
CREATE TABLE IF NOT EXISTS student_documents_backup_encoding AS 
SELECT * FROM student_documents WHERE file_name IS NOT NULL;

-- 2. 顯示修正前的資料（供檢查）
SELECT 
    document_id,
    file_name as old_filename,
    convert_from(convert_to(file_name, 'LATIN1'), 'UTF8') as new_filename
FROM student_documents 
WHERE file_name IS NOT NULL
AND file_name ~ '[^\x00-\x7F]'  -- 只顯示包含非 ASCII 字符的檔名
LIMIT 10;

-- 3. 執行修正（請先檢查上面的預覽結果是否正確）
-- 取消下面的註解來執行修正
/*
UPDATE student_documents
SET file_name = convert_from(convert_to(file_name, 'LATIN1'), 'UTF8')
WHERE file_name IS NOT NULL
AND file_name ~ '[^\x00-\x7F]';  -- 只修正包含非 ASCII 字符的檔名

-- 4. 驗證修正結果
SELECT 
    document_id,
    file_name,
    length(file_name) as name_length,
    octet_length(file_name) as byte_length
FROM student_documents 
WHERE file_name IS NOT NULL
ORDER BY uploaded_at DESC
LIMIT 10;
*/

-- 5. 如果修正錯誤，可以從備份還原
-- TRUNCATE student_documents;
-- INSERT INTO student_documents SELECT * FROM student_documents_backup_encoding;
