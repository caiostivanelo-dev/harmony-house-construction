# Troubleshooting - Harmony House SaaS

## Problemas comuns ao rodar `npm run dev`

### 1. Dependências não instaladas

**Solução:**
```bash
# Na raiz do projeto
npm install

# Ou instalar em cada workspace
cd apps/web && npm install
cd ../api && npm install
```

### 2. Prisma Client não gerado

**Erro:** `Cannot find module '@prisma/client'` ou `PrismaClient is not defined`

**Solução:**
```bash
cd apps/api
npx prisma generate
```

### 3. Banco de dados não configurado

**Erro:** `Can't reach database server` ou `Connection refused`

**Solução:**
1. Certifique-se de que o PostgreSQL está rodando
2. Crie um arquivo `.env` em `apps/api/` com:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/harmony_house?schema=public"
   ```
3. Execute as migrações:
   ```bash
   cd apps/api
   npx prisma migrate dev
   ```

### 4. Porta já em uso

**Erro:** `Port 3000 is already in use` ou `Port 5173 is already in use` ou `EADDRINUSE`

**Solução:**
- Feche outros processos usando essas portas:
  ```bash
  # Windows PowerShell
  netstat -ano | findstr :3000
  netstat -ano | findstr :5173
  # Depois mate o processo com taskkill /PID <numero> /F
  ```
- Ou altere as portas nas variáveis de ambiente:
  - Backend: Adicione `PORT=3001` no `.env` de `apps/api/`
  - Frontend: Configure no `vite.config.ts`:
    ```typescript
    export default defineConfig({
      server: { port: 5174 },
      // ...
    })
    ```

### 5. Erros de TypeScript

**Erro:** `TS4053`, `TS2307`, ou outros erros de compilação

**Solução:**
```bash
# Limpar cache do TypeScript (Windows PowerShell)
cd apps/api
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item tsconfig.tsbuildinfo -ErrorAction SilentlyContinue

cd ../web
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue
```

### 5.1. Erros específicos do Prisma

**Erro:** `@prisma/client did not initialize yet` ou tipos do Prisma não encontrados

**Solução:**
```bash
cd apps/api
npx prisma generate
# Aguarde a conclusão antes de rodar npm run dev
```

### 6. Problemas com workspaces do npm

**Erro:** `workspace not found` ou dependências não encontradas

**Solução:**
```bash
# Na raiz do projeto
npm install
# Isso deve instalar dependências em todos os workspaces

# Se ainda não funcionar, instale manualmente:
cd apps/web
npm install
cd ../api
npm install
```

### 7. Variáveis de ambiente faltando

**Erro:** `STRIPE_SECRET_KEY is required` ou outros erros de variáveis de ambiente

**Solução:**
1. Crie `apps/api/.env` baseado em `apps/api/.env.example`:
   ```bash
   cd apps/api
   copy .env.example .env
   ```
2. Variáveis **obrigatórias**:
   - `DATABASE_URL` - URL de conexão do PostgreSQL
   - `JWT_SECRET` - Chave secreta para JWT (pode usar qualquer string para desenvolvimento)
3. Variáveis **opcionais** (só se usar essas features):
   - `STRIPE_SECRET_KEY` - **OPCIONAL** - Só necessário se usar billing (agora o backend inicia sem ela)
   - `SMTP_*` - Só necessário se usar envio de emails
   - `PORT` - Padrão: 3000
   - `FRONTEND_URL` - Padrão: http://localhost:5173

**Nota:** O backend agora inicia mesmo sem `STRIPE_SECRET_KEY`. Você verá um aviso, mas o sistema funcionará normalmente (apenas features de billing estarão desabilitadas).

### 8. Verificar se tudo está configurado

**Checklist:**
- [ ] `node_modules` existe em `apps/web/` e `apps/api/`
- [ ] `apps/api/.env` existe com `DATABASE_URL` configurada
- [ ] Prisma Client foi gerado (`npx prisma generate` executado)
- [ ] Migrações do banco foram executadas (`npx prisma migrate dev`)
- [ ] Portas 3000 e 5173 estão livres
- [ ] PostgreSQL está rodando e acessível

### 9. Rodar manualmente (para debug)

**Backend (terminal 1):**
```bash
cd apps/api
npm run start:dev
```

**Frontend (terminal 2):**
```bash
cd apps/web
npm run dev
```

Isso ajuda a identificar qual parte está falhando.

### 10. Limpar tudo e reinstalar (Windows PowerShell)

```powershell
# Na raiz do projeto
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\web\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\api\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\api\dist -ErrorAction SilentlyContinue

# Reinstalar
npm install

# Gerar Prisma Client
cd apps/api
npx prisma generate
npx prisma migrate dev
```

### 11. Erro específico: "Cannot find module" ou import errors

**Solução:**
```bash
# Verificar se os paths estão corretos
cd apps/web
npm run build  # Testa se compila

cd ../api
npm run build  # Testa se compila
```

### 12. Problema com concurrently

**Erro:** `concurrently: command not found`

**Solução:**
```bash
# Na raiz
npm install concurrently --save-dev
```

## Passo a passo completo para primeira execução

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar banco de dados:**
   ```bash
   cd apps/api
   copy .env.example .env
   # Edite .env com suas credenciais
   ```

3. **Gerar Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Executar migrações:**
   ```bash
   npx prisma migrate dev
   ```

5. **Rodar o projeto:**
   ```bash
   cd ../..  # Volta para raiz
   npm run dev
   ```

## Se ainda não funcionar

1. Verifique os logs de erro completos
2. Tente rodar backend e frontend separadamente
3. Verifique se todas as portas estão livres
4. Confirme que o PostgreSQL está rodando
5. Verifique se o arquivo `.env` está correto
