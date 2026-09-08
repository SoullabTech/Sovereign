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
