# Guide as Archetypal Standing Source — architecture & build state

Working spec for the engineering side of **MAIA = Multi-Archetypal Intelligence
Architecture** (canon: [docs/canon/MAIA_MULTI_ARCHETYPAL_INTELLIGENCE.md](../canon/MAIA_MULTI_ARCHETYPAL_INTELLIGENCE.md)).
The grammar this operates through is doctrine, authored separately:
[docs/canon/ARCHETYPAL_GRAMMAR.md](../canon/ARCHETYPAL_GRAMMAR.md).

## Context

"Choose Your Guide" began as a UI surface (localStorage only, no runtime effect).
The work is to make a chosen guide a **standing source** — persisted, present on
every path, informing attention and interpretation — without it becoming MAIA's
identity or possessing the field (canon's three sovereignty clauses).

## Build state

**Phase 1 — continuity foundation (DONE, verified 2026-06-05).** The guide is a
persisted standing continuity field, not a per-turn flag.
- `database/migrations/20260605000001_member_active_guide.sql` — `member_active_guide` (current) + `member_guide_history` (lifecycle log). Applied to dev DBs (PG 17.7).
- `lib/wisdom/wisdomGuidePersistence.ts` — `loadActiveGuide` / `setActiveGuide` / `deactivateGuide` (graceful read, member resolved in-SQL, compact JSONB lens snapshot).
- `app/api/members/wisdom-guide/route.ts` — GET / POST / DELETE.
- `app/api/sovereign/app/maia/list/route.ts` — server-loads the persisted guide (client `meta.wisdomGuide` wins same-session, else server = source of truth) and builds the addendum on every text tier (FAST/CORE/DEEP) via the provenance-preserving `ADDENDA_SPECS` channel.
- `lib/wisdom/wisdomGuidePrompt.ts` — pure, sanitized addendum + lifecycle note.

**Phase 1.5 — continuity gaps (DONE).**
- Cross-device hydration: `OracleConversation` GETs `/api/members/wisdom-guide` on mount and hydrates when local is empty (server is durable truth; same-session local choice wins).
- Clear path: `CurrentTeachingModal` "Step back — continue without a guide" → DELETE (deactivate) + local clear.
- Addendum **reframed** off "tone/style coloration" onto the canonical line: an *archetypal standing source* informing attention/interpretation, coordinate-not-become, "standing never sovereignty," member is final authority (encodes all three clauses).

## Substrate map (what's real vs net-new)

**Reuse (verified):** `ADDENDA_SPECS` standing-source channel w/ provenance (`lib/sovereign/maiaVoice.ts`, all tiers); elemental Wu Xing (live); `buildMaiaContext` identity layer; Bridge D persistence pattern; `MemoryBundle.rankCandidates` `facetMatch` boost (the future retrieval hook); spiral facets/phases.

**Net-new (Kelly-authored doctrine first):** the element→archetype grammar (does not exist); guide→constellation (current model is a single `archetype` string); dynamic standing computation; archetype persistence; memory provenance by archetype; practice/academy alignment.

## Phasing

- **Phase 0 — canon + grammar template:** DONE (the two canon docs). Grammar *content* pending Kelly.
- **Phase 1 / 1.5:** DONE (above).
- **Phase 2 — standing-source integration (BLOCKED on grammar authorship):** encode the **two-tier** grammar (resolved 2026-06-05) as typed primitives — Tier 1 elemental archetypes (`lib/spiralogic/archetypes.ts`) + Tier 2 guide constellations that reference primitives **relationally** (`element` + `relatedPrimitive` + `function`; no premature collapse of Priest→Prophet); model the guide as a constellation (archetypes + weights) instead of a single label; compute "standing" as `guide constellation ⊕ elemental affinities ⊕ developmental affinities` (candidate sources — **no detection**); render standing as a provenance-tagged standing source; engineering owns the **weighting system**. Reports "X has standing here," never "you are X."
- **Phase 3 — retrieval + interpretation:** attach a standing-aware boost at `rankCandidates` (the `facetMatch` hook). *Deferred until spec review.*
- **Phase 4 — memory provenance:** tag new memories with the standing active at formation ("emerged under a Taoist lens / Water Mystic standing"). Touches the sensitive memory substrate + Sanctuary → own spec. *Deferred until spec review.*
- **Phase 5 — practices / academy / developmental trajectories:** derive from the grammar. *Deferred.*
- **Voice:** sequenced **after Phase 2** so it inherits this standing-source architecture rather than spawning a second guide implementation. (Chip task_e65ea672 — do not action before Phase 2.)

## Sovereignty (enforced every phase)

The three clauses (canon): guide ≠ identity / never overrides member meaning;
standing = question never verdict; **no source may possess the field.** Integration
stays selective + provenance-preserving — never broadcast synthesis. Sanctuary
mode excludes any future memory tagging.

## Verification

- Phase 1: migration applies (PG 17.7); persistence SQL smoke-tested end-to-end (upsert/load/deactivate-filter/JSONB round-trip/history) vs a real member, then cleaned up; `tsc` clean on touched files (route shows only pre-existing baseline errors); helper unit-tested.
- Phase 1.5: `tsc` on touched files; addendum unit-tested for standing-source framing + clause language; hydration/clear are non-blocking client paths.
- **Not** exercised: live HTTP round-trip (needs dev server + auth) — runtime gate after deploy is the log marker `🧭 [FAST] Wisdom guide applied`. Migrations run on prod (minisforum) at deploy.
- **Attention-shift claim (separate from all of the above):** persistence + injection are verified; whether the guide *changes what MAIA notices* is **unmeasured** (`present ≠ influential`). Verification path: [`docs/specs/GUIDE_ABLATION_PROTOCOL.md`](../specs/GUIDE_ABLATION_PROTOCOL.md) + harness [`scripts/repro/wisdom-guide-ablation.ts`](../../scripts/repro/wisdom-guide-ablation.ts) — **engage** (lens shifts attention where it fits) **and recede** (lens withdraws where it doesn't — the sovereignty / no-possessing-the-field test). Intended-behavior illustration (operating-lens / *architecture* case study, **not** a transcript): [`docs/pitch/CASE_STUDY_GUIDE_STANDING_SOURCE.md`](../pitch/CASE_STUDY_GUIDE_STANDING_SOURCE.md), indexed in [`ARCHITECTURE_CASE_STUDIES.md`](../pitch/ARCHITECTURE_CASE_STUDIES.md).

## Guide state — persistence, change, indicators

**Persistence.** *(branch: built + verified · prod: ABSENT until deploy — choosing a
guide on prod today is cosmetic; confirmed by minisforum runtime check.)*
- Source of truth: `member_active_guide` (one row/member: guide_id · name · element ·
  JSONB lens snapshot · selected_at · deactivated_at).
- Lifecycle log: `member_guide_history` (append-only: selected | changed | deactivated).
- Fast cache: `localStorage['maia.activeTradition']` (same-session immediacy).
- Cross-device: client hydrates from server on mount when local is empty
  (`OracleConversation` ~1398); server is durable, local wins same-session.

**When it changes** (standing field — only on explicit member action; never per-turn):
- **Select** (picker `onSelect` ~9206) → POST → `setActiveGuide` → history `selected`
  (first) or `changed` (different id); `selected_at` resets on change, preserved on re-affirm.
- **Clear** ("Step back" ~9241) → DELETE → `deactivateGuide` → history `deactivated`.
- **New-device load** (~1398) → GET hydrate (fills local; does not mutate server).
- Same-session client choice applies immediately; the server write is fire-and-forget.

**Indicators that MAIA is engaging the guide:**
- *Member-facing — selection state (built):* "Currently Guiding You: <tradition>"
  (CurrentTeachingModal); "Active" badge (picker); "Now guided by X" toast; "Step
  back" affordance; prompt lifecycle line "kept this source standing since <date>".
- *Ops / observability — per-turn engagement (built):* log markers
  `🧭 [FAST] Wisdom guide applied: …` (text), `🧭 [Wisdom Guide] Applied` (ADDENDA_SPECS,
  CORE/DEEP), voice marker (voice branch); + `member_guide_history` audit trail.
- **Gap (honest):** these show a guide is *selected* and that the addendum *fired*
  (ops only). There is **no member-facing indicator that MAIA is actively drawing on
  the guide in a given response.** That belongs to Phase 2 standing-source rendering
  ("the Priest has standing here") and is gated on the grammar + the three clauses. A
  premature "MAIA is using your guide" badge would inflate liveness (assert
  per-response engagement we don't yet measure) and risk clause-2/3 violations — so
  it is deliberately not built.

## Open

- **Translate, not deepen — empirical (ablation 2026-06-06).** Three runs of
  `scripts/repro/wisdom-guide-ablation.ts` (protocol: `docs/specs/GUIDE_ABLATION_PROTOCOL.md`)
  established: the thin payload moves only the orthogonal-and-concrete lens (Taoism:
  engage **+0.67–1.00**, recede confirmed, low imposition — `engage ≠ possession`
  shown behaviorally); Vedic does **not** engage even on a duty-relevant secular prompt
  because the payload ships religious *content* (`principles: [Rta, Agni, …]`) and MAIA
  correctly won't impose it on a secular question (a sovereignty success, not a bug).
  **Phase 2 must encode each archetype's `function` (attentional translation — *how it
  attends*), not richer content. The grammar's `function` field IS the translation
  layer the payload lacks** (Priest → "consecrates attention"). Also established: MAIA's
  baseline attractor is **adaptive by domain** (Jungian on inner-work, practical/Taoist
  on action), not a single hidden default guide. State: *mechanically standing,
  constitutionally unfinished.* See `docs/papers/GUIDE_AS_OPERATING_LENS_2026-06.md`.
- **Grammar authorship (Kelly)** — the blocker for Phase 2 (see `ARCHETYPAL_GRAMMAR.md` open questions, esp. reconciling the element grid vs guide-constellation vocabularies).
- Authorship split ratified: engineering = schema/persistence/rendering/weighting/integration; doctrine = grammar/constellations/sovereignty language.
