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

## 3 · Carried obligation — W5 integrity disclosure sequencing

The opening act requires that *the existing W5 integrity disclosure sequencing
must reach canonical no later than the later W4-2 migration*, and that **W5
landing does not erase that obligation**. It is carried here verbatim, ⛔ **OPEN
and undischarged**.

⚠️ **I could not locate a written record of it**, so I am not restating it in my
own words and risking a paraphrase that narrows it. Searched: `docs/programme/`,
`docs/canon/`, and the five migrations. The nearest repository artifact is
`20260914000002`'s `read_state` / S3-disclosure linkage — *"The S3 disclosure that
licensed the reading"* — but I will not assume that is what is meant.

**One question, and it settles the item:** is the obligation (a) the
`manuscript_revision_offers` ↔ S3-disclosure binding in `20260914000002`, or (b)
a separate ruling that has not yet been written down? If (b), it needs recording
before this ruling can close, because an obligation that exists only in memory
cannot be checked against a landing.

---

## 4 · What closure requires

```
1  custody item 1 reconciled                       ✅ §1  (standing raised, unrepaired)
2  protected reread immediately before landing     ⛔ OWED · founder act · §2
3  integrity disclosure sequencing recorded        ⛔ OPEN · §3
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
```

> ***A merge that defers the execution decision does not defer it. It hands it to
> whoever deploys next, for a reason that has nothing to do with this package.***
