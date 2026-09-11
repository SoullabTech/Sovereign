# MEMBER-ACCESS-01 · STAGE 6 → 7 GATE · CENSUS RESULT

**Run** 2026-09-11 from the Mac Studio against production, read-only.
Script: `scripts/witness/member-access-contact-census.sql`. Output pasted verbatim
by the founder; **no value below is inferred.**

> ⏱ **Timestamp convention.** All dates in this record are **UTC**, matching this
> repository's commit timestamps. The founder's local clock is UTC−7, so a reading
> stamped `2026-09-11T01:2xZ` occurred on the evening of **2026-09-10 local**. Both
> are the same moment. ⛔ Do not "correct" these to the local date — that would
> desynchronise the prose from the commits it describes, which is the discrepancy
> the convention exists to prevent.

---

## 1 · The numbers

```
CENSUS A · AMBIGUOUS CONTACT
  distinct ambiguous contacts    1
  members affected               2
  largest ambiguity set          2
  sets of exactly 2              1
  sets greater than 2            0
  members total                 92

CENSUS B · CONTACT EVIDENCE
  s1  no contact address                         12
  s2  present · verification unknown             80
  s3  verified by token-link flow only            0
  s4  positive delivery evidence only             0
  s5  verified AND delivered                      0
  s6  known delivery failure        [UNAVAILABLE] 0
  members total                                  92

MIGRATION POPULATIONS
  A  unique and evidenced          0
  B  ambiguous                     2
  C  under-evidenced              90
```

## 2 · 🔴 THE HEADLINE — the evidence model is not narrow, it is EMPTY

**`s3 + s4 + s5 = 0`. Not one member of 92 carries any verification evidence at all.**

Stage 6 established that `email_verified` records one route and that `used_at`
records another. The census establishes the consequence: **both are zero across the
entire fleet.** The narrowness is total.

### 2.1 · ⚠️ What this does NOT establish

⛔ **It does NOT establish that 90 members are unrecoverable.**

Members demonstrably **do** receive and use email codes — witnessed twice in this
same session, with provider acceptance and real message ids on `auth:email-code`.
Most of those 80 almost certainly hold working, deliverable addresses. **The system
simply holds no record of it.**

> **ESTABLISHED:** Soullab cannot demonstrate that *any* member is recoverable.
> **NOT ESTABLISHED:** that members are not recoverable.

**`pop_C = 90` means UNDER-EVIDENCED, never UNRECOVERABLE.** Reading it as the
latter would be the inflation drift this project already names — and in the more
damaging direction, because it would justify a mass re-enrolment that the evidence
does not call for.

**This is a measurement failure, not a membership failure.**

## 3 · ⭐ The strategic consequence — P-1 is the gate on invisible migration

`pop_A = 0` means: **under the founder's rule — a contact resolves identity only if
unique AND verified — not one member can be migrated invisibly today.** All 92 fall
to assisted enrolment, which is precisely the outcome B3 and M-6 exist to keep small.

But `pop_A = 0` is a statement about **the rule applied to the current evidence**,
not about the members. And the evidence is absent for a reason that is fixable
**without asking a single member to do anything**:

```
TODAY        an email-code sign-in proves control of an address
             and records nothing

WITH P-1     the same sign-in records: this member proved control
             of this contact, at this time, by this mechanism
```

⭐ **So P-1 is not hygiene. It is the highest-leverage item in the lane.** Ship
evidence capture first, observation-only, and **pop_A rises on its own as members do
what they already do.** The assisted-enrolment cohort shrinks passively.

> **That is literally "the system migrates around the member."** The alternative —
> classifying today — would manufacture a 90-person enrolment ceremony out of a
> missing write.

## 4 · The other findings

### 4.1 · R-B1 ambiguity is a corner case, and non-zero
**1 contact · 2 members · largest set 2.** Not a migration population — **and not
nothing.** One live collision exists today, and `auth/signin/google/callback` resolves
its email fallback with `LIMIT 1`, so **that collision is currently resolved
arbitrarily.** I-17 (*unique or refuse*) stands, sized as a repair rather than a
programme.

### 4.2 · 12 members have no contact address — 13% of the fleet
The clearest B3 candidates under an architecture where email is the ordinary floor.
⚠️ **Care:** `members.email IS NULL` means *no address on the member row*, not *no
reachable address anywhere*. Some may have joined by local or passkey paths and
simply never supplied one. **Their true status is unknown, not absent.**

### 4.3 · `/api/members/verify-email` has never succeeded in production
`s3 = 0` across 92 members. The route exists; nothing has ever passed through it to
completion, or the write never landed. ⛔ Not investigated here.

### 4.4 · The magic-link flow appears unused
`s4 = 0`. Consistent with email-code being the live default door. **The one
unambiguous evidence signal Soullab has is produced by a path nobody takes** — which
is why §2 of the addendum warned against making `used_at` the future model.

## 5 · Can Stage 7 open?

**Recommendation — founder ruling required:**

> **YES, but reordered. Stage 7 opens on P-1 evidence capture, observation-only, and
> nothing else.**

M-9's A/B/C/D classification **cannot be completed today** — `D` is effectively 90,
and classifying from absent evidence would invent the answer. The order that follows
from the census:

```
1  P-1 evidence capture           record control-proof events from flows that
                                  ALREADY prove control. No member action.
                                  Observation only — nothing reads it yet.

2  let evidence accumulate        passive. Members do what they already do.

3  re-run this census             pop_A rises; pop_C falls to its true size

4  THEN classify A/B/C/D          on evidence rather than on absence

5  only then                      migration design, retirement sequencing
```

⚠️ **P-1 as described in step 1 is a schema change and a write**, and is therefore
**NOT AUTHORIZED by this document.** It is a recommendation for the next founder act.

## 6 · Epistemic status of every number above

Per the founder's instruction that the values matter less than what they can
legitimately establish:

| number | what it is | what it is NOT |
|---|---|---|
| ambiguous = 1 / 2 members | **OBSERVED** — a real collision population | not a migration programme |
| no address = 12 | **OBSERVED** on `members.email` | not "unreachable" — status unknown |
| `email_verified` = 0 | **OBSERVED EMPTY** for one route's flag | not universal verification truth |
| `used_at` = 0 | **OBSERVED EMPTY** for one route's artifact | not a future verification model |
| delivery failures = 0 | 🔴 **NOT OBSERVED** | **never "there were no failures"** |
| `pop_C` = 90 | **OBSERVED** absence of evidence | **not** absence of recoverability |

## 7 · Standing

```
CENSUS             RUN · results recorded
EVIDENCE MODEL     EMPTY — 0 of 92 carry any verification evidence
R-B1 ambiguity     CORNER CASE (1 contact, 2 members) — repair, not programme
B3 cohort          NOT YET COUNTABLE — 12 have no address; 90 are under-evidenced

P-1                ⭐ RECOMMENDED AS THE NEXT ACT · NOT AUTHORIZED
P-2 · P-3          REQUIRED · NOT DESIGNED
M-9 classification BLOCKED on P-1 evidence

STAGE 7            HELD pending founder ruling on the reordering in §5

⛔ CODE · SCHEMA · MIGRATION · AUTH CHANGE · VENDOR — ALL NO
```
