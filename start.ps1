# Ecwid Widget Project - Quick Start Script for Windows

Write-Host "🚀 Starting Ecwid Widget Project..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose and try again." -ForegroundColor Red
    exit 1
}

# Create environment files if they don't exist
if (-not (Test-Path "frontend\.env")) {
    Write-Host "📋 Creating frontend environment file..." -ForegroundColor Yellow
    Copy-Item "frontend\.env.example" "frontend\.env"
}

if (-not (Test-Path "backend\.env")) {
    Write-Host "📋 Creating backend environment file..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
}

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Yellow
docker-compose down --remove-orphans
docker-compose up --build -d

# Wait for services to start
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check service health
Write-Host "🔍 Checking service health..." -ForegroundColor Yellow

# Check frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Frontend is running at http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend might not be ready yet" -ForegroundColor Yellow
}

# Check backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend is running at http://localhost:3001" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend might not be ready yet" -ForegroundColor Yellow
}

# Check widget server
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Widget server is running at http://localhost:3002" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Widget server might not be ready yet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Project started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Access points:" -ForegroundColor Cyan
Write-Host "   - Landing Page: http://localhost:3000" -ForegroundColor White
Write-Host "   - Settings Page: http://localhost:3000/settings" -ForegroundColor White
Write-Host "   - Backend API: http://localhost:3001" -ForegroundColor White
Write-Host "   - Widget Files: http://localhost:3002" -ForegroundColor White
Write-Host ""
Write-Host "📚 Useful commands:" -ForegroundColor Cyan
Write-Host "   - View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   - Stop services: docker-compose down" -ForegroundColor White
Write-Host "   - Restart services: docker-compose restart" -ForegroundColor White
Write-Host ""
Write-Host "🐛 Troubleshooting:" -ForegroundColor Cyan
Write-Host "   - If services fail to start, check: docker-compose logs" -ForegroundColor White
Write-Host "   - If ports are in use, modify docker-compose.yml" -ForegroundColor White
Write-Host "   - To rebuild from scratch: docker-compose down -v && docker-compose up --build" -ForegroundColor White
