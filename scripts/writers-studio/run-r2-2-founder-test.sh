#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

: "${TEST_DATABASE_URL:?TEST_DATABASE_URL must point to the isolated maia_consciousness_test database}"

export PORT="${PORT:-3000}"
export NEXT_PUBLIC_API_BASE_URL=http://localhost:${PORT}
export NEXT_PUBLIC_GIT_COMMIT="${NEXT_PUBLIC_GIT_COMMIT:-$(git rev-parse HEAD)}"

./scripts/verify-test-env.sh

export DATABASE_URL="$TEST_DATABASE_URL"
export WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED=1
export WRITERS_STUDIO_EDITORIAL_ENABLED=1

case "$DATABASE_URL" in
  *maia_consciousness_test*) ;;
  *) echo "R2-2 founder test refuses a non-test database" >&2; exit 2 ;;
esac

echo "R2-2 founder test"
echo "  database: maia_consciousness_test"
echo "  Review Discuss: enabled"
echo "  Editorial MAIA: enabled"
echo "  API: $NEXT_PUBLIC_API_BASE_URL"
echo "  commit: $NEXT_PUBLIC_GIT_COMMIT"

exec npx next dev -p "$PORT"
