# Project Structure

## Monorepo Organization

This is a monorepo using npm workspaces with two main applications:

```
/
├── backend/          # Express API server
├── frontend/         # React web application
├── scripts/          # Deployment and maintenance scripts
├── database/         # Database initialization files
└── .kiro/           # Kiro specs and steering rules
```

## Backend Structure (`backend/src/`)

```
src/
├── controllers/      # HTTP request handlers (thin layer)
├── services/        # Business logic (core functionality)
├── repositories/    # Data access layer (database queries)
├── models/          # Data models and entity definitions
├── middleware/      # Express middleware (auth, error handling, etc.)
├── routes/          # API route definitions
├── config/          # Configuration files (database, redis)
├── migrations/      # Database migration SQL files
├── scripts/         # Utility scripts (migration runner)
├── utils/           # Shared utilities (logger, errors)
└── types/           # TypeScript type definitions
```

### Backend Architecture Pattern

- **Layered Architecture**: Controllers → Services → Repositories → Database
- **Separation of Concerns**: Each layer has a specific responsibility
- **Repository Pattern**: Data access abstraction
- **Middleware Chain**: Auth → Permission → Business Logic → Error Handling

## Frontend Structure (`frontend/src/`)

```
src/
├── components/      # React components
│   ├── Common/      # Reusable UI components
│   ├── Student/     # Student-related components
│   ├── Document/    # Document upload/management
│   ├── Report/      # Reporting and dashboard
│   └── Layout/      # Layout components
├── pages/           # Page-level components (routes)
├── services/        # API client services
├── stores/          # Zustand state management
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

### Frontend Architecture Pattern

- **Component-Based**: Modular, reusable components
- **Feature Folders**: Components grouped by domain (Student, Document, Report)
- **Service Layer**: API calls abstracted in service files
- **State Management**: Zustand stores for global state

## Key Conventions

### File Naming
- **Backend**: kebab-case for files (e.g., `student.service.ts`)
- **Frontend**: PascalCase for components (e.g., `StudentForm.tsx`), kebab-case for utilities
- **Tests**: `*.test.ts` or `*.test.tsx` alongside source files or in `__tests__/` folders

### Import Organization
- External dependencies first
- Internal imports grouped by type (components, services, types, utils)
- Relative imports last

### Testing Structure
- **Unit tests**: Alongside source files in `__tests__/` folders
- **Integration tests**: `backend/src/__tests__/integration/`
- **Test setup**: Separate setup files for test configuration

## Database Migrations

Located in `backend/src/migrations/sql/` with sequential numbering:
- `001_create_units_table.sql`
- `002_create_document_types_table.sql`
- etc.

Run via: `npm run migrate --workspace=backend`

## Scripts Directory

Bash scripts for operations:
- `init-database.sh`: Initialize database schema
- `reset-database.sh`: Reset database to clean state
- `backup-database.sh`: Backup database
- `deploy.sh`: Deployment automation
- `health-check.sh`: System health verification

## Docker Configuration

- `docker-compose.yml`: Development environment
- `docker-compose.prod.yml`: Production environment
- `Dockerfile.dev`: Development container
- `Dockerfile`: Production container

## Configuration Files

- Root `package.json`: Workspace orchestration
- `tsconfig.json`: TypeScript configuration (per workspace)
- `.eslintrc.*`: Linting rules (per workspace)
- `jest.config.js` / `vite.config.ts`: Test configuration
