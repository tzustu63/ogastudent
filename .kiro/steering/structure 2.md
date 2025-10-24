# Project Structure & Organization

## Root Directory Layout

```
foreign-student-verification-system/
├── backend/                 # Backend API application
├── frontend/                # Frontend React application
├── database/                # Database initialization scripts
├── scripts/                 # Deployment and maintenance scripts
├── .kiro/                   # Kiro specifications and steering
├── docker-compose.yml       # Development environment
├── docker-compose.prod.yml  # Production environment
└── package.json            # Monorepo workspace configuration
```

## Backend Structure (`backend/`)

### Core Directories
- `src/controllers/` - API endpoint handlers, one per domain (auth, student, document, etc.)
- `src/services/` - Business logic layer, contains core application logic
- `src/repositories/` - Data access layer, database operations
- `src/models/` - TypeScript interfaces and data models
- `src/middleware/` - Express middleware (auth, error handling, validation, etc.)
- `src/routes/` - API route definitions and routing logic
- `src/config/` - Configuration files (database, redis, etc.)
- `src/utils/` - Utility functions and helpers
- `src/types/` - TypeScript type definitions

### Special Directories
- `src/migrations/` - Database migration scripts and runner
- `src/scripts/` - Standalone scripts (migration runner, etc.)
- `src/__tests__/` - Test files organized by type (unit, integration)
- `dist/` - Compiled JavaScript output (generated)
- `uploads/` - File upload storage (development only)
- `logs/` - Application log files

## Frontend Structure (`frontend/`)

### Core Directories
- `src/components/` - Reusable React components organized by domain
- `src/pages/` - Top-level page components for routing
- `src/services/` - API client services and HTTP logic
- `src/stores/` - Zustand state management stores
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions and helpers
- `src/types/` - TypeScript type definitions
- `src/assets/` - Static assets (images, fonts, etc.)

### Component Organization
Components are organized by domain with barrel exports:
- `components/Common/` - Shared UI components (FormInput, Loading, etc.)
- `components/Student/` - Student-related components
- `components/Document/` - Document handling components
- `components/Report/` - Reporting and analytics components
- `components/Layout/` - Layout and navigation components

### Testing
- `src/test/` - Test configuration and setup
- `src/components/__tests__/` - Component tests co-located with components

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `StudentForm.tsx`, `DocumentUpload.tsx`)
- **Services**: kebab-case with `.service.ts` suffix (e.g., `auth.service.ts`)
- **Stores**: camelCase with `Store` suffix (e.g., `authStore.ts`)
- **Types**: kebab-case (e.g., `index.ts` in types directory)
- **Tests**: Same as source file with `.test.ts` or `.spec.ts` suffix

### Directories
- Use kebab-case for multi-word directories
- Use PascalCase for component directories that represent a single component

## Import/Export Patterns

### Barrel Exports
Each major directory should have an `index.ts` file that re-exports public APIs:
```typescript
// src/components/Student/index.ts
export { StudentForm } from './StudentForm';
export { StudentList } from './StudentList';
export { StudentProfile } from './StudentProfile';
```

### Path Aliases
Use TypeScript path aliases consistently:
- Backend: `@/controllers/auth.controller` instead of `../../../controllers/auth.controller`
- Frontend: `@/components/Student` instead of `../../../components/Student`

## Database Organization

### Migration Files
- Located in `backend/src/migrations/sql/`
- Numbered sequentially: `001_create_units_table.sql`
- Include both schema changes and data migrations
- Run via TypeScript migration runner

### Model Relationships
- Base model pattern with common fields (id, created_at, updated_at)
- Repository pattern for data access
- Service layer for business logic

## Configuration Management

### Environment Files
- `.env.example` - Template for environment variables
- `.env` - Local development (not committed)
- `.env.production.example` - Production template

### Docker Configuration
- `Dockerfile.dev` - Development containers with hot reload
- `Dockerfile` - Production optimized containers
- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production environment

## Scripts Organization

Maintenance scripts in `scripts/` directory:
- `deploy.sh` - Production deployment
- `init-database.sh` - Database initialization
- `health-check.sh` - System health verification
- `backup-database.sh` - Database backup utilities