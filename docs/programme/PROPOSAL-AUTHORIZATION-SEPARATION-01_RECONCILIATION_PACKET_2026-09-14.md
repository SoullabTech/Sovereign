# Step 2 · the reconciliation packet — DESIGN ONLY

**Lane** `claude/proposal-authorization-separation`, from `a6f573537`.
⛔ **NO SQL AUTHORED. NO MIGRATION EDITED. NO FILE RETIRED.** This packet is the
thing to review *before* any of that.

---

# A · the pure authorization contract — BUILT

`lib/manuscript/revisionAuthorization/contract.ts` · falsifiers
`__tests__/authorization.test.ts` · **17 passed · 0 failed**.

```
RevisionAuthorization
  id · memberId
  proposalChainId · proposalVersionId     ⭐ explicit; NEVER "current head"
  guard: ExecutionGuard                   ⭐ resolved, never assembled
  authorizedAt
  acceptedAt? · resultingVersion?         the execution receipt, whole or absent
```

**Absent, and asserted absent by test:** `replacementText` · `rationale` ·
any head/latest/current accessor · `inspection_only`.

## ⭐⭐ The guard is unforgeable, at BOTH levels

`ExecutionGuard` is a class with a private member and no exported constructor —
the `BoundEvidence` device from `lib/manuscript/development/bind.ts`. The only
way to obtain one is `resolveGuard(chain, reading)`, which takes **a reading of
the Work**, re-verifies the Work and section, requires the expected text to
occur **exactly once**, and takes `baseVersion` **from the reading**.

⛔ `chain.locus.baseVersion` is never copied forward. The fixture makes that
visible: the chain is at 40, the Work is at 41, and the guard carries **41**.

⚠️ **And the first draft of this was only half true.** The type refused a
literal; a `as unknown as ExecutionGuard` cast erased to nothing and the runtime
accepted stale locus values as current authority — *inside the falsifier that
existed to prove it could not.* Repaired with an `instanceof` check in
`authorize()`. ⭐ **A comment saying "not must not, CANNOT" has to be true in
both places or it is decoration.**

## ⛔ Why `inspection_only` does not exist here

EW-F1a was necessary for the architecture that existed and caught a real
failure. ⛔ Nothing here diminishes it. But the flag existed because **one row
was doing two jobs**, and with the objects separated the invalid state has
nowhere to live:

```
OLD   a row exists, carrying a flag that says do not execute it
NEW   there is no executable object yet
```

**Before the member authorizes an exact version, there is no authorization
record.** A flag can be misread, defaulted, promoted or forgotten. An absent row
cannot be any of those.

---

# B · the migration-history reconciliation plan

## B1 · What is being repaired, and why "add a migration at the end" cannot

```
20260910000004   creates ontology A (candidate)        applies
20260913000002   IF NOT EXISTS skips · then ERROR      FAILS
                 column "work_id" does not exist
                 → runner stops · each migration its own transaction
20260913000003   ERROR column "accepted_at"            never reached
                 → any future repair migration         UNREACHABLE
```

⛔ **On a clean database, "afterward" does not exist.** That is why this is a
bootstrap defect and not a naming collision, and why the repair must be to the
**executable set**, before first protected adoption.

## B2 · The state that licenses it

```
production                ledger ABSENT · schema ABSENT · rows NONE
walk · maia_consciousness ledger ABSENT · schema ABSENT · rows NONE
maia_focus_witness        ledger ABSENT · schema PRESENT · 4 rows · 2 accepted
```

⭐ **No protected database has executed or adopted any of the four.** There is
no protected schema state to preserve, so this is not rewriting history — it is
**removing an executable defect before first protected execution.**

⛔ **And the third row is why the language must stay exact.** *"These migrations
never ran anywhere"* is **false**: their effect exists in `maia_focus_witness`
through an unledgered act, with two accepted rows under it.

## B3 · ⛔ `maia_focus_witness` IS FROZEN AS EVIDENCE

```
⛔ do NOT backfill its schema_migrations
⛔ do NOT apply reconciliation migrations to it
⛔ do NOT rename its historical table
⛔ do NOT migrate or alter its 4 proposal rows
⛔ do NOT "fix" its 2 accepted rows
⛔ do NOT make its schema match future canon
```

⭐ **Its inconsistency is the evidence.** That its ledger does not account for
its own schema is part of what that database witnesses, and every item above
would rewrite the thing we are reading.

## B4 · The three objects, and their canonical identities

⚠️ **Names are PROPOSED here for the naming act, not settled by this packet.**

| object | what it is | proposed identity | status |
|---|---|---|---|
| **candidate / MAIA offer** | born from a MAIA turn · producer + turn index · input fingerprint · candidate derivation · frozen authored output · **declinable** | `manuscript_revision_candidates` | ⛔ needs its own naming act |
| **collaborative proposal** | `MAIA v1 → Kelly v2 → MAIA v3 …` | `proposal_chains` · `proposal_versions` | ⭐ **BUILT · Step 1 · unchanged** |
| **authorization** | one member act permitting one exact version | `revision_authorizations` | ⛔ needs the naming act + schema |

⭐⭐ **`manuscript_revision_proposals` is retired as a canonical name for
either.** It has carried two incompatible ontologies inside one executable
migration set; awarding it to a winner guarantees a future engineer recovers the
discarded ontology from the name.

⚠️ **The September-10 object is NOT the collaborative proposal we built.** Its
creation semantics say what it is: *born from a MAIA turn, with producer
provenance and an input fingerprint, frozen, and declinable.* **That is a
candidate.** ⭐ This is what dissolves the apparent two-competing-implementations
problem — there were never two proposals, there were a candidate and a proposal.

## B5 · The repair, as options — ⛔ NOT CHOSEN HERE

```
OPTION 1 · AMEND IN PLACE
  rewrite 20260910000004 to create the candidate table under its own name;
  rewrite 20260913000002/00003 to create the authorization table under its own
  name. No file is deleted; the collision simply never occurs on replay.
  ⚠️ changes the meaning of already-distributed filenames.

OPTION 2 · RETIRE + REPLACE
  move the three colliding files out of the active set into an explicitly
  non-executable archive directory, and add new migrations that create the
  three objects under their settled names.
  ⭐ the historical files remain readable as evidence, exactly as ruled for
  maia_focus_witness.
  ⚠️ the ledger of any environment that DID apply them would then name files
  that are no longer in the active set — relevant only to maia_focus_witness,
  which is frozen and must not be reconciled anyway.

OPTION 3 · SUPERSET TABLE
  ⛔ FORBIDDEN by the ratified naming ruling. A union table containing both
  lifecycles erases the distinction the census uncovered — the shape survives
  and the meaning does not.
```

⛔ **Option 3 is excluded. Options 1 and 2 are for the founder.** ⭐ Option 2
sits better with the evidence-preservation ruling already made for
`maia_focus_witness`, but that is an argument, not a decision.

## B6 · ⭐⭐ THE ACCEPTANCE TEST — deliberately severe

> **From a blank database, can the complete active migration set run to
> completion with zero collisions, leaving exactly the three intended objects —
> candidate, collaborative proposal, authorization — with no table carrying two
> lifecycles?**

Mechanically, and each part is a separate failure:

```
1  blank database · full active set applied in order · ZERO errors
   ⛔ and zero `relation already exists, skipping` NOTICES — that notice is
      how this defect stayed quiet, so it is a FAILURE here, not noise

2  exactly three objects, each with ONE lifecycle:
     candidate        producer provenance · frozen · declinable
     proposal chain   append-only succession
     authorization    exact version + guard + single-use receipt

3  no table carries markers of two ontologies — the §3 shape verdict from the
   migration-state census, run against every one of the three, must return a
   single verdict each and never HYBRID

4  ⛔ no table named `manuscript_revision_proposals` exists at the end

5  the ledger's final state names every applied file, and the schema agrees
   with it — ⭐ the exact property maia_focus_witness violates
```

⚠️ **`2` and `3` are not the same test.** A set could produce three tables whose
*names* are right while one of them still carries both column families; `3`
catches that and `2` does not.

---

# ⛔ Standing

```
A · authorization contract        BUILT · 17 falsifiers · 0 failed
B · reconciliation plan           DESIGNED · options presented, none chosen

naming act                        ⛔ OWED — candidate + authorization identities
migration edit                    ⛔ NOT AUTHORIZED
SQL / schema mutation             ⛔ NOT AUTHORIZED
route · UI · generation           ⛔ NONE
manuscript write                  ⛔ NONE
production                        UNTOUCHED
maia_focus_witness                ⛔ FROZEN AS EVIDENCE

DIRECTION-HOME                    OPEN — blocks Step 4, not Step 2
```
