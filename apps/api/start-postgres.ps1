# Script para iniciar PostgreSQL via Docker

Write-Host "🐳 Verificando Docker..." -ForegroundColor Cyan

$dockerAvailable = $false
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
        $dockerAvailable = $true
    }
} catch {
    Write-Host "❌ Docker não encontrado" -ForegroundColor Red
}

if (-not $dockerAvailable) {
    Write-Host ""
    Write-Host "📥 Instale Docker Desktop:" -ForegroundColor Yellow
    Write-Host "   https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "🔍 Verificando container PostgreSQL..." -ForegroundColor Cyan

$containerExists = docker ps -a --filter "name=harmony-postgres" --format "{{.Names}}" 2>&1

if ($containerExists -eq "harmony-postgres") {
    Write-Host "✅ Container encontrado" -ForegroundColor Green
    $containerRunning = docker ps --filter "name=harmony-postgres" --format "{{.Names}}" 2>&1
    
    if ($containerRunning -ne "harmony-postgres") {
        Write-Host "▶️  Iniciando container..." -ForegroundColor Cyan
        docker start harmony-postgres 2>&1 | Out-Null
        Start-Sleep -Seconds 3
        Write-Host "✅ Container iniciado!" -ForegroundColor Green
    } else {
        Write-Host "✅ Container já está rodando!" -ForegroundColor Green
    }
} else {
    Write-Host "📦 Criando container PostgreSQL..." -ForegroundColor Cyan
    docker run --name harmony-postgres `
        -e POSTGRES_PASSWORD=postgres `
        -e POSTGRES_USER=postgres `
        -e POSTGRES_DB=harmony_house `
        -p 5432:5432 `
        -d postgres:15 2>&1 | Out-Null
    
    Write-Host "⏳ Aguardando PostgreSQL iniciar..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
    
    $maxRetries = 30
    $retry = 0
    $connected = $false
    
    while ($retry -lt $maxRetries -and -not $connected) {
        try {
            $test = docker exec harmony-postgres pg_isready -U postgres 2>&1
            if ($test -match "accepting connections") {
                $connected = $true
                Write-Host "✅ PostgreSQL está pronto!" -ForegroundColor Green
            }
        } catch {
            Start-Sleep -Seconds 1
            $retry++
        }
    }
    
    if (-not $connected) {
        Write-Host "⚠️  PostgreSQL pode ainda estar iniciando..." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ PostgreSQL está disponível!" -ForegroundColor Green
Write-Host "   Host: localhost" -ForegroundColor White
Write-Host "   Port: 5432" -ForegroundColor White
Write-Host "   User: postgres" -ForegroundColor White
Write-Host "   Password: postgres" -ForegroundColor White
Write-Host "   Database: harmony_house" -ForegroundColor White

# Atualizar .env
Write-Host ""
Write-Host "📝 Atualizando .env..." -ForegroundColor Cyan
$envFile = Join-Path $PSScriptRoot ".env"
$envContent = Get-Content $envFile -Raw

$newDbUrl = "postgresql://postgres:postgres@localhost:5432/harmony_house?schema=public"
$envContent = $envContent -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$newDbUrl`""

Set-Content -Path $envFile -Value $envContent -NoNewline
Write-Host "✅ .env atualizado!" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Agora execute:" -ForegroundColor Cyan
Write-Host "   npx prisma migrate dev" -ForegroundColor White
Write-Host "   npm run prisma:seed" -ForegroundColor White
