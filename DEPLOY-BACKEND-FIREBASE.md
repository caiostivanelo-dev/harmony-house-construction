# 🔥 Deploy do Backend no Firebase

## 📋 Situação

O backend está rodando no Firebase. Para atualizar o código de CORS, você precisa fazer deploy novamente.

---

## 🔍 Verificar Tipo de Deploy

O Firebase tem diferentes formas de rodar backend:

1. **Firebase Functions** - Para funções serverless
2. **Firebase App Hosting** - Para aplicações Node.js completas (NestJS)
3. **Cloud Run** - Se estiver usando via Firebase

---

## 🚀 Deploy no Firebase App Hosting (Mais Provável)

Se você está usando **Firebase App Hosting** (para NestJS):

### 1. Fazer Commit das Mudanças

```bash
git add apps/api/src/main.ts
git commit -m "Fix CORS: Allow app.shhconstructions.com"
git push
```

### 2. Deploy via Firebase CLI

```bash
firebase deploy --only app-hosting
```

Ou, se estiver usando uma configuração específica:

```bash
cd apps/api
firebase deploy
```

---

## ⚙️ Firebase Functions (Se estiver usando)

Se você está usando **Firebase Functions**:

### 1. Fazer Commit

```bash
git add apps/api/src/main.ts
git commit -m "Fix CORS: Allow app.shhconstructions.com"
git push
```

### 2. Deploy das Functions

```bash
firebase deploy --only functions
```

---

## 📝 Firebase App Hosting - Configuração Completa

Se você está usando **Firebase App Hosting**, pode precisar de um arquivo de configuração:

### Verificar se existe `.firebaserc` e configurações

```bash
# Verificar configuração atual
firebase projects:list
firebase use
```

### Estrutura esperada:

Se estiver usando App Hosting, você deve ter:
- `.firebaserc` - Configuração do projeto
- `firebase.json` - Configuração do Firebase
- Possivelmente uma pasta `app-hosting/` ou configuração específica

---

## 🔧 Passos Rápidos (Recomendado)

### Opção 1: Deploy Automático via Git

Se o Firebase está configurado para deploy automático:

1. **Fazer commit e push:**
   ```bash
   git add apps/api/src/main.ts
   git commit -m "Fix CORS: Allow app.shhconstructions.com"
   git push
   ```

2. **Firebase faz deploy automaticamente** (se configurado)

3. **Aguardar alguns minutos** para o deploy completar

---

### Opção 2: Deploy Manual

Se precisa fazer deploy manual:

1. **Verificar qual serviço está usando:**
   ```bash
   firebase projects:list
   ```

2. **Deploy do backend:**
   ```bash
   # Tentar deploy geral
   firebase deploy
   
   # Ou específico para app hosting
   firebase deploy --only app-hosting
   
   # Ou específico para functions
   firebase deploy --only functions
   ```

---

## 🔍 Como Verificar

Depois do deploy:

1. **Ver logs do Firebase:**
   ```bash
   firebase functions:log  # Se usando Functions
   ```

2. **Verificar no console do Firebase:**
   - Acesse: https://console.firebase.google.com
   - Vá em "App Hosting" ou "Functions"
   - Veja se o deploy foi bem-sucedido

3. **Testar no navegador:**
   - Acesse: `https://app.shhconstructions.com`
   - Verifique se os erros de CORS desapareceram

---

## ⏱️ Tempo Estimado

- **Commit + Push:** 1-2 minutos
- **Deploy no Firebase:** 3-10 minutos
- **Total:** 4-12 minutos

---

## ❓ Troubleshooting

### Erro: "No matching deployments"

Verifique qual serviço você está usando:
```bash
firebase projects:list
firebase use
cat firebase.json
```

### Erro: "Command not found"

Certifique-se de que o Firebase CLI está instalado:
```bash
npm install -g firebase-tools
firebase login
```

---

## 💡 Dica

**O mais fácil é fazer commit e push**, pois o Firebase App Hosting geralmente tem deploy automático configurado via GitHub ou similar.

---

**Depois do deploy, os erros de CORS devem desaparecer! 🎉**

**Quer que eu ajude a fazer o commit e push agora?**
