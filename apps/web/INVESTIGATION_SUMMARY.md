# MAIA Consciousness Gateway Investigation - Executive Summary

## Issue Description
User reports that 3 journaling modes are broken:
- 'free' (broken)
- 'emotional' (broken)
- 'direction' (broken)

While 2 modes work correctly:
- 'dream' (working)
- 'shadow' (working)

---

## Complete Flow Trace

### Step 1: Click Consciousness Gateway
**Location:** `ModeSelection.tsx` lines 104-109, 218-223

```typescript
onClick={(e) => {
  console.log('Consciousness Gateway Clicked:', mode);
  const rect = e.currentTarget.getBoundingClientRect();
  createConsciousnessRipple(rect.left + rect.width/2, rect.top + rect.height/2, mode);
  setTimeout(() => setMode(mode), 300);  // 300ms delay
}}
```

**What happens:**
- Visual ripple effect created
- State update delayed by 300ms (for animation)
- `setMode(mode)` called from Zustand store

---

### Step 2: State Update via Zustand
**Location:** `lib/maia/state.ts` lines 44-49

```typescript
setMode: (mode) => {
  console.log('setMode called with:', mode);
  set({
    selectedMode: mode,           // Sets the mode
    currentView: 'journal-entry'  // Switches to journal entry view
  });
}
```

**What happens:**
- `selectedMode` state updated to the clicked mode
- `currentView` state changes from 'mode-select' to 'journal-entry'
- Zustand triggers component re-renders

**State Persistence Note:**
- The store only persists `entries` to localStorage
- `selectedMode` and `currentView` are NOT persisted
- On page reload, both reset to initial values (null and 'mode-select')

---

### Step 3: View Routing
**Location:** `app/maia/page.tsx` lines 59-74

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

**What happens:**
- When `currentView === 'journal-entry'`, JournalEntry component is rendered
- JournalEntry expects `selectedMode` to be set (not null)

---

### Step 4: Journal Entry Component Initialization
**Location:** `components/maia/JournalEntry.tsx` lines 15-16, 145-160

```typescript
export default function JournalEntry() {
  const { selectedMode, currentEntry, setEntry, addEntry, ... } = useMaiaStore();
  // ...
  
  if (!selectedMode) return null;  // Safety check - critical!
  
  const modeInfo = JOURNALING_MODE_DESCRIPTIONS[selectedMode];
  
  const getModeVariant = (mode: string) => {
    switch (mode) {
      case 'shadow': return 'neural';
      case 'dream': return 'mystical';
      case 'emotional': return 'jade';
      case 'direction': return 'transcendent';
      default: return 'jade';  // 'free' falls through here
    }
  };
}
```

**What happens:**
- Component extracts `selectedMode` from store
- Safety check: if mode is null, returns null (renders nothing)
- Mode-specific prompt and visual variant are configured
- User sees journaling interface

---

### Step 5: Submit Entry to API
**Location:** `components/maia/JournalEntry.tsx` lines 105-143

```typescript
const handleSubmit = async () => {
  if (!currentEntry.trim() || !selectedMode) return;
  
  setProcessing(true);
  
  const prompt = getJournalingPrompt(selectedMode, {
    mode: selectedMode,
    entry: currentEntry
  });
  
  const response = await fetch('/api/journal/analyze', {
    method: 'POST',
    body: JSON.stringify({
      prompt,
      mode: selectedMode,  // Mode sent to API
      entry: currentEntry
    })
  });
  
  const reflection = await response.json();
  addEntry({ /* ... */ }); // Adds to entries, switches to reflection view
};
```

**What happens:**
- Entry submitted to `/api/journal/analyze`
- API analyzes with Claude using mode-specific prompt
- Response stored as reflection
- UI switches to reflection view to show results

---

### Step 6: Backend Analysis
**Location:** `app/api/journal/analyze/route.ts` lines 27-32

```typescript
if (!mode || !['free', 'dream', 'emotional', 'shadow', 'direction'].includes(mode)) {
  return NextResponse.json(
    { error: 'Valid journaling mode is required' },
    { status: 400 }
  );
}
```

**What happens:**
- API validates that mode is one of 5 supported modes
- All 5 modes are explicitly listed and accepted
- Claude analysis is performed
- Response returned to frontend

---

## Key Findings

### 1. Missing getModeVariant() Case for 'free'
**Severity:** Low (visual only, not functional)

The `getModeVariant()` function in JournalEntry.tsx is missing an explicit case for 'free':

```typescript
const getModeVariant = (mode: string) => {
  switch (mode) {
    case 'shadow': return 'neural';
    case 'dream': return 'mystical';
    case 'emotional': return 'jade';
    case 'direction': return 'transcendent';
    default: return 'jade';  // <- 'free' falls through here
  }
};
```

**Impact:**
- 'free' mode uses the default 'jade' variant
- Could cause visual inconsistency
- Shouldn't break functionality
- Suggests an incomplete implementation

---

### 2. Identical getModeVariant() in Two Components
**Severity:** Medium (code smell, maintenance risk)

Both `ModeSelection.tsx` and `JournalEntry.tsx` have identical `getModeVariant()` functions.

**Impact:**
- If one is updated, the other must be updated too
- Increases chance of bugs if they diverge
- Should be extracted to shared utility

---

### 3. State Not Persisted
**Severity:** Low (expected behavior)

The Zustand store only persists `entries`:
```typescript
partialize: (state) => ({ entries: state.entries })
```

**Impact:**
- `selectedMode` and `currentView` reset on page reload
- This is likely intentional (clean state for new user)
- Could be confusing if user expects to continue where they left off

---

### 4. 300ms Timing Delay
**Severity:** Low (defensive, intentional)

Click handler waits 300ms before calling `setMode()`:
```typescript
setTimeout(() => setMode(mode), 300);
```

**Impact:**
- Allows time for visual ripple animation
- If there's a race condition, this could expose it
- Generally a good UX practice

---

## Hypothesis: What's Causing the Failures?

Based on the code analysis, here are the most likely causes (in order of probability):

### Hypothesis 1: Race Condition with State Persistence (LIKELY)
The broken modes ('free', 'emotional', 'direction') might be experiencing a race condition:

1. Page loads with `selectedMode = null`
2. User clicks mode
3. 300ms delay occurs
4. Meanwhile, Zustand rehydration happens
5. `selectedMode` might get overwritten or reset

**Fix:** Check if state hydration is interfering with mode setting

---

### Hypothesis 2: Missing 'free' Case in getModeVariant() (POSSIBLE)
The 'free' mode falling through to default might cause:
- Consciousness vessel not rendering correctly
- Type errors in child components expecting specific variants
- Visual glitches that break interaction

**Fix:** Add explicit case for 'free' mode

---

### Hypothesis 3: ConsciousnessVessel Component Issue (POSSIBLE)
The variant prop might have different handling for different values:
- 'neural' (shadow) - works
- 'mystical' (dream) - works
- 'jade' (emotional, free) - broken?
- 'transcendent' (direction) - broken?

**Fix:** Check ConsciousnessVessel implementation for variant handling

---

### Hypothesis 4: Mode String Mismatch (UNLIKELY)
There could be whitespace, casing, or type issues:
- Mode value might have extra spaces
- Case sensitivity mismatch
- Type casting error

**Fix:** Add console logging to verify mode values match

---

## Files to Investigate

### Priority 1: Critical
1. `/Users/soullab/MAIA-FRESH/apps/web/lib/maia/state.ts` - State management
2. `/Users/soullab/MAIA-FRESH/apps/web/components/maia/JournalEntry.tsx` - Component where break occurs
3. `/Users/soullab/MAIA-FRESH/apps/web/components/consciousness/ConsciousnessVessel.tsx` - Rendering variant handling

### Priority 2: Important
4. `/Users/soullab/MAIA-FRESH/apps/web/components/maia/ModeSelection.tsx` - Gateway click handler
5. `/Users/soullab/MAIA-FRESH/apps/web/app/maia/page.tsx` - View routing
6. `/Users/soullab/MAIA-FRESH/apps/web/app/api/journal/analyze/route.ts` - Backend validation

### Priority 3: Reference
7. `/Users/soullab/MAIA-FRESH/apps/web/lib/journaling/JournalingPrompts.ts` - Prompt definitions

---

## Recommended Next Steps

### 1. Immediate Diagnostics
- [ ] Open browser DevTools and watch network tab
- [ ] Click each mode one at a time
- [ ] Check for any 400/500 API errors
- [ ] Check browser console for JavaScript errors
- [ ] Verify selectedMode state is actually being set

### 2. Add Debug Logging
```typescript
// In JournalEntry.tsx
useEffect(() => {
  console.log('JournalEntry mounted with selectedMode:', selectedMode);
  return () => console.log('JournalEntry unmounting');
}, [selectedMode]);
```

### 3. Test State Transitions
- [ ] Clear localStorage: `localStorage.clear()`
- [ ] Click 'free' mode, verify state change in React DevTools
- [ ] Compare state between working ('dream') and broken ('free') modes

### 4. Check ConsciousnessVessel Component
- [ ] Verify 'jade' and 'transcendent' variants are implemented
- [ ] Check if variant prop validation is too strict
- [ ] Look for console warnings from that component

### 5. Add Missing getModeVariant Case
Add explicit case for 'free' mode:
```typescript
const getModeVariant = (mode: string) => {
  switch (mode) {
    case 'free': return 'jade';              // <- Add explicit case
    case 'shadow': return 'neural';
    case 'dream': return 'mystical';
    case 'emotional': return 'jade';
    case 'direction': return 'transcendent';
    default: return 'jade';
  }
};
```

---

## Test Plan

Once issues are identified and fixed:

1. **Smoke Test**: Click each of the 5 modes and verify journal interface appears
2. **Functional Test**: Write entry in each mode and submit
3. **Visual Test**: Verify consciousness vessel appears with correct variant
4. **State Test**: Check Redux DevTools/React DevTools to verify state changes
5. **API Test**: Check network tab to verify API calls are sent with correct mode
6. **Persistence Test**: Reload page and verify state behavior

---

## Documentation Generated

I've created two detailed analysis documents in your project:

1. **CONSCIOUSNESS_GATEWAY_ANALYSIS.md** (13KB)
   - Complete flow breakdown
   - Root cause analysis with 4 hypotheses
   - Comparison of working vs broken modes
   - State persistence issues
   - Investigation points

2. **CODE_FLOW_REFERENCE.md** (14KB)
   - Quick navigation map
   - Code snippets for each step
   - Timing diagram
   - Mode flow completeness check
   - API endpoint details

Both files are saved in `/Users/soullab/MAIA-FRESH/apps/web/`

---

## Summary

The flow from consciousness gateway click to journaling interface is:

1. Click consciousness gateway (ModeSelection.tsx)
2. Call setMode() with 300ms delay (state.ts)
3. Switch view to 'journal-entry' (renderView in page.tsx)
4. Load JournalEntry component (gets selectedMode from store)
5. Display journal interface with mode-specific prompt
6. Submit to API (validate mode, analyze with Claude)
7. Store reflection and switch to reflection view

**Key Issue:** The 'free' mode is missing an explicit case in getModeVariant() functions. The 'emotional' and 'direction' modes might have rendering issues with their respective variants ('jade' and 'transcendent') in the ConsciousnessVessel component.

**Most Likely Root Cause:** Either a variant rendering issue in ConsciousnessVessel, or a race condition with state persistence/hydration timing.

