# 🧠 DeepSeek Local AI via Ollama - Deployment Guide

Complete guide for deploying DeepSeek models locally with privacy-first, offline AI capabilities.

## 🎯 Overview

DeepSeek provides state-of-the-art AI models that run 100% locally on your hardware:

- **Privacy-First**: No data leaves your machine
- **Offline-Ready**: Works without internet connection
- **Cost-Effective**: No API fees or usage limits
- **Low Latency**: Direct local inference
- **Full Control**: Your models, your data, your rules

## 🚀 Quick Start

```bash
# 1. One-time setup
cd backend
./scripts/setup-deepseek-ollama.sh

# 2. Start chat interface
npm run deepseek:chat

# 3. Or start API server
npm run deepseek:serve
```

## 📦 Installation Options

### Option 1: Automated Setup (Recommended)

```bash
./backend/scripts/setup-deepseek-ollama.sh
```

This script will:
1. Install Ollama if needed
2. Start the Ollama service
3. Download your chosen DeepSeek model
4. Create configuration files
5. Test the installation

### Option 2: Manual Setup

#### Step 1: Install Ollama

**macOS:**
```bash
brew install ollama
# Or
curl -fsSL https://ollama.com/install.sh | sh
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from [ollama.com](https://ollama.com)

#### Step 2: Start Ollama Service

```bash
ollama serve
```

#### Step 3: Pull DeepSeek Model

Choose your model based on requirements:

```bash
# For code-focused tasks (8.9GB)
ollama pull deepseek-coder-v2

# For general purpose (4.1GB)
ollama pull deepseek-llm

# For balanced performance (3.8GB)
ollama pull deepseek-coder:6.7b

# For lightweight usage (776MB)
ollama pull deepseek-coder:1.3b
```

## 🎮 Usage Modes

### 1. Terminal Chat Interface

Interactive chat with DeepSeek in your terminal:

```bash
npm run deepseek:chat
```

**Features:**
- Real-time streaming responses
- Conversation history
- Save/load sessions
- Model switching
- System prompts
- Usage statistics

**Commands:**
- `/help` - Show available commands
- `/clear` - Clear conversation
- `/save [filename]` - Save conversation
- `/load [filename]` - Load conversation
- `/model [name]` - Switch model
- `/system [prompt]` - Set system prompt
- `/stats` - Show session statistics
- `/exit` - Exit chat

### 2. API Server Mode

RESTful API for integration with other services:

```bash
npm run deepseek:serve
# Server runs on http://localhost:3333
```

**Endpoints:**

#### Health Check
```bash
curl http://localhost:3333/health
```

#### Text Completion
```bash
curl -X POST http://localhost:3333/complete \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a function to calculate fibonacci numbers",
    "options": {
      "temperature": 0.7,
      "maxTokens": 500
    }
  }'
```

#### Chat Completion
```bash
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, can you help me with coding?"}
    ],
    "options": {
      "stream": false
    }
  }'
```

#### Streaming Responses
```bash
curl -X POST http://localhost:3333/complete \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "prompt": "Explain quantum computing",
    "options": {
      "stream": true
    }
  }'
```

### 3. Direct Ollama Usage

Use Ollama CLI directly:

```bash
# Simple prompt
ollama run deepseek-coder:6.7b "Hello, World!"

# Interactive session
ollama run deepseek-coder:6.7b

# With specific parameters
ollama run deepseek-coder:6.7b \
  --temperature 0.8 \
  --top-p 0.9 \
  "Your prompt here"
```

## 🔧 Configuration

### Environment Variables

Create `.env.deepseek` in the backend directory:

```env
# Model Configuration
DEEPSEEK_MODEL=deepseek-coder:6.7b
DEEPSEEK_BASE_URL=http://localhost:11434
DEEPSEEK_PORT=3333

# Generation Parameters
DEEPSEEK_TEMPERATURE=0.7
DEEPSEEK_MAX_TOKENS=4096
DEEPSEEK_TOP_P=0.95
DEEPSEEK_TOP_K=40
DEEPSEEK_REPEAT_PENALTY=1.1

# Features
DEEPSEEK_STREAM=true
DEEPSEEK_CONTEXT_WINDOW=8192

# Privacy
DEEPSEEK_PRIVACY_MODE=true
DEEPSEEK_NO_TELEMETRY=true
DEEPSEEK_LOCAL_ONLY=true
```

### Model Selection Guide

| Model | Size | Use Case | Memory Required |
|-------|------|----------|-----------------|
| `deepseek-coder-v2` | 8.9GB | Advanced code generation, complex tasks | 16GB+ RAM |
| `deepseek-llm` | 4.1GB | General conversation, Q&A | 8GB+ RAM |
| `deepseek-coder:6.7b` | 3.8GB | Balanced coding & chat | 8GB+ RAM |
| `deepseek-coder:1.3b` | 776MB | Quick responses, light tasks | 4GB+ RAM |

## 🔌 Integration with Existing Backend

### Using DeepSeekService

```typescript
import { DeepSeekService } from './deepseek/DeepSeekService';

// Initialize service
const deepseek = new DeepSeekService({
  model: 'deepseek-coder:6.7b',
  temperature: 0.7,
});

// Check availability
const isReady = await deepseek.checkAvailability();

// Simple completion
const result = await deepseek.complete(
  'Write a TypeScript function for binary search',
  { maxTokens: 500 }
);

// Chat completion
const chatResult = await deepseek.chat([
  { role: 'user', content: 'Can you help me optimize this code?' },
  { role: 'user', content: 'function slowSort(arr) { ... }' }
]);

// Stream responses
for await (const chunk of deepseek.completeStream('Explain async/await')) {
  process.stdout.write(chunk.content);
}
```

### Express Route Example

```typescript
import { DeepSeekService } from './deepseek/DeepSeekService';
import express from 'express';

const router = express.Router();
const deepseek = new DeepSeekService();

router.post('/ai/complete', async (req, res) => {
  const { prompt } = req.body;
  
  try {
    const result = await deepseek.complete(prompt);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 📊 Performance Optimization

### 1. Model Caching

Models are cached in memory after first load:

```bash
# Pre-load models on startup
ollama run deepseek-coder:6.7b "test" --keep-alive 24h
```

### 2. GPU Acceleration

If you have a compatible GPU:

**NVIDIA:**
```bash
# Check CUDA support
nvidia-smi

# Ollama will auto-detect and use GPU
```

**Apple Silicon:**
```bash
# Metal acceleration enabled by default on M1/M2/M3
```

### 3. Memory Management

```bash
# Set memory limits
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_NUM_PARALLEL=2
export OLLAMA_MAX_QUEUE=4
```

## 🔒 Security & Privacy

### Local-Only Mode

Ensure complete privacy:

```bash
# Block external connections (macOS/Linux)
sudo iptables -A OUTPUT -d 127.0.0.1 -j ACCEPT
sudo iptables -A OUTPUT -p tcp --dport 11434 -j DROP

# Verify local-only
netstat -an | grep 11434
# Should show: 127.0.0.1:11434
```

### Data Handling

- **No Telemetry**: Ollama doesn't send usage data
- **No Logging**: Conversations aren't logged by default
- **No Cloud Sync**: Models stored locally only
- **No API Keys**: No authentication required for local use

## 🧪 Testing

### Test Setup

```bash
# Run test script
cd backend
./scripts/test-deepseek.sh
```

### Manual Tests

```bash
# Test Ollama
ollama list
ollama run deepseek-coder:6.7b "test"

# Test API Server
curl http://localhost:3333/health

# Test Chat Interface
npm run deepseek:chat
# Type: Hello, are you working?
```

## 🐛 Troubleshooting

### "Ollama not running"

```bash
# Start Ollama service
ollama serve

# Or run in background
nohup ollama serve > /dev/null 2>&1 &
```

### "Model not found"

```bash
# List available models
ollama list

# Pull missing model
ollama pull deepseek-coder:6.7b
```

### "Out of memory"

```bash
# Use smaller model
ollama pull deepseek-coder:1.3b

# Limit context window
export OLLAMA_NUM_CTX=2048
```

### "Slow responses"

```bash
# Check system resources
top
htop

# Reduce parallel requests
export OLLAMA_NUM_PARALLEL=1

# Use GPU if available
# Ollama auto-detects GPUs
```

## 📈 Monitoring

### Service Status

```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Monitor resource usage
ollama ps

# View logs
journalctl -u ollama -f  # Linux with systemd
```

### Performance Metrics

The API server provides metrics at:
- `/health` - Service health and status
- `/models` - Available models and sizes

## 🔄 Updates

### Update Ollama

```bash
# macOS
brew upgrade ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

### Update Models

```bash
# Pull latest version
ollama pull deepseek-coder:6.7b

# Remove old version
ollama rm deepseek-coder:old
```

## 📚 Resources

- [Ollama Documentation](https://ollama.com/docs)
- [DeepSeek Models](https://ollama.com/library/deepseek)
- [API Reference](http://localhost:3333/health)
- [Integration Examples](./backend/src/deepseek/)

## 🎯 Best Practices

1. **Start Small**: Begin with the 1.3B model for testing
2. **Monitor Resources**: Watch RAM/GPU usage during inference
3. **Cache Wisely**: Keep frequently used models loaded
4. **Stream Responses**: Use streaming for better UX
5. **Batch Requests**: Process multiple prompts together
6. **Set Limits**: Configure max tokens and timeouts
7. **Regular Updates**: Keep Ollama and models updated

## 🚀 Production Deployment

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start services
pm2 start ollama serve --name ollama
pm2 start npm --name deepseek-api -- run deepseek:serve

# Save configuration
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM ollama/ollama:latest

# Install model at build time
RUN ollama pull deepseek-coder:6.7b

# Copy application
COPY ./backend /app
WORKDIR /app

# Install dependencies
RUN npm install

# Start services
CMD ["npm", "run", "deepseek:serve"]
```

### System Service (Linux)

```ini
# /etc/systemd/system/deepseek.service
[Unit]
Description=DeepSeek Local AI Service
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/backend
ExecStart=/usr/bin/npm run deepseek:serve
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## ✅ Verification Checklist

- [ ] Ollama installed and running
- [ ] Model downloaded successfully
- [ ] Chat interface works
- [ ] API server responds
- [ ] Integration with backend tested
- [ ] Privacy mode confirmed
- [ ] Performance acceptable
- [ ] Documentation reviewed

---

With DeepSeek via Ollama, you now have a powerful, private, and fully offline AI assistant integrated into your system. No data leaves your machine, no API costs, and complete control over your AI infrastructure.