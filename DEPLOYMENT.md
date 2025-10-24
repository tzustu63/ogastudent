# 外國學生受教權查核系統 - 部署指南

## 目錄

1. [系統需求](#系統需求)
2. [快速開始](#快速開始)
3. [開發環境部署](#開發環境部署)
4. [生產環境部署](#生產環境部署)
5. [資料庫初始化](#資料庫初始化)
6. [環境變數配置](#環境變數配置)
7. [健康檢查](#健康檢查)
8. [故障排除](#故障排除)
9. [備份與還原](#備份與還原)

## 系統需求

### 硬體需求

- **CPU**: 2 核心以上
- **記憶體**: 4GB RAM 以上（建議 8GB）
- **硬碟**: 20GB 可用空間以上
- **網路**: 穩定的網路連線

### 軟體需求

- **作業系統**: Linux (Ubuntu 20.04+, CentOS 8+) 或 macOS
- **Docker**: 20.10+ 版本
- **Docker Compose**: 2.0+ 版本
- **Git**: 2.0+ 版本

### 檢查系統需求

```bash
# 檢查 Docker 版本
docker --version

# 檢查 Docker Compose 版本
docker compose version

# 檢查 Git 版本
git --version
```

## 快速開始

### 1. 複製專案

```bash
git clone <repository-url>
cd foreign-student-verification-system
```

### 2. 選擇部署模式

#### 開發環境（快速測試）

```bash
# 使用預設配置啟動
docker compose up -d

# 查看服務狀態
docker compose ps

# 查看日誌
docker compose logs -f
```

#### 生產環境

```bash
# 複製環境變數範例檔案
cp .env.production.example .env.production

# 編輯環境變數（請務必修改所有密碼和密鑰）
nano .env.production

# 使用生產配置啟動
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### 3. 初始化資料庫

```bash
# 執行資料庫遷移
docker compose exec backend npm run migrate

# 或使用提供的腳本
./scripts/init-database.sh
```

### 4. 驗證部署

訪問以下 URL 確認服務正常運行：

- **前端應用**: http://localhost:3000
- **後端 API**: http://localhost:5001/api/health
- **MinIO 控制台**: http://localhost:9001

## 開發環境部署

### 啟動開發環境

```bash
# 啟動所有服務
docker compose up -d

# 只啟動特定服務
docker compose up -d postgres redis

# 查看服務日誌
docker compose logs -f backend
docker compose logs -f frontend
```

### 開發環境特性

- **熱重載**: 程式碼變更會自動重新載入
- **Volume 掛載**: 本地程式碼直接掛載到容器
- **開發工具**: 包含完整的開發依賴
- **除錯模式**: 啟用詳細日誌輸出

### 停止開發環境

```bash
# 停止所有服務
docker compose down

# 停止並刪除 volumes（清除所有資料）
docker compose down -v
```

## 生產環境部署

### 前置準備

#### 1. 設定環境變數

```bash
# 複製環境變數範例
cp .env.production.example .env.production

# 編輯環境變數
nano .env.production
```

**重要**: 請務必修改以下敏感資訊：

- `DB_PASSWORD`: 資料庫密碼
- `REDIS_PASSWORD`: Redis 密碼
- `MINIO_ROOT_USER` 和 `MINIO_ROOT_PASSWORD`: MinIO 憑證
- `JWT_SECRET`: JWT 密鑰（使用 `openssl rand -base64 32` 產生）
- `SMTP_*`: 郵件伺服器配置

#### 2. 產生 JWT 密鑰

```bash
# 產生強隨機密鑰
openssl rand -base64 32
```

將產生的密鑰設定到 `.env.production` 的 `JWT_SECRET` 變數。

### 建置與部署

#### 方法 1: 使用 Docker Compose（推薦）

```bash
# 建置映像檔
docker compose -f docker-compose.prod.yml --env-file .env.production build

# 啟動服務
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# 查看服務狀態
docker compose -f docker-compose.prod.yml ps
```

#### 方法 2: 使用部署腳本

```bash
# 賦予執行權限
chmod +x scripts/deploy.sh

# 執行部署
./scripts/deploy.sh production
```

### 初始化生產資料庫

```bash
# 執行資料庫遷移
docker compose -f docker-compose.prod.yml exec backend npm run migrate

# 或使用腳本
./scripts/init-database.sh production
```

### 驗證部署

```bash
# 檢查所有服務健康狀態
./scripts/health-check.sh

# 或手動檢查
curl http://localhost:5001/api/health/detailed
```

### 生產環境最佳實踐

1. **使用反向代理**: 在前端加上 Nginx 或 Traefik
2. **啟用 HTTPS**: 使用 Let's Encrypt 憑證
3. **設定防火牆**: 只開放必要的埠號
4. **定期備份**: 設定自動備份排程
5. **監控日誌**: 使用 ELK 或 Grafana 監控
6. **資源限制**: 設定容器資源限制

## 資料庫初始化

### 自動初始化

系統會在首次啟動時自動執行資料庫遷移腳本。

### 手動初始化

```bash
# 進入後端容器
docker compose exec backend sh

# 執行遷移
npm run migrate

# 退出容器
exit
```

### 資料庫遷移檔案位置

遷移檔案位於 `backend/src/migrations/sql/` 目錄：

- `001_create_units_table.sql`: 建立單位資料表
- `002_create_document_types_table.sql`: 建立文件類型資料表
- `003_create_users_table.sql`: 建立使用者資料表
- `004_create_students_table.sql`: 建立學生資料表
- `005_create_student_documents_table.sql`: 建立學生文件資料表
- `006_create_tracking_records_table.sql`: 建立追蹤記錄資料表
- `007_create_notifications_table.sql`: 建立通知資料表
- `008_add_performance_indexes.sql`: 建立效能索引

### 重置資料庫

```bash
# 警告：這會刪除所有資料！
./scripts/reset-database.sh
```

## 環境變數配置

### 必要變數

| 變數名稱 | 說明 | 範例值 |
|---------|------|--------|
| `DB_PASSWORD` | 資料庫密碼 | `strong_password_123` |
| `JWT_SECRET` | JWT 密鑰 | `base64_encoded_secret` |
| `MINIO_ROOT_USER` | MinIO 使用者名稱 | `admin` |
| `MINIO_ROOT_PASSWORD` | MinIO 密碼 | `strong_password_456` |

### 可選變數

| 變數名稱 | 說明 | 預設值 |
|---------|------|--------|
| `LOG_LEVEL` | 日誌等級 | `info` |
| `BACKEND_PORT` | 後端埠號 | `5001` |
| `FRONTEND_PORT` | 前端埠號 | `3000` |
| `REDIS_PASSWORD` | Redis 密碼 | 空（無密碼） |

### LDAP 整合（可選）

如需整合學校 LDAP 系統，請設定以下變數：

```bash
LDAP_URL=ldap://ldap.university.edu.tw:389
LDAP_BIND_DN=cn=admin,dc=university,dc=edu,dc=tw
LDAP_BIND_PASSWORD=ldap_password
LDAP_SEARCH_BASE=ou=users,dc=university,dc=edu,dc=tw
```

### 郵件通知配置

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@university.edu.tw
SMTP_PASSWORD=app_specific_password
SMTP_FROM=noreply@university.edu.tw
```

## 健康檢查

### 基本健康檢查

```bash
# 檢查 API 健康狀態
curl http://localhost:5001/api/health

# 預期回應
{
  "success": true,
  "message": "外國學生受教權查核系統 API 運行正常",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0"
}
```

### 詳細健康檢查

```bash
# 檢查所有服務狀態
curl http://localhost:5001/api/health/detailed

# 預期回應
{
  "status": "healthy",
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "healthy",
      "message": "PostgreSQL 連線正常"
    },
    "redis": {
      "status": "healthy",
      "message": "Redis 連線正常"
    }
  }
}
```

### 使用健康檢查腳本

```bash
# 執行完整健康檢查
./scripts/health-check.sh

# 持續監控（每 30 秒檢查一次）
./scripts/health-check.sh --watch
```

## 故障排除

### 常見問題

#### 1. 容器無法啟動

```bash
# 查看容器日誌
docker compose logs backend

# 檢查容器狀態
docker compose ps

# 重新建置映像檔
docker compose build --no-cache backend
```

#### 2. 資料庫連線失敗

```bash
# 檢查 PostgreSQL 是否正常運行
docker compose exec postgres pg_isready

# 檢查資料庫連線參數
docker compose exec backend env | grep DB_

# 重啟資料庫服務
docker compose restart postgres
```

#### 3. Redis 連線失敗

```bash
# 測試 Redis 連線
docker compose exec redis redis-cli ping

# 如果設定了密碼
docker compose exec redis redis-cli -a your_password ping
```

#### 4. 檔案上傳失敗

```bash
# 檢查 MinIO 狀態
docker compose exec minio mc admin info local

# 檢查 bucket 是否存在
docker compose exec backend sh -c "curl http://minio:9000"
```

#### 5. 前端無法連接後端

檢查 `VITE_API_URL` 環境變數是否正確設定：

```bash
# 開發環境
VITE_API_URL=http://localhost:5001/api

# 生產環境（根據實際域名調整）
VITE_API_URL=https://api.university.edu.tw/api
```

### 日誌查看

```bash
# 查看所有服務日誌
docker compose logs

# 查看特定服務日誌
docker compose logs backend
docker compose logs frontend

# 即時追蹤日誌
docker compose logs -f backend

# 查看最近 100 行日誌
docker compose logs --tail=100 backend
```

### 重啟服務

```bash
# 重啟單一服務
docker compose restart backend

# 重啟所有服務
docker compose restart

# 完全重新部署
docker compose down
docker compose up -d
```

## 備份與還原

### 資料庫備份

#### 自動備份

```bash
# 設定每日自動備份（使用 cron）
crontab -e

# 加入以下行（每天凌晨 2 點執行）
0 2 * * * /path/to/scripts/backup-database.sh
```

#### 手動備份

```bash
# 執行備份腳本
./scripts/backup-database.sh

# 備份檔案會儲存在 backups/ 目錄
# 檔名格式: backup_YYYYMMDD_HHMMSS.sql
```

#### 使用 Docker 命令備份

```bash
# 備份資料庫
docker compose exec postgres pg_dump -U postgres foreign_student_verification > backup.sql

# 壓縮備份檔案
gzip backup.sql
```

### 資料庫還原

```bash
# 使用還原腳本
./scripts/restore-database.sh backups/backup_20240101_020000.sql

# 或使用 Docker 命令
docker compose exec -T postgres psql -U postgres foreign_student_verification < backup.sql
```

### 檔案備份

```bash
# 備份上傳的檔案
docker compose exec backend tar -czf /tmp/uploads.tar.gz /app/uploads
docker compose cp backend:/tmp/uploads.tar.gz ./backups/

# 備份 MinIO 資料
docker compose exec minio tar -czf /tmp/minio-data.tar.gz /data
docker compose cp minio:/tmp/minio-data.tar.gz ./backups/
```

### 完整系統備份

```bash
# 執行完整備份（資料庫 + 檔案）
./scripts/full-backup.sh

# 備份會包含：
# - 資料庫 SQL dump
# - 上傳的檔案
# - MinIO 資料
# - 環境變數配置（敏感資訊已遮罩）
```

## 更新與維護

### 更新應用程式

```bash
# 1. 拉取最新程式碼
git pull origin main

# 2. 重新建置映像檔
docker compose -f docker-compose.prod.yml build

# 3. 停止舊版本
docker compose -f docker-compose.prod.yml down

# 4. 啟動新版本
docker compose -f docker-compose.prod.yml up -d

# 5. 執行資料庫遷移（如有需要）
docker compose -f docker-compose.prod.yml exec backend npm run migrate
```

### 清理舊資料

```bash
# 清理未使用的 Docker 映像檔
docker image prune -a

# 清理未使用的 volumes
docker volume prune

# 清理所有未使用的資源
docker system prune -a --volumes
```

## 監控與日誌

### 資源使用監控

```bash
# 查看容器資源使用情況
docker stats

# 查看特定容器
docker stats fsvs-backend fsvs-frontend
```

### 日誌管理

生產環境日誌會自動輪替，配置如下：

- **最大檔案大小**: 10MB
- **保留檔案數**: 3 個
- **日誌格式**: JSON

查看日誌：

```bash
# 後端應用日誌
docker compose exec backend cat logs/app.log

# 錯誤日誌
docker compose exec backend cat logs/error.log
```

## 安全性建議

1. **定期更新**: 保持 Docker 和系統套件最新
2. **強密碼**: 使用強隨機密碼
3. **最小權限**: 容器以非 root 使用者運行
4. **網路隔離**: 使用 Docker 網路隔離服務
5. **定期備份**: 設定自動備份排程
6. **監控日誌**: 定期檢查異常活動
7. **HTTPS**: 生產環境必須使用 HTTPS
8. **防火牆**: 只開放必要的埠號

## 效能調校

### 資料庫優化

```sql
-- 定期執行 VACUUM
VACUUM ANALYZE;

-- 重建索引
REINDEX DATABASE foreign_student_verification;
```

### Redis 快取配置

調整 Redis 記憶體限制：

```bash
# 在 docker-compose.prod.yml 中加入
command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

### 應用程式調校

調整 Node.js 記憶體限制：

```bash
# 在 docker-compose.prod.yml 的 backend 服務中加入
environment:
  NODE_OPTIONS: "--max-old-space-size=2048"
```

## 支援與聯絡

如遇到問題，請：

1. 查看本文件的故障排除章節
2. 檢查 GitHub Issues
3. 聯絡系統管理員

---

**版本**: 1.0.0  
**最後更新**: 2024-01-01
