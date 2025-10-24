# Render MCP 伺服器設定指南

## ✅ 已完成的步驟

1. ✅ 安裝 `uv` 和 `uvx` 工具
2. ✅ 創建 MCP 配置檔案：`.kiro/settings/mcp.json`

## 📋 接下來的步驟

### 步驟 1：取得 Render API Key

1. 訪問 Render Dashboard：https://dashboard.render.com
2. 點擊右上角你的**頭像**或**帳號名稱**
3. 選擇 **"Account Settings"**
4. 在左側選單點擊 **"API Keys"**
5. 點擊 **"Create API Key"** 按鈕
6. 給 API Key 一個名稱（例如：`Kiro MCP`）
7. 點擊 **"Create"**
8. **立即複製** API Key（只會顯示一次！）

### 步驟 2：設定 API Key

打開檔案：`.kiro/settings/mcp.json`

將 `your-render-api-key-here` 替換成你的實際 API Key：

```json
{
  "mcpServers": {
    "render": {
      "command": "uvx",
      "args": ["render-mcp-server"],
      "env": {
        "RENDER_API_KEY": "rnd_xxxxxxxxxxxxxxxxxxxxxxxxxx"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### 步驟 3：重新連接 MCP 伺服器

在 Kiro IDE 中：
1. 打開 **Command Palette**（Cmd+Shift+P）
2. 搜尋並執行：**"MCP: Reconnect All Servers"**
3. 或者重啟 Kiro IDE

### 步驟 4：驗證連接

MCP 伺服器連接成功後，你可以在 Kiro 中使用以下功能：

#### 可用的 Render MCP 工具：

1. **列出服務** - 查看所有 Render 服務
2. **取得服務詳情** - 查看特定服務的詳細資訊
3. **列出部署** - 查看服務的部署歷史
4. **觸發部署** - 手動觸發服務重新部署
5. **查看日誌** - 查看服務的即時日誌
6. **管理環境變數** - 查看和更新環境變數
7. **查看資料庫** - 列出和管理資料庫

## 🎯 使用範例

設定完成後，你可以在 Kiro 中直接詢問：

- "列出我的所有 Render 服務"
- "顯示 fsvs-backend 服務的狀態"
- "查看 fsvs-backend 的最新日誌"
- "重新部署 fsvs-frontend 服務"
- "顯示 fsvs-database 的連線資訊"

## 🔒 安全提示

1. **不要將 API Key 提交到 Git**
   - `.kiro/settings/mcp.json` 已經在 `.gitignore` 中
   - 確保不要意外提交

2. **定期輪換 API Key**
   - 建議每 3-6 個月更換一次

3. **使用最小權限原則**
   - 只給 API Key 必要的權限

## 🔧 故障排除

### Q: MCP 伺服器無法連接？
**A**: 檢查：
1. API Key 是否正確
2. 是否已執行 "MCP: Reconnect All Servers"
3. 查看 Kiro 的 Output 面板中的 MCP 日誌

### Q: 找不到 uvx 命令？
**A**: 重新啟動終端機或執行：
```bash
source $HOME/.local/bin/env
```

### Q: API Key 在哪裡？
**A**: Render Dashboard → 右上角頭像 → Account Settings → API Keys

## 📚 更多資訊

- Render MCP Server: https://github.com/render-oss/render-mcp-server
- Render API 文件: https://api-docs.render.com/
- MCP 協議: https://modelcontextprotocol.io/

---

**設定完成後，你就可以直接在 Kiro 中管理 Render 服務了！**
