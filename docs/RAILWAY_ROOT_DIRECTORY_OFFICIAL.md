# 🔧 Railway Root Directory 設定 - 官方方法

## 📋 根據官方文件的正確設定方法

基於 Railway 官方文件 ([Deploying a Monorepo](https://docs.railway.com/tutorials/deploying-a-monorepo))，以下是設定 Root Directory 的正確步驟：

## 🚀 步驟 1：建立空白服務

1. 登入 [Railway Dashboard](https://railway.app/dashboard)
2. 點擊 **"+ New Project"** 或 **"⌘ k"**
3. 選擇 **"Empty project"**
4. 點擊 **"+ Create"** 按鈕
5. 選擇 **"Empty Service"**（不要選擇 GitHub repo）

## 🔧 步驟 2：設定服務名稱和 Root Directory

### 2.1 命名服務
1. 右鍵點擊服務
2. 選擇重新命名
3. 輸入服務名稱（例如：`backend`）

### 2.2 設定 Root Directory
1. 點擊服務進入服務頁面
2. 點擊 **"Settings"** 標籤
3. 找到 **"Root Directory"** 欄位
4. 輸入：`backend`
5. 點擊 **"Deploy"** 或按 **"⇧ Enter"** 儲存

## 📂 步驟 3：連接 GitHub Repository

1. 在同一個 Settings 頁面
2. 找到 **"Source Repo"** 或類似的連接選項
3. 選擇你的 GitHub repository
4. 點擊 **"Deploy"** 或按 **"⇧ Enter"**

## ✅ 驗證設定

設定完成後，在 Build Logs 中你應該看到：

```bash
context: backend/
Using Nixpacks
setup      │ nodejs_18, npm-9_x
install    │ npm ci
build      │ npm run build  
start      │ npm start
```

## 🎯 完整的服務配置

### 後端服務
```
Service Name: backend
Root Directory: backend
Build Command: npm run build (自動偵測)
Start Command: npm start (自動偵測)
```

### 前端服務
```
Service Name: frontend  
Root Directory: frontend
Build Command: npm run build (自動偵測)
Start Command: npx serve -s dist -l $PORT
```

## 📸 官方文件截圖說明

根據官方文件，設定畫面應該如下：

1. **Frontend Root Directory 設定**：
   - 路徑：`/frontend`
   - 位置：Service Settings 頁面

2. **Backend Root Directory 設定**：
   - 路徑：`/backend`  
   - 位置：Service Settings 頁面

## ⚠️ 重要注意事項

1. **先建立空白服務**：不要直接從 GitHub repo 部署
2. **設定 Root Directory 後再連接 repo**：這樣確保設定正確
3. **使用相對路徑**：輸入 `backend` 而不是 `/backend`
4. **按 Deploy 儲存**：設定後必須點擊 Deploy 或按 ⇧ Enter

## 🔍 如果找不到 Root Directory 設定

如果在 Settings 中找不到 Root Directory 欄位：

1. **確認服務類型**：確保是 Empty Service，不是 Database
2. **重新整理頁面**：有時需要重新載入
3. **檢查權限**：確認你是專案擁有者
4. **使用新版介面**：確保使用最新的 Railway Dashboard

## 📋 完整部署流程

1. 建立空白專案
2. 建立空白服務並命名
3. 設定 Root Directory
4. 連接 GitHub repository
5. 設定環境變數
6. 生成網域
7. 測試部署

## 🚨 常見錯誤

**錯誤**：直接從 GitHub repo 部署
**結果**：無法設定 Root Directory
**解決**：先建立空白服務，設定後再連接 repo

**錯誤**：設定後沒有點擊 Deploy
**結果**：設定未儲存
**解決**：設定完成後必須點擊 Deploy 按鈕

根據官方文件，這是 Railway 推薦的 monorepo 部署方式！
