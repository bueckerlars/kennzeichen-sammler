# Deployment Guide

This guide explains how to deploy the Kennzeichen Sammler fullstack application using Docker Compose.

The fullstack image is available on Docker Hub as `larsbuecker/kennzeichen-sammler:latest` and can be deployed directly without building.

## Prerequisites

- Docker and Docker Compose installed
- For Traefik deployment: Traefik reverse proxy already configured

## Quick Start

1. **Create a `docker-compose.yml` file** based on one of the examples below

2. **Create a `.env` file** (optional, for environment variables)

3. **Start the services:**
   ```bash
   docker compose up -d
   ```

4. **Check logs:**
   ```bash
   docker compose logs -f
   ```

The application will automatically pull the latest image from Docker Hub on first start.

## Deployment Examples

### Example 1: SQLite (Simple, Single Container)

This is the simplest deployment option, using SQLite for the database. No separate database container is needed.

```yaml
version: "3.8"

services:
  app:
    image: larsbuecker/kennzeichen-sammler:latest
    container_name: kennzeichen-sammler
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DB_TYPE=
      - DB_PATH=/data/database.sqlite
      - DB_SYNCHRONIZE=true
      - JWT_SECRET=change-this-secret-key-in-production
      - FRONTEND_URL=http://localhost:3000
    volumes:
      - sqlite_data:/data
    ports:
      - "3000:80"
      - "3001:3001"
    networks:
      - app-network

volumes:
  sqlite_data:

networks:
  app-network:
    driver: bridge
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

**Notes:**
- SQLite is suitable for small deployments and development
- Data persists in the `sqlite_data` volume
- No separate database container required

---

### Example 2: PostgreSQL (Recommended for Production)

This deployment uses PostgreSQL as the database, which is recommended for production environments.

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    container_name: kennzeichen-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=kennzeichen_sammler
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    image: larsbuecker/kennzeichen-sammler:latest
    container_name: kennzeichen-sammler
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DB_TYPE=postgres
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=kennzeichen_sammler
      - DB_SYNCHRONIZE=true
      - JWT_SECRET=change-this-secret-key-in-production
      - FRONTEND_URL=http://localhost:3000
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "3000:80"
      - "3001:3001"
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

**Notes:**
- PostgreSQL is recommended for production
- Database data persists in the `postgres_data` volume
- The app waits for PostgreSQL to be healthy before starting

---

### Example 3: Traefik Reverse Proxy (Production with SSL)

This deployment uses Traefik as a reverse proxy with automatic SSL certificate management via Let's Encrypt.

**Prerequisites:**
- Traefik must be running and configured
- Traefik network must exist: `docker network create traefik_network`
- Traefik must be configured with Let's Encrypt certificate resolver

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    container_name: kennzeichen-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=kennzeichen_sammler
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - traefik_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    image: larsbuecker/kennzeichen-sammler:latest
    container_name: kennzeichen-sammler
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DB_TYPE=postgres
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=kennzeichen_sammler
      - DB_SYNCHRONIZE=true
      - JWT_SECRET=change-this-secret-key-in-production
      - FRONTEND_URL=https://kennzeichen.carvin.duckdns.org
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - traefik_network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.kennzeichen.rule=Host(`kennzeichen.carvin.duckdns.org`)"
      - "traefik.http.routers.kennzeichen.entrypoints=websecure"
      - "traefik.http.routers.kennzeichen.tls=true"
      - "traefik.http.routers.kennzeichen.tls.certresolver=letsencrypt"
      - "traefik.http.services.kennzeichen.loadbalancer.server.port=80"
      - "traefik.http.routers.kennzeichen.middlewares=default-headers@file"

volumes:
  postgres_data:

networks:
  traefik_network:
    external: true
```

**Access:**
- Frontend: https://kennzeichen.carvin.duckdns.org
- Backend API: https://kennzeichen.carvin.duckdns.org/api
- Health check: https://kennzeichen.carvin.duckdns.org/api/health

**Traefik Configuration Notes:**
- Replace `kennzeichen.carvin.duckdns.org` with your domain
- Ensure Traefik has `websecure` entrypoint configured (port 443)
- Ensure Traefik has `letsencrypt` certificate resolver configured
- The `default-headers@file` middleware is optional (remove if not configured)

**Traefik Setup Example:**
```yaml
# traefik.yml (example)
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
```

---

## Environment Variables

### Required Variables

- `NODE_ENV`: Set to `production` for production deployments
- `PORT`: Backend port (default: 3001)
- `JWT_SECRET`: Secret key for JWT token signing (change in production!)

### Database Configuration

**For SQLite:**
- `DB_TYPE`: Leave empty or unset
- `DB_PATH`: Path to SQLite file (default: `/data/database.sqlite`)

**For PostgreSQL:**
- `DB_TYPE`: Set to `postgres`
- `DB_HOST`: PostgreSQL hostname (usually `postgres`)
- `DB_PORT`: PostgreSQL port (default: `5432`)
- `DB_USER`: PostgreSQL username
- `DB_PASSWORD`: PostgreSQL password
- `DB_NAME`: Database name
- `DB_SYNCHRONIZE`: Set to `true` to auto-sync schema (use `false` in production with migrations)

### Optional Variables

- `FRONTEND_URL`: Frontend URL for CORS configuration (e.g., `https://yourdomain.com`)

---

## Security Best Practices

1. **Change JWT_SECRET**: Always use a strong, random secret in production
   ```bash
   # Generate a secure secret
   openssl rand -base64 32
   ```

2. **Use strong database passwords**: Don't use default passwords in production

3. **Use environment files**: Store secrets in `.env` files (don't commit them!)
   ```bash
   # .env file
   JWT_SECRET=your-secure-secret-here
   DB_PASSWORD=your-secure-password-here
   ```

4. **Enable HTTPS**: Always use HTTPS in production (Traefik example above)

5. **Limit database synchronization**: Set `DB_SYNCHRONIZE=false` in production and use migrations

---

## Using Environment Files

Create a `.env` file in the same directory as your `docker-compose.yml`:

```env
# Database
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_NAME=kennzeichen_sammler

# Security
JWT_SECRET=your-secure-jwt-secret

# Application
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

Then reference it in `docker-compose.yml`:

```yaml
services:
  app:
    env_file:
      - .env
    # ... rest of configuration
```

---

## Troubleshooting

### Container won't start

1. **Check logs:**
   ```bash
   docker compose logs app
   ```

2. **Verify database connection:**
   ```bash
   docker compose exec app node /app/backend/dist/index.js
   ```

3. **Check health endpoint:**
   ```bash
   curl http://localhost:3001/health
   ```

### Frontend not loading

1. **Verify frontend files are present:**
   ```bash
   docker compose exec app ls -la /usr/share/nginx/html
   ```

2. **Check Nginx configuration:**
   ```bash
   docker compose exec app nginx -t
   ```

3. **View Nginx logs:**
   ```bash
   docker compose exec app cat /var/log/nginx/error.log
   ```

### Database connection issues

1. **Verify PostgreSQL is healthy:**
   ```bash
   docker compose ps postgres
   ```

2. **Test database connection:**
   ```bash
   docker compose exec postgres psql -U postgres -d kennzeichen_sammler
   ```

3. **Check environment variables:**
   ```bash
   docker compose exec app env | grep DB_
   ```

---

## Updating the Application

To update to the latest version of the application:

1. **Pull the latest image:**
   ```bash
   docker compose pull app
   ```

2. **Restart the service:**
   ```bash
   docker compose up -d app
   ```

3. **Or recreate the container (recommended):**
   ```bash
   docker compose up -d --force-recreate app
   ```

**Note:** The image is automatically updated when you run `docker compose pull app`. Make sure to check the [Docker Hub page](https://hub.docker.com/r/larsbuecker/kennzeichen-sammler) for the latest version tags.

---

## Backup and Restore

### PostgreSQL Backup

```bash
# Backup
docker compose exec postgres pg_dump -U postgres kennzeichen_sammler > backup.sql

# Restore
docker compose exec -T postgres psql -U postgres kennzeichen_sammler < backup.sql
```

### SQLite Backup

```bash
# Backup
docker compose exec app cp /data/database.sqlite /data/database.sqlite.backup

# Or copy from container
docker compose cp app:/data/database.sqlite ./backup.sqlite
```

---

## Monitoring

### Health Check

The application provides a health endpoint:

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app

# Last 100 lines
docker compose logs --tail=100 app
```

---

## Port Configuration

The fullstack container exposes two ports:
- **Port 80**: Nginx (serves frontend and proxies API requests)
- **Port 3001**: Backend API (direct access, usually not needed when using Nginx)

When using Traefik, only port 80 needs to be accessible internally. Traefik handles external access.

---

## Image Information

The fullstack image is available on Docker Hub:
- **Image:** `larsbuecker/kennzeichen-sammler:latest`
- **Docker Hub:** https://hub.docker.com/r/larsbuecker/kennzeichen-sammler

The image contains:
- Frontend (React) served via Nginx on port 80
- Backend API (Node.js/Express) running on port 3001
- All dependencies pre-installed and configured

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)

