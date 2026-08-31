# WS2-05B-8a — Render Fidelity Witness Record

**Head:** `820bbae84`
**Proposal:** `2a427a6f-86b5-4ba3-a901-267710977f25` — the real reading of Elemental
Alchemy, `a3ae67fd-a21e-4948-8766-4c397d2e4712`, 174 sections.
**Harness:** `scripts/ws2-05b-8a-render-witness.ts`, read-only by construction.
**Status:** baseline **FAIL — 4 failed**, taken 2026-08-31 before any repair.
**Accepted `6eacae5fb`** the same day: 3.1, 5 and 7.1 green on the same frozen
proposal, everything previously green still green, revision 0. See *Acceptance*
below.

**The question 8a asks.** Does the room show what the row holds? Not whether the
reading is right — that is **05B-8b**, and it is held behind this record for a
reason stated below.

```text
Frozen row: form mixed · 11 divisions · 3 uncertain regions · unaccounted 0/174
Reader:     claude-opus-5 · prompt 7d4e27cfa81d
```

---

## The run

```text
ok    1.   the room loads the requested manuscript and proposal
ok    2.   the displayed reading is form = mixed
ok    3.   coverage shown agrees with the frozen proposal
FAIL  3.1  coverage states truncated and passes
ok    4.   the proposal accounts for all 174 sections
FAIL  5.   3 uncertain region(s) are rendered visibly          0 rendered
ok    6.   MAIA's proposal and the member's copy stay distinct  revision 0
ok    7.   null titles are not rendered as invented text        9 of 11 untitled
FAIL  7.1  uncertainty tags render on the divisions that carry them
                                                                10 carry, 0 rendered
ok    7.2  the Work's free-text kinds survive to the page       11/11
ok    8.   manuscript order, none duplicated or dropped         174/174, ascending
ok    9.   no adoption action is reachable                      absent, not disabled
ok    10.  captures written                                     incl. section 42
FAIL  11.  no console errors and no failed requests             3 × favicon 404
ok    12.  the witness itself wrote nothing                     no non-GET issued
ok    13.  the proposal is unchanged by this witness            revision 0
```

---

## The three fidelity defects

These are not cosmetic metadata. Each is something the reader deliberately said
and the member never sees.

**5 · `uncertainRegions` have no member-facing representation.** Three regions
are frozen in the interpretation. Neither `StructureReview.tsx` nor
`reviewPresentation.ts` mentions them; the word does not appear in either file.
The stored text is absent from the page.

**7.1 · Per-unit `uncertainty` has no member-facing representation.** Ten of
eleven divisions carry tags — `start-boundary`, `end-boundary`, `kind`,
`hierarchy`, `possible-scaffold-contamination`, `competing-interpretation` — and
zero render.

**3.1 · Coverage is incomplete.** Mode, section count and the section ceiling are
shown. `truncated` and `passes` are in the row and on no screen.

### Why this blocks 8b

The reader was instructed that *"an empty uncertainty list is a claim of
confidence you must actually hold"*, and she used the channel heavily rather than
pretending the boundaries were settled. **The room removes that on the way to the
writer.** What is on screen is a cleaned-up, more-certain version of the reading
that was actually made.

A founder judging "did MAIA perceive my book" through that surface would be
judging a subtly different reading — one that never says *this boundary could sit
either side*, *this may be a fourth movement*, *this reads as a contents list*.
**8b is held behind 8a for that reason, and not out of tidiness.**

---

## Classified, not counted as a room defect

**Item 11 — three 404s: `/icons/favicon-{16,32,48}x32.png`.** App-wide missing
static assets, unrelated to the review room. They are named with their URLs
rather than reported as a bare console-error count, because a witness that cannot
distinguish a broken page from a dev-server artifact invents findings. Item 11
stands as FAIL with the cause named; if a future run shows a 4xx on a review-room
resource, that is a different finding.

**Item 6 — PASS, and unexercised.** At revision 0 nothing has been changed, so
there is no divergence to show. The two-voices surface exists (`data-maia-original`
renders when a division differs) and this run did not exercise it.

**Item 10 — the section-42 capture succeeded on the real Work.** On the synthetic
fixture, which has 30 sections, it was UNKNOWN. Position 42 is the section whose
placement was refused in Run A of 5½.

---

## What this record does NOT authorise

**Repairing the defects.** The stop rule was explicit: a defect found during the
witness does not authorise fixing it. This is surface work and falls to the
Custody-B / Canvas-convergence side of the programme; finding a defect in a
frozen surface does not confer authority to change it.

The repair, when authorised, is bounded:

```text
WS2-05B-8A-RENDER-FIDELITY-01

scope
  render frozen uncertainRegions
  render unit uncertainty tags
  expose the coverage facts 8a requires

must not change
  interpretation · proposal · review operations
  canonical structure · adoption · reader
```

**This harness is its acceptance gate.** Items 3.1, 5 and 7.1 must turn GREEN on
this same frozen proposal — `2a427a6f-86b5-4ba3-a901-267710977f25` — with items
1, 2, 3, 4, 6, 7, 7.2, 8, 9, 12 and 13 still green. A repair that changed the row
to make the render agree would be the failure this record exists to prevent.

---

## Reproduction

No angle-bracket placeholder: it is a redirect in zsh, and pasting one cost four
runs during this programme.

```bash
export MEMBER_ID=$(psql -U soullab -d maia_consciousness -tAc \
  "SELECT member_id FROM member_manuscripts WHERE id='a3ae67fd-a21e-4948-8766-4c397d2e4712'")
export TOK=$(psql -U soullab -d maia_consciousness -tAc \
  "SELECT session_token FROM auth_sessions WHERE member_id='$MEMBER_ID' \
    AND revoked=FALSE AND expires_at>NOW() ORDER BY created_at DESC LIMIT 1")

DATABASE_URL=postgresql://soullab@localhost:5432/maia_consciousness \
MANUSCRIPT=a3ae67fd-a21e-4948-8766-4c397d2e4712 \
PROPOSAL=2a427a6f-86b5-4ba3-a901-267710977f25 \
npx tsx scripts/ws2-05b-8a-render-witness.ts
```

Requires the dev server on 3105. The harness intercepts and aborts every non-GET
request the page attempts, and re-reads the proposal afterwards to assert the
revision and interpretation are byte-identical.

---

## Acceptance — `6eacae5fb`, same frozen proposal

Rerun against `2a427a6f-86b5-4ba3-a901-267710977f25` after the bounded repair.
**The three target items turned green and every previously green item stayed
green.**

```text
ok    3.1  coverage carries truncated and passes from the row
           truncated false vs false; passes 2 vs 2; stated in words true
ok    5.   3 uncertain region(s) are rendered visibly
           3 rendered; the stored text is present on the page
ok    7.1  uncertainty tags render on the divisions that carry them
           10 division(s) carry tags in the frozen row; 10 rendered

ok    1, 2, 3, 4, 6, 7, 7.2, 8, 9, 12, 13   unchanged
ok    10.  captures written — coverage, section 42, end, AND uncertain region
ok    13.  the proposal is unchanged by this witness — revision 0

FAIL  11.  three app-wide favicon 404s — excluded from this mandate

FAIL — 1 failed, 0 unknown
```

**The row did not move.** Revision 0, interpretation byte-identical, and the ten
divisions the harness counted in the frozen row are the same ten it counted in
the DOM. What changed is that the room now says what the row always held.

**Item 11 is the one remaining red**, and it is the one the mandate explicitly
excluded: `/icons/favicon-{16,32,48}x32.png` are missing app-wide and have
nothing to do with the review room. It was already red in the baseline, so it is
not a "previously green invariant" and does not bear on this acceptance. It
belongs to its own unit.

### What the member now sees that they did not

Ten of eleven divisions carry a line naming what MAIA left open — `where this
begins`, `what kind of division this is`, `whether this is writing or apparatus`,
`another reading is nearly as good`. Beneath her account, three regions she could
not settle, in her own words. And the coverage sentence states that nothing she
read was shortened, and in how many passes.

**8b is now unblocked.** The founder is judging the reading MAIA actually made,
qualifications included, rather than the cleaner one the room used to produce.

---

## Board

```text
5½ reader                    PASS · CLOSED
8a harness                   PASS as instrument
8a render fidelity           GREEN on the three target items · accepted 6eacae5fb
8a item 11 (favicon 404s)    RED · app-wide, excluded from this mandate, own unit
8b founder semantic judgment UNBLOCKED — the room now shows the whole reading
6 adoption                   HOLD
```
