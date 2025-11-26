# 🔧 Railway Build 和 Start Commands 設定指南

## 📋 設定選項說明

### 1. Custom Build Command
**用途**：覆蓋預設的建置命令
**何時使用**：當你需要自訂建置流程時

### 2. Watch Paths
**用途**：設定哪些檔案變更時觸發重新部署
**何時使用**：Monorepo 中只想監控特定資料夾

### 3. Custom Start Command / Start Command
**用途**：設定啟動應用程式的命令
**何時使用**：當預設啟動命令不正確時

## 🎯 你的專案設定

### 後端服務 (backend) 設定

#### ✅ 推薦設定（使用預設）
```
Custom Build Command: (留空)
Watch Paths: (留空)
Custom Start Command: (留空)
```

**原因**：
- Nixpacks 會自動偵測 `npm run build` 和 `npm start`
- Root Directory 已設為 `backend`，會自動監控該資料夾
- 預設設定通常最穩定

#### 🔧 進階設定（如果需要）
```
Custom Build Command: npm run build
Watch Paths: backend/**
Custom Start Command: npm start
```

### 前端服務 (frontend) 設定

#### ✅ 推薦設定
```
Custom Build Command: (留空)
Watch Paths: (留空)  
Custom Start Command: npx serve -s dist -l $PORT
```

**重要**：前端需要設定 Custom Start Command，因為預設的 `npm start` 會執行錯誤的命令。

#### 🔧 完整設定
```
Custom Build Command: npm run build
Watch Paths: frontend/**
Custom Start Command: npx serve -s dist -l $PORT
```

## 📝 詳細設定步驟

### 步驟 1：後端服務設定

1. 點擊 `backend` 服務
2. 進入 **"Settings"** 標籤
3. 找到 **"Build & Deploy"** 區塊
4. 設定如下：

```
Custom Build Command: (留空，讓 Nixpacks 自動偵測)
Watch Paths: (留空，會監控整個 backend/ 資料夾)
Custom Start Command: (留空，使用 npm start)
```

5. 點擊 **"Save"** 或 **"Deploy"**

### 步驟 2：前端服務設定

1. 點擊 `frontend` 服務
2. 進入 **"Settings"** 標籤
3. 找到 **"Build & Deploy"** 區塊
4. **重要設定**：

```
Custom Build Command: (留空)
Watch Paths: (留空)
Custom Start Command: npx serve -s dist -l $PORT
```

5. 點擊 **"Save"** 或 **"Deploy"**

## 🔍 為什麼這樣設定？

### 後端 (留空的原因)
- **Build Command**：`nixpacks.toml` 已經定義了 `npm run build`
- **Watch Paths**：Root Directory 設為 `backend`，自動監控
- **Start Command**：`package.json` 中的 `npm start` 已經正確

### 前端 (需要設定 Start Command)
- **Build Command**：讓 Nixpacks 自動偵測 `npm run build`
- **Watch Paths**：Root Directory 設為 `frontend`，自動監控
- **Start Command**：必須設定 `npx serve -s dist -l $PORT`，因為預設會執行錯誤的命令

## ⚠️ 常見錯誤

### 錯誤 1：前端不設定 Start Command
**結果**：會執行根目錄的 `npm start`，啟動後端程式
**解決**：設定 `npx serve -s dist -l $PORT`

### 錯誤 2：設定了不必要的 Build Command
**結果**：可能覆蓋 Nixpacks 的最佳化設定
**建議**：除非必要，否則留空

### 錯誤 3：Watch Paths 設定錯誤
**結果**：檔案變更時不會觸發部署
**解決**：留空讓 Railway 自動處理

## 📋 設定檢查清單

### 後端服務檢查
- [ ] Root Directory: `backend`
- [ ] Custom Build Command: (留空)
- [ ] Watch Paths: (留空)
- [ ] Custom Start Command: (留空)

### 前端服務檢查
- [ ] Root Directory: `frontend`
- [ ] Custom Build Command: (留空)
- [ ] Watch Paths: (留空)
- [ ] Custom Start Command: `npx serve -s dist -l $PORT`

## 🚀 驗證設定正確

### 後端驗證
1. 部署後查看 Build Logs
2. 應該看到：
```bash
npm run build  # 建置階段
npm start      # 啟動階段
```

### 前端驗證
1. 部署後查看 Build Logs
2. 應該看到：
```bash
npm run build                    # 建置階段
npx serve -s dist -l $PORT      # 啟動階段
```

## 🔧 進階設定（可選）

如果你需要更精確的控制：

### 後端進階設定
```
Custom Build Command: npm ci --include=dev && npm run build
Watch Paths: backend/**/*.ts,backend/package.json
Custom Start Command: node dist/index.js
```

### 前端進階設定
```
Custom Build Command: npm ci && npm run build
Watch Paths: frontend/src/**,frontend/package.json
Custom Start Command: npx serve -s dist -l $PORT
```

## 📝 總結

**簡單設定（推薦）**：
- 後端：全部留空
- 前端：只設定 Start Command

**為什麼這樣最好**：
- 讓 Railway 和 Nixpacks 自動處理大部分設定
- 減少出錯機會
- 更容易維護

設定完成後，你的服務應該能正確建置和啟動！
