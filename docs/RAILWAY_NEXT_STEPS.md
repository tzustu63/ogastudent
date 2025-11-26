# 📋 Railway 部署下一步指南

## ✅ 已完成

- ✅ 後端服務已部署
- ✅ 環境變數已設定（DATABASE_URL, JWT_SECRET 等）
- ✅ 後端服務正在重新部署

## 🎯 下一步：完整部署流程

### 步驟 1：確認後端部署成功

```bash
# 查看後端日誌，確認資料庫連線成功
railway service backend
railway logs --tail 50
```

**應該看到**：
- ✅ `資料庫連線成功`
- ✅ `伺服器運行於 http://localhost:5000`
- ✅ 沒有錯誤訊息

**如果還有錯誤**：
- 檢查 `DATABASE_URL` 是否正確設定
- 等待幾分鐘讓服務完全啟動

### 步驟 2：取得後端網址

```bash
# 方法 1：使用 CLI
railway domain

# 方法 2：在 Dashboard 中生成
railway open
# 然後在 Settings → Networking → Generate Domain
```

**記下後端網址**，例如：`https://backend-production-xxxx.up.railway.app`

### 步驟 3：部署前端服務

```bash
# 進入前端目錄
cd frontend

# 部署前端
railway up --service frontend
```

**等待部署完成**（約 2-5 分鐘）

### 步驟 4：設定前端環境變數

```bash
# 在 frontend 目錄下執行
# 將 YOUR_BACKEND_URL 替換為步驟 2 取得的後端網址
railway variables --set "VITE_API_URL=https://YOUR_BACKEND_URL.up.railway.app"
railway variables --set "NODE_ENV=production"
```

**範例**：
```bash
railway variables --set "VITE_API_URL=https://backend-production-xxxx.up.railway.app"
railway variables --set "NODE_ENV=production"
```

### 步驟 5：取得前端網址

```bash
# 取得前端網址
railway domain
```

**記下前端網址**，例如：`https://frontend-production-xxxx.up.railway.app`

### 步驟 6：更新後端 CORS 設定

```bash
# 回到後端目錄
cd ../backend

# 切換到後端服務
railway service backend

# 更新 FRONTEND_URL（將 YOUR_FRONTEND_URL 替換為步驟 5 取得的前端網址）
railway variables --set "FRONTEND_URL=https://YOUR_FRONTEND_URL.up.railway.app"
```

**範例**：
```bash
railway variables --set "FRONTEND_URL=https://frontend-production-xxxx.up.railway.app"
```

### 步驟 7：驗證完整部署

#### 測試後端

```bash
# 測試健康檢查端點
curl https://YOUR_BACKEND_URL.up.railway.app/api/health
```

**預期回應**：
```json
{
  "success": true,
  "message": "外國學生受教權查核系統 API 運行正常",
  "timestamp": "...",
  "uptime": ...,
  "environment": "production",
  "version": "1.0.0"
}
```

#### 測試前端

在瀏覽器中訪問：
```
https://YOUR_FRONTEND_URL.up.railway.app
```

**應該看到**：
- ✅ 登入頁面正常顯示
- ✅ 可以正常登入（預設帳號：`admin`，密碼：`admin123`）

## 📝 完整指令清單（複製貼上）

### 1. 確認後端狀態

```bash
railway service backend
railway logs --tail 30
railway domain
```

### 2. 部署前端

```bash
cd frontend
railway up --service frontend
```

### 3. 設定前端環境變數

```bash
# 將 YOUR_BACKEND_URL 替換為實際後端網址
railway variables --set "VITE_API_URL=https://YOUR_BACKEND_URL.up.railway.app"
railway variables --set "NODE_ENV=production"
railway domain
```

### 4. 更新後端 CORS

```bash
cd ../backend
railway service backend
# 將 YOUR_FRONTEND_URL 替換為實際前端網址
railway variables --set "FRONTEND_URL=https://YOUR_FRONTEND_URL.up.railway.app"
```

### 5. 驗證部署

```bash
# 測試後端
curl https://YOUR_BACKEND_URL.up.railway.app/api/health

# 測試前端（在瀏覽器中）
# https://YOUR_FRONTEND_URL.up.railway.app
```

## 🔍 檢查清單

部署完成後確認：

- [ ] 後端服務正常運行
- [ ] 資料庫連線成功
- [ ] 後端網址已生成
- [ ] 前端服務已部署
- [ ] 前端環境變數已設定（VITE_API_URL）
- [ ] 前端網址已生成
- [ ] 後端 CORS 已更新（FRONTEND_URL）
- [ ] 後端健康檢查端點正常
- [ ] 前端頁面可以正常訪問
- [ ] 可以正常登入系統

## 🚨 常見問題

### Q1: 前端無法連線到後端

**檢查**：
```bash
# 確認前端環境變數
railway service frontend
railway variables | grep VITE_API_URL

# 確認後端 CORS
railway service backend
railway variables | grep FRONTEND_URL
```

### Q2: 後端健康檢查失敗

**檢查**：
```bash
# 查看後端日誌
railway service backend
railway logs --tail 50

# 確認環境變數
railway variables
```

### Q3: 前端顯示空白頁面

**檢查**：
```bash
# 查看前端日誌
railway service frontend
railway logs --tail 50

# 確認建置是否成功
railway logs | grep -i "build\|error"
```

## 💡 提示

1. **網址變更**：每次重新部署，Railway 可能會變更網址。如果網址變了，記得更新環境變數。

2. **環境變數生效時間**：設定環境變數後，服務會自動重新部署，通常需要 1-3 分鐘。

3. **查看詳細日誌**：
   ```bash
   railway logs --tail 100
   ```

4. **開啟 Dashboard**：
   ```bash
   railway open
   ```

## 🎉 完成！

部署完成後，您的應用程式應該可以正常運行了！

**預設管理員帳號**：
- 帳號：`admin`
- 密碼：`admin123`（**首次登入後請立即修改**）

---

**需要協助？查看 `RAILWAY_CLI_DEPLOY.md` 獲取更多資訊！**


