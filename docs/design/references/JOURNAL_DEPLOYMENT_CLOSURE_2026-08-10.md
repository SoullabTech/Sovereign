# Journal Deployment Closure

**Standing:** ✅ **JOURNAL ROOM — FOUNDER EXPERIENCE ACCEPTED, deployment corrections pending.**
**Mandate:** JOURNAL DEPLOYMENT CLOSURE (founder, 2026-08-10) — no new features, no redesign.

---

## −1. FOUNDER EXPERIENCE ACCEPTANCE (2026-08-11)

> **Journal has earned `/journal`.** The question is no longer *whether this should be
> Journal*. It is *preparing the accepted Journal to replace the old one*.

Accepted on candidate **`79fd8e911`**, walked at 1280 · 768 · 375. The decisive
evidence was **not** that every visual detail is finished, but that the essential
states hold:

- arriving invites writing
- writing gets out of the way
- keeping returns you to your own words
- MAIA attends rather than takes over
- Return feels like continuity rather than recommendation
- Browse feels like pages rather than records
- an almost-empty journal still feels complete

⚠️ **Acceptance is of the EXPERIENCE, not of the current pixels.** Four corrections are
ruled below. Acceptance also **does not** authorize deleting capabilities members
already have (§−1.4).

### −1.1 Material: ivory, not navy — **ruled**

> navy = an evening room in which writing is **displayed**
> ivory = a surface on which writing **happens**

Journal's primary human activity is **inscription**, and the material must reinforce
the activity. Journal's primary material becomes **warm ivory / paper with charcoal
literary type**.

⛔ **This does not make Soullab ivory.** Ivory is **Journal-specific material
language**; the deeper House grammar stays shared. Navy was not wrong — the walk
established it as coherent — it is simply the wrong material for this activity.

**KEEP, unchanged:** serif typography · 34rem reading/writing measure · charcoal
literary type · ember/amber gestures · restraint · absence of cards · quiet metadata ·
MAIA at the edge · generous space · existing interaction hierarchy.

**No redesign.**

### −1.2 Desktop composition: fix the axis, not the emptiness — **ruled**

⛔ Do **not** fill the desktop · do **not** add glass boxes · do **not** widen the
writing measure.

Give the room **one compositional axis**, so the emptiness has an organizing
relationship to the writing. Bounded correction, not another design pass.

*Mobile being strongest is evidence the architecture is sound* — the wide canvas
simply needs intentional composition.

### −1.3 Green "Audio enabled" toast: suppress inside Journal — **ruled**

A saturated green `z-index:99999` system notification in the middle of a
contemplative writing environment is exactly what an inhabitable architecture must be
able to suppress contextually.

**Scoped as a HOUSE correction, not Journal candidate work:** on Journal's inhabitable
writing/reading surfaces, do not inject the global *"Audio enabled"* toast into the
room. ⛔ Do **not** redesign the audio system in this unit.

**Floating MAIA handle and bug-report button: OBSERVE, do not remove.** The toast is
the demonstrated severe intrusion; one clear finding must not become a global-chrome
redesign.

### −1.4 ⚠️ Browse continuity — blocks cutover

The new Browse does **not** preserve the old `/journal` access to:

```
Search · Captures · Scribe · Changes · Decisions
```

**Acceptance of the room does not authorize silently deleting those capabilities.**
They belong **behind Browse, not back on the front door** — the writing-first arrival
is preserved.

### −1.4b ⚠️ Data-layer custody collision, 2026-08-11 — evidence preserved, not deleted

While testing Browse continuity, an entry surfaced in `walk.878`'s corpus that this
session never wrote:

```
id:      dd06a46f-fe8b-452a-a39d-d8c1c6596e7d
member:  walk.878 (842acb0f-43e0-47ae-bcee-21e8b3a058de)
source:  journal_room
type:    day
created: 2026-08-11 08:49:21.274099-04
content: "CUTOVER PROOF 4c19 — written through /journal after the cutover."
```

**Preserved in place on founder ruling — this is evidence, not residue.** Deleting it
now would improve the fixture aesthetically while destroying the clearest record that
an isolated worktree was not actually isolated at the data layer.

**Corroborating signal:** two new entries appeared in `.claude/launch.json` mid-session
— `journal-cutover` and `journal-candidate` — pointing at worktrees under a different
session's scratchpad path, never created by this lane.

**Ruled out, by direct read:** the shared checkout's `app/journal/page.tsx` is
unchanged — still `UnifiedJournalView`. No cutover happened *there*. Whatever wrote
this entry did so from an isolated worktree, against the **same shared local
Postgres** this lane's fixture depends on. Git isolation protected the code; nothing
protected the data.

**Governance check, via Builder OS control plane** (`session.mjs status`, not by
inspecting the other worktree's source — per standing ruling):

```
Governed sessions: 2 total — neither Journal-related.
  s-90e108c2  jarvis-route-a-sub-a-registry   (unrelated, STALE)
  s-e840e30a  hook-execution-closure          (queued, unrelated)

No claim, work unit, or override references Journal deployment, /journal
cutover, journal-cutover, or journal-candidate anywhere in the registry.
```

⚠️ **This lane (`feature/journal-deployment-closure`) is also absent from the Builder
registry** — it was never opened via `session.mjs open`. Recorded honestly rather than
omitted: by Builder OS's own accounting, both lanes are currently ungoverned. Absence
from the registry is not proof a lane lacks authority (a founder ruling could exist
outside this instrument's visibility) — it is the best available control-plane check,
and it found nothing for either side.

**Standing: `CUTOVER LANE AUTHORITY: UNKNOWN / UNVERIFIED`.** No claim, ruling, or
transfer record establishes the other lane's authority. Per founder ruling: *until
governance evidence says otherwise, this lane remains the authoritative Journal
deployment lane.*

**Separately observed, not folded into this finding:** the local request-rate
instrument read `ANOMALOUS` (9.56× baseline, 5-minute window) during this check. Per
standing discipline (established elsewhere this session): *anomalous ≠ causal
explanation.* Recorded as an observation, not treated as evidence about the cutover
collision.

**Consequence:** the founder walk does not resume against `walk.878`. See
`SHARED_LOCAL_DATABASE_CUSTODY_RACE_2026-08-11.md` §6 for the fresh isolated fixture
used instead.

### −1.4c Final walk — passed, on an isolated fixture

**Fixture:** `journal.deploy.250d08714.f857eb`, created solely for this walk, seeded
with exactly 3 entries (2 for the anniversary/Return rule, 1 spacer), zero rows
before, four after (3 seed + 1 written live during the walk), one capsule created
(correctly `sourceType: 'journal'`, correctly excluded from Browse's Captures).
**Retired immediately after** — member, entries, capsule and session all deleted;
confirmed zero rows remaining under that username.

**Candidate walked:** `250d08714` (Slice 2 + Browse continuity + audio-toast House
correction, all three committed).

| Check | Result |
|---|---|
| Writing feels primary | ✅ arrival opens on the question; writing surface has no chrome |
| Paper material holds | ✅ ivory field, charcoal ink, ember gesture — unchanged from Slice 2 |
| Single axis holds | ✅ measured: all top-level columns share one left edge at 1280 (368), 768 (112), 375 (24) |
| Browse continuity intact | ✅ writing default, 4 kept entries listed correctly, Captures/Scribe/Changes/Decisions reachable via "Also here" |
| No global toast intrudes | ✅ confirmed suppressed on arrival via rendered-DOM check (not the earlier false script-text match); confirmed still shown on `/maia` |
| Reflect works | ✅ live `/api/journal/reflect` response — MAIA noticed/asked, both grounded in the entry's own words |
| Return works | ✅ anniversary rule fired correctly on the seeded one-year-back entry; `Why this?` disclosed the literal rule |
| Mobile/tablet/a11y clean | ✅ 0 contrast failures, 0 tap-target failures, no overflow at 375/768/1280 |

**Result: PASS.**

### −1.4d ❄️ FROZEN (founder authorization, 2026-08-11)

```
JOURNAL CANDIDATE:  250d08714 (full: 250d08714928707f829e42cce1cafba3aa44f37b)
TAG:                journal-candidate-frozen-250d08714
STATUS:             FOUNDER EXPERIENCE ACCEPTED
                     DEPLOYMENT CORRECTIONS COMPLETE
                     FINAL WALK PASSED
                     FROZEN FOR CUTOVER
```

⛔ **Do not modify accepted Journal behavior unless the cutover exposes a genuine
deployment blocker.** This is integration, not design. See §2 onward for the cutover
unit.

### −1.5 Authorized path

```
79fd8e911  EXPERIENCE ACCEPTED
      ↓
Journal Slice 2 — ivory material · desktop axis · Browse continuity
      ↓
House correction — suppress Audio toast in Journal
      ↓
FINAL FOUNDER WALK
      ↓
FREEZE → /journal CUTOVER → PR → MERGE → DEPLOY → PRODUCTION WALK
```

⛔ **No new Journal functionality beyond preserving what members already have.**

---

## 0. JOURNAL DEPLOYMENT CUSTODY RULING (founder, 2026-08-11)

> **The custody line is now explicit.** It was settled by ruling rather than by
> whoever committed next — which is how the first collision happened.

| | |
|---|---|
| **Authoritative candidate** | `79fd8e911` |
| **Deployment custody** | `feature/journal-deployment-closure` |
| **Worktree** | `/Users/soullab/maia-wt-journal-closure` (isolated) |
| **All other Journal lanes** | **READ-ONLY** with respect to candidate files until custody releases |

This lane owns the candidate **through founder walk, cutover preparation, PR, and
merge.**

### Files other lanes may not modify while custody holds

```
app/journal/room/**
components/journal/room/**
app/api/journal/reflect/**
lib/journal/return.ts
lib/journal/__tests__/return.test.ts
candidate contracts / reference evidence
cutover files once opened
```

Other lanes **may** preserve unrelated work separately — e.g. the uncommitted
`components/journal/QuickJournalSheet.tsx` change present in the shared checkout at
the time of this ruling. That file is **not** in the candidate set.

### Authorized sequence

1. **Founder walk** on exact candidate `79fd8e911` — fixtures: **≥3 kept entries, at
   least one with a qualifying historical date**, so Return is meaningfully exercised.
2. Founder decides: room feels right · navy/space composition accepted, **or an exact
   correction named**.
3. If accepted → **FREEZE candidate.**
4. Open bounded `/journal` cutover unit **in this same custody lane**.
5. Prove: `/journal` → accepted room · existing data preserved · write/keep · Browse ·
   existing entry opens · Reflect · Return · mobile/tablet/a11y regressions = 0.
6. Open normal PR.
7. **STOP before merge/deploy** unless separately authorized.

### On the corrections in this record

Founder ruling, recorded verbatim in substance: *the repeated corrections are a
strength of the record, not an embarrassment. The final candidate is more trustworthy
because the false defect, wrong runner, wrong probe, and wrong assumptions were
withdrawn instead of turned into fixes.*

⚠️ This is the standard the cutover unit inherits: **a withdrawn claim is a better
outcome than a fix applied to working code.**

---

## 1. Custody — established

| | |
|---|---|
| **Candidate SHA** | **`79fd8e911`** *"fix(journal): accessibility corrections from the e8a23efe7 measurement pass"* |
| Worktree | `/Users/soullab/maia-wt-journal-closure` — **isolated, not the shared checkout** |
| Branch | `journal/deployment-closure` |
| Working tree | clean, 0 uncommitted |

Custody is held in a dedicated git worktree. That is the structural remedy for
[`SHARED_CHECKOUT_SOURCE_CUSTODY_RACE`](../../ops/SHARED_CHECKOUT_SOURCE_CUSTODY_RACE_2026-08-10.md),
applied to the incident that produced it: this lane can no longer sweep, or be swept
by, another lane's uncommitted work.

⚠️ **The baseline moved during closure.** Custody opened at `e8a23efe7`; while
verifying, the other lane committed `79fd8e911` — accessibility corrections derived
from *this* session's measurement pass. Custody was fast-forwarded to it. **The
authoritative candidate is `79fd8e911`, not `e8a23efe7`.**

---

## 2. The Return defect — resolved, and it was not a defect

**Reported:** on clean HEAD, with a one-year-back fixture and no page errors, the
Return surface was absent from the DOM.

**Cause, proven:** `lib/journal/return.ts:103` —

```ts
// A journal with almost nothing in it has no past to return.
if (dated.length < 3) return null;
```

The probe fixture held **2** entries. The selector correctly declined.

**Proof, run against the real selector:**

```
2 entries (probe fixture) -> null   <-- explains the absent Return
3 entries (floor cleared) -> RETURNS id=anniv
```

**Verdict: intended behaviour, correctly implemented.** A journal with almost nothing
in it should not manufacture a past. ⛔ **No fix was made, and none is needed** — the
right response to a false defect is to withdraw it, not to change working code.

**Runtime confirmation on the candidate**, fixtures ≥3 including one exactly a year
back: Return **PRESENT** at 375, 768, 1024 and 1280.

---

## 3. Verification of the candidate

**Tests** — `npx jest --config jest.config.js lib/journal lib/navigation`:

```
Test Suites: 5 passed, 5 total
Tests:      79 passed, 79 total
```

including the Return suite at **17/17**, whose negative control swaps every entry's
text for noise and asserts the same entry returns — the control that proves the
selector is genuinely date-derived rather than merely claiming to be.

**Tablet / accessibility / layout**, measured on `79fd8e911`:

| Viewport | Return | Overflow | Contrast (AA) | Tap targets | Arrival gestures |
|---|---|---|---|---|---|
| mobile 375×812 | ✓ | none | 0 fail | 0 fail | stacked ✓ |
| tablet portrait 768×1024 | ✓ | none | 0 fail | 0 fail | stacked ✓ |
| tablet landscape 1024×768 | ✓ | none | 0 fail | 0 fail | stacked ✓ |
| desktop 1280×800 | ✓ | none | 0 fail | 0 fail | stacked ✓ |

Contrast measured on leaf text nodes with inherited opacity composited against the
canvas. Earlier measured-and-fixed defects (3 sub-44px targets; two arrival gestures
collapsing onto one line) do not recur.

---

## 4. Corrections owed by this session

Recorded because the record must not carry claims that were withdrawn:

| Claim I made | Truth |
|---|---|
| "My bulk edit deleted `selectReturnPiece`" | ✗ Another lane replaced it via `e8a23efe7`. |
| "`ReturnableRow` has a `createdAt` field seam" | ✗ `JournalRoom` maps `createdAt: r.created_at` correctly. |
| "The 17-test suite never runs — `describe is not defined`" | ✗ I ran **vitest**; the repo uses **jest**. 17/17 pass. |
| "Reduced motion is unhandled" | ✗ `globals.css` already handles it app-wide; my probe misread `0.01ms` as animating. |
| "Return is absent — a live defect" | ✗ Fixture below the documented 3-entry floor. |

Each was asserted from partial evidence and corrected on measurement. The tablet/a11y
findings that **did** hold were real, and the other lane acted on them in `79fd8e911`.

---

## 5. What remains

1. **Founder walk of `79fd8e911`** — desktop / mobile / tablet:
   write → keep → return → read → *Reflect with MAIA* → *Write from here*.
   ⚠️ The walk needs **≥3 kept entries, one dated a year back**, or Return will
   correctly show nothing and look broken.
2. **If accepted → FREEZE.**
3. **`/journal` cutover** as a separate bounded integration unit. `/journal` still
   serves the old `UnifiedJournalView`; `/journal/room` is the new experience. This is
   a real replacement of a live member surface.
4. PR → checks → merge → deploy → production walk.

**Not done, deliberately:** Room Character Register (recording a room while a second
lane was restructuring it would turn a transient state into apparent authority);
`/journal` cutover; merge; deploy.

**Still unresolved from Slice 1:** the House chrome question — the floating MAIA
handle and bug-report button appear inside the room for a signed-in member, which the
arrival state's specification excludes. A House-vs-Room ruling, not a Journal bug.

---

## 6. Open question for the founder

Two lanes have now worked this room without a claim between them. Before cutover,
**one lane should own it through merge.** This session holds `journal/deployment-closure`
at `79fd8e911` in an isolated worktree; the other lane continues in the shared
checkout (an uncommitted `QuickJournalSheet.tsx` change was present there at the time
of writing). That should be settled explicitly rather than by whoever commits next.
