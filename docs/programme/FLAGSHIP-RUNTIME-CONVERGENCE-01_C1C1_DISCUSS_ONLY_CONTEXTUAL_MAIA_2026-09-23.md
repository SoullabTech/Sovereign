# FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1C1 — Discuss-Only Contextual MAIA

**Date**: 2026-09-23
**Act**: C1C1 (founder-authorized after C1B · C1C0 · E1 passed adjudication)
**Canonical**: `b23ae2d7fd31ee56841af3930b31658ab286a2a3` — unmoved
**Flagship candidate at authorization**: `8edca6c97` (E1 record)
**C1C1 lineage**: suite + pure modules `90e26d63e` → mount + witness `1cee61389` → this record (§10)
**Authority**: one live passage-bound Discuss act at `/writers-studio/rebuild`, flag-gated, off by default. ⛔ Merge, deploy, production enablement: NOT authorized. ⛔ STOPPED for founder adjudication.

---

## 0. Standing at the top

- **The flagship Write host can now carry ONE passage-bound Discuss turn.** Server-enabled + passage held → `Ask MAIA` → one-shot composer → Submit (the member's own words) → settle the existing writing session → open the passage relationship at the exact held range → one discourse turn under the withholding scope → the last admitted MAIA turn rendered as speech under a single `Discuss` tab. Release hides. Nothing proposes, nothing applies, nothing continues.
- **Suite first, lethal before mounting.** Against the unmounted host the reference was 10/16 (L4 · L5 · L7 · L9 · L15 red — the known-bad) while all thirteen founder-named candidates already died on their named laws. After the mount: **reference 16/16 · 13/13 dead · LETHAL + DISCRIMINATING**, one irreducible collateral classified (§4).
- **Candidate browser witness green**: flag off **6/6** · flag on **24/24** · C1B live-write walk re-run on the mounted host with the flag off **22/22** · controlled visual witness **byte-identical (44/44 + result file)**.
- **Every other named gate green** (§6). Ship no-regression typecheck **226 vs baseline 239, 0 regressions**.
- ⚠️ **Two accepted suites are RED at HEAD for a cause that predates this act**: `matrix:ws-flagship-c1a` (C1A-L9) and `matrix:ws-flagship-c1b` (C1B-L10) both pin `RebuildStudioClient.tsx` to canonical, and **E1's founder-passed repair `752c8a6c1` lawfully moved that file**. Blob evidence in §7. ⛔ Not edited here — an accepted suite is not mine to re-pin; the instrument question is routed to the founder.
- ⚠️ **The MAIA reply in the witness is a labelled controlled loopback at the structured seam, ⛔ not MAIA's cognition.** No provider is reachable from this container. What the walk establishes about the reply is structural: the panel shows exactly the last admitted MAIA turn of the thread it opened, and nothing else. *Truthful MAIA response* in the founder's stop boundary is therefore witnessed as **truthful transport of an admitted turn**, not as a judgement of her words (§8).
- ⚠️ **One presentation defect found by the walk and repaired in the same act**: the first flag-on run witnessed the manuscript moving **15px on Release** because the `Ask MAIA` action reappearing changed the crumb bar's height. The bar now reserves one height in every state; the re-run witnessed **0px**. This changed the four C1B captures (§5).

## 1. Authority, as built

```text
SERVER          app/writers-studio/rebuild/page.tsx
                reads WRITERS_STUDIO_EDITORIAL_ENABLED === '1' ONCE (force-dynamic) → editorialEnabled: boolean
                ⛔ presentation state, never authorization — every editorial route re-reads the real flag
                     │
THIS HOST       FlagshipWriteHost.tsx
                identity · Work · focus/place · the ONE HeldPassageAt · truthful status  (C1B, unchanged)
                + ephemeral Discuss state {composing | pending | answered | refused} · generation counter ·
                  synchronous in-flight guard · a ref to the ONE writing session (handed up through the
                  boundary's render prop — no second session, no boundary change)
                     │
THE ACT         discussAct.ts  (pure, no React, no env, no fetch of its own)
                commissionDiscuss: guard → readPosture() at the gesture → refuse unresolved/Sanctuary →
                settleWritingSession(flushPending · hasUnsavedWork · statusOf, bounded) → currentRevisionId()
                AFTER settlement → openPassage(sectionId,{start,end},revision,posture) →
                sendTurn(threadId, sectionId, exactText, posture, DISCUSS_SCOPE) → lastMaiaTurn
                resultAttaches(gen + focused section) · resolveAttachment(locateUniquePassage)
                     │
PRESENTATION    DiscussLayer.tsx (pure) → ContextualMaiaPanel.tsx (pure)
                the SAME panel the controlled MaiaPanel now composes — golden byte-identical (C1A-L8 6/6)
                     │
SEAMS REUSED    openBoundEditorialPassage · sendBoundEditorialTurn (E1, posture required) ·
UNCHANGED       readCurrentSanctuaryPosture (S1) · locateUniquePassage · RebuildWritingBoundary ·
                useSectionWriting · makeSectionSave · sectionSaveClient · RebuildAuthoredBody · machine.ts ·
                the three E1 routes · version/adoption/undo routes (never called)
```

`DISCUSS_SCOPE = { latitude: 1, mayRemoveParagraphs: false, mayProposeImmediately: false }` — on a fresh thread this is exactly the condition under which the server's discuss-first sequence gate (`lib/manuscript/editorialScope/sequence.ts`, `sequenceGateActive`) withholds `reply_with_proposal` from the tool schema. The proposal prohibition is therefore structural on the server, and the host additionally never references `/editorial/version` · `/adoption` · `/undo` (C1C1-L6, static).

## 2. The founder rulings, honoured

| Ruling | Where |
|---|---|
| (A) flag server-owned, off by default; page reads once; no client inference; no degraded substitute | `page.tsx`; C1C1-L4 (render + static: no `process.env` / `NEXT_PUBLIC` / `status === 404` / editorial route string in client files; page reads the flag exactly once); walk OFF-2/3/5 (no affordance, no panel, **no editorial request of any kind**) |
| (B) last admitted turn displays as speech, never manufactured into Observation / Reasoning / Teaching | `ContextualMaiaPanel` renders `message` as `fs-say` only; C1C1-L2 (forbidden tokens absent, reply verbatim); walk ON-11/12 |
| (C) `machine.ts` `conversation` phase untouched; state derived from HeldPassageAt + threadId + server thread view + ephemeral state | `machine.ts` blob-identical (L14); Discuss state is a host `useState`, not a phase |
| ONE TURN ONLY | no composer once pending/answered/refused (L13, D13); one `sendTurn` per commission (L13); walk ON-8/9/19/23 |
| Submit order 1–8 | `commissionDiscuss` (L1 · L5 · L11 · L12); walk ON-6/7/8 (dirty section saved through the existing PUT lane **before** the passage POST; open carried `revisionNumber` = post-save version and `sanctuary:false`) |
| settle without modifying the writing authority | `settleWritingSession` drives only `flushPending` · `hasUnsavedWork` · `statusOf`; the session reaches the host through the boundary's existing render prop (`onWriting`) — the four authority files are blob-identical (L14). ⛔ No STOP was needed. |
| proposal prohibition | L6; walk ON-9/18/23 `versions: 0` throughout; ON-24 no version/adoption/undo/focus request ever |
| presentation seam: pure panel, controlled witness unchanged, one tab, no dead tabs, no second composer | `ContextualMaiaPanel`; C1A-L8 golden 6/6; L7 · L13 · L16 |
| late-result law | `resultAttaches` (generation + focused section); L8; walk ON-15/16 (slow reply · section moved · server finished · nothing attached · not resurrected on return) |
| changed-passage law | `resolveAttachment` over `locateUniquePassage`; L9 (unique → attached; absent or twice → stale; stale copy exact; highlight withheld); walk ON-17 (0 editorial requests after the answer — no re-read) |
| release, not cancellation | `onRelease` hides and bumps the generation; L10 (no `cancel` in any host/panel source or markup); walk ON-13/14 |
| duplicate submit: synchronous guard, no retry, failure copy | `createInFlightGuard` (L11, D11 kills the async-armed shape); `DISCUSS_COPY.failed` verbatim; walk ON-19 (two `requestSubmit()` in one tick → one open, one turn) |
| flag disabled: normal Write, no probing | walk OFF 6/6; C1B walk 22/22 on the mounted host (F-6 buttons=0 holds) |

## 3. The laws (C1C1-L1…L16) and what kills each

| Law | Kills |
|---|---|
| L1 passage-bound thread, not `/focus` — one open at the exact held range + revision, one turn with the exact text; no focus seam in host source | D1 |
| L2 no Observation fabrication — reply verbatim as speech; no notice/coverage/limits/carried tokens | D2 |
| L3 single held-passage owner — exactly one `useState<HeldPassageAt>` across host files; no `PassageRef` | D3 |
| L4 flag is server presentation state — off/omitted → no action, no panel; on → exactly one action; page reads once; no client inference | D4 |
| L5 posture at the gesture, carried to both calls — read once, same object to open and turn; unresolved/Sanctuary refused before any POST; reader referenced; no account default | D5 |
| L6 Discuss cannot propose — the exact withholding scope; no version/adoption/undo references; no Apply/Undo/alternatives markup | D6 |
| L7 Discuss-only tab — exactly one `role="tab"`, selected, none disabled, in layer and view | D7 |
| L8 late result bound to gesture — generation and focused section; layer/view hidden on another section | D8 |
| L9 changed passage not re-anchored — unique/absent/duplicate; stale copy; highlight withheld; attached clean | D9 |
| L10 release, not cancellation — release control present; no cancel vocabulary anywhere | D10 |
| L11 duplicate submit synchronous — second acquire in the same tick refused; two concurrent commissions → one open, one turn | D11 |
| L12 settle before open — flush < revision read < open; refused on conflict before any open | D12 |
| L13 one turn only — no composer after a turn; exactly one send | D13 |
| L14 authority untouched — 17 files blob-identical to `8edca6c97` | — |
| L15 host mounts the layer — imports, page passes the flag, answered/composing rendered, action hidden while open | the unmounted host (known-bad RED) |
| L16 panel and layer pure — no hooks, fetch, storage, env, minting | — |

## 4. Matrix result

```
reference            16/16
candidates dead      13/13
matrix               LETHAL + DISCRIMINATING
```

**Classified collateral, one entry, irreducible**: `D1-focus-discuss` additionally fails L5 · L6 · L11 · L12 · L13 — a Discuss routed through `/focus` opens no passage thread and sends no turn, so every law that measures the thread call necessarily fails; making D1 call `openPassage`/`sendTurn` would make it stop being the `/focus` candidate.

**Four candidates were narrowed during the run, not the suite.** D2 · D7 · D10 · D13 first killed L9 as well, because each replaced the whole answered render and dropped the stale disclosure. That collateral was *reducible* — a fabricated Observation can perfectly well keep stale handling — so the candidates were rewritten to carry the reference's changed-passage behaviour and embody only their named error. ⭐ *Collateral is classified only when removing it would destroy the model; otherwise the candidate is wrong, not the law.*

**One defect in my own harness, caught by L1 before the mount**: the fake session advanced the revision on every `flushPending`, even with nothing staged, so the reference opened at revision 5 where the law expected 4. The fixture was wrong, the law was right; fixed in the fixture.

## 5. Candidate witness (⚠️ candidate evidence · ⛔ not production · ⛔ not a member walk)

Disposable full-schema PostgreSQL 16 shadow (441 migrations applied / 56 refused, as in every prior act) · real `next dev` · real authenticated session · browser carrying an explicit ordinary posture in `maia_settings`. Two servers: one **without** the flag (baseline + OFF walk + C1B regression), one **with** the flag and `ANTHROPIC_BASE_URL` pointed at the controlled loopback — ⛔ the flag existed in the witness process only; ⛔ no real provider credential existed anywhere.

**Baseline first** (before any source change): C1B live-write walk on the flagship host **22/22** (`scratchpad/witness-c1c1-baseline.log`).

**Flag off — 6/6**: passage holds · no `Ask MAIA` · no panel · **zero buttons** (C1B F-6) · **zero editorial requests** (no 404 probe) · zero rows.

**Flag on — 24/24** (`scripts/witness/flagship/c1c1-discuss-walk.ts --flag on`):

| # | Witnessed |
|---|---|
| 1–3 | enabled + nothing held → nothing; selection holds `21:29` and commissions nothing; `Ask MAIA` is the one affordance (buttons=1) |
| 4–5 | composer opens with **no request and no row**; the action hides while the panel is open |
| 6 | section dirtied after the composer opened; at Submit status was `Unsaved`; the existing PUT lane saved (v1→2) **before** the passage POST |
| 7 | open carried `range {21,29}` · `revisionNumber 2` (post-settlement) · `sanctuary:false` (the gesture posture) |
| 8 | exactly one turn: `discourse`, exact text, `scope {1,false,false}` |
| 9–10 | 1 chain · 1 thread · 2 turns · 1 MAIA · **0 proposal versions**; manuscript bytes exactly the member's text |
| 11–12 | panel = exact ask + **the last admitted MAIA turn** (controlled, labelled) · tabs `["Discuss"]` · no Apply/Undo/Revise/Reason/Teach/coverage/composer |
| 13–14 | Release: panel gone · manuscript **dy = 0** · no cancel vocabulary · held passage survives, action returns |
| 15–16 | slow reply + section moved before completion: server act finished (chains 2, MAIA turns 2, one POST) · nothing attached · not reopened · not resurrected on return |
| 17–18 | edit the locus after an answer: `data-stale-context` + the exact stale copy · **no highlight** · **0 editorial requests after the answer** · the edit itself saved through the existing path · versions still 0 |
| 19 | two synchronous `requestSubmit()` → **one open, one turn**, one new chain |
| 20–21 | Sanctuary at the gesture → refused locally, **no POST**, copy names what was not stored; posture removed → refused locally, no POST |
| 22–24 | phone sheet carries the held passage; final 5 chains · 5 threads · 10 turns · 5 MAIA · **0 versions**; only thread-open and turn were ever POSTed, the only GETs are the helpers' thread reads |

**The defect the walk found.** First flag-on run: ON-13 `dy = 15.19` — the manuscript moved on Release. Root cause: the `Ask MAIA` button (30px) reappearing in the crumb bar made the bar taller than its text-only state. Two repairs were tried and measured (48 → `dy 6.19`, then a pinned button height → `dy 1`); the last pixel was the bar's own bottom border under `border-box`. `.fs-bar{min-height:49px}` = 9 + 30 + 9 + 1. Re-run: `dy = 0`, with the bar at 49.0 in both states. ⚠️ **Consequence recorded, not hidden**: the live host's bar is now 49px even with the flag off (before C1C1 it was ~33px when no action was drawn), which matches the controlled reference's toolbar height and is why the four C1B captures changed bytes. The C1B walk still passes 22/22.

**Three instrument defects in my own walk**, repaired as instrument: (i) counting the E1 helpers' lawful GET thread re-reads as "re-reads of the manuscript" (they are reads of the thread the act just opened; the law is *no editorial request after the answer*, now asserted as 0); (ii) reading the section row before the 1200ms autosave had fired; (iii) a named inner function inside `page.evaluate` tripping tsx's `__name` helper.

**Teardown**: both servers and the loopback stopped; shadow stopped and removed; `proposal_chains` refuses DELETE by trigger, so the seeded member rows stayed until the cluster was destroyed (as in E1).

## 6. Gates

| Gate | Result |
|---|---|
| `matrix:ws-flagship-c1c1` | reference 16/16 · 13/13 dead · LETHAL + DISCRIMINATING |
| `typecheck:ws-flagship-c1c1` (strict + `noUncheckedIndexedAccess` + react-jsx) | PASS — 0 outside the named inherited allowances (same set as C1B; no new neighbour) |
| `matrix:ws-flagship` | LETHAL + DISCRIMINATING |
| `matrix:ws-flagship-c1a` | **8/9 reference · 8/8 dead — RED on C1A-L9 (pre-existing, §7)**; golden C1A-L8 **6/6 byte-identical** |
| `matrix:ws-flagship-c1b` | **9/10 reference · 9/9 dead — RED on C1B-L10 (pre-existing, §7)** |
| `typecheck:ws-flagship` · `-c1a` · `-c1b` | exit 0 · PASS · PASS |
| C1B live-write walk (mounted host, flag off) | 22/22 |
| controlled flagship visual witness (`render.tsx`) | result file + 44/44 captures byte-identical |
| `matrix:ws-sanctuary-editorial` | 22/22 |
| `matrix:ws-sanctuary-keep` | 27/27 |
| `matrix:editorial-runtime` | LETHAL AND DISCRIMINATING · 0 failures |
| `matrix:editorial-reading-contract` · `typecheck:editorial-reading-contract` | LETHAL + DISCRIMINATING · exit 0 |
| `npm run typecheck` (ship no-regression) | 226 vs baseline 239 · 0 regressions |
| `check:design-canon` | 2 contracts cover the change |
| `ci:sovereignty` | exit 0 (29/29) |
| `check:no-openai` (provider governance) | exit 0 |
| `check:no-supabase` | exit 0 |

## 7. ⚠️ Finding — two accepted suites went red at E1, unnoticed

`C1A-L9-authorship-substrate-untouched` and `C1B-L10-authority-files-untouched` both pin `app/writers-studio/rebuild/RebuildStudioClient.tsx` to canonical `b23ae2d7f`. E1's founder-passed repair `752c8a6c1` changed that file (gesture-time posture on the legacy client's `startNewEditorial`/`sendEditorial`). Blob identities:

```
canonical b23ae2d7f   396fe7c0d3de6083ce927d1cd4a2ffe3921dd7b9
pre-E1    50ac02aca   396fe7c0d3de6083ce927d1cd4a2ffe3921dd7b9   (both suites green here)
E1 repair 752c8a6c1   1cff176b52b3e6e38229420d269196c35f07db67   (both suites red from here)
HEAD                  1cff176b52b3e6e38229420d269196c35f07db67
```

E1's own gate list did not include the C1A/C1B matrices, so the red was not seen at the time; the E1 record makes no claim about them. **Neither suite was edited here.** The C1C1 suite pins its own authority law to the flagship head `8edca6c97`, which is the state the founder actually authorized this act against.

**Founder question (instrument, not law)**: the *law* in both suites — "C1A/C1B did not touch these files" — remains true; the *pin* now names a state a later authorized act lawfully moved. Options: (a) re-pin `RebuildStudioClient.tsx` in both to `752c8a6c1`; (b) drop that one file from those pins, since it is the legacy client, not the authorship substrate the laws protect; (c) leave both red as a standing record. ⛔ Not mine to choose.

## 8. What this act does NOT establish

- ⛔ Anything about the quality, truthfulness or voice of a real MAIA reply. The loopback returns fixed words; the witness proves transport and presentation of an admitted turn, not cognition.
- ⛔ Production behaviour: the flag's production standing is unknown and unchanged; nothing was deployed.
- ⛔ A member walk. V10 remains the founder's.
- ⛔ Second turn · Revise · alternatives · Reason/Teach · What MAIA read · Apply · Undo · History · member version · adoption · chapter review · Develop · Review · arrival trail · `/focus` repair.
- ⛔ The routed prerequisite stands: `/editorial/version` and `/editorial/adoption` still carry no Sanctuary posture and must be closed before any Revise/Apply/Undo convergence.

## 9. Files

| File | Change |
|---|---|
| `app/writers-studio/rebuild/discussAct.ts` | new — the act as data |
| `app/writers-studio/rebuild/DiscussLayer.tsx` | new — pure layer |
| `app/writers-studio/flagship/ContextualMaiaPanel.tsx` | new — pure panel |
| `app/writers-studio/flagship/WriteRoom.tsx` | `MaiaPanel` composes the pure panel; markup byte-identical |
| `app/writers-studio/rebuild/FlagshipWriteHost.tsx` | mount (§1) |
| `app/writers-studio/rebuild/page.tsx` | server flag read, force-dynamic |
| `app/writers-studio/rebuild/flagshipWriteHost.css` | composer + bar reservation |
| `tests/constitutional/writers-studio/flagship-c1c1/**` | suite, candidates, matrix |
| `tsconfig.ws-flagship-c1c1.json` · `scripts/typecheck-ws-flagship-c1a.mjs` · `package.json` | instrument + commands |
| `scripts/witness/flagship/c1c1-discuss-walk.ts` · `c1c1-loopback-inference.ts` | witness + labelled controlled inference |
| `docs/design/contracts/flagship-studio.md` · `screenshots/flagship-c1c1/*` · `screenshots/flagship-c1b/*` | contract + captures |

Not modified (blob-identical to `8edca6c97`, guarded by L14): `RebuildAuthoredBody.tsx` · `RebuildWritingBoundary.tsx` · `RebuildStudioClient.tsx` · `useSectionWriting.ts` · `sectionSaveClient.ts` · `editorialCollaboration.ts` · `currentClientPosture.ts` · `turnPosture.ts` · `machine.ts` · `WriteFrame.tsx` · `StudioChrome.tsx` · the six editorial routes. `flagship.css` untouched.

## 10. Lineage

| Step | SHA |
|---|---|
| suite + thirteen candidates + pure modules (known-bad RED on the unmounted host) | `90e26d63e` |
| mount + witness + contract | `1cee61389` |
| this record | see `git log` |

**Standing: C1C1 ✅ BUILT AND WITNESSED ON CANDIDATE · SUITE LETHAL · GATES GREEN (two pre-existing reds named, §7) · ⛔ NO MERGE · ⛔ NO DEPLOY · ⛔ NO PRODUCTION ENABLEMENT · PRODUCTION UNTOUCHED · STOPPED FOR FOUNDER ADJUDICATION.**
