# VPS Deployment & Operations Guide — Waliliens

Complete step-by-step runbook for deploying and operating the **Waliliens Digital Agency** full-stack platform on a Linux VPS (Ubuntu 22.04 / 24.04 LTS).

---

## 1. System Architecture Overview

```
                        ┌──────────────────────────────────────────────┐
                        │             Internet / Clients               │
                        └──────────────────────┬───────────────────────┘
                                               │ :80 / :443 (HTTPS)
                                               ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ VPS Host                                                                               │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Docker Container: waliliens-nginx                                              │   │
│   │   • Serves Vite React frontend static assets (immutable caching, gzip)         │   │
│   │   • Handles Let's Encrypt ACME SSL challenges                                  │   │
│   │   • Reverse-proxies `/api/*` requests to backend                               │   │
│   └────────────────────────────────────────┬───────────────────────────────────────┘   │
│                                            │ :4000 (Internal bridge network)           │
│                                            ▼                                           │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Docker Container: waliliens-backend (Node 20 Alpine, non-root)                 │   │
│   │   • Express 5 REST API                                                         │   │
│   │   • Pino structured logging                                                    │   │
│   │   • Sentry error tracking                                                      │   │
│   │   • Healthcheck probes on `/api/health` & `/api/health/ready`                  │   │
│   └────────────────────────────────────────┬───────────────────────────────────────┘   │
│                                            │ :5432 (Internal bridge network)           │
│                                            ▼                                           │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Docker Container: waliliens-postgres (Postgres 16 Alpine)                      │   │
│   │   • Named persistent volume: `postgres_data`                                   │   │
│   │   • Automated daily `pg_dump` backups                                          │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Server Preparation (Ubuntu/Debian)

### 2.1 Update packages & configure firewall

Connect via SSH to your VPS:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw gzip ca-certificates gnupg

# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh          # port 22
sudo ufw allow 80/tcp       # HTTP
sudo ufw allow 443/tcp      # HTTPS
sudo ufw enable
```

### 2.2 Install Docker Engine & Docker Compose

```bash
# Add Docker's official GPG key & repository
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# (Optional) Add your non-root deployment user to docker group
sudo usermod -aG docker $USER
```

---

## 3. Clone Repository & Configure Environment

### 3.1 Clone the codebase

```bash
cd /var/www
sudo git clone https://github.com/Mehji2324/waliliens-agence-digital.git waliliens
cd /var/www/waliliens
sudo chown -R $USER:$USER /var/www/waliliens
```

### 3.2 Configure `.env` files

Follow the instructions in [`server/docs/PRODUCTION_CHECKLIST.md`](../server/docs/PRODUCTION_CHECKLIST.md) to generate strong production secrets:

```bash
# 1. Create root environment file (for docker-compose & postgres)
cp .env.example .env
nano .env

# Example .env:
POSTGRES_DB=waliliens
POSTGRES_USER=waliliens_app
POSTGRES_PASSWORD=generate_a_super_strong_password_here
VITE_API_URL=https://waliliens.com
VITE_SENTRY_DSN=https://your-frontend-sentry-dsn@sentry.io/123456

# 2. Create server environment file
cp server/.env.example server/.env
nano server/.env

# Configure server/.env with:
# - NODE_ENV=production
# - DATABASE_URL=postgresql://waliliens_app:password@postgres:5432/waliliens
# - CLIENT_URL=https://waliliens.com
# - SESSION_SECRET (openssl rand -base64 48)
# - ADMIN_EMAIL & ADMIN_PASSWORD_HASH (npm run admin:hash)
# - TRUST_PROXY=true
# - GOOGLE_* credentials (or GOOGLE_CALENDAR_ENABLED=false)
# - RESEND_API_KEY (or EMAIL_ENABLED=false)
# - SENTRY_DSN (optional)
```

---

## 4. Build & Launch Containers

Build and start the database, backend, and Nginx bootstrap:

```bash
# Nginx serves only the ACME challenge and health check until a certificate exists.
docker compose up -d --build postgres backend nginx

# Check container status
docker compose ps
```

Until the certificate is issued, all other HTTP requests receive `503`; the site and API are not served over plaintext HTTP.

### 4.1 Run database migrations & initial seeds

Execute migrations inside the running backend container:

```bash
# Apply PostgreSQL database schema migrations
docker compose exec backend npm run db:migrate

# (Optional) Seed initial projects and service catalogs
docker compose exec backend npm run db:seed
```

---

## 5. HTTPS Setup with Let's Encrypt & Certbot

### 5.1 Obtain Initial Certificate

Ensure `waliliens.com` and `www.waliliens.com` DNS point to this VPS and inbound ports 80/443 are open. The `certbot` Compose profile shares the named certificate and ACME webroot volumes with Nginx.

```bash
# Replace with an operational email address for Let's Encrypt expiry notices.
docker compose --profile certbot run --rm certbot certonly --webroot \
  -w /var/www/certbot \
  -d waliliens.com -d www.waliliens.com \
  --email you@example.com \
  --agree-tos --no-eff-email
```

### 5.2 Activate HTTPS in Nginx

Restart Nginx. Its startup script detects the certificate and selects the TLS configuration; without a certificate it remains in the fail-closed ACME bootstrap configuration.

```bash
docker compose restart nginx
docker compose ps
curl -I https://waliliens.com
```

### 5.3 Auto-Renewal Cron

Add an automatic certificate renewal cron job:

```bash
sudo crontab -e
```

Add the following line (runs at 04:00 AM every Sunday):

```cron
0 4 * * 0 cd /var/www/waliliens && docker compose --profile certbot run --rm certbot renew --webroot -w /var/www/certbot && docker compose exec nginx nginx -s reload >> /var/log/certbot-renew.log 2>&1
```

---

## 6. Automated Database Backups

A backup script is included at [`docs/backup.sh`](./backup.sh).

### 6.1 Set executable permissions & configure cron

```bash
chmod +x /var/www/waliliens/docs/backup.sh

# Test run the backup script
/var/www/waliliens/docs/backup.sh
```

### 6.2 Schedule daily backup cron job

```bash
crontab -e
```

Add the following entry (runs daily at 03:00 AM UTC with 14-day retention):

```cron
0 3 * * * /var/www/waliliens/docs/backup.sh >> /var/log/waliliens-backup.log 2>&1
```

### 6.3 Restoring from a Backup

To restore a `.sql.gz` snapshot into Postgres:

```bash
gunzip < /var/backups/waliliens/waliliens_YYYYMMDD_HHMMSS.sql.gz | docker exec -i waliliens-postgres psql -U waliliens_app -d waliliens
```

---

## 7. Monitoring & Observability

### 7.1 Health Check Endpoints

| Endpoint | Purpose | Expected Response |
|---|---|---|
| `GET /api/health` | Container Liveness probe | `200 OK` `{ "status": "ok", "service": "waliliens-api" }` |
| `GET /api/health/ready` | Readiness probe (verifies PostgreSQL pool) | `200 OK` `{ "status": "ready", "checks": { "database": { "status": "connected", "latencyMs": 4 } } }` |

### 7.2 Structured Logs Inspection

Stream JSON structured logs from the backend:

```bash
# View backend logs in real time
docker compose logs -f backend

# Pretty print structured logs (requires jq)
docker compose logs -f backend | jq .
```

### 7.3 Sentry Error Tracking

1. Set `SENTRY_DSN` in `server/.env` for backend error capture.
2. Set `VITE_SENTRY_DSN` in `.env` for frontend tracing and replay sessions.
3. Uncaught exceptions and 500 errors are automatically dispatched to Sentry with request context and stack traces.

---

## 8. Deploying Updates (Zero-Downtime Routine)

Whenever you push new changes to `main`:

```bash
cd /var/www/waliliens

# 1. Pull latest code
git pull origin main

# 2. Rebuild and restart containers
docker compose up -d --build

# 3. Apply any new migrations
docker compose exec backend npm run db:migrate

# 4. Verify system health
curl -s https://waliliens.com/api/health/ready | jq .
```
