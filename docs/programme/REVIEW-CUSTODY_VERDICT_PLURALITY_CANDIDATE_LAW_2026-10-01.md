# REVIEW-CUSTODY — Verdict Plurality (Candidate Law)

**Date:** 2026-10-01
**Status:** ⭐ CANDIDATE LAW FOR RATIFICATION · ⛔ not implemented · ⛔ the gate is unchanged
**Occasion:** RC1 split verdict. Two reviews of one relation under one plan returned REVISE and APPROVED, and the gate admitted the APPROVED without seeing the REVISE (`WS-ADVANCED-RUNTIME-01_RC1_SPLIT_VERDICT_FOUNDER_ADJUDICATION_2026-10-01.md`).

## The hole

The composed migration gate evaluates **one** custody record: the one it is handed. Any APPROVED record that witnesses its own coverage admits, whatever other reviews of the same relation concluded.

The permitted strategy is therefore: *run reviewers until one approves, then present that one.* The RC1 case was concurrent rather than sequential, but the gate cannot tell the two apart. That inability is the defect.

## Candidate law

> **VP-1. Every verdict on a relation is visible to the gate.** A relation is identified by its **relation key**: SHA-256 over the old-reader commit, the target commit, and the ordered pending migration `(path, blob SHA-256)` pairs. The plan is deliberately excluded, so that re-planning cannot be used to escape a prior verdict.
>
> **VP-2. A review exists from the moment it is commissioned, not from the moment it is admitted.** `bind` appends a *commissioned* entry to the relation's verdict ledger *before* the reviewer runs. A review that is never admitted stays visibly **unresolved**.
>
> **VP-3. APPROVED admits only over a clean ledger.** The gate refuses if the ledger for the relation holds any REVISE or BLOCKED verdict, or any unresolved commission, that is not covered by a recorded **override**.
>
> **VP-4. An override is a founder act, recorded, specific and reasoned.** It names the overridden review by review SHA, states a disposition and grounds for each finding, and is itself appended to the ledger. Deploying is never an override, and an override is never inferred from a later APPROVED.
>
> **VP-5. The ledger is append-only.** Entries are never edited or removed. A withdrawn commission is a new entry, not a deletion.

## Why VP-2 is the load-bearing clause

If only *admitted* verdicts count, a REVISE can be dropped by simply never admitting it. Shopping then moves one step earlier and remains invisible.

Recording the commission at `bind` time means every review that ran is visible as a commitment, and an abandoned one blocks until it is resolved or a founder override names it.

⚠️ **Residual limit, stated rather than hidden:** a reviewer run entirely outside custody (never bound) cannot be seen by any gate. VP-2 does not make that impossible. It makes such a review **inadmissible**, because only bound reviews can admit, so running one buys nothing.

## Design questions owed before implementation

1. **Where does the ledger live?** The deploy host must read it at gate time, and it must be writable by review sessions. Options:
   - a dedicated git ref (for example `refs/review-ledger/<relation-key>`), fetched by the gate;
   - a host-side append-only file;
   - a repository directory.

   A repository directory inside the target tree cannot hold verdicts written after the target is fixed.
2. **Commission identity.** The `bind` record would carry the relation key, which requires the pending set at bind time. Today the pending set is derived at deploy time, so `bind` would need the expected pending set as an explicit input, checked again by the gate.
3. **Interaction with the frozen suite.** `review-custody-core.ts` is frozen. Verdict plurality is a fourth boundary, alongside *witness · admit · check*, and lands additively at its own address with its own falsifiers and defeat candidates. The candidates would include: a gate that reads only admitted verdicts, a gate keyed on the plan rather than the relation, and an override that names no review.

## Retroactive application

None. RC1 is adjudicated by a separate founder record. This law would apply only to relations commissioned after ratification.
