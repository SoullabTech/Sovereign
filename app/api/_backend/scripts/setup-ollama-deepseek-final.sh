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

# 🔮 Enhanced deepseek-oracle — accepts custom files or uses defaults
cat > ~/.local/bin/deepseek-oracle <<'EOF'
#!/usr/bin/env bash

# Default core AIN files if no arguments provided
DEFAULT_FILES=(
  "backend/src/agents/PersonalOracleAgent.ts"
  "backend/src/ain/AINOrchestrator.ts"
  "backend/src/ain/collective/CollectiveIntelligence.ts"
  "backend/src/memory/EnhancedMemorySystem.ts"
  "backend/src/ain/motivation/psi-lite.ts"
)

# Use provided files or defaults
if [ $# -eq 0 ]; then
  FILES=("${DEFAULT_FILES[@]}")
  echo "🔮 Oracle Mode: Analyzing core AIN system files..."
else
  FILES=("$@")
  echo "🔮 Oracle Mode: Analyzing specified files..."
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for FILE in "${FILES[@]}"; do
  # Handle glob patterns
  for EXPANDED_FILE in $FILE; do
    if [ -f "$EXPANDED_FILE" ]; then
      echo ""
      echo "📄 Processing: $EXPANDED_FILE"
      echo "───────────────────────────────────────────"
      
      # Quick explain
      echo "🔍 Explanation:"
      cat "$EXPANDED_FILE" | head -100 | ollama run MODEL_PLACEHOLDER "Explain this code's purpose in 2-3 sentences"
      
      echo ""
      echo "📝 Code Review:"
      cat "$EXPANDED_FILE" | ollama run MODEL_PLACEHOLDER "List the top 3 issues or improvements for this code"
      
      echo ""
      echo "⚡ Refactor Suggestions:"
      cat "$EXPANDED_FILE" | ollama run MODEL_PLACEHOLDER "Suggest one key refactor that would most improve this code"
      
      echo ""
    else
      echo "⚠️  Skipping missing file: $EXPANDED_FILE"
    fi
  done
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Oracle analysis complete!"
EOF

# Replace MODEL_PLACEHOLDER with actual model
sed -i.bak "s/MODEL_PLACEHOLDER/$MODEL/g" ~/.local/bin/deepseek-oracle && rm ~/.local/bin/deepseek-oracle.bak

# Create a batch analysis helper
cat > ~/.local/bin/deepseek-batch <<'EOF'
#!/usr/bin/env bash
# Batch process multiple files with a single prompt

if [ $# -lt 2 ]; then
  echo "Usage: deepseek-batch \"<prompt>\" file1 [file2 ...]"
  exit 1
fi

PROMPT="$1"
shift

echo "🔄 Batch processing with prompt: $PROMPT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for FILE in "$@"; do
  if [ -f "$FILE" ]; then
    echo ""
    echo "📄 $FILE:"
    cat "$FILE" | ollama run MODEL_PLACEHOLDER "$PROMPT"
    echo ""
  else
    echo "⚠️  Skipping: $FILE (not found)"
  fi
done
EOF

sed -i.bak "s/MODEL_PLACEHOLDER/$MODEL/g" ~/.local/bin/deepseek-batch && rm ~/.local/bin/deepseek-batch.bak

chmod +x ~/.local/bin/deepseek*

# 5. Add to PATH in .zshrc
if ! grep -q 'export PATH="$HOME/.local/bin:$PATH"' ~/.zshrc; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
  echo "✅ Added ~/.local/bin to PATH in ~/.zshrc"
fi

# 6. Create enhanced functions file
cat > ~/.deepseek-functions <<EOF
# DeepSeek Shell Shortcuts
export DEEPSEEK_MODEL="$MODEL"

# Quick chat
ds() { deepseek "\$@"; }

# Fix bugs in file
ds-fix() { 
  cat "\$1" | ollama run \$DEEPSEEK_MODEL "Fix bugs in this file and explain the fixes"
}

# Compare two files
ds-compare() { 
  diff -u "\$1" "\$2" | ollama run \$DEEPSEEK_MODEL "Review these differences and explain what changed"
}

# Quick oracle on single file
ds-quick() {
  local file="\${1:-backend/src/agents/PersonalOracleAgent.ts}"
  echo "⚡ Quick analysis of \$file"
  cat "\$file" | head -200 | ollama run \$DEEPSEEK_MODEL "Analyze this code and suggest one key improvement"
}

# Help command
ds-help() { 
  echo "🧠 DeepSeek Commands:"
  echo ""
  echo "  Basic:"
  echo "    ds <prompt>                  - Quick AI chat"
  echo "    deepseek <prompt>            - Full DeepSeek chat"
  echo ""
  echo "  Code Analysis:"
  echo "    deepseek-explain <file>      - Explain code"
  echo "    deepseek-review <file>       - Code review"
  echo "    deepseek-refactor <file>     - Refactor suggestions"
  echo "    deepseek-test <file>         - Generate tests"
  echo ""
  echo "  Advanced:"
  echo "    deepseek-oracle [files...]   - Full analysis (explain+review+refactor)"
  echo "    deepseek-batch \"<prompt>\" files... - Run same prompt on multiple files"
  echo ""
  echo "  Shortcuts:"
  echo "    ds-fix <file>                - Fix bugs"
  echo "    ds-compare <f1> <f2>         - Compare files"
  echo "    ds-quick [file]              - Quick analysis"
  echo ""
  echo "  Examples:"
  echo "    deepseek-oracle              - Analyze core AIN files"
  echo "    deepseek-oracle src/agents/*.ts - Analyze all agent files"
  echo "    deepseek-batch \"Find security issues\" src/**/*.ts"
  echo ""
  echo "  Current model: \$DEEPSEEK_MODEL"
}

# Aliases for common patterns
alias ds-agents='deepseek-oracle backend/src/agents/*.ts'
alias ds-ain='deepseek-oracle backend/src/ain/**/*.ts'
alias ds-memory='deepseek-oracle backend/src/memory/*.ts'
EOF

if ! grep -q 'source ~/.deepseek-functions' ~/.zshrc; then
  echo 'source ~/.deepseek-functions' >> ~/.zshrc
  echo "✅ Added ~/.deepseek-functions sourcing to ~/.zshrc"
fi

# 7. Also configure .bashrc if it exists
if [ -f ~/.bashrc ]; then
  if ! grep -q 'export PATH="$HOME/.local/bin:$PATH"' ~/.bashrc; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
    echo 'source ~/.deepseek-functions' >> ~/.bashrc
    echo "✅ Also configured ~/.bashrc"
  fi
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              🎉 DeepSeek Setup Complete!                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Model installed: $MODEL"
echo ""
echo "🔄 Restart terminal or run: source ~/.zshrc"
echo ""
echo "📚 Quick Start Examples:"
echo ""
echo "  deepseek \"Hello\"                    # Chat with DeepSeek"
echo "  deepseek-oracle                     # Analyze core AIN files"
echo "  deepseek-oracle src/agents/*.ts     # Analyze custom files"
echo "  deepseek-batch \"Find bugs\" src/**/*.ts  # Batch analysis"
echo "  ds-help                             # Show all commands"
echo ""
echo "🔮 Oracle Shortcuts:"
echo "  ds-agents    # Analyze all agents"
echo "  ds-ain       # Analyze AIN system"
echo "  ds-memory    # Analyze memory system"
echo ""