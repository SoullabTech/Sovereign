# 🔮 Claude Code Commands for Sesame/Maya Pipeline

## 🔧 Debugging / Fixes
```
⏺ Read(src/server-minimal.ts)
⏺ Read(src/api/index.ts)
⏺ Read(src/routes/conversational.routes.ts)
⏺ Read(src/services/ConversationalPipeline.ts)
⏺ LS(dist)
⏺ Bash(npm run build)
⏺ Bash(APP_PORT=3002 npx ts-node src/server-minimal.ts)
```

## 🧪 Testing Endpoints
```
⏺ Bash(curl -s http://localhost:3002/api | jq .routes)
⏺ Bash(curl -s http://localhost:3002/api/v1/health | jq .)
⏺ Bash(curl -s http://localhost:3002/api/v1/converse/health | jq .)
⏺ Bash(curl -s -X POST http://localhost:3002/api/v1/converse/message -H 'Content-Type: application/json' -d '{"userText":"short grounding ritual for sleep","userId":"test-user","element":"earth","preferences":{"voice":{"enabled":false}}}' | jq .)
```

## 🛡 Environment / Config
```
⏺ Bash(node -e "require('dotenv').config({override:false}); console.log({APP_PORT:process.env.APP_PORT, PORT:process.env.PORT})")
⏺ Bash(lsof -iTCP:3002 -sTCP:LISTEN)
⏺ Bash(./start-backend.sh)
⏺ Bash(APP_PORT=3002 ./start-backend.sh)
```

## 📦 Dependencies / Imports
```
⏺ Bash(npm list @anthropic-ai/sdk)
⏺ Bash(npm install @anthropic-ai/sdk)
⏺ Bash(npm list openai)
⏺ Bash(npm install openai dotenv)
```

## 🚀 Quick Workflow Commands

### Start Server
```
⏺ Bash(cd backend && APP_PORT=3002 ./start-backend.sh)
```

### Validate Pipeline
```
⏺ Bash(cd backend && ./claude-code-diagnostics.sh)
```

### Kill Process on Port
```
⏺ Bash(lsof -ti:3002 | xargs kill -9)
```

### Check Server Status
```
⏺ Bash(lsof -iTCP:3002 -sTCP:LISTEN)
⏺ Bash(ps aux | grep "ts-node.*server" | grep -v grep)
```

### Test Full Pipeline
```
⏺ Bash(curl -s -X POST http://localhost:3002/api/v1/converse/message -H 'Content-Type: application/json' -d '{"userText":"I need guidance for a difficult decision","userId":"test-user","element":"air","preferences":{"voice":{"enabled":true},"responseStyle":"mystical"}}' | jq .)
```

## 🎯 Expected Responses

### Health Check (should include pipeline identifier)
```json
{
  "success": true,
  "service": "conversational", 
  "status": "healthy",
  "features": ["sesame-maya-pipeline", "voice-synthesis", "elemental-routing"]
}
```

### Conversational Response (limited mode)
```json
{
  "success": true,
  "response": {
    "text": "Response from Sesame/Maya pipeline...",
    "audioUrl": null,
    "element": "earth",
    "source": "elemental_routing"
  }
}
```

## 📝 Common Issues & Fixes

| Issue | Command | Fix |
|-------|---------|-----|
| Port conflict | `⏺ Bash(lsof -ti:3001,3002,3003 \| xargs kill -9)` | Kill conflicting processes |
| Import errors | `⏺ Bash(npx ts-node --transpile-only -r tsconfig-paths/register src/boot/diag.ts)` | Run import diagnostics |
| Build failures | `⏺ Bash(SAFE_MODE=1 npm run build)` | Use safe mode |
| Route not found | `⏺ Read(src/api/index.ts)` | Check route mounting |

## 🌟 One-Command Validation
```
⏺ Bash(cd backend && ./claude-code-diagnostics.sh)
```