#!/bin/bash

# DigitalOcean 配置測試腳本

echo "🔍 測試 DigitalOcean 配置..."

# 檢查必要檔案
echo "📁 檢查必要檔案..."

required_files=(
    ".do/app.yaml"
    "deploy-digitalocean.sh"
    "backend/package.json"
    "frontend/package.json"
    "backend/src/index.ts"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 不存在"
        exit 1
    fi
done

# 檢查 YAML 語法
echo "📝 檢查 YAML 語法..."
if python3 -c "import yaml; yaml.safe_load(open('.do/app.yaml'))" 2>/dev/null; then
    echo "✅ YAML 語法正確"
else
    echo "❌ YAML 語法錯誤"
    exit 1
fi

# 檢查部署腳本語法
echo "🔧 檢查部署腳本語法..."
if bash -n deploy-digitalocean.sh; then
    echo "✅ 部署腳本語法正確"
else
    echo "❌ 部署腳本語法錯誤"
    exit 1
fi

# 檢查 doctl 是否安裝
echo "🛠️ 檢查 DigitalOcean CLI..."
if command -v doctl &> /dev/null; then
    echo "✅ doctl 已安裝"
    if doctl auth list &> /dev/null; then
        echo "✅ 已登入 DigitalOcean"
    else
        echo "⚠️  未登入 DigitalOcean，請執行: doctl auth init"
    fi
else
    echo "❌ doctl 未安裝，請安裝 DigitalOcean CLI"
    echo "   macOS: brew install doctl"
    echo "   Linux: curl -sL https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz | tar -xzv"
fi

# 檢查 GitHub 倉庫
echo "🐙 檢查 GitHub 倉庫..."
if git remote -v | grep -q "github.com/tzustu63/ogastudent"; then
    echo "✅ GitHub 倉庫配置正確"
else
    echo "⚠️  請確認 GitHub 倉庫 URL 正確"
fi

echo ""
echo "🎉 配置檢查完成！"
echo ""
echo "📋 下一步："
echo "1. 確保已登入 DigitalOcean: doctl auth init"
echo "2. 執行部署: ./deploy-digitalocean.sh"
echo "3. 監控部署: doctl apps list"
