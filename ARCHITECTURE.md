# Architecture & Separation of Concerns

## Overview

This project follows a strict separation between frontend and backend:

- **Frontend (`apps/web`)**: Pure React + Vite application with NO database logic
- **Backend (`apps/api`)**: NestJS + Prisma + PostgreSQL - ALL database operations

---

## Frontend (`apps/web`)

### ✅ Allowed
- React, Vite, TypeScript
- UI libraries (shadcn/ui, Tailwind CSS)
- State management (Zustand)
- HTTP client (for API calls)
- TypeScript types (defined in `src/types/`)
- Mock data for development

### ❌ Forbidden
- Prisma client
- SQL queries
- Database connections
- Direct backend imports (`@prisma/client`, database drivers)
- Backend-only dependencies

### Tech Stack
```json
{
  "react": "^18.2.0",
  "vite": "^5.0.8",
  "typescript": "^5.2.2",
  "@tanstack/react-query": "^5.12.2",
  "zustand": "^4.4.7"
}
```

### Development
```bash
cd apps/web
npm run dev  # Starts Vite dev server on http://localhost:5173
```

**No database setup required** - frontend runs independently with mock data.

---

## Backend (`apps/api`)

### ✅ Allowed
- NestJS framework
- Prisma ORM
- PostgreSQL database
- JWT authentication
- REST API endpoints
- Business logic

### Tech Stack
```json
{
  "@nestjs/core": "^10.3.0",
  "@prisma/client": "^5.7.1",
  "prisma": "^5.7.1"
}
```

### Prisma Location
- Schema: `apps/api/prisma/schema.prisma`
- Client: Generated in `apps/api/node_modules/@prisma/client`

### Development
```bash
cd apps/api
npm run start:dev  # Starts NestJS on http://localhost:3000
```

### Database Commands
```bash
cd apps/api
npx prisma migrate dev     # Run migrations
npx prisma generate        # Generate Prisma Client
npx prisma studio          # Open Prisma Studio
```

---

## Type Definitions

### Frontend Types (`apps/web/src/types/index.ts`)
- **DO NOT** import from `@prisma/client`
- Use plain TypeScript interfaces
- Match API response shapes
- Used for UI rendering and API contracts

### Example:
```typescript
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  status: string
}
```

---

## API Communication

### Frontend → Backend
- HTTP requests via fetch/axios
- API base URL: `http://localhost:3000` (configurable via env)
- Authentication via JWT tokens
- API client placeholder: `apps/web/src/lib/api.ts`

### Backend → Frontend
- REST endpoints
- JSON responses
- Type-safe responses (match frontend types)

---

## Development Workflow

### Run Both
```bash
npm run dev  # Runs both frontend and backend concurrently
```

### Run Separately
```bash
# Frontend only (no database needed)
npm run dev:web  # http://localhost:5173

# Backend only
npm run dev:api  # http://localhost:3000
```

### Database Setup (Backend Only)
```bash
cd apps/api
cp .env.example .env
# Edit .env with your DATABASE_URL
npx prisma migrate dev
```

---

## Verification Checklist

Before committing, ensure:

- [ ] No `@prisma/client` imports in `apps/web/src/`
- [ ] No SQL/database dependencies in `apps/web/package.json`
- [ ] Frontend types don't import Prisma types
- [ ] All database logic is in `apps/api/`
- [ ] Frontend can run independently (`npm run dev` in `apps/web/`)
- [ ] Backend has all Prisma dependencies in `apps/api/package.json`

---

## Important Rules

1. **Frontend NEVER touches the database** - Use API endpoints only
2. **Backend ONLY place for Prisma** - All DB operations in `apps/api`
3. **Types are separate** - Frontend types ≠ Prisma types
4. **Vite is the build tool** - No webpack, no custom bundlers
5. **Mock data is OK** - Frontend can use mocks until API integration
