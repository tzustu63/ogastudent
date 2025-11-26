# 🚀 DigitalOcean 部署步驟（最簡單的方法）

## 步驟 1: 在控制台創建應用

1. 在打開的頁面中，點擊 "Add Source" 或 "選擇 GitHub"
2. 首次使用會提示「Authorize with GitHub」
3. 點擊授權，選擇 `tzustu63/ogastudent` 倉庫
4. 選擇 `main` 分支

## 步驟 2: DigitalOcean 會自動檢測

DigitalOcean 會自動識別您的 monorepo 結構！

### 檢測到的服務：

**Backend 服務** - 自動配置
- Root Directory: `/backend`
- Build Command: `npm ci && npm run build`
- Run Command: `npm start`
- Port: 自動檢測

**Frontend 服務** - 自動配置  
- Root Directory: `/frontend`
- Build Command: `npm ci && npm run build`
- Run Command: `npm start`
- Port: 自動檢測

## 步驟 3: 修改建置命令

對於每個服務，將 Build Command 改為：

```bash
npm ci --include=dev && npm run build
```

對於 Frontend，將 Run Command 改為：

```bash
npx serve -s dist -l $PORT
```

## 步驟 4: 添加資料庫

1. 在 "Resources" 部分
2. 點擊 "Create Database"
3. 選擇：
   - PostgreSQL 15
   - Basic (1GB RAM)
   - Name: postgres-db

## 步驟 5: 添加環境變數

### Backend 環境變數：
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=24h
LOG_LEVEL=info
DB_HOST=${postgres-db.HOSTNAME}
DB_PORT=${postgres-db.PORT}
DB_NAME=${postgres-db.DATABASE}
DB_USER=${postgres-db.USER}
DB_PASSWORD=${postgres-db.PASSWORD}
CORS_ORIGIN=${frontend.URL}
```

### Frontend 環境變數：
```
NODE_ENV=production
VITE_API_URL=${backend.URL}/api
PORT=8080
```

## 步驟 6: 部署！

點擊 "Create Resources" 或 "Deploy" 按鈕

---

## 💡 如果找不到授權選項

如果頁面上看不到 GitHub 授權選項，這是正常的！

直接按照上述步驟，當您選擇 GitHub 作為來源時，系統會自動提示您授權。

