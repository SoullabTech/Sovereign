#!/bin/bash

# Reality Hygiene Database Migration Script
# Runs the reality_assessments table migration

set -e

: "${DATABASE_URL:?DATABASE_URL must be set explicitly for the Reality Hygiene migration}"

echo "🔍 Reality Hygiene Migration"
echo "Database: explicit PostgreSQL authority configured"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Please install PostgreSQL client."
    exit 1
fi

# Run migration
echo "Running migration: 20251216_create_reality_assessments.sql"
psql "$DATABASE_URL" -f db/migrations/20251216_create_reality_assessments.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Reality Hygiene migration completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Test the Oracle endpoint with Reality Hygiene triggers"
    echo "2. Verify RealityScorePanel UI works"
    echo "3. Check database: SELECT * FROM reality_assessments LIMIT 1;"
else
    echo ""
    echo "❌ Migration failed. Check errors above."
    exit 1
fi
