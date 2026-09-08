# STUDIO-WRITING-PRESENCE-01 — DISCOVER

```
STATUS     DISCOVER COMPLETE · read-only
REPAIR     NOT AUTHORIZED
LANE       opened as a truth-of-writing lane, NOT under Remove Work
```

Date: 2026-09-08 · Census from `clean-main-no-secrets` @ `21e315871`.

> **MISSION — a Studio surface must not say "No writing yet" when
> member-authored Working Draft text exists.**

---

## 0. Headline — the founder's hypothesis is confirmed, and the defect is larger than the label

> *"The defect is probably not that `charCount` is wrong. The defect is that a
> Source character count is being used to answer a different question: does the
> member have writing?"*

Confirmed exactly. And **"No writing yet" is the smallest of four symptoms of
that one substitution.**

⭐ **`manuscript_sections` is INSERTed by exactly one route — the import/ingest
`POST /api/sovereign/manuscripts`.** Nothing else in the codebase ever creates
a section. `POST /manuscripts/blank` deliberately creates none (*"fabricating an
empty section to satisfy the draft initializer would assert a provenance that
does not exist"* — correct, and not the defect).

**Therefore, for any manuscript begun in the Studio, `charCount` is 0 —
permanently, no matter how much the member writes.** The writer the blank page
was built for is invisible to every presence question the Studio asks.

---

## 1. Every consumer of `CurrentManuscript.charCount`

```
PRODUCER
app/api/sovereign/manuscripts/route.ts:61
  sum(length(s.body)) over manuscript_sections        ← SOURCE ONLY

CONSUMERS
HomeView.tsx:51-52   pagesLabel()  chars === 0 → "No writing yet"
HomeView.tsx:654     pagesLabel on a shelf card
HomeView.tsx:778     pagesLabel on the FEATURE arrival
HomeView.tsx:1003    pagesLabel on a YOUR WRITING card
HomeView.tsx:337     wrote = m.charCount > 0 ? whenWritten(...) : null
homeState.ts:71      unclaimed.sort((a,b) => b.charCount - a.charCount)
homeState.ts:106     writtenAt(): if (!m || m.charCount <= 0) return 0
press/manuscript/page.tsx:69   declared in an interface, RENDERED NOWHERE
```

⚠️ Unrelated identifiers named `charCount` exist in voice, RLM, oracle and the
note composer. They are local string lengths with no relation to this lane and
are **out of scope**.

## 2. Every surface using `charCount` to infer "has writing" — four, not one

```
S1  pagesLabel(0) → "No writing yet"
      the reported defect. A blank-started manuscript says this forever.

S2  homeState.writtenAt() requires charCount > 0
      ⭐ A blank-started Work can NEVER be `written`. It is permanently
      `unwritten`, so it can never be the RETURN/CONTINUE arrival and is never
      offered as continuable — however much the member has written in it.

S3  homeState unclaimed sort by charCount DESC
      ⭐ A blank-started manuscript always sorts LAST among unclaimed writing
      and can never become the `feature`. 200,000 characters of draft lose to
      one imported page.

S4  HomeView:337 wrote = charCount > 0 ? whenWritten(lastWrittenAt) : null
      The "written <when>" fact is suppressed for exactly the writing that was
      written here.
```

⭐ **S2 is the most serious and was not the reported symptom.** The reported
symptom is a false sentence; S2 is a false *state* — the Studio declining to
offer a writer back the book they are actually writing.

## 3. The lifecycle states

```
SOURCE   manuscript_sections            what was BROUGHT IN, unchanged.
                                        Written by ingest only. Absent by
                                        design for a blank start.
DRAFT    manuscript_working_drafts      content text NOT NULL. Where writing
                                        in the Studio actually lives. One row
                                        per manuscript.
REVISION working_draft_revisions        append-only, immutable; revision 1 is
                                        system-written at draft creation.
```

```
LIFECYCLE           SOURCE      DRAFT           charCount says
imported, untouched  N chars    N (seeded)      N pages          ✅ truthful
imported, edited     N chars    M chars         N pages          ⚠️ Source extent,
                                                                 not current extent
blank, unwritten     0          0               "No writing yet" ✅ truthful
blank, WRITTEN       0          M chars > 0     "No writing yet" ⛔ FALSE
```

## 4. What "writing exists" lawfully means

The candidate target law —

> *"No writing yet" may appear only when no member-authored writing exists in
> any currently authoritative writing state.*

— holds against all four states above. One refinement DISCOVER surfaces:
**authorship, not merely extent.** `homeState.ts:78-101` already documents two
live traps: a draft row can be *touched* with zero content (`/blank` reuses
untouched blanks), and a seeded import stamps `updated_at` at creation, so
374,697 characters can arrive having never been written here.

So presence is not `draft.content <> ''` alone, and not `lastWrittenAt` alone:

```
imported+untouched   draft has content, no member act    → not "written here"
blank+touched+empty  member act, no content              → not writing
blank+written        member act AND content              → WRITING EXISTS
```

⚠️ Note the two questions are genuinely different and both are real:
**"is there writing?"** (S1, S3, S4) and **"was it written here?"** (S2).
Conflating them would recreate the CONTINUE-hero defect `homeState` already
fixed. ⛔ Not decided here.

## 5. Does a single derived presence fact already exist? — No

```
charCount     Source extent only
lastWrittenAt member act, but NO extent — the API's CASE expression carries
              only a timestamp
sectionCount  Source structure; 0 for every blank start
keepCount     marked lines; unrelated
```

**Nothing in the API reads draft extent at all.** `manuscripts/route.ts` touches
`manuscript_working_drafts` solely for the `updated_at > created_at` test. The
column that would answer the question — `length(d.content)` — is never read by
any surface in this census.

## 6. Would changing `charCount` corrupt a surface that means Source extent? — YES

⛔ **Do not repoint `charCount` at the draft.**

- `pagesLabel` on an imported manuscript is a truthful statement about Source
  extent, and the Press surfaces treat Source as the authoritative "what you
  brought in."
- `homeState`'s `feature` selection means *"the most substantial piece of
  writing"* — a presence question, not a Source question, so it needs the new
  predicate rather than a redefined `charCount`.
- `press/manuscript/page.tsx` declares it (unused today), and `sectionCount`
  beside it is unambiguously Source.

**The boundary holds: fix the predicate, not the ontology.** Source and Working
Draft stay separate; what is missing is a *third* fact derived from both.

---

## 7. Shape of the smallest repair — NOT AUTHORIZED, recorded for the ruling

```
ADD      one derived presence fact at the API boundary, from data already
         present (length of manuscript_working_drafts.content), beside
         charCount rather than replacing it
KEEP     charCount = Source extent, unchanged, everywhere it means that
CHANGE   S1 · S2 · S3 · S4 to ask the presence question instead
NO       migration · no schema change · no new table · no new route
```

⚠️ **Open for the ruling, because DISCOVER cannot settle it:** whether S2
(*was it written here?*) uses the same predicate as S1/S3/S4 (*is there
writing?*), or keeps its stricter member-act test. §4 argues they are different
questions; collapsing them would undo a defect `homeState` already closed.

---

## 8. Standing

```
DISCOVER            COMPLETE
target law          CANDIDATE — holds against all four lifecycle states
S2 severity         ⭐ exceeds the reported symptom
REPAIR              NOT AUTHORIZED
open question       one predicate or two (§7)

NOT IN THIS LANE    Finding B/C/D · Remove Work lineage ·
                    copy correction · shelf ordering
```

---

# PART II — FOUNDER RULING (2026-09-08) AND API DESIGN

```
STATUS   DESIGN · schema-free, derivation only
BUILD    NOT AUTHORIZED
```

> **Source, writing presence, and authorship activity are three different
> truths. None may stand in for another.**

## II.0 The ruling

Three different facts were hiding behind `charCount`. S2 must **not** share a
predicate with S1/S3, and S4 must not either.

```
SOURCE EXTENT             sourceCharCount           how much immutable Source
CURRENT WRITING EXTENT    writingCharCount          how much writing is in the
                                                    current writing state
WRITING PRESENCE          hasWriting                does substantive writing exist
MEMBER AUTHORSHIP         hasMemberWritingActivity  did the member author HERE,
                                                    not merely inherit/seed
MEMBER WRITING TIME       lastMemberWrittenAt       when, if establishable
```

⛔ **Do not redefine `charCount`.** It stays Source extent, which is what it
truthfully means wherever Source is meant. New facts get names that say what
they know.

## II.1 ⭐ Cases 5 and 6 ARE distinguishable — enumeration re-verified on `21e315871`

The API's own comment requires this before trusting `updated_at`:
*"If a future migration, normalisation job, or import-completion step ever
writes updated_at, this stops being authority. Re-run the enumeration before
trusting it again."* Re-run:

```
manuscript_working_drafts.updated_at
  NO TRIGGER — plain DEFAULT now() on insert; every advance is EXPLICIT

WRITERS THAT ADVANCE IT      always paired with SET content = …
  draft/route.ts:463-466     save / autosave           MEMBER
  draft/route.ts:585-588     content path              MEMBER
  draft/revisions:179-182    restore                   MEMBER
  draft/revisions:313-316    restore                   MEMBER
  draft/checkpoint:146-149   checkpoint                MEMBER

WRITERS THAT DO NOT TOUCH IT
  ⭐ draft/route.ts:267-268  section-addressable conversion — SYSTEM
     sets section_addressable_at + section_conversion_version only
  blank/route.ts:124         insert    → updated_at == created_at
  draft/route.ts:172         insert    → updated_at == created_at
```

⭐ **A system conversion of the draft does not move the discriminator.** The
`updated_at > created_at` test is still authority on this SHA.

### A second, independent discriminator exists

```
import seed    revision 1, note 'Initialized verbatim from source'   SYSTEM
blank start    revision 1, note 'Started writing'                    member gesture,
                                                                     content ''
member act     revision_number > 1, or any other note                MEMBER
```

⭐ **Two independent means, which must agree.** That is a falsifier, not
redundancy: if they ever disagree, the enumeration has been invalidated by a
change nobody noticed, and `hasMemberWritingActivity` must fail closed rather
than pick a winner.

⚠️ **Recorded, adjacent, not this lane's to fix:** `studio/history`'s exclusion
filter matches only the *import* note, so a blank manuscript's `'Started
writing'` revision 1 surfaces as a `version_kept` act with empty content. As
history that is arguably right — the member did start. As **writing presence**
it must not count, and this design does not let it.

## II.2 Derivation

```sql
sourceCharCount   = sum(length(s.body)) over manuscript_sections        -- UNCHANGED

writingCharCount  = CASE WHEN d.id IS NOT NULL THEN length(d.content)
                         ELSE sourceCharCount END

hasWriting        = (that value, ignoring whitespace) > 0

hasMemberWritingActivity = d.updated_at > d.created_at

lastMemberWrittenAt      = CASE WHEN d.updated_at > d.created_at
                                THEN d.updated_at END                  -- today's
                                                                       -- lastWrittenAt
```

⛔ **`writingCharCount` is a CASE, never a SUM.** Source and Draft are the same
writing at two lifecycle layers; adding them double-counts every imported book.

⚠️ **On "substantive".** `hasWriting` ignores whitespace — a draft holding only
newlines is not writing. This is a **presence test only**: it never alters,
trims, normalizes or re-renders stored content, and nothing downstream sees a
modified string. ⛔ It must not be mistaken for licence to normalize elsewhere;
matching evidence against a Work remains exact.

## II.3 ⭐ `hasMemberWritingActivity` stays PURE — the composition lives at S2

The tempting definition is *activity AND extent*, because that is what the
CONTINUE hero needs. **Refused.**

```
hasMemberWritingActivity = the member authored here          (authorship only)
S2 (continuable)         = hasMemberWritingActivity && hasWriting
```

If the field silently carried an extent test, its name would lie — a value
that knows more than it says is exactly the defect this lane exists to fix, one
layer along. The CONTINUE-hero protection is preserved *by the conjunction*,
not by overloading a name.

This yields the states the ruling requires:

```
hasWriting  hasMemberWritingActivity  case
   true              false            imported Source seeded into a draft
   false             false            blank manuscript, untouched
   false             true             ⭐ touched then emptied — NOT continuable
   true              true             genuinely written here
```

⭐ The third row is the one the ruling names, and it falls out of keeping the
two facts separate rather than needing its own rule.

## II.4 Surface ownership

```
S1  "No writing yet"      → hasWriting
S2  Continue / resumable  → hasMemberWritingActivity && hasWriting
S3  ordering / feature    → writingCharCount        ⛔ not sourceCharCount
S4  "written <when>"      → lastMemberWrittenAt, only when established
```

`pagesLabel` on a Press/Source surface keeps `sourceCharCount`. ⚠️
`lastWrittenAt` → `lastMemberWrittenAt` is a rename with **one** consumer
(`HomeView.tsx:337`); the value is unchanged.

## II.5 Falsifiers

```
F1  untouched blank            source 0 · writing 0 · hasWriting F · activity F
F2  touched then emptied       hasWriting F · activity T · ⭐ NOT continuable
F3  Studio-born, real writing  source 0 · writing >0 · hasWriting T · activity T
                               ⭐ never says "No writing yet"
                               ⭐ can be the feature, ranked by writingCharCount
F4  imported, no draft yet     writingCharCount == sourceCharCount
F5  imported, seeded draft     hasWriting T · activity F · not continuable
F6  imported, later edited     hasWriting T · activity T · continuable
F7  ⭐ the two discriminators agree on F1–F6; a constructed disagreement
       fails closed rather than choosing
F8  whitespace-only draft      hasWriting F · content byte-identical in storage
F9  sourceCharCount unchanged for every case — no surface meaning Source moves
F10 a 200k-char Studio-born draft outranks a one-page import in feature
       selection (the S3 inversion, stated as a test)
```

## II.6 Standing

```
ruling               RECORDED · five fields, four questions
enumeration          ⭐ RE-VERIFIED on 21e315871
cases 5 vs 6         ⭐ DISTINGUISHABLE — two independent means
schema change        NONE — every value derives from data already stored
BUILD                NOT AUTHORIZED
adjacent, unfixed    'Started writing' revision 1 in studio/history
```

---

# PART III — DESIGN R2 (checkpoint counterexample; three resolutions)

```
SUPERSEDES  Part II §II.1 discriminator · §II.2 hasMemberWritingActivity ·
            §II.2 hasWriting · §II.4 S4
BUILD       NOT AUTHORIZED
```

> **A member gesture is not necessarily a writing act.**

## III.0 ⛔ The counterexample, and the false claim it exposes

Part II asserted that every writer advancing `updated_at` is *"always paired
with `SET content = …`"*. **That is false.** It was generalized from the save
and restore routes without reading checkpoint's UPDATE body.

`app/api/sovereign/manuscripts/[id]/draft/checkpoint/route.ts:145-160`:

```sql
UPDATE manuscript_working_drafts
   SET version = version + 1,
       revision_count = revision_count + 1,
       updated_at = now(),
       last_idempotency_key = $4, …
```

⛔ **No `SET content`.** The route then INSERTs a revision (`note NULL`,
`revision_number = revision_count`). So this lawful sequence exists:

```
import Source → draft seeded verbatim → member presses Keep a version
  updated_at > created_at   TRUE
  revision_number > 1       TRUE
  content                   BYTE-IDENTICAL to the imported Source
```

⭐ **The two "independent discriminators" are not independent.** A checkpoint
moves both. They independently report the same weaker fact: *a member performed
a post-creation draft lifecycle act.* That is not authorship.

```
5a  imported + untouched          distinguishable
5b  imported + checkpoint only    ⛔ NOT distinguishable from an edit
6   imported + genuine edit
```

⚠️ **The API comment in `manuscripts/route.ts` is therefore too strong** where
it enumerates `draft UPDATE (save / autosave) — updated_at = now() MEMBER` as
if content always moved with it. Checkpoint is the exception, and the comment
must be corrected with the implementation — ⛔ not silently preserved as
doctrine.

## III.1 What `updated_at` actually establishes

```
hasMemberDraftActivity     = d.updated_at > d.created_at
lastMemberDraftActivityAt  = that timestamp
```

Meaning: *the member performed a post-creation draft act* — saving,
checkpointing, restoring, or editing. ⛔ Not `hasMemberWritingActivity`, and
⛔ not `lastMemberWrittenAt`. Those names claim more than the data knows.

⭐ **The lane's law is symmetric.** Part II argued a value must not know more
than its name says. The converse binds equally: **a value must not say more
than it knows.**

## III.2 Resolution 1 — `hasCurrentMemberContribution`

Baseline is revision 1, which every creation path writes (`'Started writing'`
for a blank page, `'Initialized verbatim from source'` for a seeded draft) and
which **nothing ever deletes** — the revision partition migration carries no
prune, no DETACH, no retention path. Verified, because this design rests on it.

```
hasCurrentMemberContribution =
    manuscript_working_drafts.content
      IS DISTINCT FROM
    (working_draft_revisions WHERE draft_id = d.id AND revision_number = 1).content
```

```
blank → still empty                    FALSE
blank → wrote text                     TRUE
blank → wrote then erased to empty     FALSE
import → seeded verbatim               FALSE
import → checkpoint only               ⭐ FALSE
import → genuine edit                  TRUE
import → edit then restore exact source FALSE
```

⭐ The last row is coherent rather than a compromise: there is no longer a
current authored divergence to continue. That the member once worked and then
restored is **history**, and history does not need to manufacture a current
writing state.

```
S2 continuable = hasWriting && hasCurrentMemberContribution
```

⚠️ **Fail-closed obligation:** if revision 1 is missing (a legacy draft
predating both creation paths), there is no lawful baseline and
`hasCurrentMemberContribution` is **FALSE**, never assumed true. A Work does
not become continuable because its evidence is absent.

## III.3 Resolution 2 — `hasWriting` is independent, an OR not a CASE

Part II let the boolean inherit the number's CASE. ⛔ Corrected:

```
hasWriting = substantive Source exists OR substantive current Draft exists
```

```
sourceCharCount > 0 · draft empty  →  hasWriting TRUE
```

Under Part II this returned FALSE while the immutable Source still held the
book — contradicting `hasWriting`'s own definition. **The boolean must not
inherit the CASE merely because the number does.**

## III.4 Resolution 3 — S3 for Source non-empty, Draft empty *(proposed, needs ratification)*

Ranking asks *how much writing is there*, so it needs the number, not the
boolean. Proposal — the CASE gains an emptiness guard rather than becoming a
`max()`:

```
writingCharCount =
  CASE WHEN a draft exists AND its content is substantive
       THEN length(draft.content)
       ELSE sourceCharCount END
```

Argued: the current representation governs **while it holds writing**; when it
holds none, the Source is what the member still has. ⛔ Not `max()` — that
would rank a deliberately shortened draft by the extent it no longer has. ⛔
Never a SUM — Source and Draft are one book at two layers.

⚠️ This is the one point where DESIGN is proposing product semantics rather
than reporting what the data can establish. **It needs your ratification, not
my judgement.**

## III.5 Resolution — S4 is not establishable

```
S4  "written <when>"   ⛔ NOT PRESENTLY ESTABLISHABLE FROM updated_at
```

A checkpoint moves that timestamp without writing. ⛔ Do not rename
`lastWrittenAt → lastMemberWrittenAt`; that would replace one false name with a
more confident one. Two lawful futures, neither taken here: expose
`lastMemberDraftActivityAt` and change the surface to *"worked &lt;when&gt;"*,
or establish a genuine content-change timestamp through stronger evidence —
which likely needs persistence this schema-free repair may not add.

**A valid result of DESIGN is that a fact cannot yet be told.**

## III.6 Falsifiers — R2 set

```
F1   untouched blank              hasWriting F · draftActivity F · contribution F
F2   touched then emptied         hasWriting F · draftActivity T · contribution F
F3   Studio-born, real writing    hasWriting T · contribution T · continuable
F4   imported, no draft yet       writingCharCount == sourceCharCount
F5a  imported, seeded, untouched  hasWriting T · draftActivity F · contribution F
F5b  ⭐⭐ THE CHECKPOINT FALSIFIER
       import seed → checkpoint, no content change
         hasMemberDraftActivity        TRUE
         hasCurrentMemberContribution  FALSE
         continuable                   FALSE
       ⛔ This is the test that proves the lane repaired the semantic error
         rather than renaming it. A design that passes F1–F5a and fails F5b has
         changed vocabulary and nothing else.
F6   imported, genuine edit       contribution T · continuable
F7   edit then restore to source  contribution F · continuable F
F8   whitespace-only draft        hasWriting F · content byte-identical in storage
F9   sourceCharCount unmoved in every case
F10  200k-char Studio-born draft outranks a one-page import (S3 inversion)
F11  ⭐ Source non-empty, draft emptied
       source presence T · draft presence F · hasWriting TRUE
       writingCharCount per §III.4, once ratified
F12  revision 1 absent (legacy draft) → contribution FALSE, fail-closed
```

## III.7 Standing

```
core separation                       RATIFIED
sourceCharCount                       RATIFIED
hasWriting as OR                      RESOLVED (III.3)
hasCurrentMemberContribution          RESOLVED (III.2)
S3 emptiness-guarded CASE             ⚠️ PROPOSED — needs ratification
S4 "written <when>"                   ⛔ NOT ESTABLISHABLE — recorded as such
hasMemberWritingActivity via updated_at   REJECTED, and the false claim that
                                          produced it is recorded in III.0
API comment correction                OWED WITH THE IMPLEMENTATION
schema change                         STILL NOT REQUIRED
BUILD                                 NOT AUTHORIZED
```
