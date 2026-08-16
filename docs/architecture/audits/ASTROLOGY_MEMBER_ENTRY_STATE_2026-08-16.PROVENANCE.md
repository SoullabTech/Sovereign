# PROVENANCE — `ASTROLOGY_MEMBER_ENTRY_STATE_2026-08-16.md`

**Read this before citing that audit for anything about the present.**

```text
CLASSIFICATION
  HISTORICAL AUDIT / EVIDENCE
  PARTIALLY SUPERSEDED BY LATER RUNTIME IDENTITY WITNESS
```

The audit is preserved **byte-exact** as authored on 2026-08-16
(sha256 `52c26cf99b4f8eddb004b89b0c900511…`, 20,268 bytes, 493 lines). It was deliberately **not**
rewritten to fit later knowledge. Editing an audit so its conclusions survive is how a record stops
being evidence; the correction belongs beside it, not inside it.

---

## The referent it was bound to

Every claim in that document is scoped to this state of the world and **no other**:

| | |
|---|---|
| production at time of audit | `39cc97d87` |
| canonical during the lane | `1c1e99578` → `58d4915f4` → `66d5d60c2` → `89d72e9c0` → `1b1a5a953` |
| repair merged as | `6d3c0cbc4` (PR #1061) |
| deployed as | `1b1a5a953` |
| identity-congruence evidence | `[MAIA] userId resolved` log, **7-day window, 20 turns**, read on 2026-08-16 |

That log window is the entire empirical basis of §9. It is a **sample**, not a standing property.

---

## What it still establishes

- **§9 falsification as reached at that referent** — 20/20 `fromSession: present`, 20/20
  `bodyUserId: matches-session`, zero divergent, across that window.
- **The `memberRef` → member binding** — `4a190476bad9` = `sha256('49ae4717-…')`, computed rather than
  assumed; and that the two Kelly rows carrying `birth_date 1966-12-09` did not appear in that window.
- **Corrected drift figures** — the stale-local-ref error (`f9a7326f1` was 570 commits behind
  `origin/`), and that production was an ancestor of canonical, 20 behind — not diverged.
- **Erratum E1** — the stale test comment at `birthDataResolution.test.ts:119`, and why it was stale.
- **Superseded claims and the reasoning that superseded them** — preserved visibly rather than
  deleted. This is the part most expensive to reconstruct.

## What it does NOT establish now

⛔ **current production identity congruence** — the 20-turn sample cannot speak for later traffic.
⛔ **that the field disconnect is purely an account problem** — §9's central conclusion.
⛔ **that the 12-hex recognition defect is adjacent rather than active** — §6's withdrawal was reached
   against the bound source at that time.

---

## What supersedes it, and the standing of that evidence

⚠️ **Provenance of this supersession note is itself limited, and is stated rather than concealed.**

A **later production witness established identity divergence inside the founder session.** That
finding is **founder-carried into this record**. It was **not** produced, observed, or independently
verified by the session that authored the audit, and no SHA, log window, or trace is bound to it here.
It is recorded because it is authoritative as to *disposition* — it withdraws the audit's
identity-congruence conclusion from current-state standing — **not** because this document can vouch
for its mechanism.

⛔ **Do not cite this note as evidence OF the divergence.** Cite the owning lane's own artifact. If no
such artifact exists yet, the divergence is **asserted and unbound**, and that is the honest state.

The two findings are not in contradiction, and neither cancels the other:

```text
20/20 congruent      TRUE of that sample, at that referent
divergence observed  TRUE of a later observation, per the founder

→ congruence is a PROPERTY OF A SAMPLE, never a standing guarantee
```

This is exactly the failure class the audit's own §6 held open: **identity congruence is something to
observe, never to assume** — including when a prior observation was clean. A sample that came back
20/20 licenses no claim about the next turn.

---

## Custody boundary of this act

```text
DOCS-ONLY CUSTODY          AUTHORIZED   (founder, 2026-08-16)
ORIGINAL AUDIT BYTES       PRESERVED EXACTLY — unmodified
SEPARATE SUPERSESSION NOTE this file

REPAIR REOPEN              NO
DEPLOYMENT                 NO
ASTROLOGY EXPERIENTIAL WALK NO
IDENTITY REMEDIATION       NOT IMPLIED
```

Nothing here authorizes work. The deployed repair (`1b1a5a953`) is unaffected: its defects were
**latent and non-causal** to the encounter, so a later divergence finding neither validates nor
invalidates it. The authenticated production witness for `/astrology` remains **OWED**.

Related, separately governed and untouched: the `/signout` path clearing 2 of 14 keys without revoking
the server session · saved-synastry authorization · Kelly identity reconciliation · `/journey`
destination intent · erratum E1 cleanup.
