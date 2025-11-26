# 🚀 DigitalOcean 快速部署指南

## 外國學生受教權查核系統 - 一鍵部署到 DigitalOcean

### ✅ 已完成的配置

1. **✅ App Platform 配置** - `.do/app.yaml`
2. **✅ 部署腳本** - `deploy-digitalocean.sh`
3. **✅ 環境變數配置** - 自動設定
4. **✅ CORS 配置** - 支援 DigitalOcean 環境
5. **✅ 健康檢查** - 後端 API 健康檢查端點
6. **✅ 測試腳本** - `test-digitalocean-config.sh`

### 💰 成本（最便宜測試方案）

- **前端服務**: $5/月 (512MB RAM)
- **後端服務**: $5/月 (512MB RAM)
- **PostgreSQL**: $15/月 (1GB RAM)
- **Redis**: $15/月 (1GB RAM)
- **總計**: **$40/月**

### 🛠️ 部署步驟

#### 1. 安裝 DigitalOcean CLI

```bash
# macOS
brew install doctl

# Linux
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin/
```

#### 2. 登入 DigitalOcean

```bash
doctl auth init
```

輸入您的 DigitalOcean API Token。

#### 3. 測試配置

```bash
./test-digitalocean-config.sh
```

#### 4. 一鍵部署

```bash
./deploy-digitalocean.sh
```

### 📊 監控部署

```bash
# 查看應用狀態
doctl apps list

# 查看部署日誌
doctl apps logs YOUR_APP_ID

# 查看應用詳情
doctl apps get YOUR_APP_ID
```

### 🌐 訪問應用

部署完成後，您將獲得：

- **前端網址**: `https://your-app-name.ondigitalocean.app`
- **後端 API**: `https://your-app-name.ondigitalocean.app/api`
- **健康檢查**: `https://your-app-name.ondigitalocean.app/api/health`

### 🔧 配置說明

#### 服務配置

- **前端**: React + Vite，使用 `serve` 提供靜態檔案
- **後端**: Node.js + Express，支援 TypeScript
- **資料庫**: PostgreSQL 15 + Redis 7
- **區域**: sfo3 (舊金山)

#### 環境變數

所有環境變數都會自動設定：

- 資料庫連線資訊
- Redis 連線資訊
- 服務間通訊 URL
- CORS 設定

### 🚨 故障排除

#### 常見問題

1. **部署失敗**

   ```bash
   doctl apps logs YOUR_APP_ID --follow
   ```

2. **資料庫連線失敗**

   - 檢查資料庫是否已創建
   - 確認環境變數設定

3. **CORS 錯誤**
   - 檢查 `CORS_ORIGIN` 環境變數
   - 確認前端 URL 設定

### 🔄 更新應用

當您推送程式碼到 GitHub 主分支時，DigitalOcean 會自動重新部署。

手動重新部署：

```bash
doctl apps create-deployment YOUR_APP_ID --force-rebuild
```

### 🗑️ 清理資源

刪除整個應用：

```bash
doctl apps delete YOUR_APP_ID --force
```

### 📞 支援

- [DigitalOcean 文檔](https://docs.digitalocean.com/products/app-platform/)
- [專案 GitHub](https://github.com/tzustu63/ogastudent)

---

**準備好了嗎？執行 `./deploy-digitalocean.sh` 開始部署！** 🚀
