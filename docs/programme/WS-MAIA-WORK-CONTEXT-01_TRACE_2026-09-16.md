# WS-MAIA-WORK-CONTEXT-01 — first act, read-only causal trace

Read-only. Traced at `b5bd7caa0` (the SHA reported as production). No repair
made, none authorized. Nothing written to any database. Part A/B
(`8fc94279c`, `e823bb9ef`) untouched and not depended upon.

## The question

Why can the Studio visibly name `ELEMENTAL_ALCHEMY` while Passage Work says
MAIA cannot establish one unambiguous declared Work?

## Answer: it never claimed to know the Work. It is naming a different object.

`RebuildStudioClient.tsx:759` renders

```tsx
In relation to: {work?.title ?? title}
```

and `:363` defines

```tsx
const title = context?.title ?? 'Writer’s Studio';
```

`context.title` is the **manuscript's** title. The Work's title and the
manuscript's title are both the string `ELEMENTAL_ALCHEMY`, so when `work` is
null the panel falls back to the manuscript's name and reads exactly as it
would if the Work were resolved.

Both sentences on that screen are true. They are about different objects, and
the interface gives the reader nothing to tell them apart. **There is no
contradiction to repair — there is a fallback that is indistinguishable from
success, which is worse, because it cannot be seen.**

Corroboration on the same screenshot, independent of the header: the left rail
shows *"A living manuscript in progress."* That is `:670`,
`work?.purpose ?? 'A living manuscript in progress.'` — the fallback. Two
fallbacks rendering, one legible as such.

## The refusal's exact condition

```
RebuildStudioClient.tsx:953   {!work && <div>Passage Work needs one …</div>}
RebuildStudioClient.tsx:215   const work = currentWork(workContext)
RebuildStudioClient.tsx:214   resolveWorkContext(worksPhase, works, context?.manuscriptId ?? null)
workContext.ts:                currentWork(ctx) => ctx.kind === 'work' ? ctx.work : null
```

`work` is null in four distinct states, and `!work` collapses all four:

| `WorkContext` | cause | reached here? |
|---|---|---|
| `unknown` | declarations not loaded yet | transient |
| `none` | `manuscriptId` is null | would break more than this |
| `none` | **0 Works declare this manuscript** | candidate |
| `ambiguous` | **2+ Works declare it** | candidate |

`resolveWorkContext` is correct and deliberately refuses to guess — D-018 says
an expression may belong to several Works by design, so `ambiguous` is a
*lawful state*, not a fault. The defect is not in the resolver.

⚠️ **The two live candidates are indistinguishable on screen.** Nothing in the
rebuilt room branches on `ambiguous` (the only `ambiguous` handlers are
`CanvasClient.tsx:1211`, a different surface, and a selection refusal). A
member with two Works named the same thing and a member with no declaration at
all are shown the identical sentence.

## Which one is it — OWED, one query

Not determinable from source. It needs one read-only production read:

```sql
SELECT w.id, w.title, e.expression_type, e.expression_id
FROM living_works w
JOIN living_work_expressions e ON e.work_id = w.id
WHERE e.expression_type = 'manuscript'
  AND e.expression_id = '<the manuscript behind ?m=>';
```

0 rows → `none`. 2+ rows → `ambiguous`.

**`ambiguous` is the leading hypothesis and is NOT yet evidence.** The founder
already observed multiple records titled `ELEMENTAL_ALCHEMY` on the Home and
ruled they must not be silently deduplicated. If two of those declare this
manuscript, `declaringWorks()` returns 2, and Passage Work refuses exactly as
seen. That is consistent; it is not witnessed.

## Chapter Review — structurally independent, and not shown failing

```
runReview  :259   if (!chapter || !context || reviewPhase === 'reading') return;
           :264   runChapterReview(context.manuscriptId, chapter.sections, onProgress)
```

⛔ **No `work` in the closure or the call.** Chapter Review commissions against
`manuscriptId`, never a Work identity. The declared-Work fracture cannot reach
it. Passage Work is gated on `work`; Chapter Review is gated on `chapter` and
`context`. **Two mechanisms, not one.**

⚠️ **And the screenshot does not show Chapter Review failing.** The panel reads
*"Run Chapter Review first and its section-linked findings will stay here while
you work."* That is `:836`'s fallback for `review === null` — the
**not-yet-run** copy, not a failure copy. A failed run sets
`reviewPhase = 'partial'` and populates `bundle.failures` with a per-lens
`refusal` and `stage`. **No evidence of a Chapter Review defect exists in the
material examined.** It may still have one; nothing here found it, and nothing
here should be read as having found it.

### A hypothesis raised and refuted, recorded rather than dropped

`runChapterReview` builds its scope from `draftSectionId`, and this repository
has a documented trap where `manuscript_sections.id` (Source) and
`manuscript_draft_sections.id` (navigation) are interchangeable-looking uuids
that fail silently when mixed. That predicted a per-lens refusal.

It does not hold. `app/api/sovereign/manuscripts/[id]/readings/route.ts:43`
builds its topology `FROM manuscript_draft_sections`, the same namespace the
client sends. **The namespaces agree at this seam.** Recorded because a
plausible cause that the code refutes is worth more written down than
discarded — the next reader will form the same hypothesis.

## Answer to the lane's key question

**Independent failures, and only one of them is observed.**

1. Passage Work's refusal is fully explained by `work === null`, cause not yet
   discriminated between `none` and `ambiguous`.
2. Chapter Review shares no identity dependency with it and is not
   demonstrated to be failing at all.

## Smallest repair boundary — stated for ruling, NOT authorized

1. **The fallback must be legible.** `work?.title ?? title` lets a manuscript
   title impersonate a Work. Either the panel names what it is showing, or it
   declines to name a Work it does not have. This is the finding that matters:
   it is the reason the state was unreadable for as long as it was.
2. **`!work` must stop collapsing four states into one sentence.** `ambiguous`
   is a real question with a real answer the member can give — *which of these
   Works is this?* — and `none` is an invitation to declare one. Today both get
   a sentence that sounds like a system limitation.
3. ⛔ Do **not** make `currentWork` pick. Every ranking rule available here is a
   guess in a default's costume, and the resolver refusing to guess is the one
   part of this chain that is working.

## Evidence classes, kept apart

- **founder-visible** — the screenshot's two sentences and the rail's fallback purpose.
- **code-path** — every line cited, at `b5bd7caa0`.
- **runtime/database** — ⛔ **none read.** The `none`/`ambiguous` discrimination is owed.
- **inference** — that duplicate `ELEMENTAL_ALCHEMY` Works are what makes it ambiguous. Consistent with the founder's own prior observation; not witnessed.

## Standing

```
WS-MAIA-WORK-CONTEXT-01   OPEN · trace complete · read-only
Passage Work              CAUSE ESTABLISHED · sub-cause OWED (one query)
Chapter Review            INDEPENDENT · no defect demonstrated
repair                    ⛔ NOT AUTHORIZED
production                UNTOUCHED
Part A/B                  SEALED at e823bb9ef
```
