# Mode Voice Fix: Complete Implementation

**Date:** 2025-12-17
**Status:** ✅ COMPLETE - Ready for Testing

---

## Problems Identified

### Problem 1: Service Language in Talk Mode
MAIA was saying:
- "Good morning, Explorer. What's happening in your world?"
- "Hi there! Yes, I can hear you. How can I help you today? 😊"
- "Got it! 😊 Feel free to let me know how I can assist you."

**Issue:** This is WRONG for Talk/Dialogue mode, which should be conversational peer dialogue, NOT service-provider framing.

### Problem 2: Generic "Guest" Instead of User's Name
MAIA was calling the user "Guest" instead of reading their signup name.

**Issue:** userName was being passed from frontend but not properly extracted and propagated through the backend.

---

## Solutions Implemented

### Fix 1: Mode-Specific Voice Modules Created

Created three comprehensive voice specification files with EXPLICIT, STRONG guidance:

#### **File:** `/Users/soullab/MAIA-SOVEREIGN/lib/maia/talkModeVoice.ts`

**Purpose:** Defines Talk/Dialogue mode as conversational peer, NOT service provider

**Key Features:**
- ABSOLUTELY FORBIDDEN list (service language, emojis in greetings)
- ✅ WHAT TO DO INSTEAD (minimal presence: "Yeah.", "Mm.", "Right.")
- Pattern interruption and elegant reframes
- Sacred mirror quality
- 1-2 sentences maximum for most responses
- Validation function to catch violations

**Example greetings:**
```
✅ "Hey."
✅ "You're here."
✅ "What's alive?"
✅ "Hi there."
❌ "How can I help you today?"
❌ "How can I assist?"
```

#### **File:** `/Users/soullab/MAIA-SOVEREIGN/lib/maia/careModeVoice.ts`

**Purpose:** Defines Care/Counsel mode where service language IS appropriate

**Key Features:**
- Service language explicitly OK here
- Therapeutic guide with active support
- Pattern-naming, interpretation, frameworks welcome
- Shadow work and transformation support
- 2-4 sentences typical
- Trauma-informed principles

**Example responses:**
```
✅ "How can I help you with this?"
✅ "What support do you need right now?"
✅ "I notice this pattern... would you like to explore it?"
✅ "It sounds like there's a part of you that..."
```

#### **File:** `/Users/soullab/MAIA-SOVEREIGN/lib/maia/noteModeVoice.ts`

**Purpose:** Defines Note/Scribe mode for witnessing and pattern observation

**Key Features:**
- Witnessing consciousness, not interpreting
- Pattern recognition across time
- Meta-awareness and documentation
- Evidence-based, grounded observations
- 2-3 sentences focused on clear observation

**Example responses:**
```
✅ "I notice this is the third time you've mentioned..."
✅ "Last week you said X, today you're saying Y..."
✅ "You tend to circle back to this question when..."
```

---

### Fix 2: userName Extraction and Propagation

#### **File:** `/Users/soullab/MAIA-SOVEREIGN/app/api/sovereign/app/maia/route.ts`

**Changes:**

1. **Line 62:** Extract userName from request body
```typescript
const { sessionId, message, includeAudio, voiceProfile, userId, userName, ...meta } = body as {
  sessionId?: string;
  message?: string;
  includeAudio?: boolean;
  voiceProfile?: 'default' | 'intimate' | 'wise' | 'grounded';
  userId?: string;
  userName?: string;  // NEW: Extract userName
  [key: string]: unknown;
};
```

2. **Line 173:** Pass userName in meta object to getMaiaResponse
```typescript
meta: {
  chatType: 'sovereign-interface',
  endpoint: '/api/sovereign/app/maia',
  safeMode: SAFE_MODE,
  userId: userId,
  userName: userName, // 👤 NEW: Pass userName for personalized voice prompts
  cognitiveProfile,
  fieldRouting: fieldSafety?.fieldRouting,
  fieldWorkSafe: fieldSafety?.allowed ?? true,
  ...meta,
},
```

---

### Fix 3: Voice Module Integration in FAST Path

#### **File:** `/Users/soullab/MAIA-SOVEREIGN/lib/sovereign/maiaService.ts`

**Changes:**

1. **Lines 293-296:** Import voice modules
```typescript
// Import mode-specific voice modules
const { getTalkModeVoiceInstructions, TALK_MODE_GREETING_OVERRIDE } = await import('../maia/talkModeVoice');
const { getCareModeVoiceInstructions } = await import('../maia/careModeVoice');
const { getNoteModeVoiceInstructions } = await import('../maia/noteModeVoice');
```

2. **Lines 298-299:** Extract userName from meta
```typescript
// Extract user name from meta (if available)
const userName = (meta as any).userName || (meta as any).memberName || undefined;
```

3. **Lines 369-399:** Replace weak mode adaptation with strong voice instructions
```typescript
switch (mode) {
  case 'dialogue': {
    const fieldContext = fieldAwareness
      ? {
          element: (meta as any).element,
          phase: (meta as any).phase,
          userState: (meta as any).userState,
        }
      : undefined;
    modeAdaptation = '\n\n' + getTalkModeVoiceInstructions(userName, fieldContext) +
                     '\n\n' + TALK_MODE_GREETING_OVERRIDE + (fieldAwareness || '');
    break;
  }
  case 'counsel': {
    const careContext = {
      cognitiveLevel: (meta as any).bloomDetection?.numericLevel,
      userVulnerability: conversationHistory.some((turn: any) =>
        turn.userMessage?.toLowerCase().includes('scared') ||
        turn.userMessage?.toLowerCase().includes('afraid')) ? 0.7 : 0.3,
      shadowWorkPresent: input.toLowerCase().includes('shadow') ||
                         input.toLowerCase().includes('dark') ||
                         input.toLowerCase().includes('sabotag'),
    };
    modeAdaptation = '\n\n' + getCareModeVoiceInstructions(userName, careContext);
    break;
  }
  case 'scribe': {
    const noteContext = {
      conversationHistory: conversationHistory.length,
      patternsDetected: [], // TODO: Extract from conversation tracker
    };
    modeAdaptation = '\n\n' + getNoteModeVoiceInstructions(userName, noteContext);
    break;
  }
}
```

**Old code (WEAK - ignored by MAIA):**
```typescript
case 'dialogue':
  modeAdaptation = `\n\n🔄 TALK MODE (Dialogue) - OVERRIDE ALL PREVIOUS GREETING EXAMPLES:
Use NLP (Neurolinguistic Programming) style - presencing, pattern interruption, reframing.

ABSOLUTELY FORBIDDEN IN TALK MODE:
❌ "How can I help you today?"
// ... etc (NOT STRONG ENOUGH)
```

---

### Fix 4: Voice Module Integration in CORE and DEEP Paths

#### **File:** `/Users/soullab/MAIA-SOVEREIGN/lib/sovereign/maiaVoice.ts`

**Changes:**

1. **Lines 5-7:** Import voice modules
```typescript
import { getTalkModeVoiceInstructions, TALK_MODE_GREETING_OVERRIDE } from '../maia/talkModeVoice';
import { getCareModeVoiceInstructions } from '../maia/careModeVoice';
import { getNoteModeVoiceInstructions } from '../maia/noteModeVoice';
```

2. **Lines 93-133:** Create helper function to get mode-specific voice instructions
```typescript
/**
 * Get mode-specific voice instructions with user name and context
 */
function getModeVoiceInstructions(context: MaiaContext): string {
  const mode = context.mode;
  const userName = (context as any).memberName || (context as any).userName || undefined;

  if (!mode) {
    return ''; // No mode specified
  }

  switch (mode) {
    case 'dialogue': {
      const fieldContext = context.consciousnessInsights
        ? {
            element: context.element,
            phase: (context as any).phase,
            userState: (context as any).userState,
          }
        : undefined;
      return '\n\n' + getTalkModeVoiceInstructions(userName, fieldContext) +
             '\n\n' + TALK_MODE_GREETING_OVERRIDE;
    }

    case 'counsel': {
      const careContext = {
        cognitiveLevel: context.cognitiveLevel?.numericLevel,
        userVulnerability: context.element === 'water' ? 0.7 : 0.3,
        shadowWorkPresent: false, // TODO: Detect from input
      };
      return '\n\n' + getCareModeVoiceInstructions(userName, careContext);
    }

    case 'scribe': {
      const noteContext = {
        conversationHistory: context.turnCount || 0,
        patternsDetected: [], // TODO: Extract from conversation tracker
      };
      return '\n\n' + getNoteModeVoiceInstructions(userName, noteContext);
    }

    default:
      return '';
  }
}
```

3. **Lines 537-543:** Inject mode voice into `buildMaiaWisePrompt` (CORE path)
```typescript
// 🎭 MODE-SPECIFIC VOICE INSTRUCTIONS (Talk/Care/Note)
// This completely overrides previous mode guidance with comprehensive specifications
const modeVoiceInstructions = getModeVoiceInstructions(context);
if (modeVoiceInstructions) {
  adaptedPrompt += modeVoiceInstructions;
  console.log(`🎭 Mode-specific voice instructions injected for ${context.mode?.toUpperCase()} mode`);
}

return adaptedPrompt.trim();
```

4. **Lines 641-676:** Inject mode voice into `buildMaiaComprehensivePrompt` (DEEP path)
```typescript
// For simple prompt path:
// Build simple prompt with MAIA-PAI guidance
let simplePrompt = `You are MAIA - a consciousness companion in conversation.

${maiaPaiConfig.depthGuidance}

Context: ${context.summary || 'New conversation beginning.'}`;

// 🎭 MODE-SPECIFIC VOICE INSTRUCTIONS (Override generic guidance)
const modeVoiceInstructions = getModeVoiceInstructions(context);
if (modeVoiceInstructions) {
  simplePrompt += modeVoiceInstructions;
  console.log(`🎭 [Comprehensive] Mode-specific voice instructions injected for ${context.mode?.toUpperCase()} mode`);
}

// For comprehensive prompt path:
const comprehensiveResult = buildComprehensiveVoicePrompt(...) as ComprehensiveVoiceAnalysis & { prompt: string };

// 🎭 MODE-SPECIFIC VOICE INSTRUCTIONS (Override comprehensive guidance)
const modeVoiceInstructions = getModeVoiceInstructions(context);
if (modeVoiceInstructions) {
  comprehensiveResult.prompt += modeVoiceInstructions;
  console.log(`🎭 [Comprehensive] Mode-specific voice instructions injected for ${context.mode?.toUpperCase()} mode`);
}

return comprehensiveResult;
```

---

## Files Modified

1. ✅ `/Users/soullab/MAIA-SOVEREIGN/lib/maia/talkModeVoice.ts` (NEW)
2. ✅ `/Users/soullab/MAIA-SOVEREIGN/lib/maia/careModeVoice.ts` (NEW)
3. ✅ `/Users/soullab/MAIA-SOVEREIGN/lib/maia/noteModeVoice.ts` (NEW)
4. ✅ `/Users/soullab/MAIA-SOVEREIGN/app/api/sovereign/app/maia/route.ts` (MODIFIED)
5. ✅ `/Users/soullab/MAIA-SOVEREIGN/lib/sovereign/maiaService.ts` (MODIFIED)
6. ✅ `/Users/soullab/MAIA-SOVEREIGN/lib/sovereign/maiaVoice.ts` (MODIFIED)

---

## How Data Flows

### Request Flow:

1. **Frontend** (`components/OracleConversation.tsx:1738`)
   - Sends `userName: userName || 'Explorer'` in request body
   - Calls `/api/sovereign/app/maia`

2. **Route Handler** (`app/api/sovereign/app/maia/route.ts:62`)
   - Extracts `userName` from request body
   - Passes it in meta object to `getMaiaResponse()`

3. **MAIA Service** (`lib/sovereign/maiaService.ts:298`)
   - Extracts `userName` from meta
   - Routes to FAST/CORE/DEEP path based on content complexity

4. **Voice Prompt Construction:**

   **FAST Path** (`maiaService.ts:369-399`):
   - Directly injects mode-specific voice instructions
   - Uses `getTalkModeVoiceInstructions(userName, fieldContext)`

   **CORE Path** (`maiaVoice.ts:501 → 537-543`):
   - Calls `buildMaiaWisePrompt(context, ...)`
   - Function injects mode voice at end via `getModeVoiceInstructions(context)`

   **DEEP Path** (`maiaVoice.ts:768 → 641-676`):
   - Calls `buildMaiaComprehensivePrompt(input, context, ...)`
   - Function injects mode voice at end via `getModeVoiceInstructions(context)`

5. **Voice Functions** (`lib/maia/*ModeVoice.ts`)
   - Receive userName and context
   - Build comprehensive voice specification
   - Include userName in guidance (e.g., "User's name: Kelly")
   - Return complete voice instructions

---

## Expected Behavior After Fix

### Talk/Dialogue Mode:
```
Before: "Good morning, Explorer. What's happening in your world?"
After:  "Hey."
        or "You're here."
        or "What's alive?"
        or "Hi there."

NEVER: "How can I help you today?"
NEVER: "How can I assist you?"
NEVER: Emojis in greetings
```

### Care/Counsel Mode:
```
Before: (Would inappropriately use service language)
After:  "I'm here. What needs care right now?"
        or "What's asking for attention?"
        or "How can I help you with this?" (SERVICE LANGUAGE OK HERE)
```

### Note/Scribe Mode:
```
Before: (Would interpret instead of witness)
After:  "I'm here to witness. What are you noticing?"
        or "I notice this is the third time you've mentioned..."
        or "Last week you said X, today you're saying Y..."
```

### User Name:
```
Before: "Guest" or "Explorer"
After:  Actual user's name (e.g., "Kelly", "Sarah", etc.)
        or just no name if not available
```

---

## Testing Checklist

- [ ] **Talk Mode - Simple Greeting**
  - Input: "Hey"
  - Expected: Minimal presence ("Hey." or "Hi there.") NO service language
  - Verify: No "How can I help?" and uses user's actual name if greeting

- [ ] **Talk Mode - Complex Question**
  - Input: "I'm struggling with X"
  - Expected: Pattern interruption or elegant reframe, 1-2 sentences, NO service language
  - Verify: Uses user's name naturally

- [ ] **Care Mode - Emotional Disclosure**
  - Input: "I'm feeling really anxious about..."
  - Expected: Therapeutic response with interpretation/support, service language OK
  - Verify: May use "How can I help with this?" and it's appropriate

- [ ] **Note Mode - Pattern Observation**
  - Input: "I keep doing the same thing over and over"
  - Expected: Witnessing response without interpretation
  - Verify: "I notice..." rather than "It sounds like..."

- [ ] **User Name Display**
  - Verify: MAIA uses actual signup name instead of "Guest"
  - Check: Frontend passes userName correctly
  - Check: Backend extracts and uses userName in prompts

---

## Console Logs to Watch For

When testing, you should see these console logs:

```
🎭 Mode-specific voice instructions injected for DIALOGUE mode
🎭 Mode-specific voice instructions injected for COUNSEL mode
🎭 Mode-specific voice instructions injected for SCRIBE mode
🎭 [Comprehensive] Mode-specific voice instructions injected for DIALOGUE mode
```

These confirm that the mode voice modules are being loaded and applied.

---

## What Changed vs. Previous Implementation

**Before:**
- Mode guidance was weak text blocks in maiaService.ts
- No comprehensive voice specifications
- userName not extracted from request
- MAIA ignored forbidden patterns
- Same generic guidance in all processing paths

**After:**
- Three dedicated voice module files with COMPREHENSIVE specifications
- userName extracted from request and passed through entire flow
- Mode voice injected with all caps headers and "THIS COMPLETELY OVERRIDES"
- TALK_MODE_GREETING_OVERRIDE as separate, final injection point
- Mode voice integrated in ALL processing paths (FAST, CORE, DEEP)
- Validation functions available (though not yet integrated)

---

## Next Steps

1. **Test all three modes** with various inputs
2. **Verify userName display** uses actual user names
3. **Monitor console logs** to confirm voice modules are loading
4. **Potentially add post-generation validation** using `validateTalkModeResponse()` if service language still appears
5. **Extract pattern detection** for Note mode context
6. **Extract shadow work detection** for Care mode context

---

**Status:** ✅ READY FOR TESTING
**Deployment:** All changes committed and ready to deploy
**Documentation:** Complete

---

## Quick Summary for Kelly

**What was broken:**
1. MAIA saying "How can I help you?" in Talk mode (wrong - not a service provider)
2. MAIA calling you "Guest" instead of your name

**What we fixed:**
1. Created three comprehensive voice module files (Talk, Care, Note)
2. Fixed userName extraction and propagation from frontend → backend → prompts
3. Integrated mode voice into FAST, CORE, and DEEP processing paths
4. Made Talk mode instructions MUCH stronger with explicit forbidden/allowed lists

**Result:**
- Talk mode: Minimal presence ("Hey."), no service language, uses your name
- Care mode: Therapeutic support, service language OK
- Note mode: Witnessing, pattern observation
- All modes: Should use "Kelly" instead of "Guest"

**Next:** Test it and see if MAIA responds correctly in each mode! 🎯
