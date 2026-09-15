# ASK-WORK-ANCHOR-01 · PHASE A — READ-ONLY

**Canonical** `6336f10ab`. ⛔ Nothing added to `SUPPORTED_ANCHORS` · ⛔ no Work
conversation persisted · ⛔ no POST reordered · ⛔ no Work snapshot invented ·
⛔ `no_reading` untouched · ⛔ `StudioConversation` untouched · ⛔ no deploy.

> **The governing law:** the boundary may admit only what the runtime can prove
> **before** the act creates durable evidence.

---

## 0 · THE HEADLINE

⭐⭐ **Three of the four answers are already built, and the fourth is one real
defect that the code itself documents from both ends.**

```
coherence for {on:'work'}     ✅ EXISTS — checkAnchor already returns ok
a readingless thread          ✅ LAWFUL — the column is nullable BY DESIGN
staleness for a Work anchor   ✅ GENERALIZES — and truthfully: UNMEASURED,
                                 not "unchanged"
refusal before persistence    ⛔ ABSENT — openThread and appendTurn both run
                                 BEFORE the readingless branch is reached
```

⭐ And what is genuinely missing is exactly one thing: **a Work context for
MAIA**. `askMaia`'s input is proposal-shaped, and nothing in the substrate
answers *what does she read when the subject is the whole Work?*

---

## 1 · ADMISSION ORDERING — the POST, exactly

```
 1  memberOwnsWork(id, memberId)                     ⭐ ownership
 2  JSON envelope · question · length
 3  act / authorizes / pendingAskRef                 (S3, closed)
 4  parseAnyAnchor(body.anchor)                      ⭐ THE CLOSED BOUNDARY
 5  loadThread(threadId)                             resume, or open
 6  observation → developmentalTurn(…)               (the 07E lane returns here)
 7  loadFrozenReading — ONLY when the anchor bears a proposalId
 8  checkAnchor(effectiveAnchor, reading)            ⭐ coherence
 9  canonicalFingerprint + measureNow
10  ⭐⭐ if (!existing && canonicalNow === null) → 503, ⛔ BEFORE ANY WRITE
11  computeStaleness(…)
12  ▶ openThread(…)                                  ⛔ FIRST DURABLE WRITE
13  ▶ appendTurn(author)                             ⛔ SECOND DURABLE WRITE
14  if (!reading) → 422 no_reading                   ⚠️ AFTER 12 AND 13
15  askMaia(…) → appendTurn(maia)
```

⭐ **Ownership at step 1 exists BECAUSE of the Work anchor**, and says so:

> *"OWNERSHIP FIRST, BEFORE ANY READ OR ANY THREAD WRITE. A `work` anchor loads
> no proposal, so without this a request could reach `openThread` having proved
> only that the caller is some member and the id is some Work."*

⭐⭐ **And step 10 is the precedent this act needs.** A thread that cannot
establish its BEFORE does not open — the refusal is a `503` taken **before**
`openThread`:

> *"NO FABRICATED BASELINE… A thread that cannot establish its BEFORE does not
> open."*

**The earliest point at which a Work anchor is provably usable is step 8**, after
`checkAnchor`. Everything from 1 to 10 either passes for a Work anchor or refuses
without writing.

---

## 2 · WHAT IS A WORK READING? — ⭐ a readingless thread is ALREADY lawful

```sql
-- Frozen reference, or NULL for a thread on a Work with no reading.
-- NOT a foreign key. See the header.
reading_identity jsonb,
```

```ts
case 'work':    return { ok: true, anchor };      // checkAnchor
case 'section': return { ok: true, anchor };
```

⭐ **The schema and the coherence rule both anticipated this.** `reading` is
`null` for a Work anchor by construction — step 7 only loads one when the anchor
bears a `proposalId` — and `checkAnchor` accepts that.

### ⛔ THE ONE THING THAT DOES NOT EXIST

`askMaia`'s context is **proposal-shaped**:

```ts
askMaia({ anchor, interpretation, evidence, coverage, reviewed,
          reviewRevision, sections, staleness }, history, question)
```

⚠️ Of those, only `anchor`, `sections` and `staleness` survive a Work anchor. The
other four are a frozen structure reading. ⛔ **No Work-context reader exists
anywhere in the Ask substrate**, and this act does not invent one.

⭐ Note what `no_reading` therefore means and does not mean. For a Work anchor a
missing reading is **not an error** — it is the ordinary case. So the fix is not
*"move the `no_reading` refusal earlier"*; it is *"decide, before persisting,
whether this anchor requires a reading at all"* — and `isProposalDependent()`
already computes exactly that, today, in `anchor.ts`.

---

## 3 · STALENESS — ⭐ it already generalizes, and it is already honest

```ts
/* A thread with no reading has nothing to compare on the reading dimensions.
   `unmeasured` is right, not `unchanged`: there is no measurement, and saying
   "unchanged" would claim one. */
if (!frozen) {
  return { ...UNMEASURED, canonicalMoved };
}
```

⭐⭐ **A Work-anchored turn already receives a truthful staleness state**: every
reading dimension `unmeasured`, and `canonicalMoved` measured against the
thread's own `canonicalAtOpen`. ⛔ Nothing needs inventing, and nothing would need
weakening.

### ⚠️ BUT THE WORK-LEVEL MEASUREMENT IS STRUCTURAL, NOT PROSE — AND THAT MATTERS

```
canonicalFingerprint(manuscriptId)   manuscript_structure_units
                                     + manuscript_structure_members
                                     ⛔ no body text

measureNow(manuscriptId, memberId)   sectionTopologyHash over section heads
                                     with `body: ''`
                                     ⛔ bodies explicitly emptied
```

⭐ So *"the Work moved"* currently means **its structure moved**. A chapter
reordered registers; two thousand new words in Chapter 10 do **not**.

⛔ **That is not a defect and it is not a gap to fill here.** It is the honest
current measurement, and it is named now so that nobody later reads
`canonicalMoved: unchanged` on a Work thread as *"she has not been writing."*
Whether a Work-anchored conversation needs a prose dimension is a question for
the act that defines what such a conversation is — ⛔ not for this census.

---

## 4 · CAN REFUSAL OCCUR BEFORE PERSISTENCE? — ⛔ NOT TODAY

```ts
const liveThreadId = existing ? existing.id : await openThread({ … });  // ⛔ WRITE
…
if (!retryingHeld) { await appendTurn({ … speaker: 'author' … }); }     // ⛔ WRITE

if (!reading) {
  /* UNREACHABLE WHILE THE BOUNDARY ACCEPTS ONLY PROPOSAL-BEARING ANCHORS, and
     kept for exactly that reason: it is the honest answer the day a
     reading-less anchor is added… */
  return NextResponse.json({ threadId: liveThreadId, refusal: 'no_reading' },
    { status: 422 });
}
```

⭐⭐ **THE TWO COMMENTS ARE THE SAME FINDING FROM OPPOSITE ENDS, AND THEY AGREE.**
The boundary says a readingless anchor must not be admitted *"before the slice
that defines what such a thread is"*; the route says this branch is *"the honest
answer the day a reading-less anchor is added."* ⛔ The day has not come, and the
ordering that made it dangerous is still exactly as described:

```
admit {on:'work'} today
  → thread row written
  → author turn written
  → 422 no_reading

= a durable conversation the system had not established it could conduct,
  carrying the member's own words
```

### THE MINIMUM CHANGE

⭐ **One decision moved, and it is already computed elsewhere.** Before step 12,
ask whether the effective anchor requires a reading — `isProposalDependent()` —
and refuse there when one is required and absent. ⛔ Nothing else in the ordering
needs to move: the author's words must still be recorded before the model is
called, which is the law that put `appendTurn` where it is.

⚠️ **And that alone is not sufficient to admit `{on:'work'}`.** It removes the
*persistence* hazard; it does not answer §2's gap. Admitting the anchor with the
ordering fixed but no Work context would open a lawful thread and then fail at
`askMaia` — better, but still a row written for a conversation the system cannot
conduct.

---

## 5 · WHAT SEAM 2 WOULD BE, IN ORDER

```
1  decide reading-requirement BEFORE openThread      ⭐ isProposalDependent
                                                        already answers it
2  a Work CONTEXT for askMaia                        ⛔ the one thing that does
                                                        not exist
3  widen SUPPORTED_ANCHORS to admit {on:'work'}      ⛔ LAST, and only then
```

⛔ **The order is the law.** Widening first is precisely what the boundary
comment forbids, and each of 1 and 2 is provable on its own before 3 is taken.

⭐ Against the founder's ruling, this reads as: `{on:'work'}` is **an approved
target semantic and not yet an approved POST input**, and the two conditions that
would make it admissible are now named and separately checkable.

⚠️ **`{on:'section'}` is NOT this act's subject.** It was excluded from the
boundary for the same stated reason, and the ruling pins the room's ordinary
conversation to the **Work**: *identity is the Work; the active section may be
context, and context must not become identity.* ⛔ Nothing here opens the section
anchor.

---

## 6 · STANDING

```
Q1 admission ordering          ✅ traced · earliest provable point = after checkAnchor
                                  ⭐ and step 10 is the existing prove-before-persist
                                     precedent, in this very route
Q2 a Work reading              ✅ a READINGLESS THREAD IS ALREADY LAWFUL
                                  ⛔ a Work CONTEXT for MAIA does not exist
Q3 staleness for Work          ✅ already generalizes, and truthfully
                                  ⚠️ but the Work-level measurement is STRUCTURAL,
                                     ⛔ never prose — named, not repaired
Q4 refusal before persistence  ⛔ NOT TODAY · minimum change identified

SUPPORTED_ANCHORS              ⛔ UNCHANGED
POST ordering                  ⛔ UNCHANGED
no_reading                     ⛔ UNCHANGED
StudioConversation             ⛔ UNCHANGED
implementation                 ⛔ NOT OPENED
production                     UNTOUCHED
```

> **Phase A's answer to the question that opened it:** the Ask spine is closer to
> supporting a durable Work-anchored Studio conversation than anyone assumed —
> the coherence rule, the nullable reading and the staleness law were all written
> to admit it. What stands between here and there is one ordering fix the route
> already has a precedent for, and one genuinely absent object: what MAIA reads
> when the subject is the whole Work.
