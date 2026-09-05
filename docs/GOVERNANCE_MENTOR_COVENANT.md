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

#### Bootstrap Class A — Shadow Validation Only *(temporary)*

Added 2026-09-04. Available **only** while independent second-steward review is
unavailable, and retires automatically the moment a second human steward can give
independent approval. It does not lower the Class A gate above; it defines one narrow
category beneath it.

A change qualifies only if **all** of these hold:

* explicit Founder-Steward sign-off, recorded
* the exact candidate SHA is named — the branch head, never the implementation commit
* all required CI green on that exact head
* a rollback plan
* **zero member-facing response authority**
* no schema or data mutation
* no consent or retention widening
* no new PHI or member-content telemetry
* a bounded production witness with explicit stop conditions

**May authorize:** production shadow observation, and canonical merge of the same
zero-authority shadow infrastructure.

**May NOT authorize:** response influence · consent changes · memory-authority changes ·
retention changes.

The lighter bar applies to **both** merge and production promotion. Council approval that
binds canonical code but not running code is not a boundary, so this category deliberately
does not distinguish the two.

**No self-authorization.** This rule may not authorize its own adoption. It becomes
effective only once this governance amendment is canonical, and it confers no authority over
the change that introduces it. Any change relying on it must postdate its canonicalization.
This amendment may not rely on the rule it introduces for its own adoption. Its adoption
authority, **when expressly ratified**, is the Founder-Steward's pre-existing §3
responsibility for doctrine and production legitimacy — an authority that predates this rule
and is unaffected by it.

Rationale and the contradiction that prompted it:
`docs/programme/GOVERNANCE-CLASS-A-BOOTSTRAP-SHADOW-01.md`.

#### Beta-Phase Class A — Founder-Steward Sole Authority *(temporary)*

Added 2026-09-05 by founder ruling. **During the beta phase, the Class A gate above is
satisfied by the Founder-Steward alone.** The two Council votes and one Mentor verification
are not waived in principle; they are *not yet constituted*. This clause says so plainly
rather than leaving a gate on the books that no one can pass.

**Why this exists.** The Council and Mentor roles are designed for a launched system with
multiple stewards. During beta there is one person: the Founder-Steward. Every CODEOWNERS
entry names a single account, and `covenant-gates.yml` states in its own header that this
repository is single-owner with admin-merge rather than independent two-person review. A gate
requiring participants who do not exist is not a safeguard — it is an indefinite block that
invites exceptions, and three were already improvised around it before this clause was
written.

**Scope.** Applies to every Class A change during beta, including member-facing behaviour.
This is broader than **Bootstrap Class A — Shadow Validation Only**, which it subsumes for
the duration: that narrower rule is not repealed and revives when this clause sunsets.

**What does NOT change.** Only the approval arithmetic. Everything else stands:

* classification is still required, and Class A still means sacred boundaries — consent,
  privacy, retention, member sovereignty, safety, identity, memory handling, Sanctuary
* rollback plan, migration reversibility, and testing discipline (§9) are unchanged
* the exact candidate SHA must be named; approvals do not inherit across SHAs
* required CI must be green on that exact SHA
* production promotion still requires both provenance claims — declared build identity and
  independent runtime artifact attestation
* every authorization is an explicit recorded act stating what it authorizes **and what it
  does not**

**No self-authorization.** This clause may not authorize its own adoption. It becomes
effective only once this amendment is canonical, and confers no authority over the change
that introduces it. Its adoption authority, when expressly ratified, is the Founder-Steward's
pre-existing §3 responsibility for doctrine and production legitimacy.

**Sunset.** This clause expires on the earlier of:

1. a second human steward holding repository access and able to give independent approval, or
2. the system being opened beyond the beta cohort.

At that point the ordinary Class A gate resumes automatically. No further act is required to
end this clause; an act is required only to *extend* it, and extending it past either
condition requires a recorded founder decision naming why.

**What this costs, stated rather than hidden.** Independent review is the thing being given
up, during precisely the period when real members are using the system. The compensating
discipline is that beta Class A acts are *more* explicit, not less: exact SHA, exact scope,
exact non-authorization, recorded where the change lives. That is a weaker guarantee than a
second reviewer and should not be described as equivalent to one.

**Growth-obligation answers** (per `RECIPROCAL_SOVEREIGNTY_INTENTION_2026-08-04.md`, required
of any change that increases a capability — here, an increase in *authority*):

* *What uncertainty does this introduce?* That a single reviewer will miss what a second
  would have caught. It is preserved by recording every beta Class A act individually, so the
  set of decisions made under sole authority is enumerable and reviewable later.
* *What provenance and ownership boundaries does this require?* Each act names its exact SHA
  and its limits; none inherits. The record must say "authorized under beta sole authority"
  and never "approved by the Council."
* *What new responsibility does this create?* An obligation to constitute the Council before
  launch, not after — this clause is a bridge to that, not a substitute for it.

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
* `covenant-signoff` — **RETIRED 2026-09-04.** This was a bootstrap bridge: a logged single-operator sign-off satisfying the founder / mentor / founder-or-release *approval* requirements when no independent second steward existed. The enforcement engine behind it was removed in the 2026-07-03 covenant-gates redesign (see that workflow's header), which left this document pointing at a mechanism that no longer exists. Two further limits are worth recording rather than forgetting: it never named **Council**, so it did not discharge the two Council votes Class A requires; and it was an automated approval engine of the kind the redesign deliberately deleted for reimplementing and diverging from GitHub's own review model. Superseded for its one still-needed case by **Bootstrap Class A — Shadow Validation Only** (§5), which is a recorded founder act rather than label machinery.
* `staging-ready` — approved + safe to test in staging
* `release-approved` — steward signed, ready for production

**Rule:** A PR cannot be labeled `release-approved` if it has `frontier-check` unresolved.

**Classification is required on every PR.** Check exactly one class box in the PR template *or* apply the matching `class-*` label. A Class C (routine) change needs only its classification; Class A/B/Frontier additionally need approval. That approval is a human act in GitHub — CODEOWNERS plus branch protection — not a label: Covenant Gates performs constitutional validation and diagnostics only and does not count approvals. During the beta phase, Class A approval is satisfied by the Founder-Steward alone under **Beta-Phase Class A — Founder-Steward Sole Authority** (§5), which subsumes the narrower **Bootstrap Class A — Shadow Validation Only** for the duration and sunsets automatically when a second steward exists or the system opens beyond the beta cohort.

**Known gap (recorded 2026-09-04, not yet repaired):** `staging-ready` and `release-approved` govern production promotion in this document, but no deploy script consults any `class-*`, `requires-*` or `frontier-*` label — the deploy path is label-blind. Governance therefore reaches production in doctrine and not in mechanism. Closing that would be a Class B change to the deploy scripts and is deliberately out of scope for the governance lane that recorded it.

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
