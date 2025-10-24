#!/bin/bash

echo "🔧 修正資料庫檔名編碼問題"
echo "================================"
echo ""

# 檢查 Docker 容器是否運行
if ! docker ps | grep -q fsvs-postgres; then
    echo "❌ PostgreSQL 容器未運行"
    echo "請先啟動服務: docker compose up -d"
    exit 1
fi

echo "📊 步驟 1: 檢查當前資料庫中的檔名"
echo "--------------------------------"
docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c "
SELECT 
    document_id,
    file_name,
    CASE 
        WHEN file_name ~ '[^\x00-\x7F]' THEN '需要修正'
        ELSE '正常'
    END as status
FROM student_documents 
WHERE file_name IS NOT NULL
LIMIT 5;
"

echo ""
echo "📋 步驟 2: 預覽修正結果（不會實際修改）"
echo "--------------------------------"
docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c "
SELECT 
    document_id,
    file_name as 修正前,
    convert_from(convert_to(file_name, 'LATIN1'), 'UTF8') as 修正後
FROM student_documents 
WHERE file_name IS NOT NULL
AND file_name ~ '[^\x00-\x7F]'
LIMIT 5;
"

echo ""
read -p "❓ 預覽結果看起來正確嗎？是否繼續執行修正？(y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 取消修正"
    exit 0
fi

echo ""
echo "💾 步驟 3: 備份資料"
echo "--------------------------------"
docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c "
DROP TABLE IF EXISTS student_documents_backup_encoding;
CREATE TABLE student_documents_backup_encoding AS 
SELECT * FROM student_documents WHERE file_name IS NOT NULL;
"
echo "✅ 備份完成"

echo ""
echo "🔄 步驟 4: 執行編碼修正"
echo "--------------------------------"
docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c "
UPDATE student_documents
SET file_name = convert_from(convert_to(file_name, 'LATIN1'), 'UTF8')
WHERE file_name IS NOT NULL
AND file_name ~ '[^\x00-\x7F]';
"

echo ""
echo "✅ 步驟 5: 驗證修正結果"
echo "--------------------------------"
docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c "
SELECT 
    document_id,
    file_name as 檔名,
    length(file_name) as 字符數,
    octet_length(file_name) as 字節數
FROM student_documents 
WHERE file_name IS NOT NULL
ORDER BY uploaded_at DESC
LIMIT 5;
"

echo ""
echo "✨ 完成！"
echo ""
echo "📝 注意事項："
echo "1. 備份資料表: student_documents_backup_encoding"
echo "2. 如果修正錯誤，可以執行以下命令還原："
echo "   docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c \\"
echo "   \"DELETE FROM student_documents; INSERT INTO student_documents SELECT * FROM student_documents_backup_encoding;\""
echo ""
