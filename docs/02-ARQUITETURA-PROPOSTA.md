# 🏛️ Arquitetura Técnica Proposta

## 📐 Visão Geral da Arquitetura

A arquitetura proposta segue os princípios de **Clean Architecture**, **Domain-Driven Design (DDD)** e **Separation of Concerns**, garantindo escalabilidade, manutenibilidade e testabilidade.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser/Mobile)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │  Mobile App  │  │   Admin UI   │     │
│  │   (React)    │  │  (React Native) │  │  (Future)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS/REST API
                        │ GraphQL (Future)
┌───────────────────────▼─────────────────────────────────────┐
│                   API GATEWAY (NestJS)                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Authentication │ Authorization │ Rate Limiting    │    │
│  │  Request Validation │ Error Handling │ Logging     │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
│   API Core   │ │   Workers   │ │  Services  │
│  (NestJS)    │ │  (BullMQ)   │ │  (Email,   │
│              │ │             │ │   PDF, etc)│
└───────┬──────┘ └─────────────┘ └────────────┘
        │
┌───────▼─────────────────────────────────────┐
│         Business Logic Layer                 │
│  ┌────────────────────────────────────────┐ │
│  │  Domain Services │ Use Cases │ DTOs    │ │
│  │  Validation │ Business Rules           │ │
│  └────────────────────────────────────────┘ │
└───────┬─────────────────────────────────────┘
        │
┌───────▼─────────────────────────────────────┐
│         Data Access Layer (Prisma ORM)      │
│  ┌────────────────────────────────────────┐ │
│  │  Repository Pattern │ Migrations       │ │
│  │  Query Optimization │ Transactions     │ │
│  └────────────────────────────────────────┘ │
└───────┬─────────────────────────────────────┘
        │
┌───────▼─────────────────────────────────────┐
│         Infrastructure Layer                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │PostgreSQL│ │  Redis   │ │  S3/S3   │   │
│  │(Primary) │ │ (Cache)  │ │(Storage) │   │
│  └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Stripe   │ │  Email   │ │  Queue   │   │
│  │ (Billing)│ │ (SMTP)   │ │ (BullMQ) │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────┘
```

---

## 🎯 Princípios Arquiteturais

### 1. **Separation of Concerns**
- Cada camada tem responsabilidade única e bem definida
- Frontend nunca acessa banco de dados diretamente
- Backend expõe apenas APIs bem definidas

### 2. **Multi-Tenancy**
- Isolamento por `companyId` em todas as queries
- Middleware automático de tenant
- Data isolation garantida no nível de banco

### 3. **Type Safety**
- TypeScript em 100% do código
- Validação runtime com Zod/class-validator
- Tipos compartilhados entre frontend/backend

### 4. **Scalability**
- Stateless API (pode escalar horizontalmente)
- Cache estratégico com Redis
- Queue system para tarefas assíncronas

### 5. **Security First**
- Authentication e Authorization em todas as rotas
- Input validation rigorosa
- Rate limiting por tenant
- CORS configurado corretamente

---

## 📁 Estrutura de Pastas Proposta

```
harmony-house-saas/
├── apps/
│   ├── web/                      # Frontend Web App
│   │   ├── src/
│   │   │   ├── app/              # App shell (providers, router)
│   │   │   ├── features/         # Feature modules (DDD)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   ├── stores/
│   │   │   │   │   └── types/
│   │   │   │   ├── customers/
│   │   │   │   ├── projects/
│   │   │   │   ├── documents/
│   │   │   │   └── ...
│   │   │   ├── shared/           # Shared components/utilities
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── lib/
│   │   │   │   ├── types/
│   │   │   │   └── utils/
│   │   │   ├── assets/
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── api/                      # Backend API
│   │   ├── src/
│   │   │   ├── common/           # Shared code
│   │   │   │   ├── decorators/
│   │   │   │   ├── filters/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── pipes/
│   │   │   │   └── types/
│   │   │   ├── config/           # Configuration modules
│   │   │   ├── database/         # Prisma setup
│   │   │   │   └── prisma/
│   │   │   │       ├── schema.prisma
│   │   │   │       ├── migrations/
│   │   │   │       └── seed.ts
│   │   │   ├── modules/          # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── guards/
│   │   │   │   │   ├── strategies/
│   │   │   │   │   └── __tests__/
│   │   │   │   ├── customers/
│   │   │   │   ├── projects/
│   │   │   │   └── ...
│   │   │   └── main.ts
│   │   ├── prisma/               # Prisma config (separado)
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── mobile/                   # Mobile App (Future)
│       └── ...
│
├── packages/                     # Shared packages
│   ├── types/                    # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── api.ts
│   │   │   ├── entities.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                       # Shared UI components (Future)
│   │   └── ...
│   │
│   └── config/                   # Shared configs
│       ├── eslint/
│       ├── typescript/
│       └── ...
│
├── infrastructure/               # Infrastructure as Code
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.web
│   │   └── docker-compose.yml
│   ├── terraform/                # IaC (Future)
│   └── k8s/                      # Kubernetes (Future)
│
├── docs/                         # Documentation
│   ├── 01-CONCEITO-E-VISAO.md
│   ├── 02-ARQUITETURA-PROPOSTA.md
│   ├── 03-STACK-TECNOLOGICO.md
│   ├── 04-GUIA-IMPLEMENTACAO.md
│   └── ...
│
├── scripts/                      # Utility scripts
│   ├── setup.sh
│   ├── migrate.sh
│   └── deploy.sh
│
├── .github/
│   └── workflows/                # CI/CD
│       ├── ci.yml
│       ├── cd.yml
│       └── ...
│
├── package.json                  # Root package.json (monorepo)
├── pnpm-workspace.yaml           # pnpm workspaces
├── turbo.json                    # Turborepo config
├── .env.example
└── README.md
```

---

## 🔄 Fluxo de Dados

### Request Flow

```
1. Client Request
   ↓
2. API Gateway (NestJS)
   ├── CORS Validation
   ├── Rate Limiting
   ├── Authentication (JWT)
   └── Request Logging
   ↓
3. Controller Layer
   ├── Route Matching
   ├── DTO Validation (class-validator)
   └── Authorization Check (Guards)
   ↓
4. Service Layer
   ├── Business Logic
   ├── Domain Rules
   └── Use Case Execution
   ↓
5. Repository Layer (Prisma)
   ├── Query Building
   ├── Multi-tenancy Filter
   └── Database Transaction
   ↓
6. Database (PostgreSQL)
   ↓
7. Response
   ├── Serialization
   ├── Error Handling
   └── Response Logging
   ↓
8. Client
```

### Multi-Tenancy Flow

```typescript
// Em TODAS as queries, o tenant é automaticamente filtrado

// ❌ ERRADO - Sem filtro de tenant
const customers = await prisma.customer.findMany()

// ✅ CORRETO - Com filtro automático via middleware
const customers = await prisma.customer.findMany({
  where: { companyId: user.companyId } // Injetado automaticamente
})
```

---

## 🔐 Segurança

### Authentication & Authorization

1. **JWT Tokens**
   - Access Token: 15 minutos (rotaciona automaticamente)
   - Refresh Token: 7 dias (httpOnly cookie)
   - Rotation strategy para segurança

2. **RBAC (Role-Based Access Control)**
   - Roles: ADMIN, MANAGER, SALES, WORKER
   - Permissions granulares por feature
   - Guard decorators: `@Roles()`, `@Permissions()`

3. **Multi-Tenancy Security**
   - Tenant isolation no middleware
   - Verificação automática de ownership
   - Cross-tenant access prevention

### Data Validation

1. **Input Validation**
   - DTOs com class-validator no backend
   - Zod schemas no frontend (runtime validation)
   - Sanitização de inputs

2. **Output Validation**
   - Serialization de responses
   - Redação de dados sensíveis
   - Rate limiting por endpoint

---

## 📦 Camadas da Aplicação

### 1. **Presentation Layer (Frontend)**

**Responsabilidades:**
- Renderizar UI
- Capturar input do usuário
- Gerenciar estado da UI
- Fazer requisições HTTP

**Tecnologias:**
- React 18+
- React Router
- TanStack Query (server state)
- Zustand (client state)
- React Hook Form

**Regras:**
- ❌ NUNCA acessa banco diretamente
- ❌ NUNCA contém lógica de negócio complexa
- ✅ Valida dados antes de enviar
- ✅ Trata erros de forma amigável

### 2. **API Layer (Backend - Controllers)**

**Responsabilidades:**
- Receber requisições HTTP
- Validar DTOs
- Chamar services
- Retornar responses

**Tecnologias:**
- NestJS Controllers
- class-validator
- class-transformer

**Regras:**
- ✅ Validação rigorosa de inputs
- ✅ Autenticação/Authorization obrigatória
- ❌ NUNCA contém lógica de negócio
- ✅ Tratamento consistente de erros

### 3. **Business Logic Layer (Services)**

**Responsabilidades:**
- Implementar regras de negócio
- Orquestrar operações
- Validar regras de domínio
- Coordenar repositories

**Tecnologias:**
- NestJS Services
- Domain Services
- Use Cases

**Regras:**
- ✅ Lógica de negócio isolada
- ✅ Testável (unit tests)
- ✅ Independe de frameworks
- ✅ Reutilizável

### 4. **Data Access Layer (Repositories)**

**Responsabilidades:**
- Abstrair acesso ao banco
- Gerenciar queries
- Transações
- Multi-tenancy filtering

**Tecnologias:**
- Prisma ORM
- Repository Pattern
- Query Builders

**Regras:**
- ✅ Abstração completa do ORM
- ✅ Queries otimizadas
- ✅ Índices adequados
- ✅ Migrations versionadas

---

## 🚀 Escalabilidade

### Horizontal Scaling

1. **Stateless API**
   - Sem sessões server-side
   - JWT tokens self-contained
   - Pode rodar múltiplas instâncias

2. **Load Balancing**
   - Nginx/Cloudflare na frente
   - Health checks automáticos
   - Auto-scaling baseado em métricas

3. **Database Scaling**
   - Read replicas para queries de leitura
   - Connection pooling
   - Query optimization

### Vertical Scaling

1. **Caching Strategy**
   - Redis para cache de sessões
   - Cache de queries frequentes
   - CDN para assets estáticos

2. **Queue System**
   - BullMQ para jobs assíncronos
   - Email sending
   - PDF generation
   - Report generation

---

## 📊 Observabilidade

### Logging

```typescript
// Structured logging com Pino
logger.info({
  event: 'user.login',
  userId: user.id,
  companyId: user.companyId,
  ip: request.ip,
  timestamp: new Date().toISOString()
})
```

### Monitoring

- **Application Metrics**: Prometheus + Grafana
- **Error Tracking**: Sentry
- **APM**: New Relic ou DataDog
- **Uptime Monitoring**: UptimeRobot

### Health Checks

```typescript
GET /health
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2025-01-10T..."
}
```

---

## 🔄 Versionamento de API

### Estratégia

- **URL Versioning**: `/api/v1/customers`
- **Semantic Versioning**: v1.0.0, v1.1.0, v2.0.0
- **Backward Compatibility**: Manter versões antigas por 6 meses
- **Deprecation Warnings**: Headers `X-API-Deprecated: true`

---

## 📝 Próximos Passos

1. ✅ Revisar este documento
2. ⏭️ Ver stack tecnológico em `03-STACK-TECNOLOGICO.md`
3. ⏭️ Seguir guia de implementação em `04-GUIA-IMPLEMENTACAO.md`
