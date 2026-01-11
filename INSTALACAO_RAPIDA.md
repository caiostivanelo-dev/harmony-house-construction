# 🚀 Instalação Rápida - Harmony House SaaS

## ⚠️ PRÉ-REQUISITO: PostgreSQL

Este projeto **PRECISA** de PostgreSQL rodando. Você tem 3 opções:

---

## 📦 OPÇÃO 1: Docker (RECOMENDADO - Mais Fácil)

### Passo 1: Instalar Docker Desktop
1. Baixe: https://www.docker.com/products/docker-desktop/
2. Instale e reinicie o computador
3. Abra Docker Desktop e aguarde iniciar

### Passo 2: Iniciar PostgreSQL
```powershell
# Na raiz do projeto
docker run --name harmony-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_DB=harmony_house `
  -p 5432:5432 `
  -d postgres:15-alpine
```

### Passo 3: Aguardar PostgreSQL iniciar (10 segundos)
```powershell
Start-Sleep -Seconds 10
```

### Passo 4: Executar setup
```powershell
cd apps/api
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
cd ../..
npm run dev
```

---

## 💻 OPÇÃO 2: PostgreSQL Local (Instalação Windows)

### Passo 1: Instalar PostgreSQL
1. Baixe: https://www.postgresql.org/download/windows/
2. Instale com senha `postgres` (ou anote a senha que usar)
3. Durante instalação, deixe a porta `5432`

### Passo 2: Configurar .env
Edite `apps/api/.env` e configure:
```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/harmony_house?schema=public"
```

### Passo 3: Criar banco manualmente (opcional)
Abra pgAdmin ou psql e execute:
```sql
CREATE DATABASE harmony_house;
```

### Passo 4: Executar setup
```powershell
cd apps/api
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
cd ../..
npm run dev
```

---

## 🌐 OPÇÃO 3: PostgreSQL Remoto (Cloud)

### Passo 1: Criar banco em serviço cloud
- Supabase (grátis): https://supabase.com
- Neon (grátis): https://neon.tech
- Railway: https://railway.app
- Render: https://render.com

### Passo 2: Copiar connection string
Exemplo:
```
postgresql://usuario:senha@host:5432/harmony_house?schema=public
```

### Passo 3: Configurar .env
Edite `apps/api/.env`:
```env
DATABASE_URL="SUA_CONNECTION_STRING_AQUI"
```

### Passo 4: Executar setup
```powershell
cd apps/api
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
cd ../..
npm run dev
```

---

## ✅ Verificar se PostgreSQL está rodando

```powershell
# Testar porta
Test-NetConnection localhost -Port 5432
```

Se retornar sucesso, PostgreSQL está acessível!

---

## 🔑 Credenciais de Login (Após Seed)

- **Email:** `caio@dev.com`
- **Senha:** `123456`
- **Role:** `ADMIN`

---

## 🆘 Problemas Comuns

### "Can't reach database server"
- PostgreSQL não está rodando
- Verifique se o serviço está iniciado (Services do Windows)
- Teste a conexão: `Test-NetConnection localhost -Port 5432`

### "Authentication failed"
- Senha incorreta no `.env`
- Verifique a `DATABASE_URL` em `apps/api/.env`

### "Database does not exist"
- O Prisma cria automaticamente, mas se falhar:
- Crie manualmente: `CREATE DATABASE harmony_house;`

---

## 📝 Status Atual

✅ Arquivos criados:
- `apps/api/.env` (já configurado para postgres/postgres)
- `docker-compose.yml` (para usar Docker)
- `setup-completo.ps1` (script de setup automático)

❌ Pendente:
- PostgreSQL rodando na porta 5432
- Executar migrações e seed

---

## 🎯 Próximo Passo

**Escolha uma das 3 opções acima e siga os passos!**

Depois execute:
```powershell
npm run dev
```

Acesse: http://localhost:5173
