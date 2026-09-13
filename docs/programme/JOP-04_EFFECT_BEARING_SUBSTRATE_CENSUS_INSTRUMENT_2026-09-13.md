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

---

# Addendum — founder refinements, 2026-09-13

## C1 · First census obligation — locate the capability registry, do not presume it

> **Determine whether "capability registry / gateway" denotes one canonical object, a composition of
> existing objects, or merely prior conversational shorthand.**

⛔ **Do not privilege the noun.** Trace the actual authority path and map each arrow to an artifact:

```text
capability declared
      ↓
capability selected
      ↓
arguments validated
      ↓
governance admitted/refused
      ↓
packet constrained
      ↓
execution dispatched
      ↓
result/receipt persisted
```

Three legitimate outcomes:

```text
A. ONE OBJECT      a canonical registry/gateway actually exists
B. COMPOSITE       the function exists, but authority is distributed
                   across several canonical modules
C. NO SUCH SUBSTRATE   the term was an architectural abstraction,
                       not repository truth
```

⛔ **If B is true, do not manufacture a new registry merely to make the old language true.
Name the composition accurately first.**

**Result: `JOP-04_C1_CAPABILITY_ADMISSION_BOUNDARY_2026-09-13.md`.**

## §5b promotion — the scalar risk ladder is already under pressure

The ladder's own crossings falsify a monotonic severity model:

```text
local mutation
     ↓
REMOTE BRANCH      ← custody / externality crossing
     ↓
DRAFT PR           ← audience / public crossing
     ↓
merge
```

**Risk does not monotonically increase with procedural lateness.** A draft PR may disclose
externally while remaining operationally reversible. A merge may be *less public* than the PR
creation that preceded it, yet *more consequential to canonical state*.

That supports treating effect-bearing authority as a **vector** —

```text
MUTATION · REVERSIBILITY · EXTERNALITY · AUDIENCE ·
CUSTODY · FINANCIAL CONSEQUENCE · CANONICALITY
```

— rather than an ordering:

```text
⛔ READ < DRAFT < WRITE < SEND < PUBLISH < DELETE
```

⛔ **The vector is NOT ruled. The census must earn it.** §5b has produced a strong falsifier against
the simple ladder; a falsifier is not a replacement. ⭐ Note `CANONICALITY` is a dimension the §3
provisional set does **not** contain — first evidence that the probe set is incomplete.

## Intent binding — transfer the law, not the mechanism

`BoundEvidence` is excellent prior art **for the shape only**. The transferable principle:

> **A privileged object cannot become privileged because a caller says that it is.**

```text
evidence (raw material)          intent / authority inputs
   ↓ bindEvidence(...)              ↓ canonical binding operation
BoundEvidence                    BoundAuthority   ← possible future
```

⛔ **Resist importing the whole mechanism.** Evidence binding and action authorization differ in at
least three ways: **authority may expire · authority may be consumed · authority may be scoped to a
particular effect.** None has an analogue in evidence binding, which is timeless, re-readable and
unscoped.

⭐ **So the census question is not "can we reuse `bind.ts`?" It is:**

> **Which unforgeability properties of `BoundEvidence` are general laws, and which are
> manuscript-specific implementation choices?**

## Governance provenance — candidate general law

The failure mode found in charter §7, stated generally:

```text
Programme B says: "I inherit ruling X from document A."
But document A is not present, addressable, or independently inspectable.
Therefore: inheritance is ASSERTED, not REPRODUCIBLE.
```

⭐ **A provenance defect even when the inherited ruling happens to be correct.**

**Candidate law — ⛔ NOT RATIFIED, and deliberately not JOP-04's to ratify:**

> **No programme may derive binding authority from a governance artifact that the programme cannot
> identify and independently retrieve.**

⚠️ **Not** *"everything discussed must be committed"* — that would be excessive and would make
conversation itself a filing burden. The narrower line:

```text
conversation / research / proposal        MAY INFORM
binding governance                        MUST RESOLVE TO INSPECTABLE CUSTODY
```

**Precedent for the repair is E-01**, not a new doctrine: file the source, then let the record
correct the claims.

## The shared constitutional form — deeper than analogy

```text
PERCEPTION
    ↓
INTERPRETATION / PROPOSAL
    ↓
HUMAN AUTHORITY
    ↓
CONSEQUENCE
```

Writer's Studio protects the crossing between **recognition and alteration of the Work**.
JOP protects the crossing between **proposal and alteration of the world**.

The dangerous shortcut is identical in both:

```text
system has enough information
        therefore
system has authority
```

⛔ **It does not. Knowledge of what could be done is not permission to do it.**

⭐ **That is the shared constitutional form worth inheriting — not shared implementation.**
