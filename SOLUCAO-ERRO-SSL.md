# 🔒 Solução: Erro SSL (ERR_CERT_COMMON_NAME_INVALID)

## 📋 Problema Identificado

O erro `ERR_CERT_COMMON_NAME_INVALID` para `api.shhconstructions.com` significa:

- ✅ O frontend **está conseguindo** tentar se conectar à API
- ❌ O **certificado SSL** do backend não está válido ou não corresponde ao domínio

---

## 🔍 Causas Possíveis

1. **Certificado SSL não configurado** - O backend não tem certificado válido
2. **Certificado para outro domínio** - O certificado é para outro domínio
3. **Certificado auto-assinado** - O certificado não é confiável
4. **HTTP vs HTTPS** - Tentando usar HTTPS mas o servidor só aceita HTTP
5. **Certificado expirado** - O certificado expirou

---

## ✅ Soluções

### Opção 1: Verificar se o backend aceita HTTPS

**Se o backend está rodando em HTTP (sem SSL):**

Mude a URL no `.env.production` para usar **HTTP** (não recomendado para produção, mas funciona para testes):

```
VITE_API_URL=http://api.shhconstructions.com
```

**⚠️ ATENÇÃO:** Isso funciona, mas não é seguro. Para produção, você **deve** usar HTTPS.

---

### Opção 2: Configurar SSL no Backend (Recomendado para Produção)

Se você está usando um servidor (como Nginx, Apache, etc.), precisa configurar SSL:

1. **Obter certificado SSL** (Let's Encrypt gratuito, ou comprado)
2. **Configurar no servidor web** (Nginx, Apache, etc.)
3. **Redirecionar HTTP → HTTPS**

---

### Opção 3: Usar Proxy Reverso com SSL

Se você tem um proxy reverso (Cloudflare, Nginx, etc.):

1. Configure SSL no proxy
2. O proxy faz HTTPS → HTTP interno (se o backend não tem SSL)

---

### Opção 4: Testar com HTTP Temporariamente

**Para testar rapidamente:**

1. Edite `apps/web/.env.production`:
   ```
   VITE_API_URL=http://api.shhconstructions.com
   ```
   (mude `https://` para `http://`)

2. Rebuild:
   ```bash
   npm run build:web
   ```

3. Redeploy:
   ```bash
   npm run deploy
   ```

**Isso vai funcionar**, mas não é seguro. Use apenas para testes!

---

## 🔧 Como Verificar

### Teste no navegador:

1. Abra: `https://api.shhconstructions.com` no navegador
2. Veja o erro de certificado

### Teste com curl:

```bash
curl -v https://api.shhconstructions.com
```

Ou no PowerShell:

```powershell
Invoke-WebRequest -Uri https://api.shhconstructions.com -UseBasicParsing
```

---

## 📝 Checklist

- [ ] Backend está rodando?
- [ ] Backend aceita HTTPS?
- [ ] Certificado SSL configurado?
- [ ] Certificado corresponde ao domínio?
- [ ] Certificado não está expirado?

---

## 🎯 Recomendação

**Para produção:**
- ✅ Configure SSL no backend (Let's Encrypt é gratuito)
- ✅ Use HTTPS sempre
- ✅ Configure certificado válido

**Para testes rápidos:**
- ⚠️ Pode usar HTTP temporariamente
- ⚠️ Mas configure SSL antes de ir para produção real

---

## 💡 Let's Encrypt (Gratuito)

Se você tem acesso ao servidor, pode usar Let's Encrypt:

```bash
# Instalar certbot (exemplo)
sudo apt-get install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d api.shhconstructions.com
```

Isso configura SSL automaticamente!

---

**Qual opção você quer usar? Para produção, recomendo configurar SSL corretamente.**
