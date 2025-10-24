#!/bin/bash

# 外國學生受教權查核系統 - 資料庫備份腳本
# 用途: 備份 PostgreSQL 資料庫

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 主程式
main() {
    local environment=${1:-production}
    
    log_info "開始備份資料庫 ($environment 環境)"
    
    # 設定 compose 檔案
    if [ "$environment" = "production" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    else
        COMPOSE_FILE="docker-compose.yml"
    fi
    
    # 建立備份目錄
    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"
    
    # 產生備份檔案名稱（包含時間戳記）
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql"
    
    # 檢查資料庫服務是否運行
    if ! docker compose -f "$COMPOSE_FILE" ps postgres | grep -q "Up"; then
        log_error "PostgreSQL 服務未運行"
        exit 1
    fi
    
    # 執行備份
    log_info "備份資料庫到: $BACKUP_FILE"
    docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U postgres foreign_student_verification > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        # 壓縮備份檔案
        log_info "壓縮備份檔案..."
        gzip "$BACKUP_FILE"
        BACKUP_FILE="${BACKUP_FILE}.gz"
        
        # 顯示備份檔案大小
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log_info "備份完成: $BACKUP_FILE (大小: $BACKUP_SIZE)"
        
        # 清理舊備份（保留最近 7 天）
        log_info "清理舊備份檔案（保留最近 7 天）..."
        find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +7 -delete
        
        # 顯示現有備份
        log_info "現有備份檔案:"
        ls -lh "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null || log_warn "沒有其他備份檔案"
    else
        log_error "備份失敗"
        rm -f "$BACKUP_FILE"
        exit 1
    fi
}

main "$@"
