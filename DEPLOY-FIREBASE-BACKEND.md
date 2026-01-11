# 🔥 Deploy do Backend no Firebase - Solução CORS

## ✅ Código Atualizado

O arquivo `apps/api/src/main.ts` já foi atualizado para permitir CORS de:
- `https://app.shhconstructions.com`
- `http://localhost:5173`
- Outros domínios do Firebase

---

## 🚀 Como Fazer Deploy (Firebase)

Como o backend está no Firebase, você precisa fazer commit e push:

### Passo 1: Verificar Mudanças

```bash
git status
```

Deve mostrar `apps/api/src/main.ts` como modificado.

---

### Passo 2: Fazer Commit

```bash
git add apps/api/src/main.ts
git commit -m "Fix CORS: Allow app.shhconstructions.com"
```

---

### Passo 3: Fazer Push

```bash
git push
```

---

### Passo 4: Aguardar Deploy

O Firebase geralmente tem **auto-deploy** configurado via GitHub/GitLab:
- ⏱️ **Aguardar:** 3-10 minutos
- 🔍 **Verificar:** Console do Firebase ou logs

---

## 🔍 Verificar Deploy

### No Console do Firebase:

1. Acesse: https://console.firebase.google.com/project/harmony-house-69315
2. Vá em **App Hosting** ou **Functions** (dependendo de qual você usa)
3. Veja se há um deploy em andamento ou recente

### Testar no Navegador:

1. **Aguardar 3-10 minutos** após o push
2. **Acessar:** `https://app.shhconstructions.com`
3. **Abrir DevTools** (F12)
4. **Verificar:** Erros de CORS devem desaparecer

---

## ⚡ Comandos Rápidos (Copy & Paste)

```bash
# 1. Ver status
git status

# 2. Adicionar mudanças
git add apps/api/src/main.ts

# 3. Fazer commit
git commit -m "Fix CORS: Allow app.shhconstructions.com"

# 4. Fazer push
git push
```

Depois aguardar 3-10 minutos para o Firebase fazer o deploy automaticamente.

---

## ❓ Se Não Tiver Auto-Deploy

Se o Firebase não fizer deploy automático, pode precisar:

1. **Fazer deploy manual via Firebase CLI:**
   ```bash
   firebase deploy --only app-hosting
   ```
   (ou `functions` se for Functions)

2. **Ou fazer deploy via Console do Firebase**

---

**Quer que eu execute os comandos de commit e push agora?**
