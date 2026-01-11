# Quick Start - Harmony House SaaS

## Setup Rápido (Primeira Vez)

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Backend

**Criar arquivo `.env` em `apps/api/`:**

No Windows PowerShell:
```powershell
cd apps/api
Copy-Item .env.example .env
```

Ou copie manualmente o arquivo `.env.example` para `.env`

**Editar `apps/api/.env` com:**
```env
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/harmony_house?schema=public"
JWT_SECRET=qualquer-chave-secreta-para-desenvolvimento
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Gerar Prisma Client e executar migrações:**
```bash
npx prisma generate
npx prisma migrate dev
```

**Criar usuário admin inicial:**
```bash
npm run prisma:seed
```

Isso criará um usuário admin com:
- Email: `caio@dev.com`
- Senha: `123456`
- Role: `ADMIN`

**⚠️ IMPORTANTE:** Execute o seed ANTES de rodar `npm run dev` pela primeira vez!

### 3. Rodar o Projeto

**Na raiz do projeto:**
```bash
npm run dev
```

Isso vai iniciar:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Problemas Comuns

### Erro: "Cannot find module '@prisma/client'"
```bash
cd apps/api
npx prisma generate
```

### Erro: "Can't reach database server"
1. Verifique se PostgreSQL está rodando
2. Confirme que `DATABASE_URL` no `.env` está correto
3. Teste a conexão:
   ```bash
   psql -U seu_usuario -d harmony_house
   ```

### Erro: "Port already in use"
- Feche outros processos nas portas 3000 ou 5173
- Ou altere as portas no `.env` e `vite.config.ts`

### Erro: "STRIPE_SECRET_KEY is required"
- Adicione `STRIPE_SECRET_KEY=sk_test_...` no `.env` (ou deixe vazio se não usar billing)
- Ou comente/remova a validação no `BillingService` temporariamente

## Rodar Separadamente (Para Debug)

**Terminal 1 - Backend:**
```bash
cd apps/api
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm run dev
```

## Verificação Rápida

Execute estes comandos para verificar se está tudo OK:

```bash
# 1. Verificar dependências
npm list --depth=0

# 2. Verificar Prisma Client
cd apps/api
npx prisma --version
npx prisma generate

# 3. Verificar TypeScript
cd ../web
npx tsc --noEmit
cd ../api
npx tsc --noEmit
```
