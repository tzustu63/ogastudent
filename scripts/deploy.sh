#!/bin/bash

# 外國學生受教權查核系統 - 部署腳本
# 用途: 自動化部署流程

set -e  # 遇到錯誤立即退出

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函數: 印出訊息
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 函數: 檢查必要工具
check_requirements() {
    log_info "檢查系統需求..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安裝，請先安裝 Docker"
        exit 1
    fi
    
    if ! command -v docker compose &> /dev/null; then
        log_error "Docker Compose 未安裝，請先安裝 Docker Compose"
        exit 1
    fi
    
    log_info "系統需求檢查通過"
}

# 函數: 檢查環境變數檔案
check_env_file() {
    local env_file=$1
    
    if [ ! -f "$env_file" ]; then
        log_error "環境變數檔案不存在: $env_file"
        log_info "請複製 .env.production.example 並填入正確的值"
        exit 1
    fi
    
    # 檢查必要的環境變數
    local required_vars=("DB_PASSWORD" "JWT_SECRET" "MINIO_ROOT_USER" "MINIO_ROOT_PASSWORD")
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file" || grep -q "^${var}=請設定" "$env_file"; then
            log_error "環境變數 $var 未設定或使用預設值"
            log_info "請編輯 $env_file 並設定正確的值"
            exit 1
        fi
    done
    
    log_info "環境變數檢查通過"
}

# 函數: 備份現有資料
backup_data() {
    log_info "備份現有資料..."
    
    if [ -f "./scripts/backup-database.sh" ]; then
        bash ./scripts/backup-database.sh
    else
        log_warn "備份腳本不存在，跳過備份"
    fi
}

# 函數: 建置映像檔
build_images() {
    local compose_file=$1
    local env_file=$2
    
    log_info "建置 Docker 映像檔..."
    docker compose -f "$compose_file" --env-file "$env_file" build --no-cache
    log_info "映像檔建置完成"
}

# 函數: 停止舊服務
stop_services() {
    local compose_file=$1
    
    log_info "停止現有服務..."
    docker compose -f "$compose_file" down
    log_info "服務已停止"
}

# 函數: 啟動服務
start_services() {
    local compose_file=$1
    local env_file=$2
    
    log_info "啟動服務..."
    docker compose -f "$compose_file" --env-file "$env_file" up -d
    log_info "服務已啟動"
}

# 函數: 等待服務就緒
wait_for_services() {
    log_info "等待服務就緒..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:5001/api/health &> /dev/null; then
            log_info "服務已就緒"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    log_error "服務啟動超時"
    return 1
}

# 函數: 執行資料庫遷移
run_migrations() {
    local compose_file=$1
    
    log_info "執行資料庫遷移..."
    docker compose -f "$compose_file" exec -T backend npm run migrate
    log_info "資料庫遷移完成"
}

# 函數: 健康檢查
health_check() {
    log_info "執行健康檢查..."
    
    if [ -f "./scripts/health-check.sh" ]; then
        bash ./scripts/health-check.sh
    else
        # 簡單的健康檢查
        if curl -f http://localhost:5001/api/health/detailed &> /dev/null; then
            log_info "健康檢查通過"
        else
            log_error "健康檢查失敗"
            return 1
        fi
    fi
}

# 函數: 顯示部署資訊
show_deployment_info() {
    log_info "部署完成！"
    echo ""
    echo "服務存取資訊:"
    echo "  前端應用: http://localhost:3000"
    echo "  後端 API: http://localhost:5001/api"
    echo "  API 健康檢查: http://localhost:5001/api/health"
    echo "  MinIO 控制台: http://localhost:9001"
    echo ""
    echo "查看日誌:"
    echo "  docker compose -f $COMPOSE_FILE logs -f"
    echo ""
    echo "停止服務:"
    echo "  docker compose -f $COMPOSE_FILE down"
}

# 主程式
main() {
    local environment=${1:-development}
    
    log_info "開始部署外國學生受教權查核系統 ($environment 環境)"
    
    # 設定檔案路徑
    if [ "$environment" = "production" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
        ENV_FILE=".env.production"
    else
        COMPOSE_FILE="docker-compose.yml"
        ENV_FILE=".env"
    fi
    
    # 執行部署流程
    check_requirements
    
    if [ "$environment" = "production" ]; then
        check_env_file "$ENV_FILE"
        
        # 詢問是否備份
        read -p "是否要備份現有資料? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            backup_data
        fi
    fi
    
    build_images "$COMPOSE_FILE" "$ENV_FILE"
    stop_services "$COMPOSE_FILE"
    start_services "$COMPOSE_FILE" "$ENV_FILE"
    
    if wait_for_services; then
        run_migrations "$COMPOSE_FILE"
        health_check
        show_deployment_info
    else
        log_error "部署失敗"
        exit 1
    fi
}

# 執行主程式
main "$@"
