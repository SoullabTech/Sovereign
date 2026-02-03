#!/bin/bash
# scripts/fix-types.sh
# Auto-patch type mismatches in Spiralogic Oracle System for clean TypeScript build

echo "🔧 Fixing type definitions and agent files..."

# Navigate to backend directory if not already there
cd "$(dirname "$0")/.." || exit 1

# 1. Ensure AgentResponse includes content
echo "📝 Creating AgentResponse type with content field..."
mkdir -p src/types
cat > src/types/agentResponse.ts <<'EOF'
export interface AgentResponse {
  content: string;              // primary field
  response?: string;            // backward compatibility alias
  confidence: number;
  metadata: any;
}
EOF

# 2. Patch OracleInsight type
echo "📝 Creating OracleInsight type with anon_id field..."
cat > src/types/oracleInsight.ts <<'EOF'
export interface OracleInsight {
  id?: string;
  userId: string;
  agentType: string;
  query: string;
  response: string;
  content?: string;        // alias for response
  anon_id?: string;        // optional legacy field
}
EOF

# 3. Patch AIProvider union type
echo "📝 Creating AIProvider type with elemental agents..."
cat > src/types/aiProvider.ts <<'EOF'
export type AIProvider =
  | "openai"
  | "anthropic"
  | "chatgpt"
  | "fire-agent"
  | "water-agent"
  | "earth-agent"
  | "air-agent"
  | "aether-agent";
EOF

# 4. Patch MemoryItem type
echo "📝 Creating MemoryItem type with response field..."
cat > src/types/memoryItem.ts <<'EOF'
export interface MemoryItem {
  id?: string;
  query: string;
  response: string;       // required for backward compatibility
  content?: string;       // alias for response
  timestamp?: string;
}
EOF

# 5. Fix VoiceTone pace types to include "flowing"
echo "📝 Fixing VoiceTone pace types to include 'flowing'..."
if [ -f "src/types/agentCommunication.ts" ]; then
  # Check if VoiceTone interface exists
  if grep -q "interface VoiceTone" src/types/agentCommunication.ts; then
    # Update the pace line to include "flowing"
    sed -i.bak '/pace:/s/pace: .*/pace: "rushed" | "conversational" | "contemplative" | "spacious" | "flowing";/' src/types/agentCommunication.ts
    rm -f src/types/agentCommunication.ts.bak
    echo "  ✅ Added 'flowing' to VoiceTone pace types"
  else
    echo "  ⚠️  VoiceTone interface not found in agentCommunication.ts"
  fi
else
  echo "  ℹ️  Creating agentCommunication.ts with VoiceTone types..."
  cat > src/types/agentCommunication.ts <<'EOF'
export interface VoiceTone {
  pace: "rushed" | "conversational" | "contemplative" | "spacious" | "flowing";
  pitch?: "low" | "medium" | "high";
  style?: string;
}

export interface AgentCommunication {
  tone?: VoiceTone;
  emotion?: string;
  intent?: string;
}
EOF
fi

# 6. Replace .response with .content in elemental agents
echo "🔄 Updating elemental agents to use content field..."
for agent in FireAgent WaterAgent EarthAgent AirAgent AetherAgent; do
  if [ -f "src/agents/$agent.ts" ]; then
    echo "  - Updating $agent.ts"
    sed -i.bak 's/\.response/\.content/g' "src/agents/$agent.ts"
    sed -i.bak 's/response:/content:/g' "src/agents/$agent.ts"
    rm -f "src/agents/$agent.ts.bak"
  fi
done

# 7. Fix modelService to return content consistently
echo "🔄 Updating modelService to return content field..."
if [ -f "src/utils/modelService.ts" ]; then
  sed -i.bak 's/{ response: \(.*\), confidence: \(.*\), metadata: \(.*\) }/{ content: \1, response: \1, confidence: \2, metadata: \3 }/g' src/utils/modelService.ts
  rm -f src/utils/modelService.ts.bak
fi

# 8. Update any imports that might reference these types
echo "🔄 Updating type imports across the codebase..."
find src -name "*.ts" -type f -exec grep -l "AgentResponse\|OracleInsight\|AIProvider\|MemoryItem" {} \; | while read -r file; do
  # Add imports if they're missing
  if ! grep -q "import.*AgentResponse.*from.*agentResponse" "$file"; then
    if grep -q "AgentResponse" "$file"; then
      echo "  - Adding AgentResponse import to $file"
      # Add import at the top of the file after other imports
      sed -i.bak '1s/^/import { AgentResponse } from ".\/types\/agentResponse";\n/' "$file"
    fi
  fi
done

# Clean up backup files
find src -name "*.bak" -type f -delete

echo ""
echo "✅ Type patches applied!"
echo ""
echo "🔍 Running TypeScript check..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
  echo ""
  echo "✨ TypeScript compilation successful! No type errors found."
  echo ""
  echo "🚀 You can now run: npm run dev"
else
  echo ""
  echo "⚠️  Some TypeScript errors remain. Check the output above."
  echo ""
  echo "💡 You may need to manually fix remaining issues or run:"
  echo "   npm run dev -- to see detailed errors"
fi