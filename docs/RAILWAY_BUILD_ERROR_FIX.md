# 🔧 Railway 建置錯誤修復指南

## ❌ 常見建置錯誤

### 錯誤 1：npm ci 失敗

```bash
ERROR: failed to build: failed to solve: process "/bin/sh -c npm ci" did not complete successfully: exit code: 1
```

**原因**：
1. `package.json` 依賴衝突
2. TypeScript 同時在 `dependencies` 和 `devDependencies`
3. npm 版本警告

## ✅ 解決方法

### 1. 修復 package.json 依賴

**問題**：TypeScript 和 @types 套件放錯位置

**修復**：
```json
{
  "dependencies": {
    // 只放運行時需要的套件
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "express": "^4.18.2"
    // 移除 typescript 和 @types/*
  },
  "devDependencies": {
    // 開發和建置時需要的套件
    "@types/express": "^4.17.21",
    "@types/node": "^20.8.10",
    "typescript": "^5.2.2"
  }
}
```

### 2. 更新 nixpacks.toml

**修復前**：
```toml
[phases.install]
cmds = ["npm ci"]
```

**修復後**：
```toml
[phases.install]
cmds = ["npm ci --include=dev"]
```

### 3. 確保建置腳本正確

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "build:deploy": "npm ci --include=dev && npm run build"
  }
}
```

## 🔍 其他常見錯誤

### 錯誤 2：找不到模組

```bash
Error: Cannot find module 'typescript'
```

**解決**：確保 TypeScript 在 `devDependencies` 中

### 錯誤 3：權限錯誤

```bash
EACCES: permission denied
```

**解決**：檢查 Dockerfile 中的使用者權限設定

### 錯誤 4：記憶體不足

```bash
JavaScript heap out of memory
```

**解決**：在 `nixpacks.toml` 中增加記憶體限制：
```toml
[variables]
NODE_OPTIONS = "--max-old-space-size=4096"
```

## 📋 完整的修復檢查清單

- [ ] 移除 `dependencies` 中的 TypeScript 和 @types 套件
- [ ] 確保 `devDependencies` 包含所有建置需要的套件
- [ ] 更新 `nixpacks.toml` 使用 `--include=dev`
- [ ] 檢查 `package-lock.json` 是否存在
- [ ] 確認 Node.js 版本兼容性

## 🚀 測試修復

1. **本地測試**：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Railway 重新部署**：
   ```bash
   git add .
   git commit -m "修復建置錯誤"
   git push origin main
   ```

## ⚠️ 預防措施

1. **依賴分類正確**：
   - `dependencies`：運行時需要
   - `devDependencies`：開發和建置時需要

2. **定期更新**：
   ```bash
   npm audit fix
   npm update
   ```

3. **使用 .npmrc**：
   ```
   engine-strict=true
   save-exact=true
   ```

修復後，Railway 應該能成功建置你的後端服務！
