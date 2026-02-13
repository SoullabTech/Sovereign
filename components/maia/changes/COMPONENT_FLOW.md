# Member Changes Component Flow

Visual guide to the member-facing Changes experience.

## User Journey

```
[MAIA Page Header] → Click "Changes" icon
         ↓
┌────────────────────────────────────────────────────────────┐
│                     ChangesSheet                            │
│  (Bottom sheet container with internal navigation)         │
└────────────────────────────────────────────────────────────┘
         ↓
    [LIST VIEW]
         │
         ├─→ Click "Name a New Change"
         │        ↓
         │   ┌──────────────────────────────┐
         │   │    NameYourChange             │
         │   │  - Title input                │
         │   │  - Description textarea       │
         │   │  - Continue button            │
         │   └──────────────────────────────┘
         │        ↓
         │   ┌──────────────────────────────┐
         │   │  ChangeLandscapeVisual        │
         │   │  - 6 change type cards        │
         │   │  - Click to select & create   │
         │   └──────────────────────────────┘
         │        ↓
         │   [JOURNEY VIEW]
         │
         └─→ Click existing change card
                  ↓
            ┌─────────────────────────────────────────────────┐
            │              ChangeJourney                       │
            │  (Living timeline - the heart of the experience)│
            └─────────────────────────────────────────────────┘
                  │
                  ├─→ [Hexagram Section] (collapsible)
                  │    ├─ If not cast yet:
                  │    │   ┌──────────────────────────────┐
                  │    │   │  MemberHexagramCaster         │
                  │    │   │  - Method selector            │
                  │    │   │  - Cast button                │
                  │    │   │  - Skip option                │
                  │    │   └──────────────────────────────┘
                  │    │
                  │    └─ If cast:
                  │        ┌──────────────────────────────┐
                  │        │  MemberHexagramReading        │
                  │        │  - Reading                    │
                  │        │  - Guidance                   │
                  │        │  - Warnings                   │
                  │        │  - Timing                     │
                  │        │  - Changing lines             │
                  │        └──────────────────────────────┘
                  │
                  ├─→ [Council Result] (collapsible)
                  │    - Tensions identified
                  │    - Recommendation
                  │
                  ├─→ [Experience Timeline] (collapsible)
                  │    - Chronological list of all experiences
                  │    - Reflection, dream, synchronicity, etc.
                  │
                  └─→ [Action Buttons] (always visible)
                       - Add reflection (inline form)
                       - Record dream (shortcut)
                       - Note synchronicity (shortcut)
                       - Re-cast I Ching
                       - Ask MAIA for insight
```

## Component Dependencies

```
ChangesSheet (main container)
├── ChangeListView
│   └── HexagramGlyph
├── NameYourChange
├── ChangeLandscapeVisual
└── ChangeJourney
    ├── MemberHexagramCaster
    │   └── HexagramGlyph
    └── MemberHexagramReading
```

## State Management

```
ChangesSheet
  state:
    - view: 'list' | 'create' | 'journey'
    - createData: { title, description } | null

  handlers:
    - onStartCreate()
    - onNameNext(title, description)
    - onLandscapeSelect(changeType)
    - onSelectChange(changeId)
    - onBack()

ChangeJourney
  state:
    - change: ChangeRecord | null
    - showReading: boolean
    - showCouncil: boolean
    - showTimeline: boolean
    - showCaster: boolean
    - showExperienceForm: boolean
    - experienceType: ChangeExperienceType
    - experienceContent: string

  handlers:
    - fetchChange()
    - handleCastComplete(result)
    - handleRequestInterpretation()
    - handleAddExperience()
    - handleConsultCouncil()
```

## API Call Sequence

### Creating a New Change

```
1. User enters title + description
   → (local state)

2. User selects change type
   → POST /api/changes
   ← { change: { id, ... } }

3. Navigate to ChangeJourney
   → GET /api/changes/[id]
   ← { change: { ...full data } }

4. (Optional) Cast hexagram
   → POST /api/changes/[id]/cast
   ← { hexagramNumber, changingLines, ... }

5. (Optional) Request interpretation
   → POST /api/changes/[id]/interpret
   ← { hexagramInterpretation: { ... } }

6. Add experiences over time
   → POST /api/changes/[id]/experiences
   ← { experience: { id, ... } }

7. (Optional) Consult council
   → POST /api/changes/[id]/consult
   ← { councilResult: { tensions, recommendation } }
```

## Key Interactions

### Inline Experience Form

When "Add a reflection" is clicked:
1. Form expands with animation
2. Type selector grid appears (6 types)
3. Content textarea appears
4. Save button appears
5. Cancel button changes to "X"

Quick shortcuts:
- "Record dream" → Opens form with type pre-selected to 'dream'
- "Note sync" → Opens form with type pre-selected to 'synchronicity'

### Collapsible Sections

All major sections in ChangeJourney are collapsible:
- Click header to toggle
- ChevronUp/ChevronDown icon indicates state
- Smooth height animation
- State preserved during navigation

### Hexagram Casting

Casting flow:
1. Method selector (radio-style buttons)
2. Cast button with animation
3. Loading state with spinner
4. Result reveal with hexagram glyph
5. 1.5s delay for effect
6. Automatically calls onCast callback
7. Parent component refreshes change data

## Responsive Behavior

### Mobile (Default Target)
- Bottom sheet occupies max 90vh
- Sticky header with back button
- Scroll within sheet content area
- Safe area insets for notch/home bar

### Desktop
- Same bottom sheet pattern
- Centered horizontally
- Max width could be constrained (future enhancement)

## Accessibility

- Semantic HTML (buttons, labels, headers)
- ARIA labels on icons
- Keyboard navigation supported
- Focus management on sheet open
- Color contrast meets WCAG AA

## Animation Timing

- Sheet slide-up: Spring physics (damping: 25, stiffness: 300)
- View transitions: 0.2s opacity + x-translate
- Section collapse: Auto height with opacity
- Card stagger: 0.05s delay per item
- Button tap: Scale 0.98

## Error Handling

All API calls include:
- Try/catch blocks
- Console.error logging with context
- User-facing error messages (when critical)
- Graceful degradation (when optional)

Example:
```tsx
try {
  const response = await apiFetch('/api/changes');
  if (!response.ok) throw new Error('Failed to load');
  // ... success path
} catch (err) {
  console.error('[ChangeListView] Error:', err);
  setError('Failed to load changes');
}
```
