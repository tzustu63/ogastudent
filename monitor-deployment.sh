#!/bin/bash

# DigitalOcean 部署監控腳本

APP_ID="87dd0d92-ee36-4659-b1f6-470ee89b3860"

echo "🔍 監控 DigitalOcean 應用部署狀態..."
echo "應用 ID: $APP_ID"
echo ""

while true; do
    # 獲取部署狀態
    DEPLOYMENT_INFO=$(doctl apps list-deployments $APP_ID --format "ID,Progress,Phase,CreatedAt" --no-header)
    
    if [ -n "$DEPLOYMENT_INFO" ]; then
        echo "📊 部署狀態: $(date)"
        echo "$DEPLOYMENT_INFO"
        echo ""
        
        # 檢查是否完成
        PHASE=$(echo "$DEPLOYMENT_INFO" | awk '{print $3}')
        if [ "$PHASE" = "ACTIVE" ]; then
            echo "🎉 部署完成！"
            break
        elif [ "$PHASE" = "FAILED" ]; then
            echo "❌ 部署失敗！"
            break
        fi
    else
        echo "⏳ 等待部署開始..."
    fi
    
    sleep 10
done

# 獲取應用 URL
echo ""
echo "🌐 獲取應用網址..."
doctl apps get $APP_ID --format "Spec.Services[*].Name,Spec.Services[*].LiveURL" --no-header

echo ""
echo "📋 有用的指令:"
echo "  查看應用詳情: doctl apps get $APP_ID"
echo "  查看日誌: doctl apps logs $APP_ID"
echo "  刪除應用: doctl apps delete $APP_ID"
