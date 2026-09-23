# CANONICAL-ADMISSION-ENFORCEMENT-01 · E1
## Fail-Closed Canonical Admission — Enforcement Architecture Design

**Date:** 2026-09-23 · **Act:** founder authorization `CANONICAL-ADMISSION-ENFORCEMENT-01 / E1`
**Canonical base:** `b4f73ac4ccd9cb96e6b2b6dc7b682e689c77771f`
**Disposition:** ⛔ **DESIGN ONLY — NO REPOSITORY SETTING MUTATED · NO WORKFLOW ADDED ·
NO PROTECTION CHANGED · PRODUCTION UNTOUCHED**

⛔ This record designs an enforcement architecture. It installs none of it. Every finding below
is either an E0-established fact, a read-only repository observation made during E1, or a
reasoned property of a GitHub mechanism — each labelled as such.

---

## 1 · Facts carried in

### 1.1 Established by E0 (founder-recovered or E0-observed)

```text
repository collaborators     Soullab (admin) · SoullabCovenant (write)
merge actor / PR author /
  connected identity         all Soullab · id 7103224
reviews on #1494             []  — zero
enforcement_level            non_admins
rulesets                     []
required contexts            Axis 1 · sovereignty · check-diagrams · build
required_status_checks.strict true
temporal record              1/4 complete before admission
                             3/4 incomplete at admission (margins 1s and 5s)
                             4/4 eventually green
bypass marker                outcome D — none found on accessible surfaces
```

⚠️ `web-flow` was withdrawn in E0 as evidence of a browser merge button; it identifies GitHub's
merge-commit machinery and does not distinguish UI from API. Not relied on here.

### 1.2 Observed read-only during E1

```text
.github/CODEOWNERS            every Class A path → @Soullab (sole owner, all patterns)
.github/workflows/            covenant-gates.yml present and running
SoullabCovenant               0 commits authored anywhere in history
                              collaborators endpoint returns no `type` field
```

**Context-name correspondence** (derived by job/workflow name, at the same confidence as the
E0 context list — not a fresh read of branch protection, which this session's tooling cannot
reach):

```text
Axis 1 — authoritative adjudication   ← .github/workflows/jarvis-epistemic-guard.yml
sovereignty                           ← .github/workflows/sovereignty-gate.yml
check-diagrams                        ← .github/workflows/check-diagrams.yml
build                                 ← .github/workflows/docker-build.yml
```

⭐⭐ **FINDING E1-A — the Class A determination is not itself a required context.**
`covenant-gates` is the only mechanism in the repository that establishes *that a pull request
is Class A*. It is not in the required set. Neither are the `canonical-pr-quality` jobs
(TypeScript no-regression gate · JARVIS native patch-admission falsifiers · empty-database
reconstruction). **An invariant conditioned on Class A cannot be enforced while the fact it is
conditioned on is advisory.** Any architecture below that gates Class A must make
`covenant-gates` required first, or the condition is vacuous.

### 1.3 Prior art already in the repository

`.github/workflows/covenant-gates.yml`, header, verbatim:

> Until a second human GitHub collaborator exists, this repo is single-owner + admin-merge,
> **NOT** independent two-person review. That is a property of GitHub access, enforced by
> branch protection — this workflow does not pretend otherwise.

⭐ The 2026-07-03 redesign named this gap correctly and refused to simulate a review model it
did not have. E1 does not rediscover it; E1 is the act that decides what to do about it.

---

## 2 · The eight invariants, restated as testable propositions

| # | Invariant | Testable form |
|---|---|---|
| 1 | required checks bind admins | there exists no principal for whom a red/absent required context is mergeable |
| 2 | pending is not mergeable | merge is refused while any required context is pending · failing · cancelled · stale · absent |
| 3 | Class A requires independent-human custody concurrence | a Class A head cannot be admitted without an APPROVED review from a declared custodian principal |
| 4 | self-review cannot satisfy concurrence | the concurring principal is distinct from the author and from every head-commit author |
| 5 | administrator merge authority cannot bypass concurrence | (3) and (4) hold for the admin principal identically |
| 6 | direct push cannot bypass canonical admission | no ref update to canonical outside a pull request; no force-push; no deletion |
| 7 | break-glass, if retained, is explicit and separately governed | bypass is an enumerated, named, readable configuration entry — never a boolean mode |
| 8 | the enforcement state can be mechanically witnessed | a third party can read, after the fact, both the configuration **and** whether it was in force at the moment of a given admission |

⭐ Invariant 8 has two halves and they are not equally easy. Reading the configuration *now* is
trivial in both architectures. Establishing that it was in force *then* is the whole problem.

---

## 3 · Architecture A — hardened classic branch protection

`PUT /repos/{owner}/{repo}/branches/clean-main-no-secrets/protection` with
`enforce_admins: true`, `required_status_checks.strict: true` + the full context list,
`required_pull_request_reviews.required_approving_review_count: 1`,
`require_code_owner_reviews: true`, `allow_force_pushes: false`, `allow_deletions: false`.

| # | Verdict | Reason |
|---|---|---|
| 1 | ✅ | `enforce_admins: true` is exactly this invariant |
| 2 | ✅ | required contexts + `strict` already configured; the observed defect is (1), not (2) |
| 3 | ⛔ **worse than unsatisfied — deadlocked** | see below |
| 4 | ✅ | GitHub refuses author self-approval natively |
| 5 | ✅ *while the boolean is true* | same single boolean as (1) |
| 6 | ✅ | required reviews imply PR-only updates; force-push and deletion disabled |
| 7 | ❌ | classic protection has **no break-glass concept**. Bypass is `enforce_admins: false` — unnamed, unscoped, unexpiring, unattributed |
| 8 | ❌ **decisive** | see below |

### 3.1 ⛔ The CODEOWNERS deadlock (invariant 3)

Every Class A path in `.github/CODEOWNERS` resolves to `@Soullab`. `@Soullab` is the author of
the Class A acts. GitHub does not permit an author to approve their own pull request.

```text
require_code_owner_reviews: true
        +  CODEOWNERS Class A → @Soullab
        +  PR authored by Soullab
        =  a required review that no principal is permitted to give
```

The Class A pull request becomes **permanently unmergeable**. The only exit is administrator
bypass — the precise authority invariant 5 exists to remove. ⭐⭐ **Architecture A, hardened
honestly, converts the Class A path into a choice between deadlock and bypass, and never into
concurrence.** That is not a configuration mistake to tune around; it is what a one-owner
CODEOWNERS file mechanically means.

### 3.2 ⛔⛔ The witness failure (invariant 8) — and why E0 returned outcome D

Toggling `enforce_admins` off, merging, and toggling it back leaves the branch-protection
payload **byte-identical before and after**. The configuration is readable; the *interval* is
not. A point-in-time read can never establish that the gate was in force at the moment of a
past admission.

⭐ **E0's outcome D is exactly what Architecture A predicts.** No durable bypass marker was
found because, under classic protection, there is nothing whose job it is to make one. The
absence of the record is a property of the architecture, not a gap in E0's search. This also
means: *no amount of further forensic inspection under A will convert D into C.*

---

## 4 · Architecture B — repository ruleset

One ruleset targeting `clean-main-no-secrets`, `enforcement: active`, `bypass_actors: []`,
carrying `pull_request`, `required_status_checks`, `deletion` and `non_fast_forward` rules.

| # | Verdict | Reason |
|---|---|---|
| 1 | ✅ **structurally** | an admin bypasses only by *appearing in* `bypass_actors`. An empty list binds every principal. Absence, not a mode |
| 2 | ✅ | `required_status_checks` rule + `strict_required_status_checks_policy: true` |
| 3 | ⚠️ **partially — see §5** | the `pull_request` rule can require an approval; it cannot condition on Class A |
| 4 | ✅ **strengthened** | self-approval refused natively, **plus** `require_last_push_approval: true` closes the approve-then-push window, and `dismiss_stale_reviews_on_push: true` invalidates an approval the head has moved past |
| 5 | ✅ | identical to (1) — admin is not a distinguished mode, only a possible list entry |
| 6 | ✅ | the ruleset evaluates direct pushes, not only merges; `non_fast_forward` + `deletion` rules |
| 7 | ✅ | break-glass becomes one enumerated entry: `{actor_id, actor_type, bypass_mode: always \| pull_request}` — nameable, reviewable, removable, and governable as its own act |
| 8 | ✅ **the decisive capability** | **rule insights** (`/repos/{o}/{r}/rulesets/rule-suites`) record each evaluation with actor, ref, timestamp and result, **including bypasses**. Bypass stops being invisible and becomes evidentiary |

⭐ The API surface is reachable from this integration: E0's ruleset read returned `[]` rather
than a permission error. That is weak evidence but real evidence — the witness channel
invariant 8 depends on is not hypothetical here.

---

## 5 · ⚠️ The limitation both architectures share, stated plainly

**Neither branch protection nor rulesets can condition a rule on changed paths or on a pull
request's declared class.** Both target *refs*. There is no `if Class A then require custodian`
rule in either system.

⭐ Therefore invariant 3 is **not a protection rule in either architecture**. It is necessarily
a **required status check** — a CI-computable fact. The protection layer's only job for
invariant 3 is to make that check required and unbypassable, which is (1)+(2)+(5).

This is the single most important structural conclusion of E1, and it reframes the choice:
A and B are not competing implementations of invariant 3. They are competing answers to
*whether the check that implements invariant 3 can be walked past.*

---

## 6 · ⭐ Recommended minimum architecture

**B, plus exactly two changes to the required set.** Smallest structure that establishes all
eight invariants as far as they are establishable.

```text
┌─ ruleset: canonical-admission ─────────────────────────────────┐
│ target        clean-main-no-secrets                             │
│ enforcement   active                                            │
│ bypass_actors []                        ← invariants 1 · 5 · 7  │
│                                                                 │
│ rules                                                           │
│   pull_request                                                  │
│     required_approving_review_count      1                      │
│     require_last_push_approval           true   ← invariant 4   │
│     dismiss_stale_reviews_on_push        true                   │
│   required_status_checks                                        │
│     strict_required_status_checks_policy true   ← invariant 2   │
│     contexts                                                    │
│       Axis 1 — authoritative adjudication                       │
│       sovereignty                                               │
│       check-diagrams                                            │
│       build                                                     │
│       covenant-gates             ← NEW · finding E1-A           │
│       canonical-custody          ← NEW · invariant 3            │
│   non_fast_forward                              ← invariant 6   │
│   deletion                                      ← invariant 6   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.1 `covenant-gates` becomes required

It already computes the classification. Making it required is what turns "this PR is Class A"
from an advisory comment into a fact the next gate may depend on. ⛔ No change to the workflow
itself is proposed here.

### 6.2 `canonical-custody` — the new check implementing invariant 3

A workflow that, on every pull request to canonical:

1. resolves the effective class from the same source `covenant-gates` reads;
2. if the class is **not** Class A → passes, stating that no concurrence was required;
3. if the class **is** Class A → requires an `APPROVED` review by a principal that is
   - present in a **declared custodian record committed in-repo** at a governed path, and
   - distinct from the pull request author, and
   - distinct from **every** commit author and committer on the head;
4. **fails closed** on: absent classification · absent or malformed custodian record · a head
   the approval no longer covers · any resolution it cannot complete.

⭐ Following this project's established exit-code discipline, the check distinguishes in its
annotation — never in its conclusion — between:

```text
REFUSAL          the evidence exists and is insufficient
INSTRUMENT ERROR the evidence could not be resolved
```

⛔ Both are red. An instrument error must never read as concurrence, for the same reason a
missing canonical history must never read as "unauthorized" in the provider-governance guard.

### 6.3 ⭐ Auto-merge replaces the behaviour that produced the defect

E0's temporal record — three required contexts incomplete at admission, margins of one and
five seconds — is the signature of a human merging at the moment the page *looked* green.
`bypass_actors: []` makes that refusal mechanical. **Enabling auto-merge makes the refusal
unnecessary**: the merge is queued once and executes exactly when the last required context
reports green. The operational pressure that produced the bypass is removed rather than
merely blocked.

### 6.4 ⚠️ Org-level placement raises the ceiling by one level

A ruleset defined at the **organization** level is not editable by a repository administrator.
That is a genuine strengthening of invariants 1/5/7 against the repo-admin principal, and it is
the strongest form available. ⛔ Whether org rulesets are available for this repository's plan
and visibility is **not verified here** and must be checked before implementation — this
record asserts the property, not the entitlement.

---

## 7 · ⭐⭐ Two findings the architecture cannot solve

### 7.1 The two-key structure may have no second key

Q7 requires a **distinct principal**. The repository has two collaborators:

```text
Soullab             admin · founder · author of the Class A acts
SoullabCovenant     write · 0 commits authored · type not returned by the collaborators API
```

⚠️ If `SoullabCovenant` is a second account controlled by the same human, it satisfies GitHub
mechanically and defeats invariant 4 constitutionally — **self-review, one indirection out.**
If it is a bot or integration, it cannot supply *human* custody concurrence at all.

⭐ The honest statement, and it must survive into any implementation: **the architecture can
enforce distinct GitHub identity. It cannot establish distinct human judgment.** This is the
same boundary the provider-governance guard already draws about itself —

> The guard proves canonical custody and record identity. It does not prove that a human
> actually ratified the record.

— and it is why the custodian record must be a **governed in-repo object naming the principal
and asserting the distinctness**, so the claim is at least attributable, falsifiable, and
adjudicated rather than assumed from a login.

⛔ **This is a blocking practical gap, not a design detail.** Until a second human principal
exists and is declared, `canonical-custody` on a self-authored Class A pull request will refuse
— correctly. The three available dispositions, none chosen here:

```text
(a) constitute a second human custodian and declare them      → invariant 3 genuinely satisfied
(b) retain a named, separately governed break-glass entry     → invariant 7 shape, honest
(c) accept that self-authored Class A cannot be admitted      → strongest, operationally severe
```

### 7.2 Where one principal holds repo-admin and org-owner, enforcement is evidentiary, not sovereign

An organization owner can edit or delete an organization ruleset. No GitHub-native
configuration makes a gate sovereign over the principal who owns the configuration.

⭐ What architecture B actually buys is a change of *kind*, and it is worth naming exactly:

```text
A   bypass is invisible, reversible, and leaves the configuration identical
B   bypass is an enumerated entry, and the act itself is recorded in rule insights
```

⛔ E1 does not claim B makes bypass impossible. It claims B makes bypass **conspicuous and
durably recorded**, which is the strongest property obtainable and the one E0 went looking for
and could not find.

---

## 8 · Verdict

**Architecture B is chosen**, not because it is more capable in general, but because it is the
smaller architecture *on the invariants that actually failed*:

```text
invariant 7   A has no mechanism at all           B expresses it as data
invariant 8   A cannot produce the record         B produces it in rule insights
invariant 3   A deadlocks on one-owner CODEOWNERS B defers it to a required check, correctly
invariants
1 · 2 · 5 · 6 both satisfy — and A satisfied 2 already when #1494 was admitted
```

⭐ The last line is the point. Invariant 2 was already configured on 2026-09-23 and did not
hold, because invariant 1 did not. **The failure was never the check list; it was the
existence of a principal outside it.** An architecture whose answer to that is a boolean is the
wrong architecture regardless of how it is set.

---

## 9 · ⛔ Explicit non-authorization

⛔ No branch protection modified · ⛔ no ruleset created, edited or deleted · ⛔ no
`bypass_actors` entry proposed for installation · ⛔ no required context added or removed ·
⛔ no workflow authored · ⛔ no custodian record created · ⛔ no custodian principal named,
proposed or constituted · ⛔ no auto-merge enabled · ⛔ no CODEOWNERS change · ⛔ no
retroactive adjudication of #1494 · ⛔ no deployment · ⛔ no production mutation.

## 10 · Owed before implementation, in order

```text
1  founder disposition on §7.1 — (a), (b) or (c). Nothing else can proceed without it
2  verification that org-level rulesets are available for this repository
3  governed path + schema for the custodian record
4  canonical-custody falsifier suite WITH defeat candidates, proven lethal BEFORE the
   check is authored — per the ratified S3 Class B discipline
5  only then: ruleset installation, as its own founder act, with a before/after
   configuration witness
```

⭐ Step 4 is not ceremony. A custody check written against a conforming repository passes by
construction, and its most likely defect is exactly the one this project has now found three
times: **a gate that fires for the wrong reason is not evidence.**

## 11 · Standing

```text
E0                          CLOSED · outcome D (no durable bypass marker; architecture explains it)
E1                          DESIGN DELIVERED · architecture B chosen · ⛔ NOT INSTALLED
finding E1-A                covenant-gates not required — Class A determination advisory
CODEOWNERS deadlock         NAMED · ⛔ not repaired
second human custodian      ⛔ DOES NOT EXIST · founder disposition owed
repository settings         UNCHANGED
production                  UNTOUCHED
```

⭐ *The gate did not fail because the wrong checks were required. It failed because the
enforcement had a principal-shaped hole, and nothing in the architecture was obliged to
remember that anyone walked through it.*
