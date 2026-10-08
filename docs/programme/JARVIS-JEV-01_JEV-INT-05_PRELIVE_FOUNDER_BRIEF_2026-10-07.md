# Jev — first controlled connection experiment
**Founder decision brief · prepared October 7, 2026 · NOT AN APPROVAL REQUEST YET**

## Where we are
We have a working Jev HTTP adapter, a ledger that records every attempt, and a checkpoint that preserves the history independently. The local-mock wrapper now assembles them and verifies the source, storage, and limits before simulation. This is engineering evidence, **not evidence that Jev's judgments are reliable**.

The system remains **OFF** for Jev. This does not disable MAIA or JARVIS generally. No requests have been made to the actual TypeSafe service, no account credential has been accessed, and nothing has been charged.

## The first real experiment, if separately approved
- **Purpose:** determine whether JARVIS can make and record a bounded Jev API request accurately, without trusting the response as an operational decision.
- **Input:** up to **31 frozen, synthetic, non-sensitive J1 state packets**, comprising 19 fixture configurations and 12 repeats. Only the pinned `Q_RISK` question is sent: “Does this appear to cross a structural-risk boundary?” The data are structured, repository-derived **synthetic metadata**, not member conversations or manuscripts.
- **Service:** TypeSafe's `https://api.typesafe.ai/v1/systemone`; model `jev-1.13.0` (verify current availability and terms before running).
- **Output:** Jev's native `noul` probability and usage counts, stored as an observation only. **No inference is admitted into the frozen J1 answer contract**, no routing/effort reduction, no autonomous authority, and no claim of safety from a low score.
- **Scope:** one experiment ID, exactly the pinned question table and fixture list; no retries, no new prompts, no extra real-work data. A first-call inspection, if chosen, **consumes attempt 1 of 31**; it is not a bonus request.
- **Ceiling:** up to **$1.00 authorized spend**, at most **31 attempts**, reserving **$0.005 before each send** and stopping on unknown charges or delivery. The synthetic mock's tiny calculated usage is not a billing quote or a real charge.
- **Time:** one expiring execution grant, not a standing permission to contact TypeSafe.

## Before any activation
1. **Constitutional decision:** explicitly ratify the `J1R5-WIRE` amendment that changes the frozen J1 wire representation. This has not occurred.
2. **Provider-authority chain:** ratify the Class-A prior authorization, canonically admit it, then register `typesafe-jev` in the lab tier and record its approved assignment. A standing assignment is not itself an execution permit.
3. **Review data exposure:** examine TypeSafe's current agreement, DPA/retention, applicable account billing terms, and actual handling of the synthetic packet. Do **not** assume zero retention.
4. **Issue a narrow execution grant:** `provider.execute:typesafe-jev`, `network.external`, `provider.spend`, and `disclosure.repository_derived_metadata`, naming the table and fixture hashes, model, endpoint, experiment ID, 31/$1 caps, and an expiry.
5. **Operational readiness:** confirm the actual Mac ledger and T7 checkpoint are mounted, physically distinct and device-pinned; choose and authorize a recovery operator. The current runbook is unassigned. Any ambiguous crossing stops rather than resending.
6. **Credential and live wiring:** supply a real account credential through an approved runtime process, then separately review the code change that permits the remote endpoint and opens the currently frozen `RESPONSE_SHAPE.witnessed: false` gate. Neither is enabled by the local wrapper.
7. **First-call decision:** decide whether to inspect the first actual request and provider response before allowing the remaining 30. The initial call must count against the same 31-attempt budget.

## What is NOT being asked
No human label exercise: PILOT-01 is deferred and remains untouched. No permission to inspect member data, make real-work judgments, lower JARVIS's computational effort, deploy, merge, or enable provider execution is implied. The local tests also cannot establish real TLS/DNS/proxy/provider behavior or power-loss durability.

## Recommended next founder decision — only when the preceding evidence is complete
**One bounded synthetic connection experiment, with transparent data and cost caps, observations only, and a stop after the first call for inspection.** An authorization should be a separate, explicit act. This brief alone grants **nothing**.

### Pinned technical identities for the engineering record
- Question table SHA-256: `6bb269d84c674d14730ecd0519ef48caef430e764fde9e32eb2f1f267610064e`.
- Fixture list SHA-256: `a0f4a26cea085527783a62c8875fdf60f2fed93d1f4ff48d2285ab5288c24f60`.
- Public OpenAPI snapshot SHA-256: `a191f8a7df6bd6fedced8120dd0fd106f88575d1d1c8360d08900a6c7c0360d5`.
- Relevant source: `scripts/builder/jev-wire-prelive-wrapper-v1.mjs`; original review and closure evidence remain in `docs/programme/`.
