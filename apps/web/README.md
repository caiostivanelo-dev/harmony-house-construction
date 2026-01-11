# Frontend - Harmony House SaaS

Pure React + Vite frontend application.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **Zustand** - State management

## ⚠️ Important: No Database Dependencies

This frontend application:
- ✅ Uses Vite as the build tool (standard React setup)
- ✅ Communicates with backend via REST API
- ✅ Uses mock data for development
- ❌ **NO** Prisma client
- ❌ **NO** SQL queries
- ❌ **NO** database connections
- ❌ **NO** backend-only dependencies

All database operations are handled by the backend API (`apps/api`).

## Development

```bash
npm run dev  # Starts Vite dev server on http://localhost:5173
```

The frontend runs **independently** - no database setup required. It uses mock data until API integration is complete.

## Build

```bash
npm run build  # Builds for production
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── components/    # React components
│   ├── layout/   # AppLayout, Sidebar, Topbar
│   └── ui/       # shadcn/ui components
├── pages/        # Page components
├── hooks/        # Custom React hooks
├── stores/       # Zustand state stores
├── lib/          # Utilities and API client
└── types/        # TypeScript type definitions
```

## API Integration

API client placeholder is in `src/lib/api.ts`. It will be implemented to communicate with the backend at `http://localhost:3000`.
