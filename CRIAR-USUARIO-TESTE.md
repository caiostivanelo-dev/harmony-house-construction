# 👤 Criar Usuário de Teste

## ✅ Alterações Realizadas

1. **Removido email da tela de login:**
   - Removido placeholder `caio@dev.com`
   - Removido texto de ajuda com credenciais padrão
   - Agora mostra apenas `"Enter your email"` como placeholder

2. **Atualizado seed para criar usuário de teste:**
   - Adicionado `olivia@harmonyhouse.com` com senha `123456` e role `ADMIN`
   - O seed agora cria ambos os usuários (caio@dev.com e olivia@harmonyhouse.com)

---

## 🚀 Como Criar o Usuário

### Opção 1: Rodar o Seed (Recomendado)

```bash
cd apps/api
npm run prisma:seed
```

Isso vai criar:
- ✅ `olivia@harmonyhouse.com` / `123456` (ADMIN)
- ✅ `caio@dev.com` / `123456` (ADMIN) - se não existir

### Opção 2: Criar Manualmente via API

Se preferir criar apenas o novo usuário:

1. Faça login com `caio@dev.com`
2. Use a interface de usuários para criar o novo usuário
3. Ou use a API diretamente

---

## 📝 Credenciais de Teste

**Novo usuário de teste:**
- **Email:** `olivia@harmonyhouse.com`
- **Senha:** `123456`
- **Role:** `ADMIN`

**Usuário original (mantido):**
- **Email:** `caio@dev.com`
- **Senha:** `123456`
- **Role:** `ADMIN`

---

## ✅ Próximos Passos

1. **Rodar o seed:**
   ```bash
   cd apps/api
   npm run prisma:seed
   ```

2. **Testar login:**
   - Acesse a tela de login
   - Use: `olivia@harmonyhouse.com` / `123456`
   - Deve funcionar normalmente!

---

**Pronto! O usuário de teste será criado quando você rodar o seed! 🎉**
