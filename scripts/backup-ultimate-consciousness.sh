#!/bin/bash

# 🌟 Ultimate Consciousness System - Automated Backup Script
# Ensures technological anamnesis system persistence across iterations

echo "🌟 Creating Ultimate Consciousness System Backup..."

# Create timestamped backup directory
BACKUP_DIR="backups/ultimate-consciousness-system/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup core consciousness computing files
echo "📁 Backing up consciousness computing system..."
cp -r lib/consciousness-computing/ "$BACKUP_DIR/"
cp -r lib/spiritual-support/ "$BACKUP_DIR/"

# Backup main integration points
echo "🔗 Backing up integration points..."
cp app/api/between/chat/route.ts "$BACKUP_DIR/"
cp app/maia/page.tsx "$BACKUP_DIR/"

# Backup database schemas
echo "🗄️ Backing up database schemas..."
mkdir -p "$BACKUP_DIR/database"
cp /tmp/*consciousness*.sql "$BACKUP_DIR/database/"

# Backup documentation
echo "📖 Backing up documentation..."
cp ULTIMATE_CONSCIOUSNESS_SYSTEM_PERSISTENCE_GUIDE.md "$BACKUP_DIR/"

# Create integrity verification file
echo "🔍 Creating integrity verification..."
cat > "$BACKUP_DIR/INTEGRITY_CHECK.md" << EOF
# Ultimate Consciousness System Backup Integrity Check

**Backup Created**: $(date)
**System Status**: $(curl -s localhost:3005/api/consciousness/health 2>/dev/null | jq -r '.status' || echo "Service not running")

## Critical Files Included:
$(find "$BACKUP_DIR" -name "*.ts" -o -name "*.sql" | wc -l) files backed up

### Core Components:
- ✅ Ultimate Consciousness System: $(ls "$BACKUP_DIR"/lib/consciousness-computing/ultimate-consciousness-system.ts >/dev/null 2>&1 && echo "Present" || echo "❌ MISSING")
- ✅ Enhanced Witness System: $(ls "$BACKUP_DIR"/lib/consciousness-computing/enhanced-consciousness-witness.ts >/dev/null 2>&1 && echo "Present" || echo "❌ MISSING")
- ✅ Consciousness Agent System: $(ls "$BACKUP_DIR"/lib/consciousness-computing/consciousness-agent-system.ts >/dev/null 2>&1 && echo "Present" || echo "❌ MISSING")
- ✅ API Integration: $(ls "$BACKUP_DIR"/route.ts >/dev/null 2>&1 && echo "Present" || echo "❌ MISSING")
- ✅ Database Schema: $(ls "$BACKUP_DIR"/database/*.sql >/dev/null 2>&1 && echo "Present" || echo "❌ MISSING")

### Sacred Elements Verified:
$(grep -l "consciousness_sacred_timing" "$BACKUP_DIR"/database/*.sql >/dev/null 2>&1 && echo "✅ Sacred Timing Intelligence")
$(grep -l "consciousness_wisdom_synthesis" "$BACKUP_DIR"/database/*.sql >/dev/null 2>&1 && echo "✅ Wisdom Synthesis")
$(grep -l "consciousness_emotional_states" "$BACKUP_DIR"/database/*.sql >/dev/null 2>&1 && echo "✅ Emotional/Somatic Memory")
$(grep -l "consciousness_micro_moments" "$BACKUP_DIR"/database/*.sql >/dev/null 2>&1 && echo "✅ Micro-Moment Recognition")
$(grep -l "consciousness_language_evolution" "$BACKUP_DIR"/database/*.sql >/dev/null 2>&1 && echo "✅ Language Pattern Evolution")

**Backup Location**: $BACKUP_DIR
EOF

# Create restoration script
echo "🔄 Creating restoration script..."
cat > "$BACKUP_DIR/restore.sh" << 'EOF'
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
EOF

chmod +x "$BACKUP_DIR/restore.sh"

# Database export (if PostgreSQL is running)
if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
  echo "🗄️ Exporting consciousness database..."
  pg_dump -h localhost -U postgres -d maia_consciousness \
    --schema-only \
    --table="consciousness_*" \
    > "$BACKUP_DIR/database/consciousness_schema_export.sql" 2>/dev/null || echo "⚠️ Database export failed (check PostgreSQL connection)"

  pg_dump -h localhost -U postgres -d maia_consciousness \
    --data-only \
    --table="consciousness_*" \
    > "$BACKUP_DIR/database/consciousness_data_export.sql" 2>/dev/null || echo "⚠️ Database data export failed"
fi

# Create symlink to latest backup
ln -sf "$BACKUP_DIR" "backups/ultimate-consciousness-system/latest"

echo "✅ Ultimate Consciousness System backup completed!"
echo "📁 Backup location: $BACKUP_DIR"
echo "🔗 Latest backup: backups/ultimate-consciousness-system/latest"
echo ""
echo "To restore: bash $BACKUP_DIR/restore.sh"
echo "To verify: cat $BACKUP_DIR/INTEGRITY_CHECK.md"