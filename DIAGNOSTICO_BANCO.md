# 🔍 Diagnóstico - Problema de Conexão com PostgreSQL

## ❌ Erro Encontrado:
```
Error: P1001: Can't reach database server at `localhost:5432`
```

## ✅ O que já foi feito:
- ✅ Arquivo `.env` criado
- ✅ Prisma Client gerado

## ⚠️ O que precisa ser feito:

### 1. Verificar se PostgreSQL está instalado e rodando

**No PowerShell, teste:**
```powershell
# Verificar se PostgreSQL está instalado
Get-Service -Name "*postgresql*"

# Ou verificar se a porta 5432 está em uso
Test-NetConnection localhost -Port 5432
```

### 2. Iniciar PostgreSQL (se não estiver rodando)

**Se instalado via Windows:**
```powershell
# Iniciar serviço PostgreSQL
Start-Service postgresql-x64-XX  # Substitua XX pela versão
```

**Ou use o Services do Windows:**
1. Pressione `Win + R`
2. Digite `services.msc`
3. Procure por "PostgreSQL"
4. Clique com botão direito → Start

### 3. Configurar DATABASE_URL no .env

**Edite `apps/api/.env` e configure corretamente:**

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/harmony_house?schema=public"
```

**Valores comuns:**
- **USUARIO:** `postgres` (padrão do PostgreSQL)
- **SENHA:** A senha que você definiu na instalação
- **PORT:** `5432` (padrão)
- **DATABASE:** `harmony_house` (será criado automaticamente)

**Exemplo:**
```env
DATABASE_URL="postgresql://postgres:minhasenha123@localhost:5432/harmony_house?schema=public"
```

### 4. Criar o banco de dados (se necessário)

**Opção A - Via psql:**
```bash
psql -U postgres
CREATE DATABASE harmony_house;
\q
```

**Opção B - Via Prisma (criará automaticamente):**
O Prisma tentará criar o banco quando você executar `prisma migrate dev`

### 5. Testar conexão

```powershell
cd apps/api
npx prisma db push  # Testa conexão sem criar migração
```

### 6. Executar migrações e seed

```powershell
cd apps/api
npx prisma migrate dev
npm run prisma:seed
```

## 🆘 Se ainda não funcionar:

### Verificar credenciais:
1. Abra o pgAdmin ou psql
2. Teste fazer login com as credenciais
3. Se não conseguir, pode precisar resetar a senha do postgres

### Criar banco manualmente:
```sql
-- No psql
CREATE DATABASE harmony_house;
```

### Verificar porta do PostgreSQL:
Se o PostgreSQL estiver em outra porta, altere na DATABASE_URL:
```env
DATABASE_URL="postgresql://postgres:senha@localhost:5433/harmony_house?schema=public"
```
