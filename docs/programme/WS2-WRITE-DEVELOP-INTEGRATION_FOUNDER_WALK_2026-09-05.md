# WS2 · WRITE ⇄ DEVELOP INTEGRATION — founder walk · witness record

> **Evidence FROZEN at `9c27572ce` on `claude/ws2-write-develop-integration`. Founder walk complete:
> nine steps PASS, one FAIL (compact-width navigation). The beta candidate is NOT accepted. The
> failure is a precisely bounded finding against this SHA; it does not retract what the other nine
> steps proved, and being "in the shell" does not exempt it from product acceptance.**

```text
UNIT        WRITE ⇄ DEVELOP integration — one Work, one Studio, two live modes
LANE        JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01
CANDIDATE   9c27572ce  (fix(ws2-integration): Keep a version checkpoints server truth, not a snapshot)
SUPERSEDES  1a01d9a56  REJECTED — preserved as defect evidence, not repaired, not deleted
CAPABILITY  2315c7994  07D proof (Gate A 25/25 · Gate B(a) 17/17 · v2 render PASS)
SHELL       2440e08a5  recovered WS2-03B Studio shell · FROZEN
GATE        scripts/ws2-keep-a-version-gate.ts → 10 checks · 0 failures on checkout 9c27572ce
WALK        founder, browser, live provider — §3
RESULT      9 PASS · 1 FAIL
STATE       EVIDENCE FROZEN · BETA CANDIDATE NOT ACCEPTED
```

## 1 · Why this walk exists

`1a01d9a56` was rejected mid-walk. Keeping a version built its checkpoint payload from
mount-time section bodies held in `useSectionWriting` rather than from server truth, and the act
that must alter nothing rewrote the Work: **496 → 485 bytes, headings gone, a leading space
introduced.** No sentence was lost, but all four sections then correctly superseded, because
supersession is content-digest based and the content had genuinely changed.

`9c27572ce` repairs that: `KeepAVersion` flushes pending autosave, waits for the surface to settle,
re-reads the draft (`loadDraft`), requires `sectionAddressable`, and checkpoints **the raw
`sections` the server returned** — never `content`, never `SectionWriting`, never a reconstituted
body array. A moved base is refused, not overwritten.

The founder ruled the damaged fixture frozen as evidence and the walk resumed on a **fresh** Work,
so that a successful no-op checkpoint could not be mistaken for preservation of an already-altered
state.

## 2 · The fixture

```text
DATABASE     maia_gatea_scratch   (UTF-8; carries the lane's migration chain)
MEMBER       ws207d-walk-d8f86a   74975465-4603-463e-8079-e620ace815ec
WORK         05a303f6-1f44-46d8-92e5-f1ab5fb68c05  "The Lantern Road (v2 decline fixture)"
SEEDED       2026-09-05T03:18:20Z  (2026-09-04 23:18 local)
SEEDER       scripts/ws2-07d-seed-v2-decline-fixture.ts, from 7aee9a892 on
             claude/ws2-07-f1-semantic-boundary-repair — materialized UNTRACKED, not committed here
```

The seeded Development reading is **constructed** rendering evidence: its declined observation was
authored by the script, its reader and classifier are `walk-fixture-model`. It stands beneath the
live Structure reading in the same table and is distinguishable by provenance alone.

`maia_consciousness` could not host this walk: its migration chain is wedged at
`20260830000003_manuscript_structure_contiguity.sql`, which does `ALTER TABLE … ADD CONSTRAINT`
with no guard against a constraint that database already carries. Everything after that file —
including `section_partition` — never applies there. Separate unit; not repaired here.

## 3 · The walk, as observed

```text
1  WRITE · edit a section, autosave                                      PASS
2  DEVELOP · seeded reading renders; o2 declined, nothing in the
   label position; o1 and o3 keep their labels                           PASS
3  supersession · scoped to Section 1 "Arrival" by digest; o1
   Superseded, o2 and o3 remain Current                                  PASS
4  premature reread · refused at capture: revision_not_current,
   member-legible, with the Keep a version link                          PASS
5  Keep a version · "version kept"; Versions 1 → 2; heading, both
   paragraphs and the founder's added line byte-intact                    PASS
6  DEVELOP · new Structure reading lands; the seeded Development
   reading retained, its Superseded notice and its decline intact         PASS
7  Closer 1 · retrieval by identity — GET of the reading id,
   10.4 kB in 315 ms, no POST; o7 still unlabelled                       PASS
8  Closer 2 · privacy boundary — see §5                                  PASS
9  Closer 3 · phone width — see §6                                       FAIL
```

Step 4's refusal is the member contract the founder specified after Gate B attempt 1: *MAIA reads a
kept version of the Work.* The Develop room performs no act that changes the Work; the act that
clears the refusal lives in the Writer Canvas and the refusal names it.

## 4 · What the walk produced, recorded separately

Two findings were produced en route and are recorded against this same SHA in their own files:

- `WS2-07-BUILD-07D_NATURAL_DECLINE_2026-09-05.md` — the lane's first unprompted classifier decline.
- `WS2-07-BUILD-07D_LENS_DIFFERENTIATION_2026-09-05.md` — Structure returning observations disjoint
  from Development's.

## 5 · Closer 2 — the privacy boundary

With no session (`/api/members/me` → `401 NO_IDENTITY`):

```text
GET  …/readings/acda940f-bee8-411c-acfe-88bb4abb96e2      401
GET  …/manuscripts                                        401
GET  …/readings                                           401
curl  the develop page, grepped for Work content           0 matches
```

The page renders one line — *"DEVELOP · Readings of your work open only to you. Sign in to enter."*
No Work title, no lens name, no observation count, no readings-list entry. An unauthenticated
visitor cannot learn that this member has a Work at that id, let alone what MAIA found in it.

Both the reading route and `me` gate on `getMemberIdFromRequest`, which accepts only an
`auth_sessions`-backed token and rejects a mismatched `x-member-id` as impersonation.

## 6 · Closer 3 — FAIL · compact-width navigation

Content integrity at phone width is sound: header stacks, readings list, commission form,
observation text, RESTS ON and DOES NOT ESTABLISH all render complete and unclipped.

The navigation is not. `app/writers-studio/studio/WriterStudioShell.tsx:118`:

```tsx
{!compact && (
  <StudioModeBar … />
)}
```

At compact width the five-mode bar is removed outright with nothing in its place. The rail persists,
so DEVELOP → WRITE remains possible via **Manuscript**. The reverse does not: DEVELOP is a *mode*,
not a rail destination — `STUDIO_MAP` has no `develop` entry, by design — so **from WRITE at phone
width there is no door to DEVELOP at all.**

Stated plainly: the walk recorded above cannot be performed on a phone. Founder ruling
(2026-09-05): **beta-blocking** under the current beta scope, whose loop is
*write → develop → encounter → revise → return*, and for which narrow-width usability was an
explicit closer. A failed acceptance condition is not silently converted into a known limitation;
de-scoping to desktop-only would require an explicit programme amendment. Repair, not narrowing.

## 7 · A second finding — intermittent `classifier_foreign_field`

One Structure commission refused at classify with `classifier_foreign_field`. The next
member-initiated commission succeeded and produced the reading in §4. Classification:

```text
intermittent classifier protocol-conformance failure
refused safely · nothing corrupt stored · next commission succeeded
```

`classifier_foreign_field` fires when the classifier's **tool payload carries an unexpected key**
(`lib/manuscript/developmentalReading/classify.ts:161,170`) — not when an observation falls outside
the phenomenon family, and not when the classifier honestly declines. The member-facing copy
(`app/writers-studio/develop/DevelopRoom.tsx:81`) said *"What MAIA noticed could not be named within
her vocabulary"* — a description of the `unclassifiable` path, which under reading contract v2 does
not refuse at all but keeps the observation with the phenomenon omitted. **The member was told
something untrue about what happened.** Founder ruling: beta-blocking; hard refusal unchanged; no
retry policy; copy corrected by refusal identity.

The offending key is unrecoverable for this occurrence. Per 07C a refusal at any stage stores
nothing, the `detail` string is returned in the response body only
(`readings/route.ts:127`), and nothing logs it. DevTools was not open on that request. No guess is
recorded here.

## 8 · What this record does NOT establish

- **Not production.** Local dev server, `maia_gatea_scratch`, one member, one four-section Work.
- **Not multi-member.** Nothing here tests concurrent writers, shared Works, or Co-Lab scoping.
- **Not durability at scale.** Two readings, two revisions, four sections.
- **Not the other three modes.** EXPLORE, REVIEW and PUBLISH are visible and unavailable, and remain
  unauthorized.
- **Not a claim about classifier frequency.** One decline and one protocol failure are each a single
  observation.
- **Not acceptance.** Three beta blockers stand: compact-width navigation, the false
  classify-refusal copy, and raw UUIDs in member-facing MAIA prose (07B origin).

## 9 · State

```text
9c27572ce       EVIDENCE FROZEN · founder walk complete · one genuine FAIL
BETA BLOCKERS   compact-width navigation
                false classifier-refusal copy
                raw UUIDs in member-facing MAIA prose
ARCHITECTURE    no new architecture required
OTHER MODES     not authorized
```
