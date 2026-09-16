# JARVIS-MAIA-STANDING-SHADOW-01 — S0 Live Seam Trace

**Subject:** Writer's Studio canonical Focus crossing
**Parent head:** `204f2f351`
**Mode:** read-only trace

## Exact crossing

`lib/sovereign/maiaService.ts:3571–3585` is the live Writer's Studio canonical generation branch:

1. `renderTurnForCognition(writerStudioTurn, tier)` renders the frozen `CanonicalTurn`.
2. `generateText({ systemPrompt: rendered.systemPrompt, userInput: input, ... })` begins response-producing cognition.
3. `onHandoff()` is signalled only after the response-producing call is invoked.
4. The returned text becomes the member-visible response.

`lib/writers-studio/writersStudioCognition.ts:116–153` proves that receipt/handoff semantics are already correctly separated from preparation and need not change for this R&D.

## What CanonicalTurn already preserves

A `Participant` carries:

- `producerId`
- `authoredBy`
- `participationClass`
- `authority`
- `text`

The turn manifest also preserves those axes and the block digest.

## Where standing is flattened

`lib/maia/canonical-turn/render.ts:42–48` renders admitted participants using only:

```ts
participants.map((p) => p.text)
```

So source standing survives construction and audit but is not represented in the ordinary participant text passed to cognition.

## First-crossing scope

`constructWriterTurn()` builds exactly two non-floor candidates:

- `member.writer_focus`
- `retrieved.writer_work_context`

Both are fully partitioned in the producer registry.

The wider `writers_studio` room registry contains two `partitionPending` recall producers:

- `member.episodic_recall`
- `retrieved.conversational_recall`

Therefore S1 must refuse any admitted `partitionPending` producer rather than treating block-level authorship as precise item-level provenance.

## Minimum future mutation boundary — finding only

If later evidence justifies a production shadow, the likely seam is the span between:

```text
frozen CanonicalTurn
    → renderTurnForCognition()
    → systemPrompt
    → generateText()
```

No evidence currently requires changing MIPA, canonical construction, disclosure receipts, provider routing, persistence, or Writer's Studio UI.

No production change is authorized here.
