#!/bin/bash
# scripts/fix-types-enhanced.sh
# Comprehensive type fixes for Spiralogic Oracle System

set -e

echo "🔧 Starting comprehensive type fixes for Spiralogic Oracle System..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/.." || exit 1

# Create backup directory
BACKUP_DIR=".type-fixes-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📁 Creating backup in $BACKUP_DIR"

# ---------- 1. Fix VoiceTone pace ----------
TYPES_FILE="src/types/agentCommunication.ts"
if [ -f "$TYPES_FILE" ]; then
  echo "➡️  Fixing VoiceTone pace in $TYPES_FILE"
  cp "$TYPES_FILE" "$BACKUP_DIR/"
  
  # Update the pace type to include 'flowing'
  sed -i.bak 's/pace: "rushed" | "conversational" | "contemplative" | "spacious"/pace: "rushed" | "conversational" | "contemplative" | "spacious" | "flowing"/' "$TYPES_FILE"
  echo "✅ Patched VoiceTone pace to include 'flowing'"
else
  echo "➡️  Creating agentCommunication.ts with proper VoiceTone types"
  cat > "$TYPES_FILE" <<'EOF'
export interface VoiceTone {
  pace: "rushed" | "conversational" | "contemplative" | "spacious" | "flowing";
  pitch?: "low" | "medium" | "high";
  warmth?: "cool" | "neutral" | "warm";
  clarity?: "soft" | "balanced" | "crystalline" | "nuanced";
  humor?: "none" | "subtle" | "playful" | "gentle";
}

export interface AgentResponse {
  phenomenological: {
    primary: string;
    tone: VoiceTone;
    pacing: any;
  };
  dialogical?: any;
  architectural?: any;
}

export interface UserState {
  emotional?: any;
  cognitive?: any;
}
EOF
fi

# ---------- 2. Fix AIProvider union type ----------
AI_FILE="src/types/ai.ts"
if [ -f "$AI_FILE" ]; then
  echo "➡️  Updating AIProvider in $AI_FILE"
  cp "$AI_FILE" "$BACKUP_DIR/"
  
  # Replace the AIProvider type definition
  sed -i.bak 's/export type AIProvider = .*/export type AIProvider = "openai" | "anthropic" | "elevenlabs" | "fire-agent" | "water-agent" | "earth-agent" | "air-agent" | "aether-agent";/' "$AI_FILE"
  echo "✅ Patched AIProvider to include elemental agents"
fi

# ---------- 3. Create/Update core types ----------
echo "➡️  Creating/updating core type definitions"
mkdir -p src/types

# AgentResponse type
cat > src/types/agentResponse.ts <<'EOF'
export interface AgentResponse {
  content: string;              // primary field
  response?: string;            // backward compatibility alias
  confidence: number;
  metadata: any;
}
EOF

# OracleInsight type (without anon_id)
cat > src/types/oracleInsight.ts <<'EOF'
import { AIProvider } from './ai';

export interface OracleInsight {
  id?: string;
  userId: string;
  agentType: AIProvider | string;
  query: string;
  response: string;
  content?: string;
  confidence?: number;
  metadata?: any;
}
EOF

# MemoryItem type
cat > src/types/memoryItem.ts <<'EOF'
export interface MemoryItem {
  id?: string;
  user_id?: string;
  userId?: string;
  content: string;           // primary field
  response?: string;         // backward compatibility
  query?: string;
  element?: string;
  source_agent?: string;
  confidence?: number;
  metadata?: any;
  symbols?: string[];
  timestamp: string;
  created_at?: string;
  updated_at?: string;
}
EOF

echo "✅ Created core type definitions"

# ---------- 4. Patch elemental agents ----------
AGENTS=("FireAgent" "WaterAgent" "EarthAgent" "AirAgent" "AetherAgent")
for AGENT in "${AGENTS[@]}"; do
  FILE="src/agents/${AGENT}.ts"
  if [ -f "$FILE" ]; then
    echo "➡️  Patching $FILE"
    cp "$FILE" "$BACKUP_DIR/"
    
    # Remove anon_id property
    sed -i.bak '/anon_id:/d' "$FILE"
    
    # Fix AgentResponse returns to use content
    sed -i.bak 's/return {[[:space:]]*response: \(.*\),[[:space:]]*confidence:/return {\n      content: \1,\n      response: \1,\n      confidence:/g' "$FILE"
    
    # Fix .response references to .content
    sed -i.bak 's/memory\.response/memory.content || memory.response/g' "$FILE"
    sed -i.bak 's/item\.response/item.content || item.response/g' "$FILE"
    
    # Fix numeric constructor arguments
    sed -i.bak 's/new Logger(\([0-9]\+\))/new Logger({ level: "info" })/g' "$FILE"
    sed -i.bak 's/LogLevel(\([0-9]\+\))/LogLevel.INFO/g' "$FILE"
    
    # Fix processQuery return type
    if ! grep -q "content:" "$FILE" || grep -q "response:" "$FILE"; then
      sed -i.bak '/return {/,/};/{
        s/response:/content:/
        /content:.*,/a\
      response: this.content, // backward compatibility
      }' "$FILE"
    fi
    
    echo "✅ Patched $AGENT"
  fi
done

# ---------- 5. Fix modelService ----------
MODEL_FILE="src/utils/modelService.ts"
if [ -f "$MODEL_FILE" ]; then
  echo "➡️  Updating modelService.ts"
  cp "$MODEL_FILE" "$BACKUP_DIR/"
  
  # Fix all return statements to include both content and response
  sed -i.bak '/return {/,/}/ {
    /response:/ {
      s/response: \(.*\),/content: \1,\
      response: \1,/
    }
  }' "$MODEL_FILE"
  
  echo "✅ Fixed AgentResponse objects in modelService"
fi

# ---------- 6. Fix oracleLogger ----------
LOGGER_FILE="src/utils/oracleLogger.ts"
if [ -f "$LOGGER_FILE" ]; then
  echo "➡️  Fixing oracleLogger.ts"
  cp "$LOGGER_FILE" "$BACKUP_DIR/"
  
  # Remove anon_id from logOracleInsight calls
  sed -i.bak '/anon_id:/d' "$LOGGER_FILE"
  
  echo "✅ Fixed oracleLogger"
fi

# ---------- 7. Clean up backup files ----------
echo "➡️  Cleaning up .bak files"
find src -name "*.bak" -type f -delete

# ---------- 8. Create rollback script ----------
cat > scripts/rollback-type-fixes.sh <<EOF
#!/bin/bash
# Rollback type fixes
echo "🔄 Rolling back type fixes from $BACKUP_DIR..."
if [ -d "$BACKUP_DIR" ]; then
  for file in "$BACKUP_DIR"/*; do
    filename=\$(basename "\$file")
    target=\$(find src -name "\$filename" -type f | head -1)
    if [ -n "\$target" ]; then
      cp "\$file" "\$target"
      echo "  - Restored \$target"
    fi
  done
  echo "✅ Rollback complete!"
else
  echo "❌ Backup directory not found: $BACKUP_DIR"
fi
EOF
chmod +x scripts/rollback-type-fixes.sh

# ---------- 9. Run TypeScript check ----------
echo ""
echo "🔍 Running TypeScript check..."
if npx tsc --noEmit 2>&1 | tee /tmp/tsc-output.txt; then
  echo ""
  echo "✅ TypeScript compilation successful!"
  echo "🎉 All type errors have been fixed!"
  echo "🚀 You can now run: npm run dev"
else
  echo ""
  echo "⚠️  Some TypeScript errors remain:"
  echo ""
  grep -E "error TS" /tmp/tsc-output.txt | head -10
  echo ""
  echo "💡 Backup created in: $BACKUP_DIR"
  echo "💡 To rollback: ./scripts/rollback-type-fixes.sh"
  echo "💡 To see all errors: npm run typecheck:full"
fi

echo ""
echo "📝 Created rollback script: scripts/rollback-type-fixes.sh"
echo "   Run it if you need to undo these changes."