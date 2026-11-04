#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Waliliens — PostgreSQL Automated Backup Script
# ─────────────────────────────────────────────────────────────────────────────
# Creates a compressed pg_dump snapshot and prunes backups older than RETENTION_DAYS.
#
# Usage:
#   chmod +x docs/backup.sh
#   ./docs/backup.sh
#
# Cron job example (runs daily at 03:00 AM UTC):
#   0 3 * * * /var/www/waliliens/docs/backup.sh >> /var/log/waliliens-backup.log 2>&1
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/waliliens}"
CONTAINER_NAME="${CONTAINER_NAME:-waliliens-postgres}"
DB_NAME="${DB_NAME:-waliliens}"
DB_USER="${DB_USER:-waliliens_app}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
BACKUP_FILE="${BACKUP_DIR}/waliliens_${TIMESTAMP}.sql.gz"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting database backup for '${DB_NAME}'..."

# Dump database through docker container and compress with gzip
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip -9 > "${BACKUP_FILE}"
else
  # Direct pg_dump fallback if running locally outside docker
  pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip -9 > "${BACKUP_FILE}"
fi

FILE_SIZE="$(du -h "${BACKUP_FILE}" | cut -f1)"
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] ✓ Backup created successfully: ${BACKUP_FILE} (${FILE_SIZE})"

# Prune old backups older than RETENTION_DAYS
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "waliliens_*.sql.gz" -mtime +"${RETENTION_DAYS}" -exec rm -vf {} \;

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Backup cycle completed."
