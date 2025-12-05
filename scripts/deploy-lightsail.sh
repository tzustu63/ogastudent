#!/bin/bash

# Amazon Lightsail 部署腳本
# 用途: 透過 SSH 部署到 Lightsail 實例

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Lightsail 配置
LIGHTSAIL_IP="18.179.120.246"
LIGHTSAIL_USER="ubuntu"
SSH_KEY="${LIGHTSAIL_SSH_KEY:-~/.ssh/lightsail-key.pem}"
PROJECT_DIR="/home/ubuntu/ogastudent"
GITHUB_REPO="https://github.com/tzustu63/ogastudent.git"

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
        log_info "請設定 LIGHTSAIL_SSH_KEY 環境變數，或將金鑰放在預設位置"
        log_info "例如: export LIGHTSAIL_SSH_KEY=/path/to/your-key.pem"
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
        "$local_path" "${LIGHTSAIL_USER}@${LIGHTSAIL_IP}:${remote_path}"
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
        
        # 安裝 Node.js（如果需要）
        if ! command -v node &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
        
        echo "所有工具已安裝"
EOF
    
    log_info "工具安裝完成"
}

# 函數: 設定專案目錄
setup_project() {
    log_step "設定專案目錄..."
    
    ssh_exec "bash -s" << EOF
        # 建立專案目錄
        mkdir -p $PROJECT_DIR
        cd $PROJECT_DIR
        
        # 如果目錄為空，克隆專案
        if [ ! -d ".git" ]; then
            echo "克隆專案..."
            git clone $GITHUB_REPO .
        else
            echo "更新專案..."
            git fetch origin
            git reset --hard origin/main
        fi
        
        echo "專案目錄設定完成"
EOF
    
    log_info "專案目錄設定完成"
}

# 函數: 複製環境變數檔案
copy_env_file() {
    log_step "設定環境變數..."
    
    # 檢查本地是否有環境變數檔案
    if [ -f ".env.production" ]; then
        log_info "複製環境變數檔案..."
        scp_copy ".env.production" "$PROJECT_DIR/.env.production"
    else
        log_warn "未找到 .env.production 檔案"
        log_info "將在遠端建立環境變數檔案範本"
        
        # 建立臨時環境變數檔案
        local temp_env="/tmp/env.production.tmp"
        cat > "$temp_env" << 'ENVTEMP'
# 資料庫設定
DB_NAME=foreign_student_verification
DB_USER=postgres
DB_PASSWORD=請設定密碼
DB_PORT=5432

# JWT 設定
JWT_SECRET=請設定隨機字串
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# MinIO 設定
MINIO_ROOT_USER=請設定使用者名稱
MINIO_ROOT_PASSWORD=請設定密碼

# 應用程式設定
NODE_ENV=production
LOG_LEVEL=info
ENVTEMP
        
        # 上傳環境變數檔案
        scp_copy "$temp_env" "$PROJECT_DIR/.env.production"
        rm -f "$temp_env"
        
        log_warn "環境變數檔案範本已建立，請在部署後編輯遠端的 .env.production"
    fi
}

# 函數: 部署應用
deploy_app() {
    log_step "部署應用程式..."
    
    ssh_exec "bash -s" << 'EOF'
        cd /home/ubuntu/ogastudent
        
        # 停止現有服務
        echo "停止現有服務..."
        docker compose -f docker-compose.prod.yml down || true
        
        # 建置並啟動服務
        echo "建置並啟動服務..."
        docker compose -f docker-compose.prod.yml build --no-cache
        docker compose -f docker-compose.prod.yml up -d
        
        # 等待服務啟動
        echo "等待服務啟動..."
        sleep 10
        
        # 執行資料庫遷移
        echo "執行資料庫遷移..."
        docker compose -f docker-compose.prod.yml exec -T backend npm run migrate || echo "遷移可能已執行"
        
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
        if ssh_exec "curl -f http://localhost:5001/api/health &> /dev/null"; then
            log_info "健康檢查通過"
            return 0
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
    echo "服務存取資訊:"
    echo "  前端應用: http://${LIGHTSAIL_IP}:3000"
    echo "  後端 API: http://${LIGHTSAIL_IP}:5001/api"
    echo "  API 健康檢查: http://${LIGHTSAIL_IP}:5001/api/health"
    echo ""
    echo "SSH 連線:"
    echo "  ssh -i $SSH_KEY ${LIGHTSAIL_USER}@${LIGHTSAIL_IP}"
    echo ""
    echo "查看日誌:"
    echo "  ssh -i $SSH_KEY ${LIGHTSAIL_USER}@${LIGHTSAIL_IP} 'cd $PROJECT_DIR && docker compose -f docker-compose.prod.yml logs -f'"
    echo ""
    echo "停止服務:"
    echo "  ssh -i $SSH_KEY ${LIGHTSAIL_USER}@${LIGHTSAIL_IP} 'cd $PROJECT_DIR && docker compose -f docker-compose.prod.yml down'"
}

# 主程式
main() {
    log_info "開始部署到 Amazon Lightsail"
    log_info "IP: $LIGHTSAIL_IP"
    log_info "使用者: $LIGHTSAIL_USER"
    echo ""
    
    check_ssh_key
    check_connection
    install_dependencies
    setup_project
    copy_env_file
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

