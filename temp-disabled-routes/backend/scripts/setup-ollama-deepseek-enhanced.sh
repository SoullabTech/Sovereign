#!/usr/bin/env bash
set -e

echo "🚀 Setting up Ollama + DeepSeek..."

# 1. Install Ollama if not already installed
if ! command -v ollama &> /dev/null; then
  echo "📦 Installing Ollama..."
  curl -fsSL https://ollama.com/install.sh | sh
else
  echo "✅ Ollama already installed."
fi

# 2. Ask which DeepSeek model to pull
echo ""
echo "Which DeepSeek model do you want to install?"
echo "  1) deepseek-r1:1.5b (fastest, lightest)"
echo "  2) deepseek-r1:7b   (balanced choice)"
echo "  3) deepseek-r1:32b  (slower, more powerful)"
read -p "Choose [1-3]: " choice

case $choice in
  1) MODEL="deepseek-r1:1.5b" ;;
  2) MODEL="deepseek-r1:7b" ;;
  3) MODEL="deepseek-r1:32b" ;;
  *) echo "❌ Invalid choice. Defaulting to deepseek-r1:7b"; MODEL="deepseek-r1:7b" ;;
esac

echo "📥 Pulling model: $MODEL"
ollama pull $MODEL

# 3. Create helper bin dir if not exists
mkdir -p ~/.local/bin

# 4. Create helper scripts
echo "⚙️ Creating helper commands in ~/.local/bin/"

cat > ~/.local/bin/deepseek <<EOF
#!/usr/bin/env bash
ollama run $MODEL "\$@"
EOF

cat > ~/.local/bin/deepseek-explain <<EOF
#!/usr/bin/env bash
cat "\$1" | ollama run $MODEL "Explain this code clearly"
EOF

cat > ~/.local/bin/deepseek-refactor <<EOF
#!/usr/bin/env bash
cat "\$1" | ollama run $MODEL "Refactor this code: \$2"
EOF

cat > ~/.local/bin/deepseek-review <<EOF
#!/usr/bin/env bash
cat "\$1" | ollama run $MODEL "Do a code review of this file"
EOF

cat > ~/.local/bin/deepseek-test <<EOF
#!/usr/bin/env bash
cat "\$1" | ollama run $MODEL "Generate tests for this file"
EOF

# Add deepseek-oracle for AIN system analysis
cat > ~/.local/bin/deepseek-oracle <<'EOF'
#!/usr/bin/env bash
# Analyze core Oracle AIN files

# Find the SpiralogicOracleSystem directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR=""

# Search for backend directory
for dir in "$SCRIPT_DIR/../../.." "$HOME/Projects/SpiralogicOracleSystem" "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem"; do
  if [ -d "$dir/backend" ]; then
    BACKEND_DIR="$dir/backend"
    break
  fi
done

if [ -z "$BACKEND_DIR" ]; then
  echo "❌ Could not find backend directory"
  exit 1
fi

echo "🔮 DeepSeek Oracle Analysis Starting..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Core files to analyze
declare -a AIN_FILES=(
  "src/agents/PersonalOracleAgent.ts"
  "src/ain/AINOrchestrator.ts"
  "src/ain/collective/CollectiveIntelligence.ts"
  "src/ain/motivation/psi-lite.ts"
  "src/memory/EnhancedMemorySystem.ts"
)

for file in "${AIN_FILES[@]}"; do
  filepath="$BACKEND_DIR/$file"
  if [ -f "$filepath" ]; then
    echo ""
    echo "📄 Analyzing: $file"
    echo "─────────────────────────────────"
    
    # Quick review
    echo "🔍 Quick Review:"
    cat "$filepath" | head -50 | ollama run MODEL_PLACEHOLDER "Give a one-sentence summary of this code's purpose"
    
    # Potential improvements
    echo ""
    echo "💡 Suggested Improvements:"
    cat "$filepath" | ollama run MODEL_PLACEHOLDER "List 3 quick improvements for this code (one line each)"
    
    echo ""
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Oracle Analysis Complete!"
EOF

# Replace MODEL_PLACEHOLDER with actual model
sed -i.bak "s/MODEL_PLACEHOLDER/$MODEL/g" ~/.local/bin/deepseek-oracle && rm ~/.local/bin/deepseek-oracle.bak

chmod +x ~/.local/bin/deepseek*

# 5. Add to PATH in .zshrc
if ! grep -q 'export PATH="$HOME/.local/bin:$PATH"' ~/.zshrc; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
  echo "✅ Added ~/.local/bin to PATH in ~/.zshrc"
fi

# 6. Create optional functions file with actual model
cat > ~/.deepseek-functions <<EOF
# DeepSeek Shell Shortcuts
export DEEPSEEK_MODEL="$MODEL"

ds() { deepseek "\$@"; }
ds-fix() { cat "\$1" | ollama run \$DEEPSEEK_MODEL "Fix bugs in this file"; }
ds-compare() { diff -u "\$1" "\$2" | ollama run \$DEEPSEEK_MODEL "Review these differences"; }
ds-help() { 
  echo "🧠 DeepSeek Commands:"
  echo "  ds <prompt>           - Quick AI chat"
  echo "  ds-fix <file>         - Fix bugs in file"
  echo "  ds-compare <f1> <f2>  - Compare two files"
  echo "  deepseek-explain      - Explain code"
  echo "  deepseek-refactor     - Refactor code"
  echo "  deepseek-review       - Code review"
  echo "  deepseek-test         - Generate tests"
  echo "  deepseek-oracle       - Analyze AIN system"
  echo ""
  echo "Oracle Commands:"
  echo "  ds-maya <prompt>      - Maya oracle mode"
  echo "  ds-ain [file]         - Analyze AIN component"
  echo "  ds-memory [file]      - Review memory system"
}

# Oracle-specific shortcuts
ds-maya() { 
  echo "\$@" | ollama run \$DEEPSEEK_MODEL "As Maya, the sacred AI oracle, respond with wisdom and insight: \$@"
}

ds-ain() {
  local file="\${1:-backend/src/ain/AINOrchestrator.ts}"
  if [ -f "\$file" ]; then
    cat "\$file" | ollama run \$DEEPSEEK_MODEL "Analyze this AIN component for coherence and optimization opportunities"
  else
    echo "File not found: \$file"
  fi
}

ds-memory() {
  local file="\${1:-backend/src/memory/EnhancedMemorySystem.ts}"
  if [ -f "\$file" ]; then
    cat "\$file" | ollama run \$DEEPSEEK_MODEL "Review this memory system for potential improvements"
  else
    echo "File not found: \$file"
  fi
}

# Quick code helpers
ds-debug() {
  local file="\$1"
  cat "\$file" | ollama run \$DEEPSEEK_MODEL "Find potential bugs and issues in this code"
}

ds-optimize() {
  local file="\$1"
  cat "\$file" | ollama run \$DEEPSEEK_MODEL "Suggest performance optimizations for this code"
}

ds-docs() {
  local file="\$1"
  cat "\$file" | ollama run \$DEEPSEEK_MODEL "Generate comprehensive documentation for this code"
}
EOF

if ! grep -q 'source ~/.deepseek-functions' ~/.zshrc; then
  echo 'source ~/.deepseek-functions' >> ~/.zshrc
  echo "✅ Added ~/.deepseek-functions sourcing to ~/.zshrc"
fi

# 7. Also add to .bashrc if it exists
if [ -f ~/.bashrc ]; then
  if ! grep -q 'export PATH="$HOME/.local/bin:$PATH"' ~/.bashrc; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
    echo 'source ~/.deepseek-functions' >> ~/.bashrc
    echo "✅ Also configured ~/.bashrc"
  fi
fi

# 8. Create a quick test script
cat > ~/.local/bin/deepseek-test-setup <<EOF
#!/usr/bin/env bash
echo "🧪 Testing DeepSeek Setup..."
echo ""
echo "1. Testing basic command:"
deepseek "Say 'DeepSeek is working!' and nothing else"
echo ""
echo "2. Available commands:"
ds-help
echo ""
echo "✅ Setup test complete!"
EOF
chmod +x ~/.local/bin/deepseek-test-setup

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║          🎉 DeepSeek Setup Complete!                 ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "Model installed: $MODEL"
echo ""
echo "🔄 Restart your terminal or run:"
echo "   source ~/.zshrc"
echo ""
echo "🧪 Quick test commands:"
echo "   deepseek \"Hello, what can you do?\""
echo "   ds-help                    # Show all commands"
echo "   deepseek-oracle            # Analyze AIN system"
echo "   ds-maya \"Tell me wisdom\"   # Maya oracle mode"
echo "   deepseek-test-setup        # Run full test"
echo ""
echo "💡 Pro tip: Use 'ds' as shorthand for 'deepseek'"
echo ""