# WS2-06A · runtime witness — the authorial threshold, walked

```text
WITNESSED SHA   869e559c9
DATE            2026-09-02
WALKED BY       the founder, authenticated, against a real manuscript and a real
                unadopted Structure Review
SURFACES        desktop · mobile 390x844
RESULT          PASS — no redesign indicated
```

## 0 · Provenance of this record

**Read this first, because the record's value depends on it.**

The runs below were performed by the founder on their own machine, against a local
PostgreSQL and a running Studio. **This session did not perform them and did not observe
the database.** The results are recorded here as founder-reported, in their words and
figures, because that is what they are.

Two things in this record are first-hand for this session, and are marked `[SEEN]`: a
screenshot of the mobile after-state, and a screenshot of the armed `/adopt` XHR breakpoint.
Everything else is `[REPORTED]`.

The distinction is kept because a witness record that blurs who observed what is the same
failure the 6A rebuild exists to correct — a claim carried forward without the thing that
established it.

## 1 · Results

```text
Bootstrap reconstruction                        PASS   [REPORTED]
Provenance migration applied on PostgreSQL      PASS   [REPORTED]
Paired provenance CHECK                         PASS   [REPORTED]
Nonblank review-unit key CHECK                  PASS   [REPORTED]
Unique proposal/unit descent index              PASS   [REPORTED]
NO ACTION provenance FK                         PASS   [REPORTED]
AuthorStructureCommand runtime                  PASS   [REPORTED]
4 canonical units, origin = member              PASS   [REPORTED]
p1 / p2 / m1 / p3 lineage                       PASS   [REPORTED]
14 / 14 memberships                             PASS   [REPORTED]
Work content unchanged                          PASS   [REPORTED]
Second invocation → already_adopted             PASS   [REPORTED]

Desktop before                                  PASS   [REPORTED]
Desktop explicit crossing                       PASS   [REPORTED]
Desktop after                                   PASS   [REPORTED]
Desktop database truth                          PASS   [REPORTED]

Mobile 390x844 before                           PASS   [REPORTED]
Reload with /adopt breakpoint → no adoption     PASS   [SEEN, armed]
Explicit click → /adopt call stack              PASS   [REPORTED]
Mobile after                                    PASS   [SEEN]
Mobile database truth                           PASS   [REPORTED]
```

Final database state after the mobile act:

```text
adopted                  true
adopted_review_revision  3
canonical_units          4
memberships              14
```

## 2 · What this session saw directly

A screenshot of the mobile viewport at 390x844, in DevTools, showing:

- **The reading still present above the crossing**, with `Departure · Setting out · The road ·
  Return` and their movement ranges — MAIA's reading remained visible after the act rather
  than being replaced by its consequence.
- **Authorship distinguishable inside that reading.** `The road` is marked *"added by you"*;
  `Return` carries *"MAIA originally suggested Return 6–13"*. The writer's alterations and
  MAIA's original perception are separately legible in the same list, which is the property
  the room exists to hold.
- **The after-state copy**: *"This is your structure now. You made 4 divisions part of your
  Work, holding 14 sections. You wrote this structure from the reading you reviewed."* The
  room attributes the act to the writer and names the reading as its source. It does not say
  MAIA changed anything.
- **`Your changes so far: 1 division altered, 1 added.`** — the review delta survived the
  crossing, so what the writer did to the reading is still visible after it became structure.
- **The falsifier apparatus armed**: XHR/fetch breakpoint `URL contains "/adopt"`, checked,
  with Call Stack reading **Not paused** on the loaded page.

## 3 · The controlled non-consent falsifier

```text
reset            → canonical units 0
hard reload      → no /adopt call
explicit click   → /adopt call
call stack       → <button> → cross() → authorStructure()
```

This is the evidence that carries the non-consent claim at runtime. Its structural counterpart
is `lib/writersStudio/__tests__/adoptionRequiresGesture.test.ts` (16 properties across gesture,
client, route and command) and `lib/manuscript/ask/__tests__/askRuntimeCannotWrite.test.ts`
(MAIA's Ask runtime cannot reach the command). The runtime falsifier and the structural proof
establish the same boundary by different means.

## 4 · The 21:10 event — observed, not reproduced

An adoption was observed at 21:10 during the walk that was not explained at the time.

**It stays in this record, and it is not promoted into a defect.** It was not reproduced, and
the subsequent controlled falsifier in §3 — reset to zero units, hard reload producing no call,
explicit click producing the call with a member-initiated call stack — is the stronger evidence
about whether adoption can occur without a gesture.

Recorded rather than erased because an unexplained observation is a fact about the walk. A
witness record that keeps only the events it can account for is not a record of what happened.
Anyone re-opening this boundary should know it occurred and that it did not recur under
control.

## 5 · What the walk establishes, exactly

> **"Make this my structure" reads as an act of authorship, not as another MAIA suggestion or
> an ordinary review edit. After the act, the room communicates that the writer authored the
> structure from the reviewed reading, rather than that MAIA changed the Work.**

And no further: it says nothing about how the room behaves for a member who is not the
founder, on a Work other than the one walked, or at viewport sizes between the two witnessed.

**No redesign is indicated.** The authorial threshold did what it was designed to do.

## 6 · What remains owed

Nothing for the walk. The design-canon gate additionally requires the two witness screenshots
to exist on disk at the paths the Experience Contract names; they are held by the founder and
are not in this session's reach.
