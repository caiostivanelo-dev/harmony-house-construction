# Script para configurar banco de dados automaticamente

Write-Host "🔍 Procurando PostgreSQL..." -ForegroundColor Cyan

# Tentar encontrar psql
$psqlPath = $null
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\*\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\*\bin\psql.exe",
    "C:\PostgreSQL\*\bin\psql.exe"
)

foreach ($path in $possiblePaths) {
    $found = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $psqlPath = $found.FullName
        Write-Host "✅ PostgreSQL encontrado: $psqlPath" -ForegroundColor Green
        break
    }
}

if (-not $psqlPath) {
    Write-Host "❌ PostgreSQL não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Você precisa instalar PostgreSQL primeiro:" -ForegroundColor Yellow
    Write-Host "   1. Baixe em: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "   2. Ou use Docker: docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres" -ForegroundColor Yellow
    exit 1
}

# Tentar conexões comuns
Write-Host ""
Write-Host "🔐 Testando conexões comuns..." -ForegroundColor Cyan

$found = $false
$testUsers = @("postgres")
$testPasswords = @("postgres", "admin", "123456", "", "root")

foreach ($user in $testUsers) {
    foreach ($pass in $testPasswords) {
        Write-Host "   Testando: $user / $([string]::IsNullOrEmpty($pass) ? '(sem senha)' : '***')" -ForegroundColor Gray
        $env:PGPASSWORD = $pass
        $result = & $psqlPath -U $user -h localhost -d postgres -c "SELECT 1;" 2>&1 | Out-String
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Conexão funcionou!" -ForegroundColor Green
            $found = $true
            $workingUser = $user
            $workingPass = $pass
            break
        }
    }
    if ($found) { break }
}

if (-not $found) {
    Write-Host ""
    Write-Host "❌ Não consegui conectar automaticamente" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Configure manualmente:" -ForegroundColor Yellow
    Write-Host "   1. Abra apps/api/.env" -ForegroundColor Yellow
    Write-Host "   2. Configure DATABASE_URL com suas credenciais" -ForegroundColor Yellow
    Write-Host "   3. Exemplo: DATABASE_URL=`"postgresql://postgres:SUA_SENHA@localhost:5432/harmony_house?schema=public`"" -ForegroundColor Yellow
    exit 1
}

# Criar banco de dados se não existir
Write-Host ""
Write-Host "📦 Criando banco de dados 'harmony_house'..." -ForegroundColor Cyan
$env:PGPASSWORD = $workingPass
$createDb = & $psqlPath -U $workingUser -h localhost -d postgres -c "SELECT 1 FROM pg_database WHERE datname='harmony_house';" 2>&1 | Out-String
if ($createDb -notmatch "1 row") {
    $result = & $psqlPath -U $workingUser -h localhost -d postgres -c "CREATE DATABASE harmony_house;" 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Banco criado!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Erro ao criar banco (pode já existir): $result" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✅ Banco já existe!" -ForegroundColor Green
}

# Atualizar .env
Write-Host ""
Write-Host "📝 Atualizando .env..." -ForegroundColor Cyan
$envFile = Join-Path $PSScriptRoot ".env"
$envContent = Get-Content $envFile -Raw

$newDbUrl = "postgresql://${workingUser}:${workingPass}@localhost:5432/harmony_house?schema=public"
$envContent = $envContent -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$newDbUrl`""

Set-Content -Path $envFile -Value $envContent -NoNewline
Write-Host "   ✅ .env atualizado!" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Agora execute:" -ForegroundColor Cyan
Write-Host "   cd apps/api" -ForegroundColor White
Write-Host "   npx prisma migrate dev" -ForegroundColor White
Write-Host "   npm run prisma:seed" -ForegroundColor White
