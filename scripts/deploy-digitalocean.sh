#!/bin/bash

# DigitalOcean App Platform 一鍵部署腳本
# 外國學生受教權查核系統

set -e

echo "🚀 開始部署到 DigitalOcean App Platform..."

# 檢查是否已安裝 doctl
if ! command -v doctl &> /dev/null; then
    echo "❌ 請先安裝 DigitalOcean CLI (doctl)"
    echo "安裝指令:"
    echo "  macOS: brew install doctl"
    echo "  Linux: curl -sL https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz | tar -xzv"
    echo "  Windows: 請從 https://github.com/digitalocean/doctl/releases 下載"
    exit 1
fi

# 檢查是否已登入
if ! doctl auth list &> /dev/null; then
    echo "🔐 請先登入 DigitalOcean:"
    doctl auth init
fi

# 檢查 GitHub 是否已連接
if ! doctl apps list &> /dev/null; then
    echo "❌ 無法連接到 DigitalOcean API，請檢查認證"
    exit 1
fi

# 檢查 app.yaml 是否存在
if [ ! -f ".do/app.yaml" ]; then
    echo "❌ 找不到 .do/app.yaml 配置檔案"
    exit 1
fi

echo "📦 創建 DigitalOcean App Platform 應用..."
echo "使用配置: .do/app.yaml"

# 創建 App Platform 應用
APP_ID=$(doctl apps create --spec .do/app.yaml --format ID --no-header)

if [ -z "$APP_ID" ]; then
    echo "❌ 創建應用失敗"
    exit 1
fi

echo "✅ 應用創建成功！"
echo "🆔 應用 ID: $APP_ID"

# 等待部署完成
echo "⏳ 等待部署完成（這可能需要幾分鐘）..."
doctl apps wait $APP_ID

# 獲取應用資訊
echo "📊 獲取應用資訊..."
doctl apps get $APP_ID

# 獲取應用 URL
echo "🌐 獲取應用網址..."
doctl apps get $APP_ID --format "Spec.Services[0].Routes[0].Path,Spec.Services[1].Routes[0].Path" --no-header

echo ""
echo "🎉 部署完成！"
echo "📱 前端網址: https://your-app-name.ondigitalocean.app"
echo "🔧 後端 API: https://your-app-name.ondigitalocean.app/api"
echo ""
echo "📋 有用的指令:"
echo "  查看應用狀態: doctl apps get $APP_ID"
echo "  查看日誌: doctl apps logs $APP_ID"
echo "  刪除應用: doctl apps delete $APP_ID"
echo ""
echo "🔍 監控部署進度:"
echo "  doctl apps get $APP_ID --format 'Status'"
