# 🔧 Railway CLI 故障排除指南

## 常見錯誤與解決方法

### 錯誤 1: "No service linked"

**錯誤訊息**：
```
No service linked
Run `railway service` to link a service
```

**原因**：
- 在服務目錄下執行命令，但服務尚未連結
- 需要在專案層級或服務層級正確執行命令

**解決方法**：

#### 方法 1：在專案根目錄執行資料庫添加

```bash
# 回到專案根目錄
cd /path/to/your/project

# 確認專案已連結
railway status

# 在專案根目錄添加資料庫
railway add --database postgres
```

#### 方法 2：先部署服務，再添加資料庫

```bash
# 1. 先部署後端服務（會自動創建服務）
cd backend
railway up

# 2. 回到專案根目錄添加資料庫
cd ..
railway add --database postgres
```

#### 方法 3：在 Dashboard 中手動添加

1. 訪問 Railway Dashboard: `railway open`
2. 在專案中點擊 **"New"**
3. 選擇 **"Database"** → **"Add PostgreSQL"**

### 錯誤 2: "資料庫添加失敗"

**原因**：
- 專案未連結
- 權限不足
- Railway API 暫時無法使用

**解決方法**：

```bash
# 1. 確認專案狀態
railway status

# 2. 如果未連結，先連結專案
railway link

# 3. 再次嘗試添加資料庫
railway add --database postgres

# 4. 如果還是失敗，檢查 Railway 狀態
railway whoami
```

### 錯誤 3: "Service not found"

**錯誤訊息**：
```
Service: None
```

**解決方法**：

```bash
# 1. 查看所有服務
railway service

# 2. 如果沒有服務，先部署創建服務
cd backend
railway up

# 3. 或手動創建服務
railway service create backend
```

### 錯誤 4: 環境變數設定失敗

**原因**：
- 服務未連結
- 在錯誤的目錄執行

**解決方法**：

```bash
# 1. 確認當前服務
railway service

# 2. 如果沒有服務，先連結
cd backend
railway service backend

# 3. 然後設定環境變數
railway variables set KEY=value
```

## 📋 正確的部署流程

### 推薦流程

```bash
# 步驟 1: 初始化專案（在專案根目錄）
railway init

# 步驟 2: 添加資料庫（在專案根目錄）
railway add --database postgres

# 步驟 3: 部署後端（在 backend 目錄）
cd backend
railway up

# 步驟 4: 設定後端環境變數（在 backend 目錄）
railway variables set JWT_SECRET=your-secret

# 步驟 5: 部署前端（在 frontend 目錄）
cd ../frontend
railway up --service frontend

# 步驟 6: 設定前端環境變數（在 frontend 目錄）
railway variables set VITE_API_URL=https://your-backend.up.railway.app
```

## 🔍 診斷命令

### 檢查專案狀態

```bash
# 查看專案資訊
railway status

# 查看當前使用者
railway whoami

# 查看所有服務
railway service

# 查看環境變數
railway variables
```

### 檢查服務狀態

```bash
# 查看服務日誌
railway logs

# 查看部署狀態
railway status

# 開啟 Dashboard
railway open
```

## 🛠️ 手動修復步驟

### 情況 1: 專案未連結

```bash
# 連結到現有專案
railway link

# 或初始化新專案
railway init
```

### 情況 2: 服務未連結

```bash
# 查看可用服務
railway service

# 連結到特定服務
railway service <service-name>

# 或創建新服務
railway service create <service-name>
```

### 情況 3: 資料庫未添加

```bash
# 方法 1: 在專案根目錄執行
cd /path/to/project/root
railway add --database postgres

# 方法 2: 在 Dashboard 中手動添加
railway open
# 然後在 Dashboard 中點擊 "New" → "Database" → "Add PostgreSQL"
```

## 💡 最佳實踐

### 1. 始終在正確的目錄執行命令

- **專案層級操作**（添加資料庫、查看專案狀態）：在專案根目錄
- **服務層級操作**（部署、設定環境變數）：在服務目錄（backend/frontend）

### 2. 確認專案和服務狀態

```bash
# 在執行任何操作前，先檢查狀態
railway status
railway service
```

### 3. 使用 Dashboard 作為備選方案

如果 CLI 遇到問題，可以使用 Dashboard：

```bash
# 開啟 Dashboard
railway open
```

### 4. 檢查日誌

```bash
# 查看詳細日誌以了解錯誤原因
railway logs

# 查看特定服務的日誌
railway logs --service backend
```

## 🚨 緊急修復

如果所有方法都失敗：

1. **重置 Railway 連結**：
```bash
# 取消連結
railway unlink

# 重新連結
railway link
```

2. **使用 Dashboard**：
```bash
railway open
# 在 Dashboard 中手動操作
```

3. **檢查 Railway 狀態**：
訪問 https://status.railway.app 檢查服務狀態

## 📞 獲取幫助

- Railway 文件: https://docs.railway.app
- Railway CLI 文件: https://docs.railway.app/develop/cli
- Railway Discord: https://discord.gg/railway

---

**記住**：大多數問題都是因為在錯誤的目錄執行命令或服務未正確連結。確保在正確的目錄執行命令！


