# HOUSE-STUDIO-CONTINUITY-01 — House → Writer's Studio carries the Work the member chose

```text
Class: B (bounded implementation; navigation only)
Governing authority: founder direction 2026-09-30 ("let's get going" · "make it a Jarvis flow"),
                     bounded by WS2-03B (app/writers-studio/workContext.ts) and the
                     no-stealth-memory vow. Placement under WRITERS-STUDIO-CONVERGENCE-01
                     (step 3) vs its own lane is ⛔ NOT RULED — see D-01.
Current gate: BUILD → VERIFY (candidate on branch; merge not authorized)
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
| `app/writers-studio/__tests__/houseArrival.test.ts` | **New.** Falsifiers HSC-F1…F6. |

Crosses: **one living-work id**. Stored: **nothing**. Ownership: the id resolves only against
`/api/sovereign/living-works` (member-scoped); the manuscript is then loaded by the existing
Canvas path, which enforces its own ownership.

## 4 · Verify / falsify

**Instrument:** `npx jest --config jest.config.js app/writers-studio/__tests__/houseArrival.test.ts`
(jest 29.7.0 / ts-jest 29.4.6 / TS 5.6.3 installed in a scratchpad — no project `node_modules`
in the container; ⭐ the founder's run is the evidence of record).

**Result:** 12/12 PASS · neighbours `livingOrientation.test.ts` + `homeState.test.ts` PASS
(57/57 across the three suites) · `check:no-supabase` exit 0.

**Controlled failure — every weaker candidate killed by exactly its named falsifier, no collateral:**

| Mutant | Killed by |
|---|---|
| M1 open the first of several manuscripts | HSC-F1 |
| M2 fall back to `works[0]` for a foreign id | HSC-F2 |
| M3 resolve while Works still loading | HSC-F3 |
| M4 carry `intent=continue` in the URL | HSC-F4 |
| M5 House keeps bare `/writers-studio` | HSC-F5 |
| M6 controller writes `sessionStorage` | HSC-F6 |

**Typecheck:** strict + `noUncheckedIndexedAccess` over the seam and its test → **0 diagnostics
in lane-owned files**; 2 in the type-only neighbour `useLivingWorks.ts` (unresolved `@/` alias
under a bare CLI; that file is not written to the extra flag) — pre-existing, ⛔ not repaired here.
⚠️ **The project gate `npm run typecheck` (ship baseline) was NOT run** — needs full dependencies.

## 5 · Adjudication

**BUILD → candidate. VERIFY: PASS (bounded).**
This proves: the carried id is resolved only against the member's own Works; one declared
manuscript opens, zero or several never are guessed; nothing is written; the URL carries
identity only; the House door carries the Work.
It does **not** prove: the ship-baseline typecheck; a rendered walk in a browser; behaviour
for a member in production; that Write mode is the right landing (vs Studio Home focused on
the Work) — that is a founder-walk question.

## 6 · Founder handoff

- **D-01** Placement: rule this as step 3 of `WRITERS-STUDIO-CONVERGENCE-01`, or as its own lane.
- **D-02** Should the House become an endpoint in `FACET_CROSSINGS` so House doors are
  registered crossings? (Vocabulary change; not taken.)
- **D-03** Landing: open Write mode directly (candidate), or Studio Home with the Work in focus.
- **Owed before merge:** `npm run typecheck` (no regression vs baseline) · the founder walk
  below · visual authority (`ea-house.md` + screenshots, still uncommitted on the Mac Studio).

**Founder walk (5 steps):** House → click a Work with one manuscript → Studio opens that
writing in Write → Back → House, unchanged. Repeat with a Work that has no manuscript →
Studio Home, nothing guessed.

## 7 · Explicit non-authorizations

⛔ merge · ⛔ deploy · ⛔ migration · ⛔ stored context / continuation tokens · ⛔ MAIA context
input · ⛔ intent inference · ⛔ crossing-registry vocabulary change · ⛔ JARVIS observation layer.
