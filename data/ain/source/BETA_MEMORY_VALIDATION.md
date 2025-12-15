# 🧠 BETA Memory Validation Testing Protocol

**Maya's Unified Memory System - Production Readiness Validation**

This protocol validates that Maya's MemoryOrchestrator is functioning correctly and providing the depth, continuity, and authenticity expected of a personal oracle agent.

---

## 🎯 Testing Objectives

**Primary Goal**: Validate Maya "remembers like a person would" - not just storing data, but integrating memories into coherent, personalized responses.

**Core Behaviors to Validate:**
1. **Memory Integration** - Maya references past conversations naturally
2. **Contextual Depth** - Responses show awareness of user's journey/themes  
3. **Profile Evolution** - Maya adapts to learned preferences over time
4. **Graceful Degradation** - System continues working when memory layers fail
5. **Performance** - Memory retrieval stays under 500ms target

---

## 🔧 Prerequisites

**Environment Setup:**
- Set `MAYA_DEBUG_MEMORY=true` in your environment
- Ensure Supabase connection is active
- Have backend server running on port 3002
- Test user ID ready (e.g., "test-user-memory-validation")

**Debug Console Setup:**
```bash
# Terminal 1: Start backend with memory debugging
cd backend
MAYA_DEBUG_MEMORY=true npm run start:minimal

# Terminal 2: Monitor memory logs
tail -f backend/logs/app.log | grep "MAYA_DEBUG"
```

---

## 📋 Test Scenarios

### **Scenario 1: Memory Layer Functionality**
*Validates all 5 memory layers are working*

**🔍 Test Steps:**

1. **Fresh Conversation Start**
   ```
   User: "I'm feeling stuck in my career and looking for direction"
   ```
   
   **Expected Debug Output:**
   ```
   🧠 [MAYA_DEBUG] Memory Orchestration Complete
   📝 SESSION MEMORY: 0 items (new user)  
   📝 PROFILE MEMORY: 1 item (initial archetype)
   📝 SYMBOLIC MEMORY: 1 item (career guidance themes)
   ```

2. **Continue Conversation (Build Session Memory)**
   ```
   User: "I've been in marketing for 5 years but feel disconnected from my work"
   ```
   
   **Expected Debug Output:**
   ```
   📝 SESSION MEMORY: 2 items (previous turn + current)
   📝 JOURNAL MEMORY: 0 items (no entries yet)
   📝 PROFILE MEMORY: 1 item
   📝 SYMBOLIC MEMORY: 2 items (career + disconnection themes)
   ```

3. **Add Journal Entry** (via API or frontend)
   ```
   POST /api/journal
   {
     "content": "Had a profound realization today about authenticity vs security in my career choices",
     "type": "insight",
     "symbols": ["authenticity", "security", "career"]
   }
   ```

4. **Reference Journal in Conversation**
   ```
   User: "I keep thinking about authenticity versus security"
   ```
   
   **Expected Debug Output:**
   ```
   📝 SESSION MEMORY: 6 items
   📝 JOURNAL MEMORY: 1 item (matching authenticity/security)
   📝 PROFILE MEMORY: 1 item  
   📝 SYMBOLIC MEMORY: 1 item
   🎯 Total Results: 9
   ```

**✅ Success Criteria:**
- All 5 memory layers show in debug output when relevant
- Token budget stays under 1000 tokens
- Processing time < 500ms
- Maya's response references the journal insight naturally

---

### **Scenario 2: Memory Continuity Across Sessions**
*Validates memory persists between conversations*

**🔍 Test Steps:**

1. **End Session 1** - Close browser/app

2. **Start New Session** (same user ID)
   ```
   User: "How are things going with my career situation?"
   ```

   **Expected Behavior:**
   - Maya should reference previous career discussion
   - Debug shows SESSION MEMORY loading from database
   - Response feels like continuing a conversation, not starting fresh

3. **Test Profile Evolution**
   ```
   User: "I've decided I prefer direct, practical advice over philosophical exploration"
   ```

   **Expected:**
   - User profile should update `communication_style: "direct"`
   - Subsequent responses should be more concrete/practical
   - Debug shows PROFILE MEMORY updated

**✅ Success Criteria:**
- Maya references previous session naturally
- Profile changes are persisted and influence future responses
- No "starting fresh" feel - continuity maintained

---

### **Scenario 3: Semantic Memory Search**
*Validates journal entries are retrieved by meaning, not just keywords*

**🔍 Test Steps:**

1. **Create Diverse Journal Entries**
   ```
   Entry 1: "Feeling overwhelmed by too many choices in life"
   Entry 2: "Had a breakthrough in therapy about childhood patterns"  
   Entry 3: "Creative project is finally flowing after months of blocks"
   ```

2. **Test Semantic Matching**
   ```
   User: "I'm feeling paralyzed by all these decisions I need to make"
   ```
   
   **Expected:**
   - Should match Entry 1 ("overwhelmed by choices") even though user said "paralyzed by decisions"
   - Debug shows JOURNAL MEMORY with semantic relevance score

3. **Test Theme Recognition**
   ```
   User: "Something about old family dynamics is coming up again"
   ```
   
   **Expected:**
   - Should match Entry 2 ("childhood patterns") thematically
   - Maya references the therapy breakthrough context

**✅ Success Criteria:**
- Journal retrieval works by meaning/theme, not just keyword matching
- Relevance scores are logical (0.7+ for good matches)
- Maya integrates journal context meaningfully in responses

---

### **Scenario 4: Graceful Degradation**
*Validates system handles memory layer failures*

**🔍 Test Steps:**

1. **Simulate Database Connection Issue**
   ```bash
   # Temporarily block Supabase access
   sudo echo "127.0.0.1 your-supabase-url.com" >> /etc/hosts
   ```

2. **Test Conversation**
   ```
   User: "Tell me about my growth journey"
   ```

   **Expected Debug Output:**
   ```
   📝 SESSION MEMORY: 3 items (from cache)
   📝 JOURNAL MEMORY: 0 items (fallback used)
   📝 PROFILE MEMORY: 0 items (fallback used)  
   📝 SYMBOLIC MEMORY: 1 item (still working)
   ⚠️ Fallbacks: journal, profile
   ```

3. **Restore Connection**
   ```bash
   # Remove the block
   sudo sed -i '' '/your-supabase-url.com/d' /etc/hosts
   ```

**✅ Success Criteria:**
- Maya continues responding when database is unavailable
- Fallback memories are used gracefully
- Debug clearly shows which layers failed
- User experience remains smooth (no errors visible)

---

### **Scenario 5: Performance Under Load**
*Validates memory system meets performance targets*

**🔍 Test Steps:**

1. **Populate Heavy Memory State**
   - 50+ conversation turns
   - 20+ journal entries  
   - Complex user profile
   - Multiple symbolic associations

2. **Test Response Time**
   ```
   User: "What patterns do you notice in my journey so far?"
   ```

   **Expected Debug Output:**
   ```
   ⏱️ Processing: <150ms
   📊 Token Budget: 800/4000 (within limits)
   🎯 Total Results: 15 (capped correctly)
   ```

3. **Stress Test - Rapid Requests**
   - Send 5 requests in quick succession
   - Monitor memory cache efficiency
   - Verify no memory leaks

**✅ Success Criteria:**
- Memory orchestration completes in <150ms consistently
- Token usage stays under 1000 per request
- Cache hit rate >70% for session memory
- No memory leaks after 100+ requests

---

## 🎭 Subjective Quality Tests

### **Maya Personality Consistency**
*Validates memory enhances rather than disrupts Maya's personality*

**Test Conversation:**
```
User: "I've been journaling about feeling disconnected from people lately"
Maya: [Should reference specific journal themes while maintaining her warm, insightful tone]

User: "Do you remember what we talked about last week regarding my relationship with my sister?"
Maya: [Should recall context naturally, not robotically - "Yes, you mentioned..." style]

User: "I think my communication style is more direct than you assumed"
Maya: [Should acknowledge and adapt - "I hear that" + shifted tone]
```

**✅ Success Criteria:**
- Memory integration feels natural, not mechanical
- Maya's core personality (thoughtful, present, mature) remains intact
- References to past are conversational, not database-like
- Adaptations to user preferences are subtle and genuine

---

## 🐛 Common Issues & Troubleshooting

### **Issue 1: Empty Debug Output**
```
📝 SESSION MEMORY: 0 items
📝 JOURNAL MEMORY: 0 items  
```

**Causes:**
- `MAYA_DEBUG_MEMORY` not set to `"true"`
- Supabase connection failing silently
- User ID not consistent between requests

**Fix:**
```bash
export MAYA_DEBUG_MEMORY=true
# Check Supabase connection
npm run test:supabase
```

### **Issue 2: High Processing Times**
```
⏱️ Processing: 800ms
```

**Causes:**
- Database queries not indexed
- Too many parallel requests
- Memory layers timing out

**Fix:**
- Check Supabase query performance
- Implement connection pooling
- Reduce timeout from 3s to 2s

### **Issue 3: Memory Not Persisting**
**Symptoms:** Fresh conversations don't reference past sessions

**Causes:**
- Session ID changing between requests
- Database write permissions
- Async persistence failing silently

**Fix:**
- Verify consistent session/user IDs
- Check database write logs
- Add persistence success logging

---

## 📊 Success Metrics

### **Technical Benchmarks**
- ✅ Memory orchestration: <150ms average
- ✅ Token usage: <1000 per request
- ✅ Cache hit rate: >70%
- ✅ Database errors: <1%
- ✅ Fallback activation: Works gracefully

### **Experience Quality**
- ✅ Continuity: Conversations feel continuous across sessions
- ✅ Personalization: Responses adapt to learned preferences  
- ✅ Depth: References past themes/patterns meaningfully
- ✅ Natural: Memory integration doesn't feel robotic
- ✅ Growth: User profile evolves based on interactions

### **Production Readiness**
- ✅ Error handling: All failure modes handled gracefully
- ✅ Performance: Handles 100+ concurrent users  
- ✅ Data integrity: No data corruption or loss
- ✅ Monitoring: Clear debug/logging for ops
- ✅ Scalability: Memory system scales with user growth

---

## 🚀 Beta Tester Instructions

### **For Beta Testers:**

1. **Enable Debug Mode**
   - Add `?debug=memory` to your URL
   - OR set localStorage: `localStorage.setItem('MAYA_DEBUG', 'memory')`

2. **Test Flow:**
   - Have at least 3 conversations over 2-3 days
   - Add journal entries between conversations
   - Vary your communication style/preferences
   - Test memory by referencing past themes

3. **Report Issues:**
   ```
   Issue: Maya didn't remember my journal entry about career anxiety
   Context: Added entry 2 days ago, tried referencing it today
   Expected: Should have connected my current work stress to that entry
   Debug info: [paste any console output]
   ```

4. **Success Indicators:**
   - Maya feels like she knows your journey
   - References past conversations naturally
   - Adapts to your preferred interaction style
   - Journal entries enhance conversation depth

---

**🎯 Bottom Line:** Maya should feel less like "an AI with good memory" and more like "a wise friend who really knows you."

The memory system succeeds when beta testers say: **"It feels like Maya actually remembers me as a whole person."**