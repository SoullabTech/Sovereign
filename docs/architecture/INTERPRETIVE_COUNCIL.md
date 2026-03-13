# MAIA Interpretive Council — Architecture Reference

## What this is

The Interpretive Council is MAIA's system for honouring a member's chosen interpretive lens without overriding the moment-sensitive judgment of the depth classifier or relational mode. It replaces the old decorative `TherapeuticFramework` preference (stored only in localStorage, never used in the oracle) with a live architectural layer.

## Three orthogonal axes

| Axis | Question | Set by | Stored in |
|------|----------|--------|-----------|
| **Guide** (interpretive lens) | *Through what frame does MAIA work?* | Member preference | `member_settings.therapeutic_approach` |
| **Tier** (depth) | *How deep is this moment?* | Depth classifier on every turn | Ephemeral (per-request) |
| **Mode** (relational stance) | *What role is MAIA holding?* | Member's active mode | Session state |

These three compose independently. A member who prefers Jungian framing still gets a warm, simple response at threshold depth — the guide shapes vocabulary, not depth. A member in Care mode with a CBT preference gets the CBT Strategist's vocabulary held inside Care's relational stance.

---

## The 12 Guides

| ID | Archetype | Element | Domain |
|----|-----------|---------|--------|
| `auto` | The Integrator | Aether | Synthesis, whole-person seeing |
| `jungian` | The Symbolist | Water | Archetypes, shadow, dreams |
| `ifs` | The Inner Mediator | Water | Parts, exiles, Self-leadership |
| `psychodynamic` | The Depth Analyst | Water | Unconscious patterns, transference |
| `cbt` | The Strategist | Earth | Patterns, reframes, behavioural change |
| `somatic` | The Body Listener | Earth | Body-felt sense, nervous system |
| `tcm` | The Harmonizer | Earth | Elemental balance, Five Element theory |
| `family_systems` | The Pattern Seer | Air | Systemic patterns, generational field |
| `humanistic` | The Encourager | Air | Unconditional regard, self-actualisation |
| `existential` | The Philosopher | Air | Meaning, freedom, mortality, authenticity |
| `developmental` | The Evolution Guide | Fire | Growth stages, emergence, becoming |
| `spiritual` | The Mystic | Fire | Soul, transcendence, sacred dimension |

### Elemental grouping

```
Aether:  Integrator (auto)
Fire:    Evolution Guide (developmental), Mystic (spiritual)
Water:   Symbolist (jungian), Inner Mediator (ifs), Depth Analyst (psychodynamic)
Earth:   Strategist (cbt), Body Listener (somatic), Harmonizer (tcm)
Air:     Pattern Seer (family_systems), Encourager (humanistic), Philosopher (existential)
```

---

## Resolution precedence

```
resolveCouncil({
  accountDefault,    // from member_settings.therapeutic_approach
  sessionOverride,   // from request body (not yet wired to UI, reserved)
  message,           // optional — enables cue-based hinting in auto mode
})
```

Priority:
1. **Session override** — if present and not `'auto'`, always wins
2. **Account default** — if set to a specific guide (not `'auto'`), wins over auto
3. **Auto integrator** — when account default is `'auto'` or absent
   - If a message is provided and cues match, sets `alternativeGuides` for soft prompt hints
   - The resolved guide is still `auto` (The Integrator) — no automatic switching without member consent

`source` field distinguishes: `'session_override'` | `'account_default'` | `'auto_integrator'`

---

## Backward compatibility

`normalizeGuideId(raw)` maps any stored string to a valid `InterpretiveGuideId`:

| Stored value | Resolved to |
|---|---|
| `null`, `undefined`, `''`, unrecognised | `'auto'` |
| `'relational'` (old framework) | `'family_systems'` |
| `'hemispheric'` (old framework) | `'psychodynamic'` |
| `'alchemical'` (old framework) | `'jungian'` |
| `'archetypal'` (old framework) | `'spiritual'` |
| All current guide IDs | pass through unchanged |

No DB migration of stored values is needed. Old values normalise at read time.

---

## Prompt injection — `buildCouncilPromptSection`

The function is tier-aware and returns different content depending on `conversationDepth`:

| Depth | Content | Approx size |
|-------|---------|-------------|
| ≤ 3 (threshold) | One-line bias hint only | ~60 chars |
| > 3 (core / deep) | Full guide orientation: name, element, domain, promptStyle, questionStyle, constraint | ~400 chars |
| auto with no alternatives | Empty string (no injection) | 0 chars |

The constraint statement is always present at core/deep depth:
> "This guide shapes framing and vocabulary — it does not override tier (depth) discipline or mode (relational stance)."

This prevents the prompt from accidentally making the LLM think it should be deeper or more formal than the tier warrants.

---

## Oracle wiring

In `app/api/oracle/conversation/route.ts`:

1. **Load** — `therapeutic_approach` is fetched alongside `preferred_assistant_name` from `member_settings`
2. **Normalize** — `normalizeGuideId(raw)` called immediately
3. **Resolve** — `resolveCouncil({ accountDefault, sessionOverride, message })` called after spiralogicCell detection
4. **Framework gate** — `GUIDE_TO_REGISTRY` maps guide ID → FRAMEWORK_REGISTRY IDs for `chooseFrameworksForCell(cell, { enabledApplied })`
5. **Prompt inject** — `buildCouncilPromptSection(councilResolution, conversationDepth)` called inside `buildSacredAttendingPrompt`

### GUIDE_TO_REGISTRY

```typescript
const GUIDE_TO_REGISTRY: Record<string, string[]> = {
  jungian:        ['JUNGIAN'],
  ifs:            ['IFS'],
  psychodynamic:  ['JUNGIAN'],
  cbt:            ['CBT'],
  somatic:        ['SOMATIC'],
  tcm:            [],   // no FRAMEWORK_REGISTRY entry yet
  family_systems: [],
  humanistic:     [],
  existential:    [],
  developmental:  [],
  spiritual:      ['JUNGIAN'],
  auto:           [],
};
```

Guides without FRAMEWORK_REGISTRY entries still inject their prompt bias via the council section — FRAMEWORK_ADDENDUMS are supplementary, not required.

---

## Settings persistence

| Layer | Mechanism | Scope |
|-------|-----------|-------|
| localStorage | `setCounselFramework()` / `getCounselFramework()` | Current device / session |
| Server DB | `PUT /api/settings/approach` | All devices (cross-device sync) |

`FrameworkSelector`:
- On mount: loads localStorage, then GETs server value; if different, server wins and overwrites localStorage
- On select: writes localStorage immediately (instant feedback), fires `PUT` to server (non-blocking)

---

## Key files

| File | Role |
|------|------|
| `lib/consciousness/interpretiveCouncil.ts` | Registry, resolution logic, prompt builder |
| `lib/consciousness/therapeuticFrameworks.ts` | FrameworkConfig entries (archetype, domain, element, promptBias) |
| `app/api/settings/approach/route.ts` | GET/PUT for member's stored approach |
| `app/api/oracle/conversation/route.ts` | Oracle wiring (load → resolve → gate → inject) |
| `components/framework/FrameworkSelector.tsx` | Elemental UI with server sync |
| `database/migrations/20260316000001_therapeutic_approach.sql` | DB column |
| `lib/consciousness/__tests__/interpretiveCouncil.test.ts` | 47 locked tests |

---

## Design constraints (do not violate)

1. **Guide ≠ tier** — The guide never forces depth. Threshold moments are always warm and simple regardless of guide.
2. **Guide ≠ mode** — A Care mode session with a CBT preference holds CBT vocabulary inside Care's relational warmth.
3. **No automatic guide switching** — MAIA never switches the guide mid-session without member action. Cue-based `alternativeGuides` are suggestions only.
4. **Auto is sovereign default** — `'auto'` means "MAIA's native Spiralogic synthesis." It is not a fallback; it is a valid, full preference.
5. **Backward compatibility is load-bearing** — Old `TherapeuticFramework` strings in the DB must resolve correctly. Do not remove `LEGACY_FRAMEWORK_MAP` entries.
6. **Constraint statement always ships** — The prompt constraint ("this guide shapes framing, not tier") must appear in every core/deep injection. Do not remove it.

---

## Future: Board Mode / Multi-Guide Council

Scaffold reserved. The guide registry and resolution layer are designed to support a future "Ask the Council" mode where 2–3 guides reflect on a question simultaneously. Implementation deferred — the architecture is ready.

Reserved interface:
```typescript
// Future: multi-guide board query
resolveCouncilBoard({ question, elements?: ElementalDomain[] }): InterpretiveGuide[]
```

---

## Telemetry

### Table: `interpretive_guide_events`

| Column | Type | Notes |
|--------|------|-------|
| `member_id` | UUID | FK → members |
| `event_type` | VARCHAR(40) | `guide_selected` \| `guide_active_at_response` |
| `guide_id` | VARCHAR(20) | `InterpretiveGuideId` |
| `source` | VARCHAR(30) | `account_default` \| `session_override` \| `auto_integrator` |
| `depth_tier` | VARCHAR(10) | `threshold` \| `core` \| `deep` (null for selection events) |
| `metadata` | JSONB | Reserved — structural only |

**Depth tier boundaries** (consistent with `buildCouncilPromptSection`):
- threshold: `conversationDepth <= 3`
- core: `4 <= conversationDepth <= 10`
- deep: `conversationDepth > 10`

### Readout endpoint

```
GET /api/admin/council/telemetry?days=30
```

Returns four views:
- `summary` — total selections, total responses, unique members who set a guide
- `selectionCounts` — per-guide: times_selected, unique_members
- `responsesByTier` — per-guide × tier cross-tab with totals
- `sourceBreakdown` — account_default / session_override / auto_integrator split with %
- `recentSelections` — last 20 guide_selected events (truncated member prefix)

### Direct DB queries

```sql
-- Which guides are actually being chosen?
SELECT guide_id, COUNT(*) AS times_selected, COUNT(DISTINCT member_id) AS members
FROM interpretive_guide_events
WHERE event_type = 'guide_selected'
GROUP BY guide_id ORDER BY times_selected DESC;

-- Does guide use vary by depth tier?
SELECT guide_id, depth_tier, COUNT(*) AS responses
FROM interpretive_guide_events
WHERE event_type = 'guide_active_at_response'
GROUP BY guide_id, depth_tier ORDER BY guide_id, depth_tier;

-- How often is auto the actual resolution path?
SELECT source, COUNT(*) AS n, ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM interpretive_guide_events
WHERE event_type = 'guide_active_at_response'
GROUP BY source ORDER BY n DESC;

-- Is session override ever used?
SELECT COUNT(*) FROM interpretive_guide_events
WHERE event_type = 'guide_active_at_response' AND source = 'session_override';
```
