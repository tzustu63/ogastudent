#!/bin/bash

# Lightsail SSH 連線腳本

LIGHTSAIL_IP="18.179.120.246"
LIGHTSAIL_USER="ubuntu"
SSH_KEY="${LIGHTSAIL_SSH_KEY:-~/.ssh/lightsail-key.pem}"

# 檢查 SSH 金鑰
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH 金鑰不存在: $SSH_KEY"
    echo ""
    echo "請設定 SSH 金鑰位置："
    echo "  export LIGHTSAIL_SSH_KEY=/path/to/your-key.pem"
    echo ""
    echo "或將金鑰放在預設位置: ~/.ssh/lightsail-key.pem"
    exit 1
fi

# 設定金鑰權限
chmod 400 "$SSH_KEY" 2>/dev/null || true

echo "🔌 連線到 Lightsail..."
echo "IP: $LIGHTSAIL_IP"
echo "使用者: $LIGHTSAIL_USER"
echo ""

# 連線
ssh -i "$SSH_KEY" \
    -o StrictHostKeyChecking=no \
    "${LIGHTSAIL_USER}@${LIGHTSAIL_IP}"

