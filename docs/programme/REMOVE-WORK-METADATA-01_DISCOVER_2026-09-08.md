# REMOVE-WORK-METADATA-01 — DISCOVER

```
DISCOVER            COMPLETE
REPAIR              NOT AUTHORIZED
SCOPE               docs only · findings only · no proposed repair · no code · no flag
WITNESS MANUSCRIPT  UNTOUCHED
```

Date: 2026-09-08 · Production SHA under witness: `d326fc479`

---

## 0. How this lane was opened

Not by design review. By a member crossing, performed in an authenticated
browser on production, that failed at a predeclared check.

```
AUTHENTICATED BROWSER ACT
performed by            Kelly / founder, on production
screenshots supplied    by Kelly
screenshot reading      Kelly (observation) + agent (interpretation)
source analysis         remote/container agent
production access       agent: NONE
```

That attribution is part of the record. No automated substitute was accepted
for the crossing, on the standing ground that the command was never in doubt —
the crossing was.

---

## 1. Witness subject

```
subject             REMOVE-WORK-WITNESS-d326fc479
work title          REMOVE-WORK-WITNESS-d326fc479   (member-typed)
body (entire)       WITNESS d326fc479 REMOVE-WORK LINE ONE
                    WITNESS d326fc479 REMOVE-WORK LINE TWO
origin              Begin a new work  →  POST /api/sovereign/manuscripts/blank
```

### Witness result

```
subject validity    PASS
two-act panel       PASS   (Remove Work primary · Delete Work and writing below rule)

check 1  Work gone from YOUR WORKS                      PASS
check 2  writing remains member-recognizably reachable  FAIL
             observed as:  "Untitled"  ·  "No writing yet"
check 3  actual content survived                        PASS
             LINE ONE exact                             PASS
             LINE TWO exact                             PASS

OVERALL HUMAN WITNESS                                   FAIL

writing deleted?    NO  — positively falsified
writing intact?     YES — positively witnessed
crossing truthful?  NO  — surviving writing is misrepresented
```

### On the instrument

Check 2 was originally written as *"present under `YOUR WRITING`"* — a heading.
That predicate was **withdrawn as an invalid instrument** before this subject
ran: `arrivalFor()` may lawfully place unclaimed writing in three places
(`feature`, `imported`, search `Found`), so the original could fail on correct
behaviour. The corrected predicate — *member-recognizably reachable from the
Studio home* — was predeclared before the evidence was seen, and it is the
predicate this witness fails under. It was not softened after a passing check 3.

An earlier reading of a prior subject, since withdrawn, alleged a
retained-but-unreachable defect. It was premature and does not enter this
record as a finding. That subject's state changed before checks 2 and 3 were
resolved and its fate is no longer observable — neither survival nor loss may
be read off it.

---

## 2. Derivation — read-only

Both member-facing fields are produced by exactly one query,
`app/api/sovereign/manuscripts/route.ts:52-58`:

```sql
SELECT m.id, m.title, m.created_at,
       (SELECT count(*)                       FROM manuscript_sections s
         WHERE s.manuscript_id = m.id) AS section_count,
       (SELECT coalesce(sum(length(s.body)),0) FROM manuscript_sections s
         WHERE s.manuscript_id = m.id) AS char_count,
       ...
  FROM member_manuscripts m
 WHERE m.member_id = $1
```

```
title       member_manuscripts.title
charCount   sum(length(body)) over manuscript_sections     ← SOURCE
living_works read on either field                          NONE
```

`refresh()` = `reloadWorks()` + `reloadManuscripts()`. The manuscript read is
**byte-identical before and after removal**. There is no cache layer between
them and no write to `member_manuscripts` on the removal path.

```
projection loss     NO
stale cache         NO
metadata mutation   NO
```

The card changed because the *renderer* changed — a Work card renders the
Work's fields, an unclaimed-writing card renders the manuscript's own — not
because any manuscript value changed.

---

## 3. FINDING A — FALSE EMPTY-STATE COPY

```
OBSERVED
"No writing yet"

CAUSE
charCount is derived from manuscript_sections (Source)
while blank-started writing lives in manuscript_working_drafts.

STATUS
REAL DEFECT
PRE-EXISTING
NOT CAUSED BY REMOVE WORK

CONSEQUENCE
A manuscript can contain authored draft text while the Studio
truthfully sees zero Source characters and falsely presents
"No writing yet" as though that described the writing.

OWNERSHIP
separate from Remove Work semantics
```

`POST /api/sovereign/manuscripts/blank` writes **no** `manuscript_sections`
rows, and says why in its own header:

> *"A blank page was not brought in from anywhere, so no `manuscript_sections`
> rows are written. Source means 'what you brought in, unchanged'; fabricating
> an empty section to satisfy the draft initializer would assert a provenance
> that does not exist."*

That refusal is correct. The defect is that a count over Source is then
rendered as a statement about **the writing**. The Source is genuinely empty;
the sentence *"No writing yet"* is not a report of that fact, it is a claim
about the member's authorship, and it is false.

**Falsifiable prediction, not yet run:** any blank-started manuscript that is
unclaimed displays *"No writing yet"* today with no removal involved. Removal
only made this card visible. Running that check would confirm A is independent
of Remove Work; it is not required for the finding, which rests on the
derivation.

---

## 4. FINDING B — MEMBER-RECOGNIZABLE NAME LOST

```
OBSERVED
After Remove Work, retained writing appears as "Untitled".

CAUSE
member supplied:
    living_works.title = "REMOVE-WORK-WITNESS-d326fc479"

manuscript remained:
    member_manuscripts.title = NULL

Remove Work deletes the living_work row.
That row held the only copy of the member-declared Work name.

NO CACHE / PROJECTION DEFECT
refresh returns the same manuscript row before and after removal.

D-16 COLLISION
Work name and manuscript/expression title are separate declarations.
Copying the Work name into member_manuscripts.title would therefore
manufacture a title declaration the member did not make.

STATUS
REAL REMOVE-WORK CONSEQUENCE
CONSTITUTIONAL QUESTION OPEN
REPAIR NOT AUTHORIZED
```

### Precision on what was lost — founder ruling, recorded

⛔ This must **not** be recorded as *"the manuscript lost its identity."*

```
manuscript identity            INTACT — member_manuscripts.id unchanged
member-recognizable naming
continuity                     LOST
```

The distinction is load-bearing precisely because **D-16 is about not
confusing two kinds of identity.** A record that collapsed them would commit,
in its own wording, the error the ledger exists to prevent.

`onBegin` (`app/writers-studio/page.tsx:73-84`) sends the member's typed title
to `living_works`, then creates the manuscript with `title = NULL` —
deliberately. The blank route:

> *"The manuscript is created with `title = NULL`. The route does not borrow
> the Living Work's name, does not generate 'Untitled', does not use a date or
> a counter… The work's name and the expression's title are SEPARATE
> declarations (ledger D-16) and this route may only perform the one the member
> actually made — which is neither."*

So while the Work stood, the card rendered `w.title`. `DELETE
/api/sovereign/living-works/:id` destroyed that row, and with it the only copy
of the name the member typed. **"Untitled" is doctrinally truthful about the
manuscript** — no separate title declaration was ever made. What the crossing
gets wrong is not that word; it is that the member is left unable to recognize
their own surviving writing, and the promise printed on the confirmation panel
— *"Your writing stays in Your Writings"* — is thereby not honoured in the only
sense that matters to a writer with twenty manuscripts.

---

## 5. THE FOUNDER QUESTION — the hinge

> **When a member removes a Work container but retains its writing, what naming
> continuity may lawfully accompany that writing without laundering the
> Work-name declaration into a manuscript-title declaration?**

This is not an implementation choice and is not answerable from the code. It is
the next substantive act in this lane.

---

## 6. BOUNDARY — A and B do not become one lane

⛔ **"No writing yet" must not be bundled into the eventual Remove Work repair
merely because this witness exposed it.**

```
A   broader Studio representation defect   Source-vs-Draft projection
B   Remove Work / D-16 collision           naming continuity across removal
```

They became visible in the same card. They have different causes, different
scopes, and different constitutional character. Merging them into one
implementation lane would let A's mechanical fix ride in under B's ruling, and
would make the eventual repair unaccountable to either question on its own
terms.

---

## 7. Standing

```
REMOVE WORK @ d326fc479
merged · deployed · WITNESSED · human witness FAIL

writing deleted?          NO   — positively falsified
writing intact?           YES  — positively witnessed
crossing truthful?        NO

FINDING A                 recorded · unowned · no lane opened
FINDING B                 recorded · founder ruling owed
copy correction
  Your Writings → Your Writing   HOLD  (5 sites located, unchanged)
REPAIR                    NOT AUTHORIZED
witness manuscript        UNTOUCHED — retained as the production witness subject
```

Adjacent lanes, unaffected by this record: Whole Manuscript `af013cb4a` §4b
human witness pending (PR/merge HOLD) · `WS-DEVELOP-REFUSAL-TRUTH-OBS-01`
`3c7ce921f` awaiting the sweep-scheduler ruling · `DEVELOP-DWF-01` Q-A open.

---

*Nothing in this record proposes a repair. Evidence licenses; it does not
itself edit the public record.*

---

# PART II — FOUNDER RULING ON FINDING B (ratified 2026-09-08)

> **Removal may dissolve the container without dissolving the history by which
> the writer knows what remains.**

The member made this declaration:

```
"This Work is called REMOVE-WORK-WITNESS-d326fc479."
```

They did not make this one:

```
"This manuscript is titled REMOVE-WORK-WITNESS-d326fc479."
```

Copying `living_works.title` into `member_manuscripts.title` would be false.
Deleting every trace of the first declaration is also wrong, because it
destroys the member's ability to recognize the writing that remains. The
lawful move is to preserve the Work name as **historical provenance** —
not title, not current Work identity. **Lineage.**

Three facts must remain distinct after removal:

```
manuscript title      unknown / undeclared
historical lineage    this writing was previously carried by a Work
                      named "REMOVE-WORK-WITNESS-d326fc479"
current Work          none
```

**D-16 stands completely intact.**

### Ratified

**RW-B1 — Naming continuity after removal is lineage, not title.**
When a member removes a Work while retaining its writing, the system may
preserve the member-declared Work name as historical provenance associated with
that retained writing. It may not copy, promote, or otherwise reinterpret that
Work name as a manuscript or expression title.

**RW-B2 — Removal may end a relationship without erasing its history.**
Removing a Work ends the current container and arrangement. It does not require
erasure of historical facts necessary for the member to recognize and account
for the writing that remains.

**RW-B3 — Provenance may support recognition but must not masquerade as
declaration.** If retained writing has no member-declared title, the Studio may
use former-Work provenance to make it recognizable only through copy or
structure that clearly marks the name as prior context rather than the title of
the writing.

**RW-B4 — A title still requires a title act.** The only lawful way for
`member_manuscripts.title` to become the former Work name is for the member to
make a separate naming gesture establishing that title.

### Semantics of removal, sharpened

```
CURRENT RELATIONSHIP   "This writing belongs to Work X"        → ends
HISTORICAL FACT        "This writing was in a Work named X"    → may remain
MANUSCRIPT TITLE       "The writing itself is titled X"        → never inferred
```

*A deleted house can be gone while the fact that someone once lived there
remains true.*

### Presentation constraint (copy to be designed later)

Not bare `Untitled` — that discards the only human-recognizable continuity.
Not bare `REMOVE-WORK-WITNESS-d326fc479` — that visually asserts a title.
Lawful shapes are semantically explicit, e.g. `Untitled writing / From "…"`.
Once the writer names the manuscript, the real title becomes primary and the
former Work name recedes into lineage.

### Not authorized by this ruling

```
living_works.title → member_manuscripts.title      NOT AUTHORIZED
implementation mechanism                            NOT DECIDED
BUILD                                               NOT AUTHORIZED
```

Finding A remains outside B's repair authority. The five-site
`Your Writings → Your Writing` correction remains HELD — there is no benefit to
a more precisely named destination while the destination still misidentifies
the retained writing.

---

# PART III — B IMPLEMENTATION DISCOVER (read-only)

**Question:** find the smallest existing lineage/provenance mechanism that can
carry former-Work naming without preserving the Work itself or mutating
`member_manuscripts.title`.

**Answer: there is none. And the search surfaced two further consequences of
removal that were not visible from the witness card.**

## III.1 — The name loss is DESIGNED, documented, and rests on a prior ruling

`app/api/sovereign/living-works/[id]/route.ts` states the consequence in its
own header:

> *"It is reversible by a member act: the member may declare again. This route
> does NOT soft-delete, because a `withdrawn_at` column would be a status, and
> status is excluded from this ontology. The consequence is honest and stated
> in the UI: **the name is not kept.**"*

⛔ So Finding B is **not an oversight**. It is a designed consequence of an
earlier ruling that excluded status from the Living Works ontology. Any repair
must therefore answer that ruling, not bypass it.

⭐ RW-B2 already contains the reconciliation: *"That is not secretly preserving
the Work. It is preserving lineage after the Work is gone."* The prior ruling
excluded **status on the work row**. An append-only historical fact is a
different object — it asserts what happened, not what something currently is.
That distinction is what makes RW-B1 implementable without reopening the
status question, and it should be stated explicitly in whatever spec follows.

## III.2 — ⭐ Removal also erases the act "Began X" from the member's history

`app/api/sovereign/studio/history/route.ts` is **a live projection over current
rows, not an append-only act ledger.** The `work_begun` act is:

```sql
SELECT w.id, 'work_begun', w.created_at, w.title, ...
  FROM living_works w WHERE w.member_id = $1
```

The act **is** the row. And the title used everywhere else in history comes from
a JOIN on the same table:

```sql
WITH work_of AS (
  SELECT e.expression_id, CASE WHEN count(*) = 1 THEN min(w.title) END
    FROM living_work_expressions e JOIN living_works w ON w.id = e.living_work_id
   WHERE e.expression_type = 'manuscript' AND w.member_id = $1
  GROUP BY e.expression_id)
```

**Consequence, independent of the witness card:** removing a Work retroactively
deletes *"Began REMOVE-WORK-WITNESS-d326fc479"* from the member's own history,
and blanks the Work name from every other act that referenced it. Last week's
history changes because of something done today.

⛔ This is the exact failure the same file forbids by name for a different
column: *"A history entry that moves is not a history."* An entry that
**vanishes** is a stronger form of the same defect, and it is live.

⛔ It also means **the history machinery cannot carry the lineage** — it derives
from the very row removal deletes.

## III.3 — The membership declaration cascades too

`database/migrations/20260801000001_living_works.sql:67`

```sql
living_work_id UUID NOT NULL REFERENCES living_works(id) ON DELETE CASCADE
```

The route explains why, and the reasoning is sound for what it decides:
*"Those rows ARE declarations of membership, not the members themselves.
Removing the work removes the statements 'this belongs to that' — which is
exactly what withdrawing a declaration means."*

Correct as to the **current** relationship (RW-B2 line 1). But since nothing
else records it, the cascade also removes the only trace of the **historical**
fact (RW-B2 line 2). After removal, **no row anywhere states that this
manuscript was ever carried by a Work of any name.**

## III.4 — What survives, and what the nearest precedent is

```
member_manuscripts            SURVIVES · title NULL · no FK to a Work
manuscript_working_drafts     SURVIVES · holds the writing (check 3 evidence)
working_draft_revisions       SURVIVES · append-only, immutable by trigger
source arrivals / custody     SURVIVES · append-only, carries FILE provenance
manuscript_keeps              SURVIVES
living_works                  DELETED
living_work_expressions       CASCADE-DELETED
studio history "work_begun"   DISAPPEARS (projection, not a record)
```

⭐ **The nearest architectural precedent is `working_draft_revisions`** —
append-only, immutable by trigger, fixed in time, and chosen by the history
route precisely because it does not move. That is a **pattern**, not a carrier:
it is scoped to draft content and records nothing about Work membership.

`source arrivals` is the nearest *semantic* precedent — it already keeps
provenance (a filename) that is deliberately never treated as a name, under the
2026-09-07 ruling *a source filename is provenance, not a Work name*. `subjectOf()`
in `studioHistory.ts` already implements an RW-B3-shaped precedence
(`workTitle ?? manuscriptTitle`), demonstrating the distinction is expressible.

## III.5 — Consequence for sequencing

```
existing mechanism that can carry former-Work naming      NONE
repair therefore requires a new append-only fact          ⇒ MIGRATION
migration                                                  ⇒ Class B
merge to clean-main-no-secrets                             ⇒ BRANCH GATE
```

Per the standing BRANCH GATE finding, merging a migration to the production
branch is latent schema-deploy authorization: the next unrelated deploy applies
it. That is a founder sequencing decision, not an implementation detail, and it
should be taken before any spec is written rather than discovered at merge.

## III.6 — What DISCOVER did not decide

```
mechanism (event · lineage table · retained provenance record)   NOT DECIDED
whether III.2 is one lane with B or its own                      NOT DECIDED
presentation copy                                                NOT DECIDED
BUILD                                                            NOT AUTHORIZED
```

⛔ III.2 is recorded as a **new finding of this DISCOVER**, not as part of
Finding B's repair authority. It shares B's cause but has its own scope: B is
about recognizing retained *writing*; III.2 is about the integrity of the
member's *act history*. Bundling them would repeat exactly the error §6 refuses
for Finding A.

## III.7 — Standing after Part III

```
Finding A     OPEN · separate lane · unowned
Finding B     CONSTITUTIONALLY RESOLVED (RW-B1..B4) · mechanism UNDECIDED
Finding C     NEW — removal erases "Began X" from history (III.2) · unruled
BUILD         NOT AUTHORIZED
witness       UNTOUCHED
```
