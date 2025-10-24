#!/bin/bash

echo "🔧 修正編碼問題並重啟服務..."

# 停止所有服務
echo "⏹️  停止現有服務..."
docker compose down

# 清除舊的容器和 volumes（可選，如果需要完全重置）
# docker compose down -v

# 重新建置並啟動服務
echo "🚀 重新建置並啟動服務..."
docker compose up -d --build

# 等待服務啟動
echo "⏳ 等待服務啟動..."
sleep 10

# 檢查服務狀態
echo "✅ 檢查服務狀態..."
docker compose ps

# 檢查後端健康狀態
echo "🏥 檢查後端健康狀態..."
curl -s http://localhost:5001/api/health | jq '.'

echo ""
echo "✨ 完成！服務已重啟"
echo "📝 前端: http://localhost:3000"
echo "🔌 後端: http://localhost:5001"
echo ""
echo "如果還有編碼問題，請檢查瀏覽器控制台和網路請求的 Response Headers"
