# 🔧 Solução: Erro "Cannot POST /auth/login"

## 🔍 Diagnóstico

O erro **"Cannot POST /auth/login"** geralmente indica um destes problemas:

1. ❌ **Backend não está rodando**
2. ❌ **Rota não existe ou está incorreta**
3. ❌ **URL da API está errada**
4. ❌ **Backend não tem prefixo global configurado**

---

## ✅ Solução Rápida

### Passo 1: Verificar se o Backend está Rodando

```bash
# Abrir um terminal e ir para a pasta do backend
cd apps/api

# Verificar se está rodando na porta 3000
# Deve aparecer: "Application is running on: http://localhost:3000"

# Se NÃO estiver rodando, iniciar:
npm run start:dev
# ou
pnpm run start:dev
```

### Passo 2: Verificar a Rota no Backend

O backend deve ter a rota configurada em:
- **Controller**: `apps/api/src/modules/auth/auth.controller.ts`
- **Rota**: `POST /auth/login`

### Passo 3: Verificar a URL no Frontend

O frontend está usando:
- **URL**: `http://localhost:3000/auth/login`

**Mas o backend pode estar usando prefixo `/api`!**

---

## 🔧 Correções Necessárias

### Opção 1: Se o Backend NÃO tem prefixo `/api`

A rota está correta: `http://localhost:3000/auth/login`

**Apenas certifique-se que o backend está rodando.**

### Opção 2: Se o Backend TEM prefixo `/api`

A rota deveria ser: `http://localhost:3000/api/auth/login`

**Corrigir no frontend:**

**apps/web/src/pages/Login.tsx** (linha 23-24):
```typescript
// ANTES:
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const response = await fetch(`${apiUrl}/auth/login`, {

// DEPOIS (se backend tem /api):
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const response = await fetch(`${apiUrl}/api/auth/login`, {
```

**apps/web/src/lib/api.ts** (linha 2 e 244):
```typescript
// ANTES:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// DEPOIS (se backend tem /api):
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api'
```

---

## 🔍 Como Verificar se o Backend tem Prefixo `/api`

Verifique em `apps/api/src/main.ts`:

```typescript
// Se tiver esta linha, o backend usa /api:
app.setGlobalPrefix('api')

// Neste caso, todas as rotas são: /api/auth/login, /api/customers, etc.
```

---

## ✅ Checklist de Verificação

Execute este checklist na ordem:

- [ ] **Backend está rodando?**
  ```bash
  cd apps/api
  npm run start:dev
  ```
  Deve aparecer: `Application is running on: http://localhost:3000`

- [ ] **Porta 3000 está livre?**
  ```bash
  # Verificar se algo está usando a porta 3000
  netstat -ano | findstr :3000
  ```

- [ ] **Frontend está rodando?**
  ```bash
  cd apps/web
  npm run dev
  ```
  Deve estar em: `http://localhost:5173`

- [ ] **Backend tem prefixo `/api`?**
  - Verificar `apps/api/src/main.ts`
  - Se SIM: usar `/api/auth/login`
  - Se NÃO: usar `/auth/login`

- [ ] **CORS está configurado?**
  - Verificar `apps/api/src/main.ts`
  - Deve permitir `http://localhost:5173`

- [ ] **Banco de dados está rodando?**
  ```bash
  # Se usar PostgreSQL:
  # Verificar se está rodando
  
  # Se usar SQLite:
  # Verificar se apps/api/prisma/dev.db existe
  ```

---

## 🚀 Solução Passo a Passo (RECOMENDADO)

### 1. Iniciar Backend

```bash
# Terminal 1
cd "C:\Projetos Dev\Harmony House SAAS\apps\api"
npm install  # se necessário
npm run start:dev
```

**Deve aparecer:**
```
🚀 Application is running on: http://localhost:3000
```

### 2. Verificar Rota no Backend

Teste diretamente no navegador ou Postman:
```
http://localhost:3000/auth/login
```

Se der erro 404, tentar:
```
http://localhost:3000/api/auth/login
```

### 3. Verificar Frontend

```bash
# Terminal 2
cd "C:\Projetos Dev\Harmony House SAAS\apps\web"
npm install  # se necessário
npm run dev
```

### 4. Corrigir URL no Frontend (se necessário)

Se o backend usa `/api`, corrigir:
- `apps/web/src/pages/Login.tsx`
- `apps/web/src/lib/api.ts`

---

## 🐛 Erros Comuns e Soluções

### Erro: "Cannot POST /auth/login"

**Causa**: Backend não está rodando OU rota está errada

**Solução**:
1. Verificar se backend está rodando
2. Verificar se a URL está correta (`/auth/login` ou `/api/auth/login`)

### Erro: "Network Error" ou "Failed to fetch"

**Causa**: Backend não está rodando OU CORS está bloqueando

**Solução**:
1. Verificar se backend está rodando
2. Verificar CORS em `apps/api/src/main.ts`

### Erro: 404 Not Found

**Causa**: Rota não existe no backend

**Solução**:
1. Verificar `apps/api/src/modules/auth/auth.controller.ts`
2. Verificar se `AuthModule` está importado em `app.module.ts`
3. Verificar prefixo global (`/api` ou não)

### Erro: 401 Unauthorized

**Causa**: Credenciais incorretas OU usuário não existe

**Solução**:
1. Verificar se usuário existe no banco
2. Verificar credenciais (email e senha)
3. Rodar seed do banco se necessário

---

## 🔍 Teste Rápido

Teste a rota diretamente no navegador ou Postman:

```bash
# POST http://localhost:3000/auth/login
# Headers:
Content-Type: application/json

# Body:
{
  "email": "caio@dev.com",
  "password": "123456"
}
```

Se funcionar aqui mas não no frontend, o problema é a URL no frontend.

---

## 📝 Próximos Passos

1. ✅ Verificar se backend está rodando
2. ✅ Verificar prefixo global (`/api` ou não)
3. ✅ Corrigir URL no frontend se necessário
4. ✅ Testar login novamente

---

**Precisa de mais ajuda? Verifique:**
- Backend está rodando na porta 3000?
- Frontend está rodando na porta 5173?
- URL da API está correta?
