# 🚀 部署前端服務到 Railway

## ❌ 錯誤原因

執行 `railway up --service frontend` 時出現 "Service not found" 錯誤，因為 `frontend` 服務還不存在。

## ✅ 解決方法

### 方法 1：直接部署（自動創建服務）【推薦】

```bash
# 進入前端目錄
cd frontend

# 直接執行 railway up（會自動創建服務）
railway up
```

**注意**：不需要指定 `--service frontend`，Railway 會自動根據目錄名稱創建服務。

### 方法 2：先創建服務，再部署

```bash
# 在專案根目錄執行
railway add --service frontend

# 然後進入前端目錄部署
cd frontend
railway up
```

## 📋 完整部署流程

### 步驟 1：進入前端目錄

```bash
cd frontend
```

### 步驟 2：部署前端（自動創建服務）

```bash
railway up
```

**或使用 detach 模式（背景執行）**：
```bash
railway up --detach
```

### 步驟 3：等待部署完成

部署通常需要 2-5 分鐘。可以查看日誌：

```bash
railway logs
```

### 步驟 4：設定前端環境變數

```bash
# 設定後端 API 網址
railway variables --set "VITE_API_URL=https://backend-production-7ee8.up.railway.app"
railway variables --set "NODE_ENV=production"
```

### 步驟 5：取得前端網址

```bash
railway domain
```

### 步驟 6：更新後端 CORS

```bash
cd ../backend
railway service backend
railway variables --set "FRONTEND_URL=https://YOUR_FRONTEND_URL.up.railway.app"
```

## 🔍 驗證

### 檢查服務狀態

```bash
railway status
```

應該會看到：
```
Project: studentright
Environment: production
Service: frontend
```

### 查看日誌

```bash
railway logs --tail 30
```

### 測試前端

在瀏覽器中訪問前端網址，應該能看到登入頁面。

## 🚨 常見問題

### Q: 部署失敗怎麼辦？

**檢查**：
```bash
# 查看詳細日誌
railway logs --tail 50

# 檢查環境變數
railway variables

# 確認目錄結構
ls -la
```

### Q: 服務名稱不對？

**解決**：
```bash
# 查看當前服務
railway service

# 如果需要，可以重新命名服務（在 Dashboard 中）
railway open
```

### Q: 環境變數未生效？

**解決**：
```bash
# 確認環境變數已設定
railway variables

# 重新部署以套用變數
railway up
```

## 💡 提示

1. **首次部署**：`railway up` 會自動創建服務，不需要手動創建。

2. **服務命名**：Railway 會根據目錄名稱自動命名服務，或使用 `railway add --service <name>` 指定名稱。

3. **部署時間**：前端建置通常需要 2-5 分鐘，請耐心等待。

4. **查看進度**：使用 `railway logs` 即時查看部署進度。

---

**現在執行 `cd frontend && railway up` 即可開始部署！**


