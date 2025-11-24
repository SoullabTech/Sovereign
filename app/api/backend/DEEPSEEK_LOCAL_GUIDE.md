# 🧠 DeepSeek Local AI Assistant Guide

This guide helps you use DeepSeek locally with Ollama for analyzing and improving the Maya Oracle codebase.

## 🚀 Quick Setup

```bash
# Run the setup script
./scripts/setup-ollama-deepseek.sh
```

This will:
- Install Ollama (if needed)
- Download a DeepSeek model
- Create helper commands
- Set up shell functions

## 📚 Common Use Cases for Maya Oracle

### 1. Analyze Agent Architecture

```bash
# Understand an agent
deepseek-explain src/agents/PersonalOracleAgent.ts

# Review agent interactions
deepseek-review src/agents/AirAgent.ts

# Compare agents
ds-compare src/agents/FireAgent.ts src/agents/WaterAgent.ts
```

### 2. Memory System Analysis

```bash
# Explain memory architecture
deepseek-file src/types/memory.ts "How does this memory system work?"

# Suggest improvements
deepseek-refactor src/memory/SoulMemoryService.ts "thread safety and performance"

# Generate tests
deepseek-test src/memory/SemanticJournalingService.ts
```

### 3. AIN Integration Review

```bash
# Analyze collective intelligence
deepseek-explain src/ain/collective/CollectiveIntelligence.ts

# Review pattern recognition
deepseek-review src/ain/collective/PatternRecognitionEngine.ts

# Refactor suggestions
deepseek-refactor src/ain/AINOrchestrator.ts
```

### 4. Quick Debugging

```bash
# Fix an error
ds-fix src/server.ts "port already in use error"

# Explain error handling
deepseek "How should I handle WebSocket disconnections in TypeScript?"

# Best practices
deepseek "Best practices for TypeScript agent architecture"
```

## 🛠️ Advanced Commands

### Batch Analysis

```bash
# Analyze all agents
for f in src/agents/*.ts; do
    echo "=== Analyzing $f ==="
    deepseek-file "$f" "Summarize this agent's purpose in one line"
done > agent-summary.txt
```

### Architecture Review

```bash
# Full architecture analysis
find src -name "*.ts" -type f | \
    xargs -I {} echo {} | \
    deepseek "Based on these TypeScript files, describe the overall architecture"
```

### Generate Documentation

```bash
# Create docs for a module
deepseek-file src/ain/AINOrchestrator.ts \
    "Generate comprehensive JSDoc comments for all methods"
```

## 🎯 Maya Oracle Specific Prompts

### Agent Development
```bash
deepseek "How can I create a new elemental agent that integrates with the existing Fire, Water, Air, Earth agents?"
```

### Memory Enhancement
```bash
deepseek-file src/memory/SoulMemoryService.ts \
    "Suggest how to add vector similarity search to this memory system"
```

### Voice Integration
```bash
deepseek "How can I integrate the Sesame CSM voice model with the PersonalOracleAgent streaming responses?"
```

### Performance Optimization
```bash
deepseek-review src/routes/conversational.stream.routes.ts \
    "Focus on streaming performance and memory usage"
```

## 💡 Tips

1. **Model Selection**:
   - Use `1.5b` for quick analysis
   - Use `7b` for balanced quality (default)
   - Use `14b`+ for complex refactoring

2. **Change Model**:
   ```bash
   export DEEPSEEK_MODEL=deepseek-r1:14b
   ```

3. **Interactive Deep Dive**:
   ```bash
   # Start interactive session
   deepseek
   
   # Then paste code and ask questions
   ```

4. **Save Analysis**:
   ```bash
   deepseek-review src/agents/PersonalOracleAgent.ts > oracle-review.md
   ```

## 🔧 Troubleshooting

- **Ollama not running**: `ollama serve` (in separate terminal)
- **Model too slow**: Switch to smaller model
- **Out of memory**: Use `1.5b` model or increase swap

## 🎓 Example Workflow

```bash
# 1. Understand the system
deepseek-explain src/server.ts
deepseek-file src/api/index.ts

# 2. Review critical components
deepseek-review src/agents/PersonalOracleAgent.ts

# 3. Get improvement suggestions
deepseek-refactor src/memory/SoulMemoryService.ts

# 4. Generate tests
deepseek-test src/utils/modelService.ts

# 5. Fix issues
ds-fix src/types/index.ts "TypeScript error with agent types"
```

## 🌟 Pro Tips for Maya Oracle

1. **Agent Analysis**:
   ```bash
   deepseek "How can I make the PersonalOracleAgent more emotionally aware?"
   ```

2. **Memory Patterns**:
   ```bash
   deepseek "Suggest a memory consolidation strategy for long conversations"
   ```

3. **Stream Optimization**:
   ```bash
   deepseek-file src/utils/streamProcessor.ts \
       "How to reduce latency in SSE streaming?"
   ```

Remember: DeepSeek runs 100% locally, no API keys needed, your code never leaves your machine! 🔒