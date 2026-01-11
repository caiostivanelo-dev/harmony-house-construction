# Script para liberar portas 3000 e 5173

Write-Host "🔍 Liberando portas 3000 e 5173..." -ForegroundColor Cyan

# Liberar porta 3000
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $port3000 | ForEach-Object {
        $pid = $_.OwningProcess
        Write-Host "   Finalizando processo PID $pid na porta 3000..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "   Porta 3000 já está livre" -ForegroundColor Green
}

# Liberar porta 5173
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    $port5173 | ForEach-Object {
        $pid = $_.OwningProcess
        Write-Host "   Finalizando processo PID $pid na porta 5173..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "   Porta 5173 já está livre" -ForegroundColor Green
}

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Portas liberadas!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Agora execute:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
