# MAIA Emoji and "Guest" Name Issue - Diagnosis

**Date:** December 17, 2025
**Issue:** User reports MAIA still using emojis and calling them "Guest"

---

## Issue 1: Emoji Mirroring Still Showing Emojis

### Changes Made

**File:** `/lib/consciousness/MAIA_RUNTIME_PROMPT.ts` (line 120)
```typescript
- **DEFAULT: No emojis** - Express warmth through words alone UNLESS the user has clearly used emojis in their own messages (then you may use them sparingly to match their style).
```

**File:** `/app/api/oracle/conversation/route.ts` (line 1190)
```typescript
9. **Mirror their communication style** - If they use emojis, you can use them naturally. If they don't, stay emoji-free. Match their energy and formality.
```

### Why Emojis May Still Appear

**CRITICAL:** System prompt changes only apply to **NEW conversations**.

**Solution:** Start a new conversation (not just new message in existing conversation).

**How to verify fix is working:**
1. Close/restart the app
2. Start a **brand new conversation** (not continuing existing one)
3. Send a message **without emojis**
4. Check if MAIA's response contains emojis
5. If yes → bug still exists
6. If no → prompt is working correctly

---

## Issue 2: MAIA Calling User "Guest"

### Code Investigation

**File:** `/components/OracleConversation.tsx` (line 1738)
```typescript
userName: userName || 'Explorer',
```

**Finding:** Code defaults to **'Explorer'**, NOT 'Guest'.

### Possible Causes

#### Cause 1: Parent Component Passing "Guest"
The `userName` prop is being passed to OracleConversation as "Guest" from whichever component renders it.

**Need to check:** Where is OracleConversation being rendered and what userName is being passed?

#### Cause 2: Claude Choosing Generic Language
Claude is not using the `userName` field from the request and is defaulting to generic greeting like "Guest" on its own.

**Check:** Does the API request body actually include `userName`? (Check network tab in browser)

#### Cause 3: Cached/Stale Conversation
The conversation state is cached and using old data.

**Solution:** Start a new conversation.

### Diagnostic Steps

1. **Check Network Request:**
   - Open browser DevTools → Network tab
   - Send a message to MAIA
   - Find the POST request to `/api/oracle/conversation` or `/api/between/chat`
   - Check request payload for `userName` field
   - If `userName: "Guest"` → Parent component issue
   - If `userName: "Explorer"` or actual name → Claude is ignoring it
   - If `userName` missing → OracleConversation not receiving prop

2. **Check Parent Component:**
   - Find where `<OracleConversation>` is rendered
   - Check what value is being passed as `userName` prop
   - Trace back to where that value comes from (localStorage? user profile? hardcoded?)

3. **Verify Prompt Uses userName:**
   - The `buildSacredAttendingPrompt` function (line 1031 in route.ts) does NOT currently reference `userName`
   - This means the userName is passed in the request but **not injected into the system prompt**
   - Claude would only know the user's name if:
     - It's in conversation history
     - It's in memory context
     - It's explicitly added to the prompt

### Likely Root Cause

**The userName is passed to the API but never injected into the prompt template.**

The `buildSacredAttendingPrompt` function doesn't include userName anywhere. Claude has no way to know the user's name unless:
- User introduces themselves in conversation
- It's stored in memory context and retrieved

### Recommended Fix

**Option 1: Add userName to prompt (recommended)**

In `/app/api/oracle/conversation/route.ts`, modify `buildSacredAttendingPrompt` function to accept and use userName:

```typescript
function buildSacredAttendingPrompt(
  // ... existing parameters
  userName?: string  // Add this
): string {
  let prompt = `You are MAIA - the Soullab / Spiralogic Oracle.

# User Context
${userName && userName !== 'Explorer' ? `- The person you're speaking with is ${userName}. Use their name naturally when appropriate, but don't overuse it.` : '- No user name provided. Use natural language without assuming their name.'}

# Core Voice Principles
...
```

Then pass userName when calling the function (around line 420-450 in route.ts where buildSacredAttendingPrompt is called).

**Option 2: Remove userName entirely if not being used**

If userName isn't meant to be used, remove it from the component props and API request to avoid confusion.

---

## Quick Fix Instructions

### For User (Immediate)
1. **Close the app completely**
2. **Reopen and start a NEW conversation** (not continue existing)
3. **Don't use any emojis in your first message**
4. **Check if issue persists**

### For Developer (Permanent Fix)

**Emoji Issue:** ✅ Already fixed (just needs new conversation)

**Guest Name Issue:** ❌ Needs code fix

**To fix "Guest" issue:**
1. Add userName parameter to `buildSacredAttendingPrompt` function
2. Inject userName into system prompt template
3. Pass userName when calling the function
4. OR: Remove userName entirely if not meant to be used

---

## Status Summary

| Issue | Status | Action Required |
|-------|--------|----------------|
| Emojis | ✅ Fixed in code | User: Start new conversation |
| "Guest" name | ❌ Not fixed | Dev: Add userName to prompt template |

---

## Next Steps

1. **User:** Try the "Quick Fix Instructions" above
2. **If emojis still appear after new conversation:** Verify HMR reloaded changes (check file timestamps)
3. **If "Guest" persists:** Implement "Recommended Fix Option 1" above
4. **Report back:** Let me know if issues persist after these steps
