# REVISION-COLLABORATION-01 — Design

**Authorized by `…_FOUNDER_RULINGS_2026-09-10.md`. Design only.**
⛔ **Implementation is not authorized by this document.**

Governing rule: *modification transfers control, not history.*

---

## 1. What the ruling actually costs

The census said five new things over proven foundations. Reading the two
precedents in source rather than in summary, **two of them do not carry across
unchanged**, and both divergences are consequences of the ruling rather than of
prose.

### 1a. ⭐ FINDING — the structure precedent forbids member prose, and prose revision cannot

`20260830000005_manuscript_structure_proposals.sql` is explicit:

> *"**NO MEMBER PROSE.** Bodies MAIA was given are NOT stored here, nor excerpts,
> nor prompt payloads, nor model scratch text… A second copy of a member's writing
> is exactly what this table must not become."*

⭐ **The ban is not "no prose" — it is "no second copy of the Work."** The test is
therefore not *is this text?* but **does storing this create a rival copy of
something that already has an authoritative home?** A rival copy can drift from the
authority, and then two answers exist to *what did the member write* with nothing to
adjudicate between them.

A prose revision chain holds three kinds of text, and under that test they are
**not** the same question:

```
MAIA's proposed replacement     MAIA's output about the Work.        STORE.
                                Not a copy of the member's writing.

the bounded original            IS the member's writing.             DO NOT STORE.
                                Already in the append-only revision
                                store; addressable by EvidenceRef +
                                section digest, recoverable through
                                recoverEvidence().

the writer's MODIFY candidate   IS the member's writing, and has     ⛔ OPEN
                                never been in the revision store,
                                because it is not yet the Work.
```

⛔ **The third is where both halves of the precedent's reasoning fail, which is why
no existing ruling covers it.** It is not MAIA's output *about* the Work, so the
`interpretation` exemption does not reach it; and it has no authoritative home to
point at, so referencing instead of storing is not available. Storing it does not
create a *second* copy — it creates **the first and only copy of member writing that
lives nowhere else.**

The asymmetry in what is lost is the sharpest form of the distinction:

```
lose the proposal    the record of what MAIA said
lose an original     nothing — the revision store holds it
lose a candidate     the writer's actual work in progress
```

The candidate is the only one whose loss costs the **member** something, which is
also why it is the only one that pulls erasure into a place it has never had to
reach. Three ways out, honestly stated:

```
(a) store it, with the reason recorded in the migration header
    a candidate is not the Work and cannot be recovered from the revision
    store, because it was never in it. RC-01 requires it to persist:
    a candidate that dies with the session cannot be the object of the
    alternating chain the ruling constitutes.

(b) store it as a diff against the proposal
    REFUSED as cosmetic. The member's words are still there, differently
    encoded. It would satisfy the sentence and not the principle.

(c) hold candidates in-session only
    REFUSED as contradicting RC-01 and RC-04. The chain would have no
    durable object between proposal and application.
```

⭐ **RULED 2026-09-10 — RC-05: (a), AUTHORIZED**, under eight conditions (see the
rulings record). Chiefly: creation requires an explicit MODIFY act, the candidate is
a separate object from both the proposal and the canonical revision, it grants no
authority of any kind, MAIA may never mutate it in place, and **erasure/export/custody
for member-authored manuscript prose must explicitly reach this store.** To be stated
in the migration: *durability does not make the candidate canonical.*

Recommendation as written before the ruling — **(a), with the boundary named in the
migration** — the table stores *candidates under active revision*, never the Work,
never the original, and the erasure path must reach it. ⛔ Not decided here.

### 1b. ⭐ The immutable/mutable split must become rows, not columns

The structure precedent puts both halves in one row — `interpretation` frozen by
trigger, `reviewed` mutable, and *"the difference between the two is the member's
authorship."* That is exactly RC-02's shape, already ratified.

It still cannot be copied, because **RC-04 requires an alternating chain**:

```
P1 -> C1 -> P2 -> C2 -> … -> application
```

A single mutable `reviewed` column holds a current value, not a lineage. Two rows
per proposal cannot express *"MAIA proposed again, derived from the writer's
candidate"* without overwriting the previous handoff — which is the one thing
RC-04 forbids. **The alternation must be rows.**

The precedent's *law* is preserved; only its shape changes. Recorded so that the
divergence is a decision, not a drift.

---

## 2. The three objects

Directly from the ruling. Each has a different mutability law, which is why they
are three tables and not one table with a `kind` column — a discriminated single
table needs a trigger that switches on kind, and that is precisely the shape in
which a bug makes a proposal mutable.

```
PROPOSAL          proposed_by = MAIA
                  IMMUTABLE at insert, by trigger, like interpretation
                  derived_from: the Work, or a candidate (RC-04)

CANDIDATE         writer-controlled derivative
                  derived_from = a proposal (never null)
                  MUTABLE until applied, frozen at application

APPLICATION       authorized_by = member
                  applied_from = a candidate or a proposal (RC-03)
                  append-only, never updated
```

### Fields a proposal must carry

```
manuscript_id · draft_id · section_id
based_on          EvidenceRef  (textual kinds only in this lane)
read_state        the frozen DevelopmentalReadState it was made from
                    revisionNumber · revisionDigest · sections{range,digest}
                    inputFingerprint
proposed_text     MAIA's replacement
reason            why
authority         which S3 disclosure licensed the reading, or
                  `candidate` when the source was text the writer handed over
origin            'work' | 'candidate'
derived_from_candidate_id   null for P1
thread_id         the conversation it arose in
```

⛔ **A proposal is not manuscript text.** Until application, the Work is
byte-identical.

---

## 3. The three acts and their records (RC-03)

```
ACCEPT   application { applied_from: proposal, mode: 'accept' }
         no candidate row exists
         the record says: MAIA proposed these exact words,
         the member explicitly adopted them
         ⛔ never recorded as the writer's own wording

REJECT   no application, no candidate
         the proposal is preserved and marked declined
         the Work is unchanged
         ⛔ rejection is a recorded act, not an absence — otherwise
            "she never proposed that" and "I said no" look identical

MODIFY   candidate { derived_from: proposal, modified_by: member }
         proposal preserved untouched
         candidate mutable until the member applies
         application { applied_from: candidate, mode: 'modify' }
```

---

## 4. Attribution — deferred, never faked (RC-02)

The minimum the ruling permits:

```
final revision
  derived from MAIA proposal P17
  subsequently modified by member
  explicitly applied by member
```

For that to remain extendable *without corrupting the historical record*, absence
must be **representable rather than inferred**. The application record therefore
carries an explicit discriminator:

```
attribution_grain   'whole-revision'   this row claims lineage only
                    'span'             this row claims per-span origin
```

⭐ **A row written at `whole-revision` never later reads as though it had span
detail, and a span implementation is additive.** Without the discriminator, the
first span-aware reader would have to guess what the older rows meant — which is
how faked precision enters a record that was honest when written.

Span attribution, when it comes, is `MAIA-origin · member-adopted` for unchanged
words and `member-origin` for changed ones, over a revision that is
`member-authorized` as a whole.

---

## 5. Staleness — three states, and only one may apply

`locateCurrent(ref, readState, liveWork)` already returns
`current | superseded(moved) | unmeasured`, digest-verified and never fuzzy.

```
current      application permitted
superseded   application REFUSED, the move named, nothing relocated
unmeasured   application REFUSED
```

⭐ **`unmeasured` refuses.** BUILD-07A's law is *"unknown never rounds to
current"*; an application path that treats "I could not tell" as permission is the
same defect wearing a different word. This is the prose analogue of the structure
precedent's **hard topology gate**, and it is a gate, not a warning.

The `inputFingerprint` remains the **soft** signal — the proposal still applies,
but something it rests on was rewritten, and the writer is told rather than left
to assume.

---

## 6. The alternating chain, and where authority lives

```
Work
 |  S3 governs this reading. BODY_AUTHORITY_REQUIRED may appear.
MAIA proposal P1
 |  writer modifies
candidate C1
 |  "make my version tighter"
MAIA proposal P2   origin='candidate', derived_from_candidate_id=C1
 |
candidate C2
 |  explicit member application
Work
```

⭐ **The seam is clean and worth naming: a proposal against the *Work* is governed
by S3 disclosure; a proposal against the *writer's candidate* is not.** The writer
handed that text over in the conversation. No new authorization surface is opened
by RC-04, and none is bypassed.

**No stored head pointer.** The current candidate is *derived* as the latest link
in the chain — the same discipline as `superseded_by` in the temporal-memory
direction: derived, never stored, so it cannot disagree with the chain.

---

## 7. What R1 becomes

R1 is unchanged in scope — **propose and see, nothing applies** — with one
consequence of the ruling:

⭐ **R1 must persist the full proposal shape even though only reading is
implemented.** If R1 stores a thinner row, R2 needs a migration that backfills
provenance it does not have, and the first proposals in the record would be
permanently less answerable than the ones after them. *A record that gets more
honest over time is fine; one whose early rows were never honest is not.*

```
R1   proposal table + immutability trigger
     MAIA produces a typed proposal from the conversation
     the writer sees it against their own text
     staleness shown, never repaired
     ⛔ no candidate table, no application table, no apply path

R2   accept / reject / modify · candidate + application · the Work changes
R3   DEVELOP <-> WRITE continuity (separate design, one open founder question)
```

---

## 8. The experiential target

> **Jarvis underneath; almost invisible to the writer.**

Design consequence, not decoration: **nothing in section 2–6 appears in the
interface.** The writer sees a paragraph, a suggestion, and three ordinary
choices. No proposal ids, no provenance vocabulary, no lineage browser in R1. If
the writer has to operate the custody architecture, the lane has failed on its own
terms.

---

## 9. Open, requiring a founder act

```
1  candidate prose storage (§1a)        ⭐ RULED — RC-05, AUTHORIZED
2  erasure reach over candidates         OPEN — required by RC-05 condition 6
3  R1 implementation                     ⭐ AUTHORIZED by RC-05
4  span attribution timing               OPEN — deferral permitted, grain required
5  DEVELOP <-> WRITE consequence          OPEN — BODY_AUTHORITY_REQUIRED in WRITE
                                         (from the continuity design)
```

⛔ **RC-05 settles item 1 and unblocks item 3 only.** Items 2, 4 and 5 remain open
and are not silently settled by it. Implementation beyond R1 is not authorized.

## Standing

```
RC-01 .. RC-05              RATIFIED
DESIGN                      RECORDED (this document)
R1                          AUTHORIZED
IMPLEMENTATION beyond R1    NOT AUTHORIZED
candidate prose storage     AUTHORIZED under RC-05's eight conditions
MERGE                       NOT YET
PRODUCTION                  UNTOUCHED
```
