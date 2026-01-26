# MAIA UI Enhancement Plan: Cowork-Inspired Patterns

## Vision
Bring Claude Cowork's clean, focused UI patterns to MAIA while preserving MAIA's sacred/sovereign aesthetic.

---

## 1. Mode Switching (Talk | Care | Note)

### Current State
- Modes defined in code (`dialogue`, `counsel`, `scribe`) with detailed voice specs
- No visible UI toggle in main conversation - defaults to `dialogue`
- MayaModeToggle exists but for different modes (witness/muse/creative)

### Proposed: Top Tab Bar

```
┌─────────────────────────────────────────┐
│     Talk    │    Care    │    Note      │
│   ───────      ·         ·              │
└─────────────────────────────────────────┘
```

**Design Specs:**
- Horizontal tab bar at top of conversation (below header)
- Clean underline indicator for active mode
- Subtle icons optional: 💬 Talk | 🤲 Care | 📝 Note
- Transition animation: 200ms ease-out slide

**Color Palette (dark mode):**
- Background: `#0D0D0D` (void)
- Active tab: `#D4B896` (maia gold) with underline
- Inactive tabs: `rgba(255,255,255,0.5)`
- Hover: `rgba(255,255,255,0.7)`

**Component: `ModeTabBar.tsx`**
```typescript
interface ModeTabBarProps {
  mode: 'dialogue' | 'counsel' | 'scribe';
  onModeChange: (mode: 'dialogue' | 'counsel' | 'scribe') => void;
}

const MODES = [
  { id: 'dialogue', label: 'Talk', icon: MessageCircle },
  { id: 'counsel', label: 'Care', icon: Heart },
  { id: 'scribe', label: 'Note', icon: FileText },
];
```

**Integration Points:**
- Add to `OracleConversation.tsx` below header
- Replace hardcoded `realtimeMode: 'dialogue'` with state
- Persist to localStorage: `maia_interaction_mode`

---

## 2. Personal Preferences Panel

### Current State
- QuickSettingsSheet has settings but buried in bottom sheet
- No prominent "What should MAIA consider?" input
- Preferences scattered across multiple panels

### Proposed: Preferences Section in Settings

**Claude Pattern:**
```
┌─────────────────────────────────────────┐
│ What should MAIA consider in responses? │
│ Your preferences apply to all sessions  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ e.g., I prefer direct feedback,     │ │
│ │ avoid therapy-speak, call me Kelly  │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Design Specs:**
- Prominent textarea with placeholder examples
- Saves to member profile (database-backed)
- Injected into system prompt for all conversations
- Character limit: 500 chars

**Storage:**
- localStorage: `maia_personal_preferences`
- Database: `member_settings.personal_preferences` (new column)
- Sync: Upload on save, download on login

**Component: `PersonalPreferencesInput.tsx`**
```typescript
interface PersonalPreferencesInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  maxLength?: number;
}
```

---

## 3. Session/Task Sidebar

### Current State
- SacredLabDrawer is bottom sheet (tools menu)
- Session history exists but not prominently surfaced
- No "recent conversations" quick access

### Proposed: Left Sidebar (Desktop) / Drawer Header (Mobile)

**Desktop Layout:**
```
┌──────────────┬──────────────────────────────┐
│ + New        │                              │
│              │                              │
│ Recent       │                              │
│ ─────────    │      Main Conversation       │
│ • Today 2pm  │                              │
│   Shadow...  │                              │
│              │                              │
│ • Yesterday  │                              │
│   Career...  │                              │
│              │                              │
│ ─────────    │                              │
│ Sessions     │                              │
│ run locally  │                              │
└──────────────┴──────────────────────────────┘
```

**Mobile:**
- Collapse into drawer header or swipe-right panel
- "+ New conversation" as floating action button

**Design Specs:**
- Width: 240px (collapsible to 64px icons-only)
- Background: `#0A0A0A` with subtle border
- Sessions show: timestamp, first line preview, elemental color dot
- Active session highlighted with gold accent
- Max 10 recent sessions displayed

**Data Structure:**
```typescript
interface SessionPreview {
  id: string;
  startTime: Date;
  preview: string; // First 50 chars of conversation
  dominantElement: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  messageCount: number;
  mode: 'dialogue' | 'counsel' | 'scribe';
}
```

**Component: `SessionSidebar.tsx`**
```typescript
interface SessionSidebarProps {
  sessions: SessionPreview[];
  activeSessionId: string | null;
  onSessionSelect: (id: string) => void;
  onNewSession: () => void;
  collapsed?: boolean;
}
```

---

## 4. Clean Dark Aesthetic

### Current State
- Dark theme exists but varies across components
- Some areas have heavy gradients/effects
- Inconsistent opacity levels

### Proposed: Unified Dark Theme

**Color System:**
```css
:root {
  /* Base */
  --void: #0A0A0A;
  --surface: #141414;
  --elevated: #1A1A1A;
  --border: rgba(255, 255, 255, 0.08);

  /* Text */
  --text-primary: rgba(255, 255, 255, 0.92);
  --text-secondary: rgba(255, 255, 255, 0.6);
  --text-tertiary: rgba(255, 255, 255, 0.4);

  /* Accent */
  --maia-gold: #D4B896;
  --maia-gold-dim: rgba(212, 184, 150, 0.5);

  /* Mode Colors */
  --mode-talk: #8B9DC3;    /* Soft blue */
  --mode-care: #C49BBB;    /* Soft rose */
  --mode-note: #9BC49B;    /* Soft sage */
}
```

**Typography:**
- Font: System UI stack (SF Pro on iOS, default on others)
- Sizes: 13px (small), 15px (body), 17px (title), 24px (header)
- Weight: 400 (body), 500 (emphasis), 600 (headers)

**Spacing:**
- Base unit: 4px
- Standard padding: 16px (4 units)
- Section gaps: 24px (6 units)

**Effects:**
- Minimal shadows (only on elevated surfaces)
- Subtle borders over gradients
- Backdrop blur: 12px max (not overused)

---

## 5. Implementation Phases

### Phase 1: Mode Tab Bar (Quick Win)
1. Create `ModeTabBar.tsx` component
2. Add state to OracleConversation
3. Persist mode to localStorage
4. Wire up voice instruction switching

**Files to modify:**
- `components/ui/ModeTabBar.tsx` (new)
- `components/OracleConversation.tsx`
- `lib/preferences/interaction-mode-preference.ts` (new)

### Phase 2: Personal Preferences
1. Create `PersonalPreferencesInput.tsx`
2. Add to MaiaSettingsPanel
3. Add database column
4. Inject into system prompt

**Files to modify:**
- `components/settings/PersonalPreferencesInput.tsx` (new)
- `components/MaiaSettingsPanel.tsx`
- `database/migrations/YYYYMMDD_personal_preferences.sql` (new)
- `lib/maia/systemPrompt.ts`

### Phase 3: Session Sidebar
1. Create `SessionSidebar.tsx`
2. Build session preview API
3. Add to main layout (desktop)
4. Mobile drawer integration

**Files to modify:**
- `components/navigation/SessionSidebar.tsx` (new)
- `app/maia/layout.tsx`
- `app/api/sessions/recent/route.ts` (new)
- `lib/session/SessionPersistence.ts`

### Phase 4: Dark Theme Polish
1. Create unified CSS variables
2. Audit and update components
3. Reduce gradient overuse
4. Consistent border/shadow system

**Files to modify:**
- `app/globals.css`
- `tailwind.config.ts`
- Various components (audit list TBD)

---

## 6. Design Principles

1. **Clarity over decoration** - Remove visual noise, let content breathe
2. **Mode as context** - User always knows which mode they're in
3. **Preferences as power** - Easy access to customize MAIA's behavior
4. **History as continuity** - Quick access to resume previous threads
5. **Dark as default** - Respect the sacred/contemplative space

---

## 7. Reference Screenshots

Claude Cowork patterns to emulate:
- Clean top navigation (Chat | Cowork | Code)
- Left sidebar with recent tasks
- Preferences textarea with clear description
- Minimal color palette (mostly grayscale + accent)
- Consistent spacing and typography
