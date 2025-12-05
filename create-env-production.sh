#!/bin/bash

# 快速創建環境變數檔案範本

cat > .env.production << 'EOF'
# ============================================
# 資料庫設定
# ============================================
DB_NAME=foreign_student_verification
DB_USER=postgres
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
DB_PORT=5434

# ============================================
# Redis 設定
# ============================================
REDIS_PORT=6380
REDIS_PASSWORD=

# ============================================
# JWT 設定
# ============================================
JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-48)
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# MinIO 設定
# ============================================
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
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
EOF

# 生成隨機密碼
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-48)
MINIO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# 替換範本中的密碼
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|DB_PASSWORD=\$(openssl.*|DB_PASSWORD=$DB_PASSWORD|g" .env.production
    sed -i '' "s|JWT_SECRET=\$(openssl.*|JWT_SECRET=$JWT_SECRET|g" .env.production
    sed -i '' "s|MINIO_ROOT_PASSWORD=\$(openssl.*|MINIO_ROOT_PASSWORD=$MINIO_PASSWORD|g" .env.production
else
    # Linux
    sed -i "s|DB_PASSWORD=\$(openssl.*|DB_PASSWORD=$DB_PASSWORD|g" .env.production
    sed -i "s|JWT_SECRET=\$(openssl.*|JWT_SECRET=$JWT_SECRET|g" .env.production
    sed -i "s|MINIO_ROOT_PASSWORD=\$(openssl.*|MINIO_ROOT_PASSWORD=$MINIO_PASSWORD|g" .env.production
fi

echo "✅ 環境變數檔案已創建: .env.production"
echo ""
echo "已生成隨機密碼："
echo "  DB_PASSWORD: $DB_PASSWORD"
echo "  JWT_SECRET: $JWT_SECRET"
echo "  MINIO_ROOT_PASSWORD: $MINIO_PASSWORD"
echo ""
echo "💡 提示：您可以編輯 .env.production 來修改這些設定"