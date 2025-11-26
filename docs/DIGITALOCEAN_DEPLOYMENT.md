# DigitalOcean App Platform 部署指南

## 🚀 外國學生受教權查核系統 - DigitalOcean 部署

本指南將幫助您將外國學生受教權查核系統部署到 DigitalOcean App Platform。

## 📋 前置需求

### 1. DigitalOcean 帳戶

- 註冊 [DigitalOcean](https://cloud.digitalocean.com/) 帳戶
- 準備信用卡或 PayPal 進行付款

### 2. GitHub 倉庫

- 確保程式碼已推送到 GitHub 倉庫：`https://github.com/tzustu63/ogastudent`
- 確保倉庫是公開的（或已連接 DigitalOcean）

### 3. 本地工具

- 安裝 [DigitalOcean CLI (doctl)](https://docs.digitalocean.com/reference/doctl/how-to/install/)

```bash
# macOS
brew install doctl

# Linux
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.94.0/doctl-1.94.0-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin/

# Windows
# 從 https://github.com/digitalocean/doctl/releases 下載
```

## 💰 成本估算

使用最便宜的測試方案：

| 服務       | 規格                  | 月費       |
| ---------- | --------------------- | ---------- |
| 前端服務   | basic-xxs (512MB RAM) | $5         |
| 後端服務   | basic-xxs (512MB RAM) | $5         |
| PostgreSQL | db-s-1vcpu-1gb        | $15        |
| Redis      | db-s-1vcpu-1gb        | $15        |
| **總計**   |                       | **$40/月** |

## 🛠️ 部署步驟

### 步驟 1: 登入 DigitalOcean

```bash
doctl auth init
```

輸入您的 DigitalOcean API Token。

### 步驟 2: 執行一鍵部署

```bash
# 確保在專案根目錄
cd /path/to/InternationalStudent

# 執行部署腳本
./deploy-digitalocean.sh
```

### 步驟 3: 監控部署進度

```bash
# 查看應用狀態
doctl apps list

# 查看特定應用詳情
doctl apps get YOUR_APP_ID

# 查看部署日誌
doctl apps logs YOUR_APP_ID
```

## 📁 專案結構

```
InternationalStudent/
├── .do/
│   └── app.yaml              # DigitalOcean App Platform 配置
├── backend/                  # 後端服務
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── frontend/                 # 前端服務
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── deploy-digitalocean.sh    # 一鍵部署腳本
└── digitalocean.env.example  # 環境變數範例
```

## ⚙️ 配置說明

### App Platform 配置 (.do/app.yaml)

- **服務**: 前端 + 後端
- **資料庫**: PostgreSQL 15 + Redis 7
- **實例大小**: basic-xxs (最便宜)
- **區域**: sfo3 (舊金山)

### 環境變數

所有必要的環境變數都會在 `.do/app.yaml` 中自動設定：

- 資料庫連線資訊
- Redis 連線資訊
- 服務間通訊 URL
- CORS 設定

## 🔧 自訂配置

### 修改實例大小

編輯 `.do/app.yaml`：

```yaml
services:
  - name: backend
    instance_size_slug: basic-xs # 改為 1GB RAM
```

### 修改資料庫大小

```yaml
databases:
  - name: postgres-db
    size: db-s-2vcpu-2gb # 改為 2GB RAM
```

### 添加自訂環境變數

在 `.do/app.yaml` 的 `envs` 區段添加：

```yaml
envs:
  - key: CUSTOM_VAR
    value: "your-value"
```

## 🚨 故障排除

### 常見問題

1. **部署失敗**

   ```bash
   # 查看詳細日誌
   doctl apps logs YOUR_APP_ID --follow
   ```

2. **資料庫連線失敗**

   - 檢查資料庫是否已創建
   - 確認環境變數設定正確

3. **CORS 錯誤**
   - 檢查 `CORS_ORIGIN` 環境變數
   - 確認前端 URL 設定正確

### 檢查服務狀態

```bash
# 檢查所有服務
doctl apps get YOUR_APP_ID --format "Spec.Services[*].Name,Spec.Services[*].LiveURL"

# 檢查資料庫
doctl databases list

# 檢查應用日誌
doctl apps logs YOUR_APP_ID --type run
```

## 📊 監控和管理

### 查看應用狀態

```bash
# 列出所有應用
doctl apps list

# 查看特定應用
doctl apps get YOUR_APP_ID

# 查看部署歷史
doctl apps list-deployments YOUR_APP_ID
```

### 查看日誌

```bash
# 查看所有日誌
doctl apps logs YOUR_APP_ID

# 查看特定服務日誌
doctl apps logs YOUR_APP_ID --type run --component backend

# 即時監控日誌
doctl apps logs YOUR_APP_ID --follow
```

### 重新部署

```bash
# 觸發重新部署
doctl apps create-deployment YOUR_APP_ID --force-rebuild
```

## 🔄 更新應用

### 自動更新

當您推送程式碼到 GitHub 主分支時，DigitalOcean 會自動重新部署。

### 手動更新

```bash
# 重新部署
doctl apps create-deployment YOUR_APP_ID --force-rebuild
```

## 🗑️ 清理資源

### 刪除應用

```bash
# 刪除整個應用（包括資料庫）
doctl apps delete YOUR_APP_ID

# 確認刪除
doctl apps delete YOUR_APP_ID --force
```

### 刪除資料庫

```bash
# 列出資料庫
doctl databases list

# 刪除特定資料庫
doctl databases delete DATABASE_ID
```

## 📞 支援

如果遇到問題：

1. 查看 [DigitalOcean 文檔](https://docs.digitalocean.com/products/app-platform/)
2. 檢查應用日誌
3. 聯繫 DigitalOcean 支援

## 🎯 下一步

部署完成後：

1. 測試所有功能
2. 設定自訂域名（可選）
3. 配置 SSL 憑證（自動）
4. 設定監控和警報
5. 備份資料庫

---

**注意**: 這是測試環境配置，生產環境請使用更大的實例和適當的安全設定。
