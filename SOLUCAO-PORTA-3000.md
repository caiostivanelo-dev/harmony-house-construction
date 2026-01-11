# ✅ Solução: Porta 3000 já está em uso

## 🔍 Problema Identificado

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Causa:** Processo Node.js (PID: 18736) já está usando a porta 3000.

---

## ✅ Solução Rápida

### Opção 1: Matar o processo (RECOMENDADO)

```powershell
# Matar o processo que está usando a porta 3000
taskkill /PID 18736 /F
```

Depois, reiniciar o backend:
```bash
npm run dev
```

### Opção 2: Matar todos os processos Node (SE A Opção 1 não funcionar)

```powershell
# Matar todos os processos Node.js
Get-Process node | Stop-Process -Force
```

**⚠️ CUIDADO:** Isso vai parar TODOS os processos Node.js rodando no seu computador.

### Opção 3: Reiniciar via script

```bash
# No terminal onde está rodando npm run dev
# Pressionar Ctrl+C para parar

# Depois iniciar novamente:
npm run dev
```

---

## 🔍 Como Verificar se Funcionou

Depois de matar o processo, verificar:

```powershell
netstat -ano | findstr :3000
```

Se não aparecer nada, a porta está livre.

Depois, iniciar o backend novamente:
```bash
npm run dev
```

Deve aparecer:
```
[Nest] Nest application successfully started
Application is running on: http://localhost:3000
```

---

## 🚀 Solução Passo a Passo (COMPLETA)

1. **Parar tudo:**
   - Pressionar `Ctrl+C` no terminal onde está rodando `npm run dev`

2. **Matar processo na porta 3000:**
   ```powershell
   taskkill /PID 18736 /F
   ```

3. **Verificar se porta está livre:**
   ```powershell
   netstat -ano | findstr :3000
   ```
   Se não aparecer nada, está livre.

4. **Reiniciar o projeto:**
   ```bash
   npm run dev
   ```

5. **Verificar se iniciou corretamente:**
   - Deve aparecer: `Application is running on: http://localhost:3000`
   - NÃO deve aparecer erro `EADDRINUSE`

6. **Testar login novamente no navegador**

---

## 💡 Dica: Prevenir no Futuro

Sempre parar o servidor corretamente antes de iniciar novamente:
- Pressionar `Ctrl+C` no terminal
- Aguardar alguns segundos
- Só depois iniciar novamente

---

## 🔧 Script Automático (Opcional)

Se isso acontecer frequentemente, você pode criar um script:

**kill-port-3000.ps1:**
```powershell
$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($process) {
    Stop-Process -Id $process -Force
    Write-Host "Processo na porta 3000 encerrado (PID: $process)"
} else {
    Write-Host "Nenhum processo usando a porta 3000"
}
```

Uso:
```powershell
.\kill-port-3000.ps1
```
