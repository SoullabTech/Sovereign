# WS2-07 · BUILD-07D — MERGE / ACCEPTANCE RECONCILIATION

> **BUILD-07D is MERGED but NOT ACCEPTED.** PR #1192 reached canonical before the unit's own
> closure rule was satisfied. This record states that fact, fixes what is and is not established
> by the merge, and names the exact path to a lawful acceptance. **It records; it does not rule.**
> Acceptance of BUILD-07D remains a founder act that has not occurred.

```text
UNIT          BUILD-07D DEVELOP SURFACE
LANE          JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01 (dated 07D block, 2026-09-04)
STATE         MERGED / NOT ACCEPTED · RECONCILIATION REQUIRED
CANDIDATE     d005d59eb   (Gate A 22/0)
MERGED AS     e0803660    (PR #1192, head 7e8265b3, base 34cc4cad9, merged by the founder
                           2026-09-04T19:24:41Z)
CANONICAL     cf6ce3cef   (contains e0803660 as ancestor via PR #1195)
BLOCKER       WS2-07-F1 semantic boundary repair — PR #1194 OPEN, live semantic witness PENDING
07E           NOT OPENED. Does not open on 07D code being canonical.
```

## 1 · The inconsistency, stated exactly

The Programme Board's own sequence ordered the merge **after** closure:

> `… → refresh BUILD-07D → Gate B(a) rerun → browser walk (b) → CLOSED / ACCEPTED →`
> `merge #1192 on green pinned to the exact head → verify canonical → STOP`

PR #1192's own summary carried the same condition in its first line: *"STRUCTURALLY PROVED · NOT
CLOSED. Do not merge until the founder records CLOSED / ACCEPTED on Gate B."*

The merge happened first. Both the PR record and the board still read `NOT CLOSED` while the code
they describe is on canonical. That is a governance inconsistency in the record, not a defect in
the merged code — and the two must not be conflated.

**The merge does not constitute acceptance.** Under this lane's closure rule a unit closes by a
recorded founder ruling on a two-gate witness, never by reaching canonical. A merge performed by
the founder is an act of *placement*, not of *adjudication*; nothing in the corpus makes canonical
presence self-ratifying. Treating the merge as an implicit acceptance would retire the closure rule
by accident, for every unit after this one.

## 2 · What the merge DOES establish (verified against canonical, 2026-09-04)

Every 07D surface file on canonical `cf6ce3cef` is **byte-identical** to the Gate-A-proved
candidate `d005d59eb`:

```text
app/api/sovereign/manuscripts/[id]/readings/route.ts               IDENTICAL
app/api/sovereign/manuscripts/[id]/readings/[readingId]/route.ts   IDENTICAL
lib/writersStudio/developPresentation.ts                           IDENTICAL
lib/writersStudio/developClient.ts                                 IDENTICAL
app/writers-studio/develop/DevelopRoom.tsx                         IDENTICAL
app/writers-studio/develop/page.tsx                                IDENTICAL
app/writers-studio/studioMap.ts                                    IDENTICAL
scripts/ws2-07d-develop-gate-a.ts                                  IDENTICAL
```

The only addition between `d005d59eb` and canonical inside the 07D tree is
`scripts/ws2-07d-develop-gate-b.ts` — a **new file**, the Gate B witness instrument itself, not
surface code. No 07D surface blob drifted between the proved candidate and canonical.

Therefore **Gate A (22 checks · 0 failures) carries to canonical unchanged.** The structural
proof — SELECT-only surface, no mutating path, verbatim pass-through, frozen-topology labels,
supersession in place, no minted identity — is established for the code that is live.

## 3 · What the merge does NOT establish

```text
Gate B(a) live witness   UNPROVED — run 1 (founder-run) exhausted both permitted commissioned
                         acts; both refused at classify under the 07C D11b ruling. Nothing was
                         stored, nothing moved. A refusal-exhausted run is UNPROVED, never
                         tuned around, and never read as a pass.
Gate B(b) browser walk   NOT EXECUTABLE — D1–D8 need a reading to exist, and run 1 produced none.
Root cause               NOT in 07D. The refusals originate at the 07B/07C semantic boundary,
                         which WS2-07C-F1 measured and founder determination C located at the
                         reader/classifier boundary. 07D is downstream of a dependency defect.
```

So the merged surface is proved to be *incapable of acting*, and unproved to be *capable of
encountering a live reading end to end*. That is the precise shape of the gap.

## 4 · Why the merge is NOT reverted

A revert would remove code whose structural proof holds, whose defect is not its own, and whose
Gate B is expected to pass once the upstream repair lands. It would also destroy the substrate the
Gate B rerun needs. Revert is held in reserve for one outcome only: the rerun failing for a reason
that is **07D's own**.

**This is a deferral of the revert decision, not a waiver of it.**

## 5 · A forward blocker found during this reconciliation

`scripts/ws2-07d-develop-gate-b.ts` pins its dependencies by blob id in `CANDIDATE_BLOBS`,
including:

```text
lib/manuscript/developmentalReading/classify.ts    8024937f… (07C, candidate 8a26a8971)
lib/manuscript/developmentalReading/contract.ts    32fec5a3…
```

PR #1194 **modifies both files** (classifier prompt + contract; `CLASSIFIER_VERSION` →
`DEVELOPMENTAL-PHENOMENON-02`). The moment the repair reaches canonical, the 07D Gate B script
fails its own blob pin before running a single check.

**Consequence:** "refresh BUILD-07D against the corrected dependency" is not optional bookkeeping —
it is a required, concrete step: re-pin `CANDIDATE_BLOBS` to the repaired 07C blobs and record the
re-pin, so the rerun is pinned to the substrate it actually exercises. Re-pinning is a mechanical
act on the witness instrument; it touches no surface code and does not re-open Gate A.

## 6 · The path to a lawful BUILD-07D acceptance

```text
1  WS2-07-F1 founder live semantic witness  (PR #1194 — scripts/ws2-07-f1-semantic-witness.ts;
                                             every claim + phenomenon printed for adjudication,
                                             never auto-judged)
2  F1 adjudication → CLOSED / ACCEPTED → frontier verification → merge #1194
3  refresh BUILD-07D: re-pin Gate B CANDIDATE_BLOBS to the repaired 07C blobs (§5)
4  Gate B(a) rerun against repaired canonical
5  Gate B(b) founder browser walk D1–D8
6  founder records BUILD-07D CLOSED / ACCEPTED — explicitly reconciling that acceptance
   post-dates the merge, and stating that the merge did not confer it
7  only then: consider BUILD-07E by its own act
```

If step 4 or 5 fails for a reason internal to 07D, the revert decision deferred in §4 returns live.

## 7 · Standing of everything else

```text
07A · 07B · 07C   CLOSED / ACCEPTED — untouched by this reconciliation
BUILD-07D         MERGED / NOT ACCEPTED · Gate A carries to canonical · Gate B UNPROVED
WS2-07-F1         OPEN · acts 1–3 delivered · PR #1194 open, structural GREEN,
                  live semantic witness PENDING, NOT CLOSED
BUILD-07E–H       UNAUTHORIZED. 07E does not open on 07D code being canonical; it opens by
                  its own founder act after 07D is ACCEPTED.
```
