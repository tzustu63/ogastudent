# 🚀 DigitalOcean 快速部署指南

## 一步到位的部署方法

由於 API 需要 GitHub 認證，請按照以下步驟在控制台完成部署：

### ⚡ 快速步驟（5 分鐘）

1. **打開 DigitalOcean 控制台**

   - 前往：https://cloud.digitalocean.com/apps
   - 點擊 "Create App"

2. **連接 GitHub**

   - 選擇 "GitHub" 來源
   - 點擊 "Authorize New Token"
   - 允許 DigitalOcean 訪問您的倉庫

3. **選擇倉庫**

   - Repository: `tzustu63/ogastudent`
   - Branch: `main`
   - ✅ 勾選 "Auto-deploy on push"

4. **配置 Backend 服務**

   - **Root Directory**: `/backend`
   - **Build Command**: `npm ci --include=dev && npm run build`
   - **Run Command**: `npm start`
   - **Port**: `5000`
   - **HTTP Routes**: `/api/*`

   添加環境變數：

   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-secret-key-change-this
   JWT_EXPIRES_IN=24h
   LOG_LEVEL=info
   ```

5. **配置 Frontend 服務**

   - **Root Directory**: `/frontend`
   - **Build Command**: `npm ci --include=dev && npm run build`
   - **Run Command**: `npx serve -s dist -l $PORT`
   - **Port**: `8080`
   - **HTTP Routes**: `/*`

   添加環境變數：

   ```
   NODE_ENV=production
   VITE_API_URL=${backend.URL}/api
   PORT=8080
   ```

6. **添加資料庫**

   - 點擊 "Create Database"
   - Engine: PostgreSQL 15
   - Plan: Basic (1GB RAM)
   - Name: postgres-db

7. **連接資料庫到 Backend**
   在 Backend 環境變數中添加：

   ```
   DB_HOST=${postgres-db.HOSTNAME}
   DB_PORT=${postgres-db.PORT}
   DB_NAME=${postgres-db.DATABASE}
   DB_USER=${postgres-db.USER}
   DB_PASSWORD=${postgres-db.PASSWORD}
   CORS_ORIGIN=${frontend.URL}
   ```

8. **選擇資源方案**

   - Backend: basic-xxs ($5/月)
   - Frontend: basic-xxs ($5/月)
   - Database: db-s-1vcpu-1gb ($15/月)

9. **部署**

   - 點擊 "Create Resources"
   - 等待 5-10 分鐘完成部署

10. **完成！**
    - 您的應用網址將顯示在控制台
    - 前端: `https://your-app.ondigitalocean.app`
    - 後端: `https://your-app.ondigitalocean.app/api`

## 📋 複製貼上的建置命令

### Backend

```bash
npm ci --include=dev && npm run build
```

### Frontend

```bash
npm ci --include=dev && npm run build
```

### Frontend Run Command

```bash
npx serve -s dist -l $PORT
```

## ⚠️ 重要提醒

1. **GitHub 認證**是必需的
2. 確保安裝了 **所有依賴**（包括 devDependencies）
3. **環境變數**需要正確設定
4. 首次部署可能需要 **5-10 分鐘**

## 🔗 有用的連結

- [DigitalOcean 控制台](https://cloud.digitalocean.com/apps)
- [GitHub 授權設定](https://cloud.digitalocean.com/account/api/tokens)
- [完整部署文檔](./DIGITALOCEAN_MANUAL_DEPLOY.md)

## 💡 提示

- 部署完成後，任何推送到 `main` 分支的代碼都會自動重新部署
- 可以在控制台的 "Runtime Logs" 查看實時日誌
- 如有問題，檢查 "Deployment Logs" 中的錯誤訊息
