# Setup de Login - Passo a Passo

## ⚠️ IMPORTANTE: Execute estes passos na ordem!

### 1. Configurar Banco de Dados

**Criar arquivo `.env` em `apps/api/`:**

```bash
cd apps/api
copy .env.example .env
```

**Editar `apps/api/.env` e configurar:**
```env
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/harmony_house?schema=public"
JWT_SECRET=qualquer-chave-secreta-para-desenvolvimento
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**⚠️ IMPORTANTE:** Substitua `seu_usuario`, `sua_senha` e `harmony_house` pelos valores do seu PostgreSQL!

### 2. Gerar Prisma Client e Executar Migrações

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
```

### 3. Criar Usuário Admin

```bash
cd apps/api
npm run prisma:seed
```

Você deve ver:
```
✅ Admin user created successfully!
📧 Email: caio@dev.com
🔑 Password: 123456
```

### 4. Rodar o Projeto

**Na raiz do projeto:**
```bash
cd ../..
npm run dev
```

### 5. Fazer Login

1. Acesse: http://localhost:5173
2. Você será redirecionado para `/login`
3. Use as credenciais:
   - **Email:** `caio@dev.com`
   - **Senha:** `123456`

## Troubleshooting

### Erro: "Environment variable not found: DATABASE_URL"
- **Solução:** Crie o arquivo `.env` em `apps/api/` com a `DATABASE_URL` configurada

### Erro: "Can't reach database server"
- **Solução:** Verifique se o PostgreSQL está rodando e se a `DATABASE_URL` está correta

### Erro: "Missing script: prisma:seed"
- **Solução:** Execute o comando de dentro de `apps/api/`, não de `apps/`

### Erro: "Could not read package.json"
- **Solução:** Certifique-se de estar no diretório correto (raiz do projeto para `npm run dev`)
