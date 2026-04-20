# Education Consultancy Platform

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 16+ (`brew install postgresql@16 && brew services start postgresql@16`)
- Redis 7+ (`brew install redis && brew services start redis`)

### Getting Started

```bash
# Create database
createdb edu_consultancy_dev

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Run database migrations
npx prisma migrate dev

# Seed admin user (admin@educonsultancy.com / admin1234)
npx prisma db seed

# Start dev server
npm run dev
```

### Running Tests

```bash
npm test          # run all tests once
npm run test:watch  # watch mode
```
