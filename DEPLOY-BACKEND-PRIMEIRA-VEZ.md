# 🚀 Deploy do Backend - Primeira Vez

## 📋 Situação Atual

- ✅ Frontend deployado no Firebase (`app.shhconstructions.com`)
- ❌ Backend **NÃO está deployado** (só está rodando localmente)
- ✅ Domínio criado: `api.shhconstructions.com` (mas não aponta para lugar nenhum ainda)
- ⚠️ Backend usa **SQLite** localmente (precisa PostgreSQL para produção)

---

## 🎯 Objetivo

Fazer deploy do backend pela primeira vez para que fique acessível em `api.shhconstructions.com`.

---

## ⚠️ IMPORTANTE: Variáveis de Ambiente Necessárias

O backend precisa das seguintes variáveis de ambiente em produção:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/harmony_house?schema=public
JWT_SECRET=sua-chave-secreta-super-segura-aqui
FRONTEND_URL=https://app.shhconstructions.com
```

**🔐 Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🗄️ Banco de Dados: SQLite → PostgreSQL

**⚠️ IMPORTANTE:** O projeto usa SQLite localmente, mas **NÃO é recomendado para produção**.

**Opções de banco em produção:**

1. **Render.com** - PostgreSQL gratuito incluído
2. **Railway** - PostgreSQL incluído
3. **Supabase** - PostgreSQL gratuito
4. **Neon** - PostgreSQL serverless gratuito
5. **Google Cloud SQL** - Se usar Google Cloud

**Antes do deploy, você precisa:**
1. Criar um banco PostgreSQL em produção
2. Atualizar `apps/api/prisma/schema.prisma` para usar PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"  // Mudar de "sqlite" para "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Fazer migrations no banco de produção

---

## ✅ Opções de Deploy

### Opção 1: Render.com (🌟 RECOMENDADO - Mais Fácil)

**Vantagens:**
- ✅ Deploy super simples
- ✅ PostgreSQL gratuito incluído
- ✅ Deploy automático via Git
- ✅ SSL/HTTPS automático
- ✅ Domínio customizado fácil

**Passo a Passo:**

1. **Acessar:** https://render.com
2. **Criar conta** (pode usar GitHub)
3. **Criar PostgreSQL Database:**
   - New → PostgreSQL
   - Name: `harmony-house-db`
   - Database: `harmony_house`
   - User: `harmony_user`
   - Region: mais próximo de você
   - **Copiar DATABASE_URL** (vai precisar depois)

4. **Criar Web Service:**
   - New → Web Service
   - Connect GitHub → Escolher repositório
   - Name: `harmony-house-api`
   - Region: mesmo do banco
   - Branch: `main` (ou `master`)
   - Root Directory: `apps/api`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm run start:prod`
   - Instance Type: `Free` (para começar)

5. **Adicionar Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<cole a URL do PostgreSQL aqui>
   JWT_SECRET=<cole sua chave JWT aqui>
   FRONTEND_URL=https://app.shhconstructions.com
   ```

6. **Criar o serviço** (vai fazer deploy automaticamente)

7. **Adicionar Domínio Customizado:**
   - Settings → Custom Domains
   - Add Custom Domain: `api.shhconstructions.com`
   - Render vai dar instruções de DNS

---

### Opção 2: Railway (⚡ Super Rápido)

**Vantagens:**
- ✅ Deploy automático via Git
- ✅ PostgreSQL incluído
- ✅ Gratuito para começar
- ✅ Configuração muito simples

**Passo a Passo:**

1. **Acessar:** https://railway.app
2. **Criar conta** (pode usar GitHub)
3. **New Project → Deploy from GitHub repo**
4. **Adicionar PostgreSQL:**
   - + New → Database → PostgreSQL
   - Railway cria automaticamente
   - **Copiar DATABASE_URL** das variáveis

5. **Configurar o serviço:**
   - Railway detecta automaticamente
   - Root Directory: `apps/api`
   - Build Command: `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm run start:prod`

6. **Adicionar Environment Variables:**
   - Variables tab
   - Adicionar:
     ```
     NODE_ENV=production
     DATABASE_URL=<URL do PostgreSQL>
     JWT_SECRET=<sua chave JWT>
     FRONTEND_URL=https://app.shhconstructions.com
     ```

7. **Adicionar Domínio:**
   - Settings → Domains
   - Generate Domain → Custom Domain: `api.shhconstructions.com`
   - Configurar DNS

---

### Opção 3: Firebase App Hosting

**Vantagens:**
- ✅ Já está usando Firebase para frontend
- ✅ Mesmo projeto Firebase
- ⚠️ Requer configuração mais complexa
- ⚠️ Precisa de banco PostgreSQL separado

**Como fazer:**

1. **Criar banco PostgreSQL** (Supabase, Neon, ou Google Cloud SQL)

2. **Configurar Firebase App Hosting:**
   ```bash
   firebase init app-hosting
   ```

3. **Criar Dockerfile** (Firebase App Hosting usa containers):
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY apps/api/package*.json ./
   RUN npm ci --only=production
   COPY apps/api .
   RUN npm run build
   CMD ["npm", "run", "start:prod"]
   ```

4. **Configurar variáveis de ambiente no Firebase**

5. **Deploy:**
   ```bash
   firebase deploy --only app-hosting
   ```

---

## 🎯 Recomendação Final

Para **primeira vez**, recomendo:

1. **Render.com** ⭐⭐⭐⭐⭐
   - Mais fácil de configurar
   - PostgreSQL incluído
   - Suporte excelente
   - Gratuito para começar

2. **Railway** ⭐⭐⭐⭐
   - Super rápido
   - Interface moderna
   - PostgreSQL incluído

---

## 📝 Checklist Antes do Deploy

- [ ] Criar conta no serviço escolhido (Render ou Railway)
- [ ] Criar banco PostgreSQL
- [ ] Gerar `JWT_SECRET` seguro
- [ ] Atualizar `schema.prisma` para PostgreSQL (se necessário)
- [ ] Testar conexão com banco
- [ ] Fazer migrations no banco de produção
- [ ] Configurar variáveis de ambiente
- [ ] Fazer deploy
- [ ] Configurar domínio `api.shhconstructions.com`
- [ ] Testar API em produção

---

## 🚨 IMPORTANTE: Atualizar Schema Prisma

**Antes do deploy, você PRECISA atualizar o schema para PostgreSQL:**

1. **Editar `apps/api/prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"  // Mudar de "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. **Fazer migration:**
   ```bash
   cd apps/api
   npx prisma migrate dev --name init_postgres
   ```

---

## 🔍 Depois do Deploy

1. ✅ Verificar se API está respondendo: `https://api.shhconstructions.com/health` (ou endpoint de teste)
2. ✅ Verificar CORS (já está configurado no código)
3. ✅ Testar login em produção
4. ✅ Verificar logs do serviço

---

**Qual serviço você quer usar? Render ou Railway? Posso ajudar com os passos específicos! 🚀**
