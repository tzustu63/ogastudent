#!/bin/bash

echo "🔍 驗證編碼修復"
echo "================================"
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 檢查函數
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "1. 檢查 Docker 服務"
echo "-------------------"
if docker ps | grep -q fsvs-backend && docker ps | grep -q fsvs-postgres; then
    check_pass "Docker 服務運行中"
else
    check_fail "Docker 服務未運行"
    echo "請執行: docker compose up -d"
    exit 1
fi
echo ""

echo "2. 檢查後端 API"
echo "-------------------"
if curl -s http://localhost:5001/api/health > /dev/null; then
    check_pass "後端 API 可訪問"
    MESSAGE=$(curl -s http://localhost:5001/api/health | python3 -c "import sys, json; print(json.load(sys.stdin)['message'])" 2>/dev/null)
    if [ ! -z "$MESSAGE" ]; then
        echo "   訊息: $MESSAGE"
    fi
else
    check_fail "後端 API 無法訪問"
fi
echo ""

echo "3. 檢查資料庫編碼"
echo "-------------------"
ENCODING=$(docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -t -c "SHOW server_encoding;" 2>/dev/null | tr -d ' ')
if [ "$ENCODING" = "UTF8" ]; then
    check_pass "資料庫編碼: UTF8"
else
    check_warn "資料庫編碼: $ENCODING"
fi
echo ""

echo "4. 檢查檔名修復狀態"
echo "-------------------"
TOTAL=$(docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -t -c "SELECT COUNT(*) FROM student_documents WHERE file_name IS NOT NULL;" 2>/dev/null | tr -d ' ')
BROKEN=$(docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -t -c "SELECT COUNT(*) FROM student_documents WHERE file_name ~ '[^\x00-\x7F]' AND file_name ~ 'Ã|Â|©|ª|«';" 2>/dev/null | tr -d ' ')

echo "   總檔案數: $TOTAL"
if [ "$BROKEN" = "0" ]; then
    check_pass "沒有亂碼檔名"
else
    check_warn "可能有 $BROKEN 個亂碼檔名"
    echo "   執行修復: docker exec fsvs-backend node /app/scripts/fix-filename-encoding.js"
fi
echo ""

echo "5. 顯示最近的檔名"
echo "-------------------"
docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c "SELECT file_name FROM student_documents WHERE file_name IS NOT NULL ORDER BY uploaded_at DESC LIMIT 5;" 2>/dev/null
echo ""

echo "6. 檢查前端"
echo "-------------------"
if curl -s http://localhost:3000 > /dev/null; then
    check_pass "前端可訪問"
    echo "   URL: http://localhost:3000"
else
    check_fail "前端無法訪問"
fi
echo ""

echo "================================"
echo "驗證完成！"
echo ""
echo "📝 測試建議："
echo "1. 開啟瀏覽器: http://localhost:3000"
echo "2. 登入系統（testuser / password123）"
echo "3. 上傳一個中文檔名的檔案"
echo "4. 檢查檔名是否正確顯示"
echo ""
