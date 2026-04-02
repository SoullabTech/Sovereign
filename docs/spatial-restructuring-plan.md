# MAIA Spatial Restructuring Plan

> Navigation reduction, de-duplication, and component architecture proposal.
> Based on: completed UI audit + canonical spatial constitution (2026-04-02)

---

## 1. Current State Summary

### Navigation Surfaces (7 total — target: 3)

| # | Surface | Items | Location | Problem |
|---|---------|-------|----------|---------|
| 1 | SacredLabDrawer | 44 items / 11 sections | Bottom sheet from /maia | Cognitive overload, mixes behaviors + destinations + tools |
| 2 | Account Bottom Sheet | 7 items + membership UI | Inline in /maia | 280 lines inlined in 1964-line monolith |
| 3 | Studio Sidebar | ~22 modules / 5 categories | /studio layout | Correct scope — keep as-is |
| 4 | Admin Sidebar | 13 items | /portal/[slug]/admin | Separate shell — keep as-is |
| 5 | SacredCompass | 5-direction radial | Floating | Overlaps with other nav |
| 6 | SwipeNavigation | 4-way gesture | /consciousness, /kairos, /unified | Niche — consciousness states only |
| 7 | /maia inline controls | 12+ sheets, mode selectors, toolbar | /maia page.tsx | Monolith: 1964 lines, 40+ imports |

### Action Dispatch (mixed pattern)
- **64% route navigations** via `router.push()` or `onNavigate()`
- **36% callback actions** via `onAction?.()` → inline `setShow*` state toggles

---

## 2. Every Item Classified

### Classification Key
- **W** = World (left rail)
- **C** = Contextual (right panel)
- **U** = Utility (top bar / bottom of rail)
- **B** = Behavior (mode, not destination)
- **M** = Modal/Sheet (overlay)
- **S** = Studio (separate shell)
- **A** = Admin (separate shell)
- **R** = Remove / internal-only

### SacredLabDrawer Items (current 44 → target: decompose)

| Section | Item | Current Action | Classification | Target Home |
|---------|------|---------------|----------------|-------------|
| SOUL PROMPTS & SESSION | Soul Prompts | `onAction('open-prompt-picker')` | **C** | Right panel: session tools |
| | Session Arc | `onAction('show-session-arc')` | **C** | Right panel: session tools |
| | Session Synthesis | `onAction('show-session-synthesis')` | **C** | Right panel: session tools |
| | Prompt Library | `onNavigate('/labtools/prompts')` | **C** | Right panel: tools submenu |
| | Session Recap | `onAction('session-recap')` | **C** | Right panel: session tools |
| SHARE MAIA | Beads | `onNavigate('/labtools/beads')` | **U** | Utility: share action |
| SELF-DISCOVERY | Daily Check-in | `onAction('daily-checkin')` | **C** | Right panel: reflection tools |
| | Element Discovery | `onAction('element-discovery')` | **C** | Right panel: reflection tools |
| | Vocabulary Guide | `onAction('toggle-vocabulary-tooltips')` | **U** | Utility: toggle |
| WISDOM COUNCIL | Choose Your Guide | `onAction('choose-guide')` | **C** | Right panel: wisdom tools |
| | Current Teaching | `onAction('show-current-elder')` | **C** | Right panel: wisdom tools |
| | I Ching | `onNavigate('/oracle/iching')` | **C** | Right panel: oracle tools |
| | Oracle Consultation | `onNavigate('/oracle')` | **C** | Right panel: oracle tools |
| KNOWLEDGE BASE | User Guide | `onNavigate('/maia/guide')` | **U** | Utility: help |
| | Soullab Academy | `onAction('open-academy')` | **W** | Left rail: Wisdom world |
| | Capture the Spirit | `onAction('capture-spirit')` | **B** | Contextual behavior (post-conversation) |
| | Reflections | `onNavigate('/labtools/reflections')` | **W** | Left rail: Journal world |
| | Personal Library | `onNavigate('/library')` | **W** | Left rail: Wisdom world |
| | Your Journal | `onNavigate('/labtools/journal')` | **W** | Left rail: Journal world |
| | Research Notes | `onNavigate('/lab-notes')` | **S** | Studio: structured notes |
| | Deep Research | `onNavigate('/maia/library')` | **W** | Left rail: Wisdom world |
| VOICE & RECORDING | Field Recording toggle | `onAction('toggle-field-recording')` | **B** | Voice bar behavior |
| | Scribe Mode toggle | `onAction('toggle-scribe')` | **B** | Voice bar behavior |
| | Show/Hide Transcript | `onAction('toggle-text')` | **B** | Voice bar behavior |
| WISDOM PATTERNS | Archetypal Journey | `onNavigate('/journey')` | **W** | Left rail: Patterns world |
| | Conversation Threads | `onNavigate('/maia?panel=journey')` | **C** | Right panel: patterns view |
| | Weaving Visualization | `onNavigate('/maia?panel=journey')` | **C** | Right panel: patterns view |
| SOUL SIGNATURE | Sacred Compass | `onAction('show-compass')` | **C** | Right panel: identity view |
| | Your Cosmos | `onNavigate('/labtools/songlines')` | **W** | Left rail: Patterns world |
| | Astrology | `onNavigate('/labtools/astrology')` | **C** | Right panel: identity tools |
| CREATION | Songwriter | `onNavigate('/labtools/creativity/songwriter')` | **S** | Studio: creative tools |
| | Story Creator | `onAction('story-creator')` | **S** | Studio: creative tools |
| COMMUNITY | Community Portal | `onNavigate('/maia/community')` | **W** | Left rail: optional world |
| | Sacred Library | `onNavigate('/wisdom-keepers/wisdom')` | **W** | Left rail: Wisdom world |
| | Community Circles | `onNavigate('/commons/circles')` | **C** | Right panel or left rail world |
| PRACTITIONER | Studio | `onNavigate('/studio')` | **S** | Left rail: boundary transition |
| CONSCIOUSNESS TOOLS | Language selector | inline component | **U** | Utility: settings |
| | Lab Tools | `onNavigate('/labtools')` | **R** | Remove — replaced by spatial nav |
| | Consciousness Map | `onNavigate('/labtools/field-protocol')` | **C** | Right panel: depth tools |

### /maia Inline Sheets (current 12 → target: right panel or modal)

| Sheet | Trigger | Classification | Target |
|-------|---------|----------------|--------|
| SacredLabDrawer | hamburger menu | **R** | Replaced by left rail + right panel |
| QuickJournalSheet | journal button | **C** | Right panel: quick capture |
| AcademySheet | drawer action | **C** | Right panel: learning |
| FeedbackSheet | feedback button | **M** | Modal (keep) |
| PasswordChangeModal | account action | **M** | Modal (keep) |
| ChangesSheet | changes button | **C** | Right panel: changes view |
| DecisionsSheet | decisions button | **C** | Right panel: decisions view |
| VoiceHelpSheet | voice help | **M** | Modal (keep) |
| TestFlightHelpSheet | help action | **M** | Modal (keep) |
| HelpHubSheet | help button | **M** | Modal (keep) |
| ShadowWorkSheet | drawer action | **C** | Right panel: depth tools |
| FrameworkSelector | care mode | **M** | Modal (keep) |

### Account Bottom Sheet Items (current 7 → target: utility + settings page)

| Item | Current Action | Classification | Target |
|------|---------------|----------------|--------|
| Circles link | `router.push('/commons/circles')` | **W** | Left rail world or right panel |
| Community link | `router.push('/maia/community')` | **W** | Left rail world |
| Settings link | `router.push('/account/settings')` | **U** | Utility: top right |
| Archetype selector | inline | **U** | Settings page |
| Membership display | inline | **U** | Settings page |
| Tier display | inline | **U** | Settings page |
| Sign out | inline | **U** | Utility: top right dropdown |

### Studio Routes (keep in Studio shell — no changes)

Already correctly scoped: `/studio/clients`, `/studio/sessions`, `/studio/comms`, `/studio/calendar`, `/studio/caseload`, `/studio/marketing`, `/studio/groups`, `/studio/decisions`, `/studio/changes`, `/studio/metrics`, `/studio/media`, `/studio/code`, `/studio/agents`, `/studio/maia`, `/studio/field`, `/studio/create`, `/studio/account`, `/studio/portal/*`, `/studio/case-studies`

### Admin Routes (keep in Admin shell — no changes)

Already correctly scoped: `/admin/*`, `/labtools/admin/*`

---

## 3. Canonical Destination Map

### Left Rail (icon-only, 7+1 items)

| Position | Icon | Label (tooltip) | Route | Type |
|----------|------|-----------------|-------|------|
| 1 (top) | Flame/Mandala | MAIA | `/maia` | Center field (default) |
| 2 | Spiral | Patterns | `/maia/patterns` | World |
| 3 | Layers | Depth | `/maia/depth` | World |
| 4 | Book | Journal | `/maia/journal` | World |
| 5 | Lightbulb | Ideas | `/maia/ideas` | World |
| 6 | Heart | Relationships | `/maia/relationships` | World |
| 7 | Library | Wisdom | `/maia/wisdom` | World |
| --- | --- | --- | --- | divider |
| 8 | Briefcase | Studio | `/studio` | Boundary transition |
| --- | --- | --- | --- | divider (bottom) |
| 9 | User | Account | opens dropdown | Utility |
| 10 | Settings | Settings | `/account/settings` | Utility |

### Top Utility Bar (minimal)

| Position | Element | Behavior |
|----------|---------|----------|
| Left | MAIA wordmark or icon | Return to center field |
| Center | (empty or subtle breadcrumb) | |
| Right | Voice toggle | Start/stop conversation |
| Right | Help | Open help modal |
| Right | Account avatar | Open account dropdown |

### Right Contextual Panel

Appears when a world is active or when contextual tools are invoked. Contains:

| Context | Panel Contents |
|---------|---------------|
| Center field active | Session tools: prompts, arc, synthesis, recap |
| Patterns world | Pattern threads, weaving visualization, archetypal journey |
| Depth world | Shadow work, consciousness map, oracle tools |
| Journal world | Quick capture, reflections feed, scribe controls |
| Ideas world | Idea cards, capture, early-stage emergence |
| Relationships world | Relationship map, relational patterns |
| Wisdom world | Sacred texts, wisdom council, academy, library, guides |

---

## 4. De-duplication Table

| Feature | Current Locations | Canonical Location | Action |
|---------|-------------------|-------------------|--------|
| Journal | Drawer ("Your Journal"), `/labtools/journal`, `/journal`, `/maia/community/.../journal` | Left rail: Journal world (`/maia/journal`) | Remove drawer item, redirect `/labtools/journal` and `/journal` |
| Reflections | Drawer ("Reflections"), `/labtools/reflections` | Journal world (sub-view) | Remove drawer item |
| Library | Drawer ("Personal Library"), `/library`, Drawer ("Sacred Library") → `/wisdom-keepers/wisdom` | Wisdom world (`/maia/wisdom`) | Consolidate |
| Deep Research | Drawer ("Deep Research"), `/maia/library` | Wisdom world (sub-view) | Remove drawer item |
| Community | Drawer, Account sheet, `/maia/community`, `/commons/circles` | Left rail (optional) or Wisdom world | Single canonical route |
| Studio | Drawer ("Studio"), `/studio` | Left rail: boundary transition | Remove drawer item |
| Lab Tools index | Drawer ("Lab Tools"), `/labtools` | **Remove** — replaced by spatial nav | Drawer item removed |
| Prompt Library | Drawer, `/labtools/prompts` | Right panel: session tools | Remove drawer item |
| Oracle | Drawer (I Ching, Oracle Consultation), `/oracle/*` | Right panel: depth tools | Remove drawer items |
| Astrology | Drawer, `/labtools/astrology` | Right panel: identity tools | Remove drawer item |
| Songwriter | Drawer, `/labtools/creativity/songwriter` | Studio | Move to Studio |
| Changes | /maia inline sheet, `/studio/changes` | Studio | Remove from /maia |
| Decisions | /maia inline sheet, `/studio/decisions` | Studio | Remove from /maia |
| Research Notes | Drawer, `/lab-notes` | Studio | Move |
| User Guide | Drawer, `/maia/guide` | Utility: help | Move to help modal/dropdown |
| Academy | Drawer (sheet), AcademySheet | Wisdom world | Move |
| Session tools | Drawer (5 items) | Right panel (auto-show during session) | Remove drawer items |
| Voice controls | Drawer (3 items) | Voice bar (always-present) | Remove drawer items |
| Compass | Drawer, SacredCompass floating | Right panel: identity view | Consolidate |
| Daily Check-in | Drawer | Right panel: reflection (or MAIA center prompt) | Remove drawer item |
| Element Discovery | Drawer | Right panel: reflection tools | Remove drawer item |

---

## 5. Behaviors (Not Destinations)

These should NOT appear as navigation items. They are invoked contextually.

| Current Nav Item | Behavior Type | How Invoked |
|-----------------|---------------|-------------|
| Talk mode | Conversation mode | Default MAIA state |
| Care mode | Therapeutic lens | Contextual selector in voice bar or right panel |
| Scribe mode | Recording behavior | Toggle in voice bar |
| Mark mode | Annotation behavior | Contextual during reading |
| Field Recording | Audio capture | Toggle in voice bar |
| Show/Hide Transcript | Display toggle | Toggle in voice bar |
| Vocabulary Guide | Tooltip overlay | Toggle in utility |
| Capture the Spirit | Post-conversation action | Prompted by MAIA after session |
| Session Arc/Synthesis/Recap | Session awareness | Auto-shown in right panel during active session |

---

## 6. Target Component Architecture

### Current: /maia monolith (1964 lines)

```
app/maia/page.tsx
  ├── 40+ imports
  ├── Session migration logic
  ├── OracleConversation (center field)
  ├── Mode selector toolbar
  ├── Inline account bottom sheet (280 lines)
  ├── 12 sheet/modal state variables
  ├── SacredLabDrawer trigger + handler
  ├── Voice controls
  └── All navigation dispatch
```

### Target: Shell + Slots

```
app/maia/layout.tsx (NEW — MAIA shell)
  ├── MaiaLeftRail.tsx (NEW)
  │   ├── World icons (Patterns, Depth, Journal, Ideas, Relationships, Wisdom)
  │   ├── Studio boundary link
  │   └── Account/Settings utility
  ├── MaiaTopBar.tsx (NEW)
  │   ├── MAIA wordmark
  │   ├── Voice toggle
  │   ├── Help
  │   └── Account avatar + dropdown
  ├── MaiaRightPanel.tsx (NEW)
  │   ├── Contextual content slot
  │   ├── Receives content based on active world or session state
  │   └── Collapsible (hidden by default, shown on interaction)
  ├── MaiaModalManager.tsx (NEW)
  │   ├── FeedbackSheet
  │   ├── PasswordChangeModal
  │   ├── VoiceHelpSheet
  │   ├── TestFlightHelpSheet
  │   ├── HelpHubSheet
  │   └── FrameworkSelector
  └── {children} (page content = center field)

app/maia/page.tsx (SIMPLIFIED)
  ├── OracleConversation (center field only)
  ├── Voice bar (contextual controls)
  └── Session state management

app/maia/patterns/page.tsx (NEW or redirected)
app/maia/depth/page.tsx (NEW or redirected)
app/maia/journal/page.tsx (NEW or redirected)
app/maia/ideas/page.tsx (NEW or redirected)
app/maia/relationships/page.tsx (NEW or redirected)
app/maia/wisdom/page.tsx (NEW or redirected)
```

### Components to Create

| Component | Purpose | Lines (est.) |
|-----------|---------|-------------|
| `components/maia-shell/MaiaLeftRail.tsx` | Icon rail with worlds + utility | ~120 |
| `components/maia-shell/MaiaTopBar.tsx` | Minimal utility bar | ~80 |
| `components/maia-shell/MaiaRightPanel.tsx` | Contextual panel host | ~150 |
| `components/maia-shell/MaiaModalManager.tsx` | All modals extracted from page.tsx | ~100 |
| `config/maiaNavigation.ts` | Single source of truth for worlds, routes, icons | ~60 |

### Components to Modify

| Component | Change |
|-----------|--------|
| `app/maia/page.tsx` | Extract ~1200 lines: remove inline sheets, account menu, drawer handler, navigation dispatch |
| `app/maia/layout.tsx` | Create as MAIA shell wrapping children + left rail + top bar + right panel + modals |
| `components/ui/SacredLabDrawer.tsx` | Deprecate (replaced by left rail + right panel) |

### Components to Keep As-Is

| Component | Reason |
|-----------|--------|
| `app/studio/layout.tsx` | Already correct scope — separate shell |
| `components/admin/AdminSidebar.tsx` | Already correct scope |
| `components/navigation/SwipeNavigation.tsx` | Niche feature, low interference |
| `components/navigation/SacredCompass.tsx` | Can be embedded in right panel |

---

## 7. Implementation Order

### Phase 0: Preparation (no user-visible changes)
1. Create `config/maiaNavigation.ts` — canonical world definitions, routes, icons
2. Add feature flag: `spatialNavigation: false` to `feature-flags.ts`
3. Create `app/maia/layout.tsx` as passthrough (renders children, no shell yet)

### Phase 1: Build Shell Behind Flag (~3 files)
4. Build `MaiaLeftRail.tsx` — icon rail, worlds, studio link, utility
5. Build `MaiaTopBar.tsx` — minimal bar
6. Build `MaiaRightPanel.tsx` — empty contextual host
7. Wire into `app/maia/layout.tsx` behind `spatialNavigation` flag
8. **Verify**: existing /maia works unchanged with flag off

### Phase 2: Extract from Monolith (~2 files)
9. Extract `MaiaModalManager.tsx` from page.tsx (modals only)
10. Extract inline account bottom sheet to `components/account/AccountDropdown.tsx`
11. Move sheet state management to layout-level context
12. **Verify**: /maia still works, all sheets open/close correctly

### Phase 3: Create World Pages (~6 files)
13. Create `/maia/patterns/page.tsx` (redirect from `/journey`, `/labtools/songlines`)
14. Create `/maia/depth/page.tsx` (redirect from `/labtools/field-protocol`, oracle tools)
15. Create `/maia/journal/page.tsx` (redirect from `/labtools/journal`, `/journal`)
16. Create `/maia/ideas/page.tsx` (new — placeholder)
17. Create `/maia/relationships/page.tsx` (redirect from `/dashboard/relationships`)
18. Create `/maia/wisdom/page.tsx` (redirect from `/wisdom-keepers/wisdom`, `/library`)

### Phase 4: Right Panel Wiring (~3 files)
19. Wire session tools into right panel (prompts, arc, synthesis, recap)
20. Wire world-specific contextual content into right panel
21. Convert SacredLabDrawer items to right panel triggers
22. **Verify**: all current drawer functionality accessible via right panel

### Phase 5: Deprecation & Cleanup
23. Remove SacredLabDrawer from /maia (behind flag)
24. Remove inline account bottom sheet (behind flag)
25. Update `accessMatrix.ts` with new routes
26. Update `capacitor-patch-routes.sh` EXCLUDED_DYNAMIC_ROUTES
27. **Verify**: full smoke test with flag on

---

## 8. Risk Register

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | **Oracle state lost during world transition** | CRITICAL | OracleConversation must persist in layout, not re-mount on world change. Use layout-level state or context. |
| 2 | **Mixed action dispatch breaks** | HIGH | Maintain `onAction` callback system alongside route nav during transition. Don't remove until all actions re-homed. |
| 3 | **Capacitor build breaks** | HIGH | New `/maia/*` world routes must be in MOBILE_MODE allowlist. Test iOS build after Phase 3. |
| 4 | **Access matrix gaps** | MEDIUM | Add all new `/maia/*` world routes to `accessMatrix.ts` before deploying. |
| 5 | **Feature flag hydration mismatch** | MEDIUM | New `spatialNavigation` flag follows existing SSR-safe pattern. |
| 6 | **Studio boundary transition breaks back-nav** | MEDIUM | Use `router.push` not `router.replace`. Test browser back button. |
| 7 | **Right panel + mobile conflict** | MEDIUM | Right panel should collapse to bottom sheet on mobile viewport. Use responsive breakpoint. |
| 8 | **Existing bookmarks/deep links break** | LOW | Keep old routes as redirects (Next.js `redirect()` in old page.tsx files). Never delete routes — redirect them. |

---

## 9. What Gets Removed (Explicitly)

| Item | Why |
|------|-----|
| SacredLabDrawer (44 items) | Replaced by left rail (7 worlds) + right panel (contextual) |
| Inline account bottom sheet | Replaced by account dropdown in top bar |
| "Lab Tools" as navigation concept | Replaced by worlds + right panel |
| Changes/Decisions sheets in /maia | Moved to Studio |
| Songwriter/Story Creator in drawer | Moved to Studio |
| Research Notes in drawer | Moved to Studio |
| Duplicate journal routes (4 locations) | Consolidated to `/maia/journal` |
| Duplicate library routes (3 locations) | Consolidated to `/maia/wisdom` |

---

## 10. What Stays Exactly As-Is

| Item | Why |
|------|-----|
| OracleConversation component | Core center field — do not touch |
| Voice bar / mode selector | Behavioral, not navigational — moves to voice bar |
| Studio shell + sidebar | Already correct architecture |
| Admin shell + sidebar | Already correct architecture |
| SwipeNavigation | Niche, low interference |
| All `/api/*` routes | Backend unchanged |
| Feature flag system | Extended, not replaced |
| Middleware auth flow | Unchanged |
| Access matrix pattern | Extended with new routes |
