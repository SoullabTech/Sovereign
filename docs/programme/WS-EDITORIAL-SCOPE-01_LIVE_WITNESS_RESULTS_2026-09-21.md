# WS-EDITORIAL-SCOPE-01 · Live Manuscript Witness Results · 2026-09-21

**Witness substrate:** `MAIA-SOVEREIGN` · repair branch `fix/ws-live-witness-defects-20260921`
**Opening base:** `06a4e50f31465621629abb6c177ab5de1700a747`
**Procedure:** `WS-EDITORIAL-SCOPE-01_LIVE_WITNESS_PROCEDURE_2026-09-20.md`

This record is content-free by construction. It records statuses, counts, control state,
proposal presence, and exact-equality verdicts. It records no authored manuscript prose,
digest, or offset.

## Standing

| Check | Result | Live observation |
|---|---|---|
| W1 · sequence | ✅ EXPECTED | Fresh Touch passage; immediate wording OFF; HTTP 200; MAIA replied; no proposal. |
| W2 · sequence release | ✅ EXPECTED | Per-Work override survived reload; a fresh passage produced wording on MAIA's first reply. |
| W3 · size bound | ⚠️ NO EVIDENCE | At Touch, requested large rewrites remained discussion-only; the size judge was not reached. |
| W4 · paragraph independence | ✅ EXPECTED after repair | Open; paragraph removal OFF; deletion request produced no proposal; MAIA named the disabled paragraph-removal control and told the writer it could be turned on. |
| W5 · voice visibility | ✅ EXPECTED | Proposal arrived; voice notice reported 2 unfamiliar words from a 68-word sample and asked whether they were the writer's, beside the proposal. |
| W6 · usable editor | ✅ EXPECTED | Passage latitude with paragraph removal ON produced a proposal that previewed and applied. |

## W4 repair witness

A fresh two-paragraph locus was selected from a multi-paragraph section and occurred exactly once.
The latitude was **Open (5)** and paragraph removal was **OFF**.
The author asked for one paragraph to be removed from the selected locus.

Observed:
- HTTP **200**
- proposal versions produced: **0**
- MAIA explicitly identified paragraph removal as switched off
- MAIA explicitly told the writer paragraph removal could be turned on before wording with the paragraph removed could be proposed

The paragraph remained protected. The recovery path was also made legible to the writer.

## Apply-scope witness

The successful apply witness used a fresh, unique passage:
- selected locus: **313 characters**
- occurrence count in section: **1**
- section before application: **2,157 characters**
- proposal: **288 characters**
- latitude: **Open (5)**
- paragraph removal: **ON**
- adoption: **HTTP 200 · applied**

Before clicking Apply, the witness independently constructed:

`expected = before[:locus_start] + proposal + before[locus_end:]`

After adoption:
- live section length: **2,132 characters**
- `actual_after === expected`: **true**
- `actual_after === before`: **false**

Therefore the permitted revision changed exactly the agreed locus and nothing outside it.

## Inline Undo witness

Immediately after the successful application:
- the inline desk visibly rendered **Undo this change**
- the control was enabled
- it was outside the collapsed auxiliary-tools region

The visible control itself was clicked.

Observed:
- undo route: **HTTP 200**
- outcome: **undone**
- restored section length: **2,157 characters**
- restored section exactly equalled the saved pre-apply baseline: **true**
- the Undo control disappeared after recovery
- the inline status reported that the original passage was restored

Durable thread recovery then reported:
- applied version: `cdce052e-fd1d-4118-b2c1-2d1d57877624`
- `undone: true`
- `canUndo: false`
- resulting manuscript version: **9**

Thus the runtime and the inline recovery affordance agree after application and undo.

## Additional size-guard evidence

During the recovery witness, an ordinary revision at Passage (3) produced:
- HTTP **409**
- refusal: `scope_removes_too_much`
- manuscript unchanged

This establishes that the deterministic size boundary is reachable on a real manuscript at Passage latitude.
It does **not** close predeclared W3, whose setup specifically requires Touch (1).

## Validation

Targeted regression suite:
- **5 suites passed**
- **44 tests passed**
- **0 failures**

The suite covered the editorial-scope contract, inline editorial surface, and post-apply recovery synchronization.

`npm run typecheck` is **RED** on two new diagnostics outside this repair lane:
- `components/focus/InboxTriage.tsx:131` · TS2322
- `components/focus/NextStepBuilder.tsx:167` · TS2322

Neither file is modified by this candidate. No typecheck diagnostic names a file changed by this repair.
The type baseline was not changed.
