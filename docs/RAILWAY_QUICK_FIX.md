# 🚀 Railway 快速修復指南

## ✅ 已完成的修復

環境變數已成功設定到後端服務：
- ✅ `DATABASE_URL` - 資料庫連線字串
- ✅ `JWT_SECRET` - JWT 密鑰
- ✅ `JWT_EXPIRES_IN` - JWT 過期時間
- ✅ `NODE_ENV` - 環境變數
- ✅ `PORT` - 服務埠號
- ✅ `MAX_FILE_SIZE` - 檔案大小限制
- ✅ `UPLOAD_DIR` - 上傳目錄

## 📋 下一步

### 1. 等待部署完成

後端服務會自動重新部署。查看日誌：

```bash
railway logs
```

應該會看到：
- ✅ 資料庫連線成功
- ✅ 伺服器運行於 http://localhost:5000

### 2. 取得後端網址

```bash
railway domain
```

或在 Dashboard 中：
```bash
railway open
```

在 **Settings** → **Networking** 中生成網域。

### 3. 部署前端

```bash
cd ../frontend
railway up --service frontend
```

### 4. 設定前端環境變數

```bash
railway variables --set "VITE_API_URL=https://YOUR_BACKEND_URL.up.railway.app"
railway variables --set "NODE_ENV=production"
```

### 5. 更新後端 CORS

```bash
cd ../backend
railway variables --set "FRONTEND_URL=https://YOUR_FRONTEND_URL.up.railway.app"
```

## 🔍 驗證部署

### 檢查後端

```bash
# 查看日誌
railway logs

# 測試健康檢查
curl https://YOUR_BACKEND_URL.up.railway.app/api/health
```

### 檢查前端

```bash
# 訪問前端網址
https://YOUR_FRONTEND_URL.up.railway.app
```

## 🚨 如果還有問題

### 資料庫連線失敗

```bash
# 確認 DATABASE_URL 已設定
railway variables | grep DATABASE_URL

# 如果沒有，從 Postgres 服務複製
railway service Postgres
railway variables | grep DATABASE_URL

# 然後設定到後端
railway service backend
railway variables --set "DATABASE_URL=YOUR_DATABASE_URL"
```

### 服務無法啟動

```bash
# 查看詳細日誌
railway logs --tail 50

# 檢查環境變數
railway variables

# 重新部署
railway up
```

## 📝 常用指令

```bash
# 查看服務狀態
railway status

# 查看環境變數
railway variables

# 查看日誌
railway logs

# 開啟 Dashboard
railway open

# 重新部署
railway up
```

---

**🎉 修復完成！後端服務應該可以正常連線到資料庫了！**


