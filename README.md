# Harmony House SaaS

Multi-tenant Construction Management SaaS platform.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Zustand
- **Backend**: Node.js, NestJS, Prisma, PostgreSQL, JWT Authentication, RBAC

## Architecture

**Important**: This project enforces strict separation between frontend and backend:

- **Frontend (`apps/web`)**: Pure React + Vite - **NO** database/Prisma dependencies
- **Backend (`apps/api`)**: NestJS + Prisma + PostgreSQL - **ALL** database operations

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed separation guidelines.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (only needed for backend)
- npm or yarn

### Installation

```bash
npm install
```

### Development

#### Frontend Only (No Database Required)
```bash
npm run dev:web  # Vite dev server on http://localhost:5173
```
The frontend runs independently with mock data - no database setup needed.

#### Backend Only
```bash
npm run dev:api  # NestJS on http://localhost:3000
```

#### Both Together
```bash
npm run dev  # Runs both concurrently
```

### Database Setup (Backend Only)

**Only required if running the backend:**

1. Create a PostgreSQL database
2. Copy `apps/api/.env.example` to `apps/api/.env` and configure your database URL
3. Run migrations:
```bash
cd apps/api
npx prisma migrate dev
```

## Project Structure

```
├── apps/
│   ├── web/          # Frontend: React + Vite (NO Prisma/SQL)
│   └── api/          # Backend: NestJS + Prisma + PostgreSQL
├── ARCHITECTURE.md   # Architecture & separation guidelines
└── package.json      # Monorepo root
```

## Verification

✅ **Frontend is clean:**
- No Prisma/SQL dependencies in `apps/web/package.json`
- No database imports in frontend code
- Frontend types are independent (no Prisma types)
- Runs independently with mock data

✅ **Backend is isolated:**
- All Prisma logic in `apps/api/`
- Database operations only in backend
- Frontend communicates via REST API only
