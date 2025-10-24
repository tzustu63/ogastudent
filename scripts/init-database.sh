#!/bin/bash

# 外國學生受教權查核系統 - 資料庫初始化腳本
# 用途: 初始化資料庫結構和基礎資料

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
    
    log_info "開始初始化資料庫 ($environment 環境)"
    
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
    
    log_info "等待資料庫就緒..."
    sleep 5
    
    # 執行資料庫遷移
    log_info "執行資料庫遷移..."
    docker compose -f "$COMPOSE_FILE" exec -T backend npm run migrate
    
    if [ $? -eq 0 ]; then
        log_info "資料庫初始化完成"
        
        # 顯示資料表資訊
        log_info "資料庫資料表:"
        docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U postgres -d foreign_student_verification -c "\dt"
    else
        log_error "資料庫初始化失敗"
        exit 1
    fi
}

main "$@"
