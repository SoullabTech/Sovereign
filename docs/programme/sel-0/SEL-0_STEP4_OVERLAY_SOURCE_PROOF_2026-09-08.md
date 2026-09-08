# SEL-0 Step 4 — eligibility-overlay source proof · **STRUCTURAL HALF ONLY**

**Founder ruling**: resolve the Step-4 MISMATCH by a blind eligibility overlay over the 19
already-frozen observation identities. The ruling's **first required step** is structural:
prove the authoritative production source for each predicate *before* reading any state, and
STOP if either has none.

This document discharges that step only. **No production state was read** — this session has
no production access (C0, unchanged). Code read only; no values, IDs, or stimulus.

---

## Predicate 1 · member standing — **AUTHORITATIVE SOURCE PROVEN**

```text
table    developmental_observation_standing_events      (append-only)
writer   lib/manuscript/standing/store.ts               — writes exactly one table
reader   currentStandings(memberId, readingId)
         SELECT DISTINCT ON (observation_key) … ORDER BY observation_key, event_index DESC
scope    member_id AND reading_id — member-scoped in the statement, not filtered after
values   keep | dismiss | unresolved ;  no row = UNSET
```

Two properties make this safe for an overlay:

- *"An observation with NO row is UNSET and is simply absent — the projection never invents
  a value for it, because there is no value to invent."*
- *"this function throws rather than returning `[]` on error, so absence of evidence from the
  instrument cannot be read as evidence of absence in the object."*

**A failed read cannot masquerade as "nothing dismissed."** That is exactly the confusion the
overlay exists to prevent, and the reader already refuses it.

✅ Resolvable, stored, authoritative.

---

## Predicate 2 · supersession — **NO STORED SOURCE. DERIVED, AND THREE-STATE.**

```text
NOT a column. NOT a table. NOT persisted anywhere.

definition  lib/manuscript/developmentalReading/assess.ts
            assessReading(reading, now: LiveWork)  — PURE
            "current while every section it covered at body depth is unchanged,
             superseded where one moved, unmeasured where the Work could not be loaded"
input       the frozen reading  +  the LIVE Work
live Work   loadLiveWork()  — lib/manuscript/development/capture.ts
            LiveWork        — lib/manuscript/development/resolve.ts
states      current | superseded | unmeasured        ← THREE, not two
```

Supersession is **computable** from production (frozen reading + live draft) by an existing
named pure function, so it is not unresolvable. But it is not a fact to query — it is a
comparison against the manuscript **as it stands at the moment of the read**.

### ⛔ Two consequences that must be settled before the production read

**(a) `unmeasured` is a third state and §2.3 does not classify it.** The contract excludes
*superseded*. It says nothing about an observation whose live Work could not be loaded.
`unmeasured` is not `current` and is not `superseded`. Building the overlay requires deciding
whether an `unmeasured` observation is lawful — **and that decision cannot be defaulted**,
which the ruling forbids. If the live Work fails to load at overlay time, *every* observation
returns `unmeasured` and the overlay would silently become either "all lawful" or "all
excluded" depending on a choice nobody made.

**(b) Supersession is time-varying, and the corpus is not young.** The 19 were frozen against
the draft as it stood then; supersession is evaluated against the draft as it stands now.
Every section edited since that freeze supersedes the observations covering it. **It is
entirely possible that most or all 19 are now superseded** — this is not a remote edge case,
it is the expected behaviour of a manuscript that has been worked on.

That does not change the ruling — freezing the predicate at fixture-lock time for one run is
exactly what was authorised — but it makes the `n < 19` fork substantially more likely than
the `n = 19` one, and the founder's own arithmetic already binds: **at `n <= 11`, `U >= 60`
is impossible because fewer than 60 pairs exist.**

---

## Founder question returned before any production read

**Q12 · How is `unmeasured` classified for the eligibility overlay?**

```text
a  unmeasured is LAWFUL      (only an explicit `superseded` excludes)
b  unmeasured is EXCLUDED    (only an explicit `current` is lawful)
c  unmeasured ABORTS the overlay — a fixture whose lawfulness could not be
   measured is not a fixture; re-attempt when the live Work loads
```

⛔ **Not defaulted**, per the ruling. The three differ sharply when the live Work fails to
load: (a) admits an unverified set, (b) empties the fixture on an infrastructure fault, (c)
refuses to freeze an unmeasured answer at all. **(c) is the reading most consistent with the
Step-4 finding it repairs** — *"assuming is not verifying"* — but it is a founder call.

---

## Standing

```text
predicate 1 standing        SOURCE PROVEN — safe to read
predicate 2 supersession    DERIVED, three-state — Q12 must be ruled first
production read             NOT PERFORMED — no production access in this session
overlay                     NOT BUILT · NOT FROZEN
Step 4                      STILL MISMATCH — unresolved
Manifest A/B/C · excluded · source snapshot   UNTOUCHED, byte-identical
product contract  FROZEN ebcb46d0d   ·  instrument  FROZEN af155f414
selector NOT IMPLEMENTED · Manifest B NOT OPENED · founder blind INTACT
MERGE / DEPLOY NOT AUTHORIZED
```

**Execution note.** The state-read half requires production and must run from the Mac Studio
session, after Q12 is ruled. Nothing about it is blocked by this session's limits except the
read itself.
