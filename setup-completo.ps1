# Script completo de setup do Harmony House SaaS

Write-Host "🚀 Harmony House SaaS - Setup Completo" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Docker
Write-Host "1️⃣ Verificando Docker..." -ForegroundColor Yellow
$dockerAvailable = $false
try {
    $null = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker encontrado" -ForegroundColor Green
        $dockerAvailable = $true
    }
} catch {
    Write-Host "   ❌ Docker não encontrado" -ForegroundColor Red
}

if ($dockerAvailable) {
    Write-Host ""
    Write-Host "2️⃣ Iniciando PostgreSQL via Docker..." -ForegroundColor Yellow
    
    # Parar container se existir
    docker stop harmony-postgres 2>&1 | Out-Null
    docker rm harmony-postgres 2>&1 | Out-Null
    
    # Criar e iniciar
    Write-Host "   📦 Criando container..." -ForegroundColor Gray
    docker-compose up -d postgres 2>&1 | Out-Null
    
    Write-Host "   ⏳ Aguardando PostgreSQL iniciar..." -ForegroundColor Gray
    $maxWait = 30
    $waited = 0
    $ready = $false
    
    while ($waited -lt $maxWait -and -not $ready) {
        Start-Sleep -Seconds 1
        $waited++
        $test = docker exec harmony-postgres pg_isready -U postgres 2>&1
        if ($test -match "accepting") {
            $ready = $true
        }
    }
    
    if ($ready) {
        Write-Host "   ✅ PostgreSQL está pronto!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  PostgreSQL pode ainda estar iniciando..." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "⚠️  Docker não está disponível" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📥 Opções:" -ForegroundColor Cyan
    Write-Host "   1. Instale Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    Write-Host "   2. Ou instale PostgreSQL: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "   3. Depois configure DATABASE_URL em apps/api/.env" -ForegroundColor White
    Write-Host ""
    exit 1
}

# 3. Configurar .env
Write-Host ""
Write-Host "3️⃣ Configurando .env..." -ForegroundColor Yellow
$envFile = "apps/api/.env"
if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    $content = $content -replace 'DATABASE_URL="[^"]*"', 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/harmony_house?schema=public"'
    Set-Content -Path $envFile -Value $content -NoNewline
    Write-Host "   ✅ .env configurado" -ForegroundColor Green
} else {
    Write-Host "   ❌ Arquivo .env não encontrado" -ForegroundColor Red
}

# 4. Gerar Prisma Client
Write-Host ""
Write-Host "4️⃣ Gerando Prisma Client..." -ForegroundColor Yellow
Set-Location "apps/api"
npx prisma generate 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Prisma Client gerado" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro ao gerar Prisma Client" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}

# 5. Executar migrações
Write-Host ""
Write-Host "5️⃣ Executando migrações..." -ForegroundColor Yellow
npx prisma migrate dev --name init 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Migrações executadas" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro ao executar migrações" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}

# 6. Criar usuário admin
Write-Host ""
Write-Host "6️⃣ Criando usuário admin..." -ForegroundColor Yellow
npm run prisma:seed 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Usuário admin criado!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro ao criar usuário admin" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}

Set-Location "../.."

Write-Host ""
Write-Host "✅ Setup completo!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Execute para iniciar:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Credenciais de login:" -ForegroundColor Cyan
Write-Host "   Email: caio@dev.com" -ForegroundColor White
Write-Host "   Senha: 123456" -ForegroundColor White
