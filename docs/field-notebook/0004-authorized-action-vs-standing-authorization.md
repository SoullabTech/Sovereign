# 0004 — Authorized Action ≠ Standing Authorization

- Date opened:  2026-06-18
- Last reviewed: 2026-06-18
- Status:        open
- Entry type:    internal-governance
- Confidence:    L2 (the mechanism) · L1 (the named distinction)

## Context
When MAIA acts, is each action separately authorized, or can a member grant a standing *class* of
action? The temptation is to generalize from the first working case (email send) into a broad
"MAIA may send on my behalf" authority. The question was whether that generalization had been
*earned* yet.

## Constitutional Prediction
`docs/canon/MAIA_CONSENT_GATES.md` Article 5 (Standing): *MAIA holds no general right to initiate.
She holds granted, revocable, domain-scoped standing to notice. The first thing MAIA proposes in
any new domain is the standing itself, not an action.* Article 6 (Grants are mortal — decay
through neglect, renew through valuation).

### Expected Observation
Single-instance, member-initiated actions need no standing grant — the request *is* the
authorization. Multi-instance or proactive action needs an explicit, revocable, mortal grant of a
named class.

### Potential Falsifier
MAIA initiating within a domain **without a prior explicit grant** would violate the standing
framework.

## Decision
The **mechanism** is canon (Articles 5–6). The two **terms** are working vocabulary, not yet
canon:
- *Authorized Action* — one human-authored action · one consent · one execution · one audit.
- *Standing Authorization* — a later, bounded-*class* grant.

The named distinction is deliberately **not yet elevated** to a canon article.

## Observation
- No dedicated canon doc names "Authorized Action vs Standing Authorization." The distinction is
  *derivable* from CONSENT_GATES Art 5–6; the terms appear in commit messages (e.g. `e5fe737c2`,
  "L2 standing authorization") and engineering vocabulary.
- Per project memory: "Standing Authorization" is **not yet earned** — one executor (email)
  overfits the seam; a structurally different executor #2 (calendar: write-not-send, idempotent,
  event-id-not-message-id) is required before the general abstraction can be extracted.

## Divergence
The distinction is *operative in engineering* but *unnamed in canon*. This is **not drift** — it
is "earn before name" enacted: one instance proves possibility; two reveal the abstraction. The
notebook records a **deliberate hold**, not a gap.

## Epistemic Outcome
Headline: **Underdetermined** — the load-bearing claim (the named distinction is *earned*) is
deliberately held; one executor cannot reveal whether the abstraction is real.
Per claim:
- *The standing / grant / mortality mechanism is canon* → **Confirmed** (CONSENT_GATES Art 5–6).
- *"Standing Authorization" is an earned, nameable class* → **Underdetermined** (held pending executor #2).

No falsifier fired: this is a deliberate hold, not a contradiction.

## Promotion
**Claimed**
- Level: Certification (a reusable pattern)
- Date: 2026-06-17
- Rationale: Authorized Action proven once (email send, 0001).

**Verified**
- Level: Constitution — for the **mechanism** (standing/grant/mortality, Art 5–6).
- Date: 2026-06-18
- Evidence: CONSENT_GATES Art 5–6 (Explore read).
- Verified by: Claude, this session.
- NOTE: **not promoted to "Standing Authorization."** Held pending executor #2 (calendar). The
  named generalization is deliberately withheld until a second, different executor reveals the
  shared seam.

**Refuted / Demoted** — n/a (held, not refuted).

## Confidence note
L2 for the mechanism (rigorous canon). L1 for the named distinction (working vocabulary; one data
point). Confidence on the *name* rises only when a second executor confirms the abstraction.
Last reviewed 2026-06-18.

## Self-audit
**Mistaken picture:** a reader with only this entry would conclude *MAIA already has a general
"standing authorization" capability* — over-reading the working term as a live, broad grant.
Incomplete: only single authored actions are live; the general class-grant is deliberately unbuilt
pending a second executor.
**Generative case that restores the whole:** the **calendar executor** (executor #2), which either
reveals the shared Authorized-Action → Executor seam (earning the name) or shows email overfit it.
*(Two entries now commission this case — see 0001.)*

## Open Questions
- Does calendar (write-not-send, immediate, idempotent, external-state) reveal the same
  Authorized-Action → Executor seam as email?
- Only after #2: extract a general Executor interface, and consider naming "Standing
  Authorization" in canon.
