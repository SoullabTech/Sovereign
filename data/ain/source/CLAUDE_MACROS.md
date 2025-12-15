# 🔮 Claude Code Macro Manifest for Sesame/Maya Pipeline

Complete developer toolkit for managing and debugging the Spiralogic Oracle System with Claude Code.

## 🚀 Quick Start Commands

### One-Command Setup
```bash
⏺ Bash(cd backend && ./maya-quick-start.sh)
```

### Interactive Developer Menu
```bash
⏺ Bash(cd backend && ./maya-dev-tools.sh)
```

### Full System Validation
```bash
⏺ Bash(cd backend && ./claude-code-diagnostics.sh)
```

---

## 🎯 Daily Development Workflow

### Start Fresh Development Session
```bash
⏺ Bash(cd backend && APP_PORT=3002 ./start-backend.sh)
⏺ Bash(cd backend && ./maya-quick-start.sh)
```

### Validate Everything is Working
```bash
⏺ Bash(curl -s http://localhost:3002/api | jq .routes)
⏺ Bash(curl -s http://localhost:3002/api/v1/converse/health | jq .)
```

### Test Conversational Pipeline
```bash
⏺ Bash(curl -s -X POST http://localhost:3002/api/v1/converse/message -H 'Content-Type: application/json' -d '{"userText":"guide me through a grounding ritual","userId":"test-user","element":"earth","preferences":{"voice":{"enabled":false}}}' | jq .)
```

---

## 🔧 Server Management

### Start Server
```bash
⏺ Bash(cd backend && APP_PORT=3002 ./start-backend.sh)
⏺ Bash(cd backend && APP_PORT=3002 npx ts-node src/server-minimal.ts)
```

### Check Server Status
```bash
⏺ Bash(lsof -iTCP:3002 -sTCP:LISTEN)
⏺ Bash(ps aux | grep "ts-node.*server" | grep -v grep)
```

### Kill Server Processes
```bash
⏺ Bash(kill -9 $(lsof -ti:3002))
⏺ Bash(pkill -f "ts-node.*server")
```

### View Server Logs
```bash
⏺ Bash(cd backend && tail -f server.log)
⏺ Bash(cd backend && tail -f maya-server.log)
```

---

## 📡 API Testing & Validation

### Core API Tests
```bash
⏺ Bash(curl -s http://localhost:3002/api | jq .routes)
⏺ Bash(curl -s http://localhost:3002/api | jq .features)
⏺ Bash(curl -s http://localhost:3002/health | jq .)
```

### Health Endpoints
```bash
⏺ Bash(curl -s http://localhost:3002/api/v1/health | jq .)
⏺ Bash(curl -s http://localhost:3002/api/v1/converse/health | jq .)
```

### Conversational Pipeline Tests
```bash
# Basic test (non-streaming)
⏺ Bash(curl -s -X POST http://localhost:3002/api/v1/converse/message -H 'Content-Type: application/json' -d '{"userText":"hello","userId":"test-user","element":"aether"}' | jq .)

# Earth element grounding
⏺ Bash(curl -s -X POST http://localhost:3002/api/v1/converse/message -H 'Content-Type: application/json' -d '{"userText":"I need grounding","userId":"test-user","element":"earth","preferences":{"voice":{"enabled":false}}}' | jq .)

# Air element communication  
⏺ Bash(curl -s -X POST http://localhost:3002/api/v1/converse/message -H 'Content-Type: application/json' -d '{"userText":"help me communicate better","userId":"test-user","element":"air","preferences":{"voice":{"enabled":false}}}' | jq .)

# Fire element transformation
⏺ Bash(curl -s -X POST http://localhost:3002/api/v1/converse/message -H 'Content-Type: application/json' -d '{"userText":"I want to transform my life","userId":"test-user","element":"fire","preferences":{"voice":{"enabled":false}}}' | jq .)
```

### 🌊 Streaming Pipeline Tests
```bash
# Test streaming endpoint (shows real-time tokens)
⏺ Bash(cd backend && ./test-streaming.sh)

# Fire element streaming
⏺ Bash(curl -N -X POST http://localhost:3002/api/v1/converse/stream -H 'Content-Type: application/json' -d '{"userText":"guide me through transformation","userId":"test-user","element":"fire","voiceEnabled":false}')

# Air element streaming (Claude)
⏺ Bash(curl -N -X POST http://localhost:3002/api/v1/converse/stream -H 'Content-Type: application/json' -d '{"userText":"help me communicate clearly","userId":"test-user","element":"air","voiceEnabled":false}')

# Earth element streaming
⏺ Bash(curl -N -X POST http://localhost:3002/api/v1/converse/stream -H 'Content-Type: application/json' -d '{"userText":"I need grounding","userId":"test-user","element":"earth","voiceEnabled":false}')
```

### Voice & Audio Tests
```bash
⏺ Bash(curl -s -X POST http://localhost:3002/api/voice/synthesize -H 'Content-Type: application/json' -d '{"text":"Hello from Maya","voice":"maya","userId":"test-user"}' | jq .)
```

---

## 🛡 Environment & Configuration

### Environment Validation
```bash
⏺ Bash(node -e "require('dotenv').config({override:false}); console.log({APP_PORT:process.env.APP_PORT, PORT:process.env.PORT})")
⏺ Bash(printenv | grep PORT)
⏺ Bash(printenv | grep API_KEY)
```

### Dependency Checks
```bash
⏺ Bash(cd backend && npm list openai @anthropic-ai/sdk express --depth=0)
⏺ Bash(cd backend && npm list @mem0ai/mem0 --depth=0)
```

### Install Missing Dependencies
```bash
⏺ Bash(cd backend && npm install @anthropic-ai/sdk openai dotenv express)
⏺ Bash(cd backend && npm install @mem0ai/mem0)
```

---

## 🧪 Debugging & Development

### File Structure Validation
```bash
⏺ LS(/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/backend/src)
⏺ LS(/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/backend/src/routes)
⏺ LS(/Volumes/T7 Shield/Projects/SpiralogicOracleSystem/backend/src/services)
```

### Read Core Files
```bash
⏺ Read(src/server-minimal.ts)
⏺ Read(src/api/index.ts)
⏺ Read(src/routes/conversational.routes.ts)
⏺ Read(src/services/ConversationalPipeline.ts)
⏺ Read(src/services/ElementalIntelligenceRouter.ts)
⏺ Read(src/lib/openaiClient.ts)
```

### TypeScript & Build Checks
```bash
⏺ Bash(cd backend && npx tsc --noEmit)
⏺ Bash(cd backend && npx ts-node --transpile-only -r tsconfig-paths/register src/boot/diag.ts)
⏺ Bash(npm run build)
```

### Import Chain Diagnostics
```bash
⏺ Bash(cd backend && npx ts-node --transpile-only -r tsconfig-paths/register src/boot/diag.ts)
⏺ Grep(pattern="import.*ConversationalPipeline", path="src", output_mode="files_with_matches")
⏺ Grep(pattern="new OpenAI", path="src", output_mode="content")
```

---

## 🔍 Advanced Debugging

### Network & Process Investigation
```bash
⏺ Bash(lsof -iTCP:3000,3001,3002,3003 -sTCP:LISTEN)
⏺ Bash(netstat -an | grep LISTEN | grep 300)
⏺ Bash(ps aux | grep node | grep -v grep)
```

### Memory & Performance
```bash
⏺ Bash(curl -s http://localhost:3002/api/v1/health | jq .data.memory)
⏺ Bash(curl -s http://localhost:3002/health | jq .memory)
```

### Service-Specific Tests
```bash
# Test orchestrator
⏺ Bash(curl -s http://localhost:3002/api/orchestrator/health | jq .)

# Test voice journaling
⏺ Bash(curl -s http://localhost:3002/api/voice/health | jq .)

# Test semantic journaling
⏺ Bash(curl -s http://localhost:3002/api/semantic/health | jq .)
```

---

## 🎨 Frontend Integration

### Next.js API Route Testing
```bash
⏺ Read(app/api/oracle/chat/route.ts)
⏺ Bash(curl -s -X POST http://localhost:3000/api/oracle/chat -H 'Content-Type: application/json' -d '{"message":"hello","oracle":"maya"}' | jq .)
```

### Environment Variables for Frontend
```bash
⏺ Bash(echo "NEXT_PUBLIC_API_BASE=http://localhost:3002/api/v1")
⏺ Bash(printenv | grep NEXT_PUBLIC)
```

---

## 📊 Performance & Monitoring

### Response Time Tests
```bash
⏺ Bash(time curl -s http://localhost:3002/api/v1/converse/health >/dev/null)
⏺ Bash(time curl -s -X POST http://localhost:3002/api/v1/converse/message -H 'Content-Type: application/json' -d '{"userText":"test","userId":"test-user"}' >/dev/null)
```

### Load Testing
```bash
⏺ Bash(for i in {1..5}; do curl -s http://localhost:3002/api/v1/health | jq .data.uptime; sleep 1; done)
```

---

## 🛠 Emergency Fixes

### Hard Reset Everything
```bash
⏺ Bash(cd backend && pkill -f node || true)
⏺ Bash(cd backend && ./maya-quick-start.sh)
```

### Clean Install
```bash
⏺ Bash(cd backend && rm -rf node_modules package-lock.json)
⏺ Bash(cd backend && npm install)
⏺ Bash(cd backend && ./maya-quick-start.sh)
```

### Safe Mode Server Start
```bash
⏺ Bash(cd backend && SAFE_MODE=1 APP_PORT=3002 npx ts-node --transpile-only src/server-minimal.ts)
```

---

## 📋 Expected Outputs

### Healthy API Root Response
```json
{
  "routes": {
    "converse": "/api/v1/converse",
    "orchestrator": "/api/orchestrator"
  },
  "features": [
    "Sesame/Maya Conversational Pipeline"
  ]
}
```

### Healthy Pipeline Response
```json
{
  "success": true,
  "service": "conversational",
  "features": ["sesame-maya-pipeline", "voice-synthesis", "elemental-routing"]
}
```

---

## 🎯 Single Commands for Common Tasks

| Task | Command |
|------|---------|
| **Start everything** | `⏺ Bash(cd backend && ./maya-quick-start.sh)` |
| **Check if working** | `⏺ Bash(curl -s http://localhost:3002/api/v1/converse/health \| jq .)` |
| **Test conversation** | `⏺ Bash(curl -s -X POST http://localhost:3002/api/v1/converse/message -H 'Content-Type: application/json' -d '{"userText":"test","userId":"test-user"}' \| jq .)` |
| **Full diagnostics** | `⏺ Bash(cd backend && ./claude-code-diagnostics.sh)` |
| **Emergency restart** | `⏺ Bash(cd backend && kill -9 $(lsof -ti:3002) && ./maya-quick-start.sh)` |

---

*Save this file as your Claude Code reference. Copy/paste any command block directly into Claude Code for instant execution.*