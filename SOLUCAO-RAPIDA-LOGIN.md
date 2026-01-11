# ⚡ Solução Rápida: Erro de Login

## 🔍 Problema Identificado

**Erro:** `Cannot POST /auth/login`

**Causa provável:** Backend não está respondendo corretamente OU não está rodando

---

## ✅ Solução Rápida (2 minutos)

### Passo 1: Verificar se Backend está Rodando

```bash
# Abrir terminal e verificar
cd apps/api
npm run start:dev
```

**Deve aparecer:**
```
[Nest] Application successfully started
Application is running on: http://localhost:3000
```

Se NÃO aparecer, o backend não está rodando.

### Passo 2: Testar Rota Diretamente

No navegador, abrir: `http://localhost:3000/auth/login`

**Se aparecer:**
- ✅ "Cannot GET /auth/login" = Backend está rodando, mas a rota precisa ser POST
- ❌ Erro de conexão = Backend não está rodando

### Passo 3: Verificar Banco de Dados

Se o backend está rodando mas o login falha, verificar:

```bash
cd apps/api
# Verificar se banco existe
ls prisma/dev.db  # SQLite
# ou
# Verificar se PostgreSQL está rodando
```

---

## 🚀 Solução Passo a Passo

### 1. Parar tudo e reiniciar

```bash
# Terminal 1: Backend
cd "C:\Projetos Dev\Harmony House SAAS\apps\api"
npm run start:dev

# Terminal 2: Frontend  
cd "C:\Projetos Dev\Harmony House SAAS\apps\web"
npm run dev
```

### 2. Verificar no navegador

Abrir: `http://localhost:5173`

Tentar fazer login com:
- Email: `caio@dev.com`
- Senha: `123456`

### 3. Se ainda não funcionar

Verificar no console do navegador (F12) qual erro aparece.

---

## 🔧 Correções Possíveis

### Correção 1: Banco de dados não está rodando

```bash
# Se usar SQLite:
# O arquivo deve existir: apps/api/prisma/dev.db

# Se usar PostgreSQL:
# Verificar se está rodando
docker ps  # Se usar Docker
```

### Correção 2: Usuário não existe no banco

```bash
cd apps/api
npm run prisma:seed
# ou
npx prisma db seed
```

### Correção 3: Porta 3000 está ocupada

```bash
# Verificar o que está usando a porta 3000
netstat -ano | findstr :3000

# Matar processo se necessário
taskkill /PID [número_do_processo] /F
```

---

## 📝 Checklist Rápido

- [ ] Backend está rodando? (`http://localhost:3000`)
- [ ] Frontend está rodando? (`http://localhost:5173`)
- [ ] Banco de dados está acessível?
- [ ] Usuário existe no banco?
- [ ] Porta 3000 está livre?

---

## 🆘 Se Nada Funcionar

1. **Parar tudo**
2. **Reiniciar backend:**
   ```bash
   cd apps/api
   npm run start:dev
   ```
3. **Aguardar mensagem:** `Application is running on: http://localhost:3000`
4. **Abrir novo terminal e iniciar frontend:**
   ```bash
   cd apps/web
   npm run dev
   ```
5. **Testar login novamente**

---

**Precisa de mais ajuda? Verifique o arquivo `SOLUCAO-LOGIN.md` para diagnóstico completo.**
