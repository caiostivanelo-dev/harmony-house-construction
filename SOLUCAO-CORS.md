# 🔒 Solução: Erro CORS no Backend

## 📋 Problema Identificado

O erro `ERR_CORS_POLICY` acontece porque:

- ✅ O frontend está em: `https://app.shhconstructions.com`
- ❌ O backend **não está permitindo** requisições desse domínio

O backend estava configurado para permitir apenas `localhost` em desenvolvimento.

---

## ✅ Solução Aplicada

Atualizei o `apps/api/src/main.ts` para permitir:

1. **Domínios de produção:**
   - `https://app.shhconstructions.com`
   - `https://harmony-house-69315.web.app`
   - `https://harmony-house-69315.firebaseapp.com`

2. **Domínios de desenvolvimento:**
   - `http://localhost:5173`
   - `http://localhost:3000`
   - Qualquer porta localhost (em desenvolvimento)

3. **Variável de ambiente:**
   - `FRONTEND_URL` (se configurada)

---

## 🚀 Próximos Passos

### 1. Rebuild e Redeploy do Backend

Como você mudou o código do backend, precisa:

1. **Rebuild do backend:**
   ```bash
   cd apps/api
   npm run build
   ```

2. **Redeploy do backend:**
   - Fazer deploy novamente no servidor onde o backend está rodando
   - Pode ser Render, Railway, Heroku, ou outro serviço

3. **Reiniciar o backend:**
   - Se o backend está rodando, reiniciar para aplicar as mudanças

---

## ⚙️ Como Funciona Agora

O backend agora permite requisições de:

- ✅ `https://app.shhconstructions.com` (produção)
- ✅ `http://localhost:5173` (desenvolvimento)
- ✅ Qualquer localhost (apenas em desenvolvimento)

---

## 🔍 Verificação

Depois do redeploy, verifique:

1. **Acessar:** `https://app.shhconstructions.com`
2. **Abrir DevTools** (F12)
3. **Verificar Console:**
   - Não deve aparecer mais erros de CORS
   - As requisições devem funcionar

---

## 📝 Nota Importante

**O backend precisa ser redeployado** para que as mudanças funcionem!

Se o backend está rodando localmente, você precisa:
- Reiniciar o backend
- Ou fazer deploy em produção

Se o backend já está em produção, você precisa:
- Fazer commit das mudanças
- Fazer deploy do backend novamente

---

**Depois do redeploy do backend, os erros de CORS devem desaparecer! 🎉**
