#!/usr/bin/env bash
set -e

echo "🚀 Setting up Ollama + DeepSeek..."

# Detect operating system
detect_os() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "macos"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "linux"
  else
    echo "unknown"
  fi
}

OS=$(detect_os)

# 1. Install Ollama based on OS
if ! command -v ollama &> /dev/null; then
  echo "📦 Ollama not found. Installing for $OS..."
  
  case $OS in
    macos)
      echo "❌ Ollama not installed on macOS."
      echo ""
      echo "Please install Ollama manually:"
      echo "  1. Go to https://ollama.com/download"
      echo "  2. Download the macOS app"
      echo "  3. Drag to Applications and launch once"
      echo "  4. Re-run this script"
      echo ""
      echo "Or install via Homebrew:"
      echo "  brew install ollama"
      echo ""
      exit 1
      ;;
    linux)
      echo "Installing Ollama for Linux..."
      curl -fsSL https://ollama.com/install.sh | sh
      ;;
    *)
      echo "❌ Unsupported OS: $OSTYPE"
      echo "Please install Ollama manually from https://ollama.com/download"
      exit 1
      ;;
  esac
else
  echo "✅ Ollama already installed ($(ollama --version 2>/dev/null || echo 'version unknown'))"
fi

# 2. Start Ollama service if needed
echo "🔄 Checking Ollama service..."
if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
  echo "Starting Ollama service..."
  
  case $OS in
    macos)
      # On macOS, try to launch the app
      if [ -d "/Applications/Ollama.app" ]; then
        open -a Ollama
        echo "⏳ Waiting for Ollama to start..."
        sleep 5
      else
        echo "⚠️  Please launch Ollama app manually"
      fi
      ;;
    linux)
      # On Linux, start as service
      ollama serve >/dev/null 2>&1 &
      echo "⏳ Waiting for Ollama to start..."
      sleep 3
      ;;
  esac
  
  # Verify it's running
  if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "✅ Ollama service is running"
  else
    echo "⚠️  Ollama service may not be running. Please check manually."
  fi
else
  echo "✅ Ollama service already running"
fi

# 3. Ask which DeepSeek model to pull
echo ""
echo "Which DeepSeek model do you want to install?"
echo "  1) deepseek-r1:1.5b (fastest, lightest - 1.6GB)"
echo "  2) deepseek-r1:7b   (balanced choice - 7.3GB)"
echo "  3) deepseek-r1:14b  (more capable - 14GB)"
echo "  4) deepseek-r1:32b  (most powerful - 32GB)"
echo "  5) deepseek-coder:6.7b (code-focused - 3.8GB)"
echo "  6) deepseek-coder:1.3b (lightweight code - 776MB)"
read -p "Choose [1-6]: " choice

case $choice in
  1) MODEL="deepseek-r1:1.5b" ;;
  2) MODEL="deepseek-r1:7b" ;;
  3) MODEL="deepseek-r1:14b" ;;
  4) MODEL="deepseek-r1:32b" ;;
  5) MODEL="deepseek-coder:6.7b" ;;
  6) MODEL="deepseek-coder:1.3b" ;;
  *) echo "❌ Invalid choice. Defaulting to deepseek-r1:7b"; MODEL="deepseek-r1:7b" ;;
esac

echo "📥 Pulling model: $MODEL"
echo "This may take a few minutes depending on model size and internet speed..."

if ollama pull $MODEL; then
  echo "✅ Model downloaded successfully"
else
  echo "❌ Failed to pull model. Please check your connection and try again."
  exit 1
fi

# 4. Test the model
echo ""
echo "🧪 Testing model..."
if ollama run $MODEL "Say 'DeepSeek is ready!' and nothing else" 2>/dev/null; then
  echo "✅ Model test successful!"
else
  echo "⚠️  Model test failed, but continuing setup..."
fi

# 5. Create helper bin dir if not exists
mkdir -p ~/.local/bin

# 6. Create helper scripts
echo ""
echo "⚙️  Creating helper commands in ~/.local/bin/"

# Main deepseek command
cat > ~/.local/bin/deepseek <<EOF
#!/usr/bin/env bash
ollama run $MODEL "\$@"
EOF

# Code analysis commands
cat > ~/.local/bin/deepseek-explain <<EOF
#!/usr/bin/env bash
cat "\$1" | ollama run $MODEL "Explain this code clearly"
EOF

cat > ~/.local/bin/deepseek-refactor <<EOF
#!/usr/bin/env bash
cat "\$1" | ollama run $MODEL "Refactor this code: \${2:-for better readability and performance}"
EOF

cat > ~/.local/bin/deepseek-review <<EOF
#!/usr/bin/env bash
cat "\$1" | ollama run $MODEL "Do a thorough code review of this file"
EOF

cat > ~/.local/bin/deepseek-test <<EOF
#!/usr/bin/env bash
cat "\$1" | ollama run $MODEL "Generate comprehensive tests for this file"
EOF

# 🔮 Enhanced deepseek-oracle with smart file detection
cat > ~/.local/bin/deepseek-oracle <<'EOF'
#!/usr/bin/env bash

# Try to find the backend directory
find_backend() {
  # Check common locations
  local dirs=(
    "$(pwd)/backend"
    "$(pwd)"
    "$HOME/Projects/SpiralogicOracleSystem/backend"
    "/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/backend"
  )
  
  for dir in "${dirs[@]}"; do
    if [ -d "$dir/src" ]; then
      echo "$dir"
      return 0
    fi
  done
  
  echo ""
  return 1
}

BACKEND=$(find_backend)

# Default core AIN files if no arguments provided
if [ -n "$BACKEND" ]; then
  DEFAULT_FILES=(
    "$BACKEND/src/agents/PersonalOracleAgent.ts"
    "$BACKEND/src/ain/AINOrchestrator.ts"
    "$BACKEND/src/ain/collective/CollectiveIntelligence.ts"
    "$BACKEND/src/memory/EnhancedMemorySystem.ts"
    "$BACKEND/src/ain/motivation/psi-lite.ts"
  )
else
  DEFAULT_FILES=()
fi

# Use provided files or defaults
if [ $# -eq 0 ]; then
  if [ ${#DEFAULT_FILES[@]} -eq 0 ]; then
    echo "❌ No files specified and couldn't find backend directory"
    echo "Usage: deepseek-oracle [files...]"
    exit 1
  fi
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
      echo "📄 Processing: $(basename $EXPANDED_FILE)"
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

# Batch processing helper
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
    echo "📄 $(basename $FILE):"
    cat "$FILE" | ollama run MODEL_PLACEHOLDER "$PROMPT"
    echo ""
  else
    echo "⚠️  Skipping: $FILE (not found)"
  fi
done
EOF

sed -i.bak "s/MODEL_PLACEHOLDER/$MODEL/g" ~/.local/bin/deepseek-batch && rm ~/.local/bin/deepseek-batch.bak

# Make all scripts executable
chmod +x ~/.local/bin/deepseek*

# 7. Add to PATH based on shell
SHELL_NAME=$(basename "$SHELL")
echo ""
echo "🔧 Configuring shell ($SHELL_NAME)..."

# Function to add PATH to a shell config file
add_to_shell_config() {
  local config_file=$1
  
  if [ -f "$config_file" ]; then
    if ! grep -q 'export PATH="$HOME/.local/bin:$PATH"' "$config_file"; then
      echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$config_file"
      echo "✅ Added ~/.local/bin to PATH in $config_file"
    fi
    
    if ! grep -q 'source ~/.deepseek-functions' "$config_file"; then
      echo 'source ~/.deepseek-functions' >> "$config_file"
      echo "✅ Added ~/.deepseek-functions to $config_file"
    fi
  fi
}

# Configure for zsh
add_to_shell_config ~/.zshrc

# Configure for bash
add_to_shell_config ~/.bashrc

# Configure for fish if present
if [ -d ~/.config/fish ]; then
  mkdir -p ~/.config/fish/conf.d
  cat > ~/.config/fish/conf.d/deepseek.fish <<'EOF'
set -gx PATH $HOME/.local/bin $PATH
EOF
  echo "✅ Configured fish shell"
fi

# 8. Create shell functions file
cat > ~/.deepseek-functions <<EOF
# DeepSeek Shell Shortcuts
export DEEPSEEK_MODEL="$MODEL"

# Quick chat
ds() { deepseek "\$@"; }

# Fix bugs in file
ds-fix() { 
  if [ -z "\$1" ]; then
    echo "Usage: ds-fix <file>"
    return 1
  fi
  cat "\$1" | ollama run \$DEEPSEEK_MODEL "Fix bugs in this file and explain the fixes"
}

# Compare two files
ds-compare() { 
  if [ -z "\$2" ]; then
    echo "Usage: ds-compare <file1> <file2>"
    return 1
  fi
  diff -u "\$1" "\$2" | ollama run \$DEEPSEEK_MODEL "Review these differences and explain what changed"
}

# Quick oracle on single file
ds-quick() {
  local file="\${1:-backend/src/agents/PersonalOracleAgent.ts}"
  if [ -f "\$file" ]; then
    echo "⚡ Quick analysis of \$file"
    cat "\$file" | head -200 | ollama run \$DEEPSEEK_MODEL "Analyze this code and suggest one key improvement"
  else
    echo "File not found: \$file"
  fi
}

# Help command
ds-help() { 
  echo "🧠 DeepSeek Commands (Model: \$DEEPSEEK_MODEL)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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
  echo "    deepseek-batch \"prompt\" files... - Batch processing"
  echo ""
  echo "  Shortcuts:"
  echo "    ds-fix <file>                - Fix bugs"
  echo "    ds-compare <f1> <f2>         - Compare files"
  echo "    ds-quick [file]              - Quick analysis"
  echo ""
  echo "  Examples:"
  echo "    deepseek-oracle              - Analyze core AIN files"
  echo "    deepseek-oracle src/**/*.ts  - Analyze TypeScript files"
  echo "    deepseek-batch \"Find bugs\" *.js"
  echo ""
}

# Common aliases
alias ds-agents='deepseek-oracle backend/src/agents/*.ts 2>/dev/null || deepseek-oracle src/agents/*.ts'
alias ds-ain='deepseek-oracle backend/src/ain/**/*.ts 2>/dev/null || deepseek-oracle src/ain/**/*.ts'
alias ds-memory='deepseek-oracle backend/src/memory/*.ts 2>/dev/null || deepseek-oracle src/memory/*.ts'

# Show help on source
echo "💡 Type 'ds-help' to see all DeepSeek commands"
EOF

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              🎉 DeepSeek Setup Complete!                  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "  OS:    $OS"
echo "  Model: $MODEL"
echo "  Shell: $SHELL_NAME"
echo ""
echo "🔄 Next steps:"
echo "  1. Restart terminal or run: source ~/.${SHELL_NAME}rc"
echo "  2. Test with: deepseek \"Hello\""
echo ""
echo "📚 Quick Examples:"
echo "  deepseek \"What can you do?\"         # Chat"
echo "  deepseek-oracle                     # Analyze AIN"
echo "  ds-help                             # Show commands"
echo ""

# Final verification
if command -v ollama &>/dev/null && curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
  echo "✅ Everything looks good!"
else
  echo "⚠️  Setup complete but Ollama may need attention"
  echo "   Please ensure Ollama is running"
fi