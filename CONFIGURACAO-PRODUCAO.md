# ✅ Configuração de Produção - SHH Constructions

## 🌐 URLs Configuradas

- **Backend API**: `https://api.shhconstructions.com`
- **Frontend**: `https://app.shhconstructions.com`

---

## ✅ Arquivo Criado

O arquivo `.env.production` foi criado em `apps/web/.env.production` com:

```
VITE_API_URL=https://api.shhconstructions.com
```

---

## 🚀 Próximos Passos

### 1. Rebuild do Frontend

Como você mudou a configuração, precisa fazer rebuild:

```bash
npm run build:web
```

### 2. Deploy no Firebase

```bash
npm run deploy
```

Ou manualmente:

```bash
firebase deploy --only hosting
```

---

## 📝 Como Funciona

O Vite vai usar a variável `VITE_API_URL` do arquivo `.env.production` quando você fizer o build de produção.

- **Desenvolvimento**: `npm run dev` → usa `http://localhost:3000` (padrão)
- **Produção**: `npm run build:web` → usa `https://api.shhconstructions.com` (do `.env.production`)

---

## ✅ Verificação

Depois do deploy, verifique no console do navegador:

1. Abra: `https://app.shhconstructions.com`
2. Abra o DevTools (F12)
3. Vá na aba Network
4. Verifique se as requisições estão indo para `https://api.shhconstructions.com`

Se estiver tudo certo, não deve mais aparecer `ERR_CONNECTION_REFUSED` para `localhost:3000`.

---

## 🔄 Para Atualizar no Futuro

Se precisar mudar a URL da API:

1. Edite `apps/web/.env.production`
2. Refaça o build: `npm run build:web`
3. Refaça o deploy: `npm run deploy`

---

**Pronto! Agora é só fazer o rebuild e deploy! 🚀**
