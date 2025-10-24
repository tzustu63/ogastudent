# GitHub 設定指南

## 📋 推送到 GitHub 的步驟

### 步驟 1：初始化 Git（如果還沒有）

```bash
# 在專案根目錄執行
git init
```

### 步驟 2：添加所有檔案

```bash
# 添加所有檔案到 Git
git add .

# 查看將要提交的檔案
git status
```

### 步驟 3：提交變更

```bash
# 提交變更
git commit -m "初始提交：準備 Railway 部署"
```

### 步驟 4：在 GitHub 創建新的 Repository

1. 訪問 [GitHub](https://github.com)
2. 點擊右上角的 **"+"** → **"New repository"**
3. 填寫 Repository 資訊：
   - **Repository name**: `foreign-student-verification-system`（或您喜歡的名稱）
   - **Description**: `外國學生受教權查核系統`
   - **Visibility**: 選擇 **Private**（建議）或 Public
   - **不要**勾選 "Initialize this repository with a README"
4. 點擊 **"Create repository"**

### 步驟 5：連接到 GitHub Repository

GitHub 會顯示指令，複製並執行：

```bash
# 添加遠端 repository（替換成您的 GitHub 使用者名稱和 repo 名稱）
git remote add origin https://github.com/your-username/foreign-student-verification-system.git

# 設定主分支名稱
git branch -M main

# 推送到 GitHub
git push -u origin main
```

### 步驟 6：驗證推送成功

重新整理 GitHub 頁面，您應該能看到所有檔案已經上傳。

## 🔐 使用 SSH（可選，更安全）

如果您想使用 SSH 而不是 HTTPS：

### 1. 生成 SSH Key（如果還沒有）

```bash
# 生成 SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# 啟動 ssh-agent
eval "$(ssh-agent -s)"

# 添加 SSH key
ssh-add ~/.ssh/id_ed25519
```

### 2. 添加 SSH Key 到 GitHub

```bash
# 複製 SSH public key
cat ~/.ssh/id_ed25519.pub
```

1. 訪問 GitHub → **Settings** → **SSH and GPG keys**
2. 點擊 **"New SSH key"**
3. 貼上您的 public key
4. 點擊 **"Add SSH key"**

### 3. 使用 SSH URL

```bash
# 如果已經使用 HTTPS，可以切換到 SSH
git remote set-url origin git@github.com:your-username/foreign-student-verification-system.git

# 推送
git push -u origin main
```

## 🔄 後續更新

當您修改程式碼後，使用以下指令推送更新：

```bash
# 查看變更
git status

# 添加變更的檔案
git add .

# 提交變更
git commit -m "描述您的變更"

# 推送到 GitHub
git push
```

## ⚠️ 重要提醒

### 不要提交敏感資訊

確保以下檔案**不會**被提交到 Git：

- ✅ `.env` 檔案已在 `.gitignore` 中
- ✅ `node_modules/` 已在 `.gitignore` 中
- ✅ `uploads/` 已在 `.gitignore` 中
- ✅ `dist/` 已在 `.gitignore` 中

### 檢查 .gitignore

```bash
# 查看 .gitignore 內容
cat .gitignore

# 確認敏感檔案不會被追蹤
git status
```

如果不小心提交了敏感資訊：

```bash
# 從 Git 歷史中移除檔案（但保留本地檔案）
git rm --cached .env

# 提交變更
git commit -m "移除敏感檔案"

# 推送
git push
```

## 🎯 下一步

完成 GitHub 設定後，請參考 [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) 進行 Railway 部署。

## 💡 常見問題

### Q: 推送時要求輸入帳號密碼？

GitHub 已不再支援密碼驗證，請使用：
1. **Personal Access Token (PAT)**：在 GitHub Settings → Developer settings → Personal access tokens 創建
2. **SSH Key**：參考上方 SSH 設定步驟

### Q: 推送失敗：Permission denied

確認：
1. Repository 的 URL 是否正確
2. 您是否有該 repository 的寫入權限
3. 如果使用 SSH，確認 SSH key 已正確設定

### Q: 如何查看遠端 repository？

```bash
# 查看遠端 repository
git remote -v
```

### Q: 如何更改遠端 repository URL？

```bash
# 更改 URL
git remote set-url origin <new-url>
```

---

**準備好了嗎？** 完成後繼續 [Railway 部署](./RAILWAY_DEPLOYMENT.md)！
