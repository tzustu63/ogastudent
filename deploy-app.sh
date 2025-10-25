#!/bin/bash

# 應用程式部署腳本

set -e

echo "📦 開始部署應用程式..."

# 克隆倉庫
if [ ! -d "/opt/ogastudent" ]; then
    git clone https://github.com/tzustu63/ogastudent.git /opt/ogastudent
fi

cd /opt/ogastudent
git pull origin main

# 部署 Backend
cd /opt/ogastudent/backend
npm ci --production=false
npm run build

# 創建 .env 文件
cat > .env << ENVEOF
NODE_ENV=production
PORT=5000
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=24h
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ogastudent_db
DB_USER=ogastudent
DB_PASSWORD=your-secure-password
REDIS_HOST=localhost
REDIS_PORT=6379
LOG_LEVEL=info
ENVEOF

# 使用 PM2 啟動 Backend
pm2 delete backend || true
pm2 start dist/index.js --name backend
pm2 save
pm2 startup

# 部署 Frontend
cd /opt/ogastudent/frontend
npm ci
npm run build

echo "✅ 應用程式部署完成！"
echo ""
echo "📋 PM2 狀態："
pm2 list

