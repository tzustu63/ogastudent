#!/bin/bash

# DigitalOcean 自動部署腳本

set -e

echo "🚀 開始自動部署到 DigitalOcean..."
echo ""

# 檢查 doctl
if ! command -v doctl &> /dev/null; then
    echo "❌ 請先安裝 DigitalOcean CLI (doctl)"
    echo "執行: brew install doctl"
    exit 1
fi

# 檢查認證
if ! doctl auth list &> /dev/null; then
    echo "🔐 請先登入 DigitalOcean..."
    doctl auth init
fi

echo "✅ DigitalOcean CLI 已就緒"
echo ""

# 檢查是否有現有的應用
EXISTING_APPS=$(doctl apps list --no-header | wc -l | tr -d ' ')

if [ "$EXISTING_APPS" -gt 0 ]; then
    echo "📋 發現現有應用："
    doctl apps list
    echo ""
    read -p "是否要刪除現有應用並創建新的？(y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  刪除現有應用..."
        APP_IDS=$(doctl apps list --format ID --no-header)
        for app_id in $APP_IDS; do
            doctl apps delete $app_id --force
        done
        echo "✅ 已刪除現有應用"
        echo ""
    else
        echo "❌ 取消部署"
        exit 0
    fi
fi

# 創建應用配置
cat > /tmp/app-spec.yaml << 'EOF'
name: ogastudent-app
region: sfo3

services:
  - name: backend
    source_dir: /backend
    github:
      repo: tzustu63/ogastudent
      branch: main
    build_command: npm ci --include=dev && npm run build
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    http_port: 5000
    routes:
      - path: /api
    envs:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "5000"
      - key: JWT_SECRET
        value: "your-secret-key-change-this"
      - key: JWT_EXPIRES_IN
        value: "24h"
      - key: LOG_LEVEL
        value: "info"
      - key: DB_HOST
        value: ${postgres-db.HOSTNAME}
      - key: DB_PORT
        value: ${postgres-db.PORT}
      - key: DB_NAME
        value: ${postgres-db.DATABASE}
      - key: DB_USER
        value: ${postgres-db.USER}
      - key: DB_PASSWORD
        value: ${postgres-db.PASSWORD}
      - key: CORS_ORIGIN
        value: ${frontend.URL}

  - name: frontend
    source_dir: /frontend
    github:
      repo: tzustu63/ogastudent
      branch: main
    build_command: npm ci --include=dev && npm run build
    run_command: npx serve -s dist -l $PORT
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    http_port: 8080
    routes:
      - path: /
    envs:
      - key: NODE_ENV
        value: production
      - key: VITE_API_URL
        value: ${backend.URL}/api

databases:
  - name: postgres-db
    engine: PG
    version: "15"
    size: db-s-1vcpu-1gb
    num_nodes: 1
EOF

echo "📦 創建 DigitalOcean 應用..."
echo ""

# 創建應用
if doctl apps create --spec /tmp/app-spec.yaml > /tmp/deploy-output.txt 2>&1; then
    APP_ID=$(grep -E "App created" /tmp/deploy-output.txt | head -1 | awk '{print $3}')
    
    if [ -z "$APP_ID" ]; then
        APP_ID=$(doctl apps list --format ID,Spec.Name --no-header | grep "ogastudent-app" | awk '{print $1}' | head -1)
    fi
    
    if [ -n "$APP_ID" ]; then
        echo "✅ 應用創建成功！"
        echo "🆔 應用 ID: $APP_ID"
        echo ""
        
        echo "⏳ 等待部署開始..."
        sleep 5
        
        # 顯示部署狀態
        echo ""
        echo "📊 部署狀態："
        doctl apps list-deployments $APP_ID
        
        echo ""
        echo "🎉 部署已開始！"
        echo ""
        echo "📋 有用的指令："
        echo "  查看應用: doctl apps get $APP_ID"
        echo "  查看日誌: doctl apps logs $APP_ID"
        echo "  查看部署狀態: doctl apps list-deployments $APP_ID"
        echo ""
        echo "💡 提示：部署可能需要 5-10 分鐘完成"
    else
        echo "⚠️  應用已創建但無法獲取 ID"
        echo "請查看 DigitalOcean 控制台: https://cloud.digitalocean.com/apps"
    fi
else
    echo "❌ 應用創建失敗"
    echo ""
    echo "錯誤訊息："
    cat /tmp/deploy-output.txt
    echo ""
    echo "💡 可能的原因："
    echo "  1. GitHub 未連接 - 請在控制台連接 GitHub"
    echo "  2. 倉庫未授權 - 請授權 DigitalOcean 訪問倉庫"
    echo "  3. API 權限不足 - 請檢查 API token 權限"
    echo ""
    echo "🔗 解決方案："
    echo "  1. 前往: https://cloud.digitalocean.com/account/api/tokens"
    echo "  2. 點擊 'Authorize New Token'"
    echo "  3. 選擇倉庫: tzustu63/ogastudent"
    echo "  4. 完成授權後重新執行此腳本"
    exit 1
fi

# 清理
rm -f /tmp/app-spec.yaml /tmp/deploy-output.txt

echo ""
echo "✅ 完成！"
