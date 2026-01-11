# 🚀 Guia de Deploy no Firebase Hosting

Este guia mostra como fazer deploy do frontend Harmony House no Firebase Hosting.

---

## ✅ Pré-requisitos

1. **Node.js instalado** (versão 18 ou superior)
2. **Firebase CLI instalado**:
   ```bash
   npm install -g firebase-tools
   ```

3. **Login no Firebase**:
   ```bash
   firebase login
   ```

4. **Projeto Firebase configurado**:
   - O arquivo `.firebaserc` já está configurado com o projeto `harmony-house-69315`
   - Se precisar trocar o projeto:
     ```bash
     firebase use --add
     ```

---

## 📦 Passo 1: Build do Frontend

Antes de fazer deploy, você precisa compilar o frontend:

```bash
# Na raiz do projeto
npm run build:web
```

Isso vai:
- Compilar TypeScript
- Fazer build do React com Vite
- Gerar os arquivos estáticos em `apps/web/dist`

---

## 🚀 Passo 2: Deploy no Firebase

### Opção 1: Deploy Rápido (Script)

```bash
npm run deploy
```

Este script faz:
1. Build do frontend
2. Deploy no Firebase Hosting

### Opção 2: Deploy Manual

```bash
# 1. Build do frontend
npm run build:web

# 2. Deploy no Firebase
firebase deploy --only hosting
```

---

## 🔍 Passo 3: Verificar Deploy

Após o deploy, você verá uma URL como:
```
https://harmony-house-69315.web.app
```
ou
```
https://harmony-house-69315.firebaseapp.com
```

Acesse a URL para verificar se está funcionando.

---

## ⚙️ Configurações Importantes

### 1. Diretório de Build

O `firebase.json` está configurado para usar `apps/web/dist` (diretório de build do Vite).

### 2. API Backend

**⚠️ IMPORTANTE:** O frontend precisa de uma API backend rodando.

Atualmente, o frontend usa:
- **Desenvolvimento**: `http://localhost:3000` (padrão)
- **Produção**: Precisa configurar a variável de ambiente `VITE_API_URL`

#### Para produção, você tem 2 opções:

**Opção A: Backend local/desenvolvimento (apenas para testes)**
- O frontend vai tentar acessar `http://localhost:3000`
- Só funciona se você abrir o frontend e backend na mesma máquina
- **Não funciona para produção real**

**Opção B: Backend em produção (recomendado)**
- Você precisa fazer deploy do backend também
- Configure a variável de ambiente `VITE_API_URL` com a URL do backend
- Como fazer:
  1. Crie um arquivo `.env.production` em `apps/web/`:
     ```
     VITE_API_URL=https://sua-api-backend.com
     ```
  2. Refaça o build:
     ```bash
     npm run build:web
     ```
  3. Faça deploy novamente:
     ```bash
     npm run deploy
     ```

---

## 🔄 Atualizar Deploy

Para atualizar o site após fazer mudanças:

```bash
npm run deploy
```

Ou manualmente:
```bash
npm run build:web
firebase deploy --only hosting
```

---

## 🛠️ Comandos Úteis

### Ver status do Firebase
```bash
firebase projects:list
```

### Ver logs do deploy
```bash
firebase hosting:channel:list
```

### Preview local do build de produção
```bash
npm run preview:web
```

### Verificar se Firebase CLI está instalado
```bash
firebase --version
```

---

## 📝 Notas

1. **Backend necessário**: O frontend precisa do backend rodando para funcionar completamente
2. **CORS**: Certifique-se de que o backend permite requisições do domínio do Firebase
3. **Variáveis de ambiente**: Configure `VITE_API_URL` para produção
4. **Build de produção**: Sempre teste localmente com `npm run preview:web` antes de fazer deploy

---

## ❓ Troubleshooting

### Erro: "Firebase command not found"
```bash
npm install -g firebase-tools
```

### Erro: "Build failed"
- Verifique se todas as dependências estão instaladas: `npm install`
- Verifique se não há erros de TypeScript: `npm run build:web`

### Frontend não carrega
- Verifique se o build foi feito corretamente
- Verifique se o diretório `apps/web/dist` existe e tem conteúdo
- Verifique os logs do Firebase: `firebase hosting:channel:list`

### API não conecta
- Verifique se o backend está rodando
- Verifique se a URL da API está correta
- Verifique CORS no backend
- Verifique se a variável de ambiente `VITE_API_URL` está configurada

---

## 🎯 Próximos Passos

Depois do deploy:
1. Teste todas as funcionalidades no navegador
2. Configure o backend em produção (se necessário)
3. Configure variáveis de ambiente para produção
4. Configure domínio customizado (opcional)

---

**Boa sorte com o deploy! 🚀**
