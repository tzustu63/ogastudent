# 部署與維護腳本

本目錄包含外國學生受教權查核系統的部署和維護腳本。

## 腳本列表

### 部署腳本

#### `deploy.sh`
自動化部署腳本，支援開發和生產環境。

**用法**:
```bash
# 部署開發環境
./scripts/deploy.sh development

# 部署生產環境
./scripts/deploy.sh production
```

**功能**:
- 檢查系統需求
- 驗證環境變數
- 建置 Docker 映像檔
- 啟動服務
- 執行資料庫遷移
- 健康檢查

### 資料庫管理腳本

#### `init-database.sh`
初始化資料庫結構。

**用法**:
```bash
# 初始化開發環境資料庫
./scripts/init-database.sh development

# 初始化生產環境資料庫
./scripts/init-database.sh production
```

#### `backup-database.sh`
備份 PostgreSQL 資料庫。

**用法**:
```bash
# 備份開發環境
./scripts/backup-database.sh development

# 備份生產環境
./scripts/backup-database.sh production
```

**備份位置**: `./backups/backup_YYYYMMDD_HHMMSS.sql.gz`

#### `restore-database.sh`
從備份檔案還原資料庫。

**用法**:
```bash
# 還原到開發環境
./scripts/restore-database.sh backups/backup_20240101_020000.sql.gz development

# 還原到生產環境
./scripts/restore-database.sh backups/backup_20240101_020000.sql.gz production
```

**警告**: 此操作會覆蓋現有資料！

#### `reset-database.sh`
完全重置資料庫（刪除所有資料）。

**用法**:
```bash
# 重置開發環境
./scripts/reset-database.sh development

# 重置生產環境（需要確認）
./scripts/reset-database.sh production
```

**警告**: 此操作會刪除所有資料，無法復原！

### 監控腳本

#### `health-check.sh`
檢查所有服務的健康狀態。

**用法**:
```bash
# 執行一次健康檢查
./scripts/health-check.sh

# 持續監控模式（每 30 秒更新）
./scripts/health-check.sh --watch
```

**檢查項目**:
- 容器運行狀態
- 容器健康檢查
- HTTP 端點可用性
- 資源使用情況

## 使用範例

### 首次部署

```bash
# 1. 複製環境變數範例
cp .env.production.example .env.production

# 2. 編輯環境變數
nano .env.production

# 3. 執行部署
./scripts/deploy.sh production

# 4. 驗證部署
./scripts/health-check.sh
```

### 日常維護

```bash
# 每日備份
./scripts/backup-database.sh production

# 檢查系統狀態
./scripts/health-check.sh

# 查看服務日誌
docker compose logs -f backend
```

### 災難恢復

```bash
# 1. 停止服務
docker compose -f docker-compose.prod.yml down

# 2. 還原資料庫
./scripts/restore-database.sh backups/latest_backup.sql.gz production

# 3. 重新啟動服務
./scripts/deploy.sh production
```

## 自動化備份

設定 cron 任務進行自動備份:

```bash
# 編輯 crontab
crontab -e

# 加入每日備份任務（每天凌晨 2 點）
0 2 * * * cd /path/to/project && ./scripts/backup-database.sh production >> /var/log/fsvs-backup.log 2>&1
```

## 故障排除

### 腳本執行權限錯誤

```bash
# 賦予執行權限
chmod +x scripts/*.sh
```

### Docker 命令失敗

確保 Docker 服務正在運行:

```bash
# 檢查 Docker 狀態
sudo systemctl status docker

# 啟動 Docker
sudo systemctl start docker
```

### 環境變數未設定

確保 `.env.production` 檔案存在且包含所有必要變數:

```bash
# 檢查環境變數檔案
cat .env.production

# 驗證必要變數
grep -E "DB_PASSWORD|JWT_SECRET|MINIO_ROOT_USER|MINIO_ROOT_PASSWORD" .env.production
```

## 注意事項

1. **生產環境操作**: 在生產環境執行任何腳本前，請先備份資料
2. **權限管理**: 確保腳本有執行權限（`chmod +x`）
3. **環境隔離**: 開發和生產環境使用不同的配置檔案
4. **日誌記錄**: 重要操作建議記錄日誌
5. **測試驗證**: 在測試環境驗證腳本後再用於生產環境

## 支援

如遇到問題，請參考:
- [部署指南](../DEPLOYMENT.md)
- [維護文件](../MAINTENANCE.md)
- 系統日誌: `docker compose logs`

---

**版本**: 1.0.0  
**最後更新**: 2024-01-01
