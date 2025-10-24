#!/bin/bash

echo "🧪 測試檔案下載功能"
echo "================================"
echo ""

# 登入獲取 token
echo "1. 登入系統..."
TOKEN=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['data']['tokens']['access_token'])")

if [ -z "$TOKEN" ]; then
    echo "❌ 登入失敗"
    exit 1
fi
echo "✅ 登入成功"
echo ""

# 獲取一個中文檔名的文件
echo "2. 查詢中文檔名的文件..."
DOC_ID=$(docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -t -c \
  "SELECT document_id FROM student_documents WHERE file_name ~ '[^\x00-\x7F]' LIMIT 1;" | tr -d ' ')

if [ -z "$DOC_ID" ]; then
    echo "❌ 找不到中文檔名的文件"
    exit 1
fi

FILE_NAME=$(docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -t -c \
  "SELECT file_name FROM student_documents WHERE document_id = '$DOC_ID';" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

echo "✅ 找到文件"
echo "   ID: $DOC_ID"
echo "   檔名: $FILE_NAME"
echo ""

# 測試下載 API
echo "3. 測試下載 API..."
HEADERS=$(curl -s -I -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5001/api/documents/$DOC_ID/download" 2>&1)

echo "$HEADERS" | grep -i "HTTP" | head -1

CONTENT_DISP=$(echo "$HEADERS" | grep -i "^Content-Disposition:" | head -1)
echo "   $CONTENT_DISP"
echo ""

# 解析檔名
echo "4. 解析 Content-Disposition header..."
if echo "$CONTENT_DISP" | grep -q "filename\*=UTF-8''"; then
    ENCODED_NAME=$(echo "$CONTENT_DISP" | sed -n "s/.*filename\*=UTF-8''\([^;]*\).*/\1/p" | tr -d '\r\n')
    DECODED_NAME=$(python3 -c "from urllib.parse import unquote; print(unquote('$ENCODED_NAME'))")
    echo "   編碼檔名: $ENCODED_NAME"
    echo "   解碼檔名: $DECODED_NAME"
    
    if [ "$DECODED_NAME" = "$FILE_NAME" ]; then
        echo "   ✅ 檔名正確！"
    else
        echo "   ❌ 檔名不符"
        echo "      預期: $FILE_NAME"
        echo "      實際: $DECODED_NAME"
    fi
else
    echo "   ❌ 找不到 UTF-8 編碼的檔名"
fi
echo ""

echo "================================"
echo "測試完成！"
echo ""
echo "📝 前端測試："
echo "1. 開啟瀏覽器: http://localhost:3000"
echo "2. 登入系統"
echo "3. 找到一個中文檔名的文件"
echo "4. 點擊下載"
echo "5. 檢查下載的檔名是否正確"
echo ""
