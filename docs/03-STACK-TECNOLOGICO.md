# 🛠️ Stack Tecnológico Recomendado

## 📋 Visão Geral

Este documento detalha todas as tecnologias, bibliotecas e ferramentas recomendadas para construir o Harmony House SaaS do zero, com foco em **modernidade**, **performance**, **developer experience** e **escalabilidade**.

---

## 🎨 Frontend Stack

### Core Framework

#### ✅ **React 18+** (Principal)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```
**Por quê?**
- ✅ Ecossistema maduro e estável
- ✅ Huge community e recursos
- ✅ Performance excelente com Concurrent Features
- ✅ TypeScript support nativo
- ✅ React Server Components (futuro)

**Alternativas consideradas:**
- ❌ Vue.js - Menor ecossistema no Brasil
- ❌ Svelte - Mais novo, menos maduro
- ❌ Angular - Overhead desnecessário para este projeto

---

### Build Tool

#### ✅ **Vite 5+** (Recomendado)
```json
{
  "vite": "^5.0.8",
  "@vitejs/plugin-react": "^4.2.1"
}
```
**Por quê?**
- ✅ Build ultra-rápido (ESM nativo)
- ✅ HMR instantâneo
- ✅ Configuração minimalista
- ✅ Otimizações automáticas
- ✅ Suporte a TypeScript nativo

**Alternativas:**
- ❌ Webpack - Mais lento e complexo
- ❌ Parcel - Menos features
- ⚠️ Next.js - Considerar apenas se precisar SSR (não necessário aqui)

---

### Language

#### ✅ **TypeScript 5+** (Obrigatório)
```json
{
  "typescript": "^5.3.3",
  "@types/react": "^18.2.43",
  "@types/react-dom": "^18.2.17"
}
```
**Por quê?**
- ✅ Type safety end-to-end
- ✅ IntelliSense excelente
- ✅ Catch errors em compile time
- ✅ Refactoring seguro
- ✅ Documentação implícita via tipos

**Configuração mínima:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

### Routing

#### ✅ **React Router v6+**
```json
{
  "react-router-dom": "^6.20.0"
}
```
**Por quê?**
- ✅ Padrão de mercado
- ✅ Data API moderna
- ✅ Lazy loading built-in
- ✅ Nested routing fácil

---

### State Management

#### ✅ **TanStack Query (React Query) v5+** (Server State)
```json
{
  "@tanstack/react-query": "^5.12.2"
}
```
**Por quê?**
- ✅ Cache automático inteligente
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Infinite scroll support
- ✅ DevTools excelente

#### ✅ **Zustand v4+** (Client State - se necessário)
```json
{
  "zustand": "^4.4.7"
}
```
**Por quê?**
- ✅ Simples e minimalista
- ✅ TypeScript support excelente
- ✅ Sem boilerplate
- ✅ Pequeno bundle size

**Quando usar:**
- Estado de UI (modals, sidebars, etc.)
- Estado compartilhado simples entre componentes
- **NÃO usar para server state** (usar React Query)

---

### Forms

#### ✅ **React Hook Form v7+**
```json
{
  "react-hook-form": "^7.48.2",
  "@hookform/resolvers": "^3.3.2"
}
```
**Por quê?**
- ✅ Performance excelente (uncontrolled components)
- ✅ Validação integrada com Zod
- ✅ Menor re-renders
- ✅ TypeScript support perfeito

#### ✅ **Zod** (Schema Validation)
```json
{
  "zod": "^3.22.4"
}
```
**Por quê?**
- ✅ Type-safe schemas
- ✅ Validação runtime
- ✅ Type inference automático
- ✅ Mensagens de erro customizáveis

**Exemplo:**
```typescript
import { z } from 'zod'

const customerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido')
})

type Customer = z.infer<typeof customerSchema>
```

---

### UI Framework

#### ✅ **Tailwind CSS v3+**
```json
{
  "tailwindcss": "^3.3.6",
  "autoprefixer": "^10.4.16",
  "postcss": "^8.4.32"
}
```
**Por quê?**
- ✅ Utility-first (desenvolvimento rápido)
- ✅ PurgeCSS automático (bundle pequeno)
- ✅ Customização fácil
- ✅ Dark mode built-in
- ✅ Responsive design simples

#### ✅ **shadcn/ui** (Component Library)
```json
{
  // Instalado via CLI, não via npm
}
```
**Por quê?**
- ✅ Componentes copiados (não dependência)
- ✅ Totalmente customizável
- ✅ Acessibilidade built-in
- ✅ Radix UI por baixo (excelente)
- ✅ Tailwind CSS integrado

**Componentes principais:**
- Button, Input, Card, Dialog, Select
- Table, Form, Toast, Dropdown Menu
- Tabs, Accordion, Alert

---

### Icons

#### ✅ **Lucide React**
```json
{
  "lucide-react": "^0.294.0"
}
```
**Por quê?**
- ✅ Icon library moderna
- ✅ TypeScript support
- ✅ Tree-shakeable
- ✅ Consistent design

---

### Utilities

#### ✅ **date-fns** (Date Manipulation)
```json
{
  "date-fns": "^2.30.0"
}
```
**Por quê?**
- ✅ Modular (tree-shakeable)
- ✅ Timezone support
- ✅ Formatting simples
- ✅ Mais leve que moment.js

#### ✅ **clsx + tailwind-merge**
```json
{
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.1.0"
}
```
**Por quê?**
- ✅ Merge de classes Tailwind corretamente
- ✅ Conditional classes limpo

---

## 🔧 Backend Stack

### Core Framework

#### ✅ **NestJS 10+** (Recomendado)
```json
{
  "@nestjs/common": "^10.3.0",
  "@nestjs/core": "^10.3.0",
  "@nestjs/platform-express": "^10.3.0"
}
```
**Por quê?**
- ✅ Arquitetura modular (enterprise-grade)
- ✅ TypeScript first-class
- ✅ Decorators e dependency injection
- ✅ Ecossistema maduro
- ✅ Escalável e testável
- ✅ Guards, Interceptors, Pipes built-in

**Alternativas consideradas:**
- ⚠️ Fastify - Mais rápido, mas menos features
- ❌ Express - Muito baixo nível para este projeto
- ❌ tRPC - Excelente, mas requer Next.js para full-stack

---

### ORM

#### ✅ **Prisma 5+** (Recomendado)
```json
{
  "@prisma/client": "^5.7.1",
  "prisma": "^5.7.1"
}
```
**Por quê?**
- ✅ Type-safe queries
- ✅ Migrations excelentes
- ✅ Prisma Studio (UI para DB)
- ✅ Performance boa
- ✅ Schema declarativo
- ✅ Multi-database support

**Alternativas:**
- ⚠️ TypeORM - Mais maduro, mas menos type-safe
- ⚠️ Drizzle - Mais leve, mas menos features
- ❌ Sequelize - Legacy, não recomendado

---

### Database

#### ✅ **PostgreSQL 15+** (Produção)
**Por quê?**
- ✅ ACID compliance completo
- ✅ JSON support nativo
- ✅ Advanced indexing
- ✅ Full-text search
- ✅ Reliable e battle-tested
- ✅ Custo-benefício excelente

**Para desenvolvimento:**
- SQLite (local) ou PostgreSQL via Docker

---

### Cache

#### ✅ **Redis 7+**
```json
{
  "ioredis": "^5.3.2",
  "@nestjs/cache-manager": "^2.1.1",
  "cache-manager-redis-store": "^3.0.1"
}
```
**Por quê?**
- ✅ Cache de sessões
- ✅ Rate limiting
- ✅ Queue system (BullMQ)
- ✅ Pub/Sub para real-time (futuro)

---

### Authentication

#### ✅ **JWT** (jsonwebtoken)
```json
{
  "@nestjs/jwt": "^10.2.0",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "bcrypt": "^5.1.1"
}
```
**Por quê?**
- ✅ Stateless (escalável)
- ✅ Padrão de mercado
- ✅ Refresh token strategy

**Futuro:**
- Considerar OAuth2 (Google, Microsoft)
- 2FA com TOTP

---

### Validation

#### ✅ **class-validator + class-transformer**
```json
{
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1"
}
```
**Por quê?**
- ✅ Decorator-based (NestJS style)
- ✅ Type-safe
- ✅ Integração perfeita com NestJS

**Alternativa:**
- Zod (mais moderno, considerar migração futura)

---

### Email

#### ✅ **Nodemailer** (SMTP)
```json
{
  "nodemailer": "^6.9.7",
  "@types/nodemailer": "^6.4.14"
}
```
**Serviços recomendados:**
- SendGrid (desenvolvimento)
- AWS SES (produção)
- Resend (moderno, considerar)

---

### PDF Generation

#### ✅ **Puppeteer** (Current)
```json
{
  "puppeteer": "^21.6.0"
}
```
**Por quê?**
- ✅ HTML to PDF (fácil de estilizar)
- ✅ Headless Chrome

**Alternativas consideradas:**
- ⚠️ PDFKit - Mais controle, mas mais complexo
- ⚠️ jsPDF - Mais leve, mas menos features
- ✅ React-PDF - Considerar para templates React

---

### Payment Processing

#### ✅ **Stripe** (Recomendado)
```json
{
  "stripe": "^14.7.0"
}
```
**Por quê?**
- ✅ Padrão de mercado
- ✅ Excelente documentação
- ✅ Webhooks confiáveis
- ✅ Dashboard completo
- ✅ Suporte no Brasil (ajustar para mercado local se necessário)

**Para Brasil:**
- Considerar Mercado Pago ou PagSeguro como alternativa

---

### Queue System

#### ✅ **BullMQ** (Recomendado)
```json
{
  "@nestjs/bullmq": "^10.0.1",
  "bullmq": "^5.1.2"
}
```
**Por quê?**
- ✅ Jobs assíncronos
- ✅ Retry logic
- ✅ Priority queues
- ✅ Redis-backed

**Uso:**
- Envio de emails
- Geração de PDFs
- Relatórios pesados
- Background tasks

---

### File Storage

#### ✅ **AWS S3** (ou compatível)
```json
{
  "@aws-sdk/client-s3": "^3.490.0"
}
```
**Alternativas:**
- DigitalOcean Spaces
- Cloudflare R2
- MinIO (self-hosted)

---

## 🧪 Testing

### Frontend

#### ✅ **Vitest** (Unit Tests)
```json
{
  "vitest": "^1.0.4",
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.1.5",
  "@testing-library/user-event": "^14.5.1"
}
```
**Por quê?**
- ✅ Compatível com Vite
- ✅ Rápido (ESM nativo)
- ✅ Jest-compatible API

#### ✅ **Playwright** (E2E Tests)
```json
{
  "@playwright/test": "^1.40.1"
}
```
**Por quê?**
- ✅ Multi-browser support
- ✅ Auto-waiting
- ✅ Screenshots e videos
- ✅ TypeScript support

---

### Backend

#### ✅ **Jest** (Unit & Integration Tests)
```json
{
  "jest": "^29.7.0",
  "@nestjs/testing": "^10.3.0",
  "ts-jest": "^29.1.1",
  "supertest": "^6.3.3"
}
```
**Por quê?**
- ✅ Padrão NestJS
- ✅ Mocking excelente
- ✅ Coverage reports

---

## 🚀 DevOps & Infrastructure

### Package Manager

#### ✅ **pnpm** (Recomendado)
```json
{
  // Instalar globalmente: npm i -g pnpm
}
```
**Por quê?**
- ✅ Mais rápido que npm/yarn
- ✅ Disk space efficient (symlinks)
- ✅ Workspaces nativas
- ✅ Strict dependency resolution

**Alternativas:**
- ⚠️ npm - OK, mas mais lento
- ⚠️ yarn - OK, mas pnpm é melhor

---

### Monorepo

#### ✅ **Turborepo** (Recomendado)
```json
{
  "turbo": "^1.11.0"
}
```
**Por quê?**
- ✅ Build caching inteligente
- ✅ Parallel execution
- ✅ Remote caching (futuro)
- ✅ Task dependencies

**Configuração:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {}
  }
}
```

---

### Containerization

#### ✅ **Docker + Docker Compose**
```dockerfile
# Desenvolvimento local
docker-compose.yml
```

**Por quê?**
- ✅ Ambiente consistente
- ✅ Fácil onboarding
- ✅ Production-like environment

---

### CI/CD

#### ✅ **GitHub Actions**
```yaml
# .github/workflows/ci.yml
```

**Pipeline:**
1. Lint + Type Check
2. Tests (unit + integration)
3. Build
4. E2E Tests (opcional)
5. Deploy (staging/production)

---

### Code Quality

#### ✅ **ESLint**
```json
{
  "eslint": "^8.55.0",
  "@typescript-eslint/eslint-plugin": "^6.13.1",
  "@typescript-eslint/parser": "^6.13.1"
}
```

#### ✅ **Prettier**
```json
{
  "prettier": "^3.1.0",
  "eslint-config-prettier": "^9.1.0"
}
```

#### ✅ **Husky + lint-staged**
```json
{
  "husky": "^8.0.3",
  "lint-staged": "^15.2.0"
}
```
**Git hooks automáticos:**
- Pre-commit: lint + format
- Pre-push: tests

---

## 📊 Monitoring & Observability

### Error Tracking

#### ✅ **Sentry**
```json
{
  "@sentry/react": "^7.91.0",
  "@sentry/node": "^7.91.0"
}
```

### Logging

#### ✅ **Pino** (Backend)
```json
{
  "pino": "^8.16.2",
  "pino-pretty": "^10.2.3",
  "nestjs-pino": "^3.0.0"
}
```

### APM

- **New Relic** ou **DataDog** (futuro)

---

## 📦 Package.json Completo

### Root (Monorepo)
```json
{
  "name": "harmony-house-saas",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "turbo": "^1.11.0",
    "prettier": "^3.1.0",
    "eslint": "^8.55.0"
  }
}
```

---

## 🎯 Decisões de Arquitetura

### Por que este stack?

1. **Type Safety**: TypeScript em 100% do código
2. **Developer Experience**: Ferramentas modernas e rápidas
3. **Performance**: Vite, React 18, Prisma otimizado
4. **Escalabilidade**: NestJS, PostgreSQL, Redis
5. **Manutenibilidade**: Código limpo, testável, documentado
6. **Ecossistema**: Bibliotecas maduras e bem mantidas

---

## 📝 Próximos Passos

1. ✅ Revisar este stack
2. ⏭️ Seguir guia de implementação: `04-GUIA-IMPLEMENTACAO.md`
3. ⏭️ Ver estrutura de pastas: `05-ESTRUTURA-PASTAS.md`

---

## 🔄 Considerações Futuras

### Tecnologias a Avaliar

1. **tRPC**: Type-safe APIs end-to-end
2. **Next.js**: Se precisar SSR/SSG
3. **React Native**: Para mobile app
4. **GraphQL**: Se APIs complexas crescerem
5. **Microservices**: Se escala exigir (só após validação de produto)
