#!/bin/bash

echo "🚀 完整編碼問題修復流程"
echo "================================"
echo ""
echo "這個腳本會："
echo "1. 修正 Multer 檔案上傳編碼（已完成）"
echo "2. 更新 Docker 配置使用通用 UTF-8（已完成）"
echo "3. 重啟服務套用新配置"
echo "4. 修正資料庫中現有的亂碼檔名"
echo ""

read -p "❓ 是否繼續？(y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 取消執行"
    exit 0
fi

echo ""
echo "⏹️  步驟 1: 停止現有服務"
echo "--------------------------------"
docker compose down
echo "✅ 服務已停止"

echo ""
echo "🔨 步驟 2: 重新建置並啟動服務"
echo "--------------------------------"
docker compose up -d --build
echo "✅ 服務已啟動"

echo ""
echo "⏳ 步驟 3: 等待服務就緒（30秒）"
echo "--------------------------------"
for i in {30..1}; do
    echo -ne "等待 $i 秒...\r"
    sleep 1
done
echo "✅ 等待完成                    "

echo ""
echo "🏥 步驟 4: 檢查服務健康狀態"
echo "--------------------------------"
docker compose ps

echo ""
echo "🔍 步驟 5: 測試後端 API"
echo "--------------------------------"
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ 後端 API 正常運行"
    curl -s http://localhost:5001/api/health | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"訊息: {data['message']}\")"
else
    echo "❌ 後端 API 無法連接"
    echo "請檢查 Docker 日誌: docker compose logs backend"
    exit 1
fi

echo ""
echo "📊 步驟 6: 檢查資料庫編碼設定"
echo "--------------------------------"
docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c "SHOW server_encoding;"
docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c "SHOW client_encoding;"
docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c "SHOW lc_collate;"
docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c "SHOW lc_ctype;"

echo ""
echo "🔧 步驟 7: 修正資料庫中的檔名編碼"
echo "--------------------------------"
./scripts/fix-database-encoding.sh

echo ""
echo "✨ 完成！所有修正已套用"
echo ""
echo "📝 測試建議："
echo "1. 開啟瀏覽器: http://localhost:3000"
echo "2. 登入系統（testuser / password123）"
echo "3. 上傳一個中文檔名的檔案測試"
echo "4. 檢查檔名是否正確顯示"
echo ""
echo "🔍 如果還有問題："
echo "1. 檢查瀏覽器控制台是否有錯誤"
echo "2. 檢查網路請求的 Response Headers"
echo "3. 查看後端日誌: docker compose logs backend -f"
echo ""
