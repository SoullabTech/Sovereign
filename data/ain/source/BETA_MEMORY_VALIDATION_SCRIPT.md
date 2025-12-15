# 🧠 Beta Memory Validation Script
*Official tester toolkit for Maya's unified memory orchestration*

## Overview
This script validates that Maya's memory system works correctly across both message and streaming endpoints, ensuring beta testers experience proper conversation continuity and relationship building.

## 🚀 Quick Setup

**Terminal A: Backend Server**
```bash
cd backend
export MAYA_DEBUG_MEMORY=true
export BACKEND_LOG_LEVEL=debug
npm run dev
```

**Terminal B: Testing Commands**
Open second terminal for curl/Postman requests and log monitoring:
```bash
tail -f backend/logs/app.log | grep -E "Memory|🧠|🌊|Conversation turn persisted|sessionEntries"
```

## 🧪 Critical Success Signals
Before starting tests, know what to look for:

✅ **Memory Orchestration Active**: `🧠 [MAYA_DEBUG] Memory Orchestration Complete`
✅ **Persistence Working**: `Conversation turn persisted successfully`
✅ **Session Building**: `sessionEntries: 0` → `sessionEntries: 1` → `sessionEntries: 2`
✅ **Streaming Integration**: `🌊 Starting streaming conversational pipeline` + memory logs
✅ **Quality Shift**: Maya responses change from generic to personalized

## 🔄 Phase 1: Message Endpoint Validation

### Step 1: Start New Session
```bash
curl -X POST http://localhost:3002/api/v1/converse/message \
  -H "Content-Type: application/json" \
  -d '{
    "userText": "My name is Alex and I love hiking.",
    "userId": "beta-tester-001", 
    "element": "aether",
    "sessionId": "session-memory-test-001"
  }'
```

**✅ Expected Success Signals:**
- Debug log: `🧠 [MAYA_DEBUG] Memory Orchestration Complete`
- Debug log: `Conversation turn persisted successfully`
- Maya responds mentioning "Alex" and "hiking"
- Response quality: Thoughtful questions about hiking interests

### Step 2: Memory Recall Check
```bash
curl -X POST http://localhost:3002/api/v1/converse/message \
  -H "Content-Type: application/json" \
  -d '{
    "userText": "Do you remember what I told you earlier?",
    "userId": "beta-tester-001",
    "element": "aether", 
    "sessionId": "session-memory-test-001"
  }'
```

**✅ Expected Success Signals:**
- Debug log: `sessionEntries: 1` (showing previous conversation loaded)
- Maya responds: "Yes, you mentioned your name is Alex and you enjoy hiking"
- Shows awareness of conversation history

### Step 3: Journal Layer Integration Test
Add a journal entry manually in database/app, then:
```bash
curl -X POST http://localhost:3002/api/v1/converse/message \
  -H "Content-Type: application/json" \
  -d '{
    "userText": "Have you seen anything from my journal lately?",
    "userId": "beta-tester-001",
    "element": "aether",
    "sessionId": "session-memory-test-001"
  }'
```

**✅ Expected Success Signals:**
- Debug log: `journalEntries: >0` (if Supabase working) OR graceful fallback
- Maya references journal themes or acknowledges awareness

## 🔊 Phase 2: Streaming Endpoint Validation

### Step 1: Start Streaming Session
```bash
curl -N -X POST http://localhost:3002/api/v1/converse/stream \
  -H "Content-Type: application/json" \
  -d '{
    "userText": "My favorite topic is renewable energy and I work in solar panel installation.",
    "userId": "beta-tester-002",
    "element": "fire", 
    "sessionId": "stream-memory-test-001"
  }'
```

**✅ Expected Success Signals:**
- Stream begins with `event: connected`
- Debug log: `🌊 Starting streaming conversational pipeline`
- Debug log: `🧠 [MAYA_DEBUG] Memory Orchestration Complete`
- Debug log: `Conversation turn persisted successfully`
- Streaming response acknowledges renewable energy and solar work

### Step 2: Streaming Memory Recall
```bash
curl -N -X POST http://localhost:3002/api/v1/converse/stream \
  -H "Content-Type: application/json" \
  -d '{
    "userText": "What topic and work did I mention earlier?",
    "userId": "beta-tester-002",
    "element": "fire",
    "sessionId": "stream-memory-test-001"  
  }'
```

**✅ Expected Success Signals:**
- Debug log: `sessionEntries: 1` (showing previous conversation loaded)
- Streaming response: "Earlier you mentioned renewable energy and solar panel installation"
- Demonstrates streaming memory continuity

## 🧪 Phase 3: Multi-Layer Stress Test

Send complex mixed inputs to test all memory layers:

```bash
# Step 1: Archetype context
curl -X POST http://localhost:3002/api/v1/converse/message \
  -H "Content-Type: application/json" \
  -d '{
    "userText": "My archetype is the Sage and I am deeply interested in climate science research.",
    "userId": "beta-tester-003",
    "element": "air",
    "sessionId": "multi-layer-test-001"
  }'

# Step 2: Request synthesis
curl -X POST http://localhost:3002/api/v1/converse/message \
  -H "Content-Type: application/json" \
  -d '{
    "userText": "Can you connect my archetype, my interests, and our conversation patterns?",
    "userId": "beta-tester-003", 
    "element": "air",
    "sessionId": "multi-layer-test-001"
  }'
```

**✅ Expected Success Signals:**
- Debug shows: `sessionEntries: ≥1`, `profileLoaded: true`, `externalContent: ≥1`
- Maya synthesizes across multiple layers
- References Sage archetype, climate science, and conversation patterns
- Demonstrates deep memory integration

## Test Scenario 1: Message Endpoint Memory Flow

### Step 1: Initial Introduction
```bash
curl -X POST http://localhost:3002/api/v1/converse/message \
  -H "Content-Type: application/json" \
  -d '{
    "userText": "Hello Maya! My name is Alex, I love rock climbing and I work as a software engineer.",
    "userId": "validation-user-001",
    "element": "aether",
    "sessionId": "validation-session-001"
  }'
```

**Expected Debug Output:**
```
🧠 [MAYA_DEBUG] Memory Orchestration Complete
📝 PROFILE MEMORY: 1 items
📝 JOURNAL MEMORY: 1 items  
📝 EXTERNAL MEMORY: 1 items
🎯 Total Results: 3
📊 Token Budget: 70-85/4000
Conversation turn persisted successfully { userId: 'validation-user-001', sessionId: 'validation-session-001' }
```

**Expected Response Quality:**
- Maya should acknowledge Alex by name
- Should reference rock climbing interest
- Should ask thoughtful follow-up questions

### Step 2: Memory Recall Test
```bash
curl -X POST http://localhost:3002/api/v1/converse/message \
  -H "Content-Type: application/json" \
  -d '{
    "userText": "What do you remember about me?",
    "userId": "validation-user-001",
    "element": "aether", 
    "sessionId": "validation-session-001"
  }'
```

**Expected Debug Output:**
```
🧠 [MAYA_DEBUG] Memory Orchestration Complete
📝 SESSION MEMORY: 1-2 items (should now show previous conversation)
📝 PROFILE MEMORY: 1 items
📝 JOURNAL MEMORY: 1 items
📝 EXTERNAL MEMORY: 1 items
🎯 Total Results: 4-5
📊 Token Budget: 100-150/4000
Conversation turn persisted successfully
```

**Expected Response Quality:**
- Maya should reference Alex's name
- Should mention rock climbing
- Should reference software engineering
- Should show awareness of conversation history

### Step 3: Deep Context Integration
```bash
curl -X POST http://localhost:3002/api/v1/converse/message \
  -H "Content-Type: application/json" \
  -d '{
    "userText": "I am feeling stressed about a project deadline. Any advice?",
    "userId": "validation-user-001",
    "element": "aether",
    "sessionId": "validation-session-001"
  }'
```

**Expected Response Quality:**
- Should connect stress to software engineering context
- Should reference Alex's rock climbing as potential stress relief
- Should build on established relationship patterns

## Test Scenario 2: Streaming Endpoint Memory Flow

### Step 1: Initial Streaming Introduction
```bash
curl -X POST http://localhost:3002/api/v1/converse/stream \
  -H "Content-Type: application/json" \
  -d '{
    "userText": "Hi Maya! I am Sarah, I love painting watercolors and I am learning meditation.",
    "userId": "validation-user-002",
    "element": "water",
    "sessionId": "validation-session-002"
  }'
```

**Expected Debug Output:**
```
🌊 Starting streaming conversational pipeline
[Stream Memory Debug] Context loaded: {
  sessionEntries: 0,
  journalEntries: 0,
  profileLoaded: false,
  symbolicPatterns: 0,
  externalContent: 0,
  totalContextSize: 1000-1500,
  processingTime: 100-200
}
🧠 [MAYA_DEBUG] Memory Orchestration Complete
Conversation turn persisted successfully { userId: 'validation-user-002', sessionId: 'validation-session-002' }
```

**Expected Streaming Response:**
- Should stream naturally with proper tokens
- Should acknowledge Sarah's name and interests
- Should connect watercolors with meditation as creative/mindful practices

### Step 2: Streaming Memory Recall
```bash
curl -X POST http://localhost:3002/api/v1/converse/stream \
  -H "Content-Type: application/json" \
  -d '{
    "userText": "What creative practices did I mention?",
    "userId": "validation-user-002",
    "element": "water",
    "sessionId": "validation-session-002"
  }'
```

**Expected Debug Output:**
```
🌊 Starting streaming conversational pipeline
[Stream Memory Debug] Context loaded: {
  sessionEntries: 1, ← KEY: Should show previous turn
  journalEntries: 0,
  profileLoaded: false,
  symbolicPatterns: 0,
  externalContent: 0,
  totalContextSize: 1500-2000,
  processingTime: 50-150
}
Conversation turn persisted successfully
```

**Expected Streaming Response:**
- Should reference watercolor painting
- Should mention meditation practice
- Should show continuity from previous conversation

## Test Scenario 3: Cross-Endpoint Memory Continuity

### Step 1: Start with Message Endpoint
```bash
curl -X POST http://localhost:3002/api/v1/converse/message \
  -H "Content-Type: application/json" \
  -d '{
    "userText": "Hello! I am Jordan, I love jazz music and I play saxophone.",
    "userId": "validation-user-003",
    "element": "air",
    "sessionId": "validation-session-003"
  }'
```

### Step 2: Switch to Streaming Endpoint
```bash
curl -X POST http://localhost:3002/api/v1/converse/stream \
  -H "Content-Type: application/json" \
  -d '{
    "userText": "Can you help me understand music theory for jazz improvisation?",
    "userId": "validation-user-003",
    "element": "air",
    "sessionId": "validation-session-003"
  }'
```

**Expected Result:**
- Maya should remember Jordan plays saxophone
- Should connect jazz theory to their instrument
- Should show seamless continuity between endpoints

## Validation Checklist

### ✅ Memory Orchestration
- [ ] `🧠 [MAYA_DEBUG] Memory Orchestration Complete` appears in logs
- [ ] Memory layers loading: Profile, Journal, External, (Session when available)
- [ ] Token budget showing reasonable memory context size (70-200 tokens)
- [ ] No `text.toLowerCase` errors or other type errors

### ✅ Conversation Persistence
- [ ] `Conversation turn persisted successfully` appears after each interaction
- [ ] Session entries increment: 0 → 1 → 2 → 3 across conversations
- [ ] Both streaming and message endpoints persist conversations

### ✅ Response Quality
- [ ] Maya uses names provided by users
- [ ] Maya references specific interests/details shared
- [ ] Maya shows conversation awareness: "From our previous conversations"
- [ ] No generic responses like "What's on your mind today?"

### ✅ Cross-Endpoint Continuity
- [ ] Memory persists when switching message ↔ streaming
- [ ] SessionId continuity maintained across endpoint types
- [ ] No memory reset between different interaction modes

### ✅ Error Handling
- [ ] Graceful fallbacks when individual memory layers fail
- [ ] Journal fetch errors don't break orchestration
- [ ] Invalid responses get proper type checking

## Troubleshooting Guide

### Issue: sessionEntries always shows 0
**Cause:** Session persistence not working
**Check:** 
- Look for "Conversation turn persisted successfully" in logs
- Verify Supabase connection
- Check session memory adapter implementation

### Issue: No memory orchestration logs
**Cause:** Memory orchestration not running
**Check:**
- Verify MAYA_DEBUG_MEMORY=true environment variable
- Confirm buildContext() is called in both endpoints
- Check ConversationalPipeline integration

### Issue: Generic/boilerplate responses
**Cause:** Memory context not being used by models
**Check:**
- Verify memory prompt injection in draftTextWithMemory
- Check routeToModel() usage and response extraction
- Confirm rejectBoilerplate() isn't rejecting all responses

### Issue: Type errors in logs
**Cause:** Model interface returning objects instead of strings
**Check:**
- Verify generateResponse() is called on model interface
- Check response.content extraction
- Confirm proper type checking in validation methods

## Success Metrics

**Memory Integration:** 85-95% of conversations should load memory context successfully
**Persistence Rate:** 100% of conversations should persist successfully  
**Quality Score:** >90% of responses should reference user-specific context when available
**Continuity:** 100% of follow-up conversations should show awareness of previous context
**Error Rate:** <5% of conversations should have type or orchestration errors

## Beta Deployment Readiness

✅ **All validation scenarios pass**  
✅ **Memory orchestration stable across 10+ test conversations**  
✅ **Cross-endpoint continuity verified**  
✅ **Error handling graceful**  
✅ **Debug instrumentation working**

🚀 **Maya's memory system is ready for beta launch!**