# EDITORIAL-WRITE-01 — census and minimal design

**Status** CENSUS + DESIGN · no code · no migration file · nothing applied
**Specimen** o26 · `WITNESS-ALPHA` · §23 · working draft v34
**Opened by** founder act, 2026-09-13

> **Editorial decision** — *the Work should be handled this way.*
> **RevisionProposal** — *here is the exact change I am asking permission to make.*
> **Accepted mutation** — *the member authorized this exact change.*

---

## 1. ⭐⭐ THE CENSUS FINDING — the write already exists, and it is already version-bound

`lib/manuscript/sections/saveSection.ts` :: `saveSectionBody`

```text
FOR UPDATE on the draft row                     the lock exists
baseVersion mismatch → `stale_base`             compare-and-advance exists
                                                ⛔ refused, never merged
heading carried over untouched                  the server does not take the
                                                client's word for it
content derived from the sections themselves    in the same statement space
                                                the trigger will check
version = version + 1                           the advance exists
```

⛔ **So EDITORIAL-WRITE-01 does not build a mutation.** It builds the
**authorization in front of one**. Any new UPDATE against
`manuscript_draft_sections` would be a second write path with its own
version discipline to keep true — the defect this programme has now found five
times under other names.

## 2. What is genuinely missing

```text
MISSING   a durable proposal — what exact change, against what state
MISSING   a TEXT-bound precondition
MISSING   single-use acceptance — a proposal that cannot be replayed
MISSING   the staged diff the member actually consents to
```

### ⭐ Why the text precondition is not redundant with the version check

Every write path today bumps `version`, so *in principle* an unchanged version
implies unchanged text. The founder's acceptance requires **both** anyway:

```text
on acceptance
  same draft must still be v34
  exact token must still exist at the bound target
```

⭐⭐ **That is the FOCUS-W7 lesson applied before the fact.** W7's cognitive
idempotency held only because a uniqueness constraint in another subsystem
happened to collide first — a property nobody had decided. Here the same shape
is visible in advance: *"the text is unchanged"* would rest entirely on every
present and future write path remembering to bump the version.

```text
expected-text check    THE LAW          — this proposal names these characters
version check          DEFENCE IN DEPTH — and the Work has not moved
```

⛔ Either may refuse. Neither may be the sole guarantee.

## 3. The one operation

```text
DELETE EXACT TEXT

target        §23 draft section id
expected      "WITNESS-ALPHA"
replacement   ""
base          working draft v34
```

⛔ No `replace`, `move`, `merge`, `split`, `reorder` or `rename`. The proposal
vocabulary is discovered from manuscript work, not invented ahead of it — the
`CHECK (relation = 'governs')` discipline, applied again.

## 4. Proposed shape

```sql
CREATE TABLE manuscript_revision_proposals (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id          uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  work_id            uuid NOT NULL,

  -- ⭐ EXACTLY WHAT STATE THIS WAS BUILT AGAINST.
  draft_id           uuid NOT NULL,
  base_version       integer NOT NULL,

  operation          text NOT NULL CHECK (operation = 'delete_exact_text'),
  target_section_id  uuid NOT NULL,
  -- ⭐ THE LAW. Acceptance re-reads the Work and requires these characters,
  -- at this target, unchanged. A proposal is permission to make ONE EXACT
  -- CHANGE to ONE EXACT STATE — never general permission to achieve the same
  -- editorial intention somehow.
  expected_text      text NOT NULL CHECK (length(expected_text) > 0),
  replacement_text   text NOT NULL,

  -- Optional provenance: which ruling this implements, if any.
  decision_chain_id  uuid,

  created_at         timestamptz NOT NULL DEFAULT now(),
  -- ⭐ SINGLE-USE. Claimed by compare-and-set; a second acceptance finds it
  -- taken and refuses, exactly as the Focus act's ON CONFLICT does.
  accepted_at        timestamptz,
  resulting_version  integer,

  CONSTRAINT mrp_acceptance_whole CHECK (
    (accepted_at IS NULL) = (resulting_version IS NULL))
);
```

```sql
-- The claim, atomic and unrepeatable:
UPDATE manuscript_revision_proposals
   SET accepted_at = now()
 WHERE id = $1 AND member_id = $2 AND accepted_at IS NULL
RETURNING id;      -- zero rows ⇒ already accepted, or not this member's
```

## 5. The acceptance sequence

```text
1  claim the proposal          compare-and-set · zero rows → already_accepted
2  FOR UPDATE the draft        the existing lock
3  version = base_version      else `stale_base`                 DEFENCE
4  read the target section
5  expected_text occurs EXACTLY ONCE in it   else `expected_text_absent`
                                             or `expected_text_ambiguous`   LAW
6  apply · derive content · version + 1      THE EXISTING MECHANISM
7  record resulting_version on the proposal
```

⛔ **Steps 1–7 are ONE transaction.** A claim that committed while the write
failed would leave a proposal marked accepted that changed nothing, and the
member would be told their change was made.

⛔ **EXACTLY ONCE, not "found".** If `WITNESS-ALPHA` occurred twice, a naive
delete would remove the wrong one or both. A proposal that cannot say *which*
characters it means does not name an exact change.

## 6. Predeclared falsifiers

```text
EW-1   before acceptance the manuscript is v34 and the token is still present
EW-2   a proposal is visible and NON-EXECUTABLE — rendering it changes nothing
EW-3   acceptance at a draft that moved past v34 REFUSES as stale
EW-4   acceptance when the expected text is absent REFUSES — version alone
       never authorizes the write
EW-5   expected text occurring twice REFUSES as ambiguous
EW-6   after acceptance: v35 · WITNESS-ALPHA absent
EW-7   ⭐⭐ every other character of the manuscript is byte-identical
EW-8   exactly ONE write occurred
EW-9   the proposal cannot be replayed — a second acceptance refuses
EW-10  a proposal belonging to another member refuses, indistinguishably
       from one that does not exist
EW-11  ⛔ no second UPDATE path against manuscript_draft_sections is added
EW-12  the claim and the write are ONE transaction — a failed write leaves
       the proposal UNACCEPTED
EW-13  o26 can be re-evaluated against the current Work afterwards
EW-14  ⛔ recording or accepting a proposal writes NO standing and NO decision
```

### Mutations that must go RED

```text
P1  version check only, expected-text check dropped      → EW-4
P2  `indexOf` instead of exactly-once                    → EW-5
P3  acceptance claimable twice                           → EW-9
P4  claim committed separately from the write            → EW-12
P5  a new UPDATE path instead of the existing mechanism  → EW-11
P6  replacement applied to a re-derived target           → EW-7
```

⭐ **P1 is the load-bearing one.** It is the exact shape of FOCUS-W7: a
guarantee that appears to hold because a different subsystem refuses first.

## 7. ⛔ What is NOT in this lane

```text
replace · move · merge · split · reorder · rename
multi-section proposals
MAIA-authored proposals without member acceptance
general write authority
production
```

**One tiny deletion earns the boundary. Nothing else crosses it.**
