#!/bin/bash

# 外國學生受教權查核系統 - Lightsail 獨立部署腳本
# 用途: 部署到 18.181.71.46，使用完全獨立的端口和資源

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Lightsail 配置
LIGHTSAIL_IP="18.181.71.46"
LIGHTSAIL_USER="ubuntu"
SSH_KEY="/Users/kuoyuming/Desktop/程式開發/InternationalStudent /LightsailDefaultKey-ap-northeast-1.pem"
PROJECT_DIR="/home/ubuntu/international-student"
COMPOSE_FILE="docker-compose.lightsail.yml"
GITHUB_REPO="https://github.com/tzustu63/ogastudent.git"
GITHUB_BRANCH="main"

# 端口配置（避免與現有應用衝突）
FRONTEND_PORT=3002
BACKEND_PORT=5003
DB_PORT=5434
REDIS_PORT=6380
MINIO_PORT=9002
MINIO_CONSOLE_PORT=9003

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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 函數: 檢查 SSH 金鑰
check_ssh_key() {
    if [ ! -f "$SSH_KEY" ]; then
        log_error "SSH 金鑰不存在: $SSH_KEY"
        log_info "請確認 SSH 金鑰路徑是否正確"
        exit 1
    fi
    
    # 設定正確的權限
    chmod 400 "$SSH_KEY" 2>/dev/null || true
    
    log_info "使用 SSH 金鑰: $SSH_KEY"
}

# 函數: 執行遠端指令
ssh_exec() {
    ssh -i "$SSH_KEY" \
        -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o LogLevel=ERROR \
        "${LIGHTSAIL_USER}@${LIGHTSAIL_IP}" "$@"
}

# 函數: 複製檔案到遠端
scp_copy() {
    local local_path=$1
    local remote_path=$2
    
    scp -i "$SSH_KEY" \
        -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o LogLevel=ERROR \
        -r "$local_path" "${LIGHTSAIL_USER}@${LIGHTSAIL_IP}:${remote_path}"
}

# 函數: 檢查遠端連線
check_connection() {
    log_step "檢查 SSH 連線..."
    
    if ssh_exec "echo '連線成功'" &>/dev/null; then
        log_info "SSH 連線正常"
        return 0
    else
        log_error "無法連線到 Lightsail 實例"
        log_info "請檢查:"
        log_info "  1. IP 位址是否正確: $LIGHTSAIL_IP"
        log_info "  2. SSH 金鑰是否正確: $SSH_KEY"
        log_info "  3. 安全群組是否允許 SSH (端口 22)"
        exit 1
    fi
}

# 函數: 檢查端口衝突
check_port_conflicts() {
    log_step "檢查端口衝突..."
    
    local ports=($FRONTEND_PORT $BACKEND_PORT $DB_PORT $REDIS_PORT $MINIO_PORT $MINIO_CONSOLE_PORT)
    local conflicted_ports=()
    
    for port in "${ports[@]}"; do
        if ssh_exec "ss -tulpn | grep -q ':${port} '" &>/dev/null; then
            conflicted_ports+=($port)
        fi
    done
    
    if [ ${#conflicted_ports[@]} -gt 0 ]; then
        log_error "以下端口已被占用: ${conflicted_ports[*]}"
        log_info "請檢查或修改部署配置中的端口設定"
        exit 1
    fi
    
    log_info "所有端口可用，無衝突"
}

# 函數: 安裝必要工具
install_dependencies() {
    log_step "檢查並安裝必要工具..."
    
    ssh_exec "bash -s" << 'EOF'
        # 更新系統
        sudo apt-get update -qq
        
        # 安裝必要工具
        if ! command -v docker &> /dev/null; then
            echo "安裝 Docker..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            sudo usermod -aG docker ubuntu
            rm get-docker.sh
        fi
        
        if ! command -v docker compose &> /dev/null && ! docker compose version &> /dev/null; then
            echo "安裝 Docker Compose..."
            sudo apt-get install -y docker-compose-plugin
        fi
        
        # 安裝 Git（如果沒有）
        if ! command -v git &> /dev/null; then
            sudo apt-get install -y git
        fi
        
        echo "所有工具已安裝"
EOF
    
    log_info "工具安裝完成"
}

# 函數: 設定專案目錄
setup_project() {
    log_step "設定專案目錄..."
    
    log_info "從 GitHub clone 專案到伺服器..."
    
    ssh_exec "bash -s" << EOF
        # 如果目錄存在，備份環境變數檔案（如果有的話）
        if [ -d "$PROJECT_DIR" ] && [ -f "$PROJECT_DIR/.env.production" ]; then
            echo "備份現有環境變數檔案..."
            cp "$PROJECT_DIR/.env.production" /tmp/.env.production.backup || true
        fi
        
        # 如果目錄已存在且是 git 倉庫，更新它
        if [ -d "$PROJECT_DIR/.git" ]; then
            echo "更新現有 Git 倉庫..."
            cd $PROJECT_DIR
            git fetch origin
            git reset --hard origin/${GITHUB_BRANCH} || git reset --hard origin/main
            git clean -fd
        else
            # 如果目錄存在但沒有 .git，刪除它
            if [ -d "$PROJECT_DIR" ]; then
                echo "移除現有目錄..."
                rm -rf $PROJECT_DIR
            fi
            
            # Clone 專案
            echo "從 GitHub clone 專案..."
            git clone -b ${GITHUB_BRANCH} ${GITHUB_REPO} $PROJECT_DIR || \
            git clone -b main ${GITHUB_REPO} $PROJECT_DIR || \
            git clone ${GITHUB_REPO} $PROJECT_DIR
        fi
        
        # 恢復環境變數檔案（如果有備份）
        if [ -f "/tmp/.env.production.backup" ]; then
            echo "恢復環境變數檔案..."
            cp /tmp/.env.production.backup "$PROJECT_DIR/.env.production" || true
            rm /tmp/.env.production.backup
        fi
        
        echo "專案目錄設定完成"
EOF
    
    log_info "專案目錄設定完成"
}

# 函數: 檢查環境變數檔案
check_env_file() {
    log_step "檢查環境變數檔案..."
    
    if [ -f ".env.production" ]; then
        log_info "發現本地 .env.production 檔案，將上傳到伺服器"
        scp_copy ".env.production" "${PROJECT_DIR}/.env.production"
    else
        log_warn "未找到本地 .env.production 檔案"
        log_info "將在遠端建立環境變數檔案範本"
        
        ssh_exec "bash -s" << EOF
            cd $PROJECT_DIR
            cat > .env.production << 'ENVEOF'
# ============================================
# 資料庫設定
# ============================================
DB_NAME=foreign_student_verification
DB_USER=postgres
DB_PASSWORD=請修改為強密碼_至少16字元
DB_PORT=5434

# ============================================
# Redis 設定
# ============================================
REDIS_PORT=6380
REDIS_PASSWORD=

# ============================================
# JWT 設定
# ============================================
JWT_SECRET=請設定隨機字串_至少32字元
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# MinIO 設定
# ============================================
MINIO_ROOT_USER=請設定使用者名稱
MINIO_ROOT_PASSWORD=請設定密碼_至少16字元
MINIO_PORT=9002
MINIO_CONSOLE_PORT=9003

# ============================================
# 應用程式設定
# ============================================
NODE_ENV=production
LOG_LEVEL=info

# ============================================
# 端口設定（避免與現有應用衝突）
# ============================================
FRONTEND_PORT=3002
BACKEND_PORT=5003

# ============================================
# CORS 設定
# ============================================
CORS_ORIGIN=http://18.181.71.46:3002

# ============================================
# API URL（前端使用）
# ============================================
VITE_API_URL=http://18.181.71.46:5003/api

# ============================================
# 其他設定
# ============================================
AWS_S3_BUCKET=foreign-student-docs
AWS_REGION=us-east-1
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=pdf,doc,docx,jpg,jpeg,png
ENVEOF
            echo "環境變數檔案範本已建立"
EOF
        
        log_warn "環境變數檔案範本已建立，請在部署後編輯遠端的 .env.production"
        log_warn "編輯指令: ssh -i $SSH_KEY ${LIGHTSAIL_USER}@${LIGHTSAIL_IP} 'nano ${PROJECT_DIR}/.env.production'"
    fi
}

# 函數: 部署應用
deploy_app() {
    log_step "部署應用程式..."
    
    ssh_exec "bash -s" << EOF
        cd $PROJECT_DIR
        
        # 停止現有服務（如果存在）
        echo "停止現有服務..."
        docker compose -f $COMPOSE_FILE down || true
        
        # 建置並啟動服務
        echo "建置並啟動服務..."
        docker compose -f $COMPOSE_FILE --env-file .env.production build --no-cache
        
        echo "啟動服務..."
        docker compose -f $COMPOSE_FILE --env-file .env.production up -d
        
        # 等待服務啟動
        echo "等待服務啟動..."
        sleep 15
        
        # 執行資料庫遷移
        echo "執行資料庫遷移..."
        docker compose -f $COMPOSE_FILE exec -T backend npm run migrate || echo "遷移可能已執行或失敗，請檢查日誌"
        
        echo "部署完成"
EOF
    
    log_info "應用程式部署完成"
}

# 函數: 健康檢查
health_check() {
    log_step "執行健康檢查..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if ssh_exec "curl -f http://localhost:${BACKEND_PORT}/api/health &> /dev/null"; then
            log_info "後端健康檢查通過"
            
            # 檢查前端
            if ssh_exec "curl -f http://localhost:${FRONTEND_PORT} &> /dev/null"; then
                log_info "前端健康檢查通過"
                return 0
            fi
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    log_warn "健康檢查超時，但服務可能仍在啟動中"
    return 1
}

# 函數: 顯示部署資訊
show_deployment_info() {
    log_info "部署完成！"
    echo ""
    echo "========================================="
    echo "服務存取資訊"
    echo "========================================="
    echo "前端應用: http://${LIGHTSAIL_IP}:${FRONTEND_PORT}"
    echo "後端 API: http://${LIGHTSAIL_IP}:${BACKEND_PORT}/api"
    echo "API 健康檢查: http://${LIGHTSAIL_IP}:${BACKEND_PORT}/api/health"
    echo "API 文檔: http://${LIGHTSAIL_IP}:${BACKEND_PORT}/api/docs"
    echo "MinIO 控制台: http://${LIGHTSAIL_IP}:${MINIO_CONSOLE_PORT}"
    echo ""
    echo "========================================="
    echo "使用的端口（完全獨立，無衝突）"
    echo "========================================="
    echo "前端: ${FRONTEND_PORT}"
    echo "後端: ${BACKEND_PORT}"
    echo "PostgreSQL: ${DB_PORT}"
    echo "Redis: ${REDIS_PORT}"
    echo "MinIO API: ${MINIO_PORT}"
    echo "MinIO Console: ${MINIO_CONSOLE_PORT}"
    echo ""
    echo "========================================="
    echo "管理指令"
    echo "========================================="
    echo "SSH 連線:"
    echo "  ssh -i $SSH_KEY ${LIGHTSAIL_USER}@${LIGHTSAIL_IP}"
    echo ""
    echo "查看日誌:"
    echo "  ssh -i $SSH_KEY ${LIGHTSAIL_USER}@${LIGHTSAIL_IP} 'cd $PROJECT_DIR && docker compose -f $COMPOSE_FILE logs -f'"
    echo ""
    echo "停止服務:"
    echo "  ssh -i $SSH_KEY ${LIGHTSAIL_USER}@${LIGHTSAIL_IP} 'cd $PROJECT_DIR && docker compose -f $COMPOSE_FILE down'"
    echo ""
    echo "重啟服務:"
    echo "  ssh -i $SSH_KEY ${LIGHTSAIL_USER}@${LIGHTSAIL_IP} 'cd $PROJECT_DIR && docker compose -f $COMPOSE_FILE restart'"
    echo ""
    echo "查看容器狀態:"
    echo "  ssh -i $SSH_KEY ${LIGHTSAIL_USER}@${LIGHTSAIL_IP} 'cd $PROJECT_DIR && docker compose -f $COMPOSE_FILE ps'"
    echo ""
    echo "========================================="
    echo "驗證獨立性"
    echo "========================================="
    echo "檢查容器: docker ps | grep isvs-"
    echo "檢查網路: docker network ls | grep isvs"
    echo "檢查 Volume: docker volume ls | grep isvs"
    echo "檢查端口: ss -tulpn | grep -E ':(${FRONTEND_PORT}|${BACKEND_PORT}|${DB_PORT}|${REDIS_PORT}|${MINIO_PORT}|${MINIO_CONSOLE_PORT})'"
    echo ""
}

# 主程式
main() {
    log_info "開始部署外國學生受教權查核系統到 Lightsail"
    log_info "IP: $LIGHTSAIL_IP"
    log_info "使用者: $LIGHTSAIL_USER"
    log_info "專案目錄: $PROJECT_DIR"
    log_info "使用的端口（避免衝突）:"
    log_info "  前端: $FRONTEND_PORT"
    log_info "  後端: $BACKEND_PORT"
    log_info "  資料庫: $DB_PORT"
    log_info "  Redis: $REDIS_PORT"
    log_info "  MinIO: $MINIO_PORT (API), $MINIO_CONSOLE_PORT (Console)"
    echo ""
    
    check_ssh_key
    check_connection
    check_port_conflicts
    install_dependencies
    setup_project
    check_env_file
    deploy_app
    
    if health_check; then
        show_deployment_info
    else
        log_warn "健康檢查未通過，但部署可能已成功"
        show_deployment_info
    fi
}

# 執行主程式
main "$@"