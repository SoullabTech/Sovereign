# JARVIS — IDEAS T1 CANONICAL INTEGRATION — 01

## UNDERSTAND

```text
PHASE          UNDERSTAND
AUTHORIZATION  UNDERSTAND — authorized · BUILD NOT YET
RULING TESTED  semantic dependency, narrow: count/progression + stance/Distill
VERDICT        ruling CONFIRMED on all four claims, with one refinement
DATE           2026-09-02
```

The question is no longer *can the four T1 commits be patched onto canonical*
(FIND answered no). It is: **what is the smallest semantic runtime substrate
canonical must possess so the ratified T1 instrument observes the same real
seams and the same member act it was designed for?**

---

## 1. `context_read_count` — SEMANTIC PREREQUISITE · CONFIRMED

The stage vocabulary in the frozen instrument carries it as a first-class stage:

```text
lib/ideas/attemptInstrument.ts (eb0a7af)
  57  'context_read_blocks',
  58  'context_read_decision',
  59  'context_read_reflections',
  60  'context_read_count',
```

And it wraps a **real DB read**, not a derived value:

```sql
-- app/api/ideas/[id]/ask-maia/route.ts:232 (eb0a7af)
runStage(attempt, 'context_read_count', 'db_read', () =>
  SELECT COUNT(*)::text AS count
    FROM member_idea_blocks
   WHERE idea_id = $1 AND block_type = 'maia_reflection')
```

**Canonical has no such read.** What canonical does have is a *different* count
for a *different* purpose:

```text
app/api/ideas/[id]/ask-maia/route.ts:188-205 (a4305f4)
  // Count member blocks created AFTER the most recent naming_fired event.
  priorTurnCount: Math.max(0, recentBlocks.length - 1)
```

That is a **block** count over a naming window, computed in memory from an
already-fetched array. The T1 stage names a **reflection** count, read from the
database as its own query, feeding progression. They are not the same seam and
one cannot stand in for the other.

The three alternatives on a bare canonical are each disqualifying, exactly as
ruled: a fabricated seam is false instrumentation; a query added only so T1 has
something to log is observability changing runtime to satisfy itself; and
dropping the stage is no longer the ratified contract.

**Confirmed: the count/progression substrate must exist before T1.**

---

## 2. Per-turn stance / Distill — SEMANTIC PREREQUISITE · CONFIRMED

**Canonical has zero stance handling** — no parse, no validation, no pass-through,
no persistence. Searching canonical's ask-maia route for `stance` returns nothing.

The frozen route treats it as a real member act with a real refusal:

```text
app/api/ideas/[id]/ask-maia/route.ts (eb0a7af)
  145  let stance: IdeaStance | undefined;
  151  if (!isIdeaStance(body.stance))
  152      return 400 'Unknown stance'
  161  attempt.stance = stance ?? null;
  268  stance,                      → passed to the reflection primitive
  331  // nothing here makes the stance sticky for the next call
```

A port whose `stance` is permanently `null` would pass tests while instrumenting
a different member act than the specification names. **Confirmed.**

---

## 3. The Cut 1 exclusion is SAFE — and the schema axis is where it could have broken

The risk in excluding Cut 1 was that stance persistence might depend on the
naming migration. **It does not.** Every column that migration adds is naming
machinery:

```sql
-- 20260902000001_member_idea_seed_and_title.sql
ALTER TABLE member_ideas
  ADD COLUMN seed, seed_block_id, title_source,
             proposed_titles, proposed_titles_at
  + member_ideas_seed_block_fk, member_ideas_title_source_check
```

Nothing stance-related. Stance rides in the **existing** `metadata` JSONB column
on `member_idea_blocks`, which canonical already writes today:

```text
canonical  INSERT INTO member_idea_blocks (…, metadata) VALUES (…, $4)   :237
frozen T1  INSERT INTO member_idea_blocks (…, metadata) VALUES (…, $4)   :347
```

**The prerequisite unit therefore needs no migration at all**, and the T1 delta
adds none either (verified: zero migration files in `2c7f7e3..eb0a7af`).

`lib/team/maiaThreadReflection.ts` in `b03f97c` is likewise **stance-only** —
zero title/seed lines. Clean separation.

Consequence, as ruled: **`lib/team/maiaTitleProposal.ts` leaves the integration
problem entirely.** The non-allowlisted direct `@anthropic-ai/sdk` import that
FIND located needs neither repair nor allowlisting to ship T1. It was only ever
entangled because `b03f97c` bundled Cut 1 and Cut 2 in one historical commit,
and historical bundling is not binding on us.

---

## 4. REFINEMENT — the exclusion is clean at file level everywhere except one file

`b03f97c` touches 16 files. Fifteen separate cleanly by path. One does not:

```text
app/maia/ideas/[id]/page.tsx      +248 lines
  stance-bearing added lines       23
  title/seed-bearing added lines   57
```

This single file carries **both** the Cut 2 Distill/stance UI and the Cut 1
naming UI. Excluding Cut 1 here requires **hunk-level** separation, not file-level.

That matters because this is precisely where lookalike risk lives: hand-separating
UI hunks is the one step in this integration where a reconstruction can silently
diverge from the ratified member act — and the member act (`write → choose
Distill → ask`) is what T1 exists to observe. DECIDE should name this file
explicitly as the one surface requiring hunk-level adjudication and a stated
acceptance test, rather than letting it ride inside a general "exclude Cut 1".

---

## 5. `3085b46` — HARNESS ONLY · CONFIRMED, and half of it is excluded

The entire commit is two deleted lines:

```text
lib/maia/__tests__/ideaStances.test.ts        -import { … } from 'vitest';
lib/team/__tests__/maiaTitleProposal.test.ts  -import { … } from 'vitest';
```

Zero runtime change. And the second file is a Cut 1 test, already excluded — so
**only the `ideaStances.test.ts` line travels**, exactly as ruled: make the stance
test Jest-loadable, do not carry the title-proposal test because it shared a commit.

---

## 6. The rest of `2d27c82` — not automatically admitted · UPHELD

That commit also carries the 12k composer limit, visible save errors, larger
context windows, prompt excerpting, Reflect/Ask presentation changes, and
anti-loop behavior beyond the count read. T1 dependency authorizes none of it
wholesale. Only what the ratified T1 runtime requires to be truthful enters the
prerequisite; anything else needs its own proven dependency.

---

## 7. Boundary, as tested

```text
T1 SEMANTIC SUBSTRATE — REQUIRED
  ✓ real reflection-count read (its own query, not a derived array length)
  ✓ count drives progression as real application behavior
  ✓ per-turn stance vocabulary (lib/maia/ideaStances.ts)
  ✓ Distill available to the member
  ✓ stance sent on exactly one Ask request, never sticky
  ✓ unknown stance refused (400)
  ✓ stance passed to the reflection primitive
  ✓ chosen stance recorded in reflection metadata (existing JSONB column)
  ✓ plain Ask MAIA remains no-stance/default

EXCLUDED — verified separable
  ✗ seed/title separation
  ✗ proposed titles · title ratification UI
  ✗ lib/team/maiaTitleProposal.ts        (and its test)
  ✗ app/api/ideas/[id]/suggest-title/route.ts
  ✗ 20260902000001_member_idea_seed_and_title.sql  (+ rollback)
  ✗ composer/error redesign unless dependency is proven
  ✗ the T1 instrument itself

MIGRATIONS REQUIRED
  none — prerequisite and T1 both ship against existing schema
```

---

## 8. Why the split must hold

T1's founding claim in the ratified spec is that **it fixes no fault and changes
no member-visible behavior.** Landing reflection progression and Distill in the
same commit as the instrumentation destroys the ability to prove that claim —
the diff would contain member-visible change by construction.

```text
PREREQUISITE UNIT     count/progression + Cut-2 stance semantics
                      member-visible change: YES, and proven on its own terms
        ↓ canonical merge
T1 UNIT               instrument that existing runtime
                      member-visible diff: ZERO, and now provable
```

---

## 9. Anti-lookalike binding, carried into DECIDE

The three T1 proof suites and `tsconfig.t1.json` transfer **byte-for-byte** from
`eb0a7af` unless canonical path aliases alone force a mechanical change. Beyond
"103 tests pass", assert against the frozen contract as reference:

```text
15 stage names          exact
error-class vocabulary  exact
record allowlist        exact
attempt-id semantics    exact
runtime-revision ladder exact
C3 behavior             unchanged / still observable
member response bodies  unchanged
```

This makes the frozen contract authoritative rather than permitting tests to be
rewritten until a new implementation looks green.

---

## 10. Phase verdict

```text
UNDERSTAND              COMPLETE
RULING                  CONFIRMED — semantic, and narrow
NEW FINDING             page.tsx requires hunk-level, not file-level, exclusion
SCHEMA                  no migration needed by either unit
HAZARD                  maiaTitleProposal.ts leaves the problem entirely
NEXT                    DECIDE — freeze the prerequisite surface
BUILD                   NOT YET
```

Held: 500 reproduction · T2 · C3/C5 · Cuts 3–4 — not entered.
