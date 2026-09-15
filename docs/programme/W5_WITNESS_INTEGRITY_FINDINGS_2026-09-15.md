# W5 WITNESS-INTEGRITY FINDINGS

**Programme** `WS-EDITORIAL-WORKSPACE-01`
**Date** 2026-09-15
**Authorized by** founder act, 2026-09-15
**Base** `911efbbb` — both findings are present and unmodified at this commit,
so every claim below is checkable against this record's own base.
**Class** ⛔ **RECORD ONLY. Nothing is repaired, reclassified, or absorbed.**

> **Why this exists.** Both findings were discovered while building the W4-2
> migration. ⛔ Neither is caused by it, ⛔ neither is repaired by it, and
> ⛔ neither may be repaired *inside* it — W4-2 must not become the occasion for
> quietly repairing historical test infrastructure. Without this record they
> would exist only in a session transcript, and a merge reviewer would read
> `36 passed · 0 failed` with no way to see the limitation attached to that
> number.

---

## 1. W5-3 · S6 — A PRE-EXISTING VACUOUS WITNESS

**Where.** `scripts/witness/w5-3-schema-witness.sh`, the `ask_turns` seed
insert immediately preceding the S6 obligation, and S6 itself.
⛔ Cited as the operation, not a line number — a record anchored to a line
becomes unreadable the moment an unrelated edit lands above it.

**What is wrong.** The insert names a column `asked_at` and omits `staleness`.
The real contract, from `20260901000001_ask_threads.sql`, is:

```
ask_turns (thread_id, turn_index, speaker, body, staleness, answer_provenance, created_at)
              staleness  jsonb NOT NULL, no default
              asked_at   does not exist
```

So the statement fails twice over — an undefined column, and a `NOT NULL`
column with no default left unsupplied. ⭐ **And the failure is invisible**: the
witness's `q` helper discards output, so the seed is discarded silently.

**The consequence, stated exactly.**

> S6 asserts *deleting a bound thread removes its turns*, and then counts zero
> turns. ⭐⭐ **The count is zero because the turn was never written, not because
> the cascade removed it.** The obligation passes without ever exercising what
> it names.

⭐ **Scope, kept narrow.** Only **S6** is vacuous. ⛔ S6b (*the chain and its
versions REMAIN*) and S6c (*a chain cannot be deleted at all*) are unaffected —
neither depends on the discarded turn.

**Therefore, a claim-discipline rule, in force from this record:**

> ⛔ **`36 passed · 0 failed` on the W5-3 schema witness must NOT be read as 36
> independently functioning behavioural assertions**, until S6 is repaired and
> re-witnessed. One of those thirty-six is known not to exercise what it says it
> exercises.

⛔ This does not reduce the other thirty-five, and ⛔ it does not touch the W4-2
migration evidence: the W4-2 obligations are carried by their own witness
(`w4-2-schema-witness.sh`, `33 passed · 0 failed`), which seeds `ask_turns`
correctly and whose binding obligations would fail outright if it did not.

---

## 2. W5 RUNTIME STUBS — A REPRODUCIBILITY / CUSTODY GAP

**Where.** `scripts/witness/w5-rebuild-db.sh` (and `step2-rebuild-db.sh`),
which resolve `STEP2_RUNTIME_STUBS`, defaulting to `/tmp/step2_runtime_stubs.sql`,
and **refuse to run** if that file is absent.

**What is wrong.** That file is in no commit reachable from any ref in this
clone (`git log --all -- '*step2_runtime_stubs*'` → 0 matches). It is an
artifact that existed in one machine's `/tmp`.

**The consequence, stated exactly.**

> ⛔ **The W5 witness environment cannot presently be reconstructed from
> repository state alone.** A clean checkout on any other machine cannot run
> `w5-3-schema-witness.sh`, `w5-3-rollback-witness.sh` or the step-2 witnesses
> at all — they refuse before measuring anything.

⚠️ **What this does and does not say about the W4-2 evidence.** The W4-2 run
supplied reconstructed minimal stubs (members · member_manuscripts ·
manuscript_working_drafts · manuscript_draft_sections · pgcrypto), and
established a **baseline green before the migration** so that the RED was
attributable to the migration and not to the reconstruction. ⭐ That makes the
run valid evidence of what happened in that container. ⛔ **It does not make the
run reproducible by anyone else**, and the reconstructed file was destroyed with
the shadow. *A witness whose environment exists only on one machine is evidence
of an event, not an instrument.*

---

## 3. Classification

```
both findings          PRE-EXIST W4-2
caused by W4-2         ⛔ NO
invalidate the W4-2 migration witness   ⛔ NO
repaired by this act   ⛔ NO
```

⭐ The distinction that matters: **these are reasons not to overstate the W5
witness system — they are not reasons to reject the W4-2 migration.**

---

## 4. Standing

```
W4-2 migration evidence        ✅ INTACT
W5 historical witness defects  ⚠️ DURABLY DISCLOSED · this record
W5-3 S6 repair                 ⛔ SEPARATE FUTURE AUTHORIZATION
W5 stub custody repair         ⛔ SEPARATE FUTURE AUTHORIZATION

merge                          ⛔ NOT AUTHORIZED
deployment                     ⛔ NOT AUTHORIZED
protected execution            ⛔ NOT AUTHORIZED
production                     UNTOUCHED
```

⛔ **Disclosure is not authorization to repair.** A future act that repairs S6
must witness the repaired obligation actually failing against the current
vacuous implementation — otherwise it will have replaced one unexercised
assertion with another.
