# The Three Authority Chains

**Authored by:** Kelly, 2026-08-02. **Recorded by:** Claude Code.
**Status:** ⏳ **Recorded, not ratified.** This document describes a model that emerged from a day of
corrections; it authorizes nothing and rules nothing until Kelly ratifies it.

> **Resist adding any further governance mechanism until these three chains are explicitly
> documented.** The model explains nearly every correction that emerged; a growing collection of
> special-case rules does not.

---

## Four independent dimensions (Kelly, 2026-08-02)

The three chains below describe **which artifact governs** and **what evidence satisfies it**. Two
further dimensions are independent of both, and of each other. Conflating any pair has produced a
real error in this project.

| # | Dimension | Answers | Where it lives |
|---|---|---|---|
| 1 | **Referential authority** | *what artifact governs?* | Amendment 5 · #895 · Feature Walk Spec · Phase 1 Walk Spec |
| 2 | **Evidence authority** | *what evidence satisfies that artifact?* | persistence probes · authenticated feature walk · Phase 1 walk evidence |
| 3 | **State authority** | *who may move an artifact through its lifecycle?* | ⏳ **unruled** — see below |
| 4 | **Approval authority** | *who approves?* | `GOVERNANCE_MENTOR_COVENANT.md` — Founder / Steward / Council / Mentor, Class A/B/C gates |

```
Draft → Frozen → Executed → Accepted / Refused
```

⭐⭐⭐ **Approval authority is not state authority.** A Founder may approve something without having
authored it. A Steward may assemble a release candidate without accepting it. A tester may execute a
walk without being able to freeze its specification. The covenant answers dimension 4 in detail and
is silent on dimension 3.

⚠️ **Dimensions 1 and 2 are also distinct**, which is what the substitution rule below protects: an
evidence record is not the specification it answers.

---

## The three kinds of authority

Governance in this project has been separating into three distinct authorities. Some language still
allows them to blur, and every blur has produced a real error.

### 1. Specification authority — *what must this feature do?*

Governs **implementation**.

Examples: `MEMBER_FIELD_AND_STUDIO_DIRECTIVE.md` Amendment 5 · #895 (Correction 3 implementation
specification) · `FIELD_OBJECT_PROMOTION_RULING_2026-08-02.md`.

### 2. Acceptance authority — *has the implemented feature demonstrated the required behavior?*

Governs **feature acceptance**.

Examples: a Correction 3 Feature Walk Specification · its Feature Walk Evidence record.

### 3. Release authority — *may this feature participate in a release candidate?*

Governs **release acceptance**.

Examples: the Phase 1 Walk Specification · Phase 1 Walk Evidence · the Founder Acceptance Decision.

```
Implementation Specification
        ↓
Feature Acceptance
        ↓
Release Acceptance
```

### Evidence is prerequisite, not substitutable

⭐⭐⭐ **Evidence produced for one authority chain cannot substitute for evidence required by another
authority chain, even though it may be a prerequisite for it.**

This is the precise form. An earlier draft said *"evidence from a lower chain never satisfies a
higher one,"* which reads as though lower evidence were **irrelevant** higher up. It is not — a
release decision depends on feature evidence absolutely. What it may not do is **stand in for** it.

```
Implementation evidence
        ↓ prerequisite
Feature evidence
        ↓ prerequisite
Release evidence
        ↓ prerequisite
Founder decision
```

**Each level consumes the previous one without replacing it.**

| This | is required before | but cannot substitute for |
|---|---|---|
| Correction 3 persistence evidence | the authenticated feature walk | the authenticated feature walk |
| the authenticated feature walk | the Phase 1 release walk | the Phase 1 release walk |
| the release walk | founder acceptance | founder acceptance |

⛔ So *"18/18 persistence gates pass"* is a **prerequisite** for accepting Correction 3 and is
**not** an acceptance of it. The distinction is not pedantry: every collapse of it this project has
seen produced a claim that something was ready when it was not.

---

## Derivation, not identity

```
Amendment 5
        ↓
#895 (implementation specification)
        ↓
Implementation
        ↓
Correction 3 Feature Walk Specification
        ↓
Feature Walk Evidence
        ↓
Decision to publish
```

⭐⭐⭐ **The Feature Walk Specification is DERIVED FROM the implementation specification — never
identical to it.** Saying *"the substance is #895's criteria unchanged"* collapses two chains into
one.

**Why the distinction pays.** If a walk later reveals a missing behavioural criterion, a derived
specification can be revised **without implying the implementation specification was wrong.** Under
identity, every walk revision retroactively indicts the spec, and specs then resist correction.

---

## The principle underneath

Every failure this model was extracted from is one failure:

> ⭐⭐⭐ **Never substitute a representation for the governing referent.**

Observed instances, all on 2026-08-02:

| Representation | Governing referent |
|---|---|
| a branch | canonical |
| a PR's merged badge | merged **ancestry** (`merge-base --is-ancestor`) |
| a memory snapshot | canonical memory |
| a branch tip | the named release candidate SHA |
| an evidence record | the specification it answers |
| governance class | operational obligations |
| a PR body's claim | the merged document |
| an untracked working-tree file | a committed canonical artifact |

Each looked authoritative. Each was a stand-in. In every case the correction was the same: **go read
the thing that governs.**

---

## What this means for classification (issue #897)

The covenant-gate defect is usually described as *"Class A lost its rollback requirement."* That is
the symptom. The defect is:

> **Operational obligations were inferred from governance classification.**

Two independent axes:

| Axis | Answers | Values |
|---|---|---|
| **Governance classification** | *who must approve?* | Class A / B / C / Frontier-Dependent |
| **Operational obligations** | *what evidence and safeguards are required?* | migration → rollback plan · frontier dependency → verification · production data change → audit |

⭐⭐⭐ **Neither replaces the other.** A PR may be Class A *with* a migration, Class A *without* one,
Class B *with*, Class C *without*. Obligations must **compose with** classification, never be
derived from it — which is why raising a PR's severity must never lower what it has to prove.

Tracked as issue #897. ⛔ **Not to be patched from a feature lane** — a flaw in a gate must never
silently alter the standards applied to the work passing through it.

---

## ⏳ The open dimension — state transition authority

Knowing the chains is not enough. Each chain moves artifacts through **states**, and *who may move
them* is still implicit.

⭐⭐⭐ **This is not authorship.** Someone may draft a specification without being able to **freeze**
it. Someone may execute a walk without being able to **accept** it. Someone may assemble a candidate
without being able to **release** it. Those are different authorities, and today they are unnamed.

| Artifact | States | Who may transition? |
|---|---|---|
| Implementation Specification | Draft → Frozen | ⏳ unruled |
| Feature Walk Specification | Draft → Frozen | ⏳ unruled |
| Feature Walk Evidence | Open → Complete | ⏳ unruled — any witness? two? |
| Release Candidate | Assembled → Accepted | ⏳ unruled |
| Founder Acceptance | Pending → Accepted / Refused | ✅ **Founder-Steward only** |

**What already exists to build on.** `docs/GOVERNANCE_MENTOR_COVENANT.md` defines the roles —
Founder-Steward, Founder's Council, Mentors, Release Steward — and per-class **approval** gates.
⚠️ Approval authority is **not** the same as state transition authority: approving a PR is not
freezing a specification, and neither is completing an evidence record. The one adjacent precedent
is `CORPUS_WEIGHTING_SCHEMA_v1.0.md` — *"Tier 1 is frozen except by explicit decision"* — a freeze
concept that exists for corpus tiers and has never been generalized to governance artifacts.

⛔ **This document does not answer these questions, and must not be read as implying answers.**
Answering them is a founder act.

⭐⭐⭐ **Do not answer an open question because a table has a blank in it.** Recording the existence of
an unresolved constitutional question *without silently answering it through implementation* is the
discipline that produced this model in the first place. A blank marked **Unruled** is a finished
piece of work, not an unfinished one.

> Once four things are known — **what the artifacts are · what states they have · who may transition
> them · and that evidence is prerequisite rather than substitutable** — the governance model is
> complete without adding further special-case rules.

### Where this leaves the work

With referential authority, evidence authority, prerequisite relationships, representation-vs-referent,
operational obligations separated from governance class, and state transitions named as their own
dimension, **the remaining constitutional work is mostly filling in rulings rather than discovering
new categories.**

⭐⭐ That is a **different phase**: less inventing the framework, more deciding how it should be
populated. Treat a newly discovered *category* as the surprising case worth stopping for; treat a
blank *ruling* as ordinary pending work.

---

## How to use this document

For any change, name which chain you are in **before** citing evidence:

1. **Specification** — does the implementation match what was specified? Unit tests, persistence
   gates, and code review answer here.
2. **Acceptance** — has the member-facing behaviour been demonstrated through the real path? Only a
   walk against a frozen specification, producing an evidence record, answers here.
3. **Release** — may this participate in a candidate? Only the founder, against frozen release
   evidence for a named SHA, answers here.

⛔ **Evidence for one chain cannot substitute for evidence required by another**, though it is
usually a prerequisite for it. *"The tests pass"* is not *"the feature is accepted."* *"The feature
is accepted"* is not *"the release is accepted."*
