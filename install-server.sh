#!/bin/bash

# 伺服器安裝腳本

set -e

echo "🔧 開始安裝伺服器環境..."

# 更新系統
apt update && apt upgrade -y

# 安裝基本工具
apt install -y curl wget git build-essential

# 安裝 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安裝 PostgreSQL
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# 配置 PostgreSQL
sudo -u postgres psql -c "CREATE USER ogastudent WITH PASSWORD 'your-secure-password';"
sudo -u postgres psql -c "CREATE DATABASE ogastudent_db OWNER ogastudent;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ogastudent_db TO ogastudent;"

# 安裝 Redis
apt install -y redis-server
systemctl start redis-server
systemctl enable redis-server

# 安裝 PM2 (進程管理器)
npm install -g pm2

# 安裝 Nginx
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# 安裝 Docker (可選，用於 MinIO 等服務)
apt install -y docker.io docker-compose
systemctl start docker
systemctl enable docker
usermod -aG docker $USER

echo "✅ 伺服器環境安裝完成！"
echo ""
echo "📋 已安裝："
echo "  - Node.js $(node --version)"
echo "  - PostgreSQL"
echo "  - Redis"
echo "  - PM2"
echo "  - Nginx"
echo "  - Docker"

