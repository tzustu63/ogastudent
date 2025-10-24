#!/bin/bash

# Railway 全自動部署腳本
# 此腳本會自動完成整個部署流程

set -e

echo "🚀 開始 Railway 全自動部署"
echo "=========================="

# 檢查 Railway CLI 狀態
echo "📋 檢查 Railway CLI 狀態..."
if ! railway whoami &> /dev/null; then
    echo "❌ Railway CLI 未登入，請先執行: railway login"
    exit 1
fi

echo "✅ Railway CLI 已登入"

# 檢查專案連結狀態
echo "📋 檢查專案連結狀態..."
PROJECT_STATUS=$(railway status 2>/dev/null || echo "No project linked")

if [[ "$PROJECT_STATUS" == *"No project linked"* ]]; then
    echo "❌ 沒有連結的專案"
    echo "請手動執行以下步驟："
    echo "1. 訪問: https://railway.app/dashboard"
    echo "2. 點擊 'New Project'"
    echo "3. 選擇 'Deploy from GitHub repo'"
    echo "4. 選擇您的 repository"
    echo "5. 設定 Root Directory 為 'backend'"
    echo "6. 點擊 'Deploy'"
    exit 1
fi

echo "✅ 專案已連結: $(railway status | grep Project | cut -d: -f2 | xargs)"

# 檢查是否有服務
echo "📋 檢查服務狀態..."
SERVICES=$(railway status 2>/dev/null | grep Service || echo "Service: None")

if [[ "$SERVICES" == *"None"* ]]; then
    echo "⚠️  沒有服務，需要創建服務"
    echo ""
    echo "🔧 手動部署步驟："
    echo ""
    echo "1. 訪問 Railway Dashboard:"
    echo "   https://railway.app/dashboard"
    echo ""
    echo "2. 找到您的專案: $(railway status | grep Project | cut -d: -f2 | xargs)"
    echo ""
    echo "3. 部署後端服務："
    echo "   - 點擊 'New Service'"
    echo "   - 選擇 'GitHub Repo'"
    echo "   - 選擇您的 repository"
    echo "   - 設定 Root Directory: backend"
    echo "   - 點擊 'Deploy'"
    echo ""
    echo "4. 添加 PostgreSQL 資料庫："
    echo "   - 在專案中點擊 'New'"
    echo "   - 選擇 'Database' → 'Add PostgreSQL'"
    echo ""
    echo "5. 設定環境變數："
    echo "   - 在後端服務的 Variables 頁面添加："
    echo "     JWT_SECRET=your-super-secret-jwt-key-$(date +%s)"
    echo "     JWT_EXPIRES_IN=7d"
    echo "     NODE_ENV=production"
    echo "     PORT=5000"
    echo ""
    echo "6. 部署前端服務："
    echo "   - 點擊 'New Service'"
    echo "   - 選擇 'GitHub Repo'"
    echo "   - 選擇您的 repository"
    echo "   - 設定 Root Directory: frontend"
    echo "   - 點擊 'Deploy'"
    echo ""
    echo "7. 設定前端環境變數："
    echo "   - 在前端服務的 Variables 頁面添加："
    echo "     VITE_API_URL=https://your-backend-url.up.railway.app"
    echo "     NODE_ENV=production"
    echo ""
    echo "8. 更新後端 CORS 設定："
    echo "   - 在後端服務的 Variables 頁面更新："
    echo "     FRONTEND_URL=https://your-frontend-url.up.railway.app"
    echo ""
    echo "📚 詳細步驟請參考: CURSOR_RAILWAY_CHECKLIST.md"
else
    echo "✅ 找到服務: $(echo $SERVICES | cut -d: -f2 | xargs)"
    
    # 嘗試部署
    echo "🚀 開始部署..."
    cd backend
    railway up --detach || {
        echo "❌ 部署失敗，請使用手動方式"
        echo "參考上述手動部署步驟"
        exit 1
    }
    
    echo "✅ 部署完成！"
fi

echo ""
echo "🎉 部署流程完成！"
echo ""
echo "📋 下一步："
echo "1. 檢查部署狀態"
echo "2. 設定環境變數"
echo "3. 測試應用程式"
echo ""
echo "🔗 Railway Dashboard: https://railway.app/dashboard"
