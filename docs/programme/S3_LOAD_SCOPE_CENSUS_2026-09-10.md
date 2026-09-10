# S3 remediation · load-scope census

```text
SUBJECT     canonical feddbaded
MODE        READ-ONLY · no repair · no tests authored · no fixtures built
QUESTION    When a passage is authorized, what authored characters actually
            cross the protected load boundary before they are sliced?
AUTHORIZED  founder, 2026-09-10, as the act following the authority-model census
```

⛔ **Nothing here is inferred from a function name.** Every width below is read
from the SQL text or the slice expression that produces it.

---

## L0 · WHICH BOUNDARY IS BEING PROTECTED

The question presupposes a boundary. The system declares one, in
`lib/disclosure/disclosureBoundary.ts:12-25` — its own ordering diagram:

```text
AWAIT requireConsentState        ← precondition, not audit trace
     ↓  not established → REFUSE. No Work context is assembled at all.
assemble Focus  (the CALLER does this, only on `may_cross`)
     ↓
mint context-disclosure receipt  ← only `minted` authorizes
     ↓
hand context to cognition
```

⭐ **The declared boundary is ASSEMBLY, not handoff.** "No Work context is
assembled at all" places the protected line *before the database read*, not
merely before cognition. `focusCrossing.ts:132` enforces exactly that ordering
in code — `// ── 2 · ONLY NOW is the Work read. C2 depends on this ordering.`

So there are two measurable widths per lane, and they are different questions:

```text
W1  DB → application process     what SQL actually returns into memory
W2  application → cognition      what reaches the model
```

⛔ The phrase "protected load boundary" appears **nowhere in the repository**
outside this lane's own records. W1 is protected *by ordering* in Focus; it has
never been named as a width. That absence is itself a finding — see L5.

---

## L1 · `loadRevisionContent` — WHAT IT ACTUALLY RETURNS

`lib/manuscript/development/capture.ts:164-176`, verbatim in substance:

```sql
SELECT content FROM working_draft_revisions
 WHERE draft_id = $1 AND revision_number = $2
```

```text
ARGUMENTS   draftId, revisionNumber
NOT TAKEN   memberId · sectionId · range · bodyScope · any scope of any kind
RETURNS     string | null — the ENTIRE content of that revision
```

⭐ **The answer to the founder's narrow question is: the whole revision.**
`content` is one column holding the draft's complete character stream. There is
no narrowing predicate, no projection, and no scope argument to narrow with. The
function cannot read less than the whole revision, because it is not given
anything with which to.

`recoverEvidence` (`lib/manuscript/development/resolve.ts:86-135`) then slices
that in-memory string twice: revision → section (by frozen code-point range,
digest-verified against `readState.revisionDigest` **and** the per-section
`state.digest`), then section → passage (by `ref.range`, refusing
`range_outside_section`). Both slices are pure, in-process, post-load.

---

## L2 · THE TWO LANES, MEASURED

### Lane A — Focus (`assembleFocus`), the governed lane

⚠️ **CANONICAL CARRIES THE UNREPAIRED ASSEMBLER.** On `feddbaded`,
`lib/writers-studio/assembleFocus.ts` still joins a `manuscripts` table on a
`user_id` column, neither of which exists. Its W1 is therefore **zero characters
on every scope** — every query throws, is caught, and returns `null`. The
custody repair lives unmerged on `claude/focus-assembler-custody-closure`. Both
are measured below, because the census subject is canonical and the remediation
subject is the repair.

```text
                       W1 (DB → process)              W2 (→ cognition)
canonical  any scope   0 — query fails, returns null   nothing crosses
repair     whole_work  every draft section's text      the same, joined ''
repair     section     ONE draft section's text        that section
repair     passage     ONE draft section's text        text.slice(start,end)
```

⭐ **Under the repair, a `passage` request reads the WHOLE SECTION into process
memory and returns only the slice.** W1 = section. W2 = passage.

### Lane B — developmental reading, the ungoverned S3 lane

```text
                              W1 (DB → process)        W2 (→ cognition)
commission.ts:61   any        WHOLE REVISION            bodyScope sections
ask route:415      any        WHOLE REVISION            the observation's
                                                        evidence refs only
```

`app/api/sovereign/manuscripts/[id]/ask/route.ts:415` loads the whole revision,
hands it to the **pure** `assembleDevelopmentalContext`, and what survives into
`DevelopmentalAskContext.evidence` is only the recovered slices. `readState`
carries ranges and digests, **not text**. The whole revision is a local variable
that never leaves the request.

⛔ **And Lane B performs no `establishDisclosureBoundary` call at all.** That is
the S3 defect already ratified. It is restated here because it changes what the
W1 measurement means: in Lane B the whole revision crosses W1 under **zero**
authority, not under coarse authority.

---

## L3 · DOES THE SECOND SCOPE PROBLEM EXIST?

The founder's anticipated shape:

```text
passage authority → whole revision loaded → passage later sliced
     = passage-scoped at cognition, not at the protected load boundary
```

**Lane A, repaired: NO — and the reason matters.** W1 is the section, not the
revision. Focus is **section-granular at W1 and section-granular in its
authority** (Q6: `range` never participates in `establishDisclosureBoundary`).
The two agree. ⭐ **Focus is honestly section-granular throughout; the word
`passage` is the only thing in it claiming more.** The Q6 hard stop is therefore
not a leak — it is a naming claim that outruns both the authority and the load.

**Lane A, canonical: NOT APPLICABLE.** W1 is zero. Nothing has ever crossed.

**Lane B: YES IN SHAPE, BUT NOT AS "passage authority".** W1 is the whole
revision — every section, including sections the reading never scoped. But no
authority of any kind was established, so this is not an over-broad load *under*
a passage authorization. It is an unauthorized load that happens to be
revision-wide.

⭐ **The precise finding: the two lanes fail differently and must not be repaired
by one rule.** Lane A's problem is nominal over-claim. Lane B's problem is
absence of authority, compounded by a W1 width that no scope can narrow.

---

## L4 · CUSTODY BY DERIVATION, NOT BY PREDICATE

`loadRevisionContent` takes no `memberId` and carries no ownership predicate.
Both call sites derive `draftId` from a member-gated row:

```text
ask route      loadFrozenDevelopmentalReading(manuscriptId, readingId, memberId)
               → WHERE id=$1 AND manuscript_id=$2 AND member_id=$3
               → reading.readState.draftId

commission     captureEvidence(manuscriptId, memberId, …) → readDraft(…)
               → evidence.readState.draftId
```

⚠️ Custody is currently **sound and separable**. A future call site supplying an
arbitrary `draftId` would read any member's revision, and nothing in the function
would refuse. This is the exact shape the founder rejected in `assembleFocus`,
whose repair states it as law:

> *"Ownership is part of the read, not a separate check a later edit could drop."*

⛔ **Reported, not repaired.** No defect is claimed: today both call sites derive
correctly. The finding is that the guarantee lives in the callers.

---

## L5 · W1 HAS NEVER BEEN NAMED AS A WIDTH

Focus protects W1 by **ordering** — assembly happens only after `may_cross`. It
does not constrain W1's *extent*: `may_cross` says whether to read, never how
much. Nothing in the codebase states a rule about how many authored characters
may enter process memory relative to what was authorized.

⭐ That is why Lane A's `passage` reads a section without violating anything
written down, and why Lane B's revision-wide read is invisible to every existing
instrument. **A width that has never been declared cannot be exceeded.**

⛔ Whether W1 extent should be governed at all is **NOT RULED HERE**. It is the
question the Q6 representation choice will implicitly answer, and it should be
answered deliberately rather than as a side effect.

---

## Hard-stop conditions — adjudicated

```text
loadRevisionContent cannot be scoped without schema change   ⚠️ SEE BELOW
passage load is revision-wide under passage authority        NOT TRIGGERED
  (Lane A is section-wide; Lane B has no authority at all)
authored characters reach cognition beyond the scope         NOT TRIGGERED
  (W2 equals the authorized scope in both lanes)
custody absent at the load function                          ⚠️ PARTIAL — L4
```

⚠️ **On scoping `loadRevisionContent`:** `working_draft_revisions.content` is a
single column holding the whole revision. Narrowing W1 to a section would require
either a SQL-side slice against the frozen code-point range, or reading sections
from `manuscript_draft_sections` at the revision — **and the digest verification
in `recoverEvidence` depends on having the whole revision to hash.** ⛔ Narrowing
W1 and preserving integrity verification are in tension. **Not resolved here; not
designed around.** Reported for ruling.

⭐ **RULED THE SAME DAY — THE TENSION DISSOLVES.** W1 and W2 are different
boundaries and were never required to match. A wider trusted retrieval performed
for integrity is lawful; the constitutional line is what may leave that envelope.
See the rulings section below. ⛔ Digest verification is NOT to be weakened to
narrow W1.

---

## Founder rulings on this census — 2026-09-10

### The central correction: W1 and W2 are DIFFERENT BOUNDARIES

⛔ **It would be a mistake to require the database read to have exactly the same
width as what MAIA is allowed to receive.** They serve different purposes:

```text
W1 — TRUSTED RETRIEVAL
     DB → application process
     may sometimes need a wider envelope for integrity / recovery

W2 — COGNITION DISCLOSURE
     application process → model context
     must be exactly bounded by what the member authorized
```

⛔ The law is **NOT** *"passage authority means only passage characters may ever
be read from storage."* That would force the destruction of whole-revision digest
verification merely to make the widths look identical.

**Ratified law:**

> A lawful disclosure crossing may retrieve a wider trusted envelope when that
> wider read is technically necessary to verify and recover the authorized
> material, provided **nothing outside the authorized disclosure scope can
> proceed into cognition, persistence, or another disclosure consumer**.

```text
passage authorized
      ↓
trusted process may retrieve what integrity verification requires
      ↓
verify / recover
      ↓
ONLY authorized passage
      ↓
cognition
```

⭐ **The wider W1 read does not silently become wider authority.** This resolves
the `recoverEvidence` tension reported in this census's hard-stop section: the
tension was real, and it dissolves because the two widths were never required to
match.

### The developmental whole-revision read is NOT a second defect

```text
developmental Ask
  W1    whole revision
  W2    selected evidence refs
  AUTH  none          ← the constitutional defect
```

⭐ **There was no authority to overrun.** The defect is `AUTH = none`, not
"whole revision loaded under passage authority."

⛔ **Do NOT expand S3 into a least-read remediation.** Fixing disclosure
authority and redesigning revision recovery are different jobs.

### Q6 RECLASSIFIED — still open, different kind

The load-scope census establishes that Q6 is **not a W1 leakage defect**. It is
an **authority-description defect**:

```text
authority distinguishes:   whole_work · section · "passage" within a section
authority CANNOT distinguish:   passage A from passage B
                                inside the same structural envelope
```

> `passage` currently claims a precision the disclosure authority cannot itself
> represent.

⭐ The section-wide W1 does not cause that. **The absence of passage identity at
the authority boundary causes it.** The earlier law survives unchanged:
*passage authority may not silently mean section authority.*

### ⛔ DO NOT PUT `range` INTO `BoundaryOutcome` YET

This census strengthens the reason not to. `may_cross` is an **ephemeral
control-flow capability**. Turning it into `{ work, section, start, end, digest,
… }` would begin converting the capability into exactly the portable
authorization token the architecture has deliberately avoided — and which Q4's
ruling just protected.

### F7 amended — it governs W2, not raw DB width

```text
F7-A  Authority granted for passage A cannot permit passage B to enter
      cognition.

F7-B  Changing the passage selector downstream after authorization cannot
      change the characters permitted into cognition.

F7-C  The completed crossing evidence distinguishes A from B sufficiently
      to prove which crossing occurred.

F7-D  A wider W1 retrieval performed solely for verification does not
      authorize any additional characters at W2.
```

⭐ **F7-D is what this census discovered**, stated as law.

### The other two findings stay separate — no scope creep

**Broken canonical `assembleFocus`** — ⛔ do NOT repair it in S3. The unmerged
custody repair becomes an **explicit dependency**:

```text
FOCUS ASSEMBLER CUSTODY    separate existing lane · not absorbed into S3

before S3 implementation depends on assembleFocus:
    custody disposition must be settled
```

Otherwise the new disclosure repair would knowingly be built on an assembler
already established to be wrong.

**`loadRevisionContent` custody** — recorded, ⛔ **not silently solved here**.
The loader trusts caller-derived custody, and another lane has already rejected
that pattern, which is why it is worth preserving as an architectural
observation. But SEL-0 found an **authorization** defect, not a loader-ownership
exploit.

### Next authorized act — PASSAGE-IDENTITY CENSUS (read-only)

⛔ **No design.** The question:

> What does this manuscript system already use to identify a passage stably
> enough that the disclosure decision and the disclosed characters can both refer
> to the same thing?

Look for existing: `range` · `AskAnchor` / selection anchor · `EvidenceRef` ·
revision-relative offsets · digest-bound references · passage identifiers ·
selection objects.

Trace **three places separately**:

```text
what the member is asked to authorize
what establishDisclosureBoundary receives
what ultimately selects characters for cognition
```

⭐ **Those three must denote the same passage — even if `BoundaryOutcome` itself
carries none of them.**

---

## Standing

```text
#1279 AUTHORITY CENSUS     OPEN · Class C
LOAD-SCOPE CENSUS          COMPLETE · this record · separate Class C PR

W1                         trusted retrieval envelope
W2                         authorized cognition disclosure
W1 ≠ W2                    RATIFIED — a wider integrity-required retrieval is
                           NOT, by itself, a widening of disclosure authority

WHOLE-REVISION RECOVERY    not itself an S3 defect
                           may remain where integrity requires it

Q4 FRESHNESS               CLOSED
Q6 PASSAGE                 STILL OPEN — reclassified as an authority-identity
                           problem, NOT a W1 over-read

NEXT ACT                   PASSAGE-IDENTITY CENSUS · read-only only

S3 IMPLEMENTATION          NOT AUTHORIZED
F1–F7 IMPLEMENTATION       NOT AUTHORIZED
FOCUS ASSEMBLER CUSTODY    separate dependency · settle before S3 depends on it
LOADER CUSTODY             recorded observation · no repair here

A / C                      HELD
#1277 D9                   UNTOUCHED · DRAFT
FOCUS WITNESS              UNSPENT
PRODUCTION                 UNTOUCHED
```

⭐ *We no longer need to choose between integrity and least disclosure. A wider
trusted read can serve integrity; the constitutional boundary is what is
permitted to leave that trusted envelope and enter cognition.*
