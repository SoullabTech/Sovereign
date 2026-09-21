# JARVIS-KP-01 / I5-P0R1 — ANCHOR DRIFT DISPOSITION

**Date**: 2026-09-21
**Act**: `I5-P0R1` — Founder-scope configuration remediation + stable readiness re-witness
**Disposition**: `I5-P0 NOT READY`
**Blocker class**: authorization binding form, ⛔ not architecture, ⛔ not configuration

> NO SEMANTIC JOIN WITHOUT A WARRANT.

---

## 0. What this record is, and is not

This record carries **repository truth only.** It was produced in a remote
container with:

- ⛔ no `ssh` binary
- ⛔ no `DATABASE_URL`
- ⛔ no route to `minisforum`

Therefore **no production fact in this record was re-witnessed here.** Every
production reading cited below is carried forward from the founder-connected
host that ran `I5-P0` and the `I5-P0R1` preflight. This is a statement about the
environment, ⛔ not a deferral and ⛔ not a partial result: **no production read,
no configuration mutation, no service recreation, and no shadow execution was
performed by this act.**

---

## 1. Disposition

`I5-P0 NOT READY`.

The authorized act could not be spent. Both of its exact-SHA anchors were stale
before the mutation window opened:

| Anchor | Authorized as | Observed |
|---|---|---|
| Production running SHA | `bcd4debfed1285d2ff14829db7f117ffaff05f11` | advanced to `4c097b4c81402c62e42613e83ae28180fef46f08` |
| Canonical `clean-main-no-secrets` | `4c097b4c81402c62e42613e83ae28180fef46f08` | advanced to `65bcb76bb38d4f57e816253fdbec0ea036d6c166` |

§IV authorized recreation of `maia-sovereign` **using the already-authorized
`bcd4debf...` image only.** Production was no longer running that image, so the
act carried no authority over the substrate actually present. The remediation
was correctly refused rather than re-aimed.

---

## 2. ⭐ THE LOAD-BEARING FINDING — THE DRIFT IS DOCUMENTARY, THE SEAM IS FROZEN

The canonical interval `bcd4debf..65bcb76b` is **seven commits** and touches
**zero** bytes of the runtime seam I5 depends on.

Verified in-container (`git diff --name-status`, empty output) over:

- `lib/ain/epistemic-join/**`
- `lib/maia/relational-field-shadow/**`
- `database/migrations/**` (entire directory)
- `app/api/sovereign/**` (entire surface, including the serving route
  `app/api/sovereign/app/maia/list/route.ts`)

The seven commits are JARVIS operator-constitution / local-model-transport work
and Serving Identity F1 documentary + test registration.

### 2a. Seam identity instrument

A digest over the blob hashes of the **34 seam paths** (the two runtime
directories, the serving route, and the three relevant migrations), sorted,
SHA-256:

```
bcd4debfe  seam_id=195b16bce1c807477bf97befc3c9b6d64a22e4520d0bdd8e9fcd173e35bb885b
4c097b4c8  seam_id=195b16bce1c807477bf97befc3c9b6d64a22e4520d0bdd8e9fcd173e35bb885b
65bcb76bb  seam_id=195b16bce1c807477bf97befc3c9b6d64a22e4520d0bdd8e9fcd173e35bb885b
```

**Identical across all three.** Production-at-authorization,
production-now, and current canonical present the same seam.

⛔ The digest is **blob identity over a named path set**, so it survives
documentary canonical movement and history rewriting, and it changes the moment
any seam byte changes. ⛔ It is **not** a claim that the seam is correct — only
that it has not moved.

---

## 3. ⭐⭐ THE STRUCTURAL DEFECT — AN AUTHORIZATION THAT EXPIRES BEFORE IT CAN BE SPENT

Three consecutive readiness acts have now failed. **None failed on the shadow
architecture, the isolation properties, or the telemetry law.** All three failed
on anchor drift:

1. `I5-P0` — production mutated *during* the witness (falsifier 22).
2. `I5-P0R1` — both anchors stale *before* the mutation window.
3. (this record) — canonical advanced again while the disposition was being
   written.

The mechanism is not mysterious and not anyone's carelessness: **the readiness
act is bound to a point SHA, and production is moved by an independent
deployment lane that takes no instruction from this lane.** A point-SHA binding
over a substrate another lane may advance at any moment is an authorization with
a shorter lifetime than the act it authorizes.

⭐ This is the same defect family as the 2026-09-07 finding
(*merge-to-canonical is latent schema-deploy authorization*) seen from the other
side: there, a deploy silently carried another lane's schema; here, another
lane's deploy silently invalidates this lane's warrant.

⛔ **The fix is not to move faster.** A narrower race is still a race.

### 3a. The repair the finding argues for (⛔ NOT TAKEN — founder act)

Bind the readiness act to a **verifiable property of the substrate**, not to a
point in its history. Predeclared, mechanically checkable, and stable under
documentary movement:

1. production running SHA is an **ancestor of canonical** at witness time; **and**
2. `seam_id` at the production SHA **equals** `195b16bc…` (the named digest); **and**
3. `seam_id` at canonical **equals** the same digest; **and**
4. the production **image identity is stable across the witness window**
   (this is the surviving useful half of falsifier 22); **and**
5. the I4 telemetry migration is applied and its row count is unchanged.

Under that binding, the two documentary canonical advances that killed `I5-P0R1`
would have been **admissible**, and a real seam change would still be **fatal**.

⛔ Falsifier 22 is **narrowed, never dropped**: what must not happen is a
*substrate change under the witness*, ⛔ not *any commit anywhere during the
window*. Conflating the two is what made the act unspendable.

---

## 4. Blockers carried forward, UNCHANGED

From the `I5-P0R1` preflight on the founder-connected host — ⛔ not re-witnessed
here, ⛔ not repaired by this act:

- **B1 — Founder scope wrong.** `MAIA_RELATIONAL_FIELD_SHADOW_MEMBER_IDS` has
  cardinality 1, and that identity does **not** match the unique
  `admin_role = founder` account. Narrowly allowlisted, ⛔ not Founder-only.
- **B2 — No shadow model set.** `MAIA_RELATIONAL_FIELD_SHADOW_MODELS` is empty.
  `qwen2.5:14b-instruct` is installed on the production Ollama host and was
  named by the authorization, ⛔ but was not configured and ⛔ was not executed.
- **B3 — Anchor binding.** §2–§3 above.

Posture carried forward, all still safe:

- outer relational-field shadow **OFF**
- inner epistemic-join integration shadow **OFF**
- I3 semantic persistence **OFF**
- H8 **OFF** · cross-session H8 **OFF**
- relational-field research rows **3** · I4 telemetry rows **0**
- `representation_closed = TRUE` database-constrained

---

## 5. ⚠️ ONE FINDING WITHDRAWN BEFORE IT WAS MADE

The fetch of `clean-main-no-secrets` in this container reported
`+ 8cb64064...65bcb76b (forced update)` — the shape of a canonical history
rewrite, which would have invalidated every SHA-anchored record in this lane.

**It is not a rewrite.** The clone is **shallow** (`.git/shallow`, 9 grafted
roots), so the connecting history was absent and ancestry was simply
*unverifiable*. After `git fetch --deepen=400`, `8cb64064` is confirmed an
**ancestor** of `65bcb76b`: an ordinary fast-forward.

⭐ Recorded because the near-miss is the lesson: **in a grafted clone, a
non-fast-forward fetch report carries zero information about rewriting**, and
reporting it as a rewrite would have manufactured a governance crisis out of a
transport artifact. *Absence of the connecting link is not evidence that the
link is absent.*

---

## 6. Standing

**I5-P0 NOT READY** · seam **FROZEN** across all three SHAs
(`seam_id=195b16bc…`) · Founder allowlist **WRONG** · shadow model set
**EMPTY** · anchor binding **DEFECTIVE, repair proposed ⛔ not taken** ·
⛔ no configuration mutation · ⛔ no service recreation · ⛔ no flag enabled ·
⛔ no shadow executed · ⛔ no row written · ⛔ no migration · ⛔ no deploy ·
⛔ I5-P1 NOT OPENED · ⛔ I6 / I7 UNTOUCHED · **PRODUCTION UNTOUCHED BY THIS ACT.**

⭐ *The architecture has passed every isolation falsifier put to it. What keeps
failing is the warrant's binding to a substrate a different lane keeps moving.*
