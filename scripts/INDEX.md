# 🔧 腳本索引

## 🚀 部署相關腳本

### Railway 部署
- [auto-deploy-railway.sh](./auto-deploy-railway.sh) - Railway 自動部署腳本
- [deploy-railway-cli.sh](./deploy-railway-cli.sh) - Railway CLI 部署腳本（主要）
- [deploy-railway.sh](./deploy-railway.sh) - Railway 部署輔助腳本

### DigitalOcean 部署
- [deploy-digitalocean.sh](./deploy-digitalocean.sh) - DigitalOcean 部署腳本
- [deploy-digitalocean-docker.sh](./deploy-digitalocean-docker.sh) - DigitalOcean Docker 部署
- [deploy-droplet.sh](./deploy-droplet.sh) - Droplet 部署腳本
- [test-digitalocean-config.sh](./test-digitalocean-config.sh) - DigitalOcean 配置測試

### 通用部署
- [auto-deploy.sh](./auto-deploy.sh) - 自動部署腳本
- [deploy-app.sh](./deploy-app.sh) - 應用程式部署腳本
- [deploy-to-github.sh](./deploy-to-github.sh) - GitHub 部署腳本
- [deploy.sh](./deploy.sh) - 通用部署腳本

## 🗄️ 資料庫相關腳本

### 資料庫管理
- [init-database.sh](./init-database.sh) - 初始化資料庫
- [backup-database.sh](./backup-database.sh) - 資料庫備份
- [restore-database.sh](./restore-database.sh) - 資料庫還原
- [reset-database.sh](./reset-database.sh) - 重置資料庫

### 編碼修復
- [fix-database-encoding.sh](./fix-database-encoding.sh) - 修復資料庫編碼
- [fix-database-encoding-v2.sh](./fix-database-encoding-v2.sh) - 資料庫編碼修復 v2
- [complete-encoding-fix.sh](./complete-encoding-fix.sh) - 完整編碼修復
- [fix-encoding-and-restart.sh](./fix-encoding-and-restart.sh) - 修復編碼並重啟

## 🔍 監控和測試腳本

### 系統監控
- [health-check.sh](./health-check.sh) - 健康檢查腳本
- [monitor-deployment.sh](./monitor-deployment.sh) - 部署監控腳本

### 測試和驗證
- [test-download.sh](./test-download.sh) - 下載測試腳本
- [verify-fix.sh](./verify-fix.sh) - 修復驗證腳本

## 🛠️ 系統管理腳本

- [install-server.sh](./install-server.sh) - 伺服器安裝腳本

## 📋 使用說明

### 執行腳本前的準備

1. **確保腳本有執行權限**：
   ```bash
   chmod +x scripts/script-name.sh
   ```

2. **從專案根目錄執行**：
   ```bash
   ./scripts/script-name.sh
   ```

### 主要腳本使用指南

#### Railway 部署
```bash
# 使用 CLI 部署（推薦）
./scripts/deploy-railway-cli.sh

# 自動部署到 Railway
./scripts/auto-deploy-railway.sh
```

#### 資料庫管理
```bash
# 初始化資料庫
./scripts/init-database.sh

# 備份資料庫
./scripts/backup-database.sh

# 修復編碼問題
./scripts/fix-database-encoding.sh
```

#### 系統監控
```bash
# 健康檢查
./scripts/health-check.sh

# 監控部署
./scripts/monitor-deployment.sh
```

### 腳本分類

- **🚀 部署腳本**：用於將應用程式部署到各種平台
- **🗄️ 資料庫腳本**：管理資料庫操作和維護
- **🔍 監控腳本**：監控系統狀態和性能
- **🛠️ 管理腳本**：系統安裝和配置

### 注意事項

1. **執行前檢查**：執行腳本前請先閱讀腳本內容
2. **環境變數**：某些腳本需要設定環境變數
3. **權限要求**：部分腳本可能需要 sudo 權限
4. **備份重要**：執行資料庫相關腳本前請先備份

### 腳本維護

- 所有腳本都保存在 `scripts/` 資料夾中
- 新增腳本時請更新此索引檔案
- 建議為新腳本添加適當的註釋和使用說明
