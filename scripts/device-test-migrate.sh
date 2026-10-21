#!/usr/bin/env bash
# OPS-DT-01 — apply migrations to the ISOLATED device-test database only.
# Refuses to run if the isolation proof has not passed.
set -euo pipefail

TEST_CONTAINER="${TEST_CONTAINER:-maia-postgres-device-test}"
TEST_DB="${TEST_DB:-maia_device_test}"
TEST_USER="${TEST_USER:-devicetest}"

echo "═══ device-test migrations ═══"
echo "Verifying isolation before applying anything…"
scripts/verify-device-test-isolation.sh || {
  echo "❌ isolation not proven — refusing to apply migrations"; exit 1; }

echo
for f in database/migrations/*.sql; do
  name=$(basename "$f")
  applied=$(docker exec "$TEST_CONTAINER" psql -U "$TEST_USER" -d "$TEST_DB" -tAc \
    "SELECT count(*) FROM schema_migrations WHERE filename='$name';" 2>/dev/null || echo 0)
  [ "$applied" != "0" ] && continue
  echo "  applying $name"
  docker exec -i "$TEST_CONTAINER" psql -U "$TEST_USER" -d "$TEST_DB" -v ON_ERROR_STOP=1 \
    -c "BEGIN;" -f - -c "COMMIT;" < "$f"
  docker exec "$TEST_CONTAINER" psql -U "$TEST_USER" -d "$TEST_DB" -q -c \
    "INSERT INTO schema_migrations (filename) VALUES ('$name') ON CONFLICT DO NOTHING;"
done
echo
echo "Migration state:"
docker exec "$TEST_CONTAINER" psql -U "$TEST_USER" -d "$TEST_DB" -c \
  "SELECT filename FROM schema_migrations ORDER BY filename DESC LIMIT 5;"
