# WS-DISCLOSURE-ORIENTATION-01 · CENSUS

> **A gesture the member cannot understand is not a sovereign act; it is a dialog box.**

**Date:** 2026-09-14 · **Base:** `de2180e32378725f453e7154e2e0a092beab63b0`
**Class:** CENSUS / READ-ONLY · ⛔ no code change · no UX design · no copy proposal ·
no new authorization object · no heading ruling

---

## 0 · Verdict

**FORK B — an ordinal orientation substrate EXISTS and is NOT rendered to the member.**

⭐⭐ And the gap is wider than B's wording implies: **the authorization gesture has no
member surface at all.** `pendingAskRef` occurs in exactly one file in the repository —
the route that emits it. Nothing reads it. No client can perform ACT 3.

⛔ **Not fork D** — a lawful non-prose substrate does exist (§3).
⛔ **Not fork A** — it exists but is not rendered, and its only destination is MAIA.
⚠️ **Fork C is not yet knowable.** Whether "Section 4" is adequate for member
recognition cannot be tested while nothing is rendered. **C is downstream of closing B**,
and asserting C now would be a claim about a surface that does not exist.

**The heading question stays PARKED.** The evidence does not prove we need that ruling:
the defect is integration, not substrate absence.

### ⭐⭐ This is a PROTOCOL DISCONTINUITY, not weak wording

```text
server reaches BODY_AUTHORITY_REQUIRED
        ↓
authorization opportunity exists
        ↓
member-facing continuation
        ∅
```

⚠️ **There is presently no member authorization surface to improve. The client protocol
does not represent the pause.** ⛔ The next lane must not begin from *"the consent dialog
needs better copy"* — that is already one abstraction past the finding.

⭐ And the pause being a **successful protocol state rather than a refusal** is what makes
§2 consequential: the server can pause correctly while the client has no semantic
category for the pause, so the discontinuity presents as silence rather than as an error.

---

## 1 · The actual pause contract

`app/api/sovereign/manuscripts/[id]/ask/route.ts`, ACT 2:

```ts
return NextResponse.json({
  result: 'BODY_AUTHORITY_REQUIRED',
  threadId: liveThreadId,
  pendingAskRef: ref,
  workRef: manuscriptId,
  sections: bodyReq.sections,
  staleness,
});
```

| field | provenance | authored material? |
|---|---|---|
| `result` | route constant | no |
| `threadId` | thread identity | no |
| `pendingAskRef` | minted opportunity identity | no |
| `workRef` | manuscript id | no |
| `sections` | `deriveBodyRequirement` → sorted **section UUIDs** | **no** |
| `staleness` | `StalenessState` | no |

`deriveBodyRequirement` unions `sectionIdsOf` over body-requiring refs only and returns
`{ required, sections: [...].sort() }` — **identities, nothing else.**

⭐ **The payload is already content-free.** The constitutional discipline held. What it
does not contain is anything a human could orient by.

**Status code: 200.** The pause is not an error, correctly — and §2 shows what that
costs on the surface as built.

---

## 2 · The actual member surface

⛔ **There is none.**

```text
pendingAskRef   → 1 file   app/api/sovereign/manuscripts/[id]/ask/route.ts
authorizes      → route + tests only; NO client sends it
```

**ACT 3 is unreachable from any UI in this repository.**

### What happens today when a member hits the pause

`lib/writersStudio/askClient.ts` types `AskOutcome` with no `BODY_AUTHORITY_REQUIRED`
variant. The pause returns **200**, so the client takes its success branch:

```ts
return { ok: true, threadId: j.threadId as string,
         thread: j.thread as AskThreadView,   // ⚠️ undefined — the pause has no thread
         staleness: ..., location: ... };
```

Both consumers then do the same thing (`ObservationDialogue.tsx:168`,
`AskMaia.tsx:98`):

```ts
if (r.ok) { setThreadId(r.threadId); setThread(r.thread); setDraft(''); }
```

and the transcript is rendered behind `{thread && thread.turns.length > 0 && (…)}`.

**Observed consequence, from the code as written:**

```text
the conversation pane      disappears      (thread is undefined → falsy)
the writer's question      is cleared      (setDraft(''))
a refusal                  is NOT shown    (ok:true took the success branch)
an authorization request   is NOT shown    (no branch exists for it)
```

⭐ The surfaces are careful elsewhere: *"THE QUESTION IS NOT CLEARED ON A REFUSAL. The
words are the writer's and the room does not eat them because the wire failed."* That
protection does not fire here, **because a pause is not a refusal** — it arrives down the
success path the comment never anticipated.

⚠️ No crash: the render is guarded. The failure is silent, which is worse for the member
than a visible error.

---

## 3 · The existing orientation substrate

`lib/manuscript/ask/developmentalLabels.ts` → `labelsFor(readState)`.

⭐⭐ **THE THREE OBJECTS ARE ALREADY DISTINCT IN CODE — and two of them are conflated by
their shared destination, not by their derivation.**

| object | derivation | authored? | destination today |
|---|---|---|---|
| **section identity** | the UUID itself | no | the pause payload |
| **section orientation** | `section(id)` → `Section N` from frozen `sectionTopology`; unknown ids → *"a section outside what you read"* | **no** | **MAIA's system prompt** |
| **authored structural language** | `unit(id)` → `"${u.title}"` from frozen `structureContext`; untitled → *"an untitled {kind} (number N at its level)"* | **YES** | **MAIA's system prompt** |

⭐ `labelsFor` has exactly **one** consumer: `developmentalAskReader.systemFor()`, which
assembles the system prompt. Its destination is the model, never the member.

```text
labelsFor(readState) → evidenceSays / movedSays / locationSays → systemFor → MAIA
```

⚠️⚠️ **THE TRAP, NAMED BEFORE ANYONE WALKS INTO IT.** `labelsFor` is a single object
returning three functions, two of which have *different* provenance. `section()` emits no
authored character. `unit()` emits **the author's own title**. Reaching for "the existing
label helper" as a member-orientation vehicle would carry authored structural language
across a boundary this lane has not ruled on — **inside the very object that looks like
the safe answer.** ⛔ Finding `section()` confers no authority to use `unit()`.

⚠️ `labelsFor` is a capability removal, not an instruction — *"Every function here takes
an id and CANNOT return it."* That property is real and is why the substrate is a
candidate at all. ⛔ It is not evidence the member receives or understands the output.

⭐⭐ **THE SAFE CONCLUSION, STATED SO IT CANNOT BE ROUNDED UP:**

> `section()` demonstrates that **non-authored orientation is possible.**
> It does **not** establish that `labelsFor` is an **authorized presentation object.**

⛔ Those are different claims. The first is a substrate fact this census establishes. The
second would be a design ruling, and nothing here makes it.

---

## 4 · Comparable sovereign gestures — precedent only

| gesture | object named | what the member sees | act performed | depends on authored language? |
|---|---|---|---|---|
| **Sanctuary** | the session | *"This session won't be remembered. Speak freely."* — rendered on `/maia/privacy`, `/relationship/[spaceId]/threshold` | explicit opt-in | no |
| **Anchor `surface_preference`** | one anchor | a rendered toggle: *"Private — only when you bring it up"* vs *"Let MAIA gently reference this anchor"* | per-object toggle | the anchor is the member's own words |
| **Atoms `return_preference`** | one atom | controls on `/maia/workbench`, `/maia/keep-capture` | per-object preference | the atom is the member's own words |
| **Focus disclosure** | one focus request | ⛔ **nothing** — `focusDisclosureSurface.ts` is a complete presentation contract with **no client caller in `app/` or `components/`** | `try_again` · `start_new_focus_request` · `continue_without_focus` | no |

⭐⭐ **THE PRECEDENT THAT MATTERS MOST IS THE ONE WITH THE SAME DEFECT.** Focus already
has an epistemic ladder — `did_not_cross` · `prior_unresolved` · `prior_crossed` ·
`crossed_accounted` · `crossed_unaccounted` — with the governing rule *"the surface may
state only what the receipt outcome proves about THIS invocation and any prior one"*, and
*"⛔ Database vocabulary never reaches the writer."* **It is served by the API and read by
no UI.**

⭐ So this is not a one-off. **Two disclosure paths have careful member-facing contracts
and neither is rendered.** The anchor and atoms gestures — both older, both simpler, both
about the member's *own words* — are the two that actually reach a screen.

⛔ Precedent recorded, not selected. No template chosen.

---

## 5 · The legibility boundary

| stage | what the SYSTEM knows | what the MEMBER can know from the interface today |
|---|---|---|
| **relevant** | `deriveBodyRequirement` over body-requiring refs; `section-run` refs deliberately excluded | nothing |
| **opportunity** | a minted single-use act, TTL-bounded, ⛔ not evidence a human acted | nothing — the pane blanks and the question is cleared |
| **member gesture** | would be `authorizes[]` + `pendingAskRef` | ⛔ **no surface exists to perform it** |
| **authorized** | claim is the `ON CONFLICT DO NOTHING` insert | nothing |
| **disclosed** | one boundary per section, all `may_cross`, then `loadRevisionContent` | nothing |
| **accounted** | receipts `attempted → crossed`, atomically with turn + completion | nothing |

⭐⭐ **The custody law is perceptible to the member at ZERO of the six stages.**

⚠️ And the asymmetry is the finding: the system's knowledge at every stage is unusually
precise — server-derived, atomically recorded, refusal-truthful. **None of that precision
has anywhere to land.**

---

## 6 · The two empirical questions

> **Can the current system orient a member to the requested disclosure scope without
> reading or surfacing new authored prose?**

**YES.** `section(id)` derives `Section N` from the reading's own frozen topology,
returns an honest phrase for an id outside it, and cannot return the id. No authored
character is required.

⚠️ Two qualifications, stated because they bound the answer rather than decorate it:
`labelsFor` requires a `DevelopmentalReadState`, and whether one is in hand at ACT 2 is a
question this census does not answer (answering it starts design). And *adequacy* is not
*existence* — see below.

> **Does the current surface actually do so?**

**NO.** Nothing renders. The ordinals go to MAIA.

---

## 7 · What this census deliberately did NOT establish

⛔ That "Section 4" is **sufficient** for member recognition. Fork C is an empirical
claim about a rendered surface, and there is no rendered surface. ⭐ *Existence of a
derivation is not evidence that the member receives or understands it* — and it is
equally not evidence that they would.

⛔ Whether `manuscript_sections.heading` may be returned to its author at the pause.
**PARKED.** The evidence does not force the ruling: the substrate is present and the
defect is that it is not delivered. ⚠️ If a rendered ordinal surface later proves
inadequate, that ruling becomes critical path — but on evidence from a real surface, ⛔
never pre-emptively.

⛔ Whether a `DevelopmentalReadState` is available at ACT 2.

⛔ Any claim that Focus's unrendered presentation contract is a defect of *this* lane.
It is a second instance of the same pattern, recorded as such.

---

## 8 · Standing

```text
WS-DISCLOSURE-ORIENTATION-01   CENSUS COMPLETE · READ-ONLY

verdict                        FORK B
                               substrate exists · not rendered
                               gesture has no surface at all

heading question               PARKED — evidence does not force it
fork C                         NOT YET KNOWABLE — downstream of closing B
source                         UNCHANGED · no code · no UX · no copy · no schema
```

⛔ Nothing is authorized by this record. The next act is a founder ruling.
