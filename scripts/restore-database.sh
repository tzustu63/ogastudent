#!/bin/bash

# 外國學生受教權查核系統 - 資料庫還原腳本
# 用途: 從備份檔案還原 PostgreSQL 資料庫

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
    local backup_file=$1
    local environment=${2:-production}
    
    if [ -z "$backup_file" ]; then
        log_error "請指定備份檔案"
        echo "用法: $0 <備份檔案> [environment]"
        echo "範例: $0 backups/backup_20240101_020000.sql.gz production"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "備份檔案不存在: $backup_file"
        exit 1
    fi
    
    log_warn "警告: 這將會覆蓋現有的資料庫資料！"
    read -p "確定要繼續嗎? (yes/no) " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "已取消還原操作"
        exit 0
    fi
    
    log_info "開始還原資料庫 ($environment 環境)"
    
    # 設定 compose 檔案
    if [ "$environment" = "production" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    else
        COMPOSE_FILE="docker-compose.yml"
    fi
    
    # 檢查資料庫服務是否運行
    if ! docker compose -f "$COMPOSE_FILE" ps postgres | grep -q "Up"; then
        log_error "PostgreSQL 服務未運行，請先啟動服務"
        exit 1
    fi
    
    # 解壓縮備份檔案（如果是 .gz 格式）
    if [[ "$backup_file" == *.gz ]]; then
        log_info "解壓縮備份檔案..."
        TEMP_FILE="${backup_file%.gz}"
        gunzip -c "$backup_file" > "$TEMP_FILE"
        backup_file="$TEMP_FILE"
        CLEANUP_TEMP=true
    fi
    
    # 執行還原
    log_info "還原資料庫從: $backup_file"
    docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U postgres foreign_student_verification < "$backup_file"
    
    if [ $? -eq 0 ]; then
        log_info "資料庫還原完成"
        
        # 清理臨時檔案
        if [ "$CLEANUP_TEMP" = true ]; then
            rm -f "$TEMP_FILE"
        fi
    else
        log_error "資料庫還原失敗"
        
        # 清理臨時檔案
        if [ "$CLEANUP_TEMP" = true ]; then
            rm -f "$TEMP_FILE"
        fi
        
        exit 1
    fi
}

main "$@"
