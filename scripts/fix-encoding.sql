-- 檢查資料庫編碼
SELECT datname, pg_encoding_to_char(encoding) as encoding 
FROM pg_database 
WHERE datname = 'foreign_student_verification';

-- 檢查 client_encoding
SHOW client_encoding;

-- 檢查 server_encoding
SHOW server_encoding;

-- 如果需要，可以設定 client_encoding
SET client_encoding = 'UTF8';

-- 檢查 student_documents 表中的檔名
SELECT 
    document_id,
    file_name,
    length(file_name) as name_length,
    octet_length(file_name) as byte_length
FROM student_documents 
WHERE file_name IS NOT NULL
LIMIT 10;
