# MAIA Consciousness Gateway Flow Analysis

## Executive Summary

The user reported that 3 journaling modes ('free', 'emotional', 'direction') are broken while 'dream' and 'shadow' modes work correctly. This analysis traces the complete flow from clicking a consciousness gateway through to the journaling interface to identify the issue.

---

## Part 1: Understanding the Complete Flow

### 1.1 Entry Point: Consciousness Gateway Click
**File:** `/Users/soullab/MAIA-FRESH/apps/web/components/maia/ModeSelection.tsx` (Lines 104-109, 218-223)

When a user clicks on a consciousness gateway (ConsciousnessVessel component):
```typescript
onClick={(e) => {
  console.log('Consciousness Gateway Clicked:', mode);
  const rect = e.currentTarget.getBoundingClientRect();
  createConsciousnessRipple(rect.left + rect.width/2, rect.top + rect.height/2, mode);
  setTimeout(() => setMode(mode), 300);  // <- SETS MODE WITH 300ms DELAY
}}
```

**Key Points:**
- Creates visual ripple effect
- Delays mode setting by 300ms for visual effect
- Calls `setMode(mode)` from the Zustand store

### 1.2 State Management: useMaiaStore
**File:** `/Users/soullab/MAIA-FRESH/apps/web/lib/maia/state.ts` (Lines 44-49)

```typescript
setMode: (mode) => {
  console.log('setMode called with:', mode);
  set({ selectedMode: mode, currentView: 'journal-entry' });  // <- SETS VIEW TO 'journal-entry'
  console.log('State updated to:', { selectedMode: mode, currentView: 'journal-entry' });
}
```

**Critical Behavior:**
- When `setMode(mode)` is called, it sets BOTH:
  - `selectedMode`: The journaling mode (e.g., 'free', 'dream', 'emotional', etc.)
  - `currentView`: Changes to 'journal-entry'
- This state is persisted via Zustand with `partialize: (state) => ({ entries: state.entries })`

### 1.3 View Rendering: Route Switch in page.tsx
**File:** `/Users/soullab/MAIA-FRESH/apps/web/app/maia/page.tsx` (Lines 59-74)

```typescript
const renderView = () => {
  switch (currentView) {
    case 'mode-select':
      return <ModeSelection />;
    case 'journal-entry':
      return useVoiceMode ? <VoiceJournaling /> : <JournalEntry />;
    case 'reflection':
      return <MaiaReflection />;
    case 'timeline':
      return <TimelineView />;
    case 'search':
      return <SemanticSearch />;
    default:
      return <ModeSelection />;
  }
};
```

**Flow:**
1. When `currentView === 'journal-entry'`, either `<JournalEntry />` or `<VoiceJournaling />` is rendered
2. The mode determines which component to show, but BOTH expect `selectedMode` to be set

### 1.4 Journal Entry Component
**File:** `/Users/soullab/MAIA-FRESH/apps/web/components/maia/JournalEntry.tsx` (Lines 15-16, 145-160)

```typescript
export default function JournalEntry() {
  const { selectedMode, currentEntry, setEntry, addEntry, setProcessing, isProcessing, resetEntry } = useMaiaStore();
  // ... component logic
  
  if (!selectedMode) return null;  // <- SAFETY CHECK: If no mode selected, renders nothing

  const modeInfo = JOURNALING_MODE_DESCRIPTIONS[selectedMode];

  const getModeVariant = (mode: string) => {
    switch (mode) {
      case 'shadow': return 'neural';
      case 'dream': return 'mystical';
      case 'emotional': return 'jade';
      case 'direction': return 'transcendent';
      default: return 'jade';  // <- DEFAULT FALLBACK
    }
  };

  const modeVariant = getModeVariant(selectedMode);
```

**Critical Issue Identified:**
- The `getModeVariant()` function includes 'shadow', 'dream', 'emotional', 'direction', and has a default
- **Missing case:** 'free' mode is NOT explicitly handled - defaults to 'jade'
- This could be the root cause of issues with 'free', 'emotional', and 'direction' modes

### 1.5 API Endpoint: Journal Analysis
**File:** `/Users/soullab/MAIA-FRESH/apps/web/app/api/journal/analyze/route.ts` (Lines 27-32)

```typescript
if (!mode || !['free', 'dream', 'emotional', 'shadow', 'direction'].includes(mode)) {
  return NextResponse.json(
    { error: 'Valid journaling mode is required' },
    { status: 400 }
  );
}
```

**Validation:**
- The API explicitly validates that mode is one of the 5 valid modes
- All 5 modes are recognized by the backend

---

## Part 2: Comparing Working vs. Broken Modes

### Working Modes: 'dream' and 'shadow'

#### Dream Mode
In ModeSelection.tsx (lines 27-30):
```typescript
const getModeVariant = (mode: JournalingMode) => {
  switch (mode) {
    case 'shadow': return 'neural';
    case 'dream': return 'mystical';      // <- Explicitly handled
    case 'emotional': return 'jade';
    case 'direction': return 'transcendent';
    default: return 'jade';
  }
};
```

In JournalEntry.tsx (lines 150-158):
```typescript
const getModeVariant = (mode: string) => {
  switch (mode) {
    case 'shadow': return 'neural';
    case 'dream': return 'mystical';      // <- Explicitly handled
    case 'emotional': return 'jade';
    case 'direction': return 'transcendent';
    default: return 'jade';
  }
};
```

#### Shadow Mode
- Explicitly handled in both ModeSelection and JournalEntry
- Maps to 'neural' variant
- Has dedicated prompt in JournalingPrompts.ts

### Broken Modes Analysis

#### Mode 1: 'free'
**Issue Location:** JournalEntry.tsx getModeVariant() function
- **Problem:** NOT explicitly listed in the switch statement
- Falls through to `default: return 'jade'`
- This may cause initialization issues with consciousness vessel display
- However, functionally should work since it defaults to 'jade'

#### Mode 2: 'emotional'
**Issue Location:** JournalEntry.tsx getModeVariant() function  
- **Problem:** Listed but may have initialization timing issues
- Maps to 'jade' variant
- Has dedicated prompt in JournalingPrompts.ts
- Explicitly validated in API (line 27)

#### Mode 3: 'direction'
**Issue Location:** JournalEntry.tsx getModeVariant() function
- **Problem:** Listed but may have state synchronization issues
- Maps to 'transcendent' variant
- Has dedicated prompt in JournalingPrompts.ts
- Explicitly validated in API (line 27)

---

## Part 3: Detailed State Flow Diagram

```
User Click on Gateway
        |
        v
ModeSelection.tsx: onClick handler
  - Creates ripple effect
  - setTimeout(() => setMode(mode), 300)
        |
        v
useMaiaStore.setMode(mode)
  - set({ selectedMode: mode, currentView: 'journal-entry' })
  - Logs state update
        |
        v
app/maia/page.tsx: renderView()
  - Checks: currentView === 'journal-entry'
  - Returns: <JournalEntry /> (or <VoiceJournaling /> if voice mode enabled)
        |
        v
JournalEntry Component
  - Destructures: selectedMode from store
  - Safety check: if (!selectedMode) return null
  - Calls: JOURNALING_MODE_DESCRIPTIONS[selectedMode]
  - Calls: getModeVariant(selectedMode)
        |
        v
Rendering:
  - Consciousness vessel with mode variant
  - Writing interface with mode-specific prompt
  - Submit button to send to /api/journal/analyze
        |
        v
API Submission
  - POST to /api/journal/analyze
  - Validates mode is in allowed list
  - Analyzes with Claude
  - Returns JournalingResponse
        |
        v
State Update: addEntry()
  - Adds to entries array
  - Sets currentView to 'reflection'
        |
        v
MaiaReflection Component
  - Displays the analysis
  - Shows symbols, archetypes, reflection
```

---

## Part 4: Root Cause Analysis

### Hypothesis 1: getModeVariant() Default Case
**Severity:** Low-Medium
**Affected Modes:** 'free' (missing explicit case)

The 'free' mode falls through to the default case in getModeVariant(). While this assigns 'jade' as the variant, it might not match the intended visual design for 'free' mode. However, this shouldn't break functionality - only appearance.

### Hypothesis 2: Mode String Inconsistency
**Severity:** Medium
**Potential Issue:** Type compatibility or string comparison

Check if mode values have any whitespace, casing, or type mismatches between:
- ModeSelection component (where mode is passed)
- Zustand store (where mode is stored)
- JournalEntry component (where mode is read)

### Hypothesis 3: Zustand Store Persistence
**Severity:** Medium
**Potential Issue:** State hydration timing

The store uses `persist` middleware:
```typescript
persist(
  (set) => ({ /* state */ }),
  {
    name: 'maia-storage',
    partialize: (state) => ({ entries: state.entries })  // <- Only persists entries!
  }
)
```

**Critical Finding:**
- The `partialize` function ONLY persists `entries`
- `selectedMode` and `currentView` are NOT persisted
- On page refresh/reload, these values reset to defaults
- This could cause issues if state hydration is slow

### Hypothesis 4: Timing Issues with 300ms Delay
**Severity:** Medium
**Potential Issue:** Race condition between view switch and mode selection

The flow has a 300ms delay before setting the mode:
```typescript
setTimeout(() => setMode(mode), 300);
```

If the view switches before the mode is set, the JournalEntry component sees:
- `currentView = 'journal-entry'` ✓
- `selectedMode = null` ✗
- Result: JournalEntry returns null (safety check at line 145)

---

## Part 5: Key Code Locations Summary

### Critical Files:

1. **State Management**
   - `/Users/soullab/MAIA-FRESH/apps/web/lib/maia/state.ts`
   - Lines 44-49: setMode() implementation
   - Lines 34-64: Full store definition with persistence config

2. **Mode Selection UI**
   - `/Users/soullab/MAIA-FRESH/apps/web/components/maia/ModeSelection.tsx`
   - Lines 104-109, 218-223: Click handlers with setTimeout
   - Lines 48-56: getModeVariant() function

3. **Journal Entry Component**
   - `/Users/soullab/MAIA-FRESH/apps/web/components/maia/JournalEntry.tsx`
   - Lines 15-16: Store destructuring
   - Line 145: Safety check (!selectedMode)
   - Lines 150-158: getModeVariant() function (missing 'free' case)

4. **Router/View Switcher**
   - `/Users/soullab/MAIA-FRESH/apps/web/app/maia/page.tsx`
   - Lines 59-74: renderView() switch statement

5. **API Backend**
   - `/Users/soullab/MAIA-FRESH/apps/web/app/api/journal/analyze/route.ts`
   - Lines 27-32: Mode validation
   - Lines 59-68: Claude analysis call

6. **Journaling Prompts**
   - `/Users/soullab/MAIA-FRESH/apps/web/lib/journaling/JournalingPrompts.ts`
   - Lines 204-229: JOURNALING_MODE_DESCRIPTIONS (all 5 modes defined)

---

## Part 6: Differences in Mode Handling

### ModeSelection.tsx getModeVariant() (Lines 48-56)
```
'shadow'    -> 'neural'
'dream'     -> 'mystical'
'emotional' -> 'jade'
'direction' -> 'transcendent'
default     -> 'jade'
```
**Missing:** explicit case for 'free'

### JournalEntry.tsx getModeVariant() (Lines 150-158)
```
'shadow'    -> 'neural'
'dream'     -> 'mystical'
'emotional' -> 'jade'
'direction' -> 'transcendent'
default     -> 'jade'
```
**Missing:** explicit case for 'free'

### Both components have IDENTICAL getModeVariant() functions
- This duplication suggests possible synchronization issues if one is updated but not the other
- 'free' mode is NOT explicitly handled in either location

---

## Part 7: The 'free' Mode Issue

Looking at the prompts file, 'free' mode IS defined with full specifications:

```typescript
free: {
  name: 'Free Expression',
  description: 'Stream of consciousness. No structure—just what wants to emerge.',
  prompt: 'What part of your story wants to be spoken today?'
}
```

But in JournalEntry getModeVariant():
```typescript
const getModeVariant = (mode: string) => {
  switch (mode) {
    case 'shadow': return 'neural';
    case 'dream': return 'mystical';
    case 'emotional': return 'jade';
    case 'direction': return 'transcendent';
    default: return 'jade';  // <- 'free' falls here, but maybe it needs its own variant?
  }
};
```

**Question:** Should 'free' have its own visual variant? The working modes each have explicit variants, but 'free' uses default. This could cause:
1. Visual consistency issues
2. Console errors if code expects specific variant types
3. Consciousness vessel display problems

---

## Summary of Findings

| Mode | Status | getModeVariant() Case | Visual Variant | API Validation | Prompt Defined |
|------|--------|----------------------|-----------------|-----------------|-----------------|
| free | BROKEN | DEFAULT (missing) | jade | ✓ | ✓ |
| dream | WORKING | EXPLICIT | mystical | ✓ | ✓ |
| emotional | BROKEN | EXPLICIT | jade | ✓ | ✓ |
| shadow | WORKING | EXPLICIT | neural | ✓ | ✓ |
| direction | BROKEN | EXPLICIT | transcendent | ✓ | ✓ |

---

## Recommended Investigation Points

1. **Check Browser Console**
   - Look for errors when clicking broken modes
   - Check for undefined/null reference errors
   - Watch for state mutation warnings

2. **Check Network Requests**
   - Verify API calls are being made for all 5 modes
   - Check request payloads for mode value
   - Check API response status codes

3. **Test State Persistence**
   - Clear localStorage and reload
   - Try setting mode immediately after page load
   - Verify selectedMode is actually being set in store

4. **Check for Type Mismatches**
   - Verify mode strings match exactly (case-sensitive)
   - Check for whitespace issues
   - Verify JournalingMode type accepts all 5 modes

5. **Visual Variant Issues**
   - 'free' mode missing explicit variant case might cause ConsciousnessVessel rendering issues
   - Check if 'transcendent' variant is properly implemented (used by 'direction')
