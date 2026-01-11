# 🚀 Guia de Implementação Passo a Passo

Este documento fornece um guia completo e sequencial para implementar o Harmony House SaaS do zero, seguindo as melhores práticas identificadas na revisão do código existente.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Node.js 18+ instalado
- ✅ pnpm instalado globalmente (`npm i -g pnpm`)
- ✅ Git configurado
- ✅ Editor de código (VS Code recomendado)
- ✅ PostgreSQL 15+ instalado (ou Docker)
- ✅ Redis instalado (ou Docker)
- ✅ Conta no GitHub para CI/CD
- ✅ Conta Stripe para pagamentos (desenvolvimento)

---

## 🎯 Fase 1: Setup Inicial (Dia 1-2)

### 1.1 Criar Estrutura do Monorepo

```bash
# Criar pasta do projeto
mkdir harmony-house-saas
cd harmony-house-saas

# Inicializar Git
git init
git branch -M main

# Criar estrutura básica
mkdir -p apps/web apps/api packages/types infrastructure/docker scripts docs

# Criar arquivos raiz
touch package.json pnpm-workspace.yaml turbo.json .gitignore .env.example README.md
```

### 1.2 Configurar Workspaces (pnpm)

**pnpm-workspace.yaml:**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**package.json (root):**
```json
{
  "name": "harmony-house-saas",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^1.11.0",
    "prettier": "^3.1.0",
    "eslint": "^8.55.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

### 1.3 Configurar Turborepo

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 1.4 Configurar ESLint e Prettier (Root)

**.eslintrc.js:**
```javascript
module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  env: {
    node: true,
    es2022: true,
  },
  ignorePatterns: ['node_modules', 'dist', 'build', '.next'],
}
```

**.prettierrc:**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

**.gitignore:**
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
.next/
.turbo/

# Environment variables
.env
.env.local
.env*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Testing
coverage/
.nyc_output/

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Database
*.db
*.sqlite
```

### 1.5 Criar Docker Compose para Dev

**infrastructure/docker/docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: harmony-postgres
    environment:
      POSTGRES_USER: harmony
      POSTGRES_PASSWORD: harmony_dev
      POSTGRES_DB: harmony_house
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U harmony"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: harmony-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

**Scripts úteis:**
```bash
# Criar script para subir infraestrutura
echo 'docker-compose -f infrastructure/docker/docker-compose.yml up -d' > scripts/dev-infra.sh
chmod +x scripts/dev-infra.sh
```

---

## 🎨 Fase 2: Setup Frontend (Dia 3-4)

### 2.1 Criar App React com Vite

```bash
cd apps
pnpm create vite@latest web -- --template react-ts
cd web
```

### 2.2 Instalar Dependências Essenciais

```bash
# Core
pnpm add react react-dom react-router-dom

# State Management
pnpm add @tanstack/react-query zustand

# Forms
pnpm add react-hook-form @hookform/resolvers zod

# UI
pnpm add tailwindcss postcss autoprefixer
pnpm add -D @types/node

# Icons
pnpm add lucide-react

# Utilities
pnpm add date-fns clsx tailwind-merge

# DevDependencies
pnpm add -D @vitejs/plugin-react
pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
pnpm add -D eslint-plugin-react eslint-plugin-react-hooks
pnpm add -D prettier eslint-config-prettier
```

### 2.3 Configurar Vite

**apps/web/vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

### 2.4 Configurar TypeScript

**apps/web/tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 2.5 Configurar Tailwind CSS

```bash
cd apps/web
npx tailwindcss init -p
```

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
```

### 2.6 Instalar shadcn/ui

```bash
cd apps/web
npx shadcn-ui@latest init
# Seguir prompts: TypeScript, Tailwind, Default style
```

Instalar componentes básicos:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
npx shadcn-ui@latest add toast
```

### 2.7 Criar Estrutura de Pastas Frontend

```bash
cd apps/web/src
mkdir -p app features shared assets styles
cd features
mkdir -p auth customers projects documents tasks timelogs dashboard billing
cd ../shared
mkdir -p components hooks lib types utils
```

**Estrutura completa:**
```
apps/web/src/
├── app/
│   ├── providers.tsx       # React Query, Theme, etc.
│   ├── router.tsx          # React Router config
│   └── App.tsx
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── types/
│   ├── customers/
│   ├── projects/
│   └── ...
├── shared/
│   ├── components/         # UI components reutilizáveis
│   ├── hooks/              # Custom hooks compartilhados
│   ├── lib/                # API client, utils
│   ├── types/              # Tipos TypeScript compartilhados
│   └── utils/              # Funções utilitárias
├── assets/
├── styles/
│   └── globals.css
├── main.tsx
└── vite-env.d.ts
```

---

## 🔧 Fase 3: Setup Backend (Dia 5-6)

### 3.1 Criar App NestJS

```bash
cd apps
pnpm add -g @nestjs/cli
nest new api
cd api
```

### 3.2 Instalar Dependências Essenciais

```bash
# Core NestJS
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express
pnpm add reflect-metadata rxjs

# Database
pnpm add @prisma/client
pnpm add -D prisma

# Authentication
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt
pnpm add bcrypt
pnpm add -D @types/passport-jwt @types/bcrypt

# Validation
pnpm add class-validator class-transformer

# Config
pnpm add @nestjs/config

# Utilities
pnpm add date-fns

# DevDependencies
pnpm add -D @nestjs/cli @nestjs/schematics @nestjs/testing
pnpm add -D typescript ts-node ts-loader
pnpm add -D @types/node @types/express
pnpm add -D jest @types/jest ts-jest
pnpm add -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### 3.3 Configurar Prisma

```bash
cd apps/api
npx prisma init
```

**prisma/schema.prisma:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Models serão adicionados nas próximas fases
```

**apps/api/.env:**
```env
DATABASE_URL="postgresql://harmony:harmony_dev@localhost:5432/harmony_house?schema=public"
JWT_SECRET="change-me-in-production-use-strong-random-string"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="change-me-in-production-use-strong-random-string"
REFRESH_TOKEN_EXPIRES_IN="7d"
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

### 3.4 Configurar Estrutura Backend

```bash
cd apps/api/src
mkdir -p common/{decorators,filters,guards,interceptors,pipes,types}
mkdir -p config
mkdir -p modules/{auth,users,customers,projects,documents,tasks,timelogs,dashboard,billing}
```

### 3.5 Criar Módulo Prisma

**apps/api/src/common/database/prisma.service.ts:**
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
```

**apps/api/src/common/database/prisma.module.ts:**
```typescript
import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 3.6 Configurar CORS e Validation Global

**apps/api/src/main.ts:**
```typescript
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  )

  // CORS
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? frontendUrl : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // Global prefix
  app.setGlobalPrefix('api')

  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log(`🚀 API running on: http://localhost:${port}/api`)
}

bootstrap()
```

---

## 🔐 Fase 4: Autenticação e Autorização (Dia 7-9)

### 4.1 Criar Schema de Autenticação (Prisma)

**prisma/schema.prisma** (adicionar):
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  name          String
  role          Role     @default(WORKER)
  companyId     String
  company       Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  refreshToken  String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([email])
  @@index([companyId])
}

model Company {
  id        String   @id @default(uuid())
  name      String
  users     User[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  ADMIN
  MANAGER
  SALES
  WORKER
}
```

Rodar migration:
```bash
cd apps/api
npx prisma migrate dev --name init_auth
npx prisma generate
```

### 4.2 Criar DTOs de Autenticação

**apps/api/src/modules/auth/dto/login.dto.ts:**
```typescript
import { IsEmail, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string
}
```

**apps/api/src/modules/auth/dto/register.dto.ts:**
```typescript
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'

export class RegisterDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsString()
  name: string

  @IsString()
  @IsOptional()
  companyName?: string
}
```

### 4.3 Implementar Auth Service

**apps/api/src/modules/auth/auth.service.ts:**
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../../common/database/prisma.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { company: true },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const { password: _, ...result } = user
    return result
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password)

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.companyId)

    // Save refresh token
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    })

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
    }
  }

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    })

    if (existingUser) {
      throw new UnauthorizedException('User already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10)

    // Create company or use existing
    let company
    if (registerDto.companyName) {
      company = await this.prisma.company.create({
        data: { name: registerDto.companyName },
      })
    } else {
      // Use default company or create new
      company = await this.prisma.company.create({
        data: { name: `${registerDto.name}'s Company` },
      })
    }

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        companyId: company.id,
        role: 'ADMIN', // First user is admin
      },
      include: { company: true },
    })

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.companyId)

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    })

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
    }
  }

  private async generateTokens(userId: string, email: string, role: string, companyId: string) {
    const payload = { sub: userId, email, role, companyId }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN', '7d'),
      }),
    ])

    return { accessToken, refreshToken }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      })

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { company: true },
      })

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException()
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role, user.companyId)

      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      })

      return tokens
    } catch {
      throw new UnauthorizedException()
    }
  }
}
```

### 4.4 Implementar JWT Strategy

**apps/api/src/modules/auth/strategies/jwt.strategy.ts:**
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../common/database/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || (() => {
        throw new Error('JWT_SECRET must be defined')
      })(),
    })
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { company: true },
    })

    if (!user) {
      throw new UnauthorizedException()
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    }
  }
}
```

### 4.5 Criar Guards e Decorators

**apps/api/src/modules/auth/guards/jwt-auth.guard.ts:**
```typescript
import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**apps/api/src/modules/auth/decorators/public.decorator.ts:**
```typescript
import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
```

**apps/api/src/modules/auth/decorators/user.decorator.ts:**
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  }
)
```

### 4.6 Criar Auth Controller

**apps/api/src/modules/auth/auth.controller.ts:**
```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { Public } from './decorators/public.decorator'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken)
  }
}
```

### 4.7 Criar Auth Module

**apps/api/src/modules/auth/auth.module.ts:**
```typescript
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './strategies/jwt.strategy'
import { PrismaModule } from '../../common/database/prisma.module'

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || (() => {
          throw new Error('JWT_SECRET must be defined')
        })(),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

---

## ✅ Checklist da Fase 4

- [ ] Schema Prisma com User e Company criado
- [ ] Migration executada com sucesso
- [ ] DTOs de Login e Register criados e validados
- [ ] AuthService com hash de senha (bcrypt)
- [ ] JWT Strategy implementada
- [ ] Guards e Decorators criados
- [ ] AuthController com rotas públicas
- [ ] AuthModule configurado
- [ ] Testes de integração passando

**Próxima fase:** Continuar em `05-FUNCIONALIDADES-CORE.md` para implementar features principais.

---

## 📝 Notas Importantes

1. **Segurança:**
   - ✅ NUNCA usar JWT_SECRET com fallback em produção
   - ✅ Sempre validar inputs com DTOs
   - ✅ Hash de senha com bcrypt (salt rounds: 10)
   - ✅ Refresh tokens em httpOnly cookies (futuro)

2. **Boas Práticas:**
   - ✅ Usar class-validator para validação
   - ✅ Separar concerns (Service, Controller, DTO)
   - ✅ Error handling consistente
   - ✅ Logging estruturado

3. **Performance:**
   - ✅ Índices no banco (email, companyId)
   - ✅ Queries otimizadas (evitar N+1)
   - ✅ Cache de usuários frequentes (futuro)
