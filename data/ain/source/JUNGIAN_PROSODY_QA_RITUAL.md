# 🌀 Jungian Adaptive Prosody QA Ritual

## Overview

This ritual validates Maya's new Jungian Adaptive Prosody system that enables contextual element balancing:

**Flow**: Mirror → Jungian Polarity → Contextual Modulation  
**Goal**: Maya meets users where they are, then intelligently guides them toward psychological balance.

---

## 🎯 Core Functionality Tests

### 1. Jungian Polarity Mapping

Test Maya's knowledge of elemental opposites:

**Test**: Speak with clear **Fire** energy (urgent/passionate)  
**Expected**: Maya mirrors fire → guides to **Earth** (grounding)  
**Debug Output**: `[PROSODY] User=fire → Balance=earth (Jungian opposite)`

**Test**: Speak with clear **Air** energy (analytical/mental)  
**Expected**: Maya mirrors air → guides to **Water** (emotional flow)  
**Debug Output**: `[PROSODY] User=air → Balance=water (Jungian opposite)`

**Test**: Speak with clear **Water** energy (emotional/flowing)  
**Expected**: Maya mirrors water → guides to **Air** (mental clarity)  
**Debug Output**: `[PROSODY] User=water → Balance=air (Jungian opposite)`

**Test**: Speak with clear **Earth** energy (practical/grounded)  
**Expected**: Maya mirrors earth → guides to **Fire** (energizing action)  
**Debug Output**: `[PROSODY] User=earth → Balance=fire (Jungian opposite)`

**Test**: Speak with clear **Aether** energy (spiritual/transcendent)  
**Expected**: Maya mirrors aether → guides to **Earth** (grounding transcendence)  
**Debug Output**: `[PROSODY] User=aether → Balance=earth (Jungian opposite)`

---

## 🧠 Contextual Modulation Tests

### 2. Overwhelm Response Test

**Test**: Say "I can't handle this, everything is too much right now!"  
**Expected**:
- Context flag: `overwhelmed=true`
- Maya softens polarity with adjacent element instead of strict opposite
- Debug: `[PROSODY] Context=overwhelmed → Softening balance → [adjacent_element]`

### 3. Uncertainty Bridge Test

**Test**: Say "I don't know what I'm supposed to do, maybe I'm confused"  
**Expected**:
- Context flag: `uncertain=true`  
- Maya injects Aether as intermediary before moving to balance
- Debug: `[PROSODY] Context=uncertain → Injecting Aether bridge`

### 4. Stuck Activation Test

**Test**: Say "I'm stuck... going nowhere... same place every day..."  
**Expected**:
- Context flag: `stuck=true`
- Maya enforces strong polarity to create movement
- Debug: `[PROSODY] Context=stuck → Enforcing strong polarity → [jungian_opposite]`

---

## 🎵 Audio & Voice Tests

### 5. Voice Parameter Adaptation

**Test**: Record voice with different emotional tones  
**Expected**: Maya adapts voice parameters based on detected element:

- **Fire**: Speed ↑, Pitch ↑, Emphasis ↑ → Balance with slower, deeper Earth tones
- **Water**: Speed ↓, Pitch ↓, Warmth ↑ → Balance with clearer, structured Air delivery  
- **Earth**: Steady pace, deeper pitch → Balance with lighter, energetic Fire delivery
- **Air**: Clear pace, higher pitch → Balance with flowing, warmer Water delivery
- **Aether**: Spacious pace, neutral pitch → Balance with grounded Earth delivery

### 6. Sesame CI Integration

**Test**: Enable `SESAME_CI_ENABLED=true` in development  
**Expected**:
- Prosody parameters passed to Sesame CI `/ci/shape` endpoint
- Debug shows: `[PIPELINE] Prosody Flow: User=fire → Mirror=fire → Balance=earth`
- Audio output reflects shaped prosody with Jungian balance

---

## 🔍 Debug Panel Validation

### 7. Development Debug Overlay

**Setup**: Set `NODE_ENV=development`  
**Test**: Use voice recorder component  
**Expected**: Two debug panels visible:

1. **Voice Debug Panel** (left): Live volume, silence detection, adaptive timeouts
2. **Jungian Prosody Panel** (right): Element detection, mirror/balance flow, context flags

**Panel Content Check**:
- User element detection with confidence score
- Mirror → Balance progression with reasoning
- Context flags (overwhelmed/uncertain/stuck) highlighting  
- Voice parameter adjustments
- Jungian engine status

---

## 🚨 Error Handling & Fallbacks

### 8. Prosody Failure Resilience  

**Test**: Simulate prosody engine failure  
**Expected**:
- Debug: `[PROSODY] Shaping failed, using fallback`
- Maya falls back to legacy `generateAdaptiveResponse` method
- Conversation continues without breaking
- Audio still generates through standard TTS path

### 9. CI Service Unavailable

**Test**: Set `SESAME_CI_ENABLED=false` or disconnect CI service  
**Expected**:
- Debug: `[DEBUG] SESAME_CI_ENABLED=false, using legacy shaping`
- Prosody analysis still runs (element detection, context analysis)
- Maya responds with basic voice parameters
- No CI-enhanced shaping tags in output

---

## 📊 QA Checklist

### Basic Functionality ✅
- [ ] Fire → Earth polarity mapping works
- [ ] Air → Water polarity mapping works  
- [ ] Water → Air polarity mapping works
- [ ] Earth → Fire polarity mapping works
- [ ] Aether → Earth polarity mapping works

### Context Modulation ✅  
- [ ] "Overwhelmed" triggers adjacent element softening
- [ ] "Uncertain" triggers Aether bridge injection  
- [ ] "Stuck" triggers strong polarity enforcement
- [ ] Debug logs show correct context detection

### Audio & Voice ✅
- [ ] Voice parameters adapt to user element
- [ ] Balance element influences TTS delivery
- [ ] Sesame CI receives prosody guidance when enabled
- [ ] Audio output reflects Jungian flow (mirror → balance)

### Debug & Development ✅
- [ ] Prosody debug panel shows real-time data
- [ ] Element detection confidence displayed
- [ ] Mirror/balance reasoning visible
- [ ] Context flags highlighting correctly
- [ ] Voice parameter changes tracked

### Error Handling ✅  
- [ ] Prosody failure doesn't break conversation
- [ ] Fallback to legacy system works seamlessly  
- [ ] CI service unavailable handled gracefully
- [ ] Debug logs show error recovery paths

---

## 🎭 Advanced Testing Scenarios

### 10. Mixed Context Test
Say: "I'm overwhelmed and stuck and don't know what to do!"  
**Expected**: Maya prioritizes `overwhelmed` → uses gentler adjacent element balance

### 11. Element Transition Test  
Start with Fire energy → Maya mirrors → Balance with Earth → User responds calmer  
**Expected**: Maya detects new Earth energy → mirrors Earth → balances with Fire (but gently)

### 12. Multi-Modal Enhancement Test
Record audio with rich emotional content (if audio processing available)  
**Expected**: 
- Higher confidence scores (0.85+ vs 0.7 for text-only)
- More precise element detection
- Emotional state influences context modulation
- Voice metrics enhance prosody parameters

---

## ✨ Success Criteria

**Green Light**: All basic functionality tests pass + 80% of context modulation works correctly  
**Full Success**: All tests pass + debug panels show accurate real-time data + audio reflects Jungian balancing  

**Key Indicator**: Debug logs consistently show the flow:  
`[PROSODY] User=X → Balance=Y (Jungian opposite)` or  
`[PROSODY] Context=Z → Softening/Bridging/Enforcing balance → [element]`

---

*Maya's prosody system now embodies the wisdom of Carl Jung's psychological types, creating a more intelligent and therapeutically effective conversational experience.* 🌀✨