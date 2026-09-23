# CANONICAL-ADMISSION-ENFORCEMENT-01 · E2
## Custodian Eligibility + Ruleset Entitlement + Authoritative Classification / Canonical-Custody Contract + Falsifier Design

**Date:** 2026-09-23  
**Act:** Founder authorization CANONICAL-ADMISSION-ENFORCEMENT-01 / E2  
**Canonical base:** 840194ba859bd5a497fc939c94329ee972ca3f80  
**Governing E1 blob:** eeaf6ff4f8ffa992656bb021ff9d2f15db1370c8  
**Revision:** E2R1 — label-authority + lawful over-declaration coherence repair  
**Disposition:** DESIGN + READ-ONLY EVIDENCE ONLY · CUSTODIAN_UNRESOLVED · ORG_RULESET_ENTITLEMENT_UNRESOLVED · NOTHING INSTALLED

This record establishes preconditions for a later implementation act. It creates no ruleset, workflow, custodian, required context, CODEOWNERS change, repository setting, organization setting, deployment, or production mutation.

---

## 0. E2R1 — what this revision changed

⭐⭐ **FOUNDER RULING: labels are diagnostic projections only. They may neither authorize nor
refuse admission.** Finding **E2-A** ESTABLISHED: the superseded §C5 made projected labels
admission authority, contradicting §C4 and the contract's own premise.

~~~text
§C5   CLASS_LABEL_CONFLICT WITHDRAWN as a refusal · labels diagnostic only
§C5a  both halfway repairs REFUSED, with the reason
§C5b  finding E2-A recorded — refused lawful states · inverted the incentive
§C7   refusal enumeration narrowed · DIAGNOSTIC channel added
§G    CLASS_LABEL_CONFLICT removed from the refusal reasons
§H    D10 → metamorphic pair D10-A / D10-B · D12 → PASS + diagnostic
      P22 lawful over-declaration · P23 orthogonal frontier · ⚠️ P24 added (see §H)
§I1   M12 redefined · M12a · M12b · M12c · M12d · M22 added
§I2a  CROSS-CLAUSE COHERENCE — a new falsifier class
§I3   witness EXECUTED — reference 25/25 · mutants 26/26 dead · 0 survivors
~~~

⭐ **The methodological finding is now structural, not a remark.** The original `21/21` was true
and proved evaluator ↔ specification conformance. It could not reach specification ↔
specification coherence, because every fixture was derived from the clause it tested. §I2a makes
that a distinct falsifier class rather than a lesson.

⛔ **Unchanged by this revision:** both UNRESOLVED findings, the custodian-record schema, the
exact-head custody semantics, the error semantics, and every non-authorization.

---

## 1. Freshness and fixed authority

At execution:

~~~text
canonical                         840194ba859bd5a497fc939c94329ee972ca3f80
E1 design blob                    eeaf6ff4f8ffa992656bb021ff9d2f15db1370c8
repository rulesets               []
canonical protection enforcement non_admins
required contexts                 build
                                  check-diagrams
                                  sovereignty
                                  Axis 1 — authoritative adjudication
repository visibility             public
allow_auto_merge                  false
~~~

The canonical E1 design law is therefore in force as governance. Its enforcement architecture remains uninstalled.

---

# A. Custodian eligibility finding

## A1. Evidence actually available

Read-only GitHub permission evidence:

~~~text
Soullab           repository permission  admin
SoullabCovenant   repository permission  write
~~~

No accessible evidence establishes that SoullabCovenant is:

- a distinct human from the Founder;
- controlled exclusively by a distinct human for custody concurrence;
- willing to serve as the independent custodian;
- governed by an active attributable custodian record.

The public-user and collaborator-list surfaces needed to infer more were not available through this connector. More importantly, even an account-type field would not prove human distinctness.

## A2. Finding

> CUSTODIAN_UNRESOLVED

SoullabCovenant is not constituted by this act.

A second GitHub credential is not the second key. The second key is an independent human judgment carried through a separately controlled GitHub identity and an active governed record.

Until constitution, the governing requirement remains:

~~~text
self-authored Class A canonical admission = FAIL CLOSED
~~~

No administrator bypass is authorized merely because the second key is absent.

---

# B. Organization-ruleset entitlement finding

## B1. Repository-level evidence

The repository ruleset collection is readable and currently returns:

~~~json
[]
~~~

The repository is public. Current GitHub documentation states that repository rulesets are available for public repositories across GitHub Free organization plans and paid plans.

## B2. Organization-level evidence boundary

The connector cannot read:

- organization plan metadata;
- organization ruleset collection/capability metadata;
- organization administration entitlement.

GitHub documentation makes organization-level rulesets plan-dependent. That describes product capability, not this organization's entitlement.

## B3. Finding

> ORG_RULESET_ENTITLEMENT_UNRESOLVED

Do not infer unavailable from an inaccessible organization endpoint.

Do not silently fall back to a repository-level ruleset. If direct entitlement inspection later shows organization-level placement unavailable, that fallback requires Founder adjudication.

---

# C. Authoritative classification contract

## C1. Contract identity

Proposed contract identifier:

~~~text
cae-classification-v1
~~~

Proposed governed specification path for a later act:

~~~text
docs/canon/CANONICAL_ADMISSION_CLASSIFICATION_CONTRACT.json
~~~

This path is proposed only. No file is created by E2.

The contract exists to prevent three independently editable classification vocabularies across:

~~~text
Layer 1   auto-labeler
Layer 2   covenant-gates
Layer 3   canonical-custody
~~~

## C2. Inputs

Every evaluation uses freshly fetched current PR state, not cached event payload:

~~~text
target_branch
head_sha
changed_paths at head_sha
current PR body
current PR labels
~~~

Labels are projections/diagnostics, not classification authority.

The evaluator must not trust a stale event payload when current PR state can be fetched.

## C3. Canonical path vocabularies

Current Class A / sacred floor:

~~~text
lib/safety/
lib/memory/
lib/consciousness/
lib/session/
app/api/session/
~~~

Future governance records that define the admission mechanism itself are intrinsically Class A even though they are documentation:

~~~text
docs/canon/CANONICAL_ADMISSION_CLASSIFICATION_CONTRACT.json
docs/canon/CANONICAL_ADMISSION_CUSTODIANS.json
~~~

Current Class B structural floor:

~~~text
database/migrations/
lib/auth/
app/api/auth/
.github/workflows/
scripts/deploy*
~~~

Current frontier-dependent paths:

~~~text
lib/ai/ClaudeService.ts
lib/ai/modelService.ts
lib/sovereign/maiaService.ts
lib/ai/providers/
~~~

## C4. Declaration and precedence

The PR body is the authoritative human declaration. Exactly one classification checkbox must be selected from:

~~~text
class-a
frontier-dependent
class-b
class-c
~~~

Zero selections:

~~~text
REFUSAL · CLASS_DECLARATION_MISSING
~~~

More than one selection:

~~~text
REFUSAL · CLASS_DECLARATION_CONFLICT
~~~

Risk precedence for minimum-class comparison:

~~~text
class-a             4
frontier-dependent  3
class-b             2
class-c             1
~~~

Path-derived minimum is computed independently:

1. Any sacred/intrinsic-Class-A path -> minimum class-a.
2. Else any frontier path -> minimum frontier-dependent.
3. Else any Class B path -> minimum class-b.
4. Else -> minimum class-c.

If declared rank is below the path-derived floor:

~~~text
REFUSAL · DECLARED_BELOW_PATH_MINIMUM
~~~

If declared rank meets or exceeds the floor, effective_class is the declared class.

A separate frontier_required boolean is true whenever a frontier path is touched, even if the effective class is class-a. This preserves frontier verification obligations inside a higher-risk Class A change.

## C5. Label semantics

⭐⭐ **FOUNDER RULING (E2R1): labels are diagnostic projections only. They may neither
authorize nor refuse admission.**

~~~text
no label raises effective_class
no label lowers effective_class
no label refuses admission
no label is required for admission
~~~

- Missing label: does not change the result.
- Hand-removed `class-a` label: cannot downgrade a sacred/Class-A change.
- A recognized class label diverging from `effective_class`: **DIAGNOSTIC ONLY** — reported,
  never a refusal.
- Operational labels such as `requires-founder` or `requires-council` are diagnostic
  projections only.
- `frontier-dependent` is compared diagnostically with `frontier_required`. ⛔ It is **not
  mutually exclusive** with an effective Class A determination.

⛔ **`CLASS_LABEL_CONFLICT` is withdrawn as a refusal reason and leaves the admission decision
entirely.** It survives only as a diagnostic signal name.

### C5a. Why the halfway repairs were refused

⛔ Two narrower fixes were available and are **not** taken:

~~~text
refuse only when the label is HIGHER than effective_class
special-case frontier-dependent against class-a
~~~

Both preserve the defect. A rule that refuses on *some* label divergence still makes mutable
metadata admission authority, and the contract's own premise (§C2: *labels are projections,
not classification authority*) then holds only in the cases someone remembered to exempt.
⭐ The ruling removes the authority rather than narrowing its blast radius.

This makes Layer 1 useful without making mutable metadata constitutional authority.

### C5b. ⛔ The defect this repairs — finding E2-A

⚠️ **The superseded §C5 refused lawful states, and the incentive ran backwards.**

`auto-labeler` labels the **path-derived floor**. §C4 permits declaring **above** the floor. The
superseded rule refused every such lawful over-declaration:

~~~text
PR touches database/migrations/ · author declares Class A out of caution
  auto-labeler → class-b            (the floor)
  C4           → effective class-a  (lawful · 4 ≥ 2)
  superseded C5 → REFUSAL · CLASS_LABEL_CONFLICT
~~~

⭐⭐ The frontier case was sharper still, because §C4 **explicitly blesses** the co-occurrence
(*“frontier_required is true … even if the effective class is class-a”*) while the superseded
§C5 refused it. `auto-labeler` guards `class-b` against `class-a` and leaves
`frontier-dependent` unguarded — correctly, since frontier obligations are orthogonal to risk
class. The superseded rule did not inherit that:

~~~text
PR touches lib/memory/ + lib/sovereign/maiaService.ts
  auto-labeler → class-a AND frontier-dependent   (automatic · unguarded)
  C4           → class-a + frontier_required=true (explicitly lawful)
  superseded C5 → REFUSAL · CLASS_LABEL_CONFLICT
~~~

⛔ Not contrived: that path pair is the shape of ordinary conversational-memory work in this
repository.

⭐⭐ **The incentive inversion was the worst part.** D10 made a *hand-removed* `class-a` label
PASS, while leaving the automatic label untouched produced RED. **The contract rewarded metadata
tampering and punished leaving the evidence alone** — in a lane whose purpose is refusing mutable
metadata as authority.

⭐ **Root cause:** `frontier-dependent` was given two incompatible jobs — rank 3 in §C4's risk
ordering *and* an orthogonal obligation boolean — and the superseded §C5 implemented only the
first reading.

## C6. Event replay and stale-state semantics

The eventual validation/custody checks must run on metadata and review events that can change the judgment without changing head_sha, including at least:

~~~text
pull_request:
  opened
  edited
  synchronize
  reopened
  ready_for_review
  labeled
  unlabeled

pull_request_review:
  submitted
  dismissed
  edited where supported
~~~

Each run computes an input fingerprint over at least:

~~~text
head_sha
normalized classification declaration
sorted changed-path set
active custodian-record blob identity
relevant review identities/states
~~~

A future implementation must prove that metadata-only changes cause the required check to re-enter a non-terminal state before admission. This is an explicit implementation falsifier because GitHub required checks are fundamentally commit-associated while some classification inputs are PR metadata.

## C7. Deterministic outputs

~~~text
PASS / CLASS_RESOLVED
  effective_class  = class-a | frontier-dependent | class-b | class-c
  frontier_required = true | false

REFUSAL
  CLASS_DECLARATION_MISSING
  CLASS_DECLARATION_CONFLICT
  DECLARED_BELOW_PATH_MINIMUM

INSTRUMENT_ERROR
  CLASSIFICATION_RESOLVER_UNAVAILABLE
  CHANGED_PATHS_UNAVAILABLE
  CURRENT_PR_STATE_UNAVAILABLE

DIAGNOSTIC  (⛔ never affects the decision)
  CLASS_LABEL_DIVERGENCE
  FRONTIER_LABEL_DIVERGENCE
~~~

⛔ **The diagnostic channel carries no decision weight.** A contract output that can only be
reported and never refused is the mechanical form of *labels are projections*.

UNRESOLVED never becomes green.

---

# D. Custodian-record schema

## D1. Proposed governed path

~~~text
docs/canon/CANONICAL_ADMISSION_CUSTODIANS.json
~~~

No file is created by E2.

## D2. Minimum schema

~~~json
{
  "schema_version": "1",
  "records": [
    {
      "record_id": "string",
      "custodian_human_name": "string",
      "github_login": "string",
      "github_user_id": 0,
      "github_actor_type": "User",
      "role": "canonical_class_a_custodian",
      "distinct_from_founder_assertion": true,
      "exclusive_control_assertion": "string",
      "scope": ["canonical_class_a"],
      "effective_at": "ISO-8601",
      "authorized_by_founder_act": "string",
      "status": "candidate|active|suspended|revoked|superseded",
      "supersedes": null,
      "revocation_or_supersession": null,
      "governed_aliases": []
    }
  ]
}
~~~

## D3. Governance semantics

Creation or amendment is itself Class A governance.

A record becomes usable only when:

1. the specific human has satisfied the constitution threshold;
2. the Founder act names the record and human;
3. the record is canonically admitted;
4. status is active.

Candidate records do not authorize concurrence.

Suspended, revoked, or superseded records are ineligible.

If a custodian is revoked after approving an open PR but before merge, the approval becomes invalid because eligibility is evaluated at admission time.

## D4. Identity authority

Immutable github_user_id is the primary machine identity.

github_login must also match current resolved identity. Same immutable ID with a different current login is:

~~~text
REFUSAL · CUSTODIAN_LOGIN_MISMATCH
~~~

until the governed record is updated. The system must not silently rewrite governance because a username changed.

Matching login with a different immutable ID is:

~~~text
REFUSAL · CUSTODIAN_ID_MISMATCH
~~~

This defeats login-only identity checks.

Duplicate active records for the same immutable ID and scope, contradictory records, or an unreadable schema are:

~~~text
INSTRUMENT_ERROR
~~~

The record is an attributable governance assertion. It does not itself prove metaphysical/social human distinctness.

---

# E. canonical-custody decision contract

## E1. Scope

The future check evaluates every PR targeting canonical.

It never treats missing or inaccessible evidence as concurrence.

## E2. Non-Class-A

If authoritative classification resolves successfully to a non-Class-A class:

~~~text
PASS · NON_CLASS_A
reason: independent custody concurrence not required
~~~

This pass still requires classification itself to be resolved.

## E3. Class A

Every link must hold:

~~~text
authoritative Class A classification
        ↓
active canonical custodian record exists
        ↓
GitHub review evidence is readable
        ↓
APPROVED review by governed custodian exists
        ↓
reviewer actor type is User
        ↓
reviewer immutable GitHub ID matches record
        ↓
reviewer login matches record
        ↓
reviewer is not Founder / governed Founder alias
        ↓
reviewer is not PR author
        ↓
reviewer is not an author/committer principal on the PR commit range
        ↓
review targets exact current head_sha
        ↓
latest relevant review state remains APPROVED
        ↓
custodian remains active at evaluation time
        ↓
PASS · CLASS_A_CUSTODY_SATISFIED
~~~

## E4. Review selection

For the governed custodian, use the latest relevant review state applicable to the exact current head.

An approval-shaped issue comment is never a review.

A dismissed approval is not approval.

A later CHANGES_REQUESTED or dismissal invalidates prior APPROVED state.

The check must consume GitHub review objects, not prose.

---

# F. Head / review custody semantics

## F1. Exact commit identity

Approval covers exact current head_sha, not merely an equivalent tree.

~~~text
review.commit_id == current head_sha
~~~

is required where GitHub exposes commit_id.

Any later commit invalidates the approval until a new approval covers the new head.

This includes:

- ordinary author commits;
- force updates;
- rebases;
- merge commits into the feature branch;
- ancestry/carrier commits;
- bot-authored commits;
- identical-tree/different-commit carriers.

Exact commit identity is deliberate: canonical admission in this programme is commit-custody, not tree-similarity custody.

## F2. Last-push relationship

Native require_last_push_approval remains complementary rather than substitutive.

canonical-custody proves governed reviewer identity and exact-head concurrence.

The ruleset proves the configured last-push/review relationship.

Both must hold.

## F3. Prohibited self identities

Reviewer ID must differ from:

~~~text
PR author GitHub user ID
Founder GitHub user ID
governed Founder alias IDs
any GitHub-resolved author ID in merge-base..head
any GitHub-resolved committer ID in merge-base..head
~~~

The comparison is equality-based. Bot/platform actors elsewhere in history do not poison the candidate merely by existing.

web-flow is not treated as a human self identity. It is a platform merge/signing actor and ordinarily exists only on the post-merge commit, outside the pre-merge PR head.

## F4. Bot-authored commits

A bot-authored later commit changes head_sha and therefore invalidates an older approval.

After a new human custodian approval covers that exact bot-updated head, the bot's presence does not independently invalidate the review unless the reviewer ID equals the bot actor.

## F5. Co-authored metadata

Raw Co-authored-by trailers are not sufficient machine identity evidence.

If a co-author trailer resolves unambiguously through GitHub association or a governed alias to the custodian, treat the custodian as a commit participant and refuse.

If the trailer plausibly identifies the custodian but cannot be resolved reliably:

~~~text
INSTRUMENT_ERROR · COAUTHOR_IDENTITY_UNRESOLVED
~~~

Fail closed rather than pretending independence was proven.

---

# G. Error semantics

~~~text
PASS
  evidence resolved and sufficient

REFUSAL
  evidence resolved and insufficient

INSTRUMENT_ERROR
  evidence required for judgment could not be resolved
~~~

External conclusion:

~~~text
PASS              GREEN
REFUSAL           RED
INSTRUMENT_ERROR  RED
~~~

Representative REFUSAL reasons:

~~~text
CLASS_DECLARATION_MISSING
CLASS_DECLARATION_CONFLICT
DECLARED_BELOW_PATH_MINIMUM
CUSTODIAN_RECORD_ABSENT
CUSTODIAN_NOT_ACTIVE
CUSTODIAN_LOGIN_MISMATCH
CUSTODIAN_ID_MISMATCH
REVIEWER_UNGOVERNED
REVIEWER_IS_FOUNDER
REVIEWER_IS_PR_AUTHOR
REVIEWER_IS_COMMIT_ACTOR
REVIEWER_NOT_HUMAN_ACTOR
APPROVED_REVIEW_ABSENT
REVIEW_STALE_HEAD
~~~

Representative INSTRUMENT_ERROR reasons:

~~~text
CLASSIFICATION_RESOLVER_UNAVAILABLE
CURRENT_PR_STATE_UNAVAILABLE
CUSTODIAN_RECORD_MALFORMED
CUSTODIAN_RECORD_UNREADABLE
REVIEW_API_UNAVAILABLE
COAUTHOR_IDENTITY_UNRESOLVED
AMBIGUOUS_ACTIVE_CUSTODIAN_RECORD
~~~

No catch-all exception handler may return PASS.

⛔ **`CLASS_LABEL_CONFLICT` is absent from this list by the E2R1 ruling** (§C5). It is not a
refusal reason. Label divergence is reported on the diagnostic channel and cannot reach the
decision.

---

# H. Defeat-candidate matrix

The minimum authorized population is retained and extended by the E2R1 repair. Rows D01–D19 are
negative or metamorphic defeat candidates; rows P20–P23 are positive controls.

⚠️⚠️ **P24 EXTENDS THE NAMED REPAIR WITNESS, AND THE REASON IS MECHANICAL, NOT STYLISTIC.**
The authorized witness named `D10-A · D10-B · D12 · P22 · P23`. The mutation run (§I3) shows
that set leaves **M12a — *refuse only when the label ranks higher* — ALIVE**: every named
fixture carries a label at or below `effective_class`, so a rule that refuses only *higher*
labels never fires on any of them and the suite reports green. ⛔ Since the ruling explicitly
refuses that halfway repair, a witness that cannot kill it does not establish the ruling.
**P24 is the state that distinguishes them, and it is `M12a`'s only killer.** ⭐ Founder
adjudication owed on the addition; it is surfaced rather than folded in silently.

⭐ **D10 is now a metamorphic PAIR (D10-A / D10-B), and the pairing is the point.** The two
fixtures differ in **exactly one mutable label** and must produce the **identical** decision.
A single fixture could never express that: under the superseded contract D10-B passed while its
label-present twin was refused, and no one-sided test can detect that a decision moved when the
only thing that changed was metadata. ⛔ A contract in which removing a label changes the
outcome rewards tampering, whichever direction it rewards.

| ID | Scenario | Expected decision | Expected reason / invariant isolated | Mutation killed |
|---|---|---|---|---|
| D01 | Class A, no custodian record | REFUSAL | CUSTODIAN_RECORD_ABSENT | Default-allow when record is absent |
| D02 | Class A, malformed custodian record | INSTRUMENT_ERROR | CUSTODIAN_RECORD_MALFORMED | Parse-error-to-green |
| D03 | Class A, revoked custodian | REFUSAL | CUSTODIAN_NOT_ACTIVE | Ignore custodian status |
| D04 | Class A, approval by Founder but PR author is a different actor | REFUSAL | REVIEWER_IS_FOUNDER | Omit Founder exclusion |
| D05 | Class A, approval by PR author who is not Founder | REFUSAL | REVIEWER_IS_PR_AUTHOR | Omit PR-author exclusion |
| D06 | Correct immutable custodian ID but stale/wrong governed login | REFUSAL | CUSTODIAN_LOGIN_MISMATCH | Ignore login custody |
| D07 | Matching login but wrong immutable ID | REFUSAL | CUSTODIAN_ID_MISMATCH | Login-only identity check |
| D08 | Approval on predecessor head, then ordinary new commit | REFUSAL | REVIEW_STALE_HEAD | Ignore review commit identity |
| D09 | Approval followed by author-controlled carrier commit with equivalent intended substance | REFUSAL | REVIEW_STALE_HEAD | Accept tree/substance equivalence instead of exact head |
| D10-A | Sacred/Class-A PR; automatic `class-a` label **present**; body and paths resolve Class A; genuine current-head custodian approval | PASS | CLASS_A_CUSTODY_SATISFIED | Label presence required for admission |
| D10-B | **Identical state, `class-a` label absent** (hand-removed) | PASS | CLASS_A_CUSTODY_SATISFIED | Treat missing label as downgrade / authority |
| D11 | Sacred path declared Class C | REFUSAL | DECLARED_BELOW_PATH_MINIMUM | Ignore path floor |
| D12 | Body resolves Class A; a divergent recognized class label remains | **PASS** · diagnostic `CLASS_LABEL_DIVERGENCE` | Label divergence is reported, never decisive | **Let a divergent label refuse admission** |
| D13 | Missing classification declaration on otherwise routine PR | REFUSAL | CLASS_DECLARATION_MISSING | Default missing declaration to Class C |
| D14 | Classification resolver unavailable | INSTRUMENT_ERROR | CLASSIFICATION_RESOLVER_UNAVAILABLE | Resolver error defaults green |
| D15 | Review API unavailable | INSTRUMENT_ERROR | REVIEW_API_UNAVAILABLE | Review transport error defaults green |
| D16 | Custodian record unreadable | INSTRUMENT_ERROR | CUSTODIAN_RECORD_UNREADABLE | Record I/O error defaults green |
| D17 | Approval-shaped issue comment; no APPROVED GitHub review | REFUSAL | APPROVED_REVIEW_ABSENT | Treat prose/comment as approval |
| D18 | Bot/integration review where human concurrence is required | REFUSAL | REVIEWER_NOT_HUMAN_ACTOR | Allow non-human reviewer |
| D19 | Second GitHub account approves but has no active governed human custodian record | REFUSAL | REVIEWER_UNGOVERNED | Account distinctness substitutes for human governance |
| P20 | Valid non-Class-A PR; no custodian approval | PASS | NON_CLASS_A | Require custody for every PR |
| P21 | Valid Class-A PR; active distinct-human record; exact-head APPROVED review; reviewer not self | PASS | CLASS_A_CUSTODY_SATISFIED | Over-restrict valid independent concurrence |
| **P22** | **Lawful over-declaration** — Class-B path floor, author declares Class A; `auto-labeler` applied `class-b`; valid Class-A custody | **PASS** · diagnostic `CLASS_LABEL_DIVERGENCE` | Declaring above the floor is lawful (§C4) | Refuse lawful over-declaration |
| **P23** | **Orthogonal frontier obligation** — sacred + frontier paths; effective `class-a` with `frontier_required=true`; `auto-labeler` applied both `class-a` and `frontier-dependent`; valid Class-A custody | **PASS** · `frontier_required=true` | `frontier-dependent` is not mutually exclusive with Class A (§C4) | Treat `frontier-dependent` as contradicting `class-a` |
| **P24** ⚠️ | **Hand-added HIGHER label** — Class-B path floor, author declares Class B, a `class-a` label is added by hand; no custodian approval | **PASS** · `NON_CLASS_A` · diagnostic `CLASS_LABEL_DIVERGENCE` | A label cannot *raise* effective_class any more than it can lower it | Refuse only when the label ranks higher |

Supplemental implementation falsifiers required before installation:

| ID | Scenario | Expected |
|---|---|---|
| S22 | Custodian approved, then record revoked before merge | REFUSAL · CUSTODIAN_NOT_ACTIVE |
| S23 | Contradictory/duplicate active custodian records for same identity/scope | INSTRUMENT_ERROR · AMBIGUOUS_ACTIVE_CUSTODIAN_RECORD |
| S24 | Approval commit and current head have identical trees but different SHAs | REFUSAL · REVIEW_STALE_HEAD |
| S25 | PR body classification edited after prior green check without head change | required context must re-enter evaluation; stale green must not remain admission-sufficient |
| S26 | Custodian review dismissed after prior green check | required context must re-enter evaluation and end RED |
| S27 | Co-author trailer plausibly names custodian but identity cannot be resolved | INSTRUMENT_ERROR · COAUTHOR_IDENTITY_UNRESOLVED |

---

# I. Falsifier lethality specification

## I1. Mutation family

The suite is designed against at least these mutation operators:

~~~text
M01 allow missing custodian record
M02 convert record parse failure to PASS
M03 ignore custodian status
M04 omit Founder exclusion
M05 omit PR-author exclusion
M06 ignore governed-login mismatch
M07 accept login match without immutable-ID match
M08 accept predecessor-head approval
M09 accept equivalent-tree/carrier head
M10 let mutable label determine/downgrade Class A
M11 ignore path-derived minimum
M12 let a divergent label REFUSE admission        (the E2-A defect, as a mutant)
M12a refuse only when the label ranks HIGHER      (halfway repair 1)
M12b special-case frontier-dependent vs class-a   (halfway repair 2)
M13 default missing classification to Class C
M14 resolver failure defaults PASS
M15 review API failure defaults PASS
M16 record I/O failure defaults PASS
M17 accept approval-shaped comment
M18 accept Bot/App concurrence as human
M19 accept any second GitHub account as custodian
M20 require custody for all classes
M21 reject a fully valid independent Class-A approval
M22 make label PRESENCE a precondition of admission
~~~

⭐ **M12a and M12b are the two halfway repairs, carried as mutants on purpose.** Each is a
plausible, competent fix that a reviewer could accept; each leaves mutable metadata with
admission authority in the cases nobody exempted. They are killed by **P22** and **P23**
respectively — which is what makes the ruling's refusal of the halfway options *falsifiable*
rather than a stated preference.

⚠️ **M22 is the mutant the superseded suite could not have carried**, because with only a
label-absent fixture there was nothing to contradict it.

## I2. Lethality criterion

For every mutation above, at least one fixture must change either:

- GREEN/RED outcome; or
- the expected reason class.

A mutant that still produces RED for the wrong reason is not considered killed when the target fixture requires a specific refusal/instrument-error reason.

This preserves the programme rule:

> A gate that fires for the wrong reason is not evidence.

### I2a. ⭐⭐ Cross-clause coherence — a separate falsifier class

⚠️ **The methodological finding from E2-A, made structural.** The original 21/21 was true and
proved the wrong thing:

~~~text
what 21/21 established     evaluator ↔ specification conformance
what it could not reach    specification ↔ specification coherence
~~~

Every fixture was derived from the clause it tested, so a clause that **contradicted another
clause** was invisible: the evaluator agreed with §C5, §C5 disagreed with §C4, and the matrix
had no instrument that could see the second relation. ⛔ This is the same family as every prior
gap in this programme — *a green matrix measures candidate↔reference distance and says nothing
about reference↔contract distance.*

**Cross-clause coherence fixtures are therefore a distinct class**, constructed from a state
that **two clauses both speak to**, never from one clause alone:

~~~text
CC-01  state §C4 declares lawful           must not be refused by §C5    → P22 · P23
CC-02  state differing only in a mutable
       projection                          must not change the decision  → D10-A / D10-B
CC-03  every enumerated REFUSAL reason in
       §G reachable from §C7's outputs     no orphan refusal reason
CC-04  every §C7 output representable in
       §G's conclusion mapping             no unmapped output
~~~

⭐ **CC-03 and CC-04 are the mechanical form of the defect.** The superseded contract listed
`CLASS_LABEL_CONFLICT` in both §C7 and §G, so it was *internally consistent* and still wrong —
which is why CC-01 and CC-02, built from states rather than from enumerations, are the
load-bearing pair. ⛔ Enumeration agreement is not coherence.

⚠️ **Honest limit:** these four are the coherence obligations E2-A actually exposed. They are
⛔ **not** a claim that the clause set has been exhaustively cross-read. A future coherence
defect between clauses no fixture pairs is not excluded by this class existing.

## I3. Synthetic design validation

⭐ **E2R1 EXECUTED the witness rather than recomputing the table.** A synthetic reference
evaluator of the **repaired** contract was written and run against all 25 fixtures, then against
26 mutants. ⛔ Design check only — not the future `canonical-custody` implementation, and it
confers no enforcement authority.

### Reference run — 25 / 25 matched · 0 mismatched

~~~text
D01   REFUSAL          CUSTODIAN_RECORD_ABSENT
D02   INSTRUMENT_ERROR CUSTODIAN_RECORD_MALFORMED
D03   REFUSAL          CUSTODIAN_NOT_ACTIVE
D04   REFUSAL          REVIEWER_IS_FOUNDER
D05   REFUSAL          REVIEWER_IS_PR_AUTHOR
D06   REFUSAL          CUSTODIAN_LOGIN_MISMATCH
D07   REFUSAL          CUSTODIAN_ID_MISMATCH
D08   REFUSAL          REVIEW_STALE_HEAD
D09   REFUSAL          REVIEW_STALE_HEAD
D10-A PASS             CLASS_A_CUSTODY_SATISFIED
D10-B PASS             CLASS_A_CUSTODY_SATISFIED
D11   REFUSAL          DECLARED_BELOW_PATH_MINIMUM
D12   PASS             CLASS_A_CUSTODY_SATISFIED   diag=CLASS_LABEL_DIVERGENCE
D13   REFUSAL          CLASS_DECLARATION_MISSING
D14   INSTRUMENT_ERROR CLASSIFICATION_RESOLVER_UNAVAILABLE
D15   INSTRUMENT_ERROR REVIEW_API_UNAVAILABLE
D16   INSTRUMENT_ERROR CUSTODIAN_RECORD_UNREADABLE
D17   REFUSAL          APPROVED_REVIEW_ABSENT
D18   REFUSAL          REVIEWER_NOT_HUMAN_ACTOR
D19   REFUSAL          REVIEWER_UNGOVERNED
P20   PASS             NON_CLASS_A
P21   PASS             CLASS_A_CUSTODY_SATISFIED
P22   PASS             CLASS_A_CUSTODY_SATISFIED   diag=CLASS_LABEL_DIVERGENCE
P23   PASS             CLASS_A_CUSTODY_SATISFIED   frontier_required=true
P24   PASS             NON_CLASS_A                 diag=CLASS_LABEL_DIVERGENCE

tally   PASS 8 · REFUSAL 13 · INSTRUMENT_ERROR 4 · total 25
~~~

⭐ **D12 moved from REFUSAL to PASS-with-diagnostic. That single row is the repair.**

### Mutation run — 26 mutants · 26 dead · 0 survivors

Reason-sensitive: a mutant that still produces RED for the wrong reason is not counted killed.

~~~text
label-ruling mutants and their EXACT killers

M10   let label downgrade Class A                  D10-B · D12 · P22
M12   let ANY divergent label refuse               D12 · P22 · P24
M12a  refuse only when the label ranks HIGHER      P24                    ← sole killer
M12b  special-case frontier-dependent only         D12 · P22 · P24
M12c  frontier counted as a divergent class label  D12 · P22 · P23 · P24
M12d  frontier treated as mutually exclusive
      with class-a                                 P23                    ← sole killer
M22   require label PRESENCE for admission         D10-B · D12 · P22
~~~

⭐⭐ **Two fixtures are the sole killers of a mutant, and both correspond to a specific sentence
of the ruling.** `P23` alone kills `M12d`, the exact negation of *“`frontier-dependent` … is not
mutually exclusive with an effective Class A determination.”* `P24` alone kills `M12a`, the
first halfway repair. ⛔ Remove either fixture and the ruling becomes unfalsifiable at that
clause while the suite still reports green.

⚠️ **`M12c` and `M12d` were added during the run, for a reason worth recording**: on the first
mutation pass **`P23` killed nothing at all.** It was a positive control that no mutant could
distinguish — by this programme's own standard, a fixture that cannot fail. Rather than delete
it or accept it as decoration, the mutants it *should* discriminate were constructed, and it
became the sole killer of one. ⭐ *A positive control earns its place by naming the wrong
machine it excludes, not by passing.*

### ⚠️ Fixture-construction requirement discovered by the run

`D04` and `D05` are only lethal **by reason** if the excluded principal is *also* an active
governed custodian:

~~~text
D04 must list the Founder      as an ACTIVE custodian record entry
D05 must list the PR author    as an ACTIVE custodian record entry
~~~

⛔ Otherwise removing the exclusion (`M04` / `M05`) yields `REVIEWER_UNGOVERNED` — **RED for a
different reason**, which §I2 does not count as a kill, and the mutant survives while the suite
appears to catch it. ⭐ The hazard is realistic rather than contrived: a Founder listed among
custodians is exactly the configuration a well-meaning administrator would create.

---

# J. Implementation prerequisites

Implementation remains blocked until all of the following are separately established:

1. A real distinct human custodian is identified and constitutionally established, or Founder explicitly adjudicates continued fail-closed operation without one.
2. Organization-level ruleset entitlement is directly resolved.
3. The authoritative classification contract is adjudicated.
4. The custodian-record schema/path is adjudicated.
5. canonical-custody implementation is authored only after the defeat/mutation suite exists.
6. The implementation proves the metadata-only rerun property in S25/S26.
7. The implementation proves exact-head review custody, including carrier and identical-tree cases.
8. The eventual ruleset has no ordinary bypass actor and makes covenant-gates plus canonical-custody required.
9. Before/after ruleset configuration and Rule Insights/rule-suite observability are witnessed.
10. Repository-level fallback, break-glass, auto-merge, CODEOWNERS changes, and workflow refactors remain separate acts unless explicitly authorized.

---

# Historical controls: #1494 and #1495

## #1494

~~~text
same administrator principal
1 / 4 required contexts complete at admission
3 / 4 incomplete
mechanism permitted admission
eventual CI green
~~~

## #1495

~~~text
same administrator principal
same technically bypass-capable protection regime
all 4 required contexts terminal green before merge
expected_head_sha pinned
merge after evidence completed
~~~

Interpretation:

~~~text
#1494  disciplined behavior failed; architecture allowed early admission
#1495  disciplined behavior held; desired behavior was achieved manually
~~~

#1495 is a positive control for behavior, not proof of enforcement.

The difference between the two is human discipline. The implementation programme exists to remove that variable from the ordinary admission path.

---

# Required witness

At E2 presentation:

~~~text
canonical base                     840194ba859bd5a497fc939c94329ee972ca3f80
E1 design blob                     eeaf6ff4f8ffa992656bb021ff9d2f15db1370c8

custodian status                   CUSTODIAN_UNRESOLVED
org ruleset entitlement            ORG_RULESET_ENTITLEMENT_UNRESOLVED

repository rulesets                unchanged: []
canonical required checks          unchanged:
                                   build
                                   check-diagrams
                                   sovereignty
                                   Axis 1 — authoritative adjudication
canonical enforcement              unchanged: non_admins

workflows                          unchanged
CODEOWNERS                         unchanged
repository settings               unchanged by E2
production                         untouched

classification contract            deterministic
custodian schema                    specified
canonical-custody contract          specified
defeat candidates                   complete
mutation/lethality design           each major invariant isolated
implementation                      0
~~~

---

# Explicit non-authorization

E2 authorizes none of the following:

- ruleset creation or mutation;
- branch protection mutation;
- required-check mutation;
- workflow creation or modification;
- auto-labeler modification;
- covenant-gates modification;
- CODEOWNERS modification;
- auto-merge enablement;
- collaborator invitation or permission change;
- GitHub-account creation/mutation;
- real custodian constitution without specific human evidence;
- custodian-record creation;
- canonical-custody deployment;
- break-glass configuration;
- repository or organization setting mutation;
- deployment or production mutation.

---

# Standing

~~~text
CANONICAL-ADMISSION-ENFORCEMENT-01

E0   CLOSED
E1   CANONICAL · CLOSED

E2   DESIGN / EVIDENCE CANDIDATE
     custody PASS · CUSTODIAN_UNRESOLVED · ORG_RULESET_ENTITLEMENT_UNRESOLVED
     unsigned candidate RECORDED, not conflated with custody
     E2-A ESTABLISHED

E2R1 LABEL-AUTHORITY + LAWFUL OVER-DECLARATION COHERENCE REPAIR
     labels diagnostic only — neither authorize nor refuse
     reference 25/25 · mutants 26/26 dead · 0 survivors
     cross-clause coherence added as a falsifier class
     ⚠️ P24 EXTENDS the named witness — sole killer of M12a — adjudication owed

governing requirement
self-authored Class A = FAIL CLOSED

technical repository state
still bypass-capable until later implementation

next
FOUNDER ADJUDICATION OF E2R1
~~~

The design law is in force as governance. The repository has not yet been made technically incapable of violating it.
