# JOP-04 · Effect-Bearing Capability Substrate Census — Instrument

**Issued:** 2026-09-13 · **Method:** read-only census of code, scripts, governance records and
dated proofs. **Stop rule:** a gap found here creates **no permission to build it.**
⛔ **No GitHub write implementation. No effect-bearing capability authorized.**

> **The census's question: do we already possess the primitives needed to answer the eleven
> questions — or only the primitives needed to *read*?**

---

## 1 · The eleven questions

Every proposed effect-bearing capability must be answerable on all eleven. The census determines
**which of these the existing substrate can already answer, and with what artifact.**

| # | Question | What it establishes |
|---|---|---|
| 1 | **EFFECT** | What will change? |
| 2 | **SUBJECT** | What exact object may change? |
| 3 | **AUTHORITY** | Who granted permission for this effect? |
| 4 | **SCOPE** | How narrowly is that permission bounded? |
| 5 | **IDENTITY** | What execution actor actually performs it? |
| 6 | **INTENT** | What specific proposed change was authorized? |
| 7 | ⭐ **INTENT BINDING** | Is the authorization bound to *that* change and no other? |
| 8 | **IDEMPOTENCY** | Can retries cause the effect twice? |
| 9 | **REVERSIBILITY** | Can the prior state actually be restored? |
| 10 | **RECEIPT** | Can we prove what was attempted and what happened? |
| 11 | **DISTRIBUTION** | Is this capability eligible to leave the development boundary? |

Per-primitive census verdict: **PRESENT** (bound to an artifact) · **PARTIAL** · **ABSENT** ·
**UNVERIFIED** (not censused — ⛔ *never a claim of absence*).

### 1a · ⭐⭐ Intent binding — likely load-bearing

It is **not sufficient** to prove:

```text
Kelly authorized github.create_issue
```

The system may eventually need to prove something closer to:

```text
authorized:
  capability     github.create_issue
  repository     SoullabTech/Sovereign
  title          "..."
  body_digest    sha256:...
  labels         [...]
  identity       jarvis-operator
  expiry         ...
```

> **Otherwise authorization of a capability *class* quietly becomes authorization of an arbitrary
> future effect.**

⭐ This is the **write-side cousin of the unforgeable scope patterns already found elsewhere** in
the programme — most directly `lib/manuscript/development/bind.ts`, where `BoundEvidence` is
obtainable only through `bindEvidence` and a digest, never by assertion. **Census obligation:** read
that pattern as prior art and determine whether its shape transfers to authorization objects.

## 2 · ⛔ Do not begin with one effect enum — actively try to falsify it

A single flat verb set —

```text
READ · DRAFT · MUTATE · SEND · DELETE · SPEND
```

— is the design the census must attempt to **defeat**, not assume. Consider three superficially
similar acts:

```text
write local scratch file
write production config
post public GitHub comment
```

All are "writes." **Architecturally they are nowhere near equivalent.** Likewise:

```text
delete disposable temp file
delete unpushed local branch
delete remote production database row
```

Calling all three `DELETE` **does not tell the governance system enough to govern them.**

> ⭐ **Search for the dimensions. Do not invent their final vocabulary.**

## 3 · Provisional decomposition — ⛔ NOT A RULING

Offered as a probe. **Every name here may change; the census may return a different set entirely,
and returning a different set is a success, not a failure.**

```text
STATE EFFECT      NONE · PROPOSE · CREATE · UPDATE · DELETE
EXTERNALITY       CUSTODY_LOCAL · INTERNAL_REMOTE · EXTERNAL
REVERSIBILITY     GUARANTEED · COMPENSATABLE · BEST_EFFORT · IRREVERSIBLE
CONSEQUENCE       ORDINARY · PUBLIC · SECURITY · LEGAL · FINANCIAL
AUTHORIZATION     ONE_SHOT · BOUNDED_SEQUENCE · TIME_BOUNDED · STANDING
AUDIENCE          PRIVATE · TEAM · NAMED_EXTERNAL · PUBLIC
```

⭐ **The architectural possibility being tested:**

> **Authority can be derived from the *intersection of properties* rather than hard-coded per verb.**

That scales when Jarvis eventually encounters capabilities **nobody anticipated when JOP-04 was
written** — which is the condition a governance system is actually judged on. A per-verb table
governs only the verbs someone thought of.

## 4 · Five defeat candidates — look for these **before** architecture is designed

Each can defeat a superficially elegant action gateway. The census reports whether the existing
substrate is already vulnerable to each.

**D1 · Confirmation masquerading as authorization**

```text
"Are you sure?"  →  YES
```

⛔ Does **not** prove *what exact effect* was authorized. A yes is a mood, not an object.

**D2 · Capability authorization without object scope**

```text
github.create_issue = allowed          ⛔ dangerously broader than

github.create_issue
  repo = X · content = digest Y · once · before expiry Z
```

**D3 · Claimed reversibility** — an API exposing `delete` and `restore` does **not** establish that
*this specific effect* can be restored *completely*. Reversibility is a property of the act, not of
the endpoint pair.

**D4 · Retry duplication**

```text
request → network uncertainty → retry
```

must not become `issue #481` **and** `issue #482`.

**D5 · Receipt without attributable execution identity** — `Jarvis created issue #481` is weak
evidence unless **credentials, capability invocation, authorization object and resulting remote
identity are bound together.** An unbound log line is a story about an effect, not evidence of one.

## 5 · GitHub as first specimen — a nearly controlled experiment

```text
KNOWN SUBSTRATE                 UNKNOWN SUBSTRATE
git.rev_parse                   git.create_branch
git.log            ── observation → effect frontier ──►   git.apply_patch
repo.grep                       git.commit
                                github.open_pr
                                github.merge_pr
```

⭐ **The domain barely changes. Authority changes. That makes failures interpretable** — a defect
cannot hide behind an unfamiliar domain.

### 5a · The smallest first effect — smaller than `git.commit`

```text
create a uniquely named disposable local branch
from a pinned commit
inside a disposable repository fixture
```

It carries **almost every property JOP-04 must study** — state mutation · execution identity ·
precondition · object scope · conflict handling · idempotency · receipt · reversibility · stale
authorization · recovery — **without publication, externalization, money, other humans, or
production.**

⛔ **A design subject for the census, not a build task.** Nothing here authorizes creating it.

### 5b · The experimental ladder — each rung adds one authority dimension

```text
disposable local branch  →  local patch  →  local commit
   →  remote branch  →  draft PR  →  open PR  →  merge
```

⚠️ The census names **which dimension each rung introduces**. It does not schedule the rungs.
⭐ Note where the ladder crosses `EXTERNALITY: EXTERNAL` and `AUDIENCE: PUBLIC` — at *remote branch*
and *draft PR* respectively, **not at merge**. A ladder read as "risk rises at the end" would be
wrong about its own shape.

## 6 · Prior art rule — mechanism may survive, semantic authority does not

The repository contains older `lib/consciousness*` integration code (`ConsciousnessIntegration` and
relatives). Some may hold genuinely good engineering: retry algorithms, adapter lifecycle, transport
abstraction, circuit breakers.

> ⭐ **Those may be independently rediscovered as engineering mechanisms.**
> ⛔ **No salvage-by-renaming.** A `ConsciousnessIntegration` cannot become an `OperatorIntegration`
> through vocabulary replacement while preserving hidden psychological assumptions.

**The census treats such code as FOREIGN PRIOR ART, not inherited JOP substrate.** A mechanism is
admissible only when re-derived against JOP-04's own requirements — and admitting it is a later act,
never this census's.

## 7 · What this census may not do

⛔ No capability implemented, registered, wired or shipped · no GitHub write code · no disposable
fixture built · no effect vocabulary ruled · no rung scheduled · no prior-art module adopted,
renamed or moved · no distribution of any mutating authority (JOP-01) · **no member in the operator
graph** (Living Spiral R2) · no change to Desktop custody or the read capability substrate.

---

**Output:** a per-primitive verdict table (§1) with artifacts, a defeat-candidate exposure report
(§4), a dimensions finding (§2–3, which may reject the provisional set), a prior-art disposition
(§6), and the capability-registry binding question the charter §4 leaves open.

> **Observation is not authority. Capability is not permission. Permission is not an effect.**
