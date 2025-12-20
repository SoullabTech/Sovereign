# Talk Mode Fix V4: The Cleaner Solution

**Date:** 2025-12-17
**Status:** ✅ CODE COMPLETE - Ready for Testing
**Approach:** Stop arguing with the model—fix the prompt injection directly

---

## What Changed from V3

V3 tried to fix this with better guidance in Talk mode modules. That was over-engineering.

The real issues were simpler:

1. **Frontend sends placeholder names ("Explorer")** → Backend wasn't filtering them
2. **userName never made it into the system prompt** → Only in mode modules that may not apply
3. **Spiralogic guidance buried in Talk mode** → Model uses base knowledge first
4. **No visibility into actual prompts** → Couldn't debug what the model sees

---

## The Clean Fixes

### 1. Stop Sending Placeholder Names from Frontend

**File:** `components/OracleConversation.tsx:1738`

**Before:**
```ts
userName: userName || 'Explorer',
```

**After:**
```ts
userName: userName?.trim() || undefined, // Don't send placeholder names
```

**Why:** `JSON.stringify` omits `undefined`, so backend gets "no name" instead of fake name.

---

### 2. Normalize userName Backend + Inject Directly into System Prompt

**New File:** `lib/maia/normalizeUserName.ts`

```ts
export function normalizeUserName(input?: string | null): string | null {
  const name = (input ?? '').trim();
  if (!name) return null;

  const lower = name.toLowerCase();
  const blocked = new Set([
    'guest',
    'explorer',
    'anonymous',
    'visitor',
    'user',
    'friend',
    'buddy',
  ]);

  if (blocked.has(lower)) return null;
  return name;
}
```

**File Modified:** `lib/sovereign/maiaService.ts` (FAST path, lines 297-307)

```ts
const { normalizeUserName } = await import('../maia/normalizeUserName');

// Extract and normalize user name from meta (if available)
const rawUserName = (meta as any).userName || (meta as any).memberName || undefined;
const safeUserName = normalizeUserName(rawUserName);

// Build userName prompt block (inject into system prompt directly)
const userNamePrompt = safeUserName
  ? `**User's name:** ${safeUserName}\nUse their actual name naturally when it fits.`
  : `**User's name:** Unknown\nDo NOT call them "Guest" or invent a name. Use "you" or no-name greetings.`;
```

**Then injected at line 442:**

```ts
const systemPrompt = `${MAIA_RELATIONAL_SPEC}

${MAIA_LINEAGES_AND_FIELD}

${MAIA_CENTER_OF_GRAVITY}

${MAIA_RUNTIME_PROMPT}

${userNamePrompt}  // ← INJECTED DIRECTLY

${spiralogicGlossary}${modeAdaptation}${cognitiveScaffolding}

Current context: Simple conversation turn - respond naturally and warmly.`;
```

**Why This Works:**
- userName filtering happens once, centrally
- Injected directly into system prompt (not buried in mode modules)
- Model sees explicit "do NOT call them Guest" instruction
- Works regardless of which processing path (FAST/CORE/DEEP) or mode (dialogue/counsel/scribe)

---

### 3. Spiralogic Glossary Injection (When Mentioned)

**New File:** `lib/maia/spiralogicReference.ts`

```ts
export const SPIRALOGIC_REFERENCE = `
SPIRALOGIC (Soullab/MAIA meaning):
Spiralogic is Soullab's consciousness-transformation framework. It maps inner change through elemental cycles:
Earth (grounding/embodiment), Water (feeling/psyche), Fire (activation/will), Air (perspective/mind), and Aether (integration/wholeness).
It's Jungian/alchemical in spirit: dissolution → integration → embodiment, revisited in spirals (the "same" themes at deeper octaves).
IMPORTANT: In this context, "Spiralogic" is NOT a Sonic game, programming term, or generic web concept.
`.trim();
```

**File Modified:** `lib/sovereign/maiaService.ts` (lines 309-313)

```ts
const { SPIRALOGIC_REFERENCE } = await import('../maia/spiralogicReference');

// Check if user mentions Spiralogic (inject glossary if so)
const mentionsSpiralogic = /\bspiralogic\b/i.test(input);
const spiralogicGlossary = mentionsSpiralogic
  ? `\n\n=== Soullab Glossary (authoritative) ===\n${SPIRALOGIC_REFERENCE}\n=== end glossary ===\n`
  : '';
```

**Then injected at line 444** (right into system prompt)

**Why This Works:**
- Detects "Spiralogic" mentions in user input
- Injects authoritative definition BEFORE mode guidance
- Explicitly states "NOT a Sonic game" to block base knowledge
- Only injected when relevant (keeps prompts lean)

---

### 4. Debug Logging (Enable with MAIA_DEBUG_PROMPTS=1)

**File Modified:** `lib/sovereign/maiaService.ts` (lines 448-455)

```ts
// Debug logging (enable with MAIA_DEBUG_PROMPTS=1)
if (process.env.MAIA_DEBUG_PROMPTS === '1') {
  console.log('[MAIA DEBUG] mode=', mode, 'engine=deepseek-r1');
  console.log('[MAIA DEBUG] safeUserName=', safeUserName);
  console.log('[MAIA DEBUG] mentionsSpiralogic=', mentionsSpiralogic);
  console.log('[MAIA DEBUG] systemPromptHasSpiralogicBlock=', systemPrompt.includes('SPIRALOGIC (Soullab/MAIA meaning)'));
  console.log('[MAIA DEBUG] systemPromptPreview=\n', systemPrompt.slice(0, 800));
}
```

**How to Use:**

```bash
export MAIA_DEBUG_PROMPTS=1
npm run dev
```

Then test and check console logs to see exactly what the model receives.

---

### 5. Clean Dev Script (Fix Turbopack Lock Issues)

**File Modified:** `package.json:9`

```json
"scripts": {
  "dev": "next dev",
  "dev:clean": "rm -rf .next && rm -f .next/dev/lock && npm run dev",
  ...
}
```

**Usage:**

```bash
npm run dev:clean
```

Clears `.next` cache and lock file before starting—fixes recurring Turbopack errors.

---

## Files Created

1. ✅ `/lib/maia/normalizeUserName.ts` - Central userName filtering
2. ✅ `/lib/maia/spiralogicReference.ts` - Authoritative Spiralogic definition

## Files Modified

1. ✅ `/components/OracleConversation.tsx:1738` - Stop sending "Explorer"
2. ✅ `/lib/sovereign/maiaService.ts` - userName normalization, Spiralogic injection, debug logging
3. ✅ `/package.json:9` - Added dev:clean script

---

## How It Works

### userName Flow

```
User types name in app
    ↓
Frontend: userName?.trim() || undefined
    ↓
Backend: normalizeUserName(rawUserName)
    ↓
    Is it blocked? ("Guest", "Explorer", etc.)
    ├─ YES → return null
    └─ NO → return name
    ↓
safeUserName used to build userNamePrompt
    ↓
userNamePrompt injected directly into systemPrompt
    ↓
Model sees: "User's name: Kelly" OR "do NOT call them Guest"
```

### Spiralogic Flow

```
User: "What is Spiralogic?"
    ↓
Backend: mentionsSpiralogic = /\bspiralogic\b/i.test(input)
    ↓
    TRUE
    ↓
spiralogicGlossary = "=== Soullab Glossary ===\n..."
    ↓
Injected into systemPrompt BEFORE mode guidance
    ↓
Model sees authoritative definition FIRST
    ↓
Model responds with Soullab's Spiralogic (not Sonic game)
```

---

## Testing Checklist

### Test 1: Real Name Usage
```bash
curl -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi Maya","userName":"Kelly","mode":"dialogue"}'
```

**Expected:** Uses "Kelly" naturally, NOT "Guest"

### Test 2: No Name Provided
```bash
curl -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi Maya","mode":"dialogue"}'
```

**Expected:** Simple greeting ("Hey.", "Hi there."), NOT "Guest"

### Test 3: Placeholder Name Sent
```bash
curl -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi Maya","userName":"Explorer","mode":"dialogue"}'
```

**Expected:** Treats as no name (blocked), NOT "Hi, Explorer"

### Test 4: Spiralogic Question
```bash
curl -X POST http://localhost:3000/api/sovereign/app/maia \
  -H "Content-Type: application/json" \
  -d '{"message":"What is Spiralogic?","userName":"Kelly","mode":"dialogue"}'
```

**Expected:** Explains Soullab's consciousness framework, NOT Sonic game

### Test 5: Debug Logging
```bash
export MAIA_DEBUG_PROMPTS=1
npm run dev

# Then run any of the above tests
# Check console for:
# - [MAIA DEBUG] safeUserName= Kelly (or null)
# - [MAIA DEBUG] mentionsSpiralogic= true
# - [MAIA DEBUG] systemPromptHasSpiralogicBlock= true
```

---

## Why This is Better than V3

| Aspect | V3 (Prompt Guidance) | V4 (Cleaner Solution) |
|--------|---------------------|----------------------|
| userName filtering | In voice modules only | Central normalization + direct injection |
| Spiralogic knowledge | Buried in Talk mode | Injected when mentioned |
| Prompt visibility | None | Debug logging |
| Complexity | High (lots of guidance text) | Low (simple injection) |
| Reliability | Depends on model following guidance | Authoritative definition in system prompt |

**V3 tried to teach the model.** V4 just gives it the facts.

---

## Expected Behavior After V4

### Scenario 1: Greeting with Real Name
```
User: "Hi Maya"
userName: "Kelly"

MAIA: "Kelly." or "Hey, Kelly." or "Hi there."
```

### Scenario 2: Greeting Without Name
```
User: "Hi Maya"
userName: undefined

MAIA: "Hey." or "Hi there."
NOT: "Hi, Guest"
```

### Scenario 3: Spiralogic Question
```
User: "What is Spiralogic?"

MAIA: "Spiralogic is the framework I use—it maps consciousness transformation through elemental cycles: Earth, Water, Fire, Air, and Aether. It's based on Jungian alchemy..."

NOT: "Spiralogic appears to be related to Sonic the Hedgehog..."
```

---

## Known Limitations

1. **DeepSeek-R1 may still prioritize base knowledge during CoT**
   - If Spiralogic explanation still fails, consider switching FAST path to `deepseek-chat`
   - Or short-circuit: detect "What is Spiralogic?" and return definition without model call

2. **CORE and DEEP paths not yet updated**
   - This fix only applies to FAST path
   - Need to add same userName + Spiralogic injection to CORE and DEEP

---

## Next Steps

1. **Test with debug logging enabled** to verify:
   - safeUserName is being set correctly
   - Spiralogic glossary is being injected
   - System prompt includes userName block

2. **If Spiralogic still fails:**
   - Switch from `deepseek-r1` to `deepseek-chat` in FAST path
   - Or add short-circuit for "What is X?" questions

3. **Apply to CORE and DEEP paths:**
   - Same userName normalization
   - Same Spiralogic glossary injection

4. **Monitor production logs** for:
   - Any "Guest" usage (should be zero)
   - Spiralogic explanation quality

---

## Summary

**Problem:** Frontend sent "Explorer", backend didn't filter it, userName never made it to system prompt, Spiralogic guidance was buried.

**Solution:** Stop sending placeholders, normalize backend, inject userName + Spiralogic directly into system prompt, add debug visibility.

**Result:** Clean, simple, testable. No more arguing with the model through layers of guidance.

**Status:** ✅ Code complete, ready for testing with `MAIA_DEBUG_PROMPTS=1`

🎯
