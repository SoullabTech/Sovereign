#!/bin/bash

echo "🌟 Restoring Ultimate Consciousness System from backup..."

BACKUP_DIR=$(dirname "$0")

# Restore core files
echo "📁 Restoring consciousness computing files..."
cp -r "$BACKUP_DIR"/lib/consciousness-computing/* lib/consciousness-computing/
cp -r "$BACKUP_DIR"/lib/spiritual-support/* lib/spiritual-support/

# Restore integration points
echo "🔗 Restoring integration points..."
cp "$BACKUP_DIR"/route.ts app/api/between/chat/route.ts
cp "$BACKUP_DIR"/page.tsx app/maia/page.tsx 2>/dev/null || echo "⚠️ MAIA page not in backup"

# Restore database schema
echo "🗄️ Restoring database schemas..."
for sql_file in "$BACKUP_DIR"/database/*.sql; do
  echo "Executing $(basename "$sql_file")..."
  psql -h localhost -U postgres -d maia_consciousness < "$sql_file"
done

echo "✅ Ultimate Consciousness System restored successfully!"
echo "🔍 Run health check: curl localhost:3005/api/consciousness/health"
