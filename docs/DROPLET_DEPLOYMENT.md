# 🐳 DigitalOcean Droplet 部署指南

## 📋 準備工作

### 1. 檢查 SSH 金鑰
```bash
doctl compute ssh-key list
```

如果沒有 SSH 金鑰，創建一個：
```bash
ssh-keygen -t rsa -b 4096 -C "your@email.com"
doctl compute ssh-key create "my-key" --public-key-file ~/.ssh/id_rsa.pub
```

## 🚀 快速部署

### 步驟 1: 創建 Droplet

執行自動創建腳本：
```bash
./deploy-droplet.sh
```

或者手動創建：
```bash
doctl compute droplet create ogastudent-server \
  --image ubuntu-22-04-x64 \
  --size s-1vcpu-2gb \
  --region sfo3 \
  --ssh-keys $(doctl compute ssh-key list --format ID --no-header | head -1)
```

### 步驟 2: 獲取 IP 地址

```bash
doctl compute droplet list
```

記錄 IP 地址，例如：`123.45.67.89`

### 步驟 3: 連接到伺服器

```bash
ssh root@YOUR_DROPLET_IP
```

### 步驟 4: 安裝伺服器環境

在伺服器上執行：
```bash
# 上傳安裝腳本
scp install-server.sh root@YOUR_DROPLET_IP:/root/

# 在伺服器上執行
ssh root@YOUR_DROPLET_IP
chmod +x install-server.sh
./install-server.sh
```

或手動執行安裝命令（腳本內容）

### 步驟 5: 部署應用程式

```bash
# 上傳部署腳本
scp deploy-app.sh root@YOUR_DROPLET_IP:/root/

# 在伺服器上執行
ssh root@YOUR_DROPLET_IP
chmod +x deploy-app.sh
./deploy-app.sh
```

### 步驟 6: 配置 Nginx

```bash
# 上傳 Nginx 配置
scp nginx-config.conf root@YOUR_DROPLET_IP:/root/

# 在伺服器上執行
ssh root@YOUR_DROPLET_IP
cp nginx-config.conf /etc/nginx/sites-available/ogastudent
ln -s /etc/nginx/sites-available/ogastudent /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 🔧 手動部署（詳細步驟）

### 1. 更新系統

```bash
apt update && apt upgrade -y
```

### 2. 安裝 Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

### 3. 安裝 PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# 創建資料庫和用戶
sudo -u postgres psql -c "CREATE USER ogastudent WITH PASSWORD 'your-secure-password';"
sudo -u postgres psql -c "CREATE DATABASE ogastudent_db OWNER ogastudent;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ogastudent_db TO ogastudent;"
```

### 4. 安裝 Redis

```bash
apt install -y redis-server
systemctl start redis-server
systemctl enable redis-server
```

### 5. 安裝 PM2

```bash
npm install -g pm2
```

### 6. 安裝 Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 7. 部署應用程式

```bash
# 克隆倉庫
cd /opt
git clone https://github.com/tzustu63/ogastudent.git

# 部署 Backend
cd ogastudent/backend
npm ci --production=false
npm run build

# 創建 .env
nano .env
```

後端環境變數：
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ogastudent_db
DB_USER=ogastudent
DB_PASSWORD=your-secure-password
REDIS_HOST=localhost
REDIS_PORT=6379
LOG_LEVEL=info
```

```bash
# 使用 PM2 啟動
pm2 start dist/index.js --name backend
pm2 save
pm2 startup

# 部署 Frontend
cd /opt/ogastudent/frontend
npm ci
npm run build
```

### 8. 配置 Nginx

```bash
nano /etc/nginx/sites-available/ogastudent
```

貼上以下配置：

```nginx
server {
    listen 80;
    server_name YOUR_DROPLET_IP;

    location / {
        root /opt/ogastudent/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

啟用配置：
```bash
ln -s /etc/nginx/sites-available/ogastudent /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## ✅ 完成！

訪問您的應用：
```
http://YOUR_DROPLET_IP
```

## 📋 常用指令

### 查看服務狀態
```bash
pm2 list
pm2 logs backend
systemctl status nginx
systemctl status postgresql
systemctl status redis
```

### 重啟服務
```bash
pm2 restart backend
systemctl restart nginx
```

### 查看日誌
```bash
pm2 logs backend --lines 100
tail -f /var/log/nginx/access.log
```

### 更新應用
```bash
cd /opt/ogastudent
git pull origin main

# 更新 Backend
cd backend
npm ci --production=false
npm run build
pm2 restart backend

# 更新 Frontend
cd ../frontend
npm ci
npm run build
```

## 🔒 安全建議

1. **設置防火牆**
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

2. **設置 SSL 證書（使用 Let's Encrypt）**
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

3. **更改 SSH 端口**
```bash
nano /etc/ssh/sshd_config
# 改 Port 22 為其他端口
systemctl restart sshd
```

## 💰 成本

- **Droplet (s-1vcpu-2gb)**: $12/月
- **總計**: **$12/月**（比 App Platform 便宜 $13/月！）

