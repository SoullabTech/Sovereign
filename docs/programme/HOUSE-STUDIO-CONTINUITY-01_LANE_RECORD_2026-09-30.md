# HOUSE-STUDIO-CONTINUITY-01 — House → Writer's Studio carries the Work the member chose

```text
Class: B (bounded implementation; navigation only)
Governing authority: founder direction 2026-09-30 ("let's get going" · "make it a Jarvis flow");
                     founder rulings D-01…D-03 (2026-09-30, §6); bounded by WS2-03B
                     (app/writers-studio/workContext.ts) and the no-stealth-memory vow.
Current gate: VERIFY PASS → FOUNDER WALKTHROUGH + MERGE REVIEW PENDING
Evidence subject: branch claude/beautiful-mayer-mt9jc9 on base 04005ca7c
Stop boundary: no stored context, no inference of intent, no MAIA input, no new
               crossing vocabulary, no merge, no deploy
```

## 1 · Gate question

When a member chooses a living Work in the House, does the Writer's Studio receive **which
Work** — without storing the movement, without guessing a manuscript, and without trusting
an id that is not the member's?

## 2 · Census (ORIENT / DISCOVER) — what already existed

| Concept | What it is | Disposition |
|---|---|---|
| `lib/house/livingOrientation.ts` `FACET_CROSSINGS` | Governed registry of place→place crossings (carries · mode · authority · standing · law) | The portal contract. **Not extended here** — its endpoints are House *places*; the House itself is not one, and adding it is a vocabulary change (D-02). |
| `lib/house/facetCrossing.server.ts` · `/api/house/carry-source` | Allowlisted carries, server ownership validation, `returnHref` | Reused as precedent: identity crosses, the receiver re-validates. |
| `member_facet_crossings` | Written only when a member act *produces an artifact* | Sets the persistence rule: navigation writes no row. |
| `?from=house` · `?from=home` | Entry provenance, no content | The lawful navigation shape; kept. |
| `app/house/passingContext.ts` | Public daily-quote selector | ⛔ Not a context spine. Untouched. |
| `app/writers-studio/workContext.ts` (WS2-03B) | Current Work derived from member declarations; never stored; never "first" or "most recent" | Governs the receiving side. |
| `useLivingWorks.ts` `arrivalWork()` | With 2+ Works, "which did you come back to?" is a real question the Studio may not guess | A House click is the member answering it. |
| **Defect** `app/house/page.tsx` | Every "What's alive" row linked to bare `/writers-studio` | Repaired. |

**Proposals refused at census, with reasons** (from the external drafts): a stored
`TransitionContext` / continuation token / context store (a log of where a member walks =
stealth memory; second source of truth against WS2-03B) · `activeWork = livingWorksForHouse[0]`
(the refused guess) · system-assigned `activeIntent` or "Last movement: …" (MAIA/system
declaring on the member's behalf) · a parallel `lib/context/` layer (duplicates the crossing
registry) · MAIA receiving House context (a new cognition input; separate act).

## 3 · Build (the candidate)

| File | Change |
|---|---|
| `app/writers-studio/houseArrival.ts` | **New.** `houseWorkHref(workId)` → `/writers-studio?from=house&work=<id>`; pure `resolveHouseArrival(id, phase, works)` → `none · pending · unknown · open · orient`. Law in header. |
| `app/house/page.tsx` | Each living Work row links via `houseWorkHref(work.id)` with an accessible label; empty-state link gains `?from=house` (matching the catalog). |
| `app/dev/writers-studio-pc3-live/P4R1HomeController.tsx` | Resolves the carried id against the member's own Works; on `open`, `router.replace` to Write mode with `m=<manuscript>` (drops `work`), so Back returns to the House. `orient` / `unknown` → Studio Home exactly as before. |
| `app/writers-studio/houseArrival.ts` · `houseArrivalTarget()` | Pure landing-URL builder: drops `work`, names only `m` (added for HSC-F7). |
| `app/writers-studio/__tests__/houseArrival.test.ts` | **New.** Falsifiers HSC-F1…F7. |

Crosses: **one living-work id**. Stored: **nothing**. Ownership: the id resolves only against
`/api/sovereign/living-works` (member-scoped); the manuscript is then loaded by the existing
Canvas path, which enforces its own ownership.

## 4 · Verify / falsify

**Instrument:** `npx jest --config jest.config.js app/writers-studio/__tests__/houseArrival.test.ts`
(jest 29.7.0 / ts-jest 29.4.6 / TS 5.6.3 installed in a scratchpad — no project `node_modules`
in the container; ⭐ the founder's run is the evidence of record).

**Result:** 15/15 PASS · neighbours `livingOrientation.test.ts` + `homeState.test.ts` PASS
(60/60 across the three suites) · `check:no-supabase` exit 0.

**Controlled failure — every weaker candidate killed by exactly its named falsifier, no collateral:**

| Mutant | Killed by |
|---|---|
| M1 open the first of several manuscripts | HSC-F1 |
| M2 fall back to `works[0]` for a foreign id | HSC-F2 |
| M3 resolve while Works still loading | HSC-F3 |
| M4 carry `intent=continue` in the URL | HSC-F4 |
| M5 House keeps bare `/writers-studio` | HSC-F5 |
| M6 controller writes `sessionStorage` | HSC-F6 |
| M7a landing keeps `work=` | HSC-F7 (both cases) |
| M7b landing forwards the Work under another key (`w=`) | HSC-F7 (both cases) |

**Typecheck:** strict + `noUncheckedIndexedAccess` over the seam and its test → **0 diagnostics
in lane-owned files**; 2 in the type-only neighbour `useLivingWorks.ts` (unresolved `@/` alias
under a bare CLI; that file is not written to the extra flag) — pre-existing, ⛔ not repaired here.
⚠️ **The project gate `npm run typecheck` (ship baseline) was NOT run** — needs full dependencies.

## 5 · Adjudication

**Disposition (founder, 2026-09-30):**

```text
Status:   IMPLEMENTATION COMPLETE · EVIDENCE COMPLETE · FOUNDER WALKTHROUGH PENDING · MERGE PENDING
Boundary: BUILD AUTHORIZED · MERGE NOT AUTHORIZED · DEPLOY NOT AUTHORIZED
```

The lane has crossed the design/build threshold, not the acceptance threshold.

**Three questions the lane keeps apart** (their collapse — *arrival → identity → relationship* — is
the failure it prevents):

| Question | Answers | Standing |
|---|---|---|
| **Entry** | how did the member arrive here? | temporary — dropped at the landing (F7) |
| **Identity** | what is this thing? | requires declarations |
| **Relationship** | what does this belong with? | requires evidence |

*Context is temporary authority, not inherited identity.*

This proves:
1. **Context continuity** — a member's intentional movement preserves which Work they chose.
2. **Context without authority** — the URL id is a request; authority stays with session
   identity + server-scoped reads + member declarations. An id that is not theirs opens nothing.
3. **Movement is not memory** — nothing is written because circulation occurred.
4. **Context does not outlive its validation (F7)** — the entered-through Work is dropped at the
   landing; the Studio re-derives Work from declarations, so moving on to other writing carries
   nothing along.
5. One declared manuscript opens; zero or several are never guessed.

It does **not** prove, and does not establish:
- **persistent continuity** — no "member last worked on W" exists; that needs a separate
  member-intent model and its own act;
- **a general circulation architecture** — this is the first expression; no reusable
  abstraction has been extracted;
- **MAIA awareness** — MAIA receives nothing from this lane;
- **Work ontology** — it answers *which Work context did the member explicitly enter through*,
  never *what a manuscript ultimately belongs to*;
- the ship-baseline typecheck, a rendered browser walk, or production behaviour.

## 6 · Founder rulings (2026-09-30)

- **D-01 — OWN LANE.** A foundational *circulation* lane, not step 3 of Writer's Studio
  convergence. Convergence asks how the Studio becomes the canonical writing environment; this
  asks how meaning moves between living surfaces without being lost or fabricated. **Writer's
  Studio consumes the capability; it does not own it.** Future carries (House → Journal ·
  MAIA → Studio · Studio → Field · Field → Journal) answer to this law, not to the Studio lane.
- **D-02 — NO.** The House does not become a `FACET_CROSSINGS` endpoint. The registry describes
  place → place movement; the House is **orientation into the ecosystem** (whole → part), and
  registering it would flatten that into place → place — a category mistake.

  | Thing | Function |
  |---|---|
  | Crossing registry | movement between governed places |
  | House | orientation into the ecosystem |
  | Work context | meaning carried into a place |
  | URL payload | temporary explicit context |
  | Persistence | created only by artifact / member acts |
- **D-03 — DIRECT WRITE, ONLY UNDER THE THREE-STATE RULE.** The gesture was *continue this
  Work*, not *take me to the Studio*; with exactly one legitimate continuation, asking again is
  friction. **0 manuscripts → Studio Home · >1 → Studio Home** stays binding — otherwise the
  system starts pretending to understand intention.
- **Added by ruling: HSC-F7** — *context survives only while the relationship validates*;
  delivered above (M7a/M7b killed).

**Circulation laws (founder, carried forward as the lane's statements):**
- *A living system does not preserve everything that passes through it. It preserves the
  relationships that remain alive under validation.*
- ⭐ ***A path may reveal relationship, but it may not create relationship.*** — the same rule
  future MAIA memory, journals, fields and relational graphs must answer to: movement is not
  meaning.

**Authorized and delivered:** ✓ Work-id transport · ✓ explicit context preservation · ✓ server-scoped
validation · ✓ no persistence · ✓ no crossing-registry expansion · ✓ no memberId transport ·
✓ no content payload.

- **Owed before merge:** `npm run typecheck` (no regression vs baseline) · the founder walk
  below · visual authority (`ea-house.md` + screenshots, still uncommitted on the Mac Studio).

**Founder walk — tests authority, not only navigation:**

1. **One manuscript** — House → Work with one manuscript → opens in Write → Back → House, unchanged.
2. **No manuscript** — House → Work with none → Studio Home, nothing guessed.
3. **Several manuscripts** — House → Work with 2+ → Studio Home, nothing guessed.
4. **Context release (the real F7 acceptance)** — House → Work A → Manuscript A1 → move within the
   Studio to Manuscript B1. Verify: no `work=` in the URL; no hidden Work state; B1 resolves by
   **B1's own declarations**. *Does the system let go when the member moves?*

   Static support, ⛔ not a substitute for the walk: every Studio `localStorage` /
   `sessionStorage` key in `app/writers-studio/**` and `app/dev/writers-studio-*/**` is keyed by
   **manuscript id** (writing surface, developmental/lineage orientation, attention map) or is an
   appearance/session preference — **none is keyed by Work**, and no Studio code reads a `work` /
   `w` / `workId` query parameter other than this seam.

## 6a · Merge review — in this order

1. **Evidence** — lane record · census · falsifier suite · mutation evidence · F7 release proof.
2. **Environment** — canonical `npm run typecheck` · canonical test commands · walks 1–4.
3. **Visual authority** — `ea-house.md` + screenshots committed. Not documentation only: it is the
   counterweight to *"add a recent Works list" / "remember where they were" / "make Continue
   smarter"*. **The House presents living possibilities; it does not narrate the member's history.**
4. **Review question** — *Does this implementation preserve the difference between member
   intention, system inference, and durable relationship?* **Yes → merge. No → STOP.**

## 7 · H1-R3 return boundary

H1-R3 reuses the existing House threshold rather than inventing a Studio return
mechanism.

`app/writers-studio/layout.tsx` now places
`HouseEntryThreshold room="WRITER'S STUDIO"` at the Studio's outer boundary.
The existing threshold already enforces the needed law:

- it appears only when `from=house` is present;
- it returns through canonical `/home`;
- it does not know the Work or manuscript;
- it creates no persistence;
- it introduces no `FACET_CROSSINGS` vocabulary.

This is therefore a **navigation membrane**, not a memory layer.

Behavioral witness:
- House → Studio → Return Home → `/home`: PASS.
- Direct Studio entry → no House return threshold: PASS.
- H1-R1 Work/manuscript landing identity remains unchanged: PASS.

Verification:
- Writer's Studio: **78 suites / 805 tests PASS**.
- Focused H1-R2 + H1-R3: **19 tests PASS**.
- Project typecheck: blocked by unrelated new diagnostic
  `lib/stripe/config.ts:23` (Stripe API version type mismatch). No H1-R3
  diagnostic was reported.

**H1-R3 disposition:** IMPLEMENTATION COMPLETE · BEHAVIORAL EVIDENCE COMPLETE ·
MERGE REVIEW PENDING.

## 7 · Explicit non-authorizations

⛔ merge · ⛔ deploy · ⛔ migration · ⛔ stored context / continuation tokens · ⛔ MAIA context
input · ⛔ intent inference · ⛔ crossing-registry vocabulary change · ⛔ JARVIS observation layer.
