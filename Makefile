.PHONY: help docker-setup docker-build docker-up docker-down docker-logs docker-clean docker-reset docker-shell docker-test docker-health

# Default target
.DEFAULT_GOAL := help

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BLUE)  MalishaEdu Docker Commands$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@echo "$(GREEN)Setup & Initialization:$(NC)"
	@grep -E '^  docker-setup|^  docker-build' Makefile | sed 's/:.*##/:/' | column -t -s ':' | sed 's/^/    /'
	@echo ""
	@echo "$(GREEN)Running Services:$(NC)"
	@grep -E '^  docker-up|^  docker-down|^  docker-logs|^  docker-ps' Makefile | sed 's/:.*##/:/' | column -t -s ':' | sed 's/^/    /'
	@echo ""
	@echo "$(GREEN)Maintenance:$(NC)"
	@grep -E '^  docker-clean|^  docker-reset|^  docker-test|^  docker-health' Makefile | sed 's/:.*##/:/' | column -t -s ':' | sed 's/^/    /'
	@echo ""
	@echo "$(GREEN)Container Access:$(NC)"
	@grep -E '^  docker-shell|^  docker-psql|^  docker-redis' Makefile | sed 's/:.*##/:/' | column -t -s ':' | sed 's/^/    /'
	@echo ""
	@echo "$(YELLOW)Example: make docker-setup$(NC)"
	@echo ""

# Setup & Initialization
docker-setup: ## Complete Docker setup (build + start + seed)
	@chmod +x scripts/docker-setup.sh
	@scripts/docker-setup.sh

docker-build: ## Build Docker image
	@echo "$(YELLOW)Building Docker image...$(NC)"
	@docker-compose build --no-cache
	@echo "$(GREEN)✓ Build complete$(NC)"

docker-env: ## Create .env.local from .env.docker
	@if [ ! -f .env.local ]; then \
		cp .env.docker .env.local; \
		echo "$(GREEN)✓ .env.local created from .env.docker$(NC)"; \
	else \
		echo "$(YELLOW)⚠ .env.local already exists$(NC)"; \
	fi

# Running Services
docker-up: ## Start all services
	@echo "$(YELLOW)Starting services...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo "$(BLUE)App: http://localhost:3000$(NC)"

docker-down: ## Stop all services
	@echo "$(YELLOW)Stopping services...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

docker-logs: ## View application logs (streaming)
	@docker-compose logs -f app

docker-logs-all: ## View all container logs
	@docker-compose logs -f

docker-logs-db: ## View database logs
	@docker-compose logs -f postgres

docker-logs-redis: ## View Redis logs
	@docker-compose logs -f redis

docker-ps: ## Show running containers
	@docker-compose ps

# Maintenance
docker-clean: ## Remove stopped containers and dangling images
	@echo "$(YELLOW)Cleaning Docker resources...$(NC)"
	@docker system prune -f
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

docker-reset: ## Reset everything (stop, remove volumes, rebuild)
	@echo "$(RED)⚠ WARNING: This will delete all data in the database!$(NC)"
	@read -p "Type 'reset' to confirm: " confirm; \
	if [ "$$confirm" = "reset" ]; then \
		docker-compose down -v; \
		docker system prune -f; \
		make docker-setup; \
	else \
		echo "$(YELLOW)Reset cancelled$(NC)"; \
	fi

docker-test: ## Run tests inside container
	@echo "$(YELLOW)Running tests...$(NC)"
	@docker-compose exec -T app npm test
	@echo "$(GREEN)✓ Tests complete$(NC)"

docker-health: ## Check health of all services
	@echo "$(YELLOW)Checking service health...$(NC)"
	@echo ""
	@echo "$(BLUE)PostgreSQL:$(NC)"
	@docker-compose exec -T postgres pg_isready -U postgres && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Not responding$(NC)"
	@echo ""
	@echo "$(BLUE)Redis:$(NC)"
	@docker-compose exec -T redis redis-cli ping && echo "$(GREEN)✓ Healthy$(NC)" || echo "$(RED)✗ Not responding$(NC)"
	@echo ""
	@echo "$(BLUE)Application:$(NC)"
	@curl -s http://localhost:3000 > /dev/null && echo "$(GREEN)✓ Responding$(NC)" || echo "$(RED)✗ Not responding$(NC)"

# Container Access
docker-shell: ## Access app container shell
	@docker-compose exec app sh

docker-bash: ## Access app container bash
	@docker-compose exec app bash

docker-node: ## Access Node.js REPL in app container
	@docker-compose exec app node

docker-npm: ## Run npm command in container (use: make docker-npm cmd="install package")
	@docker-compose exec app npm $(cmd)

docker-psql: ## Access PostgreSQL CLI
	@docker-compose exec postgres psql -U postgres -d edu_consultancy_dev

docker-redis: ## Access Redis CLI
	@docker-compose exec redis redis-cli

# Database
docker-db-migrate: ## Run database migrations
	@echo "$(YELLOW)Running migrations...$(NC)"
	@docker-compose exec -T app npx prisma migrate deploy
	@echo "$(GREEN)✓ Migrations complete$(NC)"

docker-db-seed: ## Seed database with sample data
	@echo "$(YELLOW)Seeding database...$(NC)"
	@docker-compose exec -T app npx ts-node scripts/seed-public-data.ts
	@echo "$(GREEN)✓ Database seeded$(NC)"

docker-db-reset: ## Reset database (delete all data and re-seed)
	@echo "$(YELLOW)Resetting database...$(NC)"
	@docker-compose exec -T app npx prisma migrate reset --force
	@docker-compose exec -T app npx ts-node scripts/seed-public-data.ts
	@echo "$(GREEN)✓ Database reset and seeded$(NC)"

# Tools
docker-pgadmin: ## Start PgAdmin for database management
	@echo "$(YELLOW)Starting PgAdmin...$(NC)"
	@docker-compose --profile tools up -d pgadmin
	@echo "$(GREEN)✓ PgAdmin started at http://localhost:5050$(NC)"

docker-redis-commander: ## Start Redis Commander for Redis management
	@echo "$(YELLOW)Starting Redis Commander...$(NC)"
	@docker-compose --profile tools up -d redis-commander
	@echo "$(GREEN)✓ Redis Commander started at http://localhost:8081$(NC)"

docker-tools: ## Start all optional tools (PgAdmin, Redis Commander)
	@echo "$(YELLOW)Starting all tools...$(NC)"
	@docker-compose --profile tools up -d pgadmin redis-commander
	@echo "$(GREEN)✓ Tools started$(NC)"
	@echo "  PgAdmin: http://localhost:5050"
	@echo "  Redis Commander: http://localhost:8081"

# Development
docker-dev: ## Start development environment with hot reload
	@echo "$(YELLOW)Starting development environment...$(NC)"
	@docker-compose up
	@echo "$(GREEN)✓ Development environment running$(NC)"

docker-prod-build: ## Build production Docker image
	@echo "$(YELLOW)Building production image...$(NC)"
	@docker build -t malishaedu:prod .
	@echo "$(GREEN)✓ Production image built$(NC)"

# Info
docker-info: ## Show Docker and environment info
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BLUE)  Docker & Environment Info$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@echo "$(YELLOW)Docker:$(NC)"
	@docker --version
	@docker-compose --version
	@echo ""
	@echo "$(YELLOW)Images:$(NC)"
	@docker images | grep -E "REPOSITORY|edu|node|postgres|redis" || echo "  No images found"
	@echo ""
	@echo "$(YELLOW)Running Containers:$(NC)"
	@docker-compose ps || echo "  No containers running"
	@echo ""
