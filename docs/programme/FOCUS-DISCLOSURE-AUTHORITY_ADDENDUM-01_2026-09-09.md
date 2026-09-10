# FOCUS DISCLOSURE AUTHORITY — ADDENDUM 01

**Extends:** `FOCUS-DISCLOSURE-AUTHORITY_ARCHITECTURAL-RECORD_2026-09-09.md` (`acb048eaf`)
**Status:** ARCHITECTURAL AMENDMENT · **Implementation:** SUSPENDED

> The disclosure authority was correctly designed as one boundary; what was
> incomplete was our knowledge of the gestures, scopes, and act identities that
> must arrive at it.

## 0 · What this addendum does and does not do

It **extends the consumer inventory and the disclosure vocabulary.** It does **not**
supersede C, the capability contract, or F1a–F1l — all of which stand unchanged.

`acb048eaf` remains **frozen and unamended.** Its ontology held. What the
implementation census disproved is its *inventory* — the claim that the complete
consumer graph was known — and its *assumption* that the ratified scope vocabulary
could describe every consumer. A record that led to a correct discovery is not
improved by being rewritten to look as though it never needed one.

Seven findings, each established by repository evidence, not by reasoning from the
record:

1. `/readings` is a third prose-to-cognition consumer.
2. `unit` and `range` are legitimate one-handoff disclosure scopes.
3. The surface-specific `boundary` vocabulary is insufficient.
4. `commission_reading` has no `gesture` value.
5. Focus's server-generated identifiers are incompatible with F1k.
6. Caller-side stable act identity is the residual classification mechanism.
7. F1m and F1n are added.

## 1 · The consumer inventory is three

```
Focus      ─────┐
Ask        ─────┼──→  system retrieves Work prose  ──→  MAIA cognition
/readings  ─────┘                                          ↓
                                          disclosure authority required
```

`/readings` census (read-only, R1–R9):

| | Finding |
| --- | --- |
| **Entry** | `POST /api/sovereign/manuscripts/[id]/readings`; body allowlisted to `{lens, scope}` |
| **Scope** | `ReadingScope = whole \| section \| unit \| range` (`developmentalReading/scope.ts:32-36`) |
| **Plaintext flow** | `loadRevisionContent` → `recoverEvidence` per `bodyScope` id → `renderRequest` → `read.ts:104` `messages` → anthropic |
| **Authority today** | `getMemberIdFromRequest` + ownership in SQL. No consent, no boundary, no receipt |
| **Granularity** | ONE model handoff carrying N recovered sections |
| **Handoff** | None — a single `await runStructured(…)` |
| **Retry** | No retry, no idempotency identity |
| **Siblings** | `commissionReading` is the only non-test caller of `readDevelopmentally` |

The reader's own system prompt states what crosses: *"the full text of the sections
you may cite as prose."* It is the largest of the three by volume.

**Ontology unchanged.** This is class C — system-retrieved Work prose to cognition,
member-invoked. One authority, three consumers.

## 2 · Boundary vocabulary

The existing literal names the old surface model:

```
boundary CHECK IN ('writers_studio.focus->maia_cognition')   ← ONE value
```

Three consumers do not create three route-specific boundary values. **One semantic
boundary describing what actually crosses** — conceptually `manuscript_prose →
maia_cognition`; exact spelling follows repository convention. It must not name
Focus, Ask or Readings. **Those belong in `gesture`.**

```
old Focus-specific value    HISTORICAL — preserved, never rewritten
new semantic boundary       REQUIRED for new canonical crossings
```

Existing receipts are not rewritten to normalize vocabulary.

## 3 · Gesture vocabulary

```
ask_maia                        lawful for Ask
work_with_this · widen_focus    existing Focus gestures, unchanged
commission_reading              ADDED for /readings
```

## 4 · Scope vocabulary — `unit` and `range` become first-class

```
whole_work
section
passage
unit      ← ADDED
range     ← ADDED
```

**Locators are lawful to record**, under the test the census identified:

> A durable locator may name the thing that was disclosed; it may not smuggle in a
> containing location merely because implementation knows it.

```
section   → section_ref                        LAWFUL
passage   → containing section_ref             PROHIBITED (unchanged)
unit      → unit_ref                           LAWFUL
range     → from/to section refs               LAWFUL — the bounds ARE the
                                               identity of the disclosed range
```

**Named locator columns, not generic JSONB.** A free-form bag would defeat
`RefusedReceiptField`, the compile-time type that exists to make `range`, `offset`
and `digest` unrepresentable. Adding `scope_kind='range'` does **not** make a
free-form `range` payload lawful.

**Range endpoints travel as a pair.** One endpoint without the other must not
produce a truthful range locator.

**Granularity holds:**

```
one unit reading   → ONE disclosure act → NOT N section receipts
one range reading  → ONE disclosure act → NOT N section receipts
whole_work         → NEVER stretched to mean "some multi-section scope"
```

## 5 · Act identity — the residual classification mechanism

**Finding.** `app/api/writers-studio/focus/route.ts:65,68`:

```ts
const requestId    = randomUUID();
const disclosureId = randomUUID();
```

Both minted server-side per HTTP request. A transport replay therefore yields fresh
identifiers and a second apparent disclosure act. **Focus presently lacks the
mechanism necessary to satisfy F1k.** This does not retroactively make earlier
crossings violations; it is an implementation incompatibility exposed by a newly
ratified law.

**One caller-owned act identity**, not two remembered identifiers — doubling them
would double F1l's residual procedural risk.

```
writer performs one gesture   → caller mints ACT IDENTITY
transport replay              → SAME act identity
deliberate new gesture        → NEW act identity
```

`requestId` and `disclosureId` live beneath that identity: same act → same durable
identities; new act → both fresh. Prohibited:

```
same act identity → random new requestId/disclosureId on every HTTP invocation
```

**Identity is payload-bound**, per the `draftConcurrency` idiom
(`lib/manuscript/draftConcurrency.ts:76-95` — `idempotencyKey` + operation +
payload hash → `replay | conflict | proceed`, with `idempotency_key_reuse` when the
same key carries a different payload):

```
same act identity + same canonical payload      → replay / same act
same act identity + different canonical payload → CONFLICT / REFUSE
different act identity                          → new act
```

The canonical payload represents **the writer gesture whose identity is being
protected**, not merely the fields that reach the receipt:

```
Ask       work + anchor + question + scope semantics
Reading   work + lens + ReadingScope
Focus     work + scope + gesture + ask
```

⛔ The hash is identity protection. It is **not** disclosure evidence and never
becomes authority.

**The substrate is not the defect.** `runtime_consent_state.request_id` is UNIQUE,
immutable, first-write-wins on conflict; receipt reconciliation already understands
same-id replay. Both behave idempotently *given* stable identity. The defect is
that producers mint identity **after** the point where same-act-versus-new-act
meaning was known — which is exactly F1l.

> The fix moves **act identity** upstream. It does not move **authority** upstream.
> Authority still lives at the cognition-bound load.

## 6 · `/readings` handoff

R7 puts `/readings` where Ask already was: `const outcome = await runStructured(…)`
cannot truthfully determine when `attempted → crossed`. Migration includes a
genuine `{ handoff, result }` separation.

```
handoff occurs                → crossed
result later fails            → still crossed
handoff never occurs          → attempted
```

Response success is not disclosure evidence.

## 7 · Falsifiers added

```
F1m — SCOPE FIDELITY

  UNIT commission   → one receipt · scope_kind = unit
                    → never whole_work · never decomposed into section receipts
  RANGE commission  → one receipt · scope_kind = range · truthful paired bounds
                    → never whole_work · never decomposed into section receipts

F1n — ACT IDENTITY IS PAYLOAD-BOUND

  same act identity + same canonical payload      → idempotent, same act
  same act identity + changed canonical payload   → refusal / conflict
                                                  → no fresh capability
                                                  → no disclosure
  new deliberate act                              → new act identity
                                                  → fresh requestId
                                                  → fresh disclosureId
```

**F1k must be exercised against Focus specifically**, because a known-bad
implementation now exists — the regression evidence this lane has repeatedly asked
for and rarely been able to obtain:

```
current server-random UUID behavior   → the falsifier MUST go red
stable replay identity                → the falsifier goes green
```

A guard that cannot be shown red against `randomUUID()` has not tested F1k.

## 8 · Standing

```
ONTOLOGY                       UNCHANGED — one boundary, one authority
C + CAPABILITY CONTRACT        UNCHANGED
F1a–F1l                        UNCHANGED
F1m · F1n                      ADDED

CONSUMERS                      3 (Focus · Ask · /readings)
BOUNDARY VOCABULARY            one semantic value REQUIRED; old value HISTORICAL
GESTURE                        commission_reading ADDED
SCOPE                          unit · range ADDED, locators lawful, JSONB refused
ACT IDENTITY                   caller-owned, payload-bound, upstream of the boundary
/readings HANDOFF PORT         REQUIRED

BASE RECORD                    acb048eaf · FROZEN · UNAMENDED
IMPLEMENTATION                 SUSPENDED
CODE / SCHEMA MIGRATION        NOT AUTHORIZED
PUSH / PR / MERGE / DEPLOY     NOT AUTHORIZED

FORMAL FOCUS WITNESS           UNSPENT
D9-PHENOMENOLOGY-WITNESS-01    UNRUN
PRODUCTION                     5f65038d2 · Focus flag OFF · untouched
```
