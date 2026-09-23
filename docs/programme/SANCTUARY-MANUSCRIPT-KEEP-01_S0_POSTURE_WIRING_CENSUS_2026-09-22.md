# SANCTUARY-MANUSCRIPT-KEEP-01 / S0 — Current-Canonical Posture-Wiring Census + Minimum Repair Proposal

**Date**: 2026-09-22
**Lane**: `SANCTUARY-MANUSCRIPT-KEEP-01`
**Act**: S0 — read-only investigation
**Canonical examined**: `origin/clean-main-no-secrets @ b23ae2d7f` (every citation below is `git show b23ae2d7f:<path>`, never the working tree)
**Working branch**: `claude/trusting-fermat-ju3quz` — this record only
**Authority**: founder authorization of S0 (read-only). Grants nothing beyond this record.
**Predecessor**: `docs/programme/SANCTUARY_BOUNDARY_FINDING_MANUSCRIPT_KEEPS_2026-09-22.md` (the finding that opened this lane)

**Evidence labels** — **VIS** = read directly from canonical source · **ENT** = entailed from VIS source that has been read · **UNK** = not established here.

---

## 0. Standing at the top

- **The source gap is CONFIRMED (VIS).** `POST /api/sovereign/manuscripts/[id]/keeps` INSERTs into `manuscript_keeps` with no posture resolution and no store-boundary guard.
- **The gap is presently vacuous in effect and real in law (VIS + ENT).** The only live caller carries no Sanctuary state, so no Sanctuary keep can be *sent* today — but the route would accept one, and Sanctuary Invariant 6 is a property of the boundary, not of the callers that happen to exist.
- **Smallest repair = one route file, two lines of law, one refusal response (§9). No migration. No schema. No new store boundary.**
- **Zero-write witness = unit recorder (hermetic) + founder-run disposable-shadow DB count (§10).**
- ⛔ **Nothing is repaired here. S1 requires founder authorization.**

---

## 1. Q1 — Where is `manuscript_keeps` written? (VIS)

Tracked source at `b23ae2d7f`, all of `app/ lib/ scripts/ components/`, excluding `docs/`:

| Site | Statement | Class |
|---|---|---|
| `app/api/sovereign/manuscripts/[id]/keeps/route.ts:75-77` | `INSERT INTO manuscript_keeps (member_id, manuscript_id, section_id, verbatim_text) …` | **the** product writer |
| `app/api/sovereign/manuscripts/[id]/keeps/route.ts:107` | `DELETE FROM manuscript_keeps WHERE id = $1 AND manuscript_id = $2 AND member_id = $3` | product remover |
| `scripts/witness/maia-convergence-witness.ts:166` | `INSERT INTO manuscript_keeps (id,manuscript_id,member_id,section_id,verbatim_text)` | witness fixture seed, ⛔ not a product path |

**No `UPDATE manuscript_keeps` exists anywhere (VIS).** There is exactly one product writer. The route header (`:16-18`) states the doctrine — *written only by an explicit member gesture; no detector, summarizer, or background job may call this route* — and the census finds nothing contradicting it.

## 2. Q2 — Where is the route called from? (VIS)

`git grep` over `app/ components/ lib/` for `/keeps` callers:

- `app/press/manuscript/page.tsx:483` — `apiFetch(\`/api/sovereign/manuscripts/${active}/keeps\`, { method: 'POST', … })` sending `{ sectionId, text }`
- `app/press/manuscript/page.tsx:527` — the DELETE (`?keepId=`)

**That is the complete caller set: Soullab Press, one page.** Writer's Studio (`app/writers-studio/**`, `RebuildStudioClient`, flagship) does **not** call this route (VIS). The Writer's Studio `onKeep` in the RevisionDesk is *“Keep my original”* — a revision-authorization act — and is a third, unrelated meaning of “keep” (see §12).

## 3. Q3 — What Sanctuary posture is available to the route? (VIS)

**None.** The route body (`:37-93`) reads `{ sectionId, text }` only (`:52`). It imports `query`, `getMemberIdFromRequest`, `memberRef` (`:21-24`) — **no import from `lib/sanctuary/*`** (VIS).

Where posture *originates* in the product:

- `components/voice/VoiceHUD.tsx:30` — `const [sanctuary, setSanctuary] = useState(false)` (member toggle)
- `components/OracleConversation.tsx:5469` — `sanctuary: isSanctuary` placed in the **request body** of the conversation turn

So the Sanctuary signal is **body-carried, per turn**, never a header and never session-derived (VIS). `app/press/manuscript/page.tsx` contains **zero** occurrences of `sanctuary` (VIS: `grep -ci` = 0). Writer's Studio flagship likewise carries none (C0 census, `FLAGSHIP-RUNTIME-CONVERGENCE-01_C0_…`).

**Consequence (ENT)**: a member who has Sanctuary ON in MAIA conversation and then keeps a passage in Press produces a durable `manuscript_keeps` row. The route cannot know; the caller does not say. Whether that is a *breach* today depends on whether Sanctuary is a posture of the **member's session** or of the **conversation surface** — see §11, open question 1.

## 4. Q4 — Does an existing resolver fit, or is a new one needed? (VIS)

**Existing resolver fits; no new one needed.**

- `lib/sanctuary/turnPosture.ts:42-48` — `TurnPosture.resolve(meta)` reads `meta.sanctuary` and `meta.meta.sanctuary`; any affirmative (`true` or `'true'`) wins; contradictory signals fail closed to Sanctuary; absence = ordinary.
- Sibling manuscript route already does exactly this: `app/api/sovereign/manuscripts/[id]/ask/route.ts:320` — `posture: TurnPosture.resolve(body)` (VIS).
- Other canonical adopters (VIS, non-test): `app/api/conversation/turns/route.ts`, `app/api/voice/persist/route.ts`, `app/api/maia/translate/route.ts`, `app/api/sovereign/app/maia/list/route.ts`, `app/api/writers-studio/editorial/turn/route.ts`, `app/api/writers-studio/focus/route.ts`.

The keeps route is the manuscript-family outlier.

## 5. Q5 — Does an existing store boundary fit? (VIS)

**Yes — `contentWritable(posture, store, sessionId?)`, `lib/sanctuary/turnPosture.ts:58-79`.**

- Non-instance posture → `console.error('[SANCTUARY] write refused — posture missing or unresolved (fail closed)', { store, sessionIdPrefix })` → `false`
- `posture.sanctuary` → `console.log('[SANCTUARY] write refused', { store, sessionIdPrefix })` → `false`
- otherwise `true`

The `store` argument is a free string, so `contentWritable(posture, 'manuscript_keeps')` needs **no registry entry and no new module** (VIS). Logs are metadata-only by construction; passing no `sessionId` yields `sessionIdPrefix: null`, so the routed-out `slice(0,12)` hazard from B-IR1 is not exercised by this repair (ENT).

⚠️ **`shouldPersistKeep` (`lib/sanctuary/sanctuaryGuards.ts:54`) is NOT the fitting boundary.** Its docstring (`:51`) says *“`POST /api/library/keep` checks this BEFORE any DB write”* — **no such route exists at `b23ae2d7f`** (VIS: `git ls-tree` finds only `lib/library/keepIntent.ts`), and the function has **zero non-test callers** (VIS). It is a stale-citation guard with nothing behind it. ⛔ Routed out, not repaired here: see §12.

## 6. Q6 — Is the existing refusal shape reusable? (VIS)

Two canonical precedents, identical shape:

- `app/api/conversation/turns/route.ts:143-147` — `if (posture.sanctuary) { console.log('[CONVERSATION] Sanctuary posture - not storing turn'); return NextResponse.json({ success: true, sanctuary: true }); }`
- `app/api/voice/persist/route.ts:74` — `return NextResponse.json({ success: true, sanctuary: true })`

Both: **early return, before any write, HTTP 200, no content echoed, no error status.** The keeps route currently returns `201 { keep: { id, createdAt } }` on success (`:85-88`). A Sanctuary refusal cannot return that shape (there is no id) and must not return a 4xx (the member did nothing wrong). The precedent shape is adopted in §9.

## 7. Q7 — Are GET and DELETE lawful under Sanctuary? (VIS + ENT)

**GET — lawful.** Readers of `manuscript_keeps` at canonical (VIS): `app/api/sovereign/keeps/route.ts`, `…/manuscripts/[id]/collections/route.ts`, `…/manuscripts/[id]/route.ts`, `…/manuscripts/route.ts` (count), `…/studio/history/route.ts`. Every reader is an API route scoped to the authenticated member's own rows; **no reader feeds a prompt, a memory bundle, or a detector** (VIS — `lib/**` has no reader). A Sanctuary member reading their own previously-kept passages discloses nothing new and forms no pattern. `keepsReadDoctrine.test.ts` already pins the read side.

**DELETE — lawful, and must never be gated.** Removal is a sovereign act; refusing it under Sanctuary would *retain* content the member asked to drop. The repair touches POST only.

## 8. Q8 — Is an explicit member confirmation already present? (VIS)

**Yes, by construction.** The POST *is* the member's gesture (`:16-18` doctrine; Press UI at `:483` fires on the member's keep action). There is no system writer, no batch, no inference path. **MA-F16 (member confirmation) is satisfied structurally and needs no new field.** ⛔ Adding a `memberConfirmed` body flag would be a client assertion of a fact the server already holds by the shape of the act — the S3 lesson: *a client assertion is never authority*.

## 9. Q9 — Smallest repair (PROPOSAL, ⛔ NOT APPLIED)

**File**: `app/api/sovereign/manuscripts/[id]/keeps/route.ts` — POST handler only.

1. `import { TurnPosture, contentWritable } from '@/lib/sanctuary/turnPosture';`
2. After the body is parsed (`:52`) and **before** the section SELECT (`:57`): `const posture = TurnPosture.resolve(body);`
3. Immediately after: `if (!contentWritable(posture, 'manuscript_keeps')) { return NextResponse.json({ success: true, sanctuary: true }); }`
4. Update the route header doctrine block to name the Sanctuary boundary.

**Placement rationale (ENT)**: refusing before the section SELECT means a Sanctuary keep performs **no read of the manuscript body either** — *a refusal is not an occasion to disclose*, and a refused act should touch as little as possible. The verbatim-containment check (`:67`) is therefore skipped under Sanctuary; that is correct, since the text is not being stored and there is nothing to verify it against.

**What the repair does NOT do**: no migration · no schema · no new `lib/sanctuary` export · no change to DELETE · no change to GET readers · no change to Press · no change to Writer's Studio · no session-derived posture (the body signal is the canonical carrier, §3) · no `shouldPersistKeep` wiring.

**Diff size (ENT)**: one import line, three statements, one comment edit. No behaviour change for any request lacking a `sanctuary` signal — which is every request the live caller sends today.

## 10. Q10 — Exact DB-backed zero-write witness (PROPOSAL, ⛔ NOT AUTHORED)

Two instruments, because either alone is ambiguous.

**W1 — hermetic unit recorder (committed test, runs in CI).** Pattern already canonical at `app/api/sovereign/manuscripts/blank/__tests__/route.test.ts:63,446-450`: `jest.mock('@/lib/db/postgres')` with a `query` recorder and `wrote(table) === false`. New file `app/api/sovereign/manuscripts/[id]/keeps/__tests__/route.sanctuary.test.ts`:

| Case | Body | Assert |
|---|---|---|
| S-1 | `{ sectionId, text, sanctuary: true }` | `wrote('INSERT INTO manuscript_keeps') === false` · **`query` called 0 times** · 200 `{ success:true, sanctuary:true }` |
| S-2 | `{ sectionId, text, meta: { sanctuary: true } }` | same |
| S-3 | `{ sectionId, text, sanctuary: 'true' }` | same (string affirmative) |
| S-4 | `{ sectionId, text, sanctuary: false, meta: { sanctuary: true } }` | same (contradiction fails closed) |
| S-5 | `{ sectionId, text }` | INSERT **is** issued exactly once after the section SELECT succeeds (ordinary path unchanged) |
| S-6 | `{ sectionId, text, sanctuary: false }` | same as S-5 |
| S-7 | any Sanctuary case | response body contains none of `text` · no `keep.id` · log calls carry no `text` |

**Defeat candidates the suite must kill before the repair is written** (per the ratified S3 Class-B discipline — suite first, prove lethality, then implement):

- **DK-1 read-then-refuse**: resolves posture *after* the section SELECT — dies on S-1's `query` called 0 times.
- **DK-2 top-level-only**: reads `body.sanctuary` only — dies on S-2.
- **DK-3 strict boolean**: `=== true` only — dies on S-3.
- **DK-4 first-signal-wins**: returns on `sanctuary: false` before checking nested — dies on S-4.
- **DK-5 4xx refusal**: returns 400/403 — dies on S-1's status assertion.
- **DK-6 refuse-everything**: guards DELETE too / refuses ordinary — dies on S-5.

**W2 — founder-run disposable-shadow DB witness (evidence of record).** Against a fresh shadow with the canonical schema, one authenticated member, one manuscript, one section: `SELECT count(*) FROM manuscript_keeps` → POST with `{ sectionId, text, sanctuary: true }` → `SELECT count(*)` again → **delta 0**, response `{ success:true, sanctuary:true }`; then POST without the signal → **delta 1**, 201. Record counts only; no `verbatim_text` in the record. ⛔ Cannot run from this container (no database, no `node_modules`) — a statement about the environment, not a deferral.

## 11. Open questions for the founder (⛔ not decided here)

1. **Is Sanctuary a property of the member's session or of the conversation surface?** Today it is body-carried per turn (§3). If a member with Sanctuary ON in MAIA keeps a passage in Press, the repair in §9 still records it, because Press sends no signal. Making Press (or Writer's Studio) *carry* posture is a separate, surface-scoped act — ⛔ not S1. The §9 repair closes the **route** boundary; it does not, and cannot, close a surface that never asks.
2. **Should the refusal be 200 `{ success:true, sanctuary:true }` (canonical precedent) or a distinct shape the Press UI can render as *“not kept — Sanctuary”*?** Precedent is adopted in §9 as the smallest change; a UI affordance is a Press act.
3. **Does the stale `shouldPersistKeep` guard get retired, or does the future Library keep route adopt it?** Routed out (§12).

## 12. Routed-out observations (⛔ no lane opened, ⛔ none repaired)

- **R-1 — stale citation in law**: `lib/sanctuary/sanctuaryGuards.ts:51` names `POST /api/library/keep`, which does not exist at canonical; `shouldPersistKeep` has zero non-test callers. Same defect class as the `verify-colab-boundaries.ts` name in CLAUDE.md and the `MULTI_MODEL_SESSION_MODE.md` citation: *the rule is sound, the thing it points at is absent.*
- **R-2 — three meanings of “keep”**: Press manuscript keep (`manuscript_keeps`) · Library keep (`keepIntent.ts`, no route) · Writer's Studio *“Keep my original”* (revision authorization). Naming collision; a member-facing vocabulary question, not S1.
- **R-3 — witness seed writes `manuscript_keeps` directly** (`scripts/witness/maia-convergence-witness.ts:166`) bypassing the route. Lawful for a fixture on a shadow; noted so a future reader does not count it as a product writer.

## 13. Attestation

- Source changes: **none** · schema: **none** · migrations: **none** · tests authored: **none** · `lib/sanctuary/*`: **untouched** · `manuscript_keeps`: **untouched** · Writer's Studio · B-I · F5 · F7 · F8: **untouched** · production: **untouched**
- Reads performed: `git show`/`git grep` against `b23ae2d7f` only; no live or shadow database read
- Implementation authority: **NOT GRANTED**
- **Next act: founder authorization of S1** (suite W1 with defeat candidates DK-1…DK-6 proven lethal → §9 repair → W2 founder-run witness). ⛔ S0 STOPS HERE.
