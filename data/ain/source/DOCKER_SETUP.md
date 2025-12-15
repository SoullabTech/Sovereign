# 🐳 Docker Development Setup for Spiralogic Oracle System

## Prerequisites

1. **Install Docker Desktop** - Download from [docker.com](https://www.docker.com/products/docker-desktop/)
2. **VS Code Dev Containers Extension** - Install `ms-vscode-remote.remote-containers`

## Quick Start

### 1. Environment Setup

Copy the example environment files and add your API keys:

```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your actual API keys

# Frontend environment (if needed)
cp .env.local.example .env.local
# Edit .env.local with your actual values
```

### 2. Start Development Environment

```bash
# Start all services (frontend, backend, postgres, redis)
docker compose -f docker-compose.dev.yml up --build

# Or start in background
docker compose -f docker-compose.dev.yml up --build -d
```

### 3. Access Your Services

- **Frontend (Next.js)**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **PSI Debug Interface**: http://localhost:3000/debug/psi
- **PostgreSQL**: `postgres://spiralogic:spiralogic_dev@localhost:5432/spiralogic_oracle`
- **Redis**: `redis://localhost:6379`

## VS Code Dev Container

For the full containerized development experience:

1. **Open in VS Code**
2. **Command Palette** → `Dev Containers: Reopen in Container`
3. Your terminal and VS Code will run inside the container with all dependencies pre-installed

## Common Commands

### Development

```bash
# Rebuild after dependency changes
docker compose -f docker-compose.dev.yml build

# View logs
docker compose -f docker-compose.dev.yml logs -f frontend
docker compose -f docker-compose.dev.yml logs -f backend

# Stop all services
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (clean slate)
docker compose -f docker-compose.dev.yml down -v
```

### Database Management

```bash
# Connect to PostgreSQL
docker exec -it spiralogic-postgres-dev psql -U spiralogic -d spiralogic_oracle

# Run database migrations
docker exec -it spiralogic-backend-dev npm run migrate

# Reset database (if you have reset scripts)
docker exec -it spiralogic-backend-dev npm run db:reset
```

### Production Build

```bash
# Build production image
docker build -t spiralogic-oracle:latest .

# Run production container
docker run -p 3000:3000 --env-file .env.production spiralogic-oracle:latest
```

## Service Configuration

### Frontend (Next.js)
- **Port**: 3000
- **Hot Reload**: ✅ Code changes auto-refresh
- **Environment**: `.env.local`

### Backend (Node.js/Express)
- **Port**: 8080  
- **Hot Reload**: ✅ TypeScript compilation + nodemon
- **Environment**: `backend/.env`
- **PSI-lite**: Enabled with learning and memory

### PostgreSQL
- **Port**: 5432
- **Database**: `spiralogic_oracle`
- **User**: `spiralogic`
- **Password**: `spiralogic_dev`

### Redis
- **Port**: 6379
- **Used for**: Caching, session storage, PSI memory

## Troubleshooting

### Port Already in Use
```bash
# Change host port in docker-compose.dev.yml
ports:
  - "3001:3000"  # Use port 3001 instead of 3000
```

### Permission Issues (Linux/WSL)
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

### Hot Reload Not Working
- Ensure volumes are mounted correctly in `docker-compose.dev.yml`
- Check that your dev server (Next.js/nodemon) is configured for file watching

### Database Connection Issues
- Backend connects to database using service name: `postgres:5432`
- From your host, use: `localhost:5432`

### Clean Slate Reset
```bash
# Nuclear option: remove everything and start fresh
docker compose -f docker-compose.dev.yml down -v
docker system prune -f
docker compose -f docker-compose.dev.yml up --build
```

## Environment Variables

### Required Backend Variables
```bash
OPENAI_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
SUPABASE_ANON_KEY=your_key_here
JWT_SECRET=your_secret_here
```

### PSI-lite Configuration
```bash
PSI_LITE_ENABLED=true
PSI_LEARNING_ENABLED=true
PSI_LEARNING_RATE=0.08
PSI_MEMORY_ENABLED=true
```

## Next Steps

1. **Add your API keys** to `backend/.env`
2. **Start the containers**: `docker compose -f docker-compose.dev.yml up --build`
3. **Open VS Code in container** for the full development experience
4. **Visit http://localhost:3000** to see your app
5. **Test PSI-lite** at http://localhost:3000/debug/psi

Happy coding! 🚀