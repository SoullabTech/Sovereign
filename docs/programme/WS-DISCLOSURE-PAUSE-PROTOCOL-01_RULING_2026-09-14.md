# WS-DISCLOSURE-PAUSE-PROTOCOL-01 · DESIGN RULING

> **A gesture the member cannot understand is not a sovereign act; it is a dialog box.**
> And a protocol state the client cannot represent is not a pause; it is a silence.

**Date:** 2026-09-14 · **Base:** `6b8f1dc7523a92b45bf463496ce6ceffd47d97fb`
**Class:** ARCHITECTURE / DESIGN RULING · ⛔ no implementation · no member-facing UX

```text
S3 law
  ↓
BODY_AUTHORITY_REQUIRED
  ↓
WS-DISCLOSURE-ORIENTATION-01     finding: client protocol discontinuity   CANONICAL
  ↓
WS-DISCLOSURE-PAUSE-PROTOCOL-01  ← THIS RULING
  ↓
member-surface design            ⛔ NOT OPEN
```

---

## 0 · Outcome

**A — a lawful pause protocol CAN carry non-authored ordinal orientation.**

⭐ The decisive question (Q2/Q3) resolves cleanly and in the affirmative: the frozen
read state is **already in hand** at ACT 2 under the reading authority this Ask was
anchored on, and `Section N` is derivable from it by array position alone — **no new Work
read, no heading, no title, no prose, not one authored character.**

⚠️ **WITH ONE SCOPE AMENDMENT, and it is material.** The discontinuity is **wider than the
census named**. The census found one unrepresented outcome. The route emits **six**
protocol outcomes at HTTP 200, and the client type represents **none** of them (§1).
⛔ This is not a new lane — it is the same discontinuity at its true size, and defining it
is exactly this lane's remit. ⭐ But the next lane must be scoped to six, not to one.

---

## 1 · Q1 — What is the protocol object?

### The six outcomes the route already emits at HTTP 200

| `result` | carries | today's client reading |
|---|---|---|
| `BODY_AUTHORITY_REQUIRED` | `pendingAskRef` · `workRef` · `sections[]` · `staleness` | ⛔ success, `thread` undefined |
| `BODY_SCOPE_INCOMPLETE` | `pendingAskRef` · `sections[]` | ⛔ success, `thread` undefined |
| `AUTHORIZATION_EXPIRED` | `threadId` | ⛔ success, `thread` undefined |
| `INTERRUPTED` | `threadId` · `staleness` | ⛔ success, `thread` undefined |
| `BODY_UNVERIFIABLE` | `staleness` · `location` | ⛔ success, `thread` undefined |
| `ALREADY_COMPLETED` | `thread` · `staleness` · `completionRef` | ⚠️ **renders, and lies** |

⭐⭐ **`ALREADY_COMPLETED` is the most dangerous of the six, precisely because it works.**
It carries a real `thread`, so today's client renders it correctly and the member sees
their answer. **What is lost is that this was a RECOVERY of an execution that already
happened, not a fresh one.** ⛔ Five outcomes fail loudly-ish (a blank pane); this one
fails silently and looks like success. *A recovered answer presented as a new answer is
the completion-identity law broken at the surface after being upheld everywhere beneath.*

### P1 — the ruling

**`BODY_AUTHORITY_REQUIRED` is a first-class protocol outcome.** The client type must
discriminate **at least three kinds**, ⛔ never two:

```text
answered      an execution produced this answer now
recovered     a PRIOR execution produced this answer; completion identity names it
pending       the server is waiting on a member act that has not happened
refused       the server declined, and says what it can truthfully say
```

⛔ `pending` must not be reachable through the `ok:true` branch by accident. ⛔ It is not
a refusal: nothing failed, nothing was denied, and the member has done nothing wrong.

⚠️ **HTTP status cannot be the discriminator and must not be made one.** 200 is the
truthful status — the request succeeded and the server answered it. ⭐ The discriminator
is `result`, which the route already emits. **The server's protocol is not missing; the
client's type is.**

---

## 2 · Q2 — What lawful information exists at ACT 2?

**A `DevelopmentalReadState` IS available. Established, not inferred.**

At `app/api/sovereign/manuscripts/[id]/ask/route.ts`, on the developmental path, before
the pause is reached:

```text
loadFrozenDevelopmentalReading(manuscriptId, anchor.readingId, memberId)
        ↓
checkObservationAnchor(anchor, reading)        ← refuses a mismatched anchor
        ↓
reading.readState                              ← ALREADY USED at this point:
                                                 openThread() records draftId,
                                                 revisionNumber, inputFingerprint
```

| question | answer |
|---|---|
| available at ACT 2? | **YES** |
| from where? | `reading.readState`, on the frozen reading this Ask is anchored to |
| already lawful? | **YES** — the same reading authority that admitted the Ask; anchor-checked before use |
| any new Work read? | **NO** — `loadRevisionContent` is the single body read in the file and is unreachable at ACT 2 |

⭐ It is not merely available — **it is already being consumed at the pause**, to open the
thread. Nothing new is fetched, opened, or widened.

---

## 3 · Q3 — Can ordinal orientation reach the client without widening disclosure?

**YES.**

```ts
sectionTopology: readonly string[]   // "the ordered section ids as read"
```

```text
required section UUID  +  already-held ordered id array
        ↓
indexOf(id) + 1
        ↓
"Section N"
```

⭐⭐ **The derivation is array position.** It reads an array of identifiers and returns an
integer. There is no branch through which an authored character could enter, because no
authored character is in the input.

The frozen state's other members, checked for the same property:

| member | content | authored? |
|---|---|---|
| `sectionTopology` | ordered ids | **no** |
| `sections[id]` | `{revisionNumber, range, digest}` | **no** |
| `revisionDigest` · `inputFingerprint` | digests | no |
| `structureContext.units[].title` | the author's own titles | ⚠️ **YES** |

### ⚠️⚠️ THE PROHIBITION CANNOT REST ON ABSENCE

**`structureContext` is in hand at the pause too.** The authored titles are *right there*,
on the same object, one property away. Nothing makes emitting them hard.

⭐ So P5 is not a description of what is unavailable. It is a **constraint on a capability
the code already has**, and it must be enforced structurally or it will not hold.

⭐⭐ **And the protocol does not need `labelsFor` at all.** The ordinal is one array lookup
on `sectionTopology`. ⛔ Reaching for the helper would import `unit()` — the function that
returns `"${u.title}"` — into the pause path for no gain. **The safest form of P5 is that
the pause never imports the object containing the capability it must not use.**

⚠️ **One adjacency, flagged not decided:** `sections[id].range` is a code-point range, so
it carries section *lengths*. The ordinal derivation does not read it and must not carry
it. ⛔ Whether an offset is disclosure is not ruled here; it is simply excluded.

---

## 4 · Q4 — The writer's draft during the pause

**The draft is LOAD-BEARING. This is not courtesy; it is protocol.**

⭐⭐ **ACT 3 requires `question`.** Every POST to this route does, the authorize act
included:

```ts
const question = typeof body.question === 'string' ? body.question.trim() : '';
if (!question) return … { refusal: 'malformed', detail: 'question' } … 400;
```

⛔ **And the pause payload does not return the question.** So:

```text
client clears the draft on the pause
        ↓
the member's words exist only in the server's thread record
        ↓
the continuation cannot be formed
        ↓
the paused Ask is UNRESUMABLE, and the opportunity expires unused
```

**P2 is therefore a correctness requirement, not a nicety.** ⭐ The census recorded that
today's client clears the draft (`setDraft('')`) because the pause arrives down the
success path. That is not merely rude — **it destroys an input the protocol requires.**

⚠️ **A second, subtler consequence.** `isHeldRetry(priorTurns, question)` decides whether
to append the author's turn again. A continuation carrying *edited* prose appends a
**second author turn**. ⛔ It changes no authority — `bodyReq` derives from the
observation's evidence refs, never from the question, so **editing the question cannot
widen what is authorized** — but it doubles the transcript. ⭐ *Prose does not gate
authority here; it does shape the record.*

---

## 5 · Q5 — What is replay?

Four things, pinned apart:

```text
1  RETRY THE PAUSED ASK          same Ask, no act
                                 → ACT 2 again → mints ANOTHER opportunity
                                 ⭐ lawful: an opportunity is not authority.
                                 ⚠️ opportunities accumulate; the client must
                                    carry the ref it was last given.

2  CONSUME THE OPPORTUNITY       act + pendingAskRef + authorizes[]
                                 → claimAct → the INSERT is the consumption
                                 ⭐ the only act that spends anything

3  REPLAY A LOST RESPONSE        same act, same pendingAskRef, after a lost reply
                                 → claim.kind === 'already'
                                   completed   → ALREADY_COMPLETED + completionRef
                                   incomplete  → INTERRUPTED
                                 ⛔ never crosses again

4  CREATE A NEW OPPORTUNITY      a fresh ACT 2 after expiry or a new question
                                 ⛔ requires a NEW member gesture to become authority
```

⭐ **P8 holds in the substrate already**: `claimAct` is `ON CONFLICT DO NOTHING` — a second
claim on the same act produces no row and is reported as `already`. **Replay cannot
manufacture a second authority act, because the second claim never exists.**

⭐ **P9 also holds in the substrate — and is where the client currently breaks it.** A
lost response after a member gesture returns `ALREADY_COMPLETED` with the *identical*
completion identity, so the member need not authorize twice. ⛔ But a client that does not
represent `ALREADY_COMPLETED` cannot tell recovery from execution, and a client that
represented it as *failure* would push the member to gesture again. **P9 is a client
obligation even though the server already satisfies it.**

⚠️ `AUTHORIZATION_EXPIRED` (TTL 30 minutes) is a **fourth-kind** outcome: the opportunity
lapsed, nothing was consumed, and a new gesture is lawful. ⛔ It must not present as a
refusal of the member's act — **no act occurred.**

---

## 6 · Q6 — What the continuation must carry

**The minimum, and nothing that could be mistaken for authority:**

```text
threadId                                  the paused conversation
question                                  the member's own words, unedited
act: 'authorize_sections_and_resume'      a distinct closed act, ⛔ not a flag
pendingAskRef                             the opportunity being consumed
authorizes: string[]                      section identities the member named
```

⛔ **Not carried, and structurally cannot be:** `may_cross`, `allowBody`, a client-derived
requirement set, browser or session state, or anything reconstructed rather than received.

⭐ **Every one of these is checked server-side against the act's own coordinates** —
member, manuscript, thread, reading, observation key — and a mismatch is
`authorization_not_for_this_ask` (409). ⭐ **A superset in `authorizes[]` is ignored, not
honoured**; a subset is `BODY_SCOPE_INCOMPLETE` **before** the claim, so an incomplete
client set cannot spend the member's single act.

⭐⭐ **P10 in one line:** the client may carry the **identity** of what MAIA needs to read.
⛔ It may never carry, assert, or imply the **content**, the **permission**, or the
**fact of a read**.

---

## 7 · The invariants, adjudicated

| | invariant | standing |
|---|---|---|
| **P1** | pause is a first-class outcome | ⚠️ **client gap** — server emits `result`; the type has no variant |
| **P2** | pause does not clear the draft | ⚠️ **client gap, and load-bearing** (§4) — the continuation needs it |
| **P3** | rendering orientation does not disclose body | ✅ **satisfiable** — ordinal is array position (§3) |
| **P4** | identity and orientation stay distinct | ✅ — UUID travels as authority; ordinal only as orientation |
| **P5** | no authored structural language crosses | ⚠️ **must be structural** — `structureContext` is in hand (§3) |
| **P6** | opportunity ≠ member action | ✅ **substrate law** — consumption row is the first durable human fact |
| **P7** | only the gesture consumes it | ✅ **substrate law** — the INSERT is the claim |
| **P8** | replay cannot mint a second authority | ✅ **substrate law** — `ON CONFLICT DO NOTHING` |
| **P9** | response loss ⇒ no second gesture | ⚠️ **server satisfies it; client cannot express it** (§5) |
| **P10** | client explains need, never prior read | ✅ **satisfiable** — identities only (§6) |

⭐ **Six of ten are already law in the substrate. Four are client-side, and all four are
the same omission**: the client has no vocabulary for the protocol the server speaks.

---

## 8 · What this ruling does NOT authorize

⛔ No component, modal, sheet, card, copy, or styling.
⛔ No heading exposure. ⛔ No unit-title exposure. ⛔ No use of `labelsFor` — §3 finds it
**unnecessary**, which is a stronger reason to refuse it than mere caution.
⛔ No Focus contract adoption.
⛔ No migration, no schema change, ⛔ no change to S3 authority semantics — and none is
needed: **outcome C did not arise.** Every invariant is satisfiable without touching the
authority law.
⛔ **Fork C stays unanswered.** That ordinal orientation is *lawfully deliverable* says
nothing about whether `"Section 4"` is *recognizable to an author*. That requires a real
surface, and no surface is authorized here.

**The heading question stays PARKED**, and is now further from critical path than it was:
§3 establishes the non-authored substrate reaches the pause lawfully. ⭐ It becomes live
only if a rendered ordinal surface later proves inadequate — ⛔ on evidence from that
surface, never pre-emptively.

---

## 9 · Standing

```text
WS-DISCLOSURE-PAUSE-PROTOCOL-01     DESIGN RULING COMPLETE

outcome                             A
Q2 read state at ACT 2              AVAILABLE · already lawful · no new Work read
Q3 ordinal without widening         YES · array position on sectionTopology
Q4 draft                            LOAD-BEARING · the continuation requires it
Q5 replay                           four kinds pinned · P8/P9 hold in substrate
Q6 continuation                     five fields · identities only

scope amendment                     the discontinuity is SIX outcomes, not one
                                    ALREADY_COMPLETED renders and misreports

S3 authority law                    UNTOUCHED · outcome C did not arise
heading question                    PARKED · further from critical path
Fork C                              UNANSWERED · needs a real surface

member-surface design               ⛔ NOT AUTHORIZED — separate founder act
```

⛔ Nothing is authorized by this record. The next act is a founder ruling.
