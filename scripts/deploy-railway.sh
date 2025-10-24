#!/bin/bash

# Railway 部署腳本
# 此腳本會協助您將專案部署到 Railway

set -e

echo "🚀 Railway 部署腳本"
echo "=================="

# 檢查 Railway CLI 是否安裝
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI 未安裝"
    echo "請執行: npm install -g @railway/cli"
    exit 1
fi

# 檢查是否已登入
if ! railway whoami &> /dev/null; then
    echo "❌ 請先登入 Railway"
    echo "執行: railway login"
    exit 1
fi

echo "✅ Railway CLI 已安裝並登入"

# 檢查 Git 狀態
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  有未提交的變更，請先提交："
    git status --short
    echo ""
    read -p "是否繼續部署？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "部署已取消"
        exit 1
    fi
fi

echo "📦 準備部署..."

# 推送到 GitHub（如果還沒有）
if [ -z "$(git remote -v)" ]; then
    echo "❌ 沒有設定 Git remote"
    echo "請先設定 GitHub repository"
    exit 1
fi

echo "📤 推送到 GitHub..."
git add .
git commit -m "準備 Railway 部署" || echo "沒有變更需要提交"
git push origin main

echo ""
echo "🎯 部署選項："
echo "1. 使用 Railway CLI 部署"
echo "2. 使用 Railway Dashboard 部署"
echo "3. 查看部署指南"
echo ""

read -p "請選擇 (1-3): " choice

case $choice in
    1)
        echo "🔧 使用 Railway CLI 部署..."
        echo ""
        echo "後端部署："
        echo "cd backend && railway up"
        echo ""
        echo "前端部署："
        echo "cd frontend && railway up"
        echo ""
        echo "請手動執行上述命令"
        ;;
    2)
        echo "🌐 使用 Railway Dashboard 部署..."
        echo ""
        echo "1. 訪問: https://railway.app/dashboard"
        echo "2. 點擊 'New Project'"
        echo "3. 選擇 'Deploy from GitHub repo'"
        echo "4. 選擇您的 repository"
        echo "5. 設定 Root Directory 為 'backend'"
        echo "6. 重複步驟 2-5，設定 Root Directory 為 'frontend'"
        echo ""
        echo "詳細步驟請參考: RAILWAY_DEPLOYMENT.md"
        ;;
    3)
        echo "📖 部署指南："
        echo ""
        echo "1. RAILWAY_DEPLOYMENT.md - 詳細部署步驟"
        echo "2. RAILWAY_SETUP.md - Railway 設定指南"
        echo "3. railway.env.example - 環境變數範例"
        echo ""
        echo "重要提醒："
        echo "- 後端和前端需要分別部署"
        echo "- 記得設定環境變數"
        echo "- 先部署後端，再部署前端"
        echo "- 部署後端後，將網址設定到前端的 VITE_API_URL"
        ;;
    *)
        echo "❌ 無效選項"
        exit 1
        ;;
esac

echo ""
echo "✅ 部署準備完成！"
echo ""
echo "📋 下一步："
echo "1. 部署後端服務"
echo "2. 添加 PostgreSQL 資料庫"
echo "3. 設定後端環境變數"
echo "4. 部署前端服務"
echo "5. 設定前端環境變數"
echo "6. 測試應用程式"
echo ""
echo "需要協助嗎？請查看 RAILWAY_DEPLOYMENT.md"
