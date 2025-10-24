# 多階段建置 - 生產環境
FROM node:18-alpine AS builder

WORKDIR /app

# 複製 package 檔案
COPY package*.json ./

# 安裝所有依賴（包含 devDependencies）
RUN npm ci

# 複製原始碼
COPY . .

# 建置 TypeScript
RUN npm run build

# 生產階段
FROM node:18-alpine

WORKDIR /app

# 安裝 dumb-init 用於正確處理信號
RUN apk add --no-cache dumb-init

# 建立非 root 使用者
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 複製 package 檔案
COPY package*.json ./

# 只安裝生產依賴
RUN npm ci --only=production && \
    npm cache clean --force

# 從 builder 階段複製建置結果
COPY --from=builder /app/dist ./dist

# 建立必要的目錄
RUN mkdir -p logs uploads && \
    chown -R nodejs:nodejs /app

# 切換到非 root 使用者
USER nodejs

# 暴露埠號
EXPOSE 5000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 使用 dumb-init 啟動應用
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
