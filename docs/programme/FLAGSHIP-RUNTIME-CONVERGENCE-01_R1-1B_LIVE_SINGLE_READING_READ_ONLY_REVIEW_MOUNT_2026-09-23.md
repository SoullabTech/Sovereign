# FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-1B — Live Single-Reading Read-Only Review Mount

**Date**: 2026-09-23
**Act**: R1-1B (founder-authorized after R1-1A PASS)
**Base**: `b867abeba` on `fix/flagship-ec1-contract-reconciliation-20260923` · **canonical** `d0261b939` (advance from `3f63ca653` = one JARVIS record, zero Writer's Studio overlap)
**Lineage**: suite `d9519af8a` → L8 fixture `e52b12e5e` → D8 narrowing `2f509e21e` → mount `5abfebf51` → this record
**Authority**: one explicitly selected durable reading, read-only, on the existing route. ⛔ No aggregation · no cognition · no member write · no visible Review navigation · no C1B-L6 or FS1 change · production untouched. ⛔ STOPPED for founder adjudication. No R1-1C authority taken.

## 0. Standing at the top

- **The first real flagship Review runtime exists.** `/writers-studio/rebuild?m=<work>&reading=<id>` loads the member-owned ledger, then exactly that reading, maps it through the unchanged R1-0 mapper, binds every finding to the current manuscript context, and mounts the R1-1A `ReviewPresentation` with `READ_ONLY_REVIEW_CAPABILITIES` inside the unchanged Write-only shell. Without `reading=` the Write runtime is byte-identical to before and makes no reading request.
- **Suite first**: reference 3/18 on `b867abeba` (every runtime law UNMOUNTED; ordinary-Write goldens, FS1 and mapper identity green), D1–D15 dying on their named laws. After the mount: **18/18 · 16/16 dead · LETHAL + DISCRIMINATING**.
- **Live runtime witness 13/13** (§5) on a disposable shadow with a real `next dev`: exact GET order, one calm unavailable state for unknown / wrong-Work / unowned / stale, a delayed reading A never attaching after B was selected, **member-scoped database digest byte-identical across the whole Review window**, **provider hits 0**, **non-GET requests 0**.
- **FS1 57/57 intact; frozen `render.tsx` unchanged with 44/44 captures byte-identical; C1B-L6 green** (the live shell still carries exactly two `data-nav="write"` entries in Review state — proved by law L10 and walk W1/W2).
- ⚠️ **One finding from the live capture, repaired in the act**: the crumb-bar facet selector (*Guided ▾*) is a `<button>` and rendered in the first live Review — a dead control R1-1A's capability list had not named. `ReviewCapabilities` gained `facet` (controlled true, read-only false); the presentation omits it under the read-only set; law L18, the walk and candidate D16 now cover it. Goldens and the frozen witness are unchanged because the controlled set is complete.
- ⚠️ **One small additive seam on the R1-1A presentation**: `ReviewPresentation` takes an optional `onLens` so the live host owns the lens filter (tabs filter an already-loaded reading and commission nothing; a tab with no handler would itself have been a dead control). Markup unchanged; R1-1A matrix 12/12 with goldens 4/4.

## 1. Query-parameter law and place rewrites

`reading` is read once by the existing client host through `useSearchParams()`; a non-empty value is the sole way Review is requested. `m` and `s` are untouched. `locationForSection` remains the only composer; L11 proves `?m=…&reading=…&s=…` survives a place rewrite with `reading` intact, and the host source contains no second composer (no `history.pushState`, no rebuilt query).

| URL | Behaviour |
|---|---|
| no `reading` / empty | ordinary Write (L16 byte-identical goldens; W1: zero reading GETs) |
| `reading=<id>` | ledger → exact reading → mapper → context binding → `ready` mounts; anything else → unavailable |

## 2. Selection and GET semantics

`loadSelectedReading(readingId, host, ports)`: `null` → `idle` with **zero calls** (L15). Otherwise `GET /api/sovereign/manuscripts/<m>/readings` (member-scoped ledger); the id must be **listed** or the result is unavailable **without** the second GET — no existence probe (W3/W4: ledger only). Then `GET …/readings/<id>`; then `mapRealReview` (unchanged, L17 blob-identical to base); only `ready` continues; then `bindContext`. No POST exists in the host (L4 static + ports; W8 non-GET requests 0). No newest, no first, no aggregate (L1–L3; W2 exactly one reading's findings).

## 3. Mapper outcomes and context binding

Every non-`ready` outcome — `no-reading`, `reading_unavailable`, `reading_not_listed`, `wrong_work`, `malformed_payload`, `scope_unavailable`, `assessment_unmeasured`, `frozen_citation_text_unavailable`, `observation_address_unavailable`, `presentation_refused` — becomes one `unavailable` state (L7, L8; W5 stale → real refusal). Host facts: chapter scope from the focused span (else work), context paragraphs from the already-loaded current sections in the draft-section id space — the space the frozen topology addresses (W2: the highlighted paragraph is the finding's own return section). `bindContext` requires **every** finding's `returnTo.sectionId` to be present; absence → unavailable, never a stand-in (L13).

## 4. Presentation, disclosure, late results

Read-only set (all false, now including `facet`): W2 page contains no Ask MAIA · Discuss · Explore · commission · Not now · OwnObservation · `data-return-to` · facet · disabled control; the only buttons are the two lens tabs. Unavailable copy: *This reading isn’t available to show here. Nothing about your Work has changed.* — identical for every reason, no code, no identity (L9; W3/W4/W5 markup identical). Loading state carries one line and no data. `attachReview` requires the same generation **and** the same reading id (L12; W6 with a 4s delay on A and a `pushState` to B: B mounted first and last; A's finding never appeared).

## 5. Live runtime witness (⚠️ candidate evidence · ⛔ not production · ⛔ not a member walk)

Disposable PostgreSQL 16 shadow (441 migrations applied / 56 refused) · real `next dev` with the editorial flag unset and `ANTHROPIC_BASE_URL` pointed at a counting stub that answers 500 · real authenticated session. Seeded directly (never through the commission route): member M with Work A (Chapter 1 + a section) and Work B; member M2 with Work C; readings CURRENT (A, observation at section 2), OTHER (A, observation at section 1), STALE (A, frozen digest of section 2 ≠ live), RB (B), RC (C, unowned); one unknown UUID.

| # | Witnessed |
|---|---|
| W1 | Write mounts (2 authored bodies), no Review, **0** reading requests, nav 2 × write, buttons 0 |
| W7a | member digest captured before the Review window |
| W2 | `GET …/readings` then `GET …/readings/<current>` and nothing else · `data-review-reading` = CURRENT · 1 finding = `dobs_<current>` · no forbidden control · Write not mounted · nav 2 × write, no Review nav · tabs *Everything · Whether the thread holds* · unranked disclosure · highlighted context paragraph = the finding's section · lens tab click: 0 requests |
| W3 | unknown id → `data-review="unavailable"`, ledger GET only, no findings, no Write, copy carries no id/code |
| W4 | RB (wrong Work) and RC (unowned) → markup byte-identical to W3, ledger only, no probe of either id |
| W5 | STALE → ledger + one GET → unavailable, identical markup, no `.fs-moved`, no POST |
| W6 | A delayed 4s, `pushState` to B → B ready first and after 5.5s; final finding `dobs_<other>`; A's response never attached |
| W7b | digest after == digest before (members · sessions · manuscripts · drafts · draft sections · revisions · readings · standing events · keeps) |
| W8 | provider hits **0** · non-GET requests to readings/editorial/focus/standing/keeps **0** |

All `/readings` traffic across the walk was GET. Deliberately excluded from the digest: nothing member-scoped; `living_works` and `living_work_expressions` are read only by the pre-existing Work resolution and are not Review state.

## 6. Gates

| Gate | Result |
|---|---|
| `matrix:ws-flagship-r1-1b` | 18/18 · 16/16 dead · LETHAL + DISCRIMINATING |
| `typecheck:ws-flagship-r1-1b` | PASS — allowances blob-pinned at `b867abeba` (studioTheme · frozen fixtures · the C1B host neighbours · R1-0's mapper neighbours) |
| `witness:flagship-r1-1b` | 13/13 |
| `verify:flagship-freeze` | 57/57 INTACT |
| frozen `render.tsx` unchanged | 44 renders · mechanical ALL PASS · 0 changed captures |
| `matrix:ws-flagship` · `-c1a` · `-c1b` · `-c1c1` · `-r1-readonly` · `-r1-1a` | all LETHAL (C1B-L6 green; R1-1A goldens 4/4) |
| `npm run typecheck` (ship) | 226 vs 239 · 0 regressions |
| `check:design-canon` · `ci:sovereignty` (29/29) · `check:no-supabase` · `check:no-openai` · `git diff --check` | green |

## 7. Not done, by design

No Review tab, rail or mobile destination, no link, no `/writers-studio/review` bridge (C1B-L6 untouched). No aggregation, no automatic newest, no commission, no reread, no MAIA invocation, no Discuss/Explore, no member observation, note or standing write, no frozen-prose recovery, no `DevelopDomain` or `doesNotEstablish` widening, no FS1 change, no deployment.

⚠️ Noted for R1-1C, not taken: `liveReview.ts` and `LiveReviewView.tsx` sit under the flagship host directory and passed `check:design-canon` under the existing contract; listing them explicitly in `flagship-studio.md` belongs with the navigation succession act that makes Review a named destination.

**Standing: R1-1B ✅ BUILT · WITNESSED · GATED ON CANDIDATE · STOPPED for founder adjudication · R1-1C NOT OPENED · production untouched.**
