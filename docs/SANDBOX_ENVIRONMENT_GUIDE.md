# Building Sandbox Environments on macOS

## Table of Contents
1. [Overview](#overview)
2. [Approach 1: Docker (Recommended)](#approach-1-docker-recommended)
3. [Approach 2: Virtual Machines](#approach-2-virtual-machines)
4. [Approach 3: Virtual Environments](#approach-3-virtual-environments)
5. [Approach 4: Vagrant](#approach-4-vagrant)
6. [Approach 5: macOS Native Sandboxing](#approach-5-macos-native-sandboxing)
7. [Comparison Table](#comparison-table)
8. [Best Practices](#best-practices)

---

## Overview

A **sandbox environment** is an isolated computing environment that:
- Runs independently from your main system
- Prevents interference with other projects
- Allows testing without affecting your Mac
- Enables safe experimentation
- Provides consistent environments across machines

### Why Use Sandbox Environments?

✅ **Isolation**: Projects don't interfere with each other  
✅ **Consistency**: Same environment for all developers  
✅ **Safety**: Test risky operations without affecting system  
✅ **Reproducibility**: Easy to recreate exact setup  
✅ **Version Management**: Different versions of tools per project  

---

## Approach 1: Docker (Recommended)

**Best for**: Web applications, microservices, full-stack projects

### What is Docker?

Docker creates **lightweight containers** that package your entire application environment (OS, dependencies, code) into a portable unit.

### Installation

#### Step 1: Install Docker Desktop for Mac

1. Visit **https://www.docker.com/products/docker-desktop**
2. Download "Docker.dmg" for your Mac (Intel or Apple Silicon)
3. Double-click to open installer
4. Drag Docker icon to Applications folder
5. Launch Docker from Applications
6. Grant permission when prompted
7. Complete setup wizard

#### Step 2: Verify Installation

```bash
docker --version
docker run hello-world
```

Should output version info and "Hello from Docker!"

---

### Creating a Docker Environment for the Education Platform

#### Step 1: Create Dockerfile

In your project root `/Users/lizhao/Documents/code/job/`:

```bash
cat > Dockerfile << 'EOF'
# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
EOF
```

#### Step 2: Create Docker Compose File

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: edu_postgres
    environment:
      POSTGRES_DB: edu_consultancy_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis (for caching/rate limiting)
  redis:
    image: redis:7-alpine
    container_name: edu_redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Next.js Application
  app:
    build: .
    container_name: edu_app
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/edu_consultancy_dev
      REDIS_URL: redis://redis:6379
      NODE_ENV: development
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run dev

volumes:
  postgres_data:
EOF
```

#### Step 3: Build and Run

```bash
# Navigate to project
cd /Users/lizhao/Documents/code/job

# Build Docker image
docker-compose build

# Start all services
docker-compose up

# In another terminal, run migrations
docker-compose exec app npx prisma db push
docker-compose exec app npx ts-node scripts/seed-public-data.ts
```

#### Step 4: Access Application

- **App**: http://localhost:3000
- **Database**: localhost:5432 (from host machine)
- **Redis**: localhost:6379

#### Step 5: Stop Environment

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f app
```

### Docker Commands Reference

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View image sizes
docker images

# View container logs
docker logs container_name

# Execute command in container
docker exec -it container_name bash

# Remove stopped containers
docker system prune

# Remove all unused images and containers
docker system prune -a
```

---

## Approach 2: Virtual Machines

**Best for**: Testing on different OS, full isolation, production simulation

### Option 1: UTM (Free, Apple Silicon Native)

#### Installation

1. Visit **https://mac.getutm.app/**
2. Download latest version
3. Double-click DMG to mount
4. Drag UTM to Applications
5. Launch UTM from Applications

#### Create Linux VM

1. Click "Create a New Virtual Machine"
2. Select "Virtualize"
3. Choose Linux
4. Select Ubuntu 22.04 LTS
5. Allocate resources:
   - CPU: 4 cores
   - RAM: 8GB
   - Storage: 50GB
6. Complete setup and boot

#### Inside VM: Setup Project

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Clone/copy project
git clone <repo>
cd project
npm install

# Setup database
npx prisma db push
npx ts-node scripts/seed-public-data.ts

# Start dev server
npm run dev
```

### Option 2: VirtualBox (Free, Intel & Apple Silicon via Rosetta)

#### Installation

1. Visit **https://www.virtualbox.org/**
2. Download VirtualBox for macOS
3. Double-click DMG installer
4. Follow installation wizard
5. Grant system permissions when prompted

#### Create VM

1. Open VirtualBox
2. Click "New"
3. Name: "EduApp-Dev"
4. Memory: 8GB
5. Storage: 50GB
6. Select Ubuntu ISO
7. Complete setup

#### Inside VM: Same as UTM setup above

---

## Approach 3: Virtual Environments

**Best for**: Python projects, isolated package management

### Python Virtual Environment

```bash
# Navigate to project
cd /Users/lizhao/Documents/code/job

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install packages
pip install -r requirements.txt

# Deactivate when done
deactivate
```

### Node.js NVM (Node Version Manager)

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Add to shell config
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc

# Reload shell
source ~/.zshrc

# Install specific Node version
nvm install 18
nvm use 18

# Verify
node --version  # Should show v18.x.x

# Create project-specific .nvmrc
echo "18" > .nvmrc

# Others automatically use correct version
nvm use  # Reads .nvmrc and switches
```

### Using .nvmrc (Recommended for Teams)

```bash
# In project root
echo "18.17.0" > .nvmrc

# Team members just run
nvm use
# Automatically switches to v18.17.0
```

---

## Approach 4: Vagrant

**Best for**: Complex multi-machine setups, team consistency

### Installation

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Vagrant and VirtualBox
brew install vagrant virtualbox

# Verify
vagrant --version
```

### Create Vagrantfile

In project root:

```bash
cat > Vagrantfile << 'EOF'
Vagrant.configure("2") do |config|
  # Use Ubuntu 22.04 box
  config.vm.box = "ubuntu/jammy64"

  # Forward ports
  config.vm.network "forwarded_port", guest: 3000, host: 3000  # App
  config.vm.network "forwarded_port", guest: 5432, host: 5432  # PostgreSQL
  config.vm.network "forwarded_port", guest: 6379, host: 6379  # Redis

  # Allocate resources
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "8192"
    vb.cpus = 4
  end

  # Provisioning script
  config.vm.provision "shell", inline: <<-SHELL
    # Update system
    apt-get update && apt-get upgrade -y

    # Install Node.js
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs

    # Install PostgreSQL
    apt-get install -y postgresql postgresql-contrib

    # Install Redis
    apt-get install -y redis-server

    # Install Git
    apt-get install -y git

    # Change to app directory
    cd /vagrant

    # Install dependencies
    npm install

    # Setup database
    sudo -u postgres createdb edu_consultancy_dev
    npx prisma db push
    npx ts-node scripts/seed-public-data.ts
  SHELL
end
EOF
```

### Run Vagrant Environment

```bash
# Start VM
vagrant up

# SSH into VM
vagrant ssh

# Inside VM: Start development
cd /vagrant
npm run dev

# From host: Access at http://localhost:3000

# Stop VM (keeps it around)
vagrant halt

# Destroy VM completely
vagrant destroy
```

---

## Approach 5: macOS Native Sandboxing

**Best for**: Security testing, app isolation

### Application Sandbox (for compiled apps)

This requires code signing and entitlements (complex for development).

### Process Sandbox with chroot/jails

Not practical for development. Use Docker instead.

### File System Sandbox

```bash
# Create isolated directory
mkdir ~/sandbox_project
cd ~/sandbox_project

# Initialize git
git init

# Set up project-specific Node
nvm use 18

# Project is now isolated to this directory
npm init -y
npm install package_name

# All dependencies go to node_modules in this directory only
# Doesn't affect other projects
```

---

## Comparison Table

| Approach | Complexity | Isolation | Speed | Use Case |
|----------|-----------|-----------|-------|----------|
| **Docker** | Medium | Excellent | Fast | Production-like, microservices |
| **Virtual Machines** | High | Complete | Slow | Full OS testing, isolation |
| **NVM/Venv** | Low | Good | Very Fast | Single language projects |
| **Vagrant** | High | Excellent | Medium | Team consistency |
| **Native Sandbox** | Low | Fair | Very Fast | Simple projects |

---

## Best Practices

### 1. **Use .gitignore for Sandbox Files**

```bash
cat > .gitignore << 'EOF'
# Docker
.dockerignore
docker-compose.override.yml

# Virtual Machines
.vagrant/
*.vdi

# Node
node_modules/
.npm
dist/
.next/

# Environment
.env
.env.local
.env.*.local

# Database
*.db
*.sqlite

# Logs
*.log
logs/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
EOF
```

### 2. **Document Your Setup**

Create `SETUP.md`:

```markdown
# Development Setup Guide

## Option 1: Docker (Recommended)

```bash
docker-compose up
```

Then visit http://localhost:3000

## Option 2: Local Development

```bash
nvm use 18
npm install
npx prisma db push
npm run dev
```

## Database

PostgreSQL available at:
- Host: localhost
- Port: 5432
- User: postgres
- Password: postgres

## Stop Services

```bash
docker-compose down
```
```

### 3. **Environment Variables**

```bash
# Create .env.local (not committed)
cat > .env.local << 'EOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edu_consultancy_dev
REDIS_URL=redis://localhost:6379
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF
```

### 4. **Health Checks**

```bash
# Verify services are running
echo "Checking services..."

# Check Node
node --version

# Check Database
psql -U postgres -d edu_consultancy_dev -c "SELECT version();"

# Check Redis
redis-cli ping

# Check App
curl http://localhost:3000

echo "All services healthy!"
```

### 5. **Regular Cleanup**

```bash
# Monthly cleanup
docker system prune -a --volumes

# Remove old Docker images
docker image prune

# Clean npm cache
npm cache clean --force
```

---

## Troubleshooting

### Docker Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs -f app

# Rebuild from scratch
docker-compose build --no-cache
docker-compose down -v
docker-compose up
```

**Port already in use:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Issues

**Can't connect to PostgreSQL:**
```bash
# Check if container is running
docker ps | grep postgres

# Check container logs
docker logs <container_id>

# Reset database
docker-compose down -v
docker-compose up
```

**Migration issues:**
```bash
# Reset database
npx prisma migrate reset

# Or for Docker
docker-compose exec app npx prisma migrate reset
```

### Performance Issues

**Slow file access on Docker (Mac):**
```yaml
# In docker-compose.yml, use named volumes:
volumes:
  - app_code:/app
  
volumes:
  app_code:
    driver: local
```

**High CPU usage:**
- Close Docker Dashboard
- Limit CPU in Docker settings (4 cores)
- Stop unused containers

---

## Quick Start: Docker Setup for Education Platform

```bash
# 1. Navigate to project
cd /Users/lizhao/Documents/code/job

# 2. Create docker-compose.yml (see above)

# 3. Build and start
docker-compose build
docker-compose up -d

# 4. Setup database
docker-compose exec app npx prisma db push
docker-compose exec app npx ts-node scripts/seed-public-data.ts

# 5. View logs
docker-compose logs -f app

# 6. Access at http://localhost:3000

# 7. When done
docker-compose down
```

---

## Recommended Setup for Team Development

1. **Use Docker for consistency**
2. **Document in SETUP.md**
3. **Use .nvmrc for Node version**
4. **Provide docker-compose.yml**
5. **Create startup script**: `scripts/dev-setup.sh`

```bash
#!/bin/bash
# scripts/dev-setup.sh

echo "🚀 Setting up development environment..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed. Please install Docker Desktop."
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed. Installing via nvm..."
    nvm use 18
fi

echo "✅ Building Docker containers..."
docker-compose build

echo "✅ Starting services..."
docker-compose up -d

echo "✅ Waiting for services to be ready..."
sleep 5

echo "✅ Setting up database..."
docker-compose exec -T app npx prisma db push
docker-compose exec -T app npx ts-node scripts/seed-public-data.ts

echo ""
echo "🎉 Development environment ready!"
echo "📱 Access app at: http://localhost:3000"
echo "🗄️ Database at: localhost:5432"
echo "📡 Redis at: localhost:6379"
echo ""
echo "To view logs: docker-compose logs -f app"
echo "To stop: docker-compose down"
```

Make executable:
```bash
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

---

## Summary

| Need | Solution |
|------|----------|
| **Easiest setup** | Docker |
| **Full isolation** | Virtual Machine |
| **Quick testing** | NVM + Local |
| **Team consistency** | Docker + Vagrant |
| **Production simulation** | Docker |
| **Windows/Linux testing** | Virtual Machine |

**Recommended**: **Docker** for this Node.js + PostgreSQL + Redis stack! 🐳

It's fast, repeatable, and everyone gets identical environments.
