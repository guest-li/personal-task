# Docker Setup Guide - MalishaEdu Platform

## Quick Start (3 Steps)

### Step 1: Run Setup Script
```bash
chmod +x scripts/docker-setup.sh
./scripts/docker-setup.sh
```

### Step 2: Open in Browser
```
http://localhost:3000
```

### Step 3: View Logs (if needed)
```bash
docker-compose logs -f app
```

**That's it!** 🎉

---

## What Gets Set Up

The Docker environment includes:

| Service | Port | Details |
|---------|------|---------|
| **Next.js App** | 3000 | Your web application |
| **PostgreSQL** | 5432 | Database with sample data |
| **Redis** | 6379 | Caching & rate limiting |
| **PgAdmin** | 5050 | (Optional) Database UI |
| **Redis Commander** | 8081 | (Optional) Redis UI |

---

## Using Make Commands (Easier)

If you have `make` installed:

```bash
# Complete setup
make docker-setup

# Start services
make docker-up

# View logs
make docker-logs

# Access app shell
make docker-shell

# Run tests
make docker-test

# Stop services
make docker-down

# Reset everything
make docker-reset
```

**See all commands:**
```bash
make help
```

---

## Using Docker Compose Directly

### Start Services
```bash
# Start in background
docker-compose up -d

# Start and view logs
docker-compose up

# Start specific service
docker-compose up -d postgres
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Access Containers
```bash
# App shell
docker-compose exec app sh
docker-compose exec app bash

# Node REPL
docker-compose exec app node

# PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d edu_consultancy_dev

# Redis CLI
docker-compose exec redis redis-cli
```

### Stop Services
```bash
# Stop (keeps data)
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v

# Stop specific service
docker-compose down postgres
```

---

## Environment Configuration

### Copy .env.docker to .env.local

The setup script does this automatically, but you can also:

```bash
cp .env.docker .env.local
```

Edit `.env.local` to customize:
```env
# Database credentials
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=edu_consultancy_dev

# App settings
NODE_ENV=development
JWT_SECRET=your-secret-key

# Ports
APP_PORT=3000
DB_PORT=5432
REDIS_PORT=6379
```

---

## Database Management

### Apply Migrations
```bash
docker-compose exec app npx prisma db push
```

### Seed Sample Data
```bash
docker-compose exec app npx ts-node scripts/seed-public-data.ts
```

### Reset Database (Delete Everything)
```bash
docker-compose exec app npx prisma migrate reset --force
```

### Access Database with PgAdmin

Start PgAdmin:
```bash
docker-compose --profile tools up -d pgadmin
```

Then open: **http://localhost:5050**

Login with:
- Email: `admin@malishaedu.com`
- Password: `admin`

Add server:
1. Click "Add New Server"
2. Name: `Docker PostgreSQL`
3. Connection tab:
   - Host: `postgres`
   - Port: `5432`
   - Username: `postgres`
   - Password: `postgres`

---

## Useful Commands

### View Running Containers
```bash
docker-compose ps

# Output:
# NAME                COMMAND                  SERVICE     STATUS
# edu_postgres        "docker-entrypoint.s…"  postgres    running
# edu_redis          "redis-server --appen…"  redis       running
# edu_app            "dumb-init -- npm st…"  app         running
```

### Check Service Health
```bash
# PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# Redis
docker-compose exec redis redis-cli ping

# App
curl http://localhost:3000
```

### View Image Details
```bash
docker images | grep edu

# See what's in your image
docker run --rm -it edu_app ls -la
```

### Run Custom Commands in Container
```bash
# Run npm command
docker-compose exec app npm install package-name

# Run prisma command
docker-compose exec app npx prisma studio

# Run migrations
docker-compose exec app npx prisma db push

# View database
docker-compose exec app npx prisma studio
```

---

## Development Workflow

### Option 1: Live Development (Hot Reload)

```bash
# Start services
docker-compose up

# Your code changes auto-reload!
# Edit files locally, changes appear instantly

# Ctrl+C to stop
```

**How it works:**
- Your local directory is mounted as a volume
- Changes trigger Next.js hot reload
- No need to restart container

### Option 2: Using Shell

```bash
# Access container shell
docker-compose exec app bash

# Inside container, run commands:
npm test
npm run build
npx prisma studio
```

### Option 3: Completely Local (No Docker)

If you prefer local development:

```bash
# Install dependencies locally
npm install

# Start services with Docker
docker-compose up postgres redis -d

# Run app locally
npm run dev

# Access at http://localhost:3000
```

---

## Troubleshooting

### Issue: "Port already in use"

**Error:**
```
ERROR: for edu_app Cannot start service app: driver failed programming external connectivity on endpoint edu_app
```

**Solution:**
```bash
# Find process using port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env.local
APP_PORT=3001
```

### Issue: "Docker daemon not running"

**Error:**
```
Cannot connect to Docker daemon
```

**Solution:**
1. Open Docker Desktop application
2. Wait for "Docker Desktop is running" message
3. Try again

### Issue: "Database connection refused"

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Check if postgres is running
docker-compose ps postgres

# If not running, start it
docker-compose up -d postgres

# Wait 10 seconds for it to initialize
sleep 10

# Try connecting again
docker-compose exec postgres pg_isready
```

### Issue: "Out of disk space"

**Error:**
```
no space left on device
```

**Solution:**
```bash
# Clean up Docker resources
docker system prune -a --volumes

# Or stop containers and remove old images
docker-compose down -v
docker rmi $(docker images -q)
```

### Issue: "Container exits immediately"

**Solution:**
```bash
# View logs to see error
docker-compose logs app

# Rebuild container
docker-compose build --no-cache app
docker-compose up -d app
```

### Issue: "Migrations fail"

**Solution:**
```bash
# Reset database
docker-compose exec app npx prisma migrate reset --force

# Re-seed
docker-compose exec app npx ts-node scripts/seed-public-data.ts
```

---

## Performance Tips

### 1. **Use Named Volumes for Better Performance**

Already configured in `docker-compose.yml`:
```yaml
volumes:
  postgres_data:
  redis_data:
```

### 2. **Increase Docker Resources**

Open Docker Desktop Settings:
- **Resources**: Allocate more CPU/Memory
- **File Sharing**: Include project directory
- **Advanced**: Enable VirtioFS (Mac)

### 3. **Use BuildKit for Faster Builds**

```bash
DOCKER_BUILDKIT=1 docker-compose build
```

### 4. **Prune Regularly**

```bash
# Weekly cleanup
docker system prune -a
docker volume prune
```

---

## Production Deployment

### Build Production Image

```bash
docker build -t malishaedu:latest .

# Or with make
make docker-prod-build
```

### Run Production Container

```bash
docker run -d \
  --name edu_app_prod \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  malishaedu:latest
```

### Use Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    restart: always

  app:
    image: malishaedu:latest
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

volumes:
  postgres_prod:
```

Start with:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Security Best Practices

### 1. **Use Environment Variables**

Never hardcode secrets:
```bash
# ✓ Good
docker-compose exec app npm start

# ✗ Bad
docker run -e DB_PASSWORD=hardcoded ...
```

### 2. **Don't Run as Root**

The Dockerfile uses non-root user (`nextjs`):
```dockerfile
USER nextjs
```

### 3. **Use Read-Only Filesystems**

In production:
```yaml
app:
  read_only: true
  tmpfs: /tmp
```

### 4. **Scan for Vulnerabilities**

```bash
# With Docker Scout
docker scout cves malishaedu:latest

# With Trivy
trivy image malishaedu:latest
```

### 5. **Limit Resources**

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

## Debugging

### Enable Debug Mode

```bash
# Add to .env.local
DEBUG=*

# View logs
docker-compose logs -f app
```

### Access Node REPL in Container

```bash
docker-compose exec app node

# Inside REPL:
> const prisma = require('./src/server/db.ts')
> prisma.university.findMany()
```

### Use Prisma Studio

```bash
# Visual database explorer
docker-compose exec app npx prisma studio

# Opens at http://localhost:5555
```

### Shell into Container for Exploration

```bash
docker-compose exec app bash

# Inside container:
ls -la
cat .env.local
npm run build
```

---

## Useful Resources

- **Docker Docs**: https://docs.docker.com/
- **Docker Compose Docs**: https://docs.docker.com/compose/
- **Next.js Docker**: https://nextjs.org/docs/deployment/docker
- **Prisma Docker**: https://www.prisma.io/docs/orm/overview/databases/postgresql

---

## Getting Help

**If something doesn't work:**

1. **Check logs first**:
   ```bash
   docker-compose logs -f app
   ```

2. **Verify services are running**:
   ```bash
   docker-compose ps
   ```

3. **Check health**:
   ```bash
   docker-compose exec postgres pg_isready
   docker-compose exec redis redis-cli ping
   ```

4. **Reset if needed**:
   ```bash
   docker-compose down -v
   ./scripts/docker-setup.sh
   ```

---

## Quick Reference

```bash
# Setup
./scripts/docker-setup.sh

# Daily commands
docker-compose up          # Start
docker-compose logs -f     # View logs
docker-compose down        # Stop

# Testing
docker-compose exec app npm test

# Database
docker-compose exec app npx prisma studio

# Reset
docker-compose down -v
docker system prune -a

# Production
docker build -t malishaedu:latest .
docker run -d malishaedu:latest
```

---

**Happy Dockering! 🐳**
