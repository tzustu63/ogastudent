#!/bin/bash

# 開發環境啟動腳本

echo "🚀 啟動開發環境..."
echo "=================="

# 檢查資料庫是否運行
if ! docker ps | grep -q fsvs-postgres; then
    echo "📦 啟動 PostgreSQL..."
    cd "$(dirname "$0")"
    docker-compose up -d postgres
    sleep 3
fi

echo "✅ PostgreSQL 已運行"
echo ""
echo "📦 安裝依賴（如果需要）..."
npm install

echo ""
echo "🚀 啟動前後端開發伺服器..."
echo "後端將運行在: http://localhost:5000"
echo "前端將運行在: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止所有服務"
echo ""

# 啟動開發環境
npm run dev

