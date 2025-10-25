#!/bin/bash

# DigitalOcean Droplet 部署腳本

set -e

echo "🚀 開始創建 DigitalOcean Droplet..."

# 檢查 doctl
if ! command -v doctl &> /dev/null; then
    echo "❌ 請先安裝 DigitalOcean CLI (doctl)"
    exit 1
fi

# 創建 Droplet
echo "📦 創建 Droplet..."

# 使用 Ubuntu 22.04 LTS，最便宜的方案
doctl compute droplet create \
  ogastudent-server \
  --image ubuntu-22-04-x64 \
  --size s-1vcpu-2gb \
  --region sfo3 \
  --ssh-keys $(doctl compute ssh-key list --format ID --no-header | head -1) \
  --wait

echo "✅ Droplet 創建成功！"

# 獲取 IP 地址
DROPLET_IP=$(doctl compute droplet list ogastudent-server --format PublicIPv4 --no-header)

echo "🌐 Droplet IP: $DROPLET_IP"
echo ""
echo "📋 下一步："
echo "1. SSH 連接到伺服器: ssh root@$DROPLET_IP"
echo "2. 執行部署腳本"

