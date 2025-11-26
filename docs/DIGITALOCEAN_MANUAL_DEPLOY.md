# DigitalOcean 手動部署指南

由於 GitHub 認證問題，建議使用 DigitalOcean 控制台手動部署。

## 步驟 1: 登入 DigitalOcean 控制台

1. 前往 [DigitalOcean 控制台](https://cloud.digitalocean.com/)
2. 點擊左上角的 "Apps" 選單

## 步驟 2: 創建新的應用

1. 點擊 "Create App" 按鈕
2. 選擇 "GitHub" 作為資源來源
3. 如果提示需要連接 GitHub，按照指示完成連接

## 步驟 3: 選擇倉庫

1. 選擇 `tzustu63/ogastudent` 倉庫
2. 選擇 `main` 分支
3. 保持 "Auto-deploy" 選項啟用

## 步驟 4: 配置服務

DigitalOcean 會自動檢測到您的 monorepo 結構。

### 配置 Backend 服務

1. 點擊 "Edit" 編輯 Backend 服務
2. 設置以下配置：

   - **名稱**: backend
   - **Root Directory**: `/backend`
   - **Build Command**: `npm ci --include=dev && npm run build`
   - **Run Command**: `npm start`
   - **Port**: 5000
   - **HTTP Request Routes**: `/api/*`

3. 添加環境變數：
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRES_IN=24h
   LOG_LEVEL=info
   ```

### 配置 Frontend 服務

1. 點擊 "Edit" 編輯 Frontend 服務
2. 設置以下配置：

   - **名稱**: frontend
   - **Root Directory**: `/frontend`
   - **Build Command**: `npm ci --include=dev && npm run build`
   - **Run Command**: `npx serve -s dist -l $PORT`
   - **Port**: 8080
   - **HTTP Request Routes**: `/*`

3. 添加環境變數：
   ```
   NODE_ENV=production
   PORT=8080
   ```

## 步驟 5: 添加資料庫

1. 在應用配置頁面，點擊 "Resources"
2. 點擊 "Create Database"
3. 選擇：
   - **Database Engine**: PostgreSQL
   - **Version**: 15
   - **Plan**: Basic (1GB RAM)
   - **Name**: postgres-db

## 步驟 6: 連接資料庫到 Backend

1. 回到 Backend 服務配置
2. 添加資料庫環境變數（DigitalOcean 會自動提供）：

   ```
   DB_HOST=${postgres-db.HOSTNAME}
   DB_PORT=${postgres-db.PORT}
   DB_NAME=${postgres-db.DATABASE}
   DB_USER=${postgres-db.USER}
   DB_PASSWORD=${postgres-db.PASSWORD}
   ```

3. 添加 CORS 設定：
   ```
   CORS_ORIGIN=${frontend.URL}
   ```

## 步驟 7: 選擇資源方案

選擇最便宜的測試方案：

- **Backend**: basic-xxs (512MB RAM)
- **Frontend**: basic-xxs (512MB RAM)
- **Database**: db-s-1vcpu-1gb (1GB RAM)

## 步驟 8: 部署

1. 檢查所有配置
2. 點擊 "Create Resources" 或 "Deploy"
3. 等待部署完成（約 5-10 分鐘）

## 步驟 9: 訪問應用

部署完成後，您將獲得：

- **前端網址**: `https://your-app-name.ondigitalocean.app`
- **後端 API**: `https://your-app-name.ondigitalocean.app/api`

## 故障排除

### 如果 GitHub 認證失敗

1. 前往 [DigitalOcean GitHub 設定](https://cloud.digitalocean.com/account/api/tokens)
2. 點擊 "GitHub" 選項卡
3. 點擊 "Authorize New Token"
4. 選擇必要的權限
5. 重新嘗試創建應用

### 如果部署失敗

1. 檢查部署日誌
2. 確認 Root Directory 設定正確
3. 確認 Build Command 和 Run Command 正確
4. 檢查環境變數設定

### 如果遇到 "tsc: not found" 錯誤

這表示 TypeScript 編譯器未安裝。請嘗試以下解決方案：

**方案 1: 使用包含 devDependencies 的建置命令**
將 Build Command 改為：

```bash
CI=false npm ci --include=dev && npm run build
```

**方案 2: 暫時修改 package.json**
將 TypeScript 從 `devDependencies` 移動到 `dependencies`（如果尚未移動）

**方案 3: 使用 start:prod 腳本**
將 Build Command 改為：

```bash
npm ci --production=false && npm run build
```

Run Command 改為：

```bash
npm run start:prod
```

## 常見問題

**Q: 為什麼不能使用 CLI 部署？**
A: 因為需要 GitHub 認證，建議使用控制台部署更簡單。

**Q: 如何更新應用？**
A: 推送代碼到 GitHub 主分支，DigitalOcean 會自動重新部署。

**Q: 如何查看日誌？**
A: 在應用詳情頁面點擊 "Runtime Logs"。

**Q: 如何刪除應用？**
A: 在應用設定頁面點擊 "Destroy Resources"。
