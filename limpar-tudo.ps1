# Script para limpar TODOS os processos Node e liberar portas

Write-Host "🧹 Limpando processos Node e portas..." -ForegroundColor Cyan

# Finalizar todos os processos Node
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Finalizando $($nodeProcesses.Count) processos Node..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Processos Node finalizados" -ForegroundColor Green
} else {
    Write-Host "   ✅ Nenhum processo Node rodando" -ForegroundColor Green
}

# Verificar portas
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "   ⚠️  Porta 3000 ainda ocupada" -ForegroundColor Yellow
}
if ($port5173) {
    Write-Host "   ⚠️  Porta 5173 ainda ocupada" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Limpeza concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Agora execute:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
