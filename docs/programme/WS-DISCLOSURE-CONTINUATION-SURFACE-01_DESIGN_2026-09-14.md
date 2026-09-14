# WS-DISCLOSURE-CONTINUATION-SURFACE-01 · DESIGN

> A gesture the member cannot understand is not a sovereign act; it is a dialog box.
> A protocol state the client cannot represent is not a pause; it is a silence.
> **And orientation that cannot reach the member is not orientation; it is a server-side fact.**

**Date:** 2026-09-14 · **Base:** `b371ae2487d748fbd7c9b7e2892f1ebcfe80beac`
**Class:** MEMBER-SURFACE DESIGN · ⛔ no implementation · no source change · no S3 law change

---

## 0 · Headline — the design STOPS at a collision, as instructed

⭐⭐ **S4 IS NOT SATISFIABLE INSIDE THIS LANE'S JURISDICTION.**

`WS-DISCLOSURE-PAUSE-PROTOCOL-01` established that `Section N` is lawfully **derivable**.
It is. ⛔ **But it is derivable SERVER-SIDE, and the pause payload carries neither the
ordinal nor the ordered topology it would be derived from.**

```text
pause payload   { result · threadId · pendingAskRef · workRef · sections[] · staleness }
sections[]      section UUIDs
AskThreadView   { id · anchor · openedAt · turns[] }        ⛔ no topology
```

**The client has no ordered id list and therefore cannot compute `Section N` from anything
it currently receives.** Carrying it would require a **new route field** — explicitly
outside this lane's jurisdiction.

⭐ Recorded as **D-1** (§7) and **not solved in UI.** Everything else below is designed and
returned; §4 is designed to the boundary and stops there.

---

## 1 · Semantic classification of all six states

⭐ **Only ONE of the six is an authorization moment.** Designing them as six dialogs would
be the error the lane's name was chosen to prevent.

| state | classification | member gesture needed? |
|---|---|---|
| `BODY_AUTHORITY_REQUIRED` | **interruptive choice** | ✅ yes — the only one |
| `BODY_SCOPE_INCOMPLETE` | **recoverable continuation** (defensive; unreachable from a correct surface) | ⚠️ re-offer, not re-decide |
| `AUTHORIZATION_EXPIRED` | **explanatory notice + recoverable continuation** | ⛔ no — a new Ask, not a new decision |
| `INTERRUPTED` | **explanatory notice + recoverable continuation** | ⚠️ a FRESH act, and the surface must say why |
| `BODY_UNVERIFIABLE` | **explanatory notice** | ⛔ **no — and asking would be a lie** |
| `ALREADY_COMPLETED` | **passive status on a recovered turn** | ⛔ no |
| *ordinary answered turn* | **the control condition** | ⛔ **unchanged (S1)** |

⭐⭐ **The load-bearing split is between the two that LOOK alike and are not**:
`INTERRUPTED` and `BODY_UNVERIFIABLE` both mean *you authorized and got no answer* — but in
the first **nothing was completed**, and in the second **the crossing happened**. ⛔ They
may never share copy.

---

## 2 · Member-facing surface and copy

⭐ Voice matched to the house precedent (Sanctuary; the anchor toggle): second person,
plain, calm, ⛔ no system vocabulary (S12) — no `pendingAskRef`, no `result`, no "boundary",
no "receipt", no "act", no UUID, no HTTP.

### 2.1 · `BODY_AUTHORITY_REQUIRED` — the only authorization moment

⚠️ Scope wording is **BLOCKED by D-1** (§4). Everything else is designed.

```text
To answer this, MAIA needs to read {SCOPE} of your draft.
She hasn't read it.

[ Let her read {SCOPE} ]     [ Not now ]
```

⭐ **"She hasn't read it" is the load-bearing sentence** (S11). The whole point of the
pause is that nothing has crossed; the surface says so in the member's own terms rather
than leaving them to infer it.

⭐ **"Not now" is a complete, unpunished answer** (S5). ⛔ No warning colour, no "are you
sure", no degraded-mode nag, no re-prompt on the next turn. Declining returns the member to
their draft with the question intact. *A choice that is expensive to decline is not a
choice.*

### 2.2 · `BODY_SCOPE_INCOMPLETE`

```text
That didn't cover everything MAIA needs.
Your permission hasn't been used.

[ Let her read {SCOPE} ]     [ Not now ]
```

⭐ **"hasn't been used" is required, not reassurance** (S6). It is literally true — the
scope check runs **before** the claim — and it is the fact the member cannot otherwise know.

### 2.3 · `AUTHORIZATION_EXPIRED`

```text
That permission has expired. Nothing was read.
You can ask again.

[ Ask again ]
```

⭐ **"Nothing was read" is true here** — the act was never claimed, so no boundary was ever
established. ⛔ It would be FALSE in §2.5, which is why the two are worded from opposite
facts.

⭐ **Time expired it, not MAIA** (S7). ⛔ Never "MAIA can't do that" / "declined" / "denied".

### 2.4 · `INTERRUPTED`

```text
MAIA started reading with your permission, but the answer never finished.
That permission was for that one reading, so it can't be reused.

[ Ask again ]
```

⭐⭐ **This one must carry a cost honestly.** The member *did* act; the act *is* spent; they
must act again. ⛔ The surface may not soften that into "try again" as though nothing
happened — that would quietly imply the first act is still available (S8).

⛔ And it may never imply the member did something wrong. **The permission was used
correctly and the work did not finish.**

### 2.5 · `BODY_UNVERIFIABLE` — ⛔ never asks for consent

```text
MAIA read the sections you allowed, but couldn't match them to what she
recorded earlier — your draft has most likely moved since.
This isn't about permission.

[ Ask again ]
```

⭐⭐ **"MAIA read the sections you allowed" is REQUIRED and is the hardest sentence here.**
This outcome is returned *after* every boundary returned `may_cross` and *after*
`loadRevisionContent`. **The crossing happened.** ⛔ Saying "nothing was read" would be the
`attempted` ≠ *nothing crossed* falsehood, committed at the surface after the substrate
spent a week refusing it.

⭐ **"This isn't about permission"** discharges S9 explicitly. ⛔ No consent control appears
on this state at all.

### 2.6 · `ALREADY_COMPLETED` — recovery, not cognition

⛔ Not a dialog. A **marker on the turn itself**, so it travels with the content it
qualifies:

```text
┌──────────────────────────────────────────────────┐
│ ↩ MAIA answered this earlier. This is that same  │
│   answer, shown again — not a new one.           │
├──────────────────────────────────────────────────┤
│ …the recovered turn…                             │
└──────────────────────────────────────────────────┘
```

⭐⭐ **`same thread content ≠ same event meaning`, made visible.** The content is identical
to an ordinary answer; **only the marker distinguishes a recovery from fresh cognition**
(S10, P11). ⛔ The marker may not be a transient toast — it must persist for as long as the
turn does, because the falsehood it prevents persists too.

⛔ **No re-authorization prompt.** The member already acted; the execution already
completed. Asking again would breach P9 at the surface while the substrate upholds it.

---

## 3 · Draft custody

**Governing rule:** *a protocol pause may not destroy information required to continue that
same protocol act.*

| state | preserved | editable | resubmitted | cleared |
|---|---|---|---|---|
| `BODY_AUTHORITY_REQUIRED` | ✅ | ⛔ **locked** | verbatim, on authorize | ⛔ |
| `BODY_SCOPE_INCOMPLETE` | ✅ | ⛔ locked | verbatim, on authorize | ⛔ |
| `AUTHORIZATION_EXPIRED` | ✅ | ✅ | on "Ask again" | ⛔ |
| `INTERRUPTED` | ✅ | ✅ | on "Ask again" | ⛔ |
| `BODY_UNVERIFIABLE` | ✅ | ✅ | on "Ask again" | ⛔ |
| `ALREADY_COMPLETED` | — | — | — | ✅ the turn is answered |
| *ordinary answer* | — | — | — | ✅ **unchanged (S1)** |

⭐⭐ **WHY THE DRAFT IS LOCKED WHILE AN OPPORTUNITY IS OPEN, and this is a genuine design
finding.** ACT 3 requires `question`, and `isHeldRetry` compares prose to decide whether to
append the author's turn again. **A continuation carrying edited prose appends a SECOND
author turn.** It changes no authority — `bodyReq` derives from evidence refs, never from
the question — but it doubles the transcript.

⭐ So the lawful rule is: **while a pause is open the question is the act's, not the
editor's.** Editing is offered as *abandon this and ask something else*, which discards the
opportunity honestly rather than mutating the act in flight.

⛔ **Never `setDraft('')` on any of the five continuation states.** That is the defect
`WS-DISCLOSURE-ORIENTATION-01` found, and §3 is where it is closed.

---

## 4 · `BODY_AUTHORITY_REQUIRED` ordinal design — designed to the boundary, then STOP

### The intended design

```text
section UUID  →  position in frozen sectionTopology  →  "Section N"
```

Copy would read: *"To answer this, MAIA needs to read **Sections 2, 3 and 4** of your
draft."* ⛔ No headings, ⛔ no titles, ⛔ no `labelsFor` import, ⛔ no new Work read. An id
outside the frozen topology reads as *"a section outside what she read"*, never as a number
that would be wrong.

### ⛔ Why it cannot be built here — D-1

**The client never receives the topology.** The pause hands it `sections[]` — UUIDs — and
`AskThreadView` carries `{id, anchor, openedAt, turns}`. There is no ordered id list
anywhere on the client. The ordinal must be computed where the topology lives: the server.

**That is a new route field, which this lane may not author.**

### ⚠️⚠️ D-2 — THE TRAP THAT WOULD LOOK LIKE A SOLUTION

```ts
return { required: sections.size > 0, sections: [...sections].sort() };
```

**`sections[]` is sorted LEXICOGRAPHICALLY BY UUID — not in manuscript order.**

⛔ A surface that numbered the array `1..N` would render **confident, wrong ordinals**, and
they would be wrong *invisibly*: the numbers would look plausible, stay stable across
reloads, and point at the wrong parts of the author's own book. ⭐ *An ordering that is
deterministic is not thereby meaningful.*

**⛔ DO NOT NUMBER THE ARRAY. It is a set rendered as a list, not a sequence.**

### What IS achievable within jurisdiction today

Only the **count**, which is lawful (`sections.length` — no authored content, no order):

> *"To answer this, MAIA needs to read **3 sections** of your draft."*

⚠️ **Predicted to FAIL Fork C, and stated as a prediction, not a finding.** A count tells
the member *how much* and not *which* — and *which* is the entire content of the decision
they are being asked to make. ⛔ But prediction is not evidence: §6 predeclares the witness
so this is settled by a member, not by me.

---

## 5 · Acceptance matrix

| | obligation | status under this design |
|---|---|---|
| S1 | ordinary answers remain ordinary | ✅ untouched — no `result`, no marker, existing clear-on-answer |
| S2 | every `result` discriminated before state mutation | ✅ `result` is the discriminator (P12); ⛔ never status or `thread` presence |
| S3 | pause preserves the question | ✅ §3 — preserved and locked |
| S4 | scope named exactly, no authored language | ⛔ **BLOCKED — D-1** |
| S5 | declining is not failure | ✅ §2.1 — plain "Not now", no nag, no colour |
| S6 | incomplete scope ≠ authority consumed | ✅ §2.2 — "Your permission hasn't been used" |
| S7 | expiry ≠ refusal by MAIA | ✅ §2.3 — time expired it |
| S8 | no silent replay or manufactured authority | ✅ §2.4 — the cost is stated |
| S9 | unverifiable never asks for consent | ✅ §2.5 — no control, and "This isn't about permission" |
| S10 | recovery recognizable as recovery | ✅ §2.6 — persistent marker on the turn |
| S11 | nothing implies a pre-authorization read | ✅ §2.1 — "She hasn't read it" |
| S12 | no internal vocabulary | ✅ every string in §2 |

**11 of 12 satisfiable. S4 blocked, and blocked by transport rather than by law.**

---

## 6 · Predeclared Fork C witness

⭐ Written **before** the surface exists, so its result cannot be argued backwards from
whatever gets built.

**Question:** *Can the member recognize what MAIA is asking permission to read, when the
requested scope is presented as ordinal sections only?*

**Method:** an author who has written the Work, at a real pause, shown the real scope
sentence and nothing else.

```text
RECOGNITION   the member can point to the parts of THEIR OWN draft named,
              or say in their own words which parts those are,
              BEFORE any further explanation, hint, or reveal.

FAILURE       they ask which parts are meant · they guess and are wrong ·
              they authorize without being able to say what they authorized ·
              they must open the draft and count sections to answer.

⛔ NOT EVIDENCE
              designer confidence · a rendered screenshot · internal review ·
              a member saying the wording "seems clear" without locating it ·
              anyone who has seen the section list
```

⭐⭐ **The fourth failure mode is the decisive one.** A member who must go and count
sections to understand the request has been given a *lookup key*, not an orientation.

⛔ **Fork C may not be closed either way from this document.** ⚠️ And it is presently
**UNRUNNABLE**: with S4 blocked the only renderable scope is a count, so a witness run now
would test a sentence the design does not propose.

---

## 7 · Collisions — ⛔ stopped, not solved

### **D-1 · Lawful orientation cannot reach the member without a new route field**

```text
ordinal is lawfully derivable                    ✅ PAUSE-PROTOCOL-01
ordinal is derivable SERVER-SIDE only            ⚠️ topology lives there
pause payload carries the topology or ordinal    ⛔ NO
client can obtain it from any other response     ⛔ NO
adding it                                        ⛔ new route field — outside jurisdiction
```

⭐ **Not a UI problem and it must not be solved as one.** The honest options are a founder
ruling on one of: adding the derived ordinal to the pause payload · adding the frozen
topology · ⛔ or reopening the parked heading question — and **this lane may choose none of
them.**

⚠️ **Note what D-1 does and does not disturb.** It changes nothing about S3 authority law,
consumes nothing, discloses nothing. It is a **transport** question about a value the
system already computes lawfully for MAIA. ⛔ That does not make it a small one: *the same
value is not the same act when its destination changes* — orientation carried to the model
and orientation carried to the member are different disclosures, and only the founder may
rule the second.

### **D-2 · `sections[]` is lexicographic UUID order**

Not a collision — a **trap**, and recorded so nobody walks into it while D-1 is open. ⛔ Any
design that numbers the array produces confident wrong ordinals. **The array is a set.**

---

## 7a · D-1 DISPOSITION — founder ruling, 2026-09-14

```text
D-1 disposition

✅ server-derived ordinal presentation to the member AUTHORIZED
⛔ full frozen topology transport               REJECTED
⛔ client numbering of sections[]                REJECTED
⛔ heading / title route                         REMAINS PARKED
⛔ labelsFor()                                   REMAINS OUTSIDE the pause protocol

S4 remains BLOCKED until the transport is implemented and witnessed.
The ruling authorizes the protocol amendment; it does not pretend the
surface can already render it.
```

### The ruling

> **The server MAY present to the member the non-authored ordinal position of each section
> whose identity is already legitimately present in the disclosure opportunity.**
>
> That presentation: does not grant authority · does not consume authority · does not read
> Work body · does not expose authored headings or titles · does not widen the requested
> section set · does not expose topology outside that set.

⭐⭐ **This is the act the prior ruling did NOT perform.** `WS-DISCLOSURE-PAUSE-PROTOCOL-01`
established that `"Section N"` is lawfully *derivable*; it did not thereby authorize
sending it to the member. **Destination is part of the act** — orientation carried to the
model and orientation carried to the member are different disclosures, and only the second
is ruled here.

### Minimum sufficient orientation

⛔ The whole `sectionTopology` is REFUSED as transport: it would expose identities for
sections **outside the requested disclosure scope**, merely so the browser could perform a
calculation the server already performs. *Convenience is not a disclosure basis.*

### Semantic payload — shape frozen, field name NOT frozen

```text
for each required section:

  { sectionRef : <existing section identity>,
    ordinal    : <1-based position in frozen sectionTopology> }
```

### T1–T7 · transport invariants

```text
T1  ordinal is derived SERVER-SIDE from the SAME frozen reading governing
    the paused Ask.
T2  ordinal is derived ONLY for ids already in bodyReq.sections.
T3  no full topology crosses to the client.
T4  no authored title, heading, kind, structureContext field, or
    labelsFor() dependency participates.
T5  failure to locate a required section in frozen topology is a server
    inconsistency/REFUSAL — never ordinal 0, "unknown", array position,
    UUID ordering, or best effort.
T6  BODY_AUTHORITY_REQUIRED and BODY_SCOPE_INCOMPLETE use the SAME
    derivation wherever they identify required scope.
T7  the section identity remains the PROTOCOL identity; ordinal is
    PRESENTATION METADATA, never authority identity.
```

⭐⭐ **T5 is D-2 restated at the transport boundary.** D-2 said a client that numbers the
array manufactures plausible falsehoods; **T5 says the server may not do the same thing by
a different route.** ⛔ `indexOf === -1` is a refusal, not a rendering problem — *a system
that cannot locate a section it is asking permission to read does not yet know what it is
asking for.*

⭐ **T7 keeps the census's three objects apart under load.** Identity travels as authority;
ordinal travels as presentation. ⛔ An ordinal must never be accepted back as a section
reference — the continuation carries `authorizes[]` of IDENTITIES, never positions.

### ⚠️ One consequence this design must state explicitly

**Ordinals are WHOLE-WORK positions, never renumbered within the requested set.** A
non-contiguous scope therefore reads:

```text
"Sections 2, 5 and 9 of your draft"     ✅ whole-Work positions
"Sections 1, 2 and 3"                   ⛔ subset renumbering — a different, false claim
```

⛔ Renumbering would tell the author their book has a shape it does not have. ⭐ §2.1's
copy assumed contiguity by example; **the rule is positional fidelity, and the example was
never the rule.**

### Standing of the surface lane after this ruling

```text
WS-DISCLOSURE-CONTINUATION-SURFACE-01     OPEN · BLOCKED AT D-1
```

⛔ **Not closed, not resumed.** The design is valid through the collision, 11/12 is the
correct result, and **S4 stays legitimately unearned until the transport exists and is
witnessed.** ⛔ This record is NOT rewritten as though the field already existed — a design
that discovered a boundary must not be edited to look like one that never met it.

---

## 8 · Standing

```text
WS-DISCLOSURE-CONTINUATION-SURFACE-01     DESIGN COMPLETE TO THE BOUNDARY

six states classified                     ✅ one authorization moment, not six
copy for all six + ordinary baseline      ✅
draft custody for all seven              ✅ · locked while an opportunity is open
acceptance matrix                         11 / 12 · S4 BLOCKED
Fork C witness                            PREDECLARED · UNRUNNABLE pending D-1

D-1 orientation transport                 ✅ RULED §7a · derived ordinal only
D-2 lexicographic sections[]              ⚠️ RECORDED · restated as T5 at the server
S4                                        ⛔ STILL BLOCKED until transport is witnessed
lane standing                             OPEN · BLOCKED AT D-1

S3 authority law                          UNTOUCHED
heading question                          STILL PARKED
implementation                            ⛔ NOT OPEN
```

⛔ Nothing is implemented by this record. D-1 is ruled (§7a); the next act is a **separate
founder act** opening a bounded transport lane. ⛔ No transport code is authored here.
