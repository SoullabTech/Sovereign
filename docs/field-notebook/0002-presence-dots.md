# 0002 — Presence Dots (attention vs engagement)

- Date opened:  2026-06-18
- Last reviewed: 2026-06-18
- Status:        divergence-found
- Entry type:    internal-design
- Confidence:    L3 (the refusal) · L1 (structural enforcement)

## Context
Should MAIA surface presence signals — "active now," typing indicators, online/last-seen dots?
These are the default engagement primitives of every chat product. The question was whether they
belong in a system whose purpose is durable understanding rather than maximized conversation.

## Constitutional Prediction
`docs/canon/MAIA_ATTENTION_DOCTRINE.md` (protect attention) and `docs/canon/MAIA_OATH.md`
(never make a human life narrower) predict refusal. Stated directly in
`docs/architecture/SHARED_UNDERSTANDING.md` §8 "Things We Refuse" — typing indicators listed at
line 347; rationale at line 401: *presence manufactures attention and availability-pressure —
the extractive loop.*

### Expected Observation
No "active now" / typing / online / green-dot anywhere in the shared member surface.

### Potential Falsifier
A consciously-chosen co-presence *ritual* (non-pressuring, member-initiated) that demonstrably
**increased** agency rather than manufacturing availability-pressure. That would show the blanket
refusal is too broad and the principle needs narrowing — refuse presence-as-surveillance, permit
presence-as-chosen-ritual.

## Decision
Refused (in writing): typing indicators, online status, presence-as-availability-pressure.
The refusal is *documented*, not yet *code-gated*.

## Observation
- The refusal is solid in canon (SHARED_UNDERSTANDING §8, line 347).
- A **reconciliation audit** (same doc, line 360, dated 2026-06-18) found **three presence
  divergences in the codebase**: `app/fields/[field]/presence/page.tsx`, a `lastSeen` field in
  admin, and "Online / Last seen" in the model-studio UI. All three were *marked for review*;
  **none is exposed in the shared member surface**.

## Divergence
The principle is stated but **not structurally enforced**. Presence code exists in admin/studio
surfaces — caught by the 2026-06-18 audit, not yet resolved. The refusal currently lives as a
design boundary plus a reconciliation list, not as a structural gate that makes the violation
impossible.

## Epistemic Outcome
Headline: **Confirmed** — the load-bearing claim (presence-as-pressure is refused) is canon; the
gaps are in enforcement and scope, not in the refusal.
Per claim:
- *The refusal is written canon* → **Confirmed** (SHARED_UNDERSTANDING §8, line 347).
- *The refusal is structurally enforced* → **Diverged** (the 2026-06-18 audit found presence code in admin/studio surfaces).
- *All presence is extractive (the blanket scope is right)* → **Underdetermined** (line 486: a chosen ritual might not be).

No falsifier fired; the line-486 open question remains the standing potential-falsifier.

## Promotion
**Claimed**
- Level: Constitution
- Date: SHARED_UNDERSTANDING authoring
- Rationale: explicit written refusal in §8.

**Verified**
- Level: Evidence (written refusal) — verified at doc line 347.
- Date: 2026-06-18
- Evidence: SHARED_UNDERSTANDING §8; reconciliation audit at line 360.
- Verified by: Claude (Explore read), this session.
- NOTE: **structural enforcement is NOT verified.** The input-level "can't-un-see" guard that the
  enforcement-mode review test would require does not exist; the boundary is held by discipline
  and an audit list.

**Refuted / Demoted** — none.

## Confidence note
L3 for the principle (written, derivable from two canon docs). L1 for enforcement (drift present
in admin/studio; no structural gate). Last reviewed 2026-06-18.

## Self-audit
**Mistaken picture:** a reader with only this entry would conclude *the project opposes social
features* — that it is anti-connection. Incomplete: it refuses presence-as-*pressure*, not
connection; the open question (line 486) is whether chosen co-presence could *increase* agency.
**Generative case that restores the whole:** the **co-presence ritual** case — a consciously-chosen,
non-pressuring presence that demonstrably raises agency, if it exists.

## Open Questions
- Does a chosen co-presence ritual differ from presence-as-surveillance (line 486)?
- Resolve the three audited divergences.
- Enforce structurally, or accept consent + legibility for the admin/studio cases under the
  enforcement-mode review test?
