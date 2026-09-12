# The three-act founder witness — result

**Lane** JARVIS — DEVELOPMENTAL CREATIVE INTELLIGENCE 01
**Run** founder's machine, 2026-09-12, ~11:45–11:55 EDT
**Subject** `df9eb0f38` (code byte-identical to `f06979ca2`; the delta is this
procedure document)
**Runtime** `npx next dev -p 3100`, `WRITERS_STUDIO_FOCUS_ENABLED=1`
**Database** `maia_focus_witness`, a `createdb -T` clone of local
`maia_consciousness` (526 migrations) + `20260912000001_focus_crossing_acts.sql`
**Work** *Elemental Alchemy*, 174 sections, 0 kept versions

```text
ACT 1   NOT ANSWERED
ACT 2   PASS
ACT 3   FAIL — cause located
production   UNTOUCHED · Focus tables absent on minisforum (verified)
manuscript   UNCHANGED · nothing disclosed to MAIA
```

---

## Preflight — four findings, all environmental, all caught before the witness

⭐ The preflight earned its place: every one of these would have produced a
false result, and two would have produced a false GREEN.

| # | finding | disposition |
|---|---|---|
| 1 | `~/MAIA-SOVEREIGN` was detached at `35b0f61d0` (a voice-lane commit). The dev server answering `401` was running code that predates every commit in this lane. | ⭐ **A false green.** A preflight that proves the flag but not the COMMIT proves very little. Fixed by detached checkout of the tip SHA; a commit-identity step is now owed in the procedure. |
| 2 | `npm run dev` is `env -u DATABASE_URL next dev` — it DELETES the variable, so the procedure's stated database guarantee was impossible under its own command. | ⭐ **Instrument defect.** Recorded and corrected in `df9eb0f38`: call `next` directly, and prove the connection with `pg_stat_activity`. |
| 3 | An empty witness database cannot serve this witness (`context_disclosure_receipts` → `runtime_consent_state`, and Act 1 needs real Works). | Procedure defect. Corrected to a `createdb -T` clone. |
| 4 | `.env.local` held **3** `ANTHROPIC_API_KEY` lines / **2** distinct values; and `.env.development.local` — which has HIGHER precedence — holds the operative one. | Deduped to the value already in effect (backup at `.env.local.bak`). ⚠️ The operative key in `.env.development.local` was never authenticated, because Act 3 failed upstream of any model call. |

Also found: port `3100` was held by a stale server (its `404` was mistaken for a
flag failure), and a second stale server on `3010` was still pointed at the real
dev database.

---

## Act 1 — NOT ANSWERED

Not performed. The label opened during Act 2 navigation was `recurrence`, which
is one of the three ordinary-language labels and does not test the question.

⛔ **Renaissance Test 3 therefore remains OPEN.** The act is owed, against a
hard label: `positional asymmetry` · `register shift` · `prospective reference`.
`NOT ANSWERED` is recorded as itself and must not be read as a pass.

---

## Act 2 — PASS

`work with this` on observation `o1 · recurrence` of *Elemental Alchemy* landed
in the Canvas with the Focus band rendered:

```text
FOCUS  o1 · recurrence
5 places in focus · 2 ready for MAIA · 2 need confirmation · 1 no longer here
no place chosen yet — click one to work on it

!  §45  "PERSONAL ANECDOTE: TENDING THE CAMPFIRE", a passage
!  §56  "THE CAMPFIRE METAPHOR", a passage
✓  §57  "THE PRESENT MOMENT"
✓  §58  "SUSTAINING THE FIRE"
!  §62  "THE GLOWING EMBERS", a passage

3 OF 5 CANNOT BE VOUCHED FOR
```

| # | obligation | observed |
|---|---|---|
| 1 | the Develop observation unchanged | ✅ |
| 2 | no model call from the gesture | ✅ |
| 3 | no manuscript write | ✅ `Versions kept —` |
| 4 | exactly the declared anchors, no neighbours | ✅ five, all campfire-cited |
| 5 | historical origin identifiable | ✅ `o1 · recurrence` |
| 6 | **no active edit target invented** | ✅ *"no place chosen yet"* |

⭐ **The readiness line is TRUE of this Work, not an artifact.** *Elemental
Alchemy* has zero kept revisions, so `currentRevision` is null and the ranged
anchors' currency genuinely cannot be established. Unknown resolving to
`unverified` rather than to `current` is the designed fallback, working on real
data: *an unknown presence is not an absence, and an unknown revision is not
a current one.*

> **Develop stays historical; Focus becomes current.** Witnessed.

---

## Act 3 — FAIL. The attempt is preserved, not patched

Two deliberate presses, 8 seconds apart, with no active target chosen (lawful
under P3). Both returned:

> *"I couldn't safely bring this Focus into MAIA. Nothing from this Focus was
> sent in this attempt."*

### The evidence

```text
context_disclosure_receipts (boundary writers_studio.focus->maia_cognition)
  attempted  section  6313036b-4ad2-44ff-baae-c90ed468dc80  11:52:12
  attempted  section  c9234752-b5bb-4fca-8ed5-83992047166d  11:52:12
  attempted  section  6313036b-4ad2-44ff-baae-c90ed468dc80  11:52:04
  attempted  section  c9234752-b5bb-4fca-8ed5-83992047166d  11:52:04

focus_crossing_acts     0
runtime_consent_state   667
```

Four receipts, one per readable member per press, **all `attempted`, none
`crossed`**. So the boundaries were established and `may_cross` passed; the
bodies then could not be read; `participation.readable` fell to 0; and the
crossing refused **before** the act record — which is why `acts = 0`.

⭐ **The refusal architecture behaved correctly.** Nothing was disclosed, the
receipts stay truthfully `attempted`, no act was recorded, and no MAIA turn was
produced. The fail-closed provenance rule held.

### ⭐⭐ ROOT CAUSE — a section-identity namespace mismatch

```text
frozenReading.ts:127     FROM manuscript_draft_sections   ← the evidence's ids
assembleFocus.ts:18,26   FROM manuscript_sections         ← what the crossing reads
focusPresence.ts:41      FROM manuscript_sections         ← same mismatch
```

The Focus Set carries **draft** section ids. The assembler resolves them against
the immutable **Source** table. Proved on the witness database:

```sql
in_source | in_draft
        0 |        2
```

Both readable members exist in `manuscript_draft_sections` and in neither row of
`manuscript_sections`. The divergence is threefold: different table, different
body column (`text` vs `body`), and a different owner join (`member_manuscripts`
vs `manuscripts`).

⛔ **This is the `canvasIdentity` class: a link is not a binding.** The assembler
was written for the earlier single-scope crossing against a different substrate,
and the Focus Set was joined to it without either side asserting they addressed
the same sections. Every test passed because both halves were injected.

⛔ **NOT REPAIRED, and deliberately.** Which substrate the crossing should read
is a ruling, not a fix: the draft is what the writer is editing; the Source is
immutable and is what the frozen reading was taken against. Choosing wrongly in
either direction changes what "the current text" means for every future
RevisionProposal.

### ⛔ Two diagnosability defects of mine, exposed by this run

**(1) Six failures, one sentence.** The consent precondition, a refused
boundary, zero readable members, an unconstructable participation, an
unrecordable act, and a handoff that never began all present as
`did_not_cross_unsafe`. That is the Step 7 `unreachable` finding rebuilt in a
new place.

**(2) Worse: the log said nothing.** `assembleFocus` returns `null` on an EMPTY
RESULT SET without logging — it logs only on a thrown exception. So no server
log named the cause, and this was found only because the receipts were queried
by hand. *A boundary that cannot say why it refused makes every future failure
cost an afternoon.*

Both repairs are owed. Neither was made during the witness.

### Other findings, logged not fixed

```text
ASK MAIA INPUT INK        ⭐ REPAIRED MID-WITNESS (7e9791f00), disclosed.
                          The field carried no `color`; an <input> does not
                          inherit one, so the writer's question was black on
                          #1A1513 — invisible as they typed it. It blocked the
                          witness from being performed at all, so it was
                          repaired rather than worked around, and the run that
                          exposed it is preserved above.

FOCUS MEMBER STATUS UI    semantics preserved in the count line and the
                          backend; the member-level glyph `!` conflates
                          `unverified` with `no longer here`.
                          UX repair owed · did not affect Act 3.

ACCESS MATRIX             /api/writers-studio/focus is UNDECLARED in
                          config/accessMatrix.ts and passed only because
                          unmapped routes are currently allowed (Mode A). The
                          route's own authorization held — 401 unauthenticated
                          — so nothing was exposed. DECLARED-vs-ENFORCED gap;
                          owed, not touched.
```

---

## What this run established, and what it did not

**Established.** The Focus Set model works end to end up to the substrate read:
a historical developmental finding becomes five declared current places with
their origin intact, membership stated independently of readability, no edit
target invented, and a refusal that discloses nothing and records nothing when
it cannot proceed.

**Not established.** Whether MAIA can hold a distributed Focus and know what she
cannot see. ⛔ No model was called. **The decisive observation of this lane
remains UNWITNESSED**, and the credential that would have served it remains
unauthenticated.

```text
NEXT   founder ruling: which substrate does the Focus crossing read?
THEN   re-run Act 3 · then Act 1 against a hard label
HELD   RevisionProposal · staged diff · manuscript mutation · write authority
       · production activation
```
