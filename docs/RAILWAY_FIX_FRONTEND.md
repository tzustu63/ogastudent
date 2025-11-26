# 🔧 修復前端部署問題

## ❌ 問題

前端部署時出現資料庫連線錯誤，因為：
- Railway 從專案根目錄執行
- 讀取到根目錄的 `package.json`，其中 `start` 命令是 `cd backend && npm start`
- 導致前端服務嘗試啟動後端，但沒有 `DATABASE_URL`

## ✅ 解決方法

### 方法 1：在 Dashboard 中設定 Root Directory（推薦）

1. **開啟 Railway Dashboard**：
   ```bash
   railway open
   ```

2. **找到前端服務**（應該叫 `frontend` 或類似的名稱）

3. **進入服務設定**：
   - 點擊前端服務
   - 進入 **Settings** → **Service**

4. **設定 Root Directory**：
   - 找到 **Root Directory** 設定
   - 輸入：`frontend`
   - 儲存

5. **重新部署**：
   - 服務會自動重新部署
   - 或手動觸發：點擊 **"Redeploy"**

### 方法 2：使用 Railway CLI 設定

如果 Railway CLI 支援設定 Root Directory：

```bash
# 切換到前端服務
railway service frontend

# 重新部署（確保在 frontend 目錄執行）
cd frontend
railway up
```

### 方法 3：修改配置確保正確執行

確保 `frontend/railway.json` 和 `frontend/nixpacks.toml` 配置正確：

**frontend/railway.json**（已正確）：
```json
{
  "deploy": {
    "startCommand": "npx serve -s dist -l $PORT"
  }
}
```

**frontend/nixpacks.toml**（已正確）：
```toml
[start]
cmd = "npx serve -s dist -l $PORT"
```

## 📋 完整修復步驟

### 步驟 1：在 Dashboard 中設定 Root Directory

1. 訪問 Railway Dashboard
2. 找到前端服務
3. Settings → Service → Root Directory → 設為 `frontend`
4. 儲存並重新部署

### 步驟 2：確認部署成功

```bash
# 查看前端日誌
railway service frontend
railway logs
```

應該看到：
- ✅ `serve` 啟動訊息
- ✅ 沒有資料庫連線錯誤
- ✅ 服務運行在正確的 Port

### 步驟 3：設定前端環境變數

```bash
railway service frontend
railway variables --set "VITE_API_URL=https://backend-production-7ee8.up.railway.app"
railway variables --set "NODE_ENV=production"
```

### 步驟 4：取得前端網址

```bash
railway domain
```

### 步驟 5：更新後端 CORS

```bash
cd ../backend
railway service backend
railway variables --set "FRONTEND_URL=https://YOUR_FRONTEND_URL.up.railway.app"
```

## 🔍 驗證

### 檢查前端服務

```bash
railway service frontend
railway logs --tail 20
```

**應該看到**：
```
Serving!
- Local:    http://localhost:PORT
- Network:  http://0.0.0.0:PORT
```

**不應該看到**：
- ❌ 資料庫連線錯誤
- ❌ `cd backend && npm start`
- ❌ 後端相關的錯誤

### 測試前端

在瀏覽器中訪問前端網址，應該能看到登入頁面。

## 🚨 如果還有問題

### 問題 1：Root Directory 設定無效

**解決**：
1. 確認服務名稱正確
2. 刪除服務並重新創建
3. 或使用 Dashboard 手動設定

### 問題 2：仍然執行後端

**檢查**：
```bash
# 查看當前服務的配置
railway status
railway variables

# 確認 railway.json 是否生效
cat frontend/railway.json
```

### 問題 3：建置失敗

**檢查**：
```bash
railway logs | grep -i "build\|error"
```

---

**最重要：在 Dashboard 中設定 Root Directory 為 `frontend`！**


