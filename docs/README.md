# 外國學生受教權查核系統

Foreign Student Verification System - 用於管理和追蹤外國學生必要文件的 Web 應用程式。

## 🚀 快速開始

### 本地開發

#### 前置需求
- Node.js 18+
- PostgreSQL 14+
- npm 或 yarn

#### 安裝步驟

```bash
# 1. Clone 專案
git clone <repository-url>
cd InternationalStudent

# 2. 安裝依賴
npm install

# 3. 設定環境變數
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# 編輯 backend/.env 設定資料庫連線等

# 4. 啟動開發伺服器
npm run dev

# 或分別啟動
npm run dev:backend  # 後端 (port 5001)
npm run dev:frontend # 前端 (port 3000)
```

#### 訪問應用程式
- 前端：http://localhost:3000
- 後端 API：http://localhost:5001/api

#### 預設管理員帳號
- 帳號：`admin`
- 密碼：`admin123`（首次登入後請立即修改）

## 📚 功能特色

- 👥 **人員管理** - 管理系統使用者（管理員、單位職員、稽核人員）
- 📚 **學生管理** - 管理外國學生資料和文件
- 📄 **文件管理** - 18種必要文件的上傳和追蹤
- ✅ **文件審核** - 稽核人員可以審核文件狀態
- 📊 **報表統計** - 完整的進度報表和統計
- 🔔 **通知系統** - 自動提醒和通知

## 🏗️ 技術架構

### 前端
- React 18 + TypeScript
- Ant Design UI 框架
- Vite 建置工具
- Zustand 狀態管理

### 後端
- Node.js + Express
- TypeScript
- PostgreSQL 資料庫
- JWT 身份驗證

## 🎯 系統角色

1. **系統管理員 (admin)** - 完整系統權限
2. **單位職員 (unit_staff)** - 上傳所屬單位的文件
3. **稽核人員 (auditor)** - 審核文件狀態（唯讀）

## 📋 必要文件類型

系統管理 18 種必要文件，分別由不同單位負責：

- **全球處**：招生規定、招生簡章、招生網頁、華語能力證明、英文能力證明、財力證明、錄取通知單、入學法規切結書、獎助學金
- **註冊組**：畢業證書、中五生、歷年成績單、學雜費收退費基準
- **實就組**：學生實習合約、畢業流向
- **外語中心**：華語師資
- **宿輔組**：宿舍
- **各系所**：中英文對照學分時數表

## 📞 支援

如有問題，請：
1. 建立 GitHub Issue
2. 聯繫系統管理員

## 📄 授權

MIT License

---

**最後更新**: 2024-10-24
