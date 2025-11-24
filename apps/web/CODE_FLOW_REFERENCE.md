# MAIA Consciousness Gateway - Code Flow Reference

## Quick Navigation Map

```
User Interaction
    |
    └─> ModeSelection.tsx (click handler)
        └─> useMaiaStore.setMode()
            └─> state.ts (Zustand store)
                └─> app/maia/page.tsx (renderView)
                    └─> JournalEntry.tsx OR VoiceJournaling.tsx
                        └─> /api/journal/analyze (backend)
```

---

## 1. Initial State Definition

**File:** `/Users/soullab/MAIA-FRESH/apps/web/lib/maia/state.ts`

```typescript
export interface MaiaState {
  currentView: 'mode-select' | 'journal-entry' | 'reflection' | 'timeline' | 'search';
  selectedMode: JournalingMode | null;        // <- Can be null initially
  currentEntry: string;
  entries: JournalEntry[];
  isProcessing: boolean;
  searchQuery: string;

  setView: (view: MaiaState['currentView']) => void;
  setMode: (mode: JournalingMode) => void;    // <- KEY FUNCTION
  setEntry: (content: string) => void;
  addEntry: (entry: JournalEntry) => void;
  setProcessing: (processing: boolean) => void;
  setSearchQuery: (query: string) => void;
  resetEntry: () => void;
}

export const useMaiaStore = create<MaiaState>()(
  persist(
    (set) => ({
      currentView: 'mode-select',              // <- Starts at mode-select
      selectedMode: null,                      // <- Starts as null
      currentEntry: '',
      entries: [],
      isProcessing: false,
      searchQuery: '',

      setView: (view) => set({ currentView: view }),
      setMode: (mode) => {
        console.log('setMode called with:', mode);
        set({
          selectedMode: mode,                  // <- Sets the mode
          currentView: 'journal-entry'         // <- AND switches view
        });
        console.log('State updated to:', { selectedMode: mode, currentView: 'journal-entry' });
      },
      // ... other functions ...
    }),
    {
      name: 'maia-storage',
      partialize: (state) => ({
        entries: state.entries               // <- ONLY entries persisted!
      })                                       // <- currentView and selectedMode NOT persisted
    }
  )
);
```

---

## 2. Gateway Click Handler

**File:** `/Users/soullab/MAIA-FRESH/apps/web/components/maia/ModeSelection.tsx`

### First Row of Modes (lines 94-205)
```typescript
{modes.slice(0, 3).map((mode, index) => {
  const modeInfo = JOURNALING_MODE_DESCRIPTIONS[mode];
  return (
    <div key={mode}>
      <ConsciousnessVessel
        title={modeInfo.name}
        subtitle="consciousness gateway"
        variant={getModeVariant(mode)}        // <- Visual variant lookup
        depth="profound"
        onClick={(e) => {
          console.log('Consciousness Gateway Clicked:', mode);
          const rect = e.currentTarget.getBoundingClientRect();
          createConsciousnessRipple(rect.left + rect.width/2, rect.top + rect.height/2, mode);
          setTimeout(() => setMode(mode), 300); // <- 300ms DELAY before state update!
        }}
        className="cursor-pointer transition-all duration-500 hover:scale-105"
      >
        {/* Consciousness vessel content */}
      </ConsciousnessVessel>
    </div>
  );
})}
```

### getModeVariant Function (lines 48-56)
```typescript
const getModeVariant = (mode: JournalingMode) => {
  switch (mode) {
    case 'shadow': return 'neural';
    case 'dream': return 'mystical';
    case 'emotional': return 'jade';
    case 'direction': return 'transcendent';
    default: return 'jade';                  // <- 'free' falls through here
  }
};
```

**Modes in this.modes array (line 23):**
```typescript
const modes: JournalingMode[] = ['free', 'dream', 'emotional', 'shadow', 'direction'];
```

---

## 3. View Routing

**File:** `/Users/soullab/MAIA-FRESH/apps/web/app/maia/page.tsx`

```typescript
export default function MaiaPage() {
  const { currentView, setView, entries } = useMaiaStore();
  const [useVoiceMode, setUseVoiceMode] = useState(false);
  
  // ... state initialization ...

  const renderView = () => {
    switch (currentView) {
      case 'mode-select':
        return <ModeSelection />;              // <- Gateway selection screen
      
      case 'journal-entry':
        return useVoiceMode
          ? <VoiceJournaling />               // <- Uses selectedMode from store
          : <JournalEntry />;                 // <- Uses selectedMode from store
      
      case 'reflection':
        return <MaiaReflection />;             // <- Shows analysis results
      
      case 'timeline':
        return <TimelineView />;               // <- Shows all entries
      
      case 'search':
        return <SemanticSearch />;             // <- Search interface
      
      default:
        return <ModeSelection />;
    }
  };

  return (
    <SoulfulAppShell userId={userId}>
      <div className="min-h-screen bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night">
        <main className="py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderView()}                  // <- Renders selected view
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </SoulfulAppShell>
  );
}
```

---

## 4. Journal Entry Component

**File:** `/Users/soullab/MAIA-FRESH/apps/web/components/maia/JournalEntry.tsx`

### Component Initialization (lines 15-20)
```typescript
export default function JournalEntry() {
  const {
    selectedMode,        // <- Extracted from Zustand store
    currentEntry,
    setEntry,
    addEntry,
    setProcessing,
    isProcessing,
    resetEntry
  } = useMaiaStore();

  const [wordCount, setWordCount] = useState(0);
  const [isWriting, setIsWriting] = useState(false);
  const [consciousnessLevel, setConsciousnessLevel] = useState(0);
  // ... more state ...
```

### Safety Check (line 145)
```typescript
if (!selectedMode) return null;  // <- CRITICAL: If no mode, render nothing
```

This safety check is hit when:
- `selectedMode` is still `null` on render
- Prevents console errors from accessing `JOURNALING_MODE_DESCRIPTIONS[null]`

### Mode Variant Function (lines 150-158)
```typescript
const getModeVariant = (mode: string) => {
  switch (mode) {
    case 'shadow': return 'neural';
    case 'dream': return 'mystical';
    case 'emotional': return 'jade';
    case 'direction': return 'transcendent';
    default: return 'jade';                  // <- 'free' gets 'jade' variant
  }
};

const modeVariant = getModeVariant(selectedMode);
```

### Form Submission Handler (lines 105-143)
```typescript
const handleSubmit = async () => {
  if (!currentEntry.trim() || !selectedMode) return;

  setProcessing(true);

  try {
    const prompt = getJournalingPrompt(selectedMode, {
      mode: selectedMode,
      entry: currentEntry
    });

    const response = await fetch('/api/journal/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        mode: selectedMode,                  // <- Mode sent to API
        // ... other data ...
      })
    });

    if (!response.ok) throw new Error('Failed to analyze');

    const reflection = await response.json();

    addEntry({
      id: Date.now().toString(),
      userId: 'current-user',
      mode: selectedMode,                    // <- Mode stored in entry
      content: currentEntry,
      reflection,
      timestamp: new Date(),
      wordCount,
      isVoice: false
    });                                      // <- Triggers currentView -> 'reflection'
  } catch (error) {
    console.error('Failed to submit entry:', error);
    setProcessing(false);
  }
};
```

---

## 5. API Endpoint

**File:** `/Users/soullab/MAIA-FRESH/apps/web/app/api/journal/analyze/route.ts`

### Request Parsing & Validation (lines 12-32)
```typescript
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const sessionId = `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { entry, mode, userId, soulprint } = await req.json();
    const requestUserId = userId || 'demo-user';

    if (!entry || typeof entry !== 'string') {
      return NextResponse.json(
        { error: 'Journal entry is required and must be a string' },
        { status: 400 }
      );
    }

    // <- MODE VALIDATION (CRITICAL)
    if (!mode || !['free', 'dream', 'emotional', 'shadow', 'direction'].includes(mode)) {
      return NextResponse.json(
        { error: 'Valid journaling mode is required' },
        { status: 400 }
      );
    }
```

All 5 modes are explicitly listed in the API validation.

### Claude Analysis (lines 59-68)
```typescript
const analysisResult = await claudeBridge.analyzeEntry({
  entry,
  mode: mode as JournalingMode,            // <- Type cast happens here
  userId,
  previousContext: {
    recentSymbols,
    recentArchetypes,
    sessionCount
  }
});
```

### Successful Response (lines 194-202)
```typescript
return NextResponse.json({
  success: true,
  mode,
  entry,
  reflection: journalingResponse,
  sentiment: analysis.sentiment,
  maiaTone: analysis.maiaTone,
  timestamp: new Date().toISOString()
});
```

---

## 6. Reflection Component

**File:** `/Users/soullab/MAIA-FRESH/apps/web/components/maia/MaiaReflection.tsx`

```typescript
export default function MaiaReflection() {
  const { entries, setView, resetEntry } = useMaiaStore();
  const latestEntry = entries[0];            // <- Gets most recent entry
  const [ainInsight, setAinInsight] = useState<any>(null);

  useEffect(() => {
    async function loadInsight() {
      try {
        const insight = await ainClient.getCollectiveInsight(
          'current-user',
          latestEntry?.content || ''
        );
        setAinInsight(insight);
      } catch (error) {
        console.error('Failed to load AIN insight:', error);
      } finally {
        setLoadingInsight(false);
      }
    }

    if (latestEntry) {
      loadInsight();
    }
  }, [latestEntry]);

  if (!latestEntry || !latestEntry.reflection) {
    return null;                              // <- Safety check
  }

  const handleContinue = () => {
    resetEntry();                             // <- Clears entry, goes back to 'mode-select'
  };

  return (
    <motion.div /* ... display reflection ... */>
      <MaiaReflector
        reflection={latestEntry.reflection}  // <- The API response
        mode={latestEntry.mode}               // <- The journaling mode
      />
    </motion.div>
  );
}
```

---

## 7. Journaling Prompts Definition

**File:** `/Users/soullab/MAIA-FRESH/apps/web/lib/journaling/JournalingPrompts.ts`

```typescript
export type JournalingMode = 'free' | 'dream' | 'emotional' | 'shadow' | 'direction';

export const JOURNALING_MODE_DESCRIPTIONS = {
  free: {
    name: 'Free Expression',
    description: 'Stream of consciousness. No structure—just what wants to emerge.',
    prompt: 'What part of your story wants to be spoken today?'
  },
  dream: {
    name: 'Dream Integration',
    description: 'Explore the symbolic language of your dreams and unconscious.',
    prompt: 'Tell me about the dream that is lingering with you...'
  },
  emotional: {
    name: 'Emotional Processing',
    description: 'Name, hold, and process emotions with compassion.',
    prompt: 'What emotion is asking for your attention right now?'
  },
  shadow: {
    name: 'Shadow Work',
    description: 'Explore hidden aspects, tensions, or uncomfortable truths gently.',
    prompt: 'What part of yourself are you ready to look at more honestly?'
  },
  direction: {
    name: 'Life Direction',
    description: 'Clarify next steps, purpose, and alignment with your deeper path.',
    prompt: 'What question about your path is calling for clarity?'
  }
};
```

All 5 modes are properly defined here.

---

## State Persistence Issue

The store uses:
```typescript
partialize: (state) => ({ entries: state.entries })
```

This means:
- `entries`: PERSISTED to localStorage ✓
- `selectedMode`: NOT persisted (resets to null) ✗
- `currentView`: NOT persisted (resets to 'mode-select') ✗

On page reload:
1. Component mounts
2. Store initializes with persisted data (only entries)
3. selectedMode is null, currentView is 'mode-select'
4. User must click gateway again to select mode

---

## Timing Diagram

```
t=0ms: User clicks consciousness gateway
       └─> onClick handler triggered

t=0ms: Visual ripple created
       └─> createConsciousnessRipple() called

t=0ms: setTimeout queued
       └─> Will execute at t=300ms

t=0-299ms: Component still shows ModeSelection
           └─> currentView still 'mode-select'
           └─> selectedMode still null

t=300ms: setTimeout fires
         └─> setMode(mode) called
         └─> Zustand state updates:
             - selectedMode = mode
             - currentView = 'journal-entry'

t=300-305ms: React re-render
             └─> renderView() sees currentView === 'journal-entry'
             └─> Returns <JournalEntry /> component

t=305ms+: JournalEntry renders
          └─> selectedMode is now set (not null)
          └─> Safety check passes
          └─> Component displays journal interface
```

---

## Mode Flow Completeness Check

| Step | Free | Dream | Emotional | Shadow | Direction |
|------|------|-------|-----------|--------|-----------|
| In modes array | ✓ | ✓ | ✓ | ✓ | ✓ |
| Click handler | ✓ | ✓ | ✓ | ✓ | ✓ |
| setMode() | ✓ | ✓ | ✓ | ✓ | ✓ |
| getModeVariant() case | ✗ | ✓ | ✓ | ✓ | ✓ |
| JOURNALING_MODE_DESCRIPTIONS | ✓ | ✓ | ✓ | ✓ | ✓ |
| API validation | ✓ | ✓ | ✓ | ✓ | ✓ |
| Journaling prompt | ✓ | ✓ | ✓ | ✓ | ✓ |

**Key Finding:** Only 'free' mode is missing an explicit case in getModeVariant()

