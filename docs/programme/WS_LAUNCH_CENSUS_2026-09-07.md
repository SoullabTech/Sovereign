# Writer's Studio launch census — Gate 2 · DISCOVER

**Source SHA:** `3027ceaff` · **Read-only.** No repairs, no fixes.
**Classification:** A LIVE · B CONTEXTUALLY INAPPLICABLE · C HONESTLY UNAVAILABLE · D CLAIM FAILURE

## Authority

`app/writers-studio/studioMap.ts` — `STUDIO_MAP` is the single source of truth.
`availability: 'available' | 'later'`, plus `requiresManuscript`. `shellDestinations()`
resolves `actionable`; `StudioRail.tsx` renders an unavailable destination as a
`<span>` with no href, `aria-disabled`, `data-actionable="false"` — **honest by
construction, not by discipline.** Map `count` values are stripped deliberately.

## Rail — 16 destinations

```text
GROUP        ID              MAP           GATE                CLASS
work-space   home            available     —                   A
             manuscript      available     requiresManuscript  A / B without a Work
             materials       later         satisfiedInRoom     B in canvas · C elsewhere
             structure       later         satisfiedInRoom     B in canvas · C elsewhere
             notes           later         —                   C
             versions        later         —                   C  (see D-01)
             goals           later         —                   C
maia         conversations   later         situatedHrefs       B — needs a declared Work
             discover        later         —                   C
             insights        later         —                   C
             suggestions     later         —                   C
tools        find-replace    later         —                   C  ← launch candidate
             statistics      later         —                   C
             timeline        later         —                   C
             word-web        later         —                   C
             export          available     requiresManuscript  A / B without a Work
```

**Three `available`. Everything else is `later` and renders inert.** The dimness
seen in screenshots is B (context) for materials/structure/conversations/manuscript/export
and C (unbuilt) for the rest — the distinction that made an earlier screenshot
reading wrong.

## Modes

```text
write available A · develop available A · explore later C · review later C · publish later C
```

Develop is reachable from the mode bar. `HomeView.tsx` links only Import and
Canvas — no `DEVELOP_HREF`. Confirmed identical at `e535e6246` and `3027ceaff`.

## D-01 — CLAIM FAILURE · Versions

`app/writers-studio/canvas/page.tsx:329`

```ts
setRevisions(r.kind === 'ok' ? r.revisions : null);
```

**A failed read and an in-flight read are the same state.** `StudioLowerBand.tsx:99`
renders `revisions === null` as `reading…`, so a failure shows "reading…"
permanently — the panel promises results that are not coming.

Worse, `page.tsx:456`:

```ts
railCounts.versions = revisions?.length ?? 0;
```

A failed read renders as **Versions 0** — not a missing fact but a false one. The
member is told they have no versions kept when the truth is that we could not find out.

**Not established:** whether the read is currently failing in production. Two
screenshots show `reading…` persisting; one showed `Versions 1`, which means it
does sometimes resolve. The defect is the *conflation*, which is real in source
regardless of current firing rate.

Repair shape (NOT authorized): distinguish `null` loading from an error state, and
never render a count derived from a failed read.

## Launch reading

```text
FIND        C — honestly unavailable · the launch candidate
VERSIONS    D-01 · fix or make honest — currently it can assert a false zero
all other C affordances ship as-is; they claim nothing
```

## Not covered

Develop-room internals beyond reachability; Explore/Review/Publish; runtime
confirmation of D-01. This is a source census at one SHA.

---

# Extension — Develop room internals (DISCOVER, read-only)

**Correction to this document's own headline.** *Rail actionability* cannot lie by
construction; **rail metadata still can.** `Versions 0` travels a channel with no
honesty guarantee. The rail's `<span>` discipline governs links, not numbers.

## Classification

```text
AFFORDANCE                     CLASS  BASIS
Develop entry (route)          A      DEVELOP_HREF · mode bar only, no Home door
list load                      A      ListPhase loading|ready|unauthorized|error
preparation                    A      prep loading|ready|error; act = working|refused
lens selection                 A/B    B while commission.phase === 'reading' (fieldset disabled)
lens meaning (LENS_MEANING)    A      rendered in the selector, ordinary state
commission ("Ask MAIA…")       A      idle|reading|refused
invocation sentence            A      rendered unconditionally, not failure-gated
refusal copy                   A      refusalSentence(), inside the refused branch only
reading payload                A      payload=null ALWAYS paired with not_found|error
coverage                       A      view.coverage.sentence
observations                   A      view.observations
RESTS ON (evidence)            A      o.evidence via describeRef against frozen readState
"rests on your structure"      A      conditional on dependsOnStructure
dialogue                       A      ObservationDialogue, keyed by dialogueSurfaceKey
return path                    A      "Keep a version" link on revision_not_current
title                          A      THREE-state: undefined | null | string
standing (Keep/Dismiss/…)      C      dark behind NEXT_PUBLIC_WS_STANDING_ENABLED
```

**No D-class finding in Develop.**

## The load-bearing result

Develop already implements the exact pattern the Canvas room lacks.

```ts
// DevelopRoom.tsx:260-263 — failure is NEVER silent
if (!r.ok) { setPayload(null); setReadingPhase(r.refusal === 'not_found' ? 'not_found' : 'error'); return; }

// DevelopRoom.tsx:389 — three states, not two
const headline = title === undefined ? '' : (title ?? UNTITLED_EXPRESSION);
```

versus

```ts
// canvas/page.tsx:329 — failure and loading collapse to one value
setRevisions(r.kind === 'ok' ? r.revisions : null);
```

**D-01 is a local defect in Canvas, not a systemic pattern.** The repair has an
in-repo precedent to copy rather than a design to invent: pair the null with an
explicit phase, and never derive a count from an unknown.

## Not located

An explicit **DOES NOT ESTABLISH** limits surface. `developPresentation.ts` carries
`describeRef` and a currency sentence ("The parts of the work this rests on are as
they were when MAIA read them"), which states evidence *currency*, not epistemic
*limits*. Either the surface does not exist (C) or it is named differently. Not
resolved here; recorded rather than guessed.

## Scope

Source census at `3027ceaff`. Not covered: Explore / Review / Publish, dialogue
internals, and any runtime observation.

---

# Extension — ObservationDialogue (DISCOVER, read-only)

Six questions, answered against code rather than against the file's own header.

```text
QUESTION                                   ANSWER   BASIS
what the dialogue claims MAIA knows        BOUNDED  bounds line, rendered ONCE at
                                                    the top, before the composer
                                                    (data-dialogue-bounds)
observation/evidence context stays         YES      about · readingId · observationKey
attached                                            are props; server keeps anchor+reading
leaving/reopening changes the subject      NO       resume is from the SERVER store
                                                    (threadsOn → loadThread), never
                                                    React state
failure/loading/empty collapse like        NO       explicitly refused — see below
Canvas Versions
dialogue implies it changed the work       NO       the bounds line says the opposite
or the standing                                     before the writer speaks
member can tell persisted vs present       MOSTLY   one ambiguity — see D-02
```

## The inverse of D-01, with the hazard named

`lib/writersStudio/observationDialogueResume.ts` separates four states where a
lazier design would use two:

```text
fresh        discovery SUCCEEDED and found nothing
resume       exactly one thread
choose       more than one — the writer picks, the room does not
unavailable  discovery FAILED — the room does not know, and must not write
```

Its own comment names the defect it refuses:

> *"THE ROUNDING THIS FUNCTION EXISTS TO REFUSE. `fresh` here would be a transient
> GET failure silently authoring a duplicate thread."*

That is the D-01 shape — unknown rounded to a confident value — recognised and
refused here. `sendMode()` then returns `blocked` with a `why` for every
non-sendable state, and permission and payload come from ONE call, so they
cannot disagree.

**Two rooms, same hazard, opposite outcomes.** The repair precedent for D-01 now
exists twice in-repo.

## Superseded disclosure

`ObservationDialogue.tsx:186` falls back, before the first turn, to *"This
observation was made against an earlier state of the work… she has not reread
the work."* Presented as the READING's claim, not as a measurement this room
made — the room computes no epistemic state; `location` arrives from the server.

## D-02 — MINOR · refusal copy claims a preservation it does not provide

`REFUSAL_SAYS.unreachable`:

> *"MAIA could not be reached. Nothing was lost — your question is held here."*

The draft is `useState('')` only — no localStorage, no sessionStorage, no server
write — and it is cleared solely on success. So the sentence is TRUE in the
narrow reading ("still in this box, right now") and FALSE across a close, which
this same file documents: *"Closing unmounts this component and everything it
held."*

Classified **D-candidate, not confirmed D**: the ambiguity is in what "held here"
means to a reader, not in a flat false statement. Severity low — the loss is one
unsent question after a failed send. Recorded rather than repaired; a founder eye
should decide whether the copy or the persistence is the thing to change.

**Scope:** source census at `3027ceaff`. Explore / Review / Publish deliberately
not covered.
