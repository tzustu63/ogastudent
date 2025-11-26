#!/bin/bash

# Railway CLI 直接部署腳本
# 此腳本會協助您透過 Railway CLI 直接部署專案

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函數：顯示訊息
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 檢查 Railway CLI
check_railway_cli() {
    log_info "檢查 Railway CLI..."
    
    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI 未安裝"
        echo "請執行: npm install -g @railway/cli"
        exit 1
    fi
    
    if ! railway whoami &> /dev/null; then
        log_error "Railway CLI 未登入"
        echo "請執行: railway login"
        exit 1
    fi
    
    log_success "Railway CLI 已安裝並登入: $(railway whoami)"
}

# 初始化或連結專案
init_project() {
    log_info "檢查專案狀態..."
    
    if railway status &> /dev/null; then
        log_success "專案已連結: $(railway status | grep -i project || echo '已連結')"
        return 0
    fi
    
    log_warning "專案未連結"
    echo ""
    echo "請選擇："
    echo "1. 初始化新專案 (railway init)"
    echo "2. 連結到現有專案 (railway link)"
    echo "3. 跳過（稍後手動處理）"
    echo ""
    read -p "請選擇 (1-3): " choice
    
    case $choice in
        1)
            log_info "初始化新專案..."
            railway init
            ;;
        2)
            log_info "連結到現有專案..."
            railway link
            ;;
        3)
            log_warning "已跳過，請稍後手動連結專案"
            return 1
            ;;
        *)
            log_error "無效選項"
            exit 1
            ;;
    esac
}

# 添加資料庫
add_database() {
    log_info "檢查資料庫..."
    
    # 回到專案根目錄
    cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
    
    # 檢查是否已有資料庫服務
    if railway variables 2>/dev/null | grep -q "DATABASE_URL"; then
        log_success "資料庫已存在"
        return 0
    fi
    
    log_info "添加 PostgreSQL 資料庫..."
    log_info "這會在專案層級創建資料庫服務..."
    
    # 在專案根目錄添加資料庫
    railway add --database postgres || {
        log_warning "資料庫添加可能需要手動操作"
        log_info "請在 Railway Dashboard 中手動添加 PostgreSQL 資料庫"
        log_info "或稍後執行: railway add --database postgres"
        return 1
    }
    
    # 等待一下讓資料庫初始化
    sleep 3
    
    # 再次檢查
    if railway variables 2>/dev/null | grep -q "DATABASE_URL"; then
        log_success "資料庫已添加"
    else
        log_warning "資料庫可能正在初始化，請稍後檢查"
        log_info "執行 'railway variables' 查看 DATABASE_URL"
    fi
}

# 部署後端
deploy_backend() {
    log_info "開始部署後端..."
    
    # 確保在專案根目錄
    local project_root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
    cd "$project_root/backend"
    
    # 首次部署時會自動創建服務，不需要手動創建
    
    # 部署
    log_info "上傳並部署後端服務..."
    railway up --detach || {
        log_error "後端部署失敗"
        cd "$project_root"
        exit 1
    }
    
    log_success "後端部署完成"
    
    # 等待服務啟動
    log_info "等待服務啟動..."
    sleep 5
    
    cd "$project_root"
}

# 設定後端環境變數
setup_backend_vars() {
    log_info "設定後端環境變數..."
    
    # 確保在專案根目錄
    local project_root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
    cd "$project_root/backend"
    
    # 檢查是否已設定
    if railway variables 2>/dev/null | grep -q "JWT_SECRET"; then
        log_warning "環境變數已存在，是否要更新？"
        read -p "更新環境變數？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "跳過環境變數設定"
            cd "$project_root"
            return 0
        fi
    fi
    
    # 設定環境變數
    log_info "設定 JWT_SECRET..."
    railway variables set JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "your-super-secret-jwt-key-$(date +%s)")
    
    log_info "設定其他環境變數..."
    railway variables set JWT_EXPIRES_IN=7d
    railway variables set NODE_ENV=production
    railway variables set PORT=5000
    railway variables set MAX_FILE_SIZE=10485760
    railway variables set UPLOAD_DIR=/tmp/uploads
    
    # 取得後端網址
    BACKEND_URL=$(railway domain --json 2>/dev/null | jq -r '.domain' 2>/dev/null || railway domain 2>/dev/null | head -1 || echo "")
    
    if [ -z "$BACKEND_URL" ]; then
        log_warning "無法自動取得後端網址，請稍後手動設定"
        log_info "在 Railway Dashboard 中生成網域後，執行："
        echo "  cd backend"
        echo "  railway variables set FRONTEND_URL=https://your-frontend.up.railway.app"
    else
        log_success "後端網址: $BACKEND_URL"
        export BACKEND_URL
    fi
    
    cd "$project_root"
}

# 部署前端
deploy_frontend() {
    log_info "開始部署前端..."
    
    # 確保在專案根目錄
    local project_root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
    cd "$project_root/frontend"
    
    # 首次部署時會自動創建服務，不需要手動創建
    
    # 部署
    log_info "上傳並部署前端服務..."
    railway up --detach || {
        log_error "前端部署失敗"
        cd ..
        exit 1
    }
    
    log_success "前端部署完成"
    
    # 等待服務啟動
    log_info "等待服務啟動..."
    sleep 5
    
    cd "$project_root"
}

# 設定前端環境變數
setup_frontend_vars() {
    log_info "設定前端環境變數..."
    
    # 確保在專案根目錄
    local project_root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
    cd "$project_root/frontend"
    
    # 確保服務已連結
    if ! railway service &> /dev/null; then
        log_info "連結前端服務..."
        railway service frontend || {
            log_warning "無法自動連結服務，請手動執行: railway service frontend"
        }
    }
    
    # 檢查後端網址
    if [ -z "$BACKEND_URL" ]; then
        log_warning "後端網址未設定，請手動輸入："
        read -p "後端 API 網址: " BACKEND_URL
    fi
    
    # 設定環境變數
    railway variables set VITE_API_URL=$BACKEND_URL
    railway variables set NODE_ENV=production
    
    log_success "前端環境變數已設定"
    
    # 取得前端網址
    FRONTEND_URL=$(railway domain --json 2>/dev/null | jq -r '.domain' 2>/dev/null || railway domain 2>/dev/null | head -1 || echo "")
    
    if [ -z "$FRONTEND_URL" ]; then
        log_warning "無法自動取得前端網址，請稍後手動設定"
    else
        log_success "前端網址: $FRONTEND_URL"
        export FRONTEND_URL
    fi
    
    cd "$project_root"
}

# 更新後端 CORS
update_backend_cors() {
    if [ -z "$FRONTEND_URL" ]; then
        log_warning "前端網址未設定，請稍後手動更新 CORS"
        log_info "執行："
        echo "  cd backend"
        echo "  railway variables set FRONTEND_URL=https://your-frontend.up.railway.app"
        return 0
    fi
    
    log_info "更新後端 CORS 設定..."
    
    cd backend
    railway variables set FRONTEND_URL=$FRONTEND_URL
    log_success "後端 CORS 已更新"
    cd "$project_root"
}

# 顯示部署資訊
show_deployment_info() {
    echo ""
    log_success "部署完成！"
    echo ""
    echo "📋 部署資訊："
    echo ""
    
    cd backend
    BACKEND_URL=$(railway domain --json 2>/dev/null | jq -r '.domain' 2>/dev/null || railway domain 2>/dev/null | head -1 || echo "請在 Dashboard 中查看")
    cd ..
    
    cd frontend
    FRONTEND_URL=$(railway domain --json 2>/dev/null | jq -r '.domain' 2>/dev/null || railway domain 2>/dev/null | head -1 || echo "請在 Dashboard 中查看")
    cd ..
    
    echo "  後端 API: $BACKEND_URL"
    echo "  前端應用: $FRONTEND_URL"
    echo ""
    echo "🔗 測試連結："
    echo "  後端健康檢查: $BACKEND_URL/api/health"
    echo "  前端應用: $FRONTEND_URL"
    echo ""
    echo "📝 預設管理員帳號："
    echo "  帳號: admin"
    echo "  密碼: admin123（首次登入後請立即修改）"
    echo ""
    echo "🔧 常用指令："
    echo "  查看日誌: railway logs"
    echo "  查看狀態: railway status"
    echo "  開啟 Dashboard: railway open"
    echo ""
}

# 主程式
main() {
    echo ""
    echo "🚀 Railway CLI 直接部署腳本"
    echo "=============================="
    echo ""
    
    # 檢查 Railway CLI
    check_railway_cli
    
    # 初始化專案
    if ! init_project; then
        log_error "請先連結專案後再執行部署"
        exit 1
    fi
    
    echo ""
    echo "📋 部署選項："
    echo "1. 完整部署（後端 + 前端）"
    echo "2. 只部署後端"
    echo "3. 只部署前端"
    echo "4. 只設定環境變數"
    echo ""
    read -p "請選擇 (1-4): " choice
    
    case $choice in
        1)
            # 完整部署
            add_database
            deploy_backend
            setup_backend_vars
            deploy_frontend
            setup_frontend_vars
            update_backend_cors
            show_deployment_info
            ;;
        2)
            # 只部署後端
            add_database
            deploy_backend
            setup_backend_vars
            show_deployment_info
            ;;
        3)
            # 只部署前端
            deploy_frontend
            setup_frontend_vars
            show_deployment_info
            ;;
        4)
            # 只設定環境變數
            setup_backend_vars
            setup_frontend_vars
            update_backend_cors
            ;;
        *)
            log_error "無效選項"
            exit 1
            ;;
    esac
}

# 執行主程式
main "$@"

