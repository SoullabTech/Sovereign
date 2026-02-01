#!/bin/bash
# Apply SQL migrations to Docker PostgreSQL container
# Usage: npm run db:migrate:docker [migration_file]
# If no file specified, applies all migrations in order

set -e

CONTAINER_NAME="${POSTGRES_CONTAINER:-maia-postgres}"
DB_NAME="${POSTGRES_DB:-maia_consciousness}"
DB_USER="${POSTGRES_USER:-soullab}"
MIGRATIONS_DIR="database/migrations"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}Error: Container '${CONTAINER_NAME}' is not running${NC}"
    echo "Start it with: docker compose --env-file .env.production up -d"
    exit 1
fi

# Function to apply a single migration
apply_migration() {
    local file="$1"
    local basename=$(basename "$file")

    echo -e "${YELLOW}Applying: ${basename}${NC}"

    if cat "$file" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 2>&1; then
        echo -e "${GREEN}  ✓ Applied${NC}"
        return 0
    else
        echo -e "${RED}  ✗ Failed${NC}"
        return 1
    fi
}

# If specific file provided, apply only that
if [ -n "$1" ]; then
    if [ -f "$1" ]; then
        apply_migration "$1"
    elif [ -f "${MIGRATIONS_DIR}/$1" ]; then
        apply_migration "${MIGRATIONS_DIR}/$1"
    else
        echo -e "${RED}Migration file not found: $1${NC}"
        exit 1
    fi
    exit 0
fi

# Otherwise apply all migrations in order
echo -e "${GREEN}Applying all migrations to ${CONTAINER_NAME}...${NC}"
echo ""

APPLIED=0
FAILED=0

for file in $(ls -1 "${MIGRATIONS_DIR}"/*.sql 2>/dev/null | sort); do
    if apply_migration "$file"; then
        ((APPLIED++))
    else
        ((FAILED++))
        echo -e "${RED}Stopping due to failure${NC}"
        break
    fi
done

echo ""
echo -e "${GREEN}Summary: ${APPLIED} applied, ${FAILED} failed${NC}"

if [ $FAILED -gt 0 ]; then
    exit 1
fi
