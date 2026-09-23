# CANONICAL-ADMISSION-ENFORCEMENT-01 · E1
## Fail-Closed Canonical Admission — Enforcement Architecture Design

**Date:** 2026-09-23 · **Acts:** founder authorization `CANONICAL-ADMISSION-ENFORCEMENT-01 / E1`
· founder adjudication + reauthorization `E1R1`
**Canonical base:** `b4f73ac4ccd9cb96e6b2b6dc7b682e689c77771f`
**Disposition:** ⭐ **ARCHITECTURE B ACCEPTED · SECOND-CUSTODIAN RULING (a) RECORDED** ·
⛔ **DESIGN ONLY — NO REPOSITORY SETTING MUTATED · NO WORKFLOW ADDED · NO PROTECTION CHANGED ·
NO CUSTODIAN CONSTITUTED · PRODUCTION UNTOUCHED**

⛔ This record designs an enforcement architecture. It installs none of it. Every finding below
is either an E0-established fact, a read-only repository observation made during E1, or a
reasoned property of a GitHub mechanism — each labelled as such.

### E1R1 — what this revision changed

`E1R1` incorporates the founder adjudication and narrows four documentary claims. ⭐ **The
architecture is unchanged**; the repairs constrain what the record is entitled to say.

```text
repair 1  §3.1  CODEOWNERS deadlock is a CURRENT-STATE finding, not a permanent
                incapacity of classic branch protection
repair 2  §3.2  the forensic absolute is removed — E0's outcome D is preserved,
                inaccessible audit evidence remains epistemically open
repair 3  §4    Rule Insights are the mechanism POSITIVELY ESTABLISHED in E1,
                ⛔ not claimed exclusive across every GitHub audit surface
repair 4  §5    the shared limitation is stated as this project's SEMANTIC rule,
                ⛔ not as a general claim about GitHub path capabilities

ruling    §7.1  option (a) · interim (c) · ⛔ (b) not a second key
ruling    §4.1  bypass_mode: exempt prohibited
ruling    §4.2  break-glass never substitutes for concurrence
ruling    §6.2  canonical-custody contract chain accepted
ruling    §6.3  auto-merge stated as ALL merge requirements
ruling    §6.4  org-level preferred · entitlement ⛔ not asserted
ruling    §7.3  custodian record is a governed human assertion
```

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
| 3 | ⛔ **deadlocked in the current CODEOWNERS state** | see below |
| 4 | ✅ | GitHub refuses author self-approval natively |
| 5 | ✅ *while the boolean is true* | same single boolean as (1) |
| 6 | ✅ | required reviews imply PR-only updates; force-push and deletion disabled |
| 7 | ❌ | classic protection has **no break-glass concept**. Bypass is `enforce_admins: false` — unnamed, unscoped, unexpiring, unattributed |
| 8 | ❌ **decisive** | see below |

### 3.1 ⛔ The CODEOWNERS deadlock (invariant 3) — a current-state finding

⚠️ **This is a finding about the repository's present CODEOWNERS state, not a permanent
incapacity of classic branch protection.** `JEV-INT-01R3R2` adjudication, repair 1.

Current state:

```text
current Class A CODEOWNERS
→ @Soullab only
```

`@Soullab` is also the author of the Class A acts, and GitHub does not permit an author to
approve their own pull request. Therefore:

```text
require_code_owner_reviews: true
        +  CODEOWNERS Class A → @Soullab
        +  PR authored by Soullab
        =  a required review that no principal is permitted to give
```

⭐ **Under the current one-owner CODEOWNERS state, hardened classic branch protection deadlocks
a self-authored Class A pull request whenever code-owner approval is required.** The pull
request is unmergeable and the only exit is administrator bypass — the precise authority
invariant 5 exists to remove.

⛔ **The narrower claim is the durable one.** If a genuinely distinct second human were later
constituted and named as an appropriate code owner, classic protection could technically obtain
an independent approval. **Architecture A is therefore rejected for the enforcement and
evidence reasons in §3.2 and §8, not because concurrence is impossible under every conceivable
CODEOWNERS configuration.**

### 3.2 ⛔⛔ The witness gap (invariant 8) — and how it relates to E0's outcome D

Toggling `enforce_admins` off, merging, and toggling it back leaves the branch-protection
payload **byte-identical before and after**. The configuration is readable; the *interval* is
not. A point-in-time read of classic protection does not establish that the gate was in force
at the moment of a past admission.

⚠️ **The precise statement, and it preserves E0's D rather than converting it to C**
(adjudication repair 2):

> Architecture A supplies no ruleset-native per-evaluation bypass record comparable to Rule
> Insights. E0 recovered no explicit bypass marker from the surfaces available to it. Other
> inaccessible historical or audit evidence remains epistemically open.

⛔ E1 does **not** claim that no further forensic work could ever produce such evidence.
Organization audit surfaces and other historical records were not reachable from E0's tooling,
and unreachable is not the same as non-existent. What E1 asserts is the forward-looking
architectural property: **classic protection has no mechanism whose job is to create that
record, so a future admission under A would leave the same gap by construction.**

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
| 7 | ✅ | break-glass becomes one enumerated entry: `{actor_id, actor_type, bypass_mode}` — nameable, reviewable, removable, and governable as its own act. ⛔ See §4.1 on `bypass_mode` |
| 8 | ✅ **the decisive capability** | **Rule Insights** (`/repos/{o}/{r}/rulesets/rule-suites`) record ruleset evaluations with actor, ref, timestamp and result, **including bypasses**. Bypass stops being invisible and becomes evidentiary |

⚠️ **Claim discipline on invariant 8** (adjudication repair 3): Rule Insights are the
**GitHub-native mechanism positively established in E1** for recording ruleset evaluations and
bypasses as such — GitHub documents them as showing actions that passed, failed, or bypassed
rulesets. ⛔ E1 does **not** claim exclusivity across every GitHub audit surface; other audit
surfaces were not reachable and are not ruled out.

⭐ The API surface is reachable from this integration: E0's ruleset read returned `[]` rather
than a permission error. That is weak evidence but real evidence — the witness channel
invariant 8 depends on is not hypothetical here.

### 4.1 ⛔ `bypass_mode: exempt` is prohibited in any future break-glass design

GitHub's ruleset API documents `bypass_mode: exempt` as meaning **rules are not run for that
actor and no bypass audit entry is created.**

⛔⛔ **That mode destroys the exact property for which Architecture B is chosen.** A bypass that
produces no evaluation record is indistinguishable, after the fact, from the classic-protection
toggle this lane exists to retire.

⛔ Therefore, should a break-glass path ever be separately adjudicated (§4.2 / §7.1), it must
explicitly exclude:

```text
bypass_mode = exempt
```

unless a separately adjudicated design **knowingly accepts that loss of evidence and says so**.
⛔ It may not be reached by default, by convenience, or by silence.

### 4.2 ⛔ Break-glass is not a second key — founder ruling

⛔ Break-glass is **not selected** as the ordinary second key. A break-glass path may be
considered later **only** as a separately governed emergency mechanism, and if one is ever
created:

```text
⛔ it must not satisfy canonical-custody
⛔ it must not count as independent concurrence
⛔ it must never afterward present as an ordinary gated admission
⭐ its use must be conspicuous
⭐ it must generate durable evidence
⭐ it must require a separate Founder act
```

---

## 5 · ⚠️ The limitation both architectures share, stated precisely

⚠️ **Stated narrowly** (adjudication repair 4 — the earlier wording claimed more about
GitHub's general path capabilities than the finding supports; rulesets do carry path-related
rule capabilities):

> Neither classic branch protection nor a branch ruleset natively expresses this project's
> semantic rule: *“if this pull request is classified Class A, require concurrence from the
> governed custody principal.”*

That condition is **project-specific and classification-derived**, not a ref or path predicate,
and no native rule in either system evaluates it.

⭐ Therefore invariant 3 is **not a protection rule in either architecture**. It is necessarily
a **required status check** — a CI-computable fact. The protection layer's only job for
invariant 3 is to make that check required and unbypassable, which is (1)+(2)+(5).

This is the single most important structural conclusion of E1, and it reframes the choice:
A and B are not competing implementations of invariant 3. They are competing answers to
*whether the check that implements invariant 3 can be walked past.*

---

## 6 · ⭐⭐ Accepted minimum architecture — ARCHITECTURE B

⭐ **Accepted by founder adjudication** as the chosen architecture. **B, plus exactly two
changes to the required set.** Smallest structure that establishes all eight invariants as far
as they are establishable.

```text
┌─ ruleset: canonical-admission ─────────────────────────────────┐
│ target        clean-main-no-secrets                             │
│ enforcement   active                                            │
│ ordinary bypass actors                                          │
│               NONE                      ← invariants 1 · 5 · 7  │
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

⭐ **Contract direction accepted by founder adjudication, subject to later falsification.** For
a Class A pull request, every link must hold:

```text
classification established
        ↓
declared custodian exists
        ↓
APPROVED review exists
        ↓
review principal is governed custodian
        ↓
custodian GitHub identity ≠ PR author
        ↓
custodian GitHub identity ≠ prohibited self identities
        ↓
approval applies to current head
        ↓
PASS
```

A workflow that, on every pull request to canonical:

1. resolves the effective class from the same source `covenant-gates` reads;
2. if the class is **not** Class A → passes, stating that no concurrence was required;
3. if the class **is** Class A → walks the chain above, where the prohibited self identities
   include the pull request author and **every** commit author and committer on the head;
4. **fails closed** on anything unknown, malformed, missing, stale or unresolved: absent
   classification · absent or malformed custodian record · a head the approval no longer
   covers · any resolution it cannot complete.

⭐ Following this project's established exit-code discipline, the check distinguishes in its
annotation — never in its conclusion — between:

```text
REFUSAL           evidence resolved and insufficient
INSTRUMENT ERROR  required evidence could not be resolved
```

⛔ **Both are RED. Neither may degrade to PASS.** An instrument error must never read as
concurrence, for the same reason a missing canonical history must never read as "unauthorized"
in the provider-governance guard.

### 6.3 ⭐ Auto-merge replaces the behaviour that produced the defect

E0's temporal record — three required contexts incomplete at admission, margins of one and
five seconds — is the signature of a human merging at the moment the page *looked* green.
An empty ordinary-bypass set makes that refusal mechanical. **Enabling auto-merge makes the
refusal unnecessary.**

⚠️ **Stated exactly** (adjudication §VIII):

> Auto-merge executes only after **all merge requirements** are satisfied.

⛔ Not *“when the last required status context turns green.”* Required reviews, custody
concurrence and other merge requirements may remain outstanding after every check is green,
and a formulation that names only status contexts would quietly re-authorize the race it
exists to remove. ⭐ The accepted operational principle is narrower and sufficient: **remove
the incentive to race a nearly-green page.**

### 6.4 ⚠️ Org-level placement raises the ceiling by one level

A ruleset defined at the **organization** level is not editable by a repository administrator.
That is a genuine strengthening of invariants 1/5/7 against the repo-admin principal, and it is
**accepted as the preferred stronger location if entitlement exists.**

⛔ **Availability is not asserted.** GitHub documents organization-level rulesets for
organizations on GitHub Enterprise plans, so entitlement verification is **mandatory before
implementation** — this record asserts the property, not the entitlement.

⛔ **If organization-level rulesets prove unavailable, return for adjudication.** Silently
falling back to a weaker repository-level design is not authorized.

---

## 7 · ⭐⭐ Two findings the architecture cannot solve

### 7.1 The second key — founder ruling: OPTION (a)

Q7 requires a **distinct principal**. The repository has two collaborators:

```text
Soullab             admin · founder · author of the Class A acts
SoullabCovenant     write · 0 commits authored · type not returned by the collaborators API
```

⛔⛔ **Do not assume `SoullabCovenant` satisfies this requirement.** Its login identity alone
proves nothing about whether it represents another human, another account controlled by the
Founder, a service identity, or an integration. If it is a second account of the same human it
satisfies GitHub mechanically and defeats invariant 4 constitutionally — **self-review, one
indirection out.** If it is a bot or integration, it cannot supply *human* custody concurrence
at all.

⭐ It may satisfy the custodian role **only after a separately governed act** establishes the
human principal behind it **and** establishes that principal as distinct from the Founder.

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
— correctly.

#### ⭐⭐ FOUNDER RULING — OPTION (a)

```text
CHOSEN      (a) constitute a genuinely distinct human custodian

            The second key must be a different HUMAN JUDGMENT,
            not merely a second GitHub credential.

Soullab                  Founder / substantive adjudicator
second custodian         different human person
                         separately controlled GitHub identity
                         governed custody role
```

⛔ **(b) is NOT selected as the ordinary second key** — see §4.2. Break-glass is possible only
as later, separate emergency law, and never as a substitute for concurrence.

⭐ **(c) is the INTERIM CONSEQUENCE, not the chosen long-term architecture.** Until a valid
second human custodian is constituted:

```text
self-authored Class A canonical admission  =  FAIL CLOSED
```

⛔⛔ **No administrator bypass may be used merely because a custodian has not yet been
constituted.** The absence of a second key is a reason to constitute one, never a licence to
walk past the gate.

⭐ The constitutional principle, stated by the founder at adjudication: *Founder authority
determines what may enter; it does not exempt the Founder from the evidence required for
entry.*

### 7.2 Where one principal holds repo-admin and org-owner, enforcement is evidentiary, not sovereign

An organization owner can edit or delete an organization ruleset. No GitHub-native
configuration makes a gate sovereign over the principal who owns the configuration.

⭐ What architecture B actually buys is a change of *kind*, and it is worth naming exactly:

```text
A   bypass is invisible, reversible, and leaves the configuration identical
B   bypass is an enumerated entry, and the act itself is recorded in rule insights
```

⛔ E1 does not claim B makes bypass impossible. It claims B makes bypass **conspicuous and
durably recorded** — the strongest property obtainable, and the one E0 went looking for and did
not recover from the surfaces available to it.

### 7.3 ⭐ The human-distinctness boundary, and what the custodian record must bind

> Software can prove distinct GitHub identities. It cannot prove distinct human consciousness
> or independent human judgment merely from account identity.

⛔ Therefore the custodian record must be a **governed human assertion**, never an inference
from GitHub metadata. It should minimally bind:

```text
custodian human identity
GitHub login
GitHub immutable user id
custody role
explicit assertion of human distinctness from Founder
scope of authority
effective date
authorizing Founder act
revocation status / supersession path
```

⭐ `canonical-custody` proves that the **repository evidence matches that governed record**.
⛔ It does not independently prove the metaphysical or social fact that two accounts belong to
two distinct humans. The login is checkable; the distinctness is asserted, attributable, and
falsifiable — which is the most a mechanism can carry and exactly what this project's
provider-governance guard already says about itself.

---

## 8 · Verdict — ⭐ ARCHITECTURE B ACCEPTED

**Architecture B is chosen**, not because it is more capable in general, but because it is the
smaller architecture *on the invariants that actually failed*:

```text
invariant 7   A has no break-glass mechanism      B expresses bypass as enumerated data
invariant 8   A creates no per-evaluation record  B records evaluations in Rule Insights
invariant 3   A deadlocks under the CURRENT       B defers it to a required check, correctly
              one-owner CODEOWNERS state
invariants
1 · 2 · 5 · 6 both satisfy — and A satisfied 2 already when #1494 was admitted
```

⚠️ Row 3 is a **current-state** rejection reason (§3.1); the durable reasons are rows 7 and 8.
⚠️ Row 8 says A creates no such record **going forward** — it does not assert that no other
historical or audit surface could ever hold one (§3.2).

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

⭐ Step 1 is **DISCHARGED** by this adjudication: option (a), with (c) as the interim
fail-closed consequence. The remaining sequence belongs to the next act, `E2`, which is
**not yet authorized**:

```text
1  ✅ founder disposition on §7.1 — OPTION (a) RULED
2  a real second human principal exists            → governed custodian record
3  organization ruleset entitlement                → VERIFIED, not assumed
4  governed path + schema for the custodian record
5  canonical-custody contract → defeat candidates → lethality-proven falsifier suite,
   all BEFORE the check is authored — per the ratified S3 Class B discipline
6  only then: implementation authorization — ruleset installation as its own founder
   act, with a before/after configuration witness
```

⭐ Step 5 is not ceremony. A custody check written against a conforming repository passes by
construction, and its most likely defect is exactly the one this project has now found three
times: **a gate that fires for the wrong reason is not evidence.**

## 11 · Standing

```text
E0                          CLOSED · outcome D PRESERVED
                            (no bypass marker on the surfaces available to E0;
                             other historical/audit evidence epistemically open)
E1                          SUBSTANTIVELY PASS · ⭐ ARCHITECTURE B ACCEPTED
E1R1                        claim precision + custodian ruling incorporated (this act)

founder second-key ruling   ⭐ OPTION (a) — genuine second human custodian
until constituted           self-authored Class A = FAIL CLOSED  (interim (c))
break-glass                 ⛔ NOT a second key · later separate emergency law only
                            ⛔ bypass_mode: exempt prohibited unless separately adjudicated

finding E1-A                covenant-gates not required — Class A determination advisory
CODEOWNERS state            Class A → @Soullab only · current-state deadlock NAMED
                            ⛔ not repaired · ⛔ no CODEOWNERS change authorized
second human custodian      ⛔ DOES NOT EXIST · SoullabCovenant ⛔ NOT ASSUMED to satisfy it
org ruleset entitlement     ⛔ NOT VERIFIED

implementation population   0
repository-setting mutation 0
production mutation         0

next                        E2 — custodian constitution · entitlement witness ·
                            canonical-custody contract + falsifier design
                            ⛔ NOT YET AUTHORIZED
```

⭐ *The gate did not fail because the wrong checks were required. It failed because the
enforcement had a principal-shaped hole, and nothing in the architecture was obliged to
remember that anyone walked through it.*
