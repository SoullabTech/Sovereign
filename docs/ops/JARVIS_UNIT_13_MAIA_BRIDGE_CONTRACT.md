# JARVIS Unit 13 — MAIA ↔ JARVIS Governed Bridge

## Constitutional design + authority contract

**Design-only. No bridge implementation.** Covers §0–§40.

> **Superseded in part by Unit 14.** Two prerequisites named here — principal
> identity/delegated authority, and `publicRun` objective visibility — were
> implemented in `JARVIS_UNIT_14_PRINCIPAL_OBJECTIVE.md`. One finding below is
> **corrected** there: §18/§31 record that `CAPACITY_BLOCKED` does not exist as a
> runtime state and imply capacity waiting is unrepresentable. The *state* does
> not exist, but the *fact* is already represented and published —
> `jarvis-runtime-pipeline.mjs:303` sets
> `blocked = { reason: 'WORKER_CAPACITY_UNAVAILABLE', … }` on the return to
> `QUEUED`, and `publicRun` has published `blocked` since Unit 11. The gap was
> Desktop rendering, not runtime capability.

---

## §0 — Source state (verified 2026-08-10)

| Fact | Value |
|---|---|
| Repo | `/Users/soullab/MAIA-SOVEREIGN` |
| Unit 12 commit | `f7c543aab`, branch `chore/jarvis-unit-12-desktop-alpha`, all 13 files present in tree |
| Unit 11 runtime | `b59c61355` (ancestor) |
| Live runtime | `rt-3057a52d`, READY, loopback `127.0.0.1:8787` |
| Disk | 9.4 GiB free (98%). 159 registered worktrees — **not swept** |

**Incident:** the Unit 12 *worktree directory* is gone (removed during the disk-full
window; cause not established). The **commit and branch ref are intact** and every
file is recoverable from the object store. No Unit 12 work was lost. The worktree
can be recreated on demand; it was not recreated here, to preserve write margin.

### New §0 findings

1. **No MAIA→JARVIS caller exists.** No `8787` / `jarvis-runtime-client` reference
   anywhere in `lib/`, `app/`, `components/`. Clean slate.
2. **MAIA has no tool-execution surface.** No `child_process`, `spawn`, `execSync`,
   `tool_use`, `tools:` in `lib/sovereign/` or `app/api/sovereign/`.
3. **The JARVIS packet has no principal concept at all.** Grep for
   `member|principal|consent|actor|on_behalf` across `jarvis-runtime-pipeline.mjs`,
   `jarvis-packet-guard.mjs`, `jarvis-runtime.mjs` returns **nothing**.
4. **A write-capable worker lane exists in the delegate substrate.**
   `ain-delegate.sh` supports a `claude` lane with permission modes
   (`_claude_permission_mode()`). The runtime refuses it — `READ_ONLY_LANES =
   ['local-native']` plus `checkAuthority` — so the *only* thing standing between a
   bridge request and a write-capable worker is one constant and one function.
   Post-hoc enforcement (`LOCAL_WORKER_WROTE`) catches mutation after the fact.
5. **The delegate cannot reach production.** No `deploy|production|docker|ssh|
   minisforum|migrate` strings in `ain-delegate.sh`.
6. **Existing authority model:** `config/accessMatrix.ts` —
   `Tier = free|personal|pro`, `Role = admin|steward|curator|practitioner|partner|member`,
   enforced via `lib/security/requireAccess.ts`.
7. **Sanctuary is fail-closed at the store.** `TurnsStore.addTurn` requires a
   `TurnPosture`; sanctuary *or missing/forged* posture refuses the write, logging
   metadata only (`lib/sanctuary/turnPosture.ts`, incident SANC-20260614-01).
   `SessionSummaryStore`: `isSanctuary === true` ⇒ `summaryText` MUST be null.
8. **Member identity** is a UUID via `x-member-id`, `local_`-prefixed IDs rejected.

---

## §1–§3 — Carried forward (established, not redone)

**§1 BOUNDARY: PARTIAL.** Separation is effective only because the bridge is
unbuilt. JARVIS has governance mechanisms; MAIA has no bridge request surface, no
consent gate, no bridge audit channel, no principal-aware delegation.

**§2 DIRECTIONALITY.** MAIA remains the member-facing relational voice. JARVIS
returns typed system evidence and does not become a second conversational persona.
MAIA→JARVIS is a **petition** (refusable); JARVIS→MAIA is **evidence** (not
re-narratable as certainty). **DIRECT MEMBER SPEECH: PROHIBITED.**

**§3 TAXONOMY.** R1 splits into R1A (system/repository) and R1B (member-owned
data) — not equivalent merely because both are READ. R2 needs an explicit resource
budget. R0 does not cross the bridge. R3+ require additional authority.

---

## §4 — READ vs WRITE authority

**A MAIA request is not WRITE authorization.** MAIA may identify a need, formulate
a bounded request, or ask JARVIS to inspect. None of that authorizes mutation.

| Class | MAIA may request directly | JARVIS may execute directly | Member consent required | Practitioner authority sufficient | Founder/operator required | Builder WRITE claim required | Production authority required |
|---|---|---|---|---|---|---|---|
| **R1A** system/repo read-only | **YES** | YES | No | Yes | No | No | No |
| **R1B** member-data read-only | **NO** — petition only | Only with a consent token bound to the request | **YES** | **NO** — practitioner role never substitutes for member consent | No | No | No |
| **R2** bounded compute | **YES**, with explicit budget | YES | No, if system-only | Yes | No | No | No |
| **R3** proposal | **NO** (v1) | Only under operator authority | No | No | **YES** | No (result-contract only; writing the artifact to disk would require one) | No |
| **R4** write | **NEVER** | Only under operator authority + claim | No | No | **YES** | **YES** | No |
| **R5** production change | **NEVER** | Not currently capable | No | No | **YES (founder)** | **YES** | **YES** |
| **R6** security/governance change | **NEVER** | **Must never execute automatically** | No | No | **YES (founder ruling)** | **YES** | **YES** |

**Governing rules.**
1. Request and authorization are distinct objects, distinct issuers, distinct
   lifetimes. MAIA authors petitions; she can never mint a grant.
2. **No escalation by accumulation.** N granted reads never sum to a write. Grants
   do not compose upward.
3. **Write authority has no conversational representation.** There must be no
   sentence a member can say that results in a write. This is what prevents
   urgency, distress, trust, or rapport from becoming an execution channel.
4. **Refusal is a first-class, relationally safe outcome** — not a fault, not a
   rejection of the member.
5. **Default deny, refuse loudly.** An unrecognised principal is refused, never
   defaulted to operator.

---

## §5 — Principal identity

**Current: absent.** The runtime trusts *local operator possession of the loopback
runtime* plus declared lane/packet semantics. It does not establish the identity or
delegated authority of a requesting principal. Sufficient for Unit 12 (sole
operator, own hands). **Insufficient for MAIA-as-client**, because a MAIA server
serves many members and every bridge call would inherit operator authority by
transitivity.

### Minimum principal envelope

- `request_id` — bridge-issued, unique, correlatable both directions
- `initiator.type` — MEMBER | PRACTITIONER | FOUNDER_OPERATOR | MAIA | JARVIS | SYSTEM_AUTOMATION | **UNKNOWN**
- `initiator.id` — opaque, resolvable only inside the trust boundary
- `initiator.role` — from `accessMatrix` (`Role`), not re-invented
- `maia_posture` — **MESSENGER** (relaying a request verbatim) | **INTERPRETER** (rendering a result) | **DELEGATED_REQUESTER** (acting under a grant)
- `subject_scope` — `member_id` whose environment/data is involved, or `NONE` for system-only
- `authority_source` — what conferred this (member consent record, operator session, founder ruling)
- `delegated` — see §6
- `not_delegated` — explicit negative list, carried and audited

**UNKNOWN is a real, terminal value that hard-refuses.** It must never default to
operator. This single rule is the difference between the current model and a safe one.

### Required principles (all satisfied by the envelope above)

- MAIA acting for a member does not inherit founder/operator authority — `initiator.type = MEMBER`, `maia_posture = MESSENGER|DELEGATED_REQUESTER`, and the grant is scoped to member authority.
- A founder request routed through MAIA does not become member-authored truth — `initiator.type = FOUNDER_OPERATOR` is preserved through the relay; MAIA's involvement never rewrites `initiator`.
- A practitioner request does not acquire member authority because JARVIS executed it — practitioner authority and `subject_scope` are independent fields; R1B additionally requires a member consent token.
- Loopback possession must not imply authority for a MAIA-originated request — the runtime must require the envelope regardless of network position.

---

## §6 — Delegated authority

Identity answers *who*. Delegation answers *what this actor may ask JARVIS to do in
this request*.

Minimal delegation shape: `principal`, `role`, `member_scope`, `operation_class`,
`purpose`, `authority_source`, `consent_basis`, `expiry`, `allowed_targets`,
`prohibited_actions`.

### Can current JARVIS work packets carry this?

**PARTIAL — and they should not carry the grant itself.**

The packet is an **execution** contract, not an **authorization** contract, and it
has a property that makes carrying grants actively dangerous: `partitionPacket` /
`lintLeakage` split fields into `WORKER_VISIBLE_FIELDS` and `VERIFIER_ONLY_FIELDS`.
Fields placed on the worker-visible side are **serialized into the model prompt**. A
delegation envelope containing `member_scope` or `consent_basis` on that side would
send member identity to the local model — breaking data minimization (B8) and
consent (§7) in one step.

**Recommendation.** The packet carries only a **reference**: `request_id`,
`operation_class`, `authority_class`, and a `member_scope_present` boolean — all
verifier-only. The **grant itself lives in the admission record** held by the
bridge admission gate (§14) and keyed by `request_id`.

This avoids a second authority system: there remains exactly one authority
evaluator (the admission gate), one execution authority (the runtime), and one
audit trail. What it avoids is overloading the packet — whose partition semantics
exist for answer-leakage prevention, not authorization — with a second job it
would silently do wrong.

---

## §7 — Consent

| Class | May cross bridge | Consent required | Standing consent possible | Purpose limit | Retention | JARVIS may persist | Audit |
|---|---|---|---|---|---|---|---|
| **C0** system-only | YES | No | n/a | Yes | Full audit | YES | Required |
| **C1** member-owned operational metadata | YES, member-scoped | Yes | **Yes**, scoped + revocable | Strict | Minimal | Metadata only | Required |
| **C2** member content | Only with explicit per-request consent | **Yes, per request** | **No** | Strict | Transient | **NO** | Record *that* it crossed, never the content |
| **C3** sensitive relational material | **Default NO** | Explicit, specific, revocable + founder ruling | No | Strict | Transient | **NEVER** | Metadata only |
| **C4** Sanctuary-protected | **NEVER** | **No consent can authorize it** | No | — | None | **NEVER** | Metadata only |
| **C5** collective / cross-member | Default deny | Separately governed collective operation + per-member basis | No | Strict | Minimal | Aggregate only | Required |

**MAIA access does not imply JARVIS access.** MAIA holds member material to be
relationally present with it. JARVIS is an execution substrate with durable,
audited storage. The two have different retention semantics, so material legitimately
in MAIA's context is not thereby eligible to cross.

**C4 note:** MAIA Canon's Sanctuary invariant is explicit that nothing may be
extracted *"including by user request during the session."* In-session consent is
precisely what Sanctuary declares unreliable. C4 is therefore not a high consent
bar — it is a **consent-proof** class.

**C1 precedent:** the Daily Anchor `surface_preference` gate (default private,
member opts in) is the existing standing-consent pattern to follow — default
closed, member-initiated, revocable.

---

## §8 — Data minimization

Do **not** pass by default: conversation history, memory bundles, practitioner
context, member profile, atoms, spiral state, or any relational material.

**Minimum sufficient request packet:** `request_id`, `operation_class`, `purpose`,
`objective` (bounded, member-material-free), `subject_scope` (id or NONE),
`context_selectors` (SHA-anchored repository targets — *not* member content),
`allowed_targets`, `prohibited_actions`, `expiry`, `authority_class`,
`consent_basis` reference, `sanctuary_state`.

The existing SHA-bound selector mechanism is the right primitive: it passes
*addresses*, not payloads, and the runtime materializes bounded fragments itself.
That property should be preserved for any future member-data class — pass a
reference the gate can resolve under consent, never the material.

---

## §9 — Sanctuary

| Operation | During Sanctuary |
|---|---|
| System-only inspection (C0/R1A) | **ALLOWED** |
| Member-specific read | **PROHIBITED** |
| Member-specific write | **PROHIBITED** |
| JARVIS independent retrieval of member material | **PROHIBITED** |
| Persistence of anything Sanctuary-derived | **PROHIBITED** |
| Logging | **Metadata only** — matching `TurnsStore`'s existing refusal-log discipline |
| Collective influence | **PROHIBITED** |

Sanctuary does not prohibit system maintenance, but it does not widen protected
relational material merely because JARVIS exists.

**Resolving the durability tension.** A Sanctuary turn leaves no durable trace; a
JARVIS run is inherently durable and audited. These are reconcilable *only* because
of the scope rule: during Sanctuary **no bridge request may carry member scope**.
System-only runs contain no member material, so logging them fully violates nothing.
No Sanctuary-derived material ever reaches the audit trail because none may enter
the bridge in the first place. The invariant is enforced at admission, not at logging.

**Fail-closed, following the existing pattern:** missing or unresolvable
`sanctuary_state` refuses the request, exactly as a missing `TurnPosture` refuses a
write.

---

## §10 — Purpose limitation

Every request carries an explicit bounded purpose. **Discovery does not expand
authorization.**

A READ task that discovers a needed WRITE must **stop and return a WRITE-authority
requirement** as a first-class disposition (`NEEDS_OPERATOR_AUTHORITY`) — it must
not perform the write, stage it, propose it as an artifact, or widen its own scope.
The finding is the deliverable.

This is already the shape of the runtime's `ESCALATION_REQUIRED` disposition; the
bridge extends the vocabulary rather than inventing a mechanism.

---

## §11 — Input standing / provenance

Every consequential premise retains standing: `member-declared`,
`practitioner-declared`, `MAIA-inferred`, `system-derived`, `repository-fact`,
`production-fact`, `symbolic-lens`, `model-pretraining`, `founder-instruction`.

**`MAIA-inferred X` is not equivalent to `verified system fact X`.** A premise's
standing travels with it, and JARVIS must verify factual premises where it can
rather than accept them.

Concretely: if MAIA infers "the provider is misconfigured," that enters as
`MAIA-inferred` and becomes a *question for verification*, never a fact the run may
act upon. The runtime's existing citation-containment machinery is the verification
instrument; standing determines what needs it.

---

## §12 — Request envelope

Extends existing packet infrastructure; creates no parallel execution framework.

`request_id` · `objective` (bounded) · `principal` (§5) · `delegated_authority`
reference (§6) · `member_scope` · `operation_class` · `purpose` ·
`minimal_context` (selectors) · `context_standing` (§11) · `consent_basis` ·
`sanctuary_state` · `allowed_operations` · `prohibited_operations` ·
`verification_requirements` · `expiry`

The runtime's existing packet + result contracts, state machine, SHA-bound context,
evidence verification and Builder claims are **reused unchanged**. The bridge adds
an admission record and a correlation id — not a second runtime.

---

## §13 — Objective visibility

**PUBLIC RUN OBJECTIVE GAP: BLOCKING.**

`publicRun` exposes `run_id`, `work_unit_id`, `state`, `disposition`,
`failure_class`, `context`, `worker`, `result`, `verification`, `audit`, `history` —
but **not the packet objective**.

Why blocking rather than inconvenient: MAIA's rendering contract (§17) requires her
to state *what was requested* alongside *what was established*. If the result
surface cannot tell her what bounded objective a result belongs to, she must supply
that from private memory — which is inference standing in for provenance, the exact
substitution this unit exists to prevent. Unit 12's local annotation store is an
acceptable single-operator workaround and is **not** acceptable for a multi-member
bridge: it fails open, and the tempting repair when the record is missing is to guess.

**Minimum public-safe fields to add:** `request_id`, `objective_summary` (bounded,
redacted), `operation_class`, `purpose`, `authority_class`,
`member_scope_indicator` (boolean/opaque — **never** a raw `member_id`),
`prohibited_actions_summary`.

Sensitive packet content stays unexposed; these are provenance fields, not payload.

---

## §14 — Admission gate

Dispositions, none collapsed into failure:

`ACCEPT` · `NEEDS_MEMBER_CONSENT` · `NEEDS_OPERATOR_AUTHORITY` ·
`NEEDS_FOUNDER_RULING` · `NEEDS_CLARIFICATION` · `REFUSE_SANCTUARY` ·
`REFUSE_SCOPE` · `REFUSE_SECURITY` · `REFUSE_UNSUPPORTED_OPERATION` ·
`CAPACITY_BLOCKED`

**Refusal is not failure.** A refusal means governance worked. MAIA must be able to
render each distinctly (§17) — "I asked and the system declined for this reason" is
a true, safe, non-apologetic sentence.

---

## §15 — Result semantics

Preserving and extending Unit 12's distinctions:

| Status | Meaning |
|---|---|
| `EXECUTION VERIFIED` | The run executed under the governed pipeline |
| `ARTIFACT VERIFIED` | A produced artifact matched its contract |
| `CITATION CONTAINED` | Each citation lies inside SHA-bound supplied material |
| `CLAIM SEMANTICALLY VERIFIED` | **Not currently achievable** — no mechanism exists |
| `NOT ESTABLISHED` | Neither confirmed nor refuted |
| `FAILED` | Did not reach a disposition |
| `REFUSED` | Governance declined — **not** a failure |
| `CAPACITY_BLOCKED` | Never dispatched — **execution did not start** |
| `OFFLINE` | Nothing listening |
| `UNRESPONSIVE` | Bound but not answering — **it is running** |
| `CANCELLATION_REQUESTED` | Request sent; outcome unknown |
| `CANCELED` | Runtime confirmed |

Never reduced to `success: true/false`.

---

## §16 — Result envelope

Must let MAIA know: what was requested (`request_id`, `objective_summary`,
`purpose`) · what was actually executed (`operation_class`, `states`) · under what
authority (`authority_class`, `principal`) · at what SHA (`execution_head`,
`source_sha`) · what changed (`files_changed`, default `[]`) · whether production
was touched (explicit boolean, default `false`) · what evidence exists
(`citations`, `containment`) · what remains unverified (**explicit `not_established`
list**) · what additional authority is required (`needs_*`).

The `not_established` list is mandatory and must not be omittable — absence of
evidence must be as legible as evidence.

---

## §17 — MAIA rendering contract

| Result | MAIA may say | MAIA may **not** say |
|---|---|---|
| `CITATION CONTAINED` | "JARVIS checked that each citation is inside the material it was given." | "JARVIS confirmed this is true." |
| `NOT ESTABLISHED` | "That wasn't established either way." | "JARVIS confirmed it." |
| `UNRESPONSIVE` | "The system is busy and hasn't answered yet." | "JARVIS is offline." / "JARVIS is down." |
| `REFUSED` | "I asked; the system declined — it needs X authority." | "JARVIS failed." / "It broke." |
| `CAPACITY_BLOCKED` | "It's waiting for a free lane; it hasn't started." | Anything implying execution began. |
| `CANCELLATION_REQUESTED` | "I asked it to stop; not confirmed yet." | "It's canceled." |
| `CANCELED` | "It stopped, confirmed." | — |
| `FAILED` | "It failed, and here's the class." | Interpreting it as meaning about the member. |

**Standing rule:** MAIA never upgrades a status. She may simplify vocabulary; she
may not simplify epistemics. And system failure is never rendered as relational
interpretation — a refusal is about authority, not about the member.

---

## §18 — Queue / back-pressure

Unit 12 measured **423 and 529 re-queue cycles** before dispatch, with the runtime
blocking its event loop each cycle. That waiting was invisible in the API — it
looked like a run sitting in `READY_FOR_WORKER`.

The bridge must expose: `admitted` · `queued` · `capacity_blocked` · `running` ·
`verifying` · `terminal`.

**MAIA must not hide capacity waiting behind vague conversational language.** "Let
me look into that" while a run is capacity-blocked for three minutes is a false
impression of progress. `CAPACITY_BLOCKED` is a distinct, sayable state.

This also implies a **runtime gap**: capacity refusal is currently a silent retry
loop rather than a reported state. That belongs in the same runtime unit as §13.

---

## §19 — Cancellation

Distinct facts, never merged: `request cancellation` · `confirmed canceled` ·
`run already terminal`.

**Who may cancel:** the initiating principal; the operator (always); the member for
runs scoped to them. Authority to cancel does not confer authority to re-run.
Cancellation never propagates upward into other authority.

Unit 12 proved all three paths live (`200` accepted ×2, `409 RUN_ALREADY_TERMINAL`).

---

## §20 — Failure behavior

| Condition | JARVIS result | MAIA rendering | Retry | Escalation | Actor action |
|---|---|---|---|---|---|
| OFFLINE | `OFFLINE` | "Not running right now." | No (needs operator) | Operator | Start via operator script |
| UNRESPONSIVE | `UNRESPONSIVE` | "Busy, hasn't answered." | Bounded backoff | None | Wait |
| CAPACITY_BLOCKED | `CAPACITY_BLOCKED` | "Waiting for a lane; hasn't started." | Yes, bounded | Operator if sustained | Free capacity |
| AUTHORIZATION_REFUSAL | `REFUSED` + `NEEDS_*` | "Declined — needs X authority." | **No** | To named authority | Obtain grant |
| CONSENT_ABSENT | `NEEDS_MEMBER_CONSENT` | "I'd need your OK first." | No | To member | Member decides |
| SANCTUARY_REFUSAL | `REFUSE_SANCTUARY` | "Not while we're in Sanctuary." | **Never** | **None** | None |
| WORKTREE_COLLISION | `REFUSED` (`BUILDER_OWNERSHIP_REFUSED`) | "Another lane holds it." | Yes, later | Operator | Release claim |
| TEST_FAILURE | `FAILED` + class | "Tests failed — here's which." | Operator decision | Operator | Inspect |
| EVIDENCE_INCOMPLETE | `ESCALATION_REQUIRED` / `NOT ESTABLISHED` | "Couldn't establish that." | Refine selectors | Operator | Narrow scope |
| PRODUCTION_DRIFT | `FAILED` | "Live state differs from expected." | No | **Founder** | Investigate |
| CANCELLATION_TOO_LATE | `RUN_ALREADY_TERMINAL` | "Too late — it had finished." | n/a | None | None |
| UNSUPPORTED_OPERATION | `REFUSE_UNSUPPORTED_OPERATION` | "It can't do that." | No | Design | None |

**Do not anthropomorphize runtime failure.** JARVIS is not confused, tired,
struggling, or unwilling. It is offline, blocked, refusing, or unresponsive.

---

## §21 — Production boundary

**Default: MAIA-originated requests cannot authorize production mutation.** A
production change requires a separate operator/founder production authority contract.

**Audit of current paths — no violation found.** `ain-delegate.sh` contains no
`deploy|production|docker|ssh|minisforum|migrate` reachability. Production deploys
run through `scripts/deploy-production.sh` / `pre-deploy-gate.sh` behind a deploy-lane
`flock`, an immutable-SHA snapshot, and a Dockerfile build-time lane tripwire —
none of which the runtime touches. Production is currently unreachable from JARVIS.

**Standing risk to preserve:** the delegate substrate *does* carry a write-capable
`claude` lane. Only `READ_ONLY_LANES = ['local-native']` and `checkAuthority()`
separate a bridge request from it. That boundary is one constant and one function
and must be treated as security-critical, not configuration.

---

## §22 — Repository / filesystem scope

Any future WRITE-capable request must explicitly carry: `repo`, `branch`,
`worktree`, `allowed_paths`, `prohibited_paths`, `builder_claim`, `merge_authority`,
`deploy_authority`.

**MAIA must never send shell commands as the bridge primitive.** Structured intent
only — the operation class, targets and constraints; never a command string. A
bridge that accepts commands has no boundary, only a filter.

---

## §23 — Transport boundary

**TRANSPORT READY: PARTIAL.**

Holding: loopback-only with fail-closed non-loopback refusal · no public bind · no
MAIA shell · runtime is execution authority · clients spawn no system processes.
Unit 12 proved all of these.

Missing for MAIA safely: caller identity (§5) · per-caller authorization ·
per-principal fairness/capacity accounting (one MAIA server, many members, one
serial lane) · the fact that loopback reachability from a multi-tenant server is
ambient operator authority.

The transport itself is sound. What is missing is not transport — it is **who is
speaking on it**.

---

## §24 — Audit trail

Minimum durable bridge evidence: `request_id` · `objective_summary` · `principal` ·
`delegated_authority` · `consent_basis` · `purpose` · `member_scope_indicator` ·
`operation_class` · `execution_sha` · `state_history` · `result` · `evidence` ·
`refusal` (class + reason) · `files_changed` · `production_touched` ·
`cancellation` · `escalation`.

**Do not persist relational material merely for auditability.** Audit records
*that* a member-scoped request occurred, under what basis, with what outcome —
never the conversational material that motivated it. An audit trail that
accumulates relational content becomes the surveillance the architecture exists to
refuse. Store the fact and the grant; never the confidence.

---

## §25 — Member transparency

Three distinct artifacts, not one:

| Artifact | Audience | Content |
|---|---|---|
| **System trace** | Engineers | Full technical detail, run internals |
| **Operator audit** | Operator/founder | Governance record — §24 |
| **Member transparency** | Member | Minimal, plain, non-technical |

Members should see a minimal trace when JARVIS participates on their behalf —
something of the shape *"I asked the system to check X for this reason."* Raw
implementation logs do not belong in member-facing transparency; they inform
nobody and imply a technical relationship the member did not enter.

This follows the Sovereignty Invariant test: it increases member agency (they know
what was done for them and can object) without increasing the system's
psychological centrality.

---

## §26 — Cross-member boundary

**Default deny.** A request scoped to Member A must not access Member B unless a
separately governed collective operation explicitly authorizes it.

**Can current infrastructure enforce member scope? NO.** The packet has no member
concept whatsoever (§0.3). Member scope must be enforced **at the admission gate**,
which resolves selectors and consent before a packet is built — not inside the
packet, which is an execution contract with no notion of persons.

---

## §27 — Practitioner boundary

Preserved: practitioner observation is not member truth · practitioner access is
not unrestricted system authority · practitioner request is not founder authority.

Permitted bridge classes for a practitioner principal: **R1A** and **R2** only —
the same as any non-operator principal. Practitioner role confers no additional
*system* authority; it is a relational-context role (`accessMatrix` `Role`), not an
infrastructure one.

For **R1B** touching a member they work with: member consent is required exactly as
for any other principal. Practitioner standing never substitutes for it. Any
practitioner-declared premise enters with `practitioner-declared` standing (§11) —
not as system fact.

---

## §28 — Model-pretraining boundary

MAIA may formulate requests using model reasoning. JARVIS must not treat those
premises as factual execution authority.

**Yes — an explicit premise-standing field is required** (§11 `context_standing`).
Without it, a model-generated premise is indistinguishable at the gate from a
repository fact, and "the model believes X" silently becomes "X is true, act on it."
That is the T3 path (MAIA inference → execution authority) and standing is the only
structural defence.

---

## §29 — Air / JARVIS

**SUPPORTED: PARTIAL.**

The affinity is real as a *design intuition*: JARVIS transforms structured intent
into inspectable information, evidence, and governed action — recognisably an
informational/communication function.

But three things are being conflated and must stay separate:

1. **Air as elemental mode** — a MAIA relational construct, member-facing, part of
   the Spiralogic mapping.
2. **Air as informational/communication function** — an abstract functional description.
3. **JARVIS as system evidence/execution function** — infrastructure.

(2) legitimately describes (3). (1) does **not**, and importing it would re-frame a
governed execution substrate in relational vocabulary — precisely what §30 forbids.
Elemental language carries relational authority in this system; attaching it to an
execution surface would let system output borrow relational standing.

**Usable as internal design metaphor. Must not become member-facing framing, a
persona, or any part of the authority model.**

---

## §30 — Single relational voice

**Compatible, conditionally.** JARVIS results enter MAIA as **typed system
evidence** — data with declared standing, not utterances. MAIA renders them in her
own voice under §17.

The failure mode to prevent is subtle: not JARVIS literally speaking, but MAIA
adopting an operational register when relaying it — becoming a console with a warm
tone. The rendering contract governs *epistemics*; the single-voice canon governs
*register*. Both must hold.

---

## §31 — Bridge state machine

| State | Classification |
|---|---|
| `DRAFT_REQUEST` | **BRIDGE-SPECIFIC** |
| `AUTHORITY_CHECK` | **BRIDGE-SPECIFIC** |
| `CONSENT_CHECK` | **BRIDGE-SPECIFIC** |
| `ADMITTED` | **BRIDGE-SPECIFIC** (maps to the runtime's existing 202 acceptance) |
| `QUEUED` | **EXISTING** |
| `CAPACITY_BLOCKED` | **RUNTIME GAP** — currently a silent retry loop (§18) |
| `VALIDATING` / `CONTEXT_ROUTING` / `READY_FOR_WORKER` | **EXISTING** — do not duplicate |
| `RUNNING` | **EXISTING** |
| `VALIDATING_RESULT` | **EXISTING** |
| `VERIFYING_EVIDENCE` | **EXISTING** |
| `VERIFIED` / `FAILED` / `CANCELLED` | **EXISTING** |
| `REFUSED` | **BRIDGE-SPECIFIC** — currently a submit-time HTTP 400/403, not a run state |
| `MAIA_RENDERED` | **BRIDGE-SPECIFIC** |

The bridge adds a **pre-admission prefix** and a **post-result suffix** to the
existing lifecycle. It does not build a second runtime lifecycle.

---

## §32 — Bridge invariants

- **B1 NO AUTHORITY INFERENCE** — neither side infers the other's authority; UNKNOWN refuses.
- **B2 READ/WRITE SEPARATION** — no accumulation of reads yields a write.
- **B3 PRINCIPAL IDENTITY PRESERVED** — initiator survives relay unaltered.
- **B4 DELEGATION EXPLICIT** — including an explicit `not_delegated` list.
- **B5 MEMBER SCOPE** — default deny; cross-member requires separate governance.
- **B6 CONSENT** — MAIA access never implies JARVIS access.
- **B7 SANCTUARY** — no member scope during Sanctuary; fail closed.
- **B8 MINIMUM DATA** — addresses, not payloads; nothing by default.
- **B9 STANDING PRESERVED** — inferred ≠ verified, end to end.
- **B10 RESULT TRUTH** — MAIA may simplify vocabulary, never epistemics.
- **B11 PRODUCTION SEPARATION** — no MAIA-originated production authority.
- **B12 AUDITABILITY** — record the fact and the grant, never the confidence.
- **B13 SINGLE RELATIONAL VOICE** — evidence enters as data, not as a persona.
- **B14 FAILURE DISTINCTION** — refusal ≠ failure ≠ offline ≠ unresponsive ≠ blocked.
- **B15 OBJECTIVE VISIBILITY** — a result must be interpretable from the public surface alone.
- **B16 CANCELLATION TRUTH** — requested ≠ confirmed ≠ already terminal.

---

## §33 — Threat model (ranked by severity)

| # | Threat | Severity | Current exposure |
|---|---|---|---|
| **1** | **T4** operator authority leaks transitively through MAIA | **CRITICAL** | Would be immediate on any bridge — loopback reach = operator authority |
| **2** | **T1** prompt injection causes system action | **CRITICAL** | Member text → MAIA → petition; without standing + structured intent, injection reaches execution |
| **3** | **T14** READ-shaped request mutates production | **HIGH** | Delegate has a write-capable lane; one constant + one function separate them |
| **4** | **T7** Sanctuary material leaks | **HIGH** | Sanctuary has no bridge-side enforcement today |
| **5** | **T15** missing objective causes result misrepresentation | **HIGH** | **Real now**, not hypothetical — §13 |
| 6 | T3 MAIA inference becomes WRITE authority | HIGH | No standing field exists |
| 7 | T5 requesting principal cannot be identified | HIGH | No principal concept exists |
| 8 | T10 MAIA overclaims JARVIS verification | HIGH | Mitigated in Unit 12 UI; unmitigated in relational rendering |
| 9 | T9 cross-member material accessed | HIGH | No member scope in packets |
| 10 | T6 excessive member context crosses | MEDIUM | No minimization rule exists yet |
| 11 | T8 practitioner authority expands | MEDIUM | Role model exists; bridge mapping does not |
| 12 | T2 member asks MAIA to modify platform code | MEDIUM | Structurally refused by R4/R5 rules |
| 13 | T12 cancellation falsely reported | MEDIUM | Unit 12 handles correctly; must survive relay |
| 14 | T13 capacity waiting hidden | MEDIUM | Real (§18); currently invisible |
| 15 | T11 runtime exposed beyond loopback | LOW | Fails closed, proven |

---

## §34 — Existing infrastructure reuse

| Component | Verdict |
|---|---|
| Unit 11 runtime | **REUSE** — execution authority unchanged |
| Unit 12 Desktop client | **DO NOT DUPLICATE** — operator surface; bridge is a separate client |
| Work packet contract | **EXTEND** — verifier-only reference fields only (§6) |
| Result contract | **EXTEND** — add `not_established`, `production_touched` |
| Builder claims | **REUSE** unchanged |
| State machine | **REUSE** + pre/post prefix (§31) |
| SHA-bound context | **REUSE** — already the right minimization primitive |
| Evidence verification | **REUSE** — containment only; no semantic claims |
| `publicRun` | **EXTEND** — §13, blocking |
| Event history | **REUSE** |
| `accessMatrix` | **REUSE** — `Role`/`Tier` are the principal roles; do not re-invent |
| Consent infrastructure | **EXTEND** — anchor `surface_preference` is the standing-consent pattern |
| Sanctuary guards | **REUSE** — `TurnPosture` fail-closed discipline is the model |
| **Principal / delegated authority** | **NEW CONTRACT REQUIRED** |
| **Admission gate** | **NEW CONTRACT REQUIRED** |

---

## §35 — Founder decisions required

**A. May MAIA autonomously request bounded system-only READ (C0/R1A)?**
*Canon:* none directly. *Options:* (1) yes, unrestricted; (2) yes, only on a
member-raised topic; (3) no, operator-initiated only. *Recommendation:* **(1)** —
no member material crosses, refusal is safe, and it is the only class that makes the
bridge useful at all. **RULING REQUIRED: YES** (it grants a new authority).

**B. Member-specific READ under standing scoped consent, or explicit per request?**
*Canon:* Sanctuary "no stealth memory"; the Daily Anchor gate establishes
default-private + member opt-in as the standing-consent precedent. *Recommendation:*
**standing scoped consent for C1 operational metadata; explicit per-request for C2
content.** **RULING REQUIRED: YES.**

**C. May MAIA request WRITE proposals (R3) while execution needs separate operator
authority?** *Recommendation:* **No in v1.** A diff produced from a relational
conversation creates pressure toward applying it; the artifact invites the act.
**RULING REQUIRED: YES.**

**D. May a member authorize WRITE to their own non-system artifacts?**
*Recommendation:* **out of bridge scope** — member data edits belong to MAIA's own
product APIs under existing consent. Routing them through a code-execution bridge is
a category error that would put member content and repository mutation on one path.
**RULING REQUIRED: NO** (resolvable by architecture).

**E. What bridge operations may occur during Sanctuary?**
*Largely resolved by canon* — the Sanctuary invariant's "including by user request
during the session" already prohibits member-scoped operations. Only one genuine
question remains: **may a system-only run be logged during a Sanctuary session?**
*Recommendation:* yes, since it carries no member material.
**RULING REQUIRED: YES, narrowly** (logging only).

**F. Should members receive a transparency trace whenever JARVIS participates?**
*Canon:* Sanctuary "visual clarity"; Sovereignty Invariants (increase agency).
*Recommendation:* **yes, minimal and non-technical.** **RULING REQUIRED: YES** — on
wording and threshold, not on principle.

---

## §36 — Minimal bridge contract

**MAIA → JARVIS request envelope:** `request_id` · `principal` · `delegated_authority`
ref · `operation_class` · `purpose` · `objective` · `member_scope` ·
`consent_basis` · `sanctuary_state` · `minimal_context` (selectors) ·
`context_standing` · `allowed_operations` · `prohibited_operations` ·
`verification_requirements` · `expiry`

**JARVIS admission checks:** principal resolvable (UNKNOWN ⇒ refuse) → delegation
covers operation_class → member scope authorized → consent basis valid and unexpired
→ Sanctuary state permits → operation class supported → capacity available →
`ACCEPT` or one of the ten §14 dispositions.

**JARVIS execution — permitted classes:** **R1A** and **R2** only.

**JARVIS → MAIA result envelope:** §16.

**MAIA rendering standing rules:** §17 — simplify vocabulary, never epistemics.

**Audit durable trace:** §24 — fact and grant, never conversational content.

**Member transparency minimum:** one plain sentence naming that a system check
happened and why (§25).

---

## §37 — Ordered implementation units

1. **Principal / delegated-authority contract** — everything else is unsafe without it
2. **Objective / `publicRun` envelope** — required for truthful rendering
3. Shared bridge types
4. READ-only admission gate
5. MAIA request adapter
6. JARVIS result adapter
7. Consent enforcement
8. Sanctuary enforcement
9. Evidence / standing rendering
10. Audit trace
11. Shadow bridge (no member-visible effect)
12. Witnessed READ-only proof
13. WRITE proposal consideration — only then

Order held: (1) and (2) are prerequisites the evidence independently confirmed.
(11) before (12) because a shadow bridge exercises the whole path with no member
exposure — the same discipline Unit 12 used by proving against a live runtime
before claiming capability.

---

## §38 — Smallest next unit

**JARVIS PRINCIPAL + DELEGATED AUTHORITY CONTRACT.**

Chosen on evidence, not preference:

- **T4 is the highest-severity threat** and principal identity is the only thing that
  addresses it. Every other control is downstream of knowing who is asking.
- The **objective envelope is necessary but strictly downstream** — publishing
  objectives on an unauthenticated surface makes an ungoverned interface more
  legible, not safer. It should be unit two.
- The packet has **no principal concept at all** (§0.3), so this is a genuinely new
  contract, not an extension — it needs its own unit to be designed properly.
- It is **design + contract only**: no MAIA caller, no execution path, nothing
  member-facing. It cannot accidentally become an integration.

---

## §39 — Classification

**B — MOSTLY READY, PRINCIPAL / OBJECTIVE CONTRACT INCOMPLETE**

The bridge contract is substantially defined: boundary, directionality, taxonomy,
authority table, consent classes, Sanctuary rules, envelopes, admission
dispositions, result semantics, rendering contract, invariants and threat model are
all specified. Two named prerequisites remain, both specifiable as discrete units.

Not **E** — nothing is currently exposed or unsafe; the bridge is unbuilt and the
runtime is loopback-only with a single operator.
Not **C** — founder rulings are needed (§35) but do not block the next unit, which
is authority plumbing; rulings decide which grants get *issued*, not whether
principals can be *represented*.
Not **D** — the runtime contract is sound; it is incomplete in one narrow, known
respect (§13).
