# Book Studio Mirror-Safe Source Gate — SPEC

**Status:** CANDIDATE (spec only — not ratified, not built).
**Date:** 2026-07-02
**Author:** design pass under Architectural Integrity Mode
**Governs:** the surface answering *"What in my Living Field is ready to become writing?"*
**Grounds in canon:** `docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md:72` — *"The system may draft from selected, member-owned material; it may never synthesize identity."*
**Sequencing directive (Kelly, 2026-07-02):** *Spec it, integrity-pass it, then consider ratification after it survives implementation pressure.* Do **not** ratify the principle into canon yet.

---

## 0. The Candidate principle (preserved, not canonized)

> **Legacy writing begins where the member has *made* the Living Field articulate. MAIA surfaces what already speaks; it does not decide what is ready to be spoken.**

Held as **Candidate** — a downstream extension of the Living Field Mirror Invariant and the Constitutional Direction of Authority. It earns ratification only after the gate below survives implementation.

---

## 1. Acceptance criterion (the falsifier)

**There must be no executable path from a MAIA-inferred theme to a Book Studio writing prompt.**

Every input to any Book Studio prompt/surface must trace back to a **member act** (kept, marked, accepted, named, or authored-and-confirmed). The test harness must be able to *fail* on the existence of such a path — not merely inspect copy.

Corollary (Constitutional Completion): the capability and R06 ship together, or neither ships. A "what's ready to become writing?" surface built without R06 silently converts a currently-free refusal (Book Studio has no memory readers) into a violated one.

---

## 2. Substrate → allowed source classes → provenance marker

Real tables/columns (verified against migrations, 2026-07-02). Each allowed source has a **positive member-act predicate** the query filters on — the predicate *is* the refusal.

| # | Allowed source class | Table | Member-act predicate (WHERE) | Verified |
|---|---|---|---|---|
| 1 | **Keeps** | `member_memory_atoms` | `kept_at IS NOT NULL AND status IN ('active','still_alive','protected')` | ✅ `20260521000001_member_memory_atoms.sql` |
| 2 | **Breakthrough-marked atoms** | `member_memory_atoms` | `is_breakthrough = TRUE` (coherence-constrained w/ `marked_breakthrough_at`; system never auto-sets) | ✅ `20260524000002_..._breakthrough.sql` |
| 3 | **Accepted reflections** | `encounter_moments` | `status = 'accepted' AND artifact_type = 'accepted_recognition' AND authored_by = :memberId` | ✅ `20260629000001_encounters.sql` |
| 4 | **Member-authored/confirmed notes** | `member_field_note_threads` | `authorship IN ('member_authored','member_confirmed')` | ✅ `20260626000001_member_field_note_threads.sql` |
| 5 | **Named spirals** | `personal_spirals` | `member_id = :memberId AND title IS NOT NULL` — *pending §4.2 writer audit* | ⚠️ `20260701000002_personal_living_fields.sql` |
| 6 | **Member recognitions** | `recognitions` | `authored_by = :memberId` | ✅ (recognitions table) |

**Explicitly forbidden source classes** (must be structurally unreachable — see §5):

| Forbidden class | Where it lives (do NOT import into Book Studio) |
|---|---|
| MAIA-only inferred themes / parallel epistemic emission | `corpusCallosumService.ts`; tables `agent_runs`, `integration_passes` |
| System-inferred breakthrough (collective) | `lib/utils/breakthroughDetection.ts` `detectBreakthrough()` |
| System-derived spiral state | `lib/consciousness/spiralStatePersistence.ts`; `member_spiral_state` (element/phase/motion/intensity) |
| Hidden clusters / psychological summaries / "you seem to be…" | `MAIAMemoryArchitecture`, `QuantumFieldMemory`, `MorphicPatternService`, `ConsciousnessEvolutionService`, any `*cluster*`/`*summarize*`/`*detect*` module |
| Un-kept atoms & conversational-synthesis formatting | `member_memory_atoms` rows with `kept_at IS NULL`; the synthesis-formatting paths in `memoryAtomsLoader.ts` (Grade-C prose) |

---

## 3. Provenance requirement

A row may pass the gate only if it carries a **durable member-act marker** at the row level. `member_id` ownership is **not** sufficient — an un-kept atom is member-owned but MAIA-extracted. The marker must be a column set by an authenticated member action (`kept_at`, `is_breakthrough`, `status='accepted'`, `authorship` member-value, member-created `title`).

This is the two-field-provenance principle (`authored_by` + acceptance state) applied at read time: **a consumer may only elevate authority, never reinterpret authorship.**

---

## 4. The seams (surfaced, not papered over)

### 4.1 Living Field *dimensions* are EXCLUDED at v1

`personal_living_field_versions.authored_by` is `TEXT DEFAULT 'member'` — a two-state field with **no enforced system-derived value**, and `personal_living_fields` carries no `member_confirmed` boolean. A MAIA-drafted dimension version therefore reads as `authored_by='member'` by default. **This source cannot prove member authorship at the row level** and must not enter Book Studio.

**Requirement to admit it later (Constitutional Completion):** add a member-act marker to `personal_living_fields` matching the `member_field_note_threads` three-state pattern (`authorship ∈ {maia_proposed, member_authored, member_confirmed}` + `member_confirmed_at`), and set system drafts to a non-member value. Until that migration ships, the dimension source stays out. **No runtime `WHERE authored_by='member'` filter substitutes for this** — the default makes it a lie.

Note the irony worth stating plainly: the surface is *named* for the Living Field, yet the Living Field dimension table is the one source not yet admissible. The name describes the destination (member-articulated selfhood), not the v1 query.

### 4.2 `personal_spirals` writer audit — RESOLVED GREEN (2026-07-02)

Audited: the **only** writer to `personal_spirals` is `app/api/maia/living-field/spirals/route.ts:51` (POST). `title` comes strictly from the authenticated member's request body (`body.title`, rejected if empty at `:45`); there is no `UPDATE` path and **no internal caller** — nothing in `app`/`lib`/`components` POSTs to that endpoint, so no MAIA/service flow injects a generated title. The `spiral + generate/title` matches elsewhere (beta-journey ASCII viz, soul portraits, demo orchestrator) touch other structures, not this table. **Conclusion: `personal_spirals.title` is member-authored by construction. Source #5 is admissible.** (Auth is the platform-standard `x-member-id` header — the identity model for every member write, not an R06 authorship concern.)

---

## 5. Architecture & enforcement point

Single choke point. One module reads member material; Book Studio imports **only** from it.

```
lib/bookStudio/mirrorSources.ts   ← NEW. Only file permitted to read member material for Book Studio.
   exports: getWritableMaterial(memberId): MirrorSource[]
   - one typed query per allowed class (§2), each with its member-act WHERE predicate hardcoded
   - imports ONLY lib/db/postgres `query`
   - imports NONE of the §2-forbidden modules
   ↓
app/book-studio/**  (prompt/surface code)
   - imports member material ONLY from lib/bookStudio/mirrorSources
   - imports NONE of the §2-forbidden modules
```

`MirrorSource` type carries provenance to the surface so the UI can attribute every offered fragment to its member act ("You kept this", "You marked this a breakthrough", "You accepted this reflection") — no un-attributed fragment renders.

**Note on the existing Workbench db path (audited 2026-07-02):** the surface is *not* db-free today — `app/book-studio/workbench/page.tsx` and `app/api/book-studio/workbench/uploads` read/write `workbench_tables` / `workbench_uploads` (the studio's own arrangement scaffolding, member-keyed, founder-gated). These are neither member-memory content nor an inference surface, so the guard does **not** ban db access wholesale; it bans reads of the *inference tables* and the *member-material tables* specifically — which forces the latter through `mirrorSources`. (The workbench already declares this discipline in its own docstring: *"No commentary, no suggested clusters, no synthesis. That silence is structural, not stylistic."*)

---

## 6. R06 — Refusal Registry entry

```
| Refusal | Grade | Enforced by | Evidence | Test | Upgrade path | Hostile fork must change |
| R06: Book Studio must not generate legacy-writing prompts from MAIA-only inferred themes, hidden clusters, unstated psychological summaries, or unaccepted Living Field reflections. | A (reader-absence) + B (query predicate) | absence of forbidden imports in app/book-studio/** and lib/bookStudio/mirrorSources.ts; member-act WHERE predicate in every mirrorSources query | app/book-studio/** (no memory readers today); lib/bookStudio/mirrorSources.ts (once built) | tests/constitutional/refusal-registry/refusal-06-book-studio-member-authored-only.ts | keep A-half free by never importing forbidden surfaces; promote B-half by typing queries so a non-member-act row is unrepresentable | ADD a forbidden import/reader (visible diff) OR change/remove a member-act WHERE predicate (visible diff) |
```

**Grade justification (two halves, honestly separated):**

- **A-half (reader absence)** — modeled on **R02** (`agent_runs`/`integration_passes` have no readers). Book Studio importing none of the §2-forbidden modules is Grade A: defeating it requires *adding a reader* = visible diff. **This half is enforceable and passes vacuously today**, before the feature is built.
- **B-half (query predicate)** — modeled on **R05** (explicit-flag default). Each `mirrorSources` query hard-codes its member-act predicate; defeating it requires *changing a guarded predicate* = visible diff. Grade B.

**Not Grade C.** No part of R06 is a prompt instruction. We do not tell MAIA "please only use accepted material" — that is the existing `memoryAtomsLoader.ts` Grade-C pattern this spec exists to avoid.

---

## 7. Test harness design (`check:refusals`)

Model files: `refusal-01-memory-loader-no-write.ts` (grep for banned patterns), `refusal-05-...-no-implicit-practitioner-share.ts` (parser-default assertion). Structural assertions on code, not line numbers — survives refactor.

`refusal-06-book-studio-member-authored-only.ts` exports a `RefusalCheck` whose `run(io)`:

1. **A-half — forbidden-reader ban.** `io.grep()` across `app/book-studio/**` and `lib/bookStudio/mirrorSources.ts` for imports of any forbidden surface (`corpusCallosumService`, `breakthroughDetection`, `spiralStatePersistence`, `MAIAMemoryArchitecture`, `QuantumFieldMemory`, `MorphicPatternService`, `ConsciousnessEvolutionService`) and for raw table reads of `agent_runs`, `integration_passes`, `member_spiral_state`. Any hit → `io.fail()`.
2. **A-half — single-choke-point.** Assert `app/book-studio/**` reads member material **only** via `lib/bookStudio/mirrorSources`. Any other `from '@/lib/db/postgres'` / `pg` import under `app/book-studio/**` → `io.fail()`.
3. **B-half — predicate presence.** In `mirrorSources.ts`, assert every query carries a member-act predicate (`kept_at`, `is_breakthrough`, `status.*accepted`, `authorship`, member-scoped `title`). A query selecting from an allowed table **without** its predicate → `io.fail()`.
4. **Seam guard.** Assert `mirrorSources.ts` does **not** query `personal_living_fields`/`personal_living_field_versions` (excluded per §4.1 until it earns a marker). Hit → `io.fail()` with the §4.1 upgrade note.

`passingAuthorizes`: "no forbidden source class is reachable from Book Studio; every offered fragment is member-act-marked."
`passingDoesNotAuthorize`: "does not prove the *content* of a kept/accepted item is profound, nor that the member's articulation is complete — only that authorship is theirs."

**Free-lock opportunity:** steps 1–2 pass *today* (Book Studio has no memory readers). Landing R06 with only the A-half active, before the feature is built, structurally guarantees the feature can't be built through a synthesis path later. Recommended.

---

## 8. Six primary checks (integrity pass)

1. **Ontology/layer** — ✅ Book Studio sits in Developmental Ecology (Offering movement). It draws *from* the member's articulated material outward; it does not author a rung. Authority flows up-then-out, never manufactured.
2. **Jurisdiction/authority** — ✅ No component claims to decide "what is ready." Readiness = member act. MAIA's role is surfacing + attribution.
3. **Provenance** — ✅ observation ≠ interpretation ≠ decision preserved: only *member-decided* rows pass; every fragment renders with its member-act attribution.
4. **Direction of authority** — ✅ enforced *downward* (schema predicate + reader absence), not upward in prompt text. This is the whole point of grading it A/B not C.
5. **Candidate vs canon** — ✅ principle held Candidate; ratification deferred to post-implementation per directive.
6. **Evidence proportionality** — ✅ no claim that the surface produces "legacy" or "insight" — only that inputs are member-authored. Content quality is explicitly out of scope (§7).

---

## 9. Proof statement

- **Proven (by this spec):** the mirror-safe surface is buildable as a Grade A/B structural refusal because (a) every allowed source already carries a member-act column, and (b) Book Studio currently has zero memory readers, so the "no inference path" property exists by absence and need only be *preserved*.
- **Not proven:** that any member material is *ready* or *worth* writing (content judgment — out of scope); that Living Field *dimensions* can be admitted (blocked on §4.1 provenance marker); that `personal_spirals` is member-only-authored (blocked on §4.2 audit).
- **Pending:** ~~(1) §4.2 spiral-writer audit~~ **DONE 2026-07-02 — GREEN**; ~~(3) land `refusal-06` A-half~~ **DONE 2026-07-02 — `refusal-06-book-studio-member-authored-only.ts`, harness 19 passed · 0 failed · 6 refusals**; remaining: (2) build `lib/bookStudio/mirrorSources.ts` (activates R06 B-half); (4) §4.1 migration adding a member-act marker to `personal_living_field*` before dimensions may enter; (5) reconvene on ratifying the §0 principle only after the gate survives implementation pressure.

---

## 10. Implementation log

- **2026-07-02** — §4.2 audit resolved GREEN (source #5 admissible). R06 **A-half** landed: `tests/constitutional/refusal-registry/refusal-06-book-studio-member-authored-only.ts` (registered in `index.ts`); registry row added to `docs/architecture/REFUSAL_REGISTRY.md`. Harness: **19 passed · 0 failed · 0 warned (6 refusals)**. The A-half passes by *preserving* the current absence of any memory/inference reader in the Book Studio surface — a ratchet, not a placeholder.
- **2026-07-02 (later)** — `lib/bookStudio/mirrorSources.ts` implemented as a **constitutionally-constrained reader** (its contribution is *what it refuses to read*, not that it reads); R06 **B-half active**. Then an adversarial verification pass (5 skeptics, one per source + completeness + SQL-validity) **found two bypasses that changed v1** — see §11. Net result: R06 harness **25 passed · 0 failed · 0 warned**; typecheck clean. **Reader: constrained-v1 implemented (no surface wired yet). Ratification: not done.**

---

## 11. Adversarial verification (2026-07-02) — findings & v1 admission set

Five independent skeptics tried to *refute* mirror-safety of each admitted source. Two found real bypasses; both were resolved by **hardening or deferring**, not by weakening the claim.

| Source | Bypass | Sev | Resolution |
|---|---|---|---|
| **notes** (`member_field_note_threads`) | **YES** | **HIGH** | **DEFERRED.** `member_confirmed=TRUE` is server-stamped unconditionally; `authorship='member_confirmed'` derives from a client-supplied `decision` flag with no server verification the proposal was MAIA-issued or member-acted. MAIA's verbatim proposed prose could circulate as "You accepted this reflection" (the vision-studio writer has no consent/tester gate). This is a live path from MAIA content → prompt — the acceptance criterion's falsifier. Re-admit only after: write-side `member_decision_at` binding + proposal-provenance verification + vision-studio consent/tester gate, and read predicate additionally requires `member_decision_at IS NOT NULL`. |
| keep + breakthrough (`member_memory_atoms`) | yes | LOW | **HARDENED.** Exclusion of the one non-member writer (facilitated With-Me path) rested on the `source_type` string literal alone. Added the **positive structural marker `facilitator_id IS NULL`** (only With-Me stamps it; cannot drift on a source_type rename). `is_breakthrough` verified never system-set. |
| named_spiral (`personal_spirals`) | no | LOW | **GUARDED.** Safe by write-monopoly, but *inherited* (no `authored_by` column). Added R06 **B5**: a CI assertion that no file other than the member-POST route writes `personal_spirals` — a future agent-writer now fails the harness. |
| completeness | no | LOW | Deferrals all confirmed justified; no over-admission; `loadKeptAtoms` is *stricter* than spec §2. |
| SQL validity | no | none | All predicates valid; sacred-register exclusion, `memory_scope` backfill (old rows read `'personal'`), and consent CHECK-match all correct. |

**v1 admission set (post-adversarial):** three structurally-provable classes across two tables —
`keep` + `breakthrough` (`member_memory_atoms`, with `facilitator_id IS NULL`) and `named_spiral` (`personal_spirals`, write-monopoly + B5).

**Deferred (v1), each with its earned-marker condition:** `member_note` + `accepted_reflection` (notes — HIGH, above); `encounter_recognition` (encounter — `artifact_type` never persisted, acceptance is a practitioner act on PHI); Living Field dimensions (§4.1). Note: the member's own accepted reflections were *intended* to ride on `member_field_note_threads` — deferring it is a real capability reduction for v1, made because the acceptance is not yet structurally provable at the read choke point.

**Lesson recorded:** documentation review (the completeness skeptic said "SHIP") was overridden by the deeper writer-trace (the notes skeptic found the HIGH bypass). Adversarial diversity — a skeptic that *traces every writer* vs. one that *reads the schema* — is what caught it. The spec §2 table predates this pass; §11 is the authoritative v1 admission set.
```
