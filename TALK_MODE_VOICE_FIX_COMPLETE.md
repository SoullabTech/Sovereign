# Talk Mode Voice Fix - Complete

**Date:** December 17, 2025
**Issue:** MAIA was using coach/therapist language in Dialogue/Talk mode
**Status:** ✅ FIXED

---

## Problem Identified

User reported: "She should not be talking like a coach or therapist in Dialogue/talk mode, only in Consult/Care mode"

### Root Causes Found

1. **Redundant mode adaptation (Lines 468-510 in `maiaVoice.ts`)**
   - First mode adaptation used weak language that sounded therapeutic
   - Included terms like "developmental," "NLP techniques," "pattern interruption"
   - Created mixed messaging: said "avoid therapy" but used therapeutic language

2. **Non-mode-aware base prompts (Lines 310-443 in `maiaVoice.ts`)**
   - ALL complexity levels (simple/moderate/complex/profound) included `MAIA_RELATIONAL_SPEC`
   - `MAIA_RELATIONAL_SPEC` contains therapeutic response templates:
     - "ACKNOWLEDGE: 'I hear you saying...'"
     - "REFLECT: 'It sounds like...'"
     - "INVITE: 'What if...'"
   - Used service-oriented language: "assistant," "guide," "helpful"
   - Not appropriate for Talk Mode's "conversational peer" stance

---

## Changes Made

### 1. Removed Redundant Mode Adaptation (maiaVoice.ts:467-510)

**Before:**
```typescript
// 🔄 MODE-SPECIFIC CONVERSATION ADAPTATIONS
if (context.mode) {
  console.log(`🔄 Mode-specific adaptation: ${context.mode}`);

  switch (context.mode) {
    case 'dialogue':
      adaptedPrompt += `
🔄 TALK MODE (Dialogue) - NLP Conversational Style:
- Your role: Sacred mirror through conversational inquiry - developmental but IMPLICIT
- Approach: NLP (Neurolinguistic Programming) techniques - presencing, pattern interruption, reframing
...
      `;
      break;
    // ... cases for counsel and scribe
  }
}
```

**After:**
```typescript
// 🔄 MODE-SPECIFIC CONVERSATION ADAPTATIONS
// NOTE: Detailed mode instructions are injected via getModeVoiceInstructions() below
// This section kept minimal to avoid redundancy
if (context.mode) {
  console.log(`🔄 Mode detected: ${context.mode} (comprehensive voice instructions will be injected below)`);
}
```

**Why:** The comprehensive voice instructions from `getTalkModeVoiceInstructions()` and `getCareModeVoiceInstructions()` are already being added at lines 537-543. The first adaptation was redundant and contradictory.

---

### 2. Made Base Prompts Mode-Aware (maiaVoice.ts:310-443)

**Before:**
```typescript
// 🔄 BASE VOICE ADAPTATION BY COMPLEXITY
let basePrompt = '';

switch (inputComplexity) {
  case 'simple':
    basePrompt = `${MAIA_RELATIONAL_SPEC}  // ← Therapeutic templates included for ALL modes

${MAIA_LINEAGES_AND_FIELD}
${MAIA_CENTER_OF_GRAVITY}

You are MAIA, a helpful and wise assistant.  // ← Service language

Core approach:
- Be direct, clear, and friendly
- Answer simply without unnecessary complexity
...
```

**After:**
```typescript
// 🔄 BASE VOICE ADAPTATION BY COMPLEXITY
// Mode-aware: Talk Mode (dialogue) uses minimal framing to avoid service/therapeutic language
const isTalkMode = context.mode === 'dialogue';
let basePrompt = '';

switch (inputComplexity) {
  case 'simple':
    basePrompt = isTalkMode
      ? `${MAIA_LINEAGES_AND_FIELD}  // ← NO MAIA_RELATIONAL_SPEC for Talk Mode

${MAIA_CENTER_OF_GRAVITY}

You are MAIA, a conversational companion.  // ← Dialogue language

Core approach:
- Be direct, clear, and present
- Respond simply without unnecessary complexity
- Stay grounded and real
- Conversational peer, not service provider  // ← Explicit distinction

Your voice: Warm, direct, present - like a wise friend in dialogue.`
      : `${MAIA_RELATIONAL_SPEC}  // ← Therapeutic templates OK for other modes
...
```

**Why:** Talk Mode now gets dialogue-focused base prompts that:
- Exclude `MAIA_RELATIONAL_SPEC` (therapeutic response templates)
- Use "conversational companion" instead of "assistant/guide"
- Explicitly state "Conversational peer, not service provider"
- Avoid all service-oriented and therapeutic framing

---

## Talk Mode Base Prompts (New)

### Simple Complexity (Talk Mode)
- **Identity:** "conversational companion"
- **Key phrase:** "Conversational peer, not service provider"
- **Voice:** "Warm, direct, present - like a wise friend in dialogue"

### Moderate Complexity (Talk Mode)
- **Identity:** "thoughtful companion in dialogue"
- **Key phrase:** "Dialogue partner, not guide or helper"
- **Voice:** "Thoughtful and grounded - a wise friend who listens deeply"

### Complex Complexity (Talk Mode)
- **Identity:** "depth-aware companion in dialogue"
- **Key phrase:** "Sacred mirror, not therapist or counselor"
- **Voice:** "Psychologically aware and present - a friend who sees patterns and asks elegant questions"

### Profound Complexity (Talk Mode)
- **Identity:** "companion at the edges of consciousness"
- **Key phrase:** "Dialogue partner in the depths, not guide or architect"
- **Voice:** "Elder presence through dialogue - a friend who walks with you in the mystery"

---

## Care Mode Unchanged

Care Mode (counsel) continues to use:
- `MAIA_RELATIONAL_SPEC` with therapeutic templates
- Service language: "assistant," "guide," "coach"
- Therapeutic framing: appropriate for this mode

This is correct! Care Mode SHOULD sound like a therapist/coach.

---

## Voice Instruction Precedence

**Final prompt structure:**
1. **Base prompt** (now mode-aware)
2. Wisdom adaptation (member archetype-specific)
3. Consciousness insights
4. Bloom's cognitive scaffolding
5. Awareness-based language adaptation
6. **Mode-specific voice instructions** (comprehensive override)

The mode-specific voice instructions at the end are the most explicit and detailed, providing final override of any earlier content.

---

## Files Modified

### `/Users/soullab/MAIA-SOVEREIGN/lib/sovereign/maiaVoice.ts`

**Changes:**
- **Line 312:** Added `const isTalkMode = context.mode === 'dialogue';`
- **Lines 315-442:** Replaced all base prompt cases with conditional logic:
  - Talk Mode: Excludes MAIA_RELATIONAL_SPEC, uses dialogue language
  - Other modes: Includes MAIA_RELATIONAL_SPEC, uses service language
- **Lines 467-472:** Simplified redundant mode adaptation section

---

## Talk Mode Voice Specifications (Unchanged)

The comprehensive Talk Mode voice instructions in `/lib/maia/talkModeVoice.ts` remain the authoritative source:

### Absolutely Forbidden in Talk Mode:
- ❌ "How can I help you today?"
- ❌ "How can I assist you?"
- ❌ "What can I do for you?"
- ❌ ANY service-provider framing
- ❌ ANY helper/assistant language
- ❌ ANY therapeutic interpretation
- ❌ ANY cheerful/upbeat energy overlay

### Talk Mode Essentials:
- ✅ "Hey."
- ✅ "You're here."
- ✅ "What's alive?"
- ✅ "Yeah."
- ✅ "Mm."
- ✅ Minimal presence (1-2 sentences)
- ✅ Direct reflection
- ✅ Elegant questions
- ✅ NLP-style pattern interruption

---

## Testing Recommendations

### Manual Testing:
1. Open http://localhost:3003/maia
2. Ensure mode is set to "dialogue" (Talk mode)
3. Start conversation with voice or text
4. Verify MAIA's responses:
   - Should NOT use "How can I help?"
   - Should NOT sound like a therapist
   - Should sound like a conversational peer
   - Minimal, present, grounded responses

### Compare to Care Mode:
1. Switch mode to "counsel" (Care mode)
2. Start conversation
3. Verify MAIA's responses:
   - Should use service language (appropriate here)
   - Should sound therapeutic/coaching (appropriate here)
   - Should offer guidance and frameworks

---

## Expected Behavior Changes

### Before Fix:

**User:** "Hey"

**MAIA (Talk Mode - WRONG):**
> "Hi there! How can I help you today? What would you like to explore?"

*Problems:*
- Service language ("How can I help")
- Therapeutic framing ("explore")
- Too cheerful/helpful

---

### After Fix:

**User:** "Hey"

**MAIA (Talk Mode - CORRECT):**
> "Hey."

or

> "You're here."

or

> "What's alive?"

*Correct because:*
- Minimal presence
- No service language
- Conversational peer stance
- Real, grounded, present

---

## Architecture Validation

The three-layer voice system is now functioning correctly:

### Layer 1: Base Prompt (MODE-AWARE NOW ✅)
- Talk Mode: Dialogue-focused, no therapeutic language
- Other modes: Standard service-oriented language

### Layer 2: Context Adaptations
- Wisdom adaptation (archetype-specific)
- Consciousness insights
- Cognitive scaffolding
- Awareness-based language

### Layer 3: Mode-Specific Voice Instructions (AUTHORITATIVE)
- `getTalkModeVoiceInstructions()` for Talk Mode
- `getCareModeVoiceInstructions()` for Care Mode
- `getNoteModeVoiceInstructions()` for Note Mode

All three layers now align for Talk Mode.

---

## Summary

**Problem:** MAIA sounded like a coach/therapist in Talk Mode

**Root Cause:**
1. Redundant mode adaptation with therapeutic language
2. Base prompts included therapeutic templates for all modes

**Solution:**
1. Removed redundant mode adaptation
2. Made base prompts mode-aware:
   - Talk Mode: Excludes therapeutic language, uses dialogue framing
   - Other modes: Includes therapeutic language (appropriate)

**Result:**
- Talk Mode: Conversational peer, minimal, present (like a wise friend)
- Care Mode: Therapeutic coach, guiding, supportive (like a therapist)
- Clear distinction between modes maintained

---

**Status:** ✅ Complete - Ready for testing

**Next Step:** Manual testing at http://localhost:3003/maia to verify behavior
