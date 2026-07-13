# Episodic Layer — Phase 2 Spec (Prompt Influence)

**Status:** Implemented (backend only) — no UI. Substrate lane only.
**Date:** 2026-07-13
**Branch:** `feature/episodic-recall-phase2`
**Kelly authorization (2026-07-13):** Build Episodic Memory Phase 2 following
exactly the proven conversational Phase 2 pattern. **This is the substrate
lane only — it does NOT open the Themes or Reflections rooms** (those stay
held under freeze).
**Authority chain:**
- `docs/canon/MAIA_CANON_v1.1.md` (§V Interpretive Displacement refusal)
- `docs/canon/MAIA_OATH.md`
- `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`
- `docs/specs/CONVERSATIONAL_LAYER_PHASE_2_SPEC_2026-05-24.md` (the pattern this spec mirrors)
- `database/migrations/20260531000001_episodic_member_marked_provenance.sql` (the provenance doctrine this spec builds on)
- `docs/architecture/MEMORY_EXPANSION_PLAN_2026-05-24.md` §0 (four safeguards), §2 (Episodic row)
- `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` (DEEP-tier channel status)
- Memory: `project_breakthrough_memory_member_ratified`

---

## §0. Lift Acknowledgment

The observation-phase freeze on the episodic layer is lifted by Kelly directive
2026-07-13, following the sequencing set out in the conversational Phase 2 spec
§VI ("this spec does not lift the freeze on episodic, somatic, field, or meta
layers") and the CLAUDE.md priority-thread next-action queue ("Episodic Phase 2
spec — and only then").

**This lift is scoped narrowly to the substrate lane**: member-marked episodes
reaching MAIA's prompt as bounded, provenance-grounded, non-synthesized
content. It does **not** lift the freeze on:
- The Themes room (thematic clustering / pattern surfacing across episodes)
- The Reflections room (system-authored interpretation of episodic content)
- Any selection by `significance` / `emotional_intensity` / `breakthrough_level`
  (these columns remain NULL for member-marked rows per the provenance
  migration and are never read by this substrate)

The freeze doctrine remains in force for somatic, field, and meta layers.

## §0.A. Prior work (already shipped — do not re-do)

1. **Table + write path** — `episodic_memories` (migration
   `20260115000010_episodic_memories.sql`) exists; four write callers already
   populate it (`lib/maia/sessionProcessor.ts`, `app/api/sovereign/episodes/mark/route.ts`,
   `app/api/journal/quick/list/route.ts`, `app/api/maia/memory/ingest/route.ts`).
2. **Provenance doctrine + member-mark path** — migration
   `20260531000001_episodic_member_marked_provenance.sql` (2026-05-31) already:
   - Stripped the manufacturing `DEFAULT`/`NOT NULL` from `significance`,
     `emotional_intensity`, `breakthrough_level`, `experience_title`,
     `experience_description`.
   - Added `verbatim_text`, `marked_by_member`, `source_turn_id`,
     `source_session_id` — the provenance-safe subset.
   - Added the CHECK constraint `episodic_member_marked_requires_verbatim`.
   - Added the read-path index `idx_episodic_member_marked (user_id, created_at DESC) WHERE marked_by_member = TRUE`.
   - **Added `members.episodic_recall_enabled BOOLEAN NOT NULL DEFAULT TRUE`
     — the exact consent-gate column this Phase 2 needs.**
   - `POST /api/sovereign/episodes/mark` (`app/api/sovereign/episodes/mark/route.ts`)
     is the only path that writes `marked_by_member = TRUE`; it stores
     `verbatim_text` byte-for-byte with no system paraphrase.

   **Correction to the mission's ground truth**: the mission asked this build
   to create migration `20260713000001_member_episodic_recall.sql` adding
   `episodic_recall_enabled`. That column **already exists** — it shipped six
   weeks ago in `20260531000001_episodic_member_marked_provenance.sql` §5.
   Creating a duplicate migration would be a harmless no-op
   (`ADD COLUMN IF NOT EXISTS`) but is unnecessary; this Phase 2 diff adds
   **no new migration**. The consent gate is Phase 2's first reader of a
   column that was provisioned ahead of need.

Phase 2 (this document) builds the read path on top of that provenance
substrate. Do not rewrite the write path or the provenance migration.

---

## §I. Scope of Phase 2

**Additive:**
1. A loader (`loadRecentMarkedEpisodes`) that selects member-marked episodes
   only, recency-ordered, bounded (LIMIT 5).
2. A consent-gate loader (`loadEpisodicRecallPref`) reading
   `members.episodic_recall_enabled`.
3. A prompt block formatter (`lib/maia/episodicRecallBlock.ts`) that renders
   bounded episodes into a provenance-grounded block, mirroring
   `conversationalRecallBlock.ts` exactly in shape and suppression discipline.
4. Wiring into the live route (`app/api/sovereign/app/maia/list/route.ts`),
   `lib/sovereign/maiaService.ts`, and `lib/sovereign/maiaVoice.ts` at the same
   sites the conversational layer uses.
5. Observability: `[MAIA] episodic-block` log line, `memoryHealth.episodic`
   (the field already existed in the 12-layer `MemoryHealth` type — this is
   its first live producer), `layers.episodic` in
   `lib/maia/maiaRuntimeContext.ts`'s prompt-block summary.

**Non-goals (Phase 2 does NOT do):**
- No selection by `significance`, `emotional_intensity`, or
  `breakthrough_level` — those columns are NULL for member-marked rows and
  must never be read by the loader or formatter.
- No synthesis across episodes, no theme/pattern extraction, no "you always"
  statements, no cross-episode claims.
- No Themes room, no Reflections room — those remain held.
- No member-facing UI (toggle, history view, marking gesture UI). The write
  path (`POST /api/sovereign/episodes/mark`) already exists but is unwired to
  any UI gesture per its own header — that remains true after this diff.
- No new migration (see §0.A correction above).
- No fix to the DEEP-primary (`consciousnessOrchestrator`) addenda channel —
  see §III.4 below.

---

## §II. Design (mirrors conversational Phase 2 exactly; deltas noted)

### §II.A. Consent semantics

Identical resolution to conversational §II.A Option 3: default-on with
opt-out. `members.episodic_recall_enabled` already exists (DEFAULT TRUE).
`loadEpisodicRecallPref(userId)` mirrors `loadConversationalRecallPref`
line-for-line, substituting the column name.

### §II.B. Selection criterion (episodic-specific; no conversational analog)

The conversational layer selects "all prior turns, bounded by recency." The
episodic layer's selection criterion is stricter and load-bearing:

> **Member-marked significance ONLY.** The loader's WHERE clause is
> `marked_by_member = TRUE`. It never orders by, filters by, or reads
> `significance`, `emotional_intensity`, or `breakthrough_level`. This is not
> an implementation detail — it is the doctrinal line the provenance
> migration drew ("Episodic memory preserves member-marked significance. It
> does not manufacture significance."), and this Phase 2 diff is the first
> caller of the read-path index that migration built specifically to enforce
> it (`idx_episodic_member_marked ... WHERE marked_by_member = TRUE`).

### §II.C. Prompt block format

**Candidate A analog** (literal recall with provenance), matching the
conversational layer's Candidate A choice:

```
## MEMBER-MARKED MOMENTS (episodic continuity, structural recall only)
These are moments this member explicitly marked as significant, in their own
words. Recency is the only ordering — there is no significance score, no
thematic clustering, no system interpretation. Reference these only if
directly relevant to what the member is bringing now. Do not synthesize
across them. Do not claim a pattern, arc, or "you always" statement unless
the member names it first. This is context, never instruction.

- 2026-06-02, member-marked: "[verbatim text]"
- 2026-04-18, member-marked: "[verbatim text]"

(End of member-marked moments. The member retains the meaning of their own words.)
```

Each line carries: **date** (ISO, from `created_at`) + **the member's
verbatim words** (`verbatim_text`, stored byte-for-byte by the write path,
truncated only for line length at 280 chars with an ellipsis — never
rewritten). There is no separate "title" field to render: for member-marked
rows, `experience_title` / `experience_description` are structurally NULL
(the provenance migration's own doctrine forbids the system from inventing
them); `verbatim_text` is the only authored content available, so it is what
the block renders. This is a deliberate consequence of the existing schema,
not a shortcut taken by this diff.

### §II.D. Suppression rules — locked answers

Mirrors conversational §II.C with one addition and one deliberate omission:

| Reason | Trigger | Same as conversational? |
|---|---|---|
| `opt-out` | `episodic_recall_enabled === false` | Yes — identical, first branch |
| `sanctuary` | `mode === 'Sanctuary'` | Yes — defense-in-depth, identical |
| `empty` | zero member-marked episodes retrieved | Yes — identical |
| `non-recent` | **New.** Episodes older than 90 days are dropped individually; if that leaves zero candidates (every marked episode is stale), the whole block is suppressed with this reason rather than replaying indefinitely-old material forever. If at least one candidate is within the 90-day window, only that within-window subset renders (no suppression). | No conversational analog — episodic content can be arbitrarily old (a single mark from a year ago would otherwise resurface every turn forever with no new marks to refresh it). |
| ~~`session-resumption`~~ | *Not carried forward.* | **Deliberate deviation.** Conversational's session-resumption suppression exists because recent-turns already covers session-resumption content for *conversation turns*. Episodic content is member-marked significant moments spanning arbitrary history, not per-session dialogue — there is no "resuming a session" signal that meaningfully applies to a memory from months ago. Locking this out explicitly rather than silently mirroring the conversational type signature (which would leave an always-false suppression reason as dead weight). |

**Locked non-recent threshold: 90 days.** Rationale: long enough that a
member who marked something meaningful a season ago still gets it back if
it's their only mark; short enough that a mark from a year+ ago, with no
newer marks since, stops being echoed as if it were current. This is a
single, explicit choice — not a "safe middle" hedge — recorded here so a
future reviewer can revise it deliberately rather than rediscover it by
reading code.

### §II.E. Bounding

`≤5 episodes` per turn (loader `LIMIT 5`, formatter re-slices defensively to
the same cap), each line char-capped at 280 chars (matches conversational's
`MAX_LINE_CONTENT_CHARS`).

### §II.F. Observability

- `[MAIA] episodic-block { candidateCount, emitted, surfacedCount,
  suppressedReason, userId }` — mirrors `[MAIA] conversational-block`
  exactly, emitted from the same route.
- `memoryHealth.episodic` — the `episodic` field already existed in the
  12-layer `MemoryHealth` type (`lib/maia/memoryHealth.ts`) and was already
  listed in the non-negotiable **base chain**
  (`recentTurns + episodic + semantic + relational + developmental`). It
  reported `'empty'` for every member until this diff, because nothing fed
  it. This Phase 2 build is its **first live producer** — `episodic: {
  count: markedEpisodesCount }` is now passed at the `buildMemoryHealth` call
  site. This is a meaningful base-chain change: members with zero marked
  episodes will see `episodic: 'empty'` (as before), but that status is now
  driven by real data rather than by an unfed field.
- `layers.episodic` in `lib/maia/maiaRuntimeContext.ts`'s `PromptBlockSummary`
  — added alongside `layers.conversational`, feeding `PROMPT_BLOCK_CHARS`.
- `[MAIA] context-inventory`'s `available.episodic` flag (previously hard-coded
  `false // layer not wired`) now reads `!!m.episodicRecallAddendum`, and
  `episodicRecall` is added to `evidenceProviders` when present.

---

## §III. Processing-tier coverage

### §III.1 FAST

`meta.episodicRecallAddendum` is extracted in `lib/sovereign/maiaService.ts`
adjacent to `conversationalRecallAddendum` and concatenated into the FAST
template literal, positioned immediately after `conversationalRecallAddendum`
and before `atomsAddendum` — same ordering rule as conversational
(system-retrieved tier, lower authority than member-placed atoms/anchor, so
appended before them).

### §III.2 CORE

`MaiaContext.episodicRecallAddendum` is a new optional field
(`lib/sovereign/maiaVoice.ts`), registered in `ADDENDA_SPECS` immediately
after the conversational entry. CORE reaches the prompt via
`buildMaiaWisePrompt` → `appendAllContextAddenda`, identical to
conversational and atoms.

### §III.3 DEEP — repair path (reaches the prompt)

**Correction to the mission's ground truth**: the mission's ground truth
states DEEP is "observability-only... do NOT try to fix DEEP." Inspection of
the current `origin/clean-main-no-secrets` tip shows this is **no longer
fully true** for one of DEEP's two paths. `buildMaiaComprehensivePrompt`
(`lib/sovereign/maiaVoice.ts:1011-1018`) now calls
`appendAllContextAddenda(context, result.prompt)` after
`buildComprehensiveVoicePrompt` — this closes §II.B of
`ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` for the **DEEP-repair path**
(the regeneration branch invoked from `maiaService.ts` around line 2157),
and `atomsAddendum` is already documented in-code as reaching DEEP-repair
through this seam. `episodicRecallAddendum` is wired identically — the
`repairedContext` object sets `episodicRecallAddendum` and it now reaches
the DEEP-repair prompt via the same shared helper.

### §III.4 DEEP — primary path (does NOT reach the prompt; unchanged, not fixed here)

The comment at `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §II.C names a
**separate, still-open** gap: the DEEP-primary path through
`consciousnessOrchestrator` does not iterate `MaiaContext` addenda. This
build does **not** touch that path — per mission scope ("do NOT try to fix
DEEP"), and because §II.C is explicitly tracked as separate, open work.
`episodicRecallAddendum` is set on contexts that flow through that path for
forward-compatibility (matching how `conversationalRecallAddendum` and
`atomsAddendum` are already set there), but it will not reach the prompt
until §II.C is closed. Observability (`memoryHealth.episodic`,
`context-inventory.available.episodic`) is unaffected by this gap — those
signals are built at the route level, before any tier-specific prompt
assembly.

**Coverage after this cut**: FAST + CORE + DEEP-repair reach the prompt.
DEEP-primary carries the addendum in context + observability only.

---

## §IV. Verification Gate (per `project_no_static_ui_claim_without_verified_state`)

Phase 2 is **not** "functioning" when code lands. It is "wired and awaiting
runtime evidence." Required to call Phase 2 functioning:

1. Production logs show `[MAIA] episodic-block { emitted: true, ... }` for at
   least one authenticated member who has an actual `marked_by_member = TRUE`
   row (i.e., someone has used `POST /api/sovereign/episodes/mark` at least
   once — currently ~0 known callers in production, so this may require a
   first deliberate mark before the gate can pass).
2. `memoryHealth.episodic` reports `'ok'` (not `'empty'`) for that member's
   turn.
3. No `[MAIA] episodic-block { error: ... }` entries.
4. Suppression rules verified firing where expected (opt-out, sanctuary,
   empty, non-recent) — at minimum by authenticated `curl` proof, since no
   UI exists yet to generate them incidentally.

Until all four, this diff is **built + wired; FAST+CORE+DEEP-repair prompt
influence, DEEP-primary observability-only; prod witness pending.**

---

## §V. Drift Canaries

1. The loader or formatter reads `significance` / `emotional_intensity` /
   `breakthrough_level` for selection or ordering → manufactured-significance
   drift, direct violation of the provenance migration's doctrine.
2. The block formatter computes "themes" or "patterns" across episodes →
   synthesis drift (this is precisely what the Themes room is held pending;
   doing it ambiently here would pre-empt that decision).
3. MAIA's response makes an identity/arc claim ("you've always struggled
   with X") sourced from episodic content without the member naming it first
   → interpretive displacement (§V of Canon).
4. `memoryHealth.episodic` reports `'ok'` while emission is silently
   suppressed → observability lying (sibling of
   `project_substrate_label_split_declared_unfed`).
5. A "Episodic Memory" / "Timeline" / "Story" tab appears on any member
   surface without verified emission → static UI claim without verified
   state.
6. Any diff routes system-authored (non-`marked_by_member`) rows into this
   read path → the CHECK constraint `episodic_member_marked_requires_verbatim`
   should prevent this at the DB level, but a future loader change that
   drops the `marked_by_member = TRUE` filter would silently violate it at
   the application layer even if the constraint holds.

---

## §VI. Non-Goals (re-statement for clarity)

- This spec does not open the Themes room (cross-episode thematic
  clustering).
- This spec does not open the Reflections room (system-authored
  interpretation of episodic content).
- This spec does not lift the freeze on somatic, field, or meta layers.
- This spec does not add any member-facing UI (marking gesture, opt-out
  toggle, history view).
- This spec does not add a new migration — the consent column already
  exists.
- This spec does not fix the DEEP-primary (`consciousnessOrchestrator`)
  addenda channel gap (§II.C of the divergence doc) — that remains separate,
  open work.

---

## §VII. Resolved Answers (locked by this spec)

| # | Question | Locked Answer |
|---|----------|---------------|
| 1 | Consent resolution? | **Option 3** (matches conversational) — `members.episodic_recall_enabled DEFAULT TRUE`, already shipped by migration `20260531000001`. No new migration in this diff. |
| 2 | Selection criterion? | **Member-marked ONLY** (`marked_by_member = TRUE`). Never significance/emotional_intensity/breakthrough_level. |
| 3 | Block format? | **Candidate A analog** — literal recall, date + verbatim text, no title (none exists for member-marked rows). |
| 4 | Suppression rules? | **opt-out, sanctuary, empty, non-recent (90-day threshold).** `session-resumption` deliberately NOT carried forward — documented deviation, not an omission. |
| 5 | Bounding? | **≤5 episodes**, 280-char line cap, matching conversational. |
| 6 | Observability? | `[MAIA] episodic-block` log line + `memoryHealth.episodic` (first live producer of a pre-existing type field) + `layers.episodic` in `maiaRuntimeContext.ts` + `context-inventory.available.episodic`. |
| 7 | File location? | New file `lib/maia/episodicRecallBlock.ts` (matches `conversationalRecallBlock.ts` placement); loader functions added to existing `lib/maia/memoryLoaders.ts` (matches where `loadPriorCrossSessionExchanges` / `loadConversationalRecallPref` live). |
| 8 | Tier coverage? | FAST + CORE + **DEEP-repair** reach the prompt (§III.3 finding — the divergence-debt fix already landed for this seam on `origin/clean-main-no-secrets`). DEEP-primary (`consciousnessOrchestrator`) remains observability-only — not fixed by this diff. |
| 9 | Migration? | **None.** The needed column already exists. |
| 10 | Stage language? | **Built + wired; FAST+CORE+DEEP-repair prompt influence, DEEP-primary observability-only; prod witness pending.** Since this diff carries no new migration (§0.A correction), the standard quick `maia`-only rebuild is sufficient for deploy — this deviates from the mission's default assumption of a FULL migration-carrying deploy, and is recorded here rather than silently deployed via the heavier path out of habit. |

---

## §VIII. Relationship to prior ground truth (corrections filed by this build)

Two factual corrections surfaced during implementation, filed here rather
than silently absorbed:

1. **No new migration is needed.** The mission's ground truth assumed
   `episodic_recall_enabled` did not yet exist and asked for migration
   `20260713000001_member_episodic_recall.sql`. It already exists
   (`20260531000001_episodic_member_marked_provenance.sql` §5, dated
   2026-05-31). This build adds zero new migrations.
2. **DEEP is not uniformly observability-only.** The mission's ground truth
   (and CLAUDE.md's priority thread, last updated 2026-05-24/25) describes
   DEEP as blocked at `buildComprehensiveVoicePrompt` never iterating
   `MaiaContext` addenda. On the current `clean-main-no-secrets` tip, the
   DEEP-**repair** path (`buildMaiaComprehensivePrompt`) now calls
   `appendAllContextAddenda` and therefore reaches the prompt — this appears
   to be an already-landed fix to §II.B of
   `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` that CLAUDE.md's priority
   thread has not yet been updated to reflect. The DEEP-**primary**
   (`consciousnessOrchestrator`) path remains unfixed (§II.C, still open) —
   this build does not touch it, consistent with mission scope.
