#!/usr/bin/env bash
set -e

echo "🚀 DeepSeek + Ollama Setup for macOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Check if Ollama is installed
check_ollama() {
  echo "🔍 Checking for Ollama..."
  
  # Check CLI command
  if command -v ollama &> /dev/null; then
    echo "✅ Ollama CLI found: $(ollama --version 2>/dev/null || echo 'installed')"
    return 0
  fi
  
  # Check if app exists
  if [ -d "/Applications/Ollama.app" ]; then
    echo "✅ Ollama.app found in Applications"
    echo "⚠️  But CLI not in PATH. Launching app..."
    open -a Ollama
    sleep 3
    
    # Check again
    if command -v ollama &> /dev/null; then
      return 0
    fi
  fi
  
  return 1
}

# 2. Install instructions if not found
if ! check_ollama; then
  echo ""
  echo "❌ Ollama not installed!"
  echo ""
  echo "Please install Ollama first:"
  echo ""
  echo "  Option 1: Download from website"
  echo "    1. Go to https://ollama.com/download"
  echo "    2. Download macOS version"
  echo "    3. Drag to Applications"
  echo "    4. Launch Ollama once"
  echo ""
  echo "  Option 2: Install via Homebrew"
  echo "    brew install ollama"
  echo ""
  echo "After installing, run this script again."
  exit 1
fi

# 3. Check if Ollama service is running
echo ""
echo "🔄 Checking Ollama service..."
if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
  echo "📱 Starting Ollama service..."
  
  # Try to launch the app
  if [ -d "/Applications/Ollama.app" ]; then
    open -a Ollama
    echo "⏳ Waiting for Ollama to start..."
    
    # Wait up to 10 seconds
    for i in {1..10}; do
      if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo "✅ Ollama service started!"
        break
      fi
      sleep 1
    done
  else
    # Try starting via CLI
    ollama serve >/dev/null 2>&1 &
    sleep 3
  fi
  
  # Final check
  if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "⚠️  Ollama service may not be running"
    echo "Try: ollama serve"
  fi
else
  echo "✅ Ollama service is running"
fi

# 4. Choose and pull DeepSeek model
echo ""
echo "📦 Choose a DeepSeek model to install:"
echo ""
echo "  1) deepseek-r1:1.5b  (1.0GB - Fastest, good for quick tasks)"
echo "  2) deepseek-r1:7b    (4.1GB - Balanced, recommended)"
echo "  3) deepseek-r1:14b   (8.2GB - More capable)"
echo "  4) deepseek-r1:32b   (18GB - Most powerful)"
echo "  5) deepseek-r1:70b   (40GB - Maximum capability)"
echo ""
echo "  For coding specifically:"
echo "  6) deepseek-coder:1.3b  (776MB - Lightweight code model)"
echo "  7) deepseek-coder:6.7b  (3.8GB - Powerful code model)"
echo "  8) deepseek-coder:33b   (19GB - Advanced code model)"
echo ""
read -p "Choose [1-8] (default: 2): " choice

# Default to 7b if no choice
choice=${choice:-2}

case $choice in
  1) MODEL="deepseek-r1:1.5b" ;;
  2) MODEL="deepseek-r1:7b" ;;
  3) MODEL="deepseek-r1:14b" ;;
  4) MODEL="deepseek-r1:32b" ;;
  5) MODEL="deepseek-r1:70b" ;;
  6) MODEL="deepseek-coder:1.3b" ;;
  7) MODEL="deepseek-coder:6.7b" ;;
  8) MODEL="deepseek-coder:33b" ;;
  *) MODEL="deepseek-r1:7b" ;;
esac

echo ""
echo "📥 Pulling model: $MODEL"
echo "This may take a few minutes..."

if ollama pull $MODEL; then
  echo "✅ Model downloaded successfully!"
else
  echo "❌ Failed to pull model"
  echo "Try manually: ollama pull $MODEL"
  exit 1
fi

# 5. Quick test
echo ""
echo "🧪 Testing model..."
TEST_RESPONSE=$(ollama run $MODEL "Say 'Hello from DeepSeek!' and nothing else" 2>/dev/null || echo "")
if [[ -n "$TEST_RESPONSE" ]]; then
  echo "✅ Model responds: $TEST_RESPONSE"
else
  echo "⚠️  Model test failed, but continuing..."
fi

# 6. Create helper commands
echo ""
echo "📝 Creating helper commands..."
mkdir -p ~/.local/bin

# Main deepseek command
cat > ~/.local/bin/deepseek <<EOF
#!/usr/bin/env bash
ollama run $MODEL "\$@"
EOF

# Quick chat shortcut
cat > ~/.local/bin/ds <<EOF
#!/usr/bin/env bash
ollama run $MODEL "\$@"
EOF

# Code helpers
cat > ~/.local/bin/deepseek-explain <<EOF
#!/usr/bin/env bash
if [ -z "\$1" ]; then
  echo "Usage: deepseek-explain <file>"
  exit 1
fi
cat "\$1" | ollama run $MODEL "Explain this code clearly and concisely"
EOF

cat > ~/.local/bin/deepseek-review <<EOF
#!/usr/bin/env bash
if [ -z "\$1" ]; then
  echo "Usage: deepseek-review <file>"
  exit 1
fi
cat "\$1" | ollama run $MODEL "Review this code for bugs, performance, and best practices"
EOF

cat > ~/.local/bin/deepseek-refactor <<EOF
#!/usr/bin/env bash
if [ -z "\$1" ]; then
  echo "Usage: deepseek-refactor <file> [guidance]"
  exit 1
fi
GUIDANCE="\${2:-for better readability and performance}"
cat "\$1" | ollama run $MODEL "Refactor this code \$GUIDANCE"
EOF

cat > ~/.local/bin/deepseek-test <<EOF
#!/usr/bin/env bash
if [ -z "\$1" ]; then
  echo "Usage: deepseek-test <file>"
  exit 1
fi
cat "\$1" | ollama run $MODEL "Generate comprehensive unit tests for this code"
EOF

cat > ~/.local/bin/deepseek-fix <<EOF
#!/usr/bin/env bash
if [ -z "\$1" ]; then
  echo "Usage: deepseek-fix <file>"
  exit 1
fi
cat "\$1" | ollama run $MODEL "Find and fix bugs in this code. Show the corrected version."
EOF

# Oracle for your AIN system
cat > ~/.local/bin/deepseek-oracle <<EOF
#!/usr/bin/env bash
echo "🔮 DeepSeek Oracle - Analyzing AIN System"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Try to find backend directory
BACKEND=""
for dir in "." ".." "../.." "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem"; do
  if [ -d "\$dir/backend/src" ]; then
    BACKEND="\$dir/backend"
    break
  fi
done

if [ -z "\$BACKEND" ]; then
  echo "❌ Cannot find backend directory"
  echo "Run this from your project directory"
  exit 1
fi

# Core files to analyze
FILES=(
  "\$BACKEND/src/agents/PersonalOracleAgent.ts"
  "\$BACKEND/src/ain/AINOrchestrator.ts"
  "\$BACKEND/src/ain/collective/CollectiveIntelligence.ts"
  "\$BACKEND/src/memory/EnhancedMemorySystem.ts"
)

for FILE in "\${FILES[@]}"; do
  if [ -f "\$FILE" ]; then
    echo ""
    echo "📄 \$(basename \$FILE)"
    echo "───────────────────────────────"
    cat "\$FILE" | head -100 | ollama run $MODEL "In 2 sentences, what does this code do?"
    echo ""
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Oracle analysis complete!"
EOF

# Make all executable
chmod +x ~/.local/bin/deepseek*
chmod +x ~/.local/bin/ds

# 7. Add to PATH
echo ""
echo "🔧 Configuring shell..."

# For zsh (default on macOS)
if [ -f ~/.zshrc ]; then
  if ! grep -q 'export PATH="$HOME/.local/bin:$PATH"' ~/.zshrc; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
    echo "✅ Added to ~/.zshrc"
  fi
fi

# For bash (if used)
if [ -f ~/.bash_profile ]; then
  if ! grep -q 'export PATH="$HOME/.local/bin:$PATH"' ~/.bash_profile; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bash_profile
    echo "✅ Added to ~/.bash_profile"
  fi
fi

# 8. Create quick reference
cat > ~/.deepseek-help.txt <<EOF
🧠 DeepSeek Commands Reference
═══════════════════════════════

Quick Chat:
  ds "your prompt"              - Quick chat (shortcut)
  deepseek "your prompt"        - Full DeepSeek chat

Code Analysis:
  deepseek-explain file.ts      - Explain code
  deepseek-review file.ts       - Code review
  deepseek-refactor file.ts     - Suggest refactors
  deepseek-test file.ts         - Generate tests
  deepseek-fix file.ts          - Fix bugs

Special:
  deepseek-oracle               - Analyze your AIN system

Direct Ollama:
  ollama run $MODEL             - Interactive chat
  ollama list                   - Show installed models
  ollama pull model:tag         - Download new model
  ollama rm model:tag           - Remove model

Examples:
  ds "What is consciousness?"
  deepseek-explain backend/src/agents/PersonalOracleAgent.ts
  cat file.ts | ollama run $MODEL "Find security issues"
  
Current model: $MODEL
EOF

# Final message
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║            🎉 DeepSeek Setup Complete!                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "  Model installed: $MODEL"
echo "  Location: ~/.local/bin/"
echo ""
echo "🚀 Quick Start:"
echo ""
echo "  1. Reload your shell:"
echo "     source ~/.zshrc"
echo ""
echo "  2. Test it works:"
echo "     ds \"Hello, what can you do?\""
echo ""
echo "  3. Analyze your code:"
echo "     deepseek-oracle"
echo ""
echo "📚 All commands:"
echo "   cat ~/.deepseek-help.txt"
echo ""

# Create an alias for help
if ! grep -q 'alias ds-help=' ~/.zshrc 2>/dev/null; then
  echo 'alias ds-help="cat ~/.deepseek-help.txt"' >> ~/.zshrc
fi

echo "💡 Type 'ds-help' after reloading shell to see commands"
echo ""