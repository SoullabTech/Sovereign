# Member Changes Components

Member-facing bottom sheet interface for navigating life transitions with optional MAIA support.

## Philosophy

The member owns the chain — they can keep iterating with or without MAIA's support. MAIA enriches when invited but the thread never depends on MAIA.

## Components

### `ChangesSheet`
Main bottom sheet container with internal navigation state.

**Props:**
- `isOpen: boolean` - Sheet visibility
- `onClose: () => void` - Close handler
- `memberId: string` - Member UUID
- `memberName?: string` - Member display name

**Views:**
- `list` - ChangeListView (all changes)
- `create` - Multi-step creation flow (NameYourChange → ChangeLandscapeVisual)
- `journey` - ChangeJourney (single change detail + timeline)

### `ChangeListView`
List of member's changes with create button.

**Features:**
- Fetch from `GET /api/changes`
- Show hexagram glyphs when cast
- Status badges
- Experience count
- Empty state guidance

### `NameYourChange`
Step 1 of creation: Name the transition.

**Fields:**
- Title (100 char max)
- Description (freeform)

**UX:**
- Invitational, not form-like
- Auto-focus title field
- Continue disabled until both filled

### `ChangeLandscapeVisual`
Step 2: Visual change type selector.

**Change Types:**
- `dissolution` (water) - Something ending
- `emergence` (sprout) - Something new rising
- `threshold` (door) - At a crossing point
- `integration` (merge) - Things coming together
- `upheaval` (zap) - Ground shaking
- `ripening` (sun) - Reaching fullness

Creates change via `POST /api/changes` on selection.

### `MemberHexagramCaster`
Optional I Ching casting interface.

**Methods:**
- Yarrow Stalks (contemplative)
- Three Coins (traditional)
- Browse hexagrams (search)

**API:** `POST /api/changes/[id]/cast`

**UX:**
- Animated casting state
- Result reveal with hexagram glyph
- Skip option always available

### `MemberHexagramReading`
MAIA's interpretation of the hexagram.

**Sections:**
- Reading (what the hexagram speaks)
- Guidance (for this specific change)
- Warnings (what to watch for)
- Timing (when/how)
- Changing lines (transformation points)
- Relating hexagram (where this leads)

**API:** `POST /api/changes/[id]/interpret`

**UX:**
- Request button if not interpreted yet
- Warm, invitational tone
- Footer note: "This is MAIA's reflection, not truth"

### `ChangeJourney`
The living timeline — heart of the member experience.

**Sections (collapsible):**
- Hexagram Reading (if cast)
- Council Result (if consulted)
- Experience Timeline (chronological)

**Actions:**
- Add reflection (inline form with type selector)
- Record dream (shortcut)
- Note synchronicity (shortcut)
- Re-cast I Ching
- Ask MAIA for insight

**Experience Types:**
- `reflection` - Personal insight
- `field_event` - External occurrence
- `breakthrough` - Major shift
- `setback` - Challenge/difficulty
- `dream` - Dream content
- `synchronicity` - Meaningful coincidence

**APIs:**
- `GET /api/changes/[id]` - Full change data
- `POST /api/changes/[id]/experiences` - Add experience
- `POST /api/changes/[id]/consult` - Council consultation
- `POST /api/changes/[id]/cast` - Re-cast hexagram
- `POST /api/changes/[id]/interpret` - Hexagram interpretation

## Usage Example

```tsx
import { ChangesSheet } from '@/components/maia/changes';

function MAIAPage() {
  const [showChanges, setShowChanges] = useState(false);
  const memberId = 'uuid-here';

  return (
    <>
      <button onClick={() => setShowChanges(true)}>
        Open Changes
      </button>

      <ChangesSheet
        isOpen={showChanges}
        onClose={() => setShowChanges(false)}
        memberId={memberId}
        memberName="Explorer"
      />
    </>
  );
}
```

## Design Patterns

### Bottom Sheet
- Follows `QuickJournalSheet` pattern
- Dark backdrop with blur
- Slide-up animation (spring physics)
- Handle bar indicator
- Safe area insets for mobile

### Colors by Change Type
- Dissolution: Blue (water, ending)
- Emergence: Cyan (new life)
- Threshold: Purple (liminality)
- Integration: Emerald (synthesis)
- Upheaval: Red (intensity)
- Ripening: Amber (maturation)

### Experience Type Icons
- `BookOpen` - reflection
- `Eye` - field_event
- `Star` - breakthrough
- `TrendingDown` - setback
- `Moon` - dream
- `Sparkles` - synchronicity

### State Management
- Local component state (no global store)
- Fetch on mount, refetch after mutations
- Optimistic UI where safe
- Loading states for all async actions

## API Routes

All routes are member-scoped (require authentication).

### List Changes
```
GET /api/changes?status=active&limit=50
```

### Create Change
```
POST /api/changes
{
  "title": "Leaving my job",
  "description": "I've decided to leave...",
  "changeType": "threshold",
  "urgency": "medium"
}
```

### Get Change Detail
```
GET /api/changes/[id]
```

### Cast Hexagram
```
POST /api/changes/[id]/cast
{ "method": "coin" | "yarrow" }
```

### Interpret Hexagram
```
POST /api/changes/[id]/interpret
```

### Add Experience
```
POST /api/changes/[id]/experiences
{
  "experienceType": "reflection",
  "content": "I noticed today...",
  "element": "water"
}
```

### Consult Council
```
POST /api/changes/[id]/consult
```

## Sovereignty Notes

1. **Member Owns the Chain**
   - All data belongs to the member
   - MAIA enriches when invited, never required
   - No change is "incomplete" without MAIA's input

2. **Consent at Every Step**
   - Hexagram casting is optional
   - Interpretation is optional
   - Council consultation is optional
   - Member can iterate indefinitely

3. **No Judgment**
   - No "right" or "wrong" change types
   - No pressure to resolve or complete
   - Status changes reflect state, not progress

4. **Privacy**
   - All experiences are private to the member
   - No sharing or social features
   - Change data never used for training

## Testing

```bash
# Type check
npm run typecheck

# Check sovereignty compliance
npm run check:no-supabase

# Full preflight
npm run preflight
```

## File Structure

```
components/maia/changes/
├── ChangesSheet.tsx              # Main container
├── ChangeListView.tsx            # List view
├── NameYourChange.tsx            # Step 1: Name
├── ChangeLandscapeVisual.tsx     # Step 2: Type selector
├── MemberHexagramCaster.tsx      # I Ching casting
├── MemberHexagramReading.tsx     # Interpretation display
├── ChangeJourney.tsx             # Living timeline
├── index.ts                      # Exports
└── README.md                     # This file
```
