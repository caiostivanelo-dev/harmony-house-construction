# 🚀 Deploy do Backend - Atualizar CORS

## ⚠️ Situação Atual

O erro de CORS continua porque:
- ✅ O código foi atualizado **localmente**
- ❌ O backend em **produção** (`api.shhconstructions.com`) ainda está com o código antigo

---

## 🔧 O Que Foi Feito (Local)

Atualizei `apps/api/src/main.ts` para permitir:
- `https://app.shhconstructions.com`
- `http://localhost:5173`
- Outros domínios do Firebase

---

## 🚀 Como Fazer Deploy do Backend

Você precisa fazer deploy do backend novamente. Dependendo de onde está rodando:

### Opção 1: Render.com

Se o backend está no Render:

1. **Fazer commit das mudanças:**
   ```bash
   git add apps/api/src/main.ts
   git commit -m "Fix CORS: Allow app.shhconstructions.com"
   git push
   ```

2. **Render vai fazer deploy automaticamente** (se configurado com auto-deploy)

3. **Ou fazer deploy manual:**
   - Acessar o dashboard do Render
   - Clicar em "Manual Deploy" → "Deploy latest commit"

---

### Opção 2: Railway

Se o backend está no Railway:

1. **Fazer commit das mudanças:**
   ```bash
   git add apps/api/src/main.ts
   git commit -m "Fix CORS: Allow app.shhconstructions.com"
   git push
   ```

2. **Railway faz deploy automaticamente**

---

### Opção 3: Heroku

Se o backend está no Heroku:

1. **Fazer commit das mudanças:**
   ```bash
   git add apps/api/src/main.ts
   git commit -m "Fix CORS: Allow app.shhconstructions.com"
   git push heroku main
   ```

---

### Opção 4: Outro Servidor (VPS, etc.)

Se está rodando em um servidor próprio:

1. **Fazer commit e push:**
   ```bash
   git add apps/api/src/main.ts
   git commit -m "Fix CORS: Allow app.shhconstructions.com"
   git push
   ```

2. **No servidor, fazer pull e rebuild:**
   ```bash
   cd /caminho/do/backend
   git pull
   npm run build
   # Reiniciar o serviço (PM2, systemd, etc.)
   ```

---

## 📋 Checklist

- [ ] Fazer commit das mudanças
- [ ] Fazer push para o repositório
- [ ] Fazer deploy no servidor
- [ ] Verificar se o deploy foi bem-sucedido
- [ ] Testar no navegador se o CORS foi resolvido

---

## 🔍 Como Verificar se Funcionou

Depois do deploy:

1. **Acessar:** `https://app.shhconstructions.com`
2. **Abrir DevTools** (F12)
3. **Verificar Console:**
   - ✅ Não deve aparecer mais erros de CORS
   - ✅ As requisições devem funcionar
   - ✅ Login deve funcionar

---

## ⏱️ Tempo Estimado

- **Commit + Push:** 1-2 minutos
- **Deploy:** 2-5 minutos (dependendo do serviço)
- **Total:** 3-7 minutos

---

**Depois do deploy, os erros de CORS devem desaparecer! 🎉**

**Qual serviço você está usando para hospedar o backend? Posso ajudar com os comandos específicos!**
