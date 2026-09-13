# MI-01 PASS 2B — WARRANT CLOSURE

**Founder-authorized 2026-09-13.** MI-A1 + Pass 2 **FROZEN at `1390af6e`**.
Read-only. ⛔ **No validator. No migration. No version tag. No repair.** Two specimens only; ⛔ no
Tier-4 sweep, ⛔ dormant memory not walked.

---

## PART A — two instrument refinements adopted

### A.1 ⭐ Proof is consequence-local

> **Outcome verification proves only the derived proposition that is independently reconciled. It
> does not validate the source object as a whole.**

In `recoverEvidence` the chain is: unverified `readState.range` → slice source text → digest the
slice → compare to an independently stored digest → match warrants **the recovered prose**. A bad
range cannot silently manufacture different prose.

⛔ **That warrant does not travel sideways** to `lens`, `phenomenon`, observation metadata, or any
other field of `readState`. Without this rule, a future reader sees `outcome-verified` on a row and
mentally promotes the whole row to trusted — which would be the same promotion error as reading a
digest as a proof of meaning.

**MI-A1 is amended**: an A2 value is recorded **per consumed proposition**, never per row.

### A.2 ⭐ MI-METHOD-1 — promoted to an explicit instrument law

> **Textual occurrence is evidence of where to inspect, never evidence by itself of runtime
> reachability, dependency, semantic classification, or authority.**

Earned by four independent falsifications in this programme, all kept in the record:

1. a brace matcher truncated on template literals and misclassified **7 of 33** exports (BW-02);
2. a helper-name list omitted `requireArranger` and reported six routes as unauthorized (BW-02 §5.4);
3. a grep read a **comment** as a dependency and made a dormant service look route-reachable (Pass 2);
4. ⭐ **this pass**: grepping `capabilities` found **5** writers; grepping `upsertConnector(` found
   **7**. The earlier number was in a published record and was wrong.

⚠️ Note the direction: three erred toward **alarm**, one toward **false reassurance**. *An
instrument that only ever over-reports is merely noisy; one that can under-report is dangerous — and
this one did both.*

---

## PART B — SPECIMEN A · `service_connectors.capabilities`

**Question**: can any writer persist a string outside the `ConnectorCapability` union?

### The complete producer graph — traced, not sampled

| Writer | Value passed | In the enforced ship program? |
|---|---|---|
| `app/api/auth/google/callback` | literal `['send_email','create_calendar_event','read_calendar','read_contacts']` | ✅ |
| `app/api/auth/google/disconnect` | literal `[]` | ✅ |
| `app/api/nostr/register` | literal `['publish_note']` | ✅ |
| `app/api/connectors/obsidian/configure` | literal `['export_markdown','export_transcript']` | ✅ |
| `app/api/connectors/obsidian/export` | **omits** `capabilities` → `COALESCE` preserves the stored value | ✅ |
| `lib/connectors/caldav/caldavConnector` ×2 | literal `['create_calendar_event','read_calendar']` | ⚠️ **no** — `lib/connectors/**` is outside `tsconfig.ship.json` |

**Every literal is a member of the union** (all nine values confirmed, `publish_note` and
`send_webhook` included). **No writer accepts a client value, a request body, a `string[]`, or any
dynamic expression.** The parameter is typed `capabilities?: ConnectorCapability[]`, so each literal
is checked against the union at compile time in six of seven sites.

### Deciding result

> ⭐ **CLOSED, WITH BOUNDED EXCEPTIONS** — and therefore **the cast-only reader has a real warrant.**

The exceptions are named rather than waved past, and none is a value-origin counterpath:

1. **Gate coverage** — the two `caldav` call sites are literals, but outside the enforced
   `typecheck` program. A typo there would be caught by full `tsc`, not by the gate.
2. **Out-of-band writes** — direct SQL, a migration, or a manual edit bypasses application typing
   entirely. True of every column; stated because A4 asks.
3. ⚠️ **`COALESCE($6, service_connectors.capabilities)` persists whatever is already stored.** If a
   non-union value ever entered by (1) or (2), no later ordinary write removes it.

### ⭐ Why this matters beyond the specimen

This is a **counterexample to "every JSONB read requires runtime validation."**

```
cast-only  +  single stable shape  +  closed producers  +  member-scoped consequence
        =  sound
```

Adding a validator here would buy almost nothing and would imply a rule the evidence does not
support. **The composition is what decides, not any single dimension.**

---

## PART C — SPECIMEN B · `developmental_readings.observations`

**Question posed correctly**: not *is v1 a valid v2* — but *does every historical shape establish
every invariant **this consumer** relies upon?*

### ⭐ The drift runs in the safe direction

```
v1   an observation REQUIRED a phenomenon
v2   an observation MAY exist without one        (WS2-07-F1)
```

v2 **relaxed** a requirement. A required field satisfies an optional one, so **every v1 row is a
valid v2 row.** ⭐ **The inversion is worth naming: the risk from this drift is carried by NEW rows,
not old ones** — a consumer that dereferenced `phenomenon` unconditionally would break on v2 rows
and be perfectly safe on v1. The instinct to fear "old data" would have looked in the wrong place.

### Every consumed invariant, checked

| Consumed by cognition | Site | v1 | v2 |
|---|---|---|---|
| `observation.key` | context:129 | ✅ | ✅ |
| `observation.observation` (the prose MAIA is shown) | context:130 | ✅ | ✅ |
| `observation.doesNotEstablish` | context:132 | ✅ | ✅ |
| `observation.structureDependency` | context:133 | ✅ | ✅ |
| `observation.evidenceRefs` | context:112, 135 | ✅ | ✅ |
| `reading.lens`, `reading.frozenAt` | reader:157 | ✅ | ✅ |
| **`observation.phenomenon`** | context:131 · reader:162 | ✅ | ⚠️ may be absent |

⭐ **The one drifted field is consumed CONDITIONALLY at both of its two consumption sites:**

```ts
...(observation.phenomenon ? { phenomenon: observation.phenomenon } : {})   // developmentalContext
o.phenomenon ? `The shape you gave it: ${o.phenomenon}…` : …                 // developmentalAskReader
```

`readingContractVersion` is the other v1/v2 difference and is **not consumed** — the hydrator
declines to select it, deliberately.

### Deciding result

> ⭐ **COMPATIBLE FOR CONSUMED INVARIANTS.** The current reader assumes no invariant a historical
> row fails to guarantee.

⛔ **Residue, stated:** this is a **contract-and-source** analysis. **No production rows were read**,
so it establishes what the declared shapes guarantee, not what any particular stored row contains.
The declared v1/v2 delta is taken from the contract's own version note; a v1 row that matches neither
declaration would not be detected by this method.

---

## PART D — what Pass 2B concludes

Both live specimens close **cleanly**, by different warrants:

| | A2 interpretation | A3 version | A4 producers | A5 consequence | Verdict |
|---|---|---|---|---|---|
| `capabilities` | cast only | single stable shape | **closed (bounded)** | agent action | **warranted** |
| `observations` | cast only | **known mixed** | bounded | cognition | **warranted for consumed invariants** |

> ⭐ **Neither specimen needs a validator, and they are safe for different reasons** — one because
> its producers are closed, the other because its drift is orthogonal to what its consumer relies on.
> **A rule that demanded validation at both would have been right about neither.**

This is the composition model earning its keep: `A1–A4` relative to `A5`, not any dimension alone.

## PART E — hypotheses, ⛔ still unratified

> **Storage integrity does not establish semantic validity.**

> **A read may trust persisted structure only to the extent that all admissible producers and
> historical versions establish the invariants the reader consumes.**

Pass 2B is the **first evidence that the second hypothesis is operationally decidable** — both
specimens were resolved by applying it, and each resolved differently. ⛔ Still not ratified: two
specimens, one subsystem, no production rows read.

## Standing

**PASS 2B COMPLETE · READ-ONLY · ZERO CODE CHANGES · SPECIMEN A CLOSED WITH BOUNDED EXCEPTIONS ·
SPECIMEN B COMPATIBLE FOR CONSUMED INVARIANTS · NO VALIDATOR ADDED · NO VERSION TAG · MI-A1 AMENDED
(proof is consequence-local) · MI-METHOD-1 PROMOTED · TIER 4 UN-CENSUSED · DORMANT MEMORY NOT WALKED
· NO PRODUCTION ROWS READ · MI-01 PASS 1 `8a260313` · MI-A1+PASS 2 `1390af6e` · BW-03 `f276c730` ·
BW-04 `d3bc8670` · AUTH-05 AND BOTH MI HYPOTHESES DEMONSTRATED, NOT RATIFIED.**

> *The organism's JSONB boundary is less dangerous than its cast count suggests — and the exact
> circumstances under which trust-on-read stops being warranted are now nameable.*
