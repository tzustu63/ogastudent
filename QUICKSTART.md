# 外國學生受教權查核系統 - 快速開始指南

本指南將幫助您在 5 分鐘內啟動並運行系統。

## 前置需求

確保您的系統已安裝:
- Docker (20.10+)
- Docker Compose (2.0+)
- Git

## 快速開始（開發環境）

### 1. 複製專案

```bash
git clone <repository-url>
cd foreign-student-verification-system
```

### 2. 啟動服務

```bash
# 啟動所有服務
docker compose up -d

# 查看服務狀態
docker compose ps
```

### 3. 初始化資料庫

```bash
# 執行資料庫遷移
./scripts/init-database.sh
```

### 4. 驗證安裝

訪問以下 URL:
- **前端**: http://localhost:3000
- **後端 API**: http://localhost:5001/api/health
- **MinIO 控制台**: http://localhost:9001 (帳號: minioadmin / minioadmin123)

## 快速開始（生產環境）

### 1. 準備環境變數

```bash
# 複製環境變數範例
cp .env.production.example .env.production

# 編輯環境變數（必須修改所有密碼）
nano .env.production
```

**重要**: 請務必修改以下變數:
- `DB_PASSWORD`
- `JWT_SECRET` (使用 `openssl rand -base64 32` 產生)
- `MINIO_ROOT_USER`
- `MINIO_ROOT_PASSWORD`

### 2. 執行部署

```bash
# 使用部署腳本
./scripts/deploy.sh production
```

### 3. 驗證部署

```bash
# 執行健康檢查
./scripts/health-check.sh
```

## 預設帳號

系統啟動後，您可以使用以下測試帳號登入（僅開發環境）:

- **管理員**: admin / admin123
- **全球處職員**: global_staff / password123
- **註冊組職員**: registrar_staff / password123

**注意**: 生產環境請立即修改預設密碼或整合 LDAP 認證。

## 常用命令

### 查看日誌

```bash
# 查看所有服務日誌
docker compose logs

# 查看特定服務日誌
docker compose logs backend
docker compose logs frontend

# 即時追蹤日誌
docker compose logs -f backend
```

### 重啟服務

```bash
# 重啟所有服務
docker compose restart

# 重啟特定服務
docker compose restart backend
```

### 停止服務

```bash
# 停止所有服務
docker compose down

# 停止並刪除所有資料
docker compose down -v
```

## 下一步

- 閱讀 [部署指南](DEPLOYMENT.md) 了解詳細配置
- 閱讀 [維護文件](MAINTENANCE.md) 了解日常維護
- 查看 [API 文件](backend/README.md) 了解 API 使用

## 故障排除

### 問題: 容器無法啟動

```bash
# 查看錯誤訊息
docker compose logs

# 重新建置
docker compose build --no-cache
docker compose up -d
```

### 問題: 埠號衝突

修改 `docker-compose.yml` 中的埠號映射:

```yaml
services:
  backend:
    ports:
      - "5002:5000"  # 改用 5002
```

### 問題: 資料庫連線失敗

```bash
# 檢查 PostgreSQL 狀態
docker compose ps postgres

# 重啟資料庫
docker compose restart postgres
```

## 取得協助

- 查看 [常見問題](MAINTENANCE.md#常見問題)
- 檢查 GitHub Issues
- 聯絡系統管理員

---

**提示**: 首次啟動可能需要幾分鐘來下載 Docker 映像檔和建置應用程式。
