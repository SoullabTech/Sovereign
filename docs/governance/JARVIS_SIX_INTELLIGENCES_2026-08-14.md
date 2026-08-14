# JARVIS — the six intelligences, and the instruments that exist

**PROPOSED — NOT RATIFIED** · founder-articulated 2026-08-14 · steward: JARVIS
Derived from the Relational Field investigation, not from theory. Every requirement
below has a case behind it in `docs/architecture/audits/RF_*_2026-08-14.md`.

## The central law

> **Never let availability become authority, inference become evidence, history become
> present truth, successful execution become authorization, or representation become
> meaning without provenance.**

## The six

```
               JARVIS

       ├── Authority     — what may happen?
       ├── Epistemic     — what is actually established?
       ├── Runtime       — what is actually happening?
       ├── Continuity    — where did identity/context disappear?
       ├── Governance    — what path/rule should govern this?
       └── Memory        — what prior evidence/decisions/corrections matter?
```

⭐ **Memory serves the other five. It does not govern them.**

---

## 1 · Authority envelope (runtime property, not a prompt)

These are **not** equivalent permissions and must never collapse:

```
READ · WITNESS · PROBE · WRITE · BUILD · DEPLOY
ACCESS PRIVATE IDENTITY · EXTERNAL NETWORK PROBE
```

Every task carries: `subject · referent · allowed_actions · prohibited_actions ·
data_classes_allowed · network_scope · write_scope · expiration/ruling`. Every proposed
action is checked against it.

**Earned:** the surface trace stopped at `NOT CONSTRUCTIBLE TODAY` rather than obtain a
session, because the only routes were a password or a real member's token. Refusal at an
authority boundary is a **completion state**.

## 2 · Claim lineage and correction as structure

```
CLAIM       ├ evidence ├ method ├ confidence ├ referent └ status
CORRECTION  ├ supersedes ├ new evidence └ why the previous inference failed
```

⛔ Never silently replace. **Remember how knowledge changed.**

**Earned twice:** the `/api/relationship-essence` 404 was recorded as source/runtime
divergence, then established as the handler's own missing-parameter response — the
earlier claim preserved as wrong. And JRF-02's `DECLARATION_CAPABLE_SOURCES` finding,
corroborated by four searches across two agents, was **wrong because every agent searched
the same wrong tree**. ⭐ Agreement is not a referent.

## 3 · Observation ≠ interpretation

```
OBSERVED        12/13 turns used route X
ESTABLISHED     route X does not invoke observer Y
CAUSAL RESULT   observer Y did not see those 12 turns
UNKNOWN         why traffic shifted to route X
```

⛔ The fourth line must not be absorbed into the first three.

## 4 · The positive-control law

> **A negative observation does not establish a mechanism unless the mechanism's positive
> path has also been shown capable of producing the event.**

Applies automatically to: security controls · database writers · event listeners ·
feature flags · routing · memory admission · authentication · deployment verification.

**Earned:** "zero prohibited writes" was worth nothing until the writer was exercised
positively and a mutation control showed the forbidden state *would* appear without
containment.

## 5 · Runtime topology memory

Not *"where is the observer implemented?"* but:

```
Which path do we THINK carries this capability?
Which path actually carries production traffic?
Which middleware/services execute on that path?
Which governance controls are ABSENT from it?
```

**Earned:** the programme reasoned about `/list` while 12 of 13 turns went through
`/api/voice/stream-conversation`, which has no relational observer wire.

## 6 · Context-propagation tracing

Trace an identifier `creation → transport → transformation → persistence → retrieval →
rendering`, classifying each boundary `PRESENT · TRANSFORMED · IGNORED · NULL · REPLACED
· INFERRED`. For: `relationshipId · memberId · sessionId · conversationId · originRoute ·
consentState · provenanceId · memoryId`.

**Earned:** `observeRelationalContent` takes **no relationship argument**, so it cannot
preserve belonging — the mechanism behind 31 catch-all containers and 1,172 entries. And
`relationalContextId` is created, assigned, emitted, and **read by nothing**.

## 7 · Ungoverned model paths — standing constitutional audit

> **Anything that speaks as MAIA must pass through a governed MAIA execution path.**

### ⚠️ Steward finding: this gate half-exists, and it passes while violating

`scripts/check-no-direct-anthropic.ts` runs in the pre-commit hook. It **passed five
times during this session** while the ungoverned path was live. Verified at `22200f967`:

- `lib/consciousness/relationalCheckin.ts:203,206` constructs `new Anthropic(...)` and
  calls `messages.create`, rendering to members as `maia_reflection`.
- That file **is on the allowlist** — `scripts/anthropic-import-allowlist.json:45`,
  tier **`grandfathered`** ("legacy cognitive surfaces to be migrated"), 55 files.
- The gate's detection is an **import** regex:
  `(from|require\(|import\()\s*['"]@anthropic-ai/sdk`.

⭐ **The gate asks a different question than the invariant does.** It asks *who imports
the SDK* — provider sovereignty, don't bypass `sovereignRouter`. The invariant asks *what
speaks as MAIA* — **identity**. A file can be legitimately grandfathered for provider
reasons and simultaneously a constitutional violation for identity reasons, and the
current gate **cannot see the difference**. 55 files sit in that blind spot.

**The missing axis is `rendered identity`, not import provenance.** The audit shape:

```
find all external model clients + all model.invoke / messages.create / chat calls
classify each by governed gateway
classify RENDERED IDENTITY                 <- the axis that does not exist today
flag: speaks-as-MAIA AND bypasses governed runtime
```

⚠️ This is the **representational-completion** failure applied to a gate: it is populated,
green, and creates the impression of coverage it does not have. ⛔ A passing gate is not
coverage of a question it does not ask.

## 8 · Security findings carry their own semantics

```
Finding:                unauthenticated data route
Severity candidate:     high
Established scope:      internal edge path
External reachability:  UNKNOWN
Member data:            YES
Exploit prerequisite:   member UUID
Key derivability:       YES  (142/142 rows: soul_signature = 'soul_' || user_id)
Action authority:       HOLD
Required next evidence: external read-only reachability probe
```

⭐ The unestablished row is **load-bearing**, not a gap to be filled with a guess.

## 9 · Representation integrity — does meaning follow from evidence?

Software can be functioning exactly as written and still be **epistemically wrong**:

| asserted | actually generated by |
|---|---|
| `trust {NN}%` | `min(0.1 + encounterCount*0.1, 1.0)` — a turn counter; 25 members at 100% |
| intimacy | frequency |
| psychological characterization | first-match regex over one turn, including MAIA's own reply |
| member fact | model inference |
| containment | absence of signals |
| route absent | a 404 |

**The audit question:** *does the representation asserted to the model accurately follow
from its generating evidence?* Deeper than linting or testing — it checks whether
**meaning has outrun evidence.**

---

## Standing

⛔ **PROPOSED.** This records a founder articulation and one steward finding. It confers
no authority, authorizes no implementation, and changes no gate. Building remains closed.

⚠️ **Level check, per the level-hardening monitor:** of the nine requirements above,
**item 7 alone has a partial executable instrument**, and §7 establishes that instrument
does not ask the invariant's question. **The other eight are prose.** ⛔ Do not let this
document read as coverage.
