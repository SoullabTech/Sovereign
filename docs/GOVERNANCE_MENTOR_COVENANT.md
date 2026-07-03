# MAIA Mentor Covenant

*A governance covenant for self-improving systems with human stewardship.*

---

## 1) Purpose

MAIA is designed to learn, refine, and propose improvements through real usage.
**Production authority remains human-signed.** MAIA may generate and test changes, but cannot self-authorize shipping them without explicit permissions and mentor review.

This covenant ensures:

* safety, sovereignty, and member-centering stay non-negotiable
* MAIA's "best information" stays current through mentor verification
* changes are traceable, reversible, and consent-aligned

---

## 2) Core Principle

**MAIA proposes; Mentors approve; Production is human-signed.**

MAIA may:
* observe → hypothesize → test → recommend

Mentors must:
* verify assumptions → approve/deny → sign changes → oversee deployment

---

## 3) Roles

### Founder-Steward (Kelly)

The Founder-Steward holds **final responsibility** for MAIA's purpose, doctrine, and production legitimacy.

Founder-Steward authority includes:

* final sign-off on **production releases**
* final decision on **model/provider strategy**
* veto power on any change that threatens sovereignty, consent, or doctrine alignment
* appointment/removal of mentors and council members

### Founder's Council (Council of Stewards)

A council chosen by the Founder-Steward to steward MAIA's long-term integrity across domains (safety, spirit/ethics, product, community, infrastructure).

Council responsibilities:

* review and advise on Class A changes (Sacred Boundaries)
* arbitrate ambiguous edge cases ("safe but misaligned" vs "aligned but risky")
* hold the long view: coherence, trust, member dignity, cultural impact

Council members may be non-technical. Their role is **meaning, ethics, alignment, and lived wisdom**, not implementation.

### Mentors (Advanced Frontier Mentors)

Mentors are the **technical and frontier-verification stewards**. They do not replace Founder/Council authority; they support it.

Mentor responsibilities:

* verify all "frontier facts" (models, SDK behaviors, pricing, runtime constraints)
* assess operational risk (migrations, deploy safety, rollback readiness)
* recommend upgrades/downgrades with evidence and tested impact

### MAIA (System Intelligence)

* Detects patterns and generates hypotheses
* Drafts PRs and documentation
* Runs tests and prepares controlled experiments
* Flags dependencies on external "frontier facts" (models, pricing, SDK changes)

### Release Steward (Designated Mentor)

* The final signer for merges/deploys
* Responsible for "don't brick staging" discipline
* Owns rollback readiness

---

## 4) Permission Boundaries (Hard Lines)

### MAIA is **not allowed** to do any of the following by default:

* merge to `main`
* deploy to staging or production
* modify privacy / retention / consent rules
* change safety doctrine or Member-Centering constraints
* perform irreversible schema changes without mentor-approved migration plan
* adopt a new model/provider/version based on inference alone

### MAIA **may** do these (with audit logging):

* open PRs labeled `maia-proposal`
* run CI checks
* propose migrations + rollbacks (but not apply them to prod)
* run A/B tests in controlled environments (with guardrails)

---

## 5) Decision Rights Matrix

| Change Type                        | Examples                                                      | Required Approvals                                                                  |
| ---------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Class A — Sacred Boundaries**    | privacy/consent, safety doctrine, retention, dependency risks | **Founder-Steward + 2 Council votes + 1 Mentor verification**                       |
| **Class B — Structural Risk**      | migrations, auth, routing, infra                              | **Founder-Steward OR Release Steward + 1 Mentor** *(Council optional if sensitive)* |
| **Class C — Routine Improvements** | copy tweaks, prompt tuning inside doctrine, refactors         | **1 Mentor** *(Founder/Council optional)*                                           |
| **Frontier-Dependent Decisions**   | model IDs, provider changes, pricing assumptions              | **Founder-Steward + Mentor verification required**                                  |

### Class A — Sacred Boundaries (2-mentor approval required)

Anything touching:

* consent, privacy, retention, member sovereignty
* safety system, manipulation safeguards, dependency risk
* identity, memory handling, "sanctuary" guarantees
* billing/cost controls that could affect access or equity

**Gate:** Founder-Steward + 2 Council votes + 1 Mentor verification

### Class B — Structural Risk (1 mentor + release steward)

* database schema/migrations
* authentication/authorization
* routing logic across agent paths
* infrastructure config affecting runtime stability

**Gate:** Founder-Steward OR Release Steward + 1 Mentor + rollback plan

### Class C — Routine Improvements (1 mentor)

* prompt tuning within defined doctrine
* copy changes, UX adjustments
* performance improvements
* non-breaking refactors

**Gate:** 1 Mentor approval + passing CI

---

## 6) "Best Information" Rule (Frontier Verification)

When a decision depends on fast-changing external facts (models, SDKs, limits, pricing, runtime constraints), MAIA must:

1. **Flag the dependency**
   "This depends on external frontier facts."

2. **Request mentor verification**
   Provide what needs checking (model ID availability, API behavior, etc.).

3. **Record the basis**
   What assumption was made and why.

4. **Block production action** until verified
   No shipping based on unverified frontier claims.

---

## 7) Required Gates in GitHub (recommended defaults)

Implement branch protections on `main`:

* Require PRs (no direct pushes)
* Require CI checks to pass (build, lint, type-check, tests)
* Require at least **1 mentor approval** (or 2 for Class A)
* Require CODEOWNERS for:
  * `/lib/safety/**`
  * `/lib/memory/**`
  * `/docs/policy/**`
  * `/database/migrations/**`
* Require "Release Steward" approval for deploy labels (e.g. `deploy:staging`, `deploy:prod`)
* Require Founder-Steward approval for merges to `main` (at least for Class A/B labels)

---

## 8) PR Labels & Workflow

* `maia-proposal` — drafted by MAIA, not approved
* `mentor-review` — awaiting human verification/decision
* `requires-founder` — requires Founder-Steward approval
* `requires-council` — requires Council review
* `class-a`, `class-b`, `class-c` — change class gate
* `frontier-check` — requires mentor verification of external facts
* `staging-ready` — approved + safe to test in staging
* `release-approved` — steward signed, ready for production

**Rule:** A PR cannot be labeled `release-approved` if it has `frontier-check` unresolved.

---

## 9) Testing & Rollback Discipline (Minimum Standard)

Every release candidate must include:

* a rollback plan (even if "revert commit")
* migration reversibility notes (or explicit "no rollback, requires restore")
* staged rollout plan for any risky change
* post-deploy smoke tests (documented commands)

---

## 10) Emergency Protocol

If MAIA detects a safety or integrity risk:

* MAIA may automatically:
  * disable the risky route/feature flag (if a flag exists)
  * downgrade to a safe fallback mode
  * alert mentors with a clear incident summary

**Mentors decide** the final action:

* patch, rollback, or suspend feature
* communicate member-facing notice if needed

---

## 11) Audit & Traceability

All MAIA-generated change proposals must include:

* what signal triggered the hypothesis (pattern/metric/log)
* what outcome is expected (measurable)
* what could go wrong (failure modes)
* how to detect regression (metrics + threshold)
* who approved (mentor signatures)

---

## 12) The Non-Negotiables (Doctrine Lock)

These are not modifiable by MAIA and require Class A review:

* consent and privacy boundaries
* sanctuary defaults (no harvesting by default)
* anti-manipulation and anti-dependency safeguards
* member-centered value alignment constraints
* "human-signed production" rule

---

## 13) One-Line Summary

**MAIA is a learning intelligence with a conscience-shaped path. Mentors are the living guardians of truth, context, and the changing frontier. The Founder-Steward holds final responsibility for purpose, doctrine, and production legitimacy.**

---

*Covenant established: 2025-12-30*
*Last updated: 2025-12-30*
