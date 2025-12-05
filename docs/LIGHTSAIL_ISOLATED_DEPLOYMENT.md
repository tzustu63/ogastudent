# 🚀 Lightsail 獨立部署指南 - 外國學生受教權查核系統

## 📋 概述

本指南說明如何將外國學生受教權查核系統部署到 Lightsail 伺服器 (18.181.71.46)，使用**完全獨立的端口和資源**，避免與現有應用衝突。

## 🔒 獨立性保證

### 端口分配（完全避免衝突）

| 服務 | 端口 | 說明 |
|------|------|------|
| 前端 | **3002** | 避免與現有應用衝突 |
| 後端 API | **5003** | 避免與現有應用衝突 |
| PostgreSQL | **5434** | 避免與現有應用衝突 |
| Redis | **6380** | 避免與現有應用衝突 |
| MinIO API | **9002** | 避免與現有應用衝突 |
| MinIO Console | **9003** | 避免與現有應用衝突 |

### 獨立資源

- **Docker 網路**: `isvs-network` (完全獨立)
- **容器名稱前綴**: `isvs-*` (International Student Verification System)
- **Volumes**: `isvs_*` (所有資料完全獨立)
- **專案目錄**: `/home/ubuntu/international-student` (獨立目錄)

## 📦 前置需求

1. **Lightsail 伺服器**
   - IP: `18.181.71.46`
   - 使用者: `ubuntu`
   - SSH 金鑰: `LightsailDefaultKey-ap-northeast-1.pem`

2. **本地環境**
   - SSH 客戶端
   - rsync (用於檔案同步)

## 🔑 環境變數設定

### 步驟 1: 複製環境變數範本

在專案根目錄創建 `.env.production` 檔案：

```bash
# 複製範本
cat > .env.production << 'EOF'
# ============================================
# 資料庫設定
# ============================================
DB_NAME=foreign_student_verification
DB_USER=postgres
DB_PASSWORD=請修改為強密碼_至少16字元
DB_PORT=5434

# ============================================
# Redis 設定
# ============================================
REDIS_PORT=6380
REDIS_PASSWORD=

# ============================================
# JWT 設定
# ============================================
JWT_SECRET=請設定隨機字串_至少32字元
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# MinIO 設定
# ============================================
MINIO_ROOT_USER=請設定使用者名稱
MINIO_ROOT_PASSWORD=請設定密碼_至少16字元
MINIO_PORT=9002
MINIO_CONSOLE_PORT=9003

# ============================================
# 應用程式設定
# ============================================
NODE_ENV=production
LOG_LEVEL=info

# ============================================
# 端口設定（避免與現有應用衝突）
# ============================================
FRONTEND_PORT=3002
BACKEND_PORT=5003

# ============================================
# CORS 設定
# ============================================
CORS_ORIGIN=http://18.181.71.46:3002

# ============================================
# API URL（前端使用）
# ============================================
VITE_API_URL=http://18.181.71.46:5003/api

# ============================================
# 其他設定
# ============================================
AWS_S3_BUCKET=foreign-student-docs
AWS_REGION=us-east-1
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=pdf,doc,docx,jpg,jpeg,png
EOF
```

### 步驟 2: 編輯環境變數

```bash
nano .env.production
```

**必須修改的項目**：
- `DB_PASSWORD`: 設定強密碼（至少 16 字元）
- `JWT_SECRET`: 設定隨機字串（至少 32 字元）
- `MINIO_ROOT_USER`: 設定 MinIO 使用者名稱
- `MINIO_ROOT_PASSWORD`: 設定 MinIO 密碼（至少 16 字元）

## 🚀 部署步驟

### 自動部署（推薦）

```bash
# 執行部署腳本
./scripts/deploy-lightsail-isolated.sh
```

部署腳本會自動執行以下步驟：
1. ✅ 檢查 SSH 連線
2. ✅ 檢查端口衝突
3. ✅ 安裝必要工具（Docker, Docker Compose）
4. ✅ 同步專案檔案到伺服器
5. ✅ 上傳環境變數檔案
6. ✅ 建置並啟動 Docker 容器
7. ✅ 執行資料庫遷移
8. ✅ 健康檢查

### 手動部署

如果自動部署遇到問題，可以手動執行：

```bash
# 1. 連線到伺服器
ssh -i LightsailDefaultKey-ap-northeast-1.pem ubuntu@18.181.71.46

# 2. 建立專案目錄
mkdir -p /home/ubuntu/international-student
cd /home/ubuntu/international-student

# 3. 上傳專案檔案（在本地執行）
rsync -avz --exclude='.git' --exclude='node_modules' \
  -e "ssh -i LightsailDefaultKey-ap-northeast-1.pem" \
  ./ ubuntu@18.181.71.46:/home/ubuntu/international-student/

# 4. 上傳環境變數檔案
scp -i LightsailDefaultKey-ap-northeast-1.pem \
  .env.production ubuntu@18.181.71.46:/home/ubuntu/international-student/

# 5. 在伺服器上啟動服務
ssh -i LightsailDefaultKey-ap-northeast-1.pem ubuntu@18.181.71.46 << 'EOF'
cd /home/ubuntu/international-student
docker compose -f docker-compose.lightsail.yml build
docker compose -f docker-compose.lightsail.yml up -d
docker compose -f docker-compose.lightsail.yml exec -T backend npm run migrate
EOF
```

## 🌐 服務存取

部署完成後，可以透過以下網址存取：

- **前端應用**: http://18.181.71.46:3002
- **後端 API**: http://18.181.71.46:5003/api
- **API 健康檢查**: http://18.181.71.46:5003/api/health
- **API 文檔**: http://18.181.71.46:5003/api/docs
- **MinIO 控制台**: http://18.181.71.46:9003

## 🔍 驗證獨立性

部署後可以執行以下命令驗證資源完全獨立：

```bash
# 連線到伺服器
ssh -i LightsailDefaultKey-ap-northeast-1.pem ubuntu@18.181.71.46

# 檢查容器（應該只看到 isvs- 前綴）
docker ps | grep isvs

# 檢查網路（應該看到 isvs-network）
docker network ls | grep isvs

# 檢查 Volume（應該只看到 isvs_ 前綴）
docker volume ls | grep isvs

# 檢查端口（確認使用正確的端口）
ss -tulpn | grep -E ':(3002|5003|5434|6380|9002|9003)'
```

所有資源都應該完全獨立，不會與現有應用有任何交集。

## 📊 管理指令

### 查看日誌

```bash
# 所有服務
ssh -i LightsailDefaultKey-ap-northeast-1.pem ubuntu@18.181.71.46 \
  'cd /home/ubuntu/international-student && docker compose -f docker-compose.lightsail.yml logs -f'

# 特定服務
ssh -i LightsailDefaultKey-ap-northeast-1.pem ubuntu@18.181.71.46 \
  'cd /home/ubuntu/international-student && docker compose -f docker-compose.lightsail.yml logs -f backend'
```

### 重啟服務

```bash
ssh -i LightsailDefaultKey-ap-northeast-1.pem ubuntu@18.181.71.46 \
  'cd /home/ubuntu/international-student && docker compose -f docker-compose.lightsail.yml restart'
```

### 停止服務

```bash
ssh -i LightsailDefaultKey-ap-northeast-1.pem ubuntu@18.181.71.46 \
  'cd /home/ubuntu/international-student && docker compose -f docker-compose.lightsail.yml down'
```

### 查看容器狀態

```bash
ssh -i LightsailDefaultKey-ap-northeast-1.pem ubuntu@18.181.71.46 \
  'cd /home/ubuntu/international-student && docker compose -f docker-compose.lightsail.yml ps'
```

## 🔧 故障排除

### 端口衝突

如果遇到端口衝突，檢查哪些端口被占用：

```bash
ssh -i LightsailDefaultKey-ap-northeast-1.pem ubuntu@18.181.71.46 \
  'ss -tulpn | grep -E ":(3002|5003|5434|6380|9002|9003)"'
```

如果端口被占用，可以修改 `.env.production` 中的端口設定。

### 容器無法啟動

檢查容器日誌：

```bash
ssh -i LightsailDefaultKey-ap-northeast-1.pem ubuntu@18.181.71.46 \
  'cd /home/ubuntu/international-student && docker compose -f docker-compose.lightsail.yml logs'
```

### 資料庫連線失敗

檢查資料庫容器狀態：

```bash
ssh -i LightsailDefaultKey-ap-northeast-1.pem ubuntu@18.181.71.46 \
  'cd /home/ubuntu/international-student && docker compose -f docker-compose.lightsail.yml ps postgres'
```

檢查環境變數：

```bash
ssh -i LightsailDefaultKey-ap-northeast-1.pem ubuntu@18.181.71.46 \
  'cd /home/ubuntu/international-student && docker compose -f docker-compose.lightsail.yml exec backend env | grep DB_'
```

## 📝 注意事項

1. **完全獨立**: 所有資源（網路、容器、資料）都完全獨立，不會影響現有應用
2. **端口安全**: 所有端口都經過檢查，確保不會與現有應用衝突
3. **資料隔離**: 使用獨立的 Volume，資料完全分離
4. **容器命名**: 使用 `isvs-*` 前綴，與其他應用區分
5. **環境變數**: 使用獨立的 `.env.production` 檔案，不會影響現有應用

## 🎉 部署完成

部署成功後，系統將完全獨立運行，不會與伺服器上的其他應用產生任何衝突。

---

**相關檔案**:
- 部署腳本: `scripts/deploy-lightsail-isolated.sh`
- Docker Compose 配置: `docker-compose.lightsail.yml`
- SSH 金鑰: `LightsailDefaultKey-ap-northeast-1.pem`