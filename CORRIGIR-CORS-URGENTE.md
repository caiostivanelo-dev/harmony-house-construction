# ⚠️ CORRIGIR CORS - URGENTE

## 🔴 Problema Atual

O erro de CORS **continua** porque:
- ✅ Código atualizado **localmente**
- ❌ Backend em **produção** (`api.shhconstructions.com`) **ainda não foi atualizado**

---

## ✅ Solução: Deploy do Backend

Você **precisa fazer deploy do backend** para que as mudanças funcionem.

---

## 🚀 Como Fazer Deploy

### Se o backend está no Firebase App Hosting:

**Opção 1: Git (Mais Comum)**

```bash
# 1. Adicionar mudanças
git add apps/api/src/main.ts

# 2. Fazer commit
git commit -m "Fix CORS: Allow app.shhconstructions.com"

# 3. Fazer push
git push
```

**Aguardar 3-10 minutos** para o Firebase fazer deploy automático.

---

**Opção 2: Firebase CLI**

```bash
# 1. Build do backend
cd apps/api
npm run build

# 2. Deploy
firebase deploy --only app-hosting
```

---

### Se o backend está em outro lugar:

- **Render:** Commit + Push → Deploy automático
- **Railway:** Commit + Push → Deploy automático  
- **Heroku:** `git push heroku main`
- **VPS/Servidor:** SSH + Pull + Restart

---

## 🔍 Verificar se Deploy Funcionou

Depois do deploy:

1. **Aguardar 3-10 minutos**
2. **Testar no navegador:**
   - Acessar: `https://app.shhconstructions.com`
   - Abrir DevTools (F12)
   - **Erros de CORS devem desaparecer**

---

## ⚡ Comandos Rápidos (Copy & Paste)

```bash
git add apps/api/src/main.ts
git commit -m "Fix CORS: Allow app.shhconstructions.com"
git push
```

Depois **aguardar 3-10 minutos**.

---

## ❓ Se o Deploy Não Funcionar

Se depois do deploy o erro continuar:

1. **Verificar logs do Firebase:**
   - Console do Firebase → Logs
   - Ver se há erros no deploy

2. **Verificar se o código foi deployado:**
   - Confirmar se o deploy foi bem-sucedido
   - Verificar se não há erros de build

3. **Testar diretamente a API:**
   ```bash
   curl -v -X OPTIONS https://api.shhconstructions.com/branding/me \
     -H "Origin: https://app.shhconstructions.com" \
     -H "Access-Control-Request-Method: GET"
   ```
   
   Deve retornar headers `Access-Control-Allow-Origin`.

---

## 🎯 Resumo

**Você precisa fazer deploy do backend agora!**

O código já está pronto, mas o backend em produção ainda não foi atualizado.

**Fazer commit e push, aguardar alguns minutos, e testar novamente!**
