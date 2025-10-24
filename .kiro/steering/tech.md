# Technology Stack

## Build System

- **Monorepo**: npm workspaces with root-level orchestration
- **Frontend Build**: Vite 4.5
- **Backend Build**: TypeScript compiler (tsc)
- **Containerization**: Docker + Docker Compose

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Ant Design 5.11
- **State Management**: Zustand 4.4
- **Routing**: React Router 6.18
- **HTTP Client**: Axios
- **Date Handling**: dayjs
- **Charts**: @ant-design/plots
- **Testing**: Vitest + React Testing Library

### Backend
- **Runtime**: Node.js 18+ with Express 4.18
- **Language**: TypeScript 5.2
- **Database**: PostgreSQL 8.11
- **Cache**: Redis 4.6
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **Email**: Nodemailer
- **Validation**: Joi
- **Logging**: Winston
- **Scheduling**: node-cron
- **Testing**: Jest + Supertest

### Infrastructure
- **File Storage**: AWS S3 / MinIO (S3-compatible)
- **Reverse Proxy**: Nginx (production)
- **Container Orchestration**: Docker Compose (dev), Kubernetes (optional prod)

## Common Commands

### Development
```bash
# Start all services (Docker)
docker compose up -d

# Initialize database
./scripts/init-database.sh

# Start dev servers (local)
npm run dev                    # Both frontend + backend
npm run dev:frontend          # Frontend only (port 3000)
npm run dev:backend           # Backend only (port 5001)
```

### Building
```bash
npm run build                 # Build both workspaces
npm run build --workspace=backend
npm run build --workspace=frontend
```

### Testing
```bash
npm test                      # Run all tests
npm run test --workspace=backend
npm run test --workspace=frontend

# Backend specific
npm run test:unit --workspace=backend
npm run test:integration --workspace=backend
```

### Code Quality
```bash
npm run lint                  # Lint all workspaces
npm run lint:fix              # Auto-fix linting issues
```

### Database
```bash
npm run migrate --workspace=backend    # Run migrations
npm run db:setup --workspace=backend   # Setup database
./scripts/reset-database.sh            # Reset database
./scripts/backup-database.sh           # Backup database
```

### Deployment
```bash
./scripts/deploy.sh production         # Deploy to production
./scripts/health-check.sh              # Verify deployment
```

## Port Configuration

- Frontend: 3000 (dev), 80/443 (prod)
- Backend: 5001
- PostgreSQL: 5432
- Redis: 6379
- MinIO: 9000 (API), 9001 (Console)

## Environment Variables

Backend requires `.env` file with:
- Database connection (PostgreSQL)
- Redis connection
- JWT secrets
- File storage configuration (S3/MinIO)
- Email service configuration
- LDAP settings (if applicable)

Frontend requires `.env` with:
- `VITE_API_URL`: Backend API endpoint
