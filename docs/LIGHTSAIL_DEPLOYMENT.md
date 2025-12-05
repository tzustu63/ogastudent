# 🚀 Amazon Lightsail 部署指南

## 📋 前置需求

1. **Amazon Lightsail 實例**
   - IP: `18.179.120.246`
   - 使用者: `ubuntu`
   - 作業系統: Ubuntu

2. **SSH 金鑰**
   - Lightsail 提供的 `.pem` 檔案
   - 或你設定的 SSH 金鑰

3. **本地環境**
   - Git
   - SSH 客戶端

## 🔑 設定 SSH 金鑰

### 方法 1: 使用環境變數

```bash
export LIGHTSAIL_SSH_KEY=/path/to/your-lightsail-key.pem
```

### 方法 2: 放在預設位置

```bash
# 複製金鑰到預設位置
cp /path/to/your-lightsail-key.pem ~/.ssh/lightsail-key.pem

# 設定權限
chmod 400 ~/.ssh/lightsail-key.pem
```

### 方法 3: 從 Lightsail 下載

1. 登入 [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
2. 選擇你的實例
3. 點擊「帳戶」標籤
4. 下載預設金鑰或建立新金鑰

## 🔌 測試 SSH 連線

### 使用連線腳本

```bash
./scripts/connect-lightsail.sh
```

### 手動連線

```bash
ssh -i /path/to/your-key.pem ubuntu@18.179.120.246
```

## 🚀 部署應用

### 完整自動部署

```bash
# 1. 設定 SSH 金鑰（如果還沒設定）
export LIGHTSAIL_SSH_KEY=/path/to/your-key.pem

# 2. 執行部署腳本
./scripts/deploy-lightsail.sh
```

### 部署步驟說明

部署腳本會自動執行以下步驟：

1. ✅ 檢查 SSH 連線
2. ✅ 安裝必要工具（Docker, Docker Compose, Git, Node.js）
3. ✅ 設定專案目錄（從 GitHub 克隆或更新）
4. ✅ 複製環境變數檔案
5. ✅ 建置並啟動 Docker 容器
6. ✅ 執行資料庫遷移
7. ✅ 健康檢查

## ⚙️ 環境變數設定

### 在本地建立環境變數檔案

```bash
# 複製範本
cp .env.production.example .env.production

# 編輯環境變數
nano .env.production
```

### 必要環境變數

```env
# 資料庫設定
DB_NAME=foreign_student_verification
DB_USER=postgres
DB_PASSWORD=你的資料庫密碼

# JWT 設定
JWT_SECRET=你的隨機JWT密鑰
JWT_EXPIRES_IN=24h

# MinIO 設定
MINIO_ROOT_USER=你的MinIO使用者
MINIO_ROOT_PASSWORD=你的MinIO密碼
```

### 上傳環境變數檔案

部署腳本會自動上傳 `.env.production`，或手動上傳：

```bash
scp -i /path/to/your-key.pem .env.production ubuntu@18.179.120.246:/home/ubuntu/ogastudent/
```

## 🔧 手動部署步驟

如果自動部署腳本無法使用，可以手動執行：

### 1. 連線到伺服器

```bash
ssh -i /path/to/your-key.pem ubuntu@18.179.120.246
```

### 2. 安裝必要工具

```bash
# 更新系統
sudo apt-get update

# 安裝 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# 安裝 Docker Compose
sudo apt-get install -y docker-compose-plugin

# 安裝 Git
sudo apt-get install -y git

# 安裝 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 重新登入以套用 Docker 群組變更
exit
```

### 3. 克隆專案

```bash
cd /home/ubuntu
git clone git@github.com:tzustu63/ogastudent.git
cd ogastudent
```

### 4. 設定環境變數

```bash
nano .env.production
# 填入必要的環境變數
```

### 5. 啟動服務

```bash
# 建置並啟動
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# 執行資料庫遷移
docker compose -f docker-compose.prod.yml exec backend npm run migrate

# 查看日誌
docker compose -f docker-compose.prod.yml logs -f
```

## 🌐 設定防火牆

### Lightsail 安全群組設定

在 Lightsail Console 中，確保以下端口已開放：

- **22** (SSH) - 必須
- **80** (HTTP) - 可選，用於反向代理
- **443** (HTTPS) - 可選，用於 SSL
- **3000** (前端) - 可選
- **5001** (後端) - 可選

### 使用 Nginx 反向代理（推薦）

```bash
# 在伺服器上安裝 Nginx
sudo apt-get install -y nginx

# 設定反向代理
sudo nano /etc/nginx/sites-available/ogastudent
```

Nginx 配置範例：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 後端 API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 監控和管理

### 查看服務狀態

```bash
ssh -i /path/to/your-key.pem ubuntu@18.179.120.246 \
  'cd /home/ubuntu/ogastudent && docker compose -f docker-compose.prod.yml ps'
```

### 查看日誌

```bash
# 所有服務
ssh -i /path/to/your-key.pem ubuntu@18.179.120.246 \
  'cd /home/ubuntu/ogastudent && docker compose -f docker-compose.prod.yml logs -f'

# 特定服務
ssh -i /path/to/your-key.pem ubuntu@18.179.120.246 \
  'cd /home/ubuntu/ogastudent && docker compose -f docker-compose.prod.yml logs -f backend'
```

### 重啟服務

```bash
ssh -i /path/to/your-key.pem ubuntu@18.179.120.246 \
  'cd /home/ubuntu/ogastudent && docker compose -f docker-compose.prod.yml restart'
```

### 停止服務

```bash
ssh -i /path/to/your-key.pem ubuntu@18.179.120.246 \
  'cd /home/ubuntu/ogastudent && docker compose -f docker-compose.prod.yml down'
```

### 更新應用

```bash
# 方法 1: 使用部署腳本（推薦）
./scripts/deploy-lightsail.sh

# 方法 2: 手動更新
ssh -i /path/to/your-key.pem ubuntu@18.179.120.246 << 'EOF'
cd /home/ubuntu/ogastudent
git pull origin main
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec backend npm run migrate
EOF
```

## 🔍 故障排除

### SSH 連線失敗

```bash
# 檢查 IP 是否正確
ping 18.179.120.246

# 檢查 SSH 金鑰權限
chmod 400 /path/to/your-key.pem

# 檢查 Lightsail 安全群組是否允許 SSH
```

### Docker 權限問題

```bash
# 將使用者加入 docker 群組
sudo usermod -aG docker ubuntu

# 重新登入
exit
```

### 端口被占用

```bash
# 檢查端口使用情況
sudo netstat -tulpn | grep -E '3000|5001'

# 停止占用端口的服務
sudo lsof -ti:3000 | xargs kill -9
```

### 資料庫連線失敗

```bash
# 檢查資料庫容器狀態
docker compose -f docker-compose.prod.yml ps postgres

# 查看資料庫日誌
docker compose -f docker-compose.prod.yml logs postgres

# 檢查環境變數
docker compose -f docker-compose.prod.yml exec backend env | grep DB_
```

## 📝 注意事項

1. **安全性**
   - 定期更新系統和依賴
   - 使用強密碼
   - 設定防火牆規則
   - 考慮使用 SSL/TLS

2. **備份**
   - 定期備份資料庫
   - 備份環境變數檔案
   - 使用 Lightsail 快照功能

3. **效能**
   - 監控資源使用情況
   - 根據需要升級實例規格
   - 使用 CDN 加速靜態資源

## 🎉 部署完成

部署成功後，你可以透過以下位址存取：

- **前端**: http://18.179.120.246:3000
- **後端 API**: http://18.179.120.246:5001/api
- **健康檢查**: http://18.179.120.246:5001/api/health

---

**需要協助？** 請查看：
- [部署腳本](../scripts/deploy-lightsail.sh)
- [連線腳本](../scripts/connect-lightsail.sh)
- [Docker Compose 配置](../docker-compose.prod.yml)

