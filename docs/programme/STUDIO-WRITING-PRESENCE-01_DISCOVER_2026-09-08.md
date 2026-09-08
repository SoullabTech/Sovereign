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
