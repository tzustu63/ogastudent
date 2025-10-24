# Technology Stack & Build System

## Architecture

**Monorepo Structure**: Uses npm workspaces with separate frontend and backend packages

## Frontend Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 4.5+
- **UI Library**: Ant Design 5.11+
- **State Management**: Zustand 4.4+
- **Routing**: React Router 6.18+
- **HTTP Client**: Axios 1.6+
- **Date Handling**: Day.js 1.11+
- **Charts**: Ant Design Plots 2.6+

## Backend Stack

- **Runtime**: Node.js 18+ with Express 4.18+
- **Language**: TypeScript 5.2+
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **File Storage**: AWS S3 / MinIO (S3-compatible)
- **Authentication**: JWT + LDAP integration
- **Validation**: Joi 17.11+
- **Security**: Helmet 7.1+, bcryptjs 2.4+
- **File Upload**: Multer 1.4+
- **Scheduling**: node-cron 3.0+
- **Email**: Nodemailer 7.0+
- **Logging**: Winston 3.11+

## Development & Deployment

- **Containerization**: Docker + Docker Compose
- **Development**: Hot reload with nodemon (backend) and Vite (frontend)
- **Production**: Kubernetes support (optional)
- **Database Migrations**: Custom TypeScript migration runner

## Common Commands

### Root Level (Monorepo)
```bash
# Install all dependencies
npm install

# Start both frontend and backend in development
npm run dev

# Build both applications
npm run build

# Run tests for both applications
npm run test

# Lint both applications
npm run lint
```

### Backend Specific
```bash
# Development server with hot reload
npm run dev --workspace=backend

# Build TypeScript to JavaScript
npm run build --workspace=backend

# Run production server
npm run start --workspace=backend

# Run database migrations
npm run migrate --workspace=backend

# Run unit tests only
npm run test:unit --workspace=backend

# Run integration tests only
npm run test:integration --workspace=backend
```

### Frontend Specific
```bash
# Development server
npm run dev --workspace=frontend

# Build for production
npm run build --workspace=frontend

# Preview production build
npm run preview --workspace=frontend

# Run tests with Vitest
npm run test --workspace=frontend

# Run tests in watch mode
npm run test:watch --workspace=frontend
```

### Docker Development
```bash
# Start all services (PostgreSQL, Redis, MinIO, Backend, Frontend)
docker compose up -d

# Initialize database with migrations
./scripts/init-database.sh

# Health check
./scripts/health-check.sh

# Reset database (development only)
./scripts/reset-database.sh
```

## Path Aliases

Both frontend and backend use TypeScript path aliases:

**Backend**: `@/*` maps to `src/*` with specific aliases for major directories
**Frontend**: `@/*` maps to `src/*`

## Testing Framework

- **Backend**: Jest with Supertest for API testing
- **Frontend**: Vitest with React Testing Library and jsdom
- **Integration Tests**: Separate test suite for end-to-end API testing

## Code Quality

- **Linting**: ESLint with TypeScript rules
- **Type Checking**: Strict TypeScript configuration
- **Auto-fixing**: `npm run lint:fix` available for both applications