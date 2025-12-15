# 🧠 MAIA Dev Tester Guide

## Quick Start: "Is MAIA Talking Again?"

### 1. Start MAIA
```bash
cd ~/MAIA-SOVEREIGN
PORT=3003 npm run dev
```
Wait for: `✓ Ready in [X]ms` then open: **http://localhost:3003**

---

## 2. Three-Tier Validation Tests

Test these **exact prompts** to verify the conditional consciousness system is working:

### ⚡ **FAST Test** (should be quick, warm, short)
**Prompt:** `Hi Maia`

**Expected behavior:**
- Response in < 3 seconds
- Short, warm greeting (1-2 sentences)
- No deep processing, just presence
- Console log: `Processing Profile: FAST`

---

### 🎯 **CORE Test** (grounded life support)
**Prompt:** `I'm overwhelmed and burned out from work but scared to change anything.`

**Expected behavior:**
- Response in 2-6 seconds
- 2-4 paragraphs: emotionally attuned, psychologically coherent
- Practical next steps offered
- No elemental jargon, stays grounded
- Console log: `Processing Profile: CORE`

---

### 🧠 **DEEP Test** (ritual doorway - explicit invitation required)
**Prompt:** `Take me into the shadow of why I keep sabotaging relationships. Go as deep as you can with me.`

**Expected behavior:**
- Response in 6-15+ seconds (slower is expected)
- More spacious, archetypal language
- Shadow work lens, body-oriented awareness
- Deeper psychological insights
- Console log: `Processing Profile: DEEP`

---

## 3. What "Broken" Looks Like vs "Working"

### 🚫 **Broken Signs:**
- Every message takes 10+ seconds (old "cathedral" processing)
- Simple "hi" triggers deep consciousness processing
- Timeouts on basic greetings
- No variation in response speed/style

### ✅ **Working Signs:**
- Fast greetings stay fast (< 3s)
- Life problems get grounded support (2-6s)
- Deep requests get spacious responses (6-15s)
- Console shows correct Processing Profile

---

## 4. Reporting Issues

If something feels weird, copy/paste:

1. **Your exact prompt**
2. **Last 2 lines of console logs** (look for Processing Profile)
3. **Response time** (rough estimate)
4. **What felt off** about MAIA's response

Example bug report:
```
Prompt: "Hi Maia"
Console: Processing Profile: DEEP | Turn 1 | Length: 7
Time: ~12 seconds
Issue: Simple greeting triggered deep processing instead of FAST
```

---

## 5. Advanced Testing (Optional)

### Test the DEEP trigger threshold:
- `shadow work` → should trigger DEEP
- `I'm anxious` → should stay CORE
- `ritualize this experience` → should trigger DEEP
- `I'm stuck in my career` → should stay CORE

### Test early conversation bias:
- First 2-3 messages should lean FAST unless explicitly deep

---

## 6. Console Log Decoder

Look for these key lines in browser dev console:
```
🚦 Processing Profile: FAST | Turn 1 | Length: 7
🧠 Router reasoning: Simple greeting - using fast path
✅ MAIA FAST response complete: 1847ms | 89 chars
```

**FAST/CORE/DEEP** = the tier system working
**Router reasoning** = why it chose that tier
**Response time** = should match tier expectations

---

**Remember:** MAIA is now **conditionally conscious**. She decides how deep to go based on your invitation, not by default. This is the breakthrough - consciousness when invited, efficiency when not.