# Release Record — TEMPLATE

> **Copy this file to start a new Release Record.** Do not edit the template itself to record a
> release.
>
> **The structure is fixed** (Kelly, 2026-08-02). Every Release Record carries the same seven
> sections, in this order, so that someone reading Phase 7 in a year finds the same information
> in the same place they found it for Phase 1. **Do not reorder, rename, merge, or omit
> sections.** A section with nothing in it says so and stays.

## The rule this document exists to serve

A Release Record is **not paperwork completed after the fact. It is a measured instrument.**

⛔ **Until evidence exists, blank spaces are truthful data. Filling them early falsifies the
instrument.** A record whose evidence slots are empty is evidence that *the release has not
happened* — that is the document doing its job, not failing at it.

Write only from **verified state**, never from intent, inference, or a plausible expectation.

## Where this sits in the chain

Each document answers a different question. Keeping them separate stops one from silently
taking over another's role:

| Document | Answers |
|---|---|
| Product Definition | *what are we building?* |
| Phase Charter | *how will we build it?* |
| PRs | *what changed?* |
| **Release Record** | ***what actually shipped, and what evidence justified shipping it?*** |

```
Vision → Product Definition → Phase Charter → Implementation PRs → Release Candidate
      → Acceptance Walk → Release Record → Deployment → Observed Production Evidence
```

⭐ The point of the chain: an implementation cannot become *finished* merely because the code
exists. It must survive progressively stronger forms of evidence before it becomes part of the
platform.

---

# Release Record — «RELEASE NAME»

**Status:** «INCOMPLETE — the release has not happened» / «COMPLETE»
**Last verified against the repository:** «date», trunk `«sha»`

## 1. Identity

| | |
|---|---|
| Release name | |
| Deployed SHA | |
| Deployment date | |
| Deploy path | |
| `GIT_COMMIT` verified in the running container | |

⚠️ Note here whether the release carries a migration — if so the quick `deploy-maia` path is
**not** sufficient, since it runs no migrations.

## 2. Composition

Every PR and issue included in the release object.

| PR / Issue | What | State |
|---|---|---|
| | | |

⛔ State must be verified by ancestry, not by the PR's badge:
`git merge-base --is-ancestor <sha> origin/<trunk>`. A merged PR whose later commits were
pushed after the merge does **not** contain them.

## 3. Acceptance evidence

⛔ **Nothing here may be filled from intent, inference, or a passing test suite.** Each line
records an observation that actually happened, by whom, against what build.

### 3a. Automated

| Check | Required | Result |
|---|---|---|
| | | |

### 3b. Walks — ⭐ classify every one

There are at least **three different kinds of walk, and they are not interchangeable:**

| Kind | Claim it supports |
|---|---|
| **Developer verification** | *this implementation behaves as intended* |
| **Slice verification** | *this PR satisfies its own acceptance criteria* |
| **Release acceptance** | *the assembled capability is ready for members* |

⛔ **Only a Release-acceptance walk can satisfy this section.** Record the others where they
occurred, explicitly labelled as *not* release acceptance. The failure this prevents is a later
reader collapsing several kinds of evidence into *"someone walked it."*

**Release-acceptance walk** — performed by: «» · date: «» · build walked: «»
Fixture prerequisite: «state it up front»

| # | Step | Observed |
|---|---|---|
| | | |

**Other walks performed (NOT release acceptance):**

| Walk | Kind | Where recorded |
|---|---|---|
| | | |

### 3c. Reviewer sign-offs

| Reviewer | Scope reviewed | Disposition |
|---|---|---|
| | | |

## 4. Residues

Known limitations **accepted and shipped knowingly**, each with its reason. Nothing here is a
surprise — that is the point of recording it.

| # | Residue | Origin | Why it ships |
|---|---|---|---|
| | | | |

## 5. Deferred work

Explicitly moved to the next release. Naming these prevents a later slice being read as a
regression.

- 

## 6. Founder acceptance

> *Does the assembled capability do what it was meant to do?*

**Verdict:** «blank — the founder's to sign»

⛔ **Never inferred.** Not from §3a, not from §3b, not from evidence quality. This line is human
authorization and nothing else produces it.

## 7. Post-release observations

⛔ **Only filled after deployment.** Empty before then, always.

| Date | Observation | Source |
|---|---|---|
| | | |

---

## Sign-off gate

Complete only when: §1 names a deployed SHA verified in the running container · §3a has no blank
required row · §3b carries a **release-acceptance** walk performed by a named person against the
assembled candidate · §6 carries the founder's verdict.

**Until then the document is evidence that the release has not happened — which is its job.**
