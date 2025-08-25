#!/bin/bash

# Ecwid Widget Project - Quick Start Script

echo "🚀 Starting Ecwid Widget Project..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "✅ Docker is running"

# Create environment files if they don't exist
if [ ! -f "frontend/.env" ]; then
    echo "📋 Creating frontend environment file..."
    cp frontend/.env.example frontend/.env
fi

if [ ! -f "backend/.env" ]; then
    echo "📋 Creating backend environment file..."
    cp backend/.env.example backend/.env
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose down --remove-orphans
docker-compose up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "⚠️  Frontend might not be ready yet"
fi

# Check backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:3001"
else
    echo "⚠️  Backend might not be ready yet"
fi

# Check widget server
if curl -f http://localhost:3002 > /dev/null 2>&1; then
    echo "✅ Widget server is running at http://localhost:3002"
else
    echo "⚠️  Widget server might not be ready yet"
fi

echo ""
echo "🎉 Project started successfully!"
echo ""
echo "📖 Access points:"
echo "   - Landing Page: http://localhost:3000"
echo "   - Settings Page: http://localhost:3000/settings"
echo "   - Backend API: http://localhost:3001"
echo "   - Widget Files: http://localhost:3002"
echo ""
echo "📚 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart services: docker-compose restart"
echo ""
echo "🐛 Troubleshooting:"
echo "   - If services fail to start, check: docker-compose logs"
echo "   - If ports are in use, modify docker-compose.yml"
echo "   - To rebuild from scratch: docker-compose down -v && docker-compose up --build"
