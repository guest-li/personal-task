#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  🐳 MalishaEdu Docker Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if Docker is installed
echo -e "${YELLOW}✓ Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed!${NC}"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi
echo -e "${GREEN}✓ Docker found: $(docker --version)${NC}"

# Check if Docker daemon is running
if ! docker ps &> /dev/null; then
    echo -e "${RED}✗ Docker daemon is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi
echo -e "${GREEN}✓ Docker daemon is running${NC}"

# Check if docker-compose is installed
echo ""
echo -e "${YELLOW}✓ Checking Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed!${NC}"
    echo "Please ensure Docker Desktop is fully installed (includes Compose)."
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose found: $(docker-compose --version)${NC}"

# Create .env.local if it doesn't exist
echo ""
echo -e "${YELLOW}✓ Setting up environment...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${BLUE}  Creating .env.local from .env.docker${NC}"
    cp .env.docker .env.local
    echo -e "${GREEN}  ✓ .env.local created${NC}"
else
    echo -e "${GREEN}  ✓ .env.local already exists${NC}"
fi

# Stop existing containers if running
echo ""
echo -e "${YELLOW}✓ Stopping existing containers...${NC}"
docker-compose down 2>/dev/null
echo -e "${GREEN}✓ Cleanup complete${NC}"

# Build Docker image
echo ""
echo -e "${YELLOW}✓ Building Docker image (this may take a few minutes)...${NC}"
docker-compose build --no-cache
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Docker build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker image built successfully${NC}"

# Start services
echo ""
echo -e "${YELLOW}✓ Starting services...${NC}"
docker-compose up -d
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to start services!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Services started${NC}"

# Wait for services to be healthy
echo ""
echo -e "${YELLOW}✓ Waiting for services to be ready...${NC}"
sleep 10

# Check service health
echo ""
echo -e "${YELLOW}✓ Checking service health...${NC}"

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
    echo -e "${GREEN}  ✓ PostgreSQL is ready${NC}"
else
    echo -e "${RED}  ✗ PostgreSQL is not responding${NC}"
    exit 1
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping &> /dev/null; then
    echo -e "${GREEN}  ✓ Redis is ready${NC}"
else
    echo -e "${RED}  ✗ Redis is not responding${NC}"
    exit 1
fi

# Check if app is running
if docker ps | grep edu_app &> /dev/null; then
    echo -e "${GREEN}  ✓ Application container is running${NC}"
else
    echo -e "${RED}  ✗ Application container is not running${NC}"
    exit 1
fi

# Wait for app to be ready
echo ""
echo -e "${YELLOW}✓ Waiting for application to start...${NC}"
sleep 15

# Check if app is accessible
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}  ✓ Application is responding${NC}"
else
    echo -e "${YELLOW}  ⚠ Application may still be starting, check logs with: docker-compose logs -f app${NC}"
fi

# Display summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ Docker Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🎯 Access Points:${NC}"
echo -e "  📱 Application:    ${YELLOW}http://localhost:3000${NC}"
echo -e "  🗄️  PostgreSQL:     ${YELLOW}localhost:5432${NC}"
echo -e "  📡 Redis:          ${YELLOW}localhost:6379${NC}"
echo ""
echo -e "${BLUE}📊 Optional Tools (run with: docker-compose --profile tools up):${NC}"
echo -e "  📈 PgAdmin:        ${YELLOW}http://localhost:5050${NC}"
echo -e "  🔴 Redis Commander:${YELLOW}http://localhost:8081${NC}"
echo ""
echo -e "${BLUE}🛠️  Useful Commands:${NC}"
echo -e "  ${YELLOW}docker-compose logs -f app${NC}          # View application logs"
echo -e "  ${YELLOW}docker-compose exec app bash${NC}        # Access app container"
echo -e "  ${YELLOW}docker-compose down${NC}                 # Stop all services"
echo -e "  ${YELLOW}docker-compose ps${NC}                   # Show running containers"
echo ""
echo -e "${BLUE}📚 Next Steps:${NC}"
echo -e "  1. Open ${YELLOW}http://localhost:3000${NC} in your browser"
echo -e "  2. Check the logs: ${YELLOW}docker-compose logs -f${NC}"
echo -e "  3. Read ${YELLOW}docs/DOCKER_GUIDE.md${NC} for more information"
echo ""
