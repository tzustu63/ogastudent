#!/bin/bash

# 外國學生受教權查核系統 - 健康檢查腳本
# 用途: 檢查所有服務的健康狀態

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_fail() {
    echo -e "${RED}[✗]${NC} $1"
}

# 函數: 檢查 HTTP 端點
check_http_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    if curl -f -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        log_success "$name: 正常 ($url)"
        return 0
    else
        log_fail "$name: 異常 ($url)"
        return 1
    fi
}

# 函數: 檢查 Docker 容器
check_container() {
    local container_name=$1
    
    if docker ps --filter "name=$container_name" --filter "status=running" | grep -q "$container_name"; then
        log_success "容器 $container_name: 運行中"
        return 0
    else
        log_fail "容器 $container_name: 未運行"
        return 1
    fi
}

# 函數: 檢查容器健康狀態
check_container_health() {
    local container_name=$1
    
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "none")
    
    if [ "$health_status" = "healthy" ]; then
        log_success "容器 $container_name 健康檢查: 健康"
        return 0
    elif [ "$health_status" = "none" ]; then
        log_warn "容器 $container_name: 未配置健康檢查"
        return 0
    else
        log_fail "容器 $container_name 健康檢查: $health_status"
        return 1
    fi
}

# 函數: 顯示服務資訊
show_service_info() {
    echo ""
    echo -e "${BLUE}=== 服務資訊 ===${NC}"
    docker compose ps
}

# 函數: 顯示資源使用情況
show_resource_usage() {
    echo ""
    echo -e "${BLUE}=== 資源使用情況 ===${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

# 主程式
main() {
    local watch_mode=false
    
    if [ "$1" = "--watch" ]; then
        watch_mode=true
    fi
    
    while true; do
        clear
        echo -e "${BLUE}========================================${NC}"
        echo -e "${BLUE}外國學生受教權查核系統 - 健康檢查${NC}"
        echo -e "${BLUE}========================================${NC}"
        echo ""
        
        local all_healthy=true
        
        # 檢查容器狀態
        echo -e "${BLUE}=== 容器狀態 ===${NC}"
        check_container "fsvs-postgres" || all_healthy=false
        check_container "fsvs-redis" || all_healthy=false
        check_container "fsvs-minio" || all_healthy=false
        check_container "fsvs-backend" || all_healthy=false
        check_container "fsvs-frontend" || all_healthy=false
        echo ""
        
        # 檢查容器健康狀態
        echo -e "${BLUE}=== 容器健康檢查 ===${NC}"
        check_container_health "fsvs-postgres" || all_healthy=false
        check_container_health "fsvs-redis" || all_healthy=false
        check_container_health "fsvs-minio" || all_healthy=false
        check_container_health "fsvs-backend" || all_healthy=false
        check_container_health "fsvs-frontend" || all_healthy=false
        echo ""
        
        # 檢查 HTTP 端點
        echo -e "${BLUE}=== HTTP 端點檢查 ===${NC}"
        check_http_endpoint "後端 API 基本健康檢查" "http://localhost:5001/api/health" || all_healthy=false
        check_http_endpoint "後端 API 詳細健康檢查" "http://localhost:5001/api/health/detailed" || all_healthy=false
        check_http_endpoint "前端應用" "http://localhost:3000" || all_healthy=false
        check_http_endpoint "MinIO API" "http://localhost:9000/minio/health/live" || all_healthy=false
        echo ""
        
        # 顯示整體狀態
        echo -e "${BLUE}=== 整體狀態 ===${NC}"
        if [ "$all_healthy" = true ]; then
            log_success "所有服務運行正常"
        else
            log_error "部分服務異常，請檢查上述訊息"
        fi
        
        # 顯示服務資訊
        show_service_info
        
        # 顯示資源使用情況
        show_resource_usage
        
        # 如果不是監控模式，退出
        if [ "$watch_mode" = false ]; then
            break
        fi
        
        echo ""
        echo -e "${YELLOW}監控模式 - 每 30 秒更新一次（按 Ctrl+C 退出）${NC}"
        sleep 30
    done
}

main "$@"
