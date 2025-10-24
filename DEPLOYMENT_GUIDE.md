# 外國學生受教權查核系統 - 部署指南

## 📋 目錄

1. [系統需求](#系統需求)
2. [部署方式選擇](#部署方式選擇)
3. [方式一：Docker Compose 部署（推薦）](#方式一docker-compose-部署推薦)
4. [方式二：手動部署](#方式二手動部署)
5. [環境變數設定](#環境變數設定)
6. [資料庫初始化](#資料庫初始化)
7. [Nginx 反向代理設定](#nginx-反向代理設定)
8. [SSL 憑證設定](#ssl-憑證設定)
9. [備份與還原](#備份與還原)
10. [監控與維護](#監控與維護)
11. [常見問題](#常見問題)

---

## 系統需求

### 硬體需求

**最低配置**：
- CPU: 2 核心
- RAM: 4GB
- 硬碟: 20GB SSD
- 網路: 10Mbps

**建議配置**：
- CPU: 4 核心
- RAM: 8GB
- 硬碟: 50GB SSD
- 網路: 100Mbps

### 軟體需求

- **作業系統**: Ubuntu 20.04 LTS 或更新版本 / CentOS 8 / Debian 11
- **Docker**: 20.10 或更新版本
- **Docker Compose**: 2.0 或更新版本
- **Nginx**: 1.18 或更新版本（如果使用反向代理）

---

## 部署方式選擇

### 方式一：Docker Compose（推薦）✅

**優點**：
- 簡單快速
- 環境一致性
- 易於維護和更新
- 自動處理依賴

**適用場景**：
- 中小型部署
- 快速上線
- 測試環境

### 方式二：手動部署

**優點**：
- 更細緻的控制
- 可以優化效能
- 適合大型部署

**適用場景**：
- 大型生產環境
- 需要高度客製化
- 已有現成基礎設施

---

## 方式一：Docker Compose 部署（推薦）

### 步驟 1：準備伺服器

```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 安裝必要工具
sudo apt install -y git curl wget

# 安裝 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安裝 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 驗證安裝
docker --version
docker-compose --version
```

### 步驟 2：下載專案

```bash
# 克隆專案（或上傳壓縮檔）
git clone <your-repository-url> /opt/fsvs
cd /opt/fsvs

# 或者上傳壓縮檔
scp -r ./InternationalStudent user@server:/opt/fsvs
```

### 步驟 3：設定環境變數

```bash
# 複製環境變數範本
cp backend/.env.example backend/.env

# 編輯環境變數
nano backend/.env
```

**重要環境變數**：

```env
# 資料庫設定
DB_HOST=postgres
DB_PORT=5432
DB_NAME=fsvs_db
DB_USER=fsvs_user
DB_PASSWORD=<強密碼>

# JWT 設定
JWT_SECRET=<隨機生成的強密鑰>
JWT_EXPIRES_IN=7d

# 應用程式設定
NODE_ENV=production
PORT=5000

# 檔案儲存
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=10485760

# Redis（可選）
REDIS_HOST=redis
REDIS_PORT=6379

# Email 設定（可選）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<app-password>
```

### 步驟 4：建立生產環境 Docker Compose 檔案

創建 `docker-compose.prod.yml`：

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: fsvs-postgres
    restart: always
    environment:
      POSTGRES_DB: fsvs_db
      POSTGRES_USER: fsvs_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --lc-collate=zh_TW.UTF-8 --lc-ctype=zh_TW.UTF-8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fsvs_user -d fsvs_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: fsvs-redis
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: fsvs-backend
    restart: always
    environment:
      NODE_ENV: production
    env_file:
      - ./backend/.env
    volumes:
      - uploads:/app/uploads
      - logs:/app/logs
    ports:
      - "127.0.0.1:5001:5000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: https://your-domain.com/api
    container_name: fsvs-frontend
    restart: always
    ports:
      - "127.0.0.1:3000:80"
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  uploads:
    driver: local
  logs:
    driver: local
```

### 步驟 5：建立生產環境 Dockerfile

**Backend Dockerfile**：

```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 複製 package files
COPY package*.json ./
RUN npm ci --only=production

# 複製源碼
COPY . .

# 編譯 TypeScript
RUN npm run build

# 生產環境
FROM node:18-alpine

WORKDIR /app

# 安裝 curl（用於健康檢查）
RUN apk add --no-cache curl

# 複製依賴和編譯後的檔案
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# 創建必要的目錄
RUN mkdir -p /app/uploads /app/logs

# 設定權限
RUN chown -R node:node /app

USER node

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

**Frontend Dockerfile**：

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 複製 package files
COPY package*.json ./
RUN npm ci

# 複製源碼
COPY . .

# 建置參數
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# 建置
RUN npm run build

# 生產環境 - 使用 Nginx
FROM nginx:alpine

# 複製建置結果
COPY --from=builder /app/dist /usr/share/nginx/html

# 複製 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Frontend Nginx 配置** (`frontend/nginx.conf`)：

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip 壓縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # 靜態資源快取
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 健康檢查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 步驟 6：啟動服務

```bash
# 建置並啟動
docker-compose -f docker-compose.prod.yml up -d --build

# 查看日誌
docker-compose -f docker-compose.prod.yml logs -f

# 檢查狀態
docker-compose -f docker-compose.prod.yml ps
```

### 步驟 7：初始化資料庫

```bash
# 執行資料庫初始化腳本
docker exec -it fsvs-backend npm run migrate

# 或手動執行 SQL
docker exec -i fsvs-postgres psql -U fsvs_user -d fsvs_db < database/init.sql
```

### 步驟 8：創建管理員帳號

```bash
# 進入後端容器
docker exec -it fsvs-backend sh

# 執行創建管理員腳本（需要先創建此腳本）
node dist/scripts/create-admin.js
```

---

## Nginx 反向代理設定

在伺服器上安裝 Nginx 作為反向代理：

```bash
sudo apt install -y nginx
```

創建配置檔 `/etc/nginx/sites-available/fsvs`：

```nginx
# HTTP - 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    # Let's Encrypt 驗證
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # 重定向到 HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL 憑證
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 安全標頭
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 日誌
    access_log /var/log/nginx/fsvs_access.log;
    error_log /var/log/nginx/fsvs_error.log;

    # 前端
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 後端 API
    location /api {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 檔案上傳大小限制
        client_max_body_size 10M;
    }

    # 靜態檔案快取
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

啟用配置：

```bash
# 創建符號連結
sudo ln -s /etc/nginx/sites-available/fsvs /etc/nginx/sites-enabled/

# 測試配置
sudo nginx -t

# 重新載入
sudo systemctl reload nginx
```

---

## SSL 憑證設定

使用 Let's Encrypt 免費 SSL 憑證：

```bash
# 安裝 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 取得憑證
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 測試自動更新
sudo certbot renew --dry-run

# 設定自動更新（crontab）
sudo crontab -e
# 加入以下行：
0 3 * * * certbot renew --quiet
```

---

## 資料庫初始化

創建初始化腳本 `database/init.sql`：

```sql
-- 創建資料庫（如果使用 Docker，這會自動完成）
-- CREATE DATABASE fsvs_db WITH ENCODING 'UTF8' LC_COLLATE='zh_TW.UTF-8' LC_CTYPE='zh_TW.UTF-8';

-- 連接到資料庫
\c fsvs_db;

-- 創建擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 創建表格（從您的 migration 檔案）
-- 這裡應該包含所有表格的 CREATE TABLE 語句

-- 創建預設管理員帳號
-- 注意：密碼需要使用 bcrypt 加密
-- 預設密碼：admin123（請在首次登入後立即修改）
INSERT INTO users (user_id, username, email, name, role, password_hash, is_active)
VALUES (
    uuid_generate_v4(),
    'admin',
    'admin@example.com',
    '系統管理員',
    'admin',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIpKk6n5jO', -- admin123
    true
);

-- 創建預設單位
INSERT INTO units (unit_id, unit_name, unit_name_en, description, is_active)
VALUES
    ('global_affairs', '全球處', 'Global Affairs Office', '負責國際學生事務', true),
    ('registration', '註冊組', 'Registration Office', '負責學籍管理', true),
    ('internship', '實就組', 'Internship Office', '負責實習與就業', true),
    ('language_center', '外語中心', 'Language Center', '負責語言教學', true),
    ('dormitory', '宿輔組', 'Dormitory Office', '負責宿舍管理', true);

-- 創建文件類型
-- （從您的需求文件中的 18 種文件類型）
```

---

## 備份與還原

### 自動備份腳本

創建 `/opt/fsvs/scripts/backup.sh`：

```bash
#!/bin/bash

# 設定
BACKUP_DIR="/opt/fsvs/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# 創建備份目錄
mkdir -p $BACKUP_DIR

# 備份資料庫
docker exec fsvs-postgres pg_dump -U fsvs_user fsvs_db | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# 備份上傳檔案
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /var/lib/docker/volumes/fsvs_uploads/_data .

# 刪除舊備份
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
```

設定定時備份：

```bash
# 設定執行權限
chmod +x /opt/fsvs/scripts/backup.sh

# 加入 crontab
sudo crontab -e
# 每天凌晨 2 點備份
0 2 * * * /opt/fsvs/scripts/backup.sh >> /var/log/fsvs-backup.log 2>&1
```

### 還原備份

```bash
# 還原資料庫
gunzip < /opt/fsvs/backups/db_20241024_020000.sql.gz | docker exec -i fsvs-postgres psql -U fsvs_user -d fsvs_db

# 還原上傳檔案
tar -xzf /opt/fsvs/backups/uploads_20241024_020000.tar.gz -C /var/lib/docker/volumes/fsvs_uploads/_data
```

---

## 監控與維護

### 健康檢查腳本

創建 `/opt/fsvs/scripts/health-check.sh`：

```bash
#!/bin/bash

# 檢查服務狀態
services=("fsvs-postgres" "fsvs-redis" "fsvs-backend" "fsvs-frontend")

for service in "${services[@]}"; do
    if ! docker ps | grep -q $service; then
        echo "ERROR: $service is not running!"
        # 發送告警（可以整合 Email 或 Slack）
    fi
done

# 檢查 API 健康
if ! curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
    echo "ERROR: Backend API is not responding!"
fi

# 檢查磁碟空間
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "WARNING: Disk usage is at ${DISK_USAGE}%"
fi
```

### 日誌管理

```bash
# 查看日誌
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# 清理舊日誌
docker system prune -a --volumes -f
```

### 更新部署

```bash
# 拉取最新代碼
cd /opt/fsvs
git pull

# 重新建置並啟動
docker-compose -f docker-compose.prod.yml up -d --build

# 執行資料庫遷移（如果有）
docker exec -it fsvs-backend npm run migrate
```

---

## 常見問題

### Q1: 如何修改管理員密碼？

```bash
# 進入後端容器
docker exec -it fsvs-backend sh

# 執行密碼重設腳本
node dist/scripts/reset-password.js admin new_password
```

### Q2: 如何增加檔案上傳大小限制？

1. 修改 `backend/.env`：
   ```env
   MAX_FILE_SIZE=52428800  # 50MB
   ```

2. 修改 Nginx 配置：
   ```nginx
   client_max_body_size 50M;
   ```

3. 重啟服務

### Q3: 如何查看錯誤日誌？

```bash
# 後端日誌
docker logs fsvs-backend --tail 100 -f

# Nginx 日誌
sudo tail -f /var/log/nginx/fsvs_error.log
```

### Q4: 資料庫連線失敗怎麼辦？

```bash
# 檢查資料庫狀態
docker exec -it fsvs-postgres psql -U fsvs_user -d fsvs_db -c "SELECT 1;"

# 重啟資料庫
docker-compose -f docker-compose.prod.yml restart postgres
```

### Q5: 如何擴展到多台伺服器？

考慮使用：
- Kubernetes 進行容器編排
- 負載平衡器（如 HAProxy、AWS ELB）
- 分離資料庫到獨立伺服器
- 使用 CDN 加速靜態資源

---

## 安全檢查清單

- [ ] 修改所有預設密碼
- [ ] 啟用 HTTPS
- [ ] 設定防火牆規則
- [ ] 定期更新系統和套件
- [ ] 設定自動備份
- [ ] 限制資料庫外部訪問
- [ ] 啟用日誌監控
- [ ] 設定失敗登入限制
- [ ] 定期檢查安全漏洞

---

## 效能優化建議

1. **資料庫優化**
   - 建立適當的索引
   - 定期執行 VACUUM
   - 調整 PostgreSQL 配置

2. **快取策略**
   - 啟用 Redis 快取
   - 使用 CDN
   - 設定瀏覽器快取

3. **應用程式優化**
   - 啟用 Gzip 壓縮
   - 最小化 JavaScript/CSS
   - 使用連線池

---

## 聯絡支援

如有問題，請聯繫：
- Email: support@example.com
- 文件: https://docs.example.com

---

**最後更新**: 2024-10-24
