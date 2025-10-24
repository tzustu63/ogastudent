# 外國學生受教權查核系統 - 系統維護文件

## 目錄

1. [日常維護](#日常維護)
2. [監控與告警](#監控與告警)
3. [效能優化](#效能優化)
4. [故障處理](#故障處理)
5. [安全維護](#安全維護)
6. [資料管理](#資料管理)
7. [系統更新](#系統更新)
8. [常見問題](#常見問題)

## 日常維護

### 每日檢查清單

- [ ] 檢查所有服務運行狀態
- [ ] 查看系統日誌是否有異常
- [ ] 檢查磁碟空間使用情況
- [ ] 驗證備份是否成功執行
- [ ] 檢查 API 回應時間

#### 執行每日檢查

```bash
# 1. 檢查服務狀態
./scripts/health-check.sh

# 2. 查看日誌
docker compose logs --tail=100 backend | grep -i error
docker compose logs --tail=100 frontend | grep -i error

# 3. 檢查磁碟空間
df -h

# 4. 檢查備份
ls -lh backups/

# 5. 測試 API
curl http://localhost:5001/api/health/detailed
```

### 每週維護任務

- [ ] 清理舊日誌檔案
- [ ] 檢查資料庫效能
- [ ] 更新系統套件
- [ ] 檢查安全更新
- [ ] 驗證備份可還原性

#### 執行每週維護

```bash
# 1. 清理 Docker 資源
docker system prune -f

# 2. 清理舊日誌（保留最近 30 天）
find backend/logs -name "*.log" -type f -mtime +30 -delete

# 3. 資料庫維護
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "VACUUM ANALYZE;"

# 4. 測試備份還原（在測試環境）
./scripts/backup-database.sh
# 在測試環境還原並驗證
```

### 每月維護任務

- [ ] 完整系統備份
- [ ] 安全性審查
- [ ] 效能分析報告
- [ ] 容量規劃評估
- [ ] 更新文件

## 監控與告警

### 關鍵指標監控

#### 1. 系統資源監控

```bash
# 即時監控容器資源使用
docker stats

# 查看特定容器資源使用
docker stats fsvs-backend fsvs-postgres
```

**告警閾值建議**:
- CPU 使用率 > 80%
- 記憶體使用率 > 85%
- 磁碟使用率 > 90%

#### 2. 應用程式監控

```bash
# 檢查 API 回應時間
time curl http://localhost:5001/api/health

# 查看資料庫連線數
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "SELECT count(*) FROM pg_stat_activity;"

# 查看 Redis 記憶體使用
docker compose exec redis redis-cli info memory
```

**告警閾值建議**:
- API 回應時間 > 2 秒
- 資料庫連線數 > 80% 最大連線數
- Redis 記憶體使用 > 80%

#### 3. 業務指標監控

```bash
# 查看學生總數
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "SELECT COUNT(*) FROM students;"

# 查看今日上傳文件數
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "SELECT COUNT(*) FROM student_documents WHERE DATE(uploaded_at) = CURRENT_DATE;"

# 查看系統使用者數
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "SELECT COUNT(*) FROM users WHERE is_active = true;"
```

### 日誌管理

#### 查看應用程式日誌

```bash
# 後端日誌
docker compose exec backend cat logs/app.log

# 錯誤日誌
docker compose exec backend cat logs/error.log

# 即時追蹤日誌
docker compose logs -f backend
```

#### 日誌輪替配置

日誌會自動輪替，配置如下：
- 最大檔案大小: 10MB
- 保留檔案數: 3 個
- 格式: JSON

#### 日誌分析

```bash
# 統計錯誤數量
docker compose logs backend | grep -i error | wc -l

# 查看最常見的錯誤
docker compose logs backend | grep -i error | sort | uniq -c | sort -rn | head -10

# 查看特定時間範圍的日誌
docker compose logs --since="2024-01-01T00:00:00" --until="2024-01-01T23:59:59" backend
```

## 效能優化

### 資料庫優化

#### 1. 定期維護

```bash
# 執行 VACUUM（清理死元組）
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "VACUUM VERBOSE;"

# 執行 ANALYZE（更新統計資訊）
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "ANALYZE VERBOSE;"

# 執行 VACUUM ANALYZE（合併執行）
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "VACUUM ANALYZE;"

# 重建索引
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "REINDEX DATABASE foreign_student_verification;"
```

#### 2. 查詢優化

```bash
# 查看慢查詢
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# 查看資料表大小
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# 查看索引使用情況
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "SELECT schemaname, tablename, indexname, idx_scan FROM pg_stat_user_indexes ORDER BY idx_scan;"
```

#### 3. 連線池優化

調整 PostgreSQL 連線池設定（在 `backend/src/config/database.ts`）:

```typescript
const pool = new Pool({
  max: 20,              // 最大連線數
  idleTimeoutMillis: 30000,  // 閒置連線超時
  connectionTimeoutMillis: 2000,  // 連線超時
});
```

### Redis 快取優化

#### 1. 記憶體管理

```bash
# 查看 Redis 記憶體使用
docker compose exec redis redis-cli info memory

# 查看 Redis 鍵值統計
docker compose exec redis redis-cli info keyspace

# 清理過期鍵值
docker compose exec redis redis-cli --scan --pattern "*" | xargs docker compose exec redis redis-cli del
```

#### 2. 快取策略調整

在 `docker-compose.prod.yml` 中調整 Redis 配置:

```yaml
redis:
  command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
```

快取策略選項:
- `allkeys-lru`: 移除最少使用的鍵值
- `allkeys-lfu`: 移除最不常使用的鍵值
- `volatile-lru`: 只移除有過期時間的鍵值

### 應用程式優化

#### 1. Node.js 記憶體調整

```yaml
# 在 docker-compose.prod.yml 中
backend:
  environment:
    NODE_OPTIONS: "--max-old-space-size=2048"
```

#### 2. 啟用壓縮

確保 nginx 啟用 gzip 壓縮（已在 `frontend/nginx.conf` 中配置）。

#### 3. 靜態資源快取

調整 nginx 快取設定（在 `frontend/nginx.conf`）:

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 故障處理

### 常見故障場景

#### 1. 服務無法啟動

**症狀**: 容器啟動後立即退出

**診斷步驟**:
```bash
# 查看容器日誌
docker compose logs backend

# 查看容器退出狀態
docker compose ps -a

# 檢查環境變數
docker compose config
```

**可能原因**:
- 環境變數配置錯誤
- 依賴服務未就緒
- 埠號衝突

**解決方案**:
```bash
# 重新建置映像檔
docker compose build --no-cache backend

# 重新啟動服務
docker compose up -d backend
```

#### 2. 資料庫連線失敗

**症狀**: 後端無法連接資料庫

**診斷步驟**:
```bash
# 檢查 PostgreSQL 是否運行
docker compose ps postgres

# 測試資料庫連線
docker compose exec postgres pg_isready

# 查看資料庫日誌
docker compose logs postgres
```

**解決方案**:
```bash
# 重啟資料庫
docker compose restart postgres

# 檢查連線參數
docker compose exec backend env | grep DB_
```

#### 3. 記憶體不足

**症狀**: 容器被 OOM Killer 終止

**診斷步驟**:
```bash
# 查看系統記憶體
free -h

# 查看容器記憶體使用
docker stats --no-stream
```

**解決方案**:
```bash
# 增加 swap 空間
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 或調整容器記憶體限制
# 在 docker-compose.prod.yml 中加入
services:
  backend:
    mem_limit: 2g
    mem_reservation: 1g
```

#### 4. 磁碟空間不足

**症狀**: 無法寫入檔案或資料庫

**診斷步驟**:
```bash
# 檢查磁碟使用
df -h

# 查看 Docker 磁碟使用
docker system df
```

**解決方案**:
```bash
# 清理 Docker 資源
docker system prune -a --volumes

# 清理舊日誌
find backend/logs -name "*.log" -type f -mtime +7 -delete

# 清理舊備份
find backups -name "backup_*.sql.gz" -type f -mtime +30 -delete
```

### 緊急恢復程序

#### 完全系統故障恢復

```bash
# 1. 停止所有服務
docker compose down

# 2. 備份現有資料（如果可能）
./scripts/backup-database.sh

# 3. 清理所有容器和 volumes
docker compose down -v

# 4. 重新部署
./scripts/deploy.sh production

# 5. 還原資料
./scripts/restore-database.sh backups/latest_backup.sql.gz
```

## 安全維護

### 安全檢查清單

- [ ] 定期更新系統套件
- [ ] 檢查安全漏洞
- [ ] 審查存取日誌
- [ ] 更新密碼和密鑰
- [ ] 檢查防火牆規則

### 安全更新

```bash
# 更新 Docker 映像檔
docker compose pull

# 重新建置應用程式
docker compose build --no-cache

# 重新部署
docker compose up -d
```

### 密碼輪替

```bash
# 1. 產生新密碼
openssl rand -base64 32

# 2. 更新 .env.production
nano .env.production

# 3. 重新啟動服務
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### 存取日誌審查

```bash
# 查看登入記錄
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "SELECT * FROM tracking_records WHERE action_type = 'LOGIN' ORDER BY created_at DESC LIMIT 100;"

# 查看異常操作
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "SELECT * FROM tracking_records WHERE action_type IN ('DELETE', 'UPDATE') ORDER BY created_at DESC LIMIT 100;"
```

## 資料管理

### 資料備份策略

#### 自動備份設定

```bash
# 編輯 crontab
crontab -e

# 加入每日備份任務（每天凌晨 2 點）
0 2 * * * /path/to/scripts/backup-database.sh production

# 加入每週完整備份（每週日凌晨 3 點）
0 3 * * 0 /path/to/scripts/full-backup.sh production
```

#### 備份驗證

```bash
# 定期測試備份還原（在測試環境）
./scripts/restore-database.sh backups/latest_backup.sql.gz development
```

### 資料清理

```bash
# 清理舊追蹤記錄（保留 90 天）
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "DELETE FROM tracking_records WHERE created_at < NOW() - INTERVAL '90 days';"

# 清理舊通知（保留 30 天）
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days' AND is_read = true;"
```

### 資料匯出

```bash
# 匯出學生資料
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "\COPY students TO '/tmp/students.csv' CSV HEADER;"
docker compose cp postgres:/tmp/students.csv ./exports/

# 匯出文件記錄
docker compose exec postgres psql -U postgres -d foreign_student_verification -c "\COPY student_documents TO '/tmp/documents.csv' CSV HEADER;"
docker compose cp postgres:/tmp/documents.csv ./exports/
```

## 系統更新

### 應用程式更新流程

```bash
# 1. 備份現有資料
./scripts/backup-database.sh production

# 2. 拉取最新程式碼
git pull origin main

# 3. 檢查更新內容
git log --oneline -10

# 4. 重新建置
docker compose -f docker-compose.prod.yml build

# 5. 執行更新
./scripts/deploy.sh production

# 6. 驗證更新
./scripts/health-check.sh
```

### 資料庫遷移

```bash
# 執行新的遷移
docker compose exec backend npm run migrate

# 如果遷移失敗，回滾
./scripts/restore-database.sh backups/pre_migration_backup.sql.gz
```

### 零停機更新（進階）

使用 Docker Compose 的滾動更新:

```bash
# 1. 啟動新版本容器
docker compose -f docker-compose.prod.yml up -d --no-deps --scale backend=2 backend

# 2. 等待新容器就緒
sleep 30

# 3. 停止舊容器
docker compose -f docker-compose.prod.yml up -d --no-deps --scale backend=1 backend
```

## 常見問題

### Q1: 如何增加資料庫連線數？

**A**: 調整 PostgreSQL 配置:

```bash
# 在 docker-compose.prod.yml 中
postgres:
  command: postgres -c max_connections=200
```

### Q2: 如何啟用 HTTPS？

**A**: 使用 Nginx 反向代理和 Let's Encrypt:

```bash
# 安裝 certbot
sudo apt-get install certbot python3-certbot-nginx

# 取得憑證
sudo certbot --nginx -d your-domain.com

# 自動更新憑證
sudo certbot renew --dry-run
```

### Q3: 如何監控系統效能？

**A**: 可以整合 Prometheus 和 Grafana:

```yaml
# 在 docker-compose.prod.yml 中加入
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
```

### Q4: 如何處理大量檔案上傳？

**A**: 
1. 增加 MinIO 儲存空間
2. 調整上傳大小限制
3. 使用 CDN 加速存取

### Q5: 如何備份 MinIO 資料？

**A**:

```bash
# 使用 MinIO Client
docker compose exec minio mc mirror local/foreign-student-docs /backup/minio/

# 或直接備份 volume
docker run --rm -v fsvs_minio_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/minio-backup.tar.gz /data
```

---

**版本**: 1.0.0  
**最後更新**: 2024-01-01  
**維護負責人**: 系統管理員
