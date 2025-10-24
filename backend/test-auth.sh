#!/bin/bash

# 測試認證端點腳本

BASE_URL="http://localhost:5000"

echo "🧪 測試外國學生受教權查核系統認證端點"
echo "=========================================="
echo ""

# 測試 1: Health Check
echo "📋 測試 1: Health Check"
echo "GET $BASE_URL/api/health"
curl -s -X GET "$BASE_URL/api/health" | jq '.'
echo ""
echo ""

# 測試 2: 登入 (正確的帳號密碼)
echo "🔐 測試 2: 使用者登入 (正確帳密)"
echo "POST $BASE_URL/api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }')
echo "$LOGIN_RESPONSE" | jq '.'

# 提取 access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.tokens.access_token')
echo ""
echo "Access Token: $ACCESS_TOKEN"
echo ""
echo ""

# 測試 3: 取得當前使用者資訊
echo "👤 測試 3: 取得當前使用者資訊"
echo "GET $BASE_URL/api/auth/me"
curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""
echo ""

# 測試 4: 登入 (錯誤的密碼)
echo "❌ 測試 4: 使用者登入 (錯誤密碼)"
echo "POST $BASE_URL/api/auth/login"
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "wrongpassword"
  }' | jq '.'
echo ""
echo ""

# 測試 5: 登出
echo "🚪 測試 5: 使用者登出"
echo "POST $BASE_URL/api/auth/logout"
curl -s -X POST "$BASE_URL/api/auth/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
echo ""
echo ""

# 測試 6: 未授權存取
echo "🚫 測試 6: 未授權存取 (無 token)"
echo "GET $BASE_URL/api/auth/me"
curl -s -X GET "$BASE_URL/api/auth/me" | jq '.'
echo ""
echo ""

echo "✅ 測試完成！"
