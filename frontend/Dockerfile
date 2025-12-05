# 多階段建置 - 生產環境
FROM node:18-alpine AS builder

WORKDIR /app

# 複製 package 檔案
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製原始碼
COPY . .

# 建置應用
RUN npm run build

# 生產階段 - 使用 nginx 提供靜態檔案
FROM nginx:alpine

# 複製自訂 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 從 builder 階段複製建置結果
COPY --from=builder /app/dist /usr/share/nginx/html

# 建立非 root 使用者
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

# 切換到非 root 使用者
USER nginx-user

# 暴露埠號
EXPOSE 8080

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
