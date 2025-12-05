# Lightsail 伺服器架構設計

## 伺服器資訊

- **IP**: 18.181.71.46
- **主域名**: harvestwize.com
- **account**: ubuntu
- **key**: /Users/kuoyuming/Desktop/程式開發/InternationalStudent /LightsailDefaultKey-ap-northeast-1.pem
## 可用網址

### 通過域名訪問（推薦）

| 服務 | 網址 | 說明 |
|------|------|------|
| **課程計劃生成器** | https://course-planner.harvestwize.com | 課程計劃生成器前端 |
| **pgAdmin** | https://pgadmin.harvestwize.com | PostgreSQL 管理工具 |
| **n8n** | https://n8n.harvestwize.com | 工作流自動化 |
| **Open WebUI** | https://webui.harvestwize.com | AI 聊天界面 |
| **Qdrant** | https://qdrant.harvestwize.com | 向量資料庫 |

### 通過 IP + 端口訪問（直接訪問）

| 服務 | 網址 | 說明 |
|------|------|------|
| 課程計劃生成器 前端 | http://18.181.71.46:3001 | 前端應用 |
| 課程計劃生成器 API | http://18.181.71.46:5002 | 後端 API |
| 課程計劃生成器 API 文檔 | http://18.181.71.46:5002/docs | Swagger API 文檔 |
| pgAdmin | http://18.181.71.46:5050 | PostgreSQL 管理 |
| n8n | http://18.181.71.46:5678 | 工作流自動化 |
| Open WebUI | http://18.181.71.46:8080 | AI 聊天界面 |
| Qdrant | http://18.181.71.46:6333 | 向量資料庫 |

---

## 架構設計

### 架構圖

```
Lightsail 伺服器 (18.181.71.46)
│
├── 應用 1 (harvestwize) - 現有
│   ├── 網路: harvestwize_default (Docker Compose 預設)
│   ├── n8n: 5678 → https://n8n.harvestwize.com
│   ├── pgAdmin: 5050 → https://pgadmin.harvestwize.com
│   ├── Open WebUI: 8080 → https://webui.harvestwize.com
│   ├── PostgreSQL: 5432
│   ├── Qdrant: 6333 → https://qdrant.harvestwize.com
│   └── Nginx: 80, 443 (SSL/反向代理)
│
└── 應用 2 (course-planner) - 新建
    ├── 網路: course-planner-network (完全隔離)
    ├── 前端: 3001 → https://course-planner.harvestwize.com
    ├── 後端: 5002 → https://course-planner.harvestwize.com/api
    └── PostgreSQL: 5433 → 5432 (獨立資料庫)
```

### 端口分配表

| 服務 | 應用 1 (harvestwize) | 應用 2 (course-planner) | 域名 |
|------|---------------------|------------------------|------|
| 前端 | - | **3001** | course-planner.harvestwize.com |
| 後端 API | - | **5002** | course-planner.harvestwize.com |
| PostgreSQL | 5432 | **5433** | - |
| n8n | 5678 | - | n8n.harvestwize.com |
| pgAdmin | 5050 | - | pgadmin.harvestwize.com |
| Open WebUI | 8080 | - | webui.harvestwize.com |
| Qdrant | 6333 | - | qdrant.harvestwize.com |
| Nginx | 80, 443 | - | - |

### 隔離策略

1. **網路隔離**：使用不同的 Docker 網路（`harvestwize_default` vs `course-planner-network`）
2. **容器隔離**：不同的容器名稱前綴（`harvestwize-*` vs `course-planner-*`）
3. **資料隔離**：獨立的 Volume（`course_planner_*`）
4. **資料庫隔離**：獨立的 PostgreSQL 實例和資料庫（5432 vs 5433）
5. **端口隔離**：不同的主機端口映射（完全避免衝突）

### 目錄結構

```
/home/ubuntu/
├── harvestwize/                    # 應用 1（現有）
│   ├── docker-compose.yml
│   └── ...
│
└── course-planner/                  # 應用 2（新建）
    ├── docker-compose.prod.yml     # 課程計劃生成器的配置
    ├── backend/
    ├── frontend/
    └── .env.production             # 獨立的環境變數
```

## 第二個應用配置檔案

以下是 `docker-compose.prod.yml` 的完整配置（用於課程計劃生成器）：

```yaml
version: '3.8'

services:
  # PostgreSQL 資料庫（課程計劃生成器，完全獨立）
  postgres:
    image: postgres:15-alpine
    container_name: course-planner-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME:-course_planner_db}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:?請設定 DB_PASSWORD 環境變數}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=C"
    ports:
      - "${DB_PORT:-5433}:5432"  # 不同的端口，避免與 harvestwize 衝突
    volumes:
      - course_planner_postgres_data:/var/lib/postgresql/data
    networks:
      - course-planner-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-course_planner_db}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # 後端 API（課程計劃生成器）
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: course-planner-backend
    restart: unless-stopped
    environment:
      # 應用配置
      PORT: 8000
      ENVIRONMENT: production
      DEBUG: "false"
      
      # 資料庫配置（使用同網路內的服務名）
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:?請設定 DB_PASSWORD}@postgres:5432/${DB_NAME:-course_planner_db}
      DB_NAME: ${DB_NAME:-course_planner_db}
      DB_USER: ${DB_USER:-postgres}
      DB_PASSWORD: ${DB_PASSWORD:?請設定 DB_PASSWORD 環境變數}
      PGSSLMODE: ${PGSSLMODE:-prefer}
      
      # API Keys（可選，但功能需要這些 keys）
      OPENAI_API_KEY: ${OPENAI_API_KEY:-}
      GAMMA_API_KEY: ${GAMMA_API_KEY:-}
      
      # 加密金鑰（必須修改！）
      MASTER_ENCRYPTION_KEY: ${MASTER_ENCRYPTION_KEY:?請設定 MASTER_ENCRYPTION_KEY 環境變數}
      
      # CORS 設定（生產環境建議設為特定域名）
      CORS_ORIGINS: ${CORS_ORIGINS:-https://course-planner.harvestwize.com,http://localhost:3001}
    ports:
      - "${BACKEND_PORT:-5002}:8000"  # 不同的端口，避免與 harvestwize 衝突
    volumes:
      - course_planner_backend_uploads:/app/uploads
      - course_planner_backend_logs:/app/logs
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - course-planner-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # 前端應用（課程計劃生成器）
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        API_URL: ${API_URL:-https://course-planner.harvestwize.com}
    container_name: course-planner-frontend
    restart: unless-stopped
    ports:
      - "${FRONTEND_PORT:-3001}:80"  # 不同的端口，避免與 harvestwize 衝突
    depends_on:
      - backend
    networks:
      - course-planner-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  course_planner_postgres_data:
    driver: local
  course_planner_backend_uploads:
    driver: local
  course_planner_backend_logs:
    driver: local

networks:
  course-planner-network:
    driver: bridge
```

## 環境變數檔案範例

建立 `.env.production` 檔案（課程計劃生成器）：

```env
# ============================================
# 資料庫設定
# ============================================
DB_NAME=course_planner_db
DB_USER=postgres
DB_PASSWORD=請修改為強密碼_至少16字元
DB_PORT=5433
PGSSLMODE=prefer

# ============================================
# API Keys（必須設定）
# ============================================
OPENAI_API_KEY=sk-your-openai-api-key-here
GAMMA_API_KEY=sk-gamma-your-gamma-api-key-here

# ============================================
# 加密金鑰（必須修改！）
# ============================================
# 生成方式：python -c "import secrets; print(secrets.token_urlsafe(32))"
MASTER_ENCRYPTION_KEY=請修改為32字元的隨機字串

# ============================================
# 應用程式設定
# ============================================
ENVIRONMENT=production
DEBUG=false

# ============================================
# 端口設定（避免與 harvestwize 衝突）
# ============================================
FRONTEND_PORT=3001
BACKEND_PORT=5002

# ============================================
# CORS 設定（生產環境建議設為特定域名）
# ============================================
# 格式：https://domain1,https://domain2
CORS_ORIGINS=https://course-planner.harvestwize.com,http://localhost:3001

# ============================================
# API URL（前端使用）
# ============================================
API_URL=https://course-planner.harvestwize.com
```

## 端口衝突檢查

### 已使用的端口（harvestwize）
- ✅ 80, 443: Nginx (SSL/反向代理)
- ✅ 5050: pgAdmin → pgadmin.harvestwize.com
- ✅ 5432: PostgreSQL
- ✅ 5678: n8n → n8n.harvestwize.com
- ✅ 8080: Open WebUI → webui.harvestwize.com
- ✅ 6333: Qdrant → qdrant.harvestwize.com

### 課程計劃生成器使用的端口
- ✅ 3001: 前端 → course-planner.harvestwize.com（**不衝突**）
- ✅ 5002: 後端 API → course-planner.harvestwize.com（**不衝突**）
- ✅ 5433: PostgreSQL（**不衝突**）

## 部署注意事項

1. **完全隔離**：使用獨立的 Docker 網路，不會與 harvestwize 應用有任何連接
2. **端口安全**：所有端口都經過檢查，確保不會衝突
3. **資料獨立**：使用獨立的 Volume，資料完全分離
4. **容器命名**：使用 `course-planner-*` 前綴，與 `harvestwize-*` 區分
5. **環境變數**：獨立的 `.env.production` 檔案，不會影響現有應用

## 驗證隔離

部署後可以執行以下命令驗證：

```bash
# 檢查容器
docker ps | grep course-planner

# 檢查網路
docker network ls | grep course-planner

# 檢查端口
ss -tulpn | grep -E ':(3001|5002|5433)'

# 檢查 Volume
docker volume ls | grep course-planner
```

所有資源都應該完全獨立，不會與 harvestwize 應用有任何交集。
