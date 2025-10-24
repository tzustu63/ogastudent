#!/bin/bash

# 外國學生受教權查核系統 - 資料庫重置腳本
# 用途: 完全重置資料庫（警告：會刪除所有資料）

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
    local environment=${1:-development}
    
    log_warn "========================================="
    log_warn "警告: 這將會刪除所有資料庫資料！"
    log_warn "========================================="
    echo ""
    
    read -p "請輸入 'DELETE ALL DATA' 以確認: " -r
    echo
    if [ "$REPLY" != "DELETE ALL DATA" ]; then
        log_info "已取消重置操作"
        exit 0
    fi
    
    log_info "開始重置資料庫 ($environment 環境)"
    
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
    
    # 刪除資料庫
    log_info "刪除資料庫..."
    docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS foreign_student_verification;"
    
    # 重新建立資料庫
    log_info "重新建立資料庫..."
    docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U postgres -c "CREATE DATABASE foreign_student_verification;"
    
    # 執行遷移
    log_info "執行資料庫遷移..."
    docker compose -f "$COMPOSE_FILE" exec -T backend npm run migrate
    
    if [ $? -eq 0 ]; then
        log_info "資料庫重置完成"
    else
        log_error "資料庫重置失敗"
        exit 1
    fi
}

main "$@"
