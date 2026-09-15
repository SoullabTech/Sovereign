# W5-SCHEMA-LAND · MERGE RULING — **OPENED**

**Date** 2026-09-15 · **Opened by** founder act, 2026-09-15 · **Lane** evidence/architecture
(`claude/w4-2-schema-design`) — ⛔ deliberately **not** the carrier branch, which stays
narrow at the five files plus its own witness and record.

```
candidate carrier    348b9e54d
canonical base       1a5554300
pending set          exactly 000001–000005
Gate A               PASS  · durable rerun reproduced · exit 3
Gate B               PASS  · 88 passed · 0 failed
```

⛔ **THIS ACT AUTHORIZES NOTHING.** It opens the decision. Canonical merge ⛔ NOT
AUTHORIZED · protected migration ⛔ NOT AUTHORIZED · production mutation ⛔ NONE.

---

## 0 · The shape of the decision

⭐⭐ **The ruling is about canonical landing AND intended schema execution as ONE
controlled custody window.** There is no lawful *"merge the five now and decide
about applying them later."*

That is the 2026-09-07 branch-gate defect stated as law rather than as an
incident: once a migration becomes canonical it becomes deployable by whoever
deploys next, for any unrelated reason. A merge that defers the execution
decision does not defer it — it **delegates it to the next deploy**, and to
whoever happens to run it.

---

## 1 · Custody item 1 — **DISPOSED (reconciled), and its standing RAISES**

### `20260903000001_return_authority_fail_closed.sql`

**Located.** Blob `a370ee4d71e7a16d0564ee53bb753a5595d73e7a`, identical on two
refs — `origin/claude/maia-long-term-memory-fda5gf` and
`origin/feature/memory-organism-pass1-continuity-02`. Two commits touch it:

```
d44473826  2026-09-03 00:46 +0000  Claude
           feat(sovereignty): P6 — contextual doorway requires member-conferred return authority
ab474634f  2026-09-03 20:55 -0400  Kelly Nezat
           fix(sovereignty): restore practitioner P6 writer binding and migration
⛔ NEITHER is an ancestor of origin/clean-main-no-secrets.
```

⛔ The commit authorship is evidence about the **commits**, not about who applied
the migration to production. Those are two different acts and this record does
not merge them.

**What it does.** Two statements:

```sql
ALTER TABLE member_memory_atoms ALTER COLUMN return_preference SET DEFAULT 'member_pulled';
UPDATE member_memory_atoms ... -- backfill practitioner-observation rows
```

It is a **sovereignty fail-closed repair** (P6): a permissive column default was
conferring member-scale return consent on rows no member had written. Its own
prose is explicit that member behaviour must not change, *because the member Keep
path would state `contextual_doorway` explicitly at its write site*
(`lib/psyche/returnAuthority.ts`).

### ⭐⭐ THE FINDING — the repair is in production in HALF, and half a fail-closed repair inverts it

Established from repository content:

| | canonical (`origin/clean-main-no-secrets`) | P6 branches |
|---|---|---|
| `lib/psyche/returnAuthority.ts` | ⛔ **ABSENT** | present |
| `lib/psyche/portfolio.ts` — the **member Keep** INSERT | ⛔ **omits** `return_preference`, inherits the default | states it explicitly (`// P6 — RETURN AUTHORITY IS NOW EXPLICIT AT THE WRITE SITE`) |
| `app/api/studio/with-me/.../route.ts` — the **practitioner** INSERT | hardcodes `'contextual_doorway'` | — |

The schema half is applied in production (founder-attested: the default now reads
`member_pulled`). The code half is on **no canonical branch**. In that split
state the effect is **inverted in both directions**:

- ⛔ **Member keeps now inherit `member_pulled`.** The member's own kept material
  silently stops returning contextually — defeating both the 2026-05-23 doctrine
  (*"Keeping is the consent act"*) and the 2026-07-03 standing-consent model, in
  production, silently. The migration's own text promises *"Member keeps behave
  exactly as before."* Without its code half, they do not.
- ⛔ **Practitioner observations still hardcode `'contextual_doorway'`.** The
  backfill cleaned the existing rows once; **the canonical write site keeps
  producing new ones.** The exact permission the migration exists to remove is
  still being conferred by omission's opposite — by assertion.

> ***The schema was made fail-closed while the code that was supposed to make it
> harmless never arrived. What landed is not a partial repair; it is a different
> change with the opposite sign.***

### Evidence classes, named

- **REPOSITORY-ESTABLISHED** (read here, by blob and ref): the file's location,
  its two commits, their non-ancestry, the three write sites above, and the
  absence of `returnAuthority.ts` from canonical.
- **FOUNDER-ATTESTED** (their protected read, not mine): production's current
  default is `member_pulled`.
- ⛔ **UNREAD, and not inferred**: which image production is actually running;
  whether the deployed bundle matches canonical at these three files; how many
  member atoms have been written since 2026-09-03 under the changed default.
  **This record asserts none of it.**

### Disposition

1. ⛔ **NOT added to this carrier.** As ruled. It is not in the five's dependency
   graph and smuggling it in would widen a package Gate A and Gate B were built
   to keep narrow.
2. ✅ **Reconciled here** — located, attributed, and its effect characterised.
3. ⚠️ **Its standing rises from bookkeeping to live member-facing.** The founder's
   framing — *"deserves its own reconciliation record"* — was right and, on the
   evidence now in hand, understates it. ⛔ **No repair is proposed and none is
   authorized here.** It is reported, and it wants its own lane and its own
   founder act.
4. ⛔ It still **blocks the merge ruling's closure**, per the opening act.

---

## 2 · Custody item 2 — **NOT DISPOSABLE NOW, and predeclared**

> *Reread ledger/pending set so yesterday's clean state is not treated as
> permanent.*

⛔ **This cannot be discharged in advance, by construction.** Its whole content is
that it is read **immediately before landing**. A reading taken now would be the
very thing it exists to forbid — yesterday's clean state treated as permanent.

**The instrument already exists and is sealed**: Gate A at `2c152e54b`
(`66 passed · 0 failed`), which prints protected identity before accepting any
result and classifies ledger-only names into three classes rather than one.

**Predeclared acceptance, so the reread is falsifiable rather than confirmatory:**

```
bash scripts/witness/w5-landing-02-gate-a.sh origin/clean-main-no-secrets HEAD

§0   verified 5 · absent 0 · mismatched 0
§2   db maia_consciousness · role soullab · read_only on
§3   latent pending 0                      ⛔ any latent pending REOPENS the ruling
§4   BASELINE-SUBSUMED 51 · APPLIED-OUTSIDE-CARRIER 1   (20260903000001)
§5   pending set = exactly 000001–000005
§6   GATE A PASSES · 1 custody finding stands
exit 3
```

⛔ **Any deviation is the finding, not a defect in the expectation.** A second
`APPLIED-OUTSIDE-CARRIER` name, or a non-zero §3, means the protected state moved
and the ruling reopens rather than proceeds.

---

## 3 · Carried obligation — W5 integrity disclosure sequencing — **IDENTIFIED**

⚠️ **A correction I owe, and it is the same class three times now.** I reported
this obligation as unlocated. It was located in one command by the founder. My
search grepped `docs/programme/` **in the checked-out tree** — not across refs —
so a record living on a side branch was invisible to it. That is Gate A's §0
defect (*read the ref, not the working tree*) and Gate B's staging defect
(*verify and use the same bytes*) a third time, in a search rather than an
instrument. ⛔ **"I could not find it" was a statement about my method, not about
the repository.**

**The artifact, verified here independently rather than accepted on summary:**

```
commit   b67eb15e5b95a232415c1d567a94c8b8945d946a
branch   origin/chore/w5-witness-integrity-findings-20260915
base     911efbbb2                        ⛔ itself NOT on canonical
file     docs/programme/W5_WITNESS_INTEGRITY_FINDINGS_2026-09-15.md
shape    1 file · +125 lines · ⭐ docs only, no code, no migration
class    RECORD ONLY — "Nothing is repaired, reclassified, or absorbed."
```

Its two findings, read from the artifact: **(1)** W5-3 **S6** is vacuous — its
`ask_turns` seed never writes, so *"delete thread removes turns"* passes on zero
(⭐ the record keeps the scope narrow: **only S6**; S6b is not vacuous);
**(2)** the W5 runtime stubs are not repository-reconstructible —
`/tmp/step2_runtime_stubs.sql` was machine-local, `git log --all` finds it
nowhere. Its governing purpose: ⛔ *`36 passed · 0 failed` must not be read as 36
independently functioning behavioural assertions.*

⭐ **This is witness-integrity disclosure. It is NOT `20260914000002`'s
`read_state` ↔ S3 binding.** Two different uses of the word *disclosure*, and I
was right not to assume they were one.

### The sequencing rule, and ⛔ the trap in satisfying it

```
lawful      b67eb15e  →  W4-2 migration      (or both in one canonical window)
forbidden   W4-2 → canonical  while b67eb15e remains only on a side branch
```

⛔ **It does NOT join the five-file carrier. The narrow carrier stays narrow.**
The deadline is *before or with* W4-2 landing, which is not now.

⭐⭐ **AND THE OBVIOUS WAY TO DISCHARGE IT IS A TRAP.** The obligation is that
canonical acquires **`b67eb15e`** — one docs-only commit. Merging the **branch**
that carries it would acquire:

```
437 files · +77,757 lines · ⛔ TWELVE migrations, not five
  the five W5 package files, plus SEVEN outside it:
    20260910000001_pending_ask_claims          20260912000001_focus_crossing_acts
    20260910000002_context_disclosure_boundary 20260912000002_focus_act_draft_provenance
    20260910000003_pending_ask_consuming_act   20260913000001_editorial_decision_events
    20260910000005_pending_ask_invocation_receipt
```

⛔ Those are exactly the seven branch-only migrations the founder's Gate A run
confirmed **do not enter the carrier**. By the 2026-09-07 mechanism, all twelve
would become deployable by whoever deploys next, for a reason unrelated to any of
them. **Gate A and Gate B would have proven a five-file package while a
twelve-migration package landed through a different door.**

⭐ The narrow lawful form is therefore a **cherry-pick of `b67eb15e5` alone** —
one file, +125 lines, no code, no schema. ⛔ Recorded as the mechanic, **not
performed and not authorized here.**

## 4 · What closure requires

```
1  custody item 1 reconciled                       ✅ §1  (standing raised, unrepaired)
2  protected reread immediately before landing     ⛔ OWED · founder act · §2
3  integrity disclosure sequencing                 ✅ IDENTIFIED + RECORDED · §3
   canonical acquisition of b67eb15e             ⏸ owed no later than W4-2 landing
                                                 ⛔ by cherry-pick, never branch merge
4  merge + intended execution decided TOGETHER     ⛔ the founder's act, not mine
```

⛔ Jarvis does not infer *gates green → merge*, and does not close a ruling on
items it has only described.

---

## 5 · Standing

```
Gate A                          ✅ CLOSED · instrument sealed · rerun reproduced
Gate B                          ✅ CLOSED · 348b9e54d · 88/0
W5-SCHEMA-LAND merge ruling     🟢 OPEN — opened by this act, closes on §4

canonical merge                 ⛔ NOT YET AUTHORIZED
protected migration             ⛔ NOT YET AUTHORIZED
deployment                      ⛔ NOT AUTHORIZED
production mutation             ⛔ NONE

20260903000001                  ⚠️ RECONCILED AS RECORD · ⛔ UNREPAIRED
                                ⚠️ standing raised: live member-facing, own lane owed
b67eb15e disclosure             ✅ IDENTIFIED · ⏸ canonical acquisition owed
                                ⛔ deadline is W4-2 landing, and it is not now
```

> ***A merge that defers the execution decision does not defer it. It hands it to
> whoever deploys next, for a reason that has nothing to do with this package.***
