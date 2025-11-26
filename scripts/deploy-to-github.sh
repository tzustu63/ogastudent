#!/bin/bash

# 外國學生受教權查核系統 - GitHub 推送腳本
# 此腳本會協助您將程式碼推送到 GitHub

set -e  # 遇到錯誤時停止

echo "=========================================="
echo "  GitHub 推送助手"
echo "=========================================="
echo ""

# 檢查是否已經初始化 Git
if [ ! -d ".git" ]; then
    echo "📦 初始化 Git repository..."
    git init
    echo "✅ Git 初始化完成"
    echo ""
fi

# 檢查是否有未提交的變更
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 發現未提交的變更，準備提交..."
    
    # 顯示變更的檔案
    echo ""
    echo "將要提交的檔案："
    git status --short
    echo ""
    
    # 詢問是否繼續
    read -p "是否繼續提交這些變更？(y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # 添加所有檔案
        git add .
        
        # 詢問提交訊息
        echo ""
        read -p "請輸入提交訊息（直接按 Enter 使用預設訊息）: " commit_message
        
        if [ -z "$commit_message" ]; then
            commit_message="準備 Railway 部署"
        fi
        
        # 提交
        git commit -m "$commit_message"
        echo "✅ 變更已提交"
        echo ""
    else
        echo "❌ 取消提交"
        exit 1
    fi
else
    echo "✅ 沒有未提交的變更"
    echo ""
fi

# 檢查是否已設定遠端 repository
if ! git remote | grep -q "origin"; then
    echo "🔗 設定 GitHub 遠端 repository..."
    echo ""
    echo "請在 GitHub 創建新的 repository，然後輸入 repository URL："
    echo "範例："
    echo "  HTTPS: https://github.com/your-username/your-repo-name.git"
    echo "  SSH:   git@github.com:your-username/your-repo-name.git"
    echo ""
    read -p "GitHub Repository URL: " repo_url
    
    if [ -z "$repo_url" ]; then
        echo "❌ 未輸入 URL，取消操作"
        exit 1
    fi
    
    git remote add origin "$repo_url"
    echo "✅ 遠端 repository 已設定"
    echo ""
else
    echo "✅ 遠端 repository 已存在"
    current_remote=$(git remote get-url origin)
    echo "   目前的遠端 URL: $current_remote"
    echo ""
fi

# 檢查分支名稱
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "🔄 將分支重新命名為 main..."
    git branch -M main
    echo "✅ 分支已重新命名"
    echo ""
fi

# 推送到 GitHub
echo "🚀 推送到 GitHub..."
echo ""

if git push -u origin main 2>&1; then
    echo ""
    echo "=========================================="
    echo "  ✅ 成功推送到 GitHub！"
    echo "=========================================="
    echo ""
    echo "下一步："
    echo "1. 訪問您的 GitHub repository 確認檔案已上傳"
    echo "2. 參考 RAILWAY_DEPLOYMENT.md 進行 Railway 部署"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "  ❌ 推送失敗"
    echo "=========================================="
    echo ""
    echo "可能的原因："
    echo "1. GitHub repository 不存在或 URL 錯誤"
    echo "2. 沒有權限推送到該 repository"
    echo "3. 需要設定 SSH key 或 Personal Access Token"
    echo ""
    echo "請參考 GITHUB_SETUP.md 獲取詳細說明"
    echo ""
    exit 1
fi
