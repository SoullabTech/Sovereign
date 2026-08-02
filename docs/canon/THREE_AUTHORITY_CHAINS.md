# The Three Authority Chains

**Authored by:** Kelly, 2026-08-02. **Recorded by:** Claude Code.
**Status:** ⏳ **Recorded, not ratified.** This document describes a model that emerged from a day of
corrections; it authorizes nothing and rules nothing until Kelly ratifies it.

> **Resist adding any further governance mechanism until these three chains are explicitly
> documented.** The model explains nearly every correction that emerged; a growing collection of
> special-case rules does not.

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

⛔ **A pass in one chain is not a pass in another.** Persistence gates are specification-chain
evidence; they do not accept a feature. A feature walk accepts a feature; it does not accept a
release. Only the founder's decision, against frozen release-chain evidence, does that.

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

## How to use this document

For any change, name which chain you are in **before** citing evidence:

1. **Specification** — does the implementation match what was specified? Unit tests, persistence
   gates, and code review answer here.
2. **Acceptance** — has the member-facing behaviour been demonstrated through the real path? Only a
   walk against a frozen specification, producing an evidence record, answers here.
3. **Release** — may this participate in a candidate? Only the founder, against frozen release
   evidence for a named SHA, answers here.

⛔ **Evidence from a lower chain never satisfies a higher one.** *"The tests pass"* is not
*"the feature is accepted."* *"The feature is accepted"* is not *"the release is accepted."*
