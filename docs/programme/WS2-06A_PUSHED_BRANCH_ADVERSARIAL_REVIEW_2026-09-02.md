# WS2-06A · adversarial review of the pushed server branch

```text
SUBJECT      origin/feature/ws2-06a-adopt-structure @ 7f5acfa9b
             "feat(ws2-06a): the member can make a reviewed reading canonical"
DIFF         2 files, +290 / -0 — server only, zero surface files
VERDICT      FORMALLY SUPERSEDED · DO NOT MERGE
VALUE        adversarial specimen + a carry-forward list + two acceptance gates
CUSTODY      6A. Recorded on the Stage 8 branch only because that is the branch
             this session may push; cherry-pick onto the final 6A ref, then
             delete from Stage 8. Do not rewrite the pushed lane's history.
METHOD       read-only. Nothing repaired, nothing rewritten, no commit to that branch.
REVIEWED     2026-09-02
```

**Scope note.** This reviews only what is reachable. The final 6A implementation is
local and unpushed; every "superseded by" statement below is taken from the founder's
account of that later command, not from reading it. Where this document says a later
form exists, that is reported, not verified.

## 0 · Pinned evidence

```
branch tip                7f5acfa9b
canonical                 origin/clean-main-no-secrets
StructureReview.tsx       68fd84516675f834cc0ff44361ae5e31eea21309
                          — byte-identical on both refs
```

The branch changes `lib/manuscript/structure/adopt.ts` (221) and
`app/api/sovereign/manuscripts/[id]/structure/proposals/[proposalId]/adopt/route.ts` (69).
It changes **no `.tsx`**. There is no member gesture on this ref, and no string matching
`my structure` / `Adopt this` / `adoptStructure` / `onAdopt` in any `.tsx` under `app/` or
`components/` across the 80 most recently updated remote branches.

---

## 1 · What this branch ESTABLISHES

Genuine work. These properties should survive into the final command.

**E1 · The tree never crosses the wire.** The client supplies only the revision it was
looking at; the structure written is the stored `reviewed` of the named proposal, re-read
inside the transaction. A client that could post a tree could make canonical a structure
nobody reviewed.

**E2 · Ownership, then serialisation.** `SELECT 1 FROM member_manuscripts WHERE id = $1
AND member_id = $2 FOR UPDATE` scopes the act to the owner and serialises concurrent
adoptions of different proposals, which the unique partial index would otherwise decide by
commit order.

**E3 · The right hash is the gate.** `section_topology_hash` refuses when the writable
pieces or their order changed; `interpretation_input_hash` deliberately does not gate — a
rewritten body is a soft signal, not grounds to refuse the member's act.

**E4 · `nothing_to_adopt` instead of a wrapper.** A `none` reading is refused as having
nothing to make canonical. Inventing a single enclosing division would be the system
authoring structure. This is the constitutionally load-bearing refusal on the branch.

**E5 · Empty canonical only.** Replacement is named as the sharpest danger in the unit and
left undesigned, backed by both a code check and a unique partial index.

**E6 · Asserted, not coerced.** `typeof revision !== 'number'` rather than `Number(...)`,
with the reasoning recorded: `Number(null)` is `0`, and `0` is a real revision, so a
coercing read would adopt revision 0 for a caller that sent nothing.

**E7 · MAIA already cannot reach this write.** `lib/manuscript/ask/__tests__/askRuntimeCannotWrite.test.ts`
names `adoptProposal` among the writes the Ask runtime must not reach. That guard predates
this branch and holds on it.

---

## 2 · DEFECTS in the branch's own terms

These are not divergences from a later ruling. They are wrong against what this file says
about itself.

### D1 · CRITICAL — a refusal discovered after the first insert COMMITS

`lib/db/postgres.ts` commits whenever the callback **returns** and rolls back only when it
**throws**:

```ts
const result = await callback(txClient);
await client.query('COMMIT');
```

`adoptProposal` returns a refusal by ordinary return, after writes may have happened:

```ts
const bad = await insertUnits(tx, manuscriptId, reviewed.units, null, sections, counters);
if (bad) return refuse(bad);          // ← COMMITs whatever insertUnits already wrote
```

The file header states the opposite, absolutely:

> "EVERY REFUSAL WRITES NOTHING." · "a refusal discovered after the first insert leaves no
> half-adopted outline behind."

**Failure scenario.** `reviewed.units = [U1 (valid), U2 (unresolvable from/to)]`. U1's rows
insert and are contiguous. U2 returns `unknown_section`. The function returns a refusal, the
transaction COMMITs, and the member receives `409 unknown_section` for a gesture that wrote
a partial outline. `adopted_at` is never set, so the proposal still reads as unadopted —
while `structure_exists` now refuses every retry. The member is locked out of adopting the
structure they asked for, and the Work carries divisions no completed act authored.

**Partially masked, not fixed.** The deferred contiguity trigger fires at COMMIT, so a
non-contiguous partial tree raises and produces a genuine rollback. That is accidental
cover: a partial insert that happens to be contiguous — the failure landing on a later
top-level sibling — commits cleanly.

**Reachability is narrow.** With the topology hash matched, section ids in `reviewed`
should resolve. The path opens through review operations that edit `reviewed` between
proposal and adoption. Narrow is where this class of defect survives review; the invariant
is stated without qualification, and the code does not hold it.

### D2 · The whole-tree validator exists on this branch and is not called

`review.ts` exports `validateReviewed(units, sections)`, which refuses `unknown_section`,
`inverted_range`, `child_outside_parent`, `overlapping_siblings`, and `duplicate_unit_id`.

`adoptProposal` calls none of it. It resolves each unit independently through `sectionRun`,
which cannot see the tree:

```ts
const [lo, hi] = i <= j ? [i, j] : [j, i];   // an inverted range is silently normalised
```

So at adoption: an inverted range is **accepted as its reverse**; overlapping siblings are
**not detected** — `manuscript_structure_members.draft_section_id` is UNIQUE and the code
deletes before inserting, so a later sibling silently takes sections from an earlier one;
and `child_outside_parent` is **assumed**, not checked. The code comment asserts the
property as fact — *"A child's run lies inside its parent's"* — where the module next door
has a function that would establish it.

This is the revalidation gap named in the founder's account, pinned to a specific unused
function on the same ref.

### D3 · Database-enforced invariants arrive as 500s, not refusals

`manuscript_structure_units_sibling_order` and the contiguity constraint trigger are both
`DEFERRABLE INITIALLY DEFERRED`, so they fire at COMMIT and raise. `transaction()` rethrows;
the route has no catch and no `STATUS` entry for them. Every case D2 fails to catch and D1
fails to roll back therefore surfaces to the member as a server error after their gesture,
not as one of the eight typed refusals the unit was designed around.

### D4 · `structure_exists` filters on a value nothing writes

```sql
WHERE manuscript_id = $1 AND origin <> 'proposed'
```

The header states plainly that nothing writes `origin = 'proposed'`. The filter is inert
today and would hide rows from the replacement gate if that ever changed. Counting all
units for the manuscript carries the same meaning with no conditional trust.

### D5 · Minor — `id` shadowed inside `insertUnits`

`const id = inserted.rows[0].id` is shadowed by `for (const id of run.ids)`. Correct as
written — block scope ends before the recursive call reads the outer `id` — in the one
function where a mis-scoped id would produce a wrong parent silently.

---

## 3 · SUPERSEDED by the later ratified 6A

Divergences from the settled design, per the founder's account of the local command.

### S1 · Provenance representation — and it is schema-level, not code-level

This branch writes `origin = 'member', adopted_from_id = NULL` and declines per-unit
descent explicitly:

> "It does NOT answer 'which canonical uuid descended from reviewed unit p3' — no identity
> mapping is persisted."

The ratified representation is `adopted_from_proposal_id + adopted_from_review_unit_key`.
**Neither column exists in any migration on this ref.** `20260830000002` carries only the
self-referential `adopted_from_id uuid REFERENCES manuscript_structure_units(id)`, which
the file itself classifies as belonging to an abandoned model. Moving to the ratified form
therefore requires a migration this branch does not contain — the divergence cannot be
closed by editing `adopt.ts`.

### S2 · Route contract

Accepts `reviewRevision` and returns counts — `unitsCreated`, `sectionsPlaced`,
`adoptedReviewRevision`. The later form re-reads and returns canonical persisted state. A
room built on this response learns numbers, not the structure now in the Work, and must
refetch before it can show the writer what they authored.

### S3 · No whole reviewed-tree revalidation against the current draft

The design-level statement of D2. Topology-hash gate plus per-unit `sectionRun`
materialisation is not revalidation of the tree.

---

## 4 · Why it must not merge as final 6A

1. **Its provenance model is the abandoned one**, and correcting it needs a migration that
   is not on this ref (S1).
2. **Its response cannot support the post-adoption experiential claim** without a refetch
   (S2).
3. **It admits trees the reviewed-structure validator on the same branch would refuse** (D2).
4. **It can commit a partial outline while reporting a refusal**, contradicting its own
   stated invariant and leaving the member permanently unable to retry (D1).
5. **It contains no member gesture**, so nothing here can be walked, and 6A cannot close
   against it on evidence.

Merging it would install an older command under the name of the ratified one — the precise
substitution the lane discipline exists to prevent.

## 5 · Carry forward

Into the final command: **E1–E7** as properties to preserve; **D1** as a defect to confirm
absent (does the later command refuse before any write, or throw rather than return?);
**D2** as a question — is `validateReviewed` called against current sections before the
first insert?; **D3** as a refusal-surface question; **D4** and **D5** as small cleanups if
the code was carried across.

Nothing here authorises a repair to `7f5acfa9b`. It is **formally superseded**: useful only
as an adversarial specimen and as a source of properties worth preserving.

---

## 6 · Acceptance gates for the final 6A command

**Founder ruling, 2026-09-02.** D1 and D2 are not observations carried forward for
consideration. They are **negative requirements** the replacement implementation must
satisfy before 6A can close.

⛔ **This document is an acceptance instrument, not the 6A specification.** It says how an
implementation can be falsified; it does not say what to build. The rebuild follows the
already-ratified 6A architecture, and code that cites this file cites it as evidence or as
a gate — never as authority for a design decision.

### GATE 1 — a refusal writes nothing, proven after a write point

```text
reviewed unit 1   valid
reviewed unit 2   invalid / refused
        ↓
command refuses
        ↓
canonical units          = 0
structure memberships    = 0
proposal                 remains unadopted (adopted_at IS NULL)
```

⛔ **The proof must exercise a failure that occurs after a potential write point.** A test
whose refusal is decided before the first insert — bad revision, wrong owner, topology
mismatch, `nothing_to_adopt` — does not touch the defect and must not be presented as
covering it. The failing unit has to come after at least one unit that would otherwise have
been written.

Either discipline satisfies the gate, and the implementation should say which it uses:
refuse before any write is possible (full validation precedes the first insert), or throw
rather than return so `transaction()` rolls back. What does not satisfy it is returning a
refusal after `insertUnits` has begun, which is what `7f5acfa9b` does.

⛔ Passing because the deferred contiguity trigger happened to raise is **not** passing.
The partial tree in the fixture must be one that would commit cleanly on its own.

### GATE 2 — the reviewed tree is validated before the first canonical insert

The final command must call `validateReviewed` — or a validator explicitly documented as
equivalent — against the **current** draft sections, before any row is written. These must
be impossible to reach the database with:

```text
unknown_section
inverted_range
overlapping_siblings
child_outside_parent
duplicate_unit_id
```

Per-unit `sectionRun` materialisation does not satisfy this: it normalises an inverted
range instead of refusing it, and it cannot see overlap or containment at all.

Each must surface as a **typed refusal**. A case that reaches DB enforcement — the deferred
contiguity trigger or the sibling-order constraint — and arrives at the member as a 500 has
failed this gate even though nothing was corrupted (D3).
