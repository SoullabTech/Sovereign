# WRITING-STATE-ANNOUNCE-01 · PHASE B — THE DRAFT SAYS WHAT IT IS

**Base** canonical `14efac449` · branch `claude/writing-state-announce-01`.
**Status: BUILT · BROWSER-WITNESSED 22/0 ACROSS ALL FIVE STATES · MERGE NOT
AUTHORIZED · PRODUCTION UNTOUCHED.**

> ⭐⭐ **The governing law, as ruled:** the system may decide whether an act is
> technically **available**; the member decides whether an act that durably
> changes the **structure** of their Work is **taken**.

⛔ No automatic conversion. ⛔ No change to conversion semantics. ⛔ No new
state taxonomy. ⛔ No schema change. ⛔ No Section-vs-Whole redesign.

---

## 1 · What changed — a relocation, not a vocabulary

`app/writers-studio/canvas/DraftStateNotice.tsx` renders the draft's state in
the **writing field**, directly above the surface the writer is about to use.

The copy (`SECTION_BREAKS_COPY`), the five server states, and the availability
gate are **unchanged**. What changed is who carries them:

| | before | after |
|---|---|---|
| state explained in | the **Outline panel** — dismissible, opens on the **Source** having sections, while describing the **draft** | the **writing field** |
| a Work begun in the Studio | ⛔ **no explanation anywhere** | announced at the starting surface |
| the conversion act | in the Outline | in the field, **exactly once** |
| the Outline | owned the state | still marks *"These rows are not navigable yet"* — ⛔ no longer the carrier |

⭐ Placed in the room rather than inside `FieldBody`, because the server state,
the confirm handler and its pending flag already live in that scope. ⛔ Threading
three props down to say the same thing one level lower would be plumbing, and
`FieldBody` would hold a state it does not act on.

### Per state

```
section_aware          ⛔ nothing — the normal Studio explains itself by working
continuous             the state, and ONE explicit act
continuous_unprovable  the state, truthfully, and ⛔ NO act
no_draft               a truthful beginning, at the starting surface
indeterminate          unchanged — fails closed, and acquires no second sentence
```

⛔ The act is gated on `mode === 'continuous'` — the **server's** state, never the
mount, because `worktable` collapses three states and only one can convert.

---

## 2 · Witness — 22 passed · 0 failed, real Chromium, all five states

⭐⭐ **The outline panel is DISMISSED throughout.** The defect being repaired was
that the truth lived in a panel that could be closed, so a witness that left it
open would prove nothing.

- **S1–S4** the fixtures really do produce `no_draft` · `continuous` ·
  `continuous_unprovable` · `section_aware`
- **C1–C5** with the outline dismissed the field names `continuous`, offers
  **exactly one** act, and the outline no longer carries the state
- **C6** ⛔⛔ **nothing converted by itself** — `section_addressable_at` still NULL
- **U1–U4** `continuous_unprovable` is named, ⛔ **no act shown**, writing still available
- **N1–N3** `no_draft` is announced at the starting surface, ⛔ not in the outline
- **A1–A2** `section_aware` gets **no banner** and the writer is in her sections
- **T1–T3** ⭐⭐ she clicks; structure becomes durable **because she asked**; the
  server then reports `section_aware` and the sections are real

Source obligations: `sectionAddressabilityLifecycle` **20/20** (was 17 — three
added by this act), `postBeginDraftRefresh` green. ⭐ The *"reachable from
exactly one place"* law was **strengthened**: it was only ever asserted in one
file; it now **counts the affordance across both**, so a future re-duplication
fails there instead of shipping.

---

## 3 · ⚠️⚠️ A FINDING THE WRONG FIXTURE EXPOSED — reported, ⛔ not repaired

My first fixture composed the draft with markdown headings (`# One`), which is
the **legacy** composer; `composeCurrent` emits a bare heading and a blank line.
The conversion door refused:

```
409  boundary_confirmation_required
     the draft has diverged from its source partition (source 76, draft 78)
```

⭐ **But the server had reported that same draft as `continuous`** — S2 passed on
that run. So:

> ⚠️ **The availability gate and the act's own precondition can disagree.**
> `resolveDraftWriteState` reports `continuous` for `EDITED` drafts where every
> boundary is resolved and `otherHeadingDiff === 0`, while `planConversion`
> refuses anything not byte-identical to the source partition. A draft in that
> band is **offered an act that refuses**.

⛔ **Not repaired — conversion semantics and the state taxonomy are both outside
this act.** But it is squarely this act's subject: the copy's own comment says it
*"must not imply an act that is not on offer"*, and the state can. This is a
narrower and more precise version of the same defect, one layer down, and it
deserves its own ruling.

⭐ It was diagnosable only because the witness **reads the refusal from the
response** instead of inferring failure from an expired timer.

---

## 4 · ⚠️ Two instrument defects of my own

1. **`count()` does not auto-wait.** `C1` read 0 while the very next assertion,
   which does auto-wait, read the state correctly. The race was in the
   instrument, not the surface; it now waits before counting.
2. **My fixture used the legacy composer** (§3). The finding above is the
   dividend.

---

## 5 · Against ACT 5's acceptance test

```
"Which Soullab writing system am I supposed to use?"   ⛔ no longer asked
"Do I want this structure made durable?"               ⭐ asked, once, of the member
Section vs Whole                                        ⭐ untouched — a WRITING decision
```

⚠️ One honest qualification: **zero concealed product decisions holds for the
four states witnessed.** The §3 band — offered an act that refuses — would
present as a control that fails, which is a different defect than a concealed
decision, and it remains open.

---

## 6 · Gates

- browser witness → **22 passed · 0 failed**, five states
- Writer's Studio suites → **887 passed · 53 suites · 0 failed**
- `npm run typecheck` → **229 vs baseline 239 · 0 regressions · exit 0**

## 7 · Standing

**WRITING-STATE-ANNOUNCE-01 · PHASE B BUILT · WITNESSED · ⛔ MERGE NOT
AUTHORIZED · ⛔ PRODUCTION UNTOUCHED.** Next: `ADOPTION-01`. Open and unruled:
the availability/precondition disagreement in §3.
