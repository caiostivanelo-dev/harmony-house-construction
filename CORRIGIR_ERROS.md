# 🔧 Como Corrigir os Erros

## ❌ Erros que você está tendo:

1. **"Missing script: prisma:seed"** - Você executou de `apps/` mas precisa executar de `apps/api/`
2. **"Environment variable not found: DATABASE_URL"** - Arquivo `.env` não existe
3. **"Could not read package.json"** - Você executou `npm run dev` do diretório errado

## ✅ Solução Passo a Passo:

### PASSO 1: Criar arquivo `.env`

**No PowerShell, execute:**
```powershell
cd "c:\Projetos Dev\Harmony House SAAS\apps\api"
Copy-Item .env.example .env
```

**Depois, edite o arquivo `apps/api/.env` e configure a DATABASE_URL:**

Abra `apps/api/.env` em um editor e altere esta linha:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/harmony_house?schema=public"
```

**Substitua:**
- `user` → seu usuário do PostgreSQL (geralmente `postgres`)
- `password` → sua senha do PostgreSQL
- `harmony_house` → nome do banco (ou crie um banco com esse nome)

**Exemplo:**
```env
DATABASE_URL="postgresql://postgres:minhasenha123@localhost:5432/harmony_house?schema=public"
```

### PASSO 2: Criar o banco de dados (se não existir)

**No PostgreSQL, execute:**
```sql
CREATE DATABASE harmony_house;
```

Ou use o psql:
```bash
psql -U postgres
CREATE DATABASE harmony_house;
\q
```

### PASSO 3: Executar migrações e seed

**No PowerShell:**
```powershell
cd "c:\Projetos Dev\Harmony House SAAS\apps\api"
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
```

**Você deve ver:**
```
✅ Admin user created successfully!
📧 Email: caio@dev.com
🔑 Password: 123456
```

### PASSO 4: Rodar o projeto

**Na RAIZ do projeto:**
```powershell
cd "c:\Projetos Dev\Harmony House SAAS"
npm run dev
```

### PASSO 5: Fazer login

1. Acesse: http://localhost:5173
2. Use:
   - **Email:** `caio@dev.com`
   - **Senha:** `123456`

## 📝 Resumo dos Comandos (Copie e Cole):

```powershell
# 1. Criar .env
cd "c:\Projetos Dev\Harmony House SAAS\apps\api"
Copy-Item .env.example .env
# ⚠️ EDITE O .env E CONFIGURE A DATABASE_URL!

# 2. Gerar Prisma e Migrar
npx prisma generate
npx prisma migrate dev

# 3. Criar usuário admin
npm run prisma:seed

# 4. Rodar projeto (da RAIZ)
cd "c:\Projetos Dev\Harmony House SAAS"
npm run dev
```

## ⚠️ IMPORTANTE:

- **DATABASE_URL** deve apontar para um banco PostgreSQL que existe
- Execute `prisma:seed` de dentro de `apps/api/`
- Execute `npm run dev` da RAIZ do projeto
