# MI-A1 — INSTRUMENT AMENDMENT · and MI-01 PASS 2

**Founder-authorized 2026-09-13.** MI-01 Pass 1 **FROZEN at `8a260313`**.
Read-only. ⛔ **No validators. No migrations. No cast cleanup. No version tags.**

---

## PART A — MI-A1 · the instrument amendment

Pass 1's `H1…H5` conflated two different proofs under one letter. **`INTEGRITY ≠ INTERPRETATION`** —
the same shape of error as **`IDENTITY ≠ AUTHORITY`**, which is what BW existed to correct. The
consequence axis is retained; four independent proof dimensions now sit beneath it.

### A1 · Storage integrity — *did we get the bytes that were stored?*
`none` · `database-backed` · `digest-verified` · `signed/otherwise verified`

### A2 · Interpretive validity — *why do we believe those bytes mean what the type says?*
`runtime validated` · `version-dispatched parser` · `structural discriminator` · `DB-enforced
structure` · **`outcome-verified`** (new — see §A.1) · `cast only` · `opaque — interpretation not required`

### A3 · Version discipline
`single stable shape` · `explicit version field` · `migration-guaranteed` · `structural implicit
version` · `known mixed historical shapes` · `unknown`

### A4 · Producer closure
`closed` · `bounded exceptions` · `open` · `unknown`

### Consequence (retained, separate)
`display` · `prose recovery` · `cognition` · `memory` · `mutation` · `authority` · `agent action`

### A.1 ⭐ Why `outcome-verified` had to be added — and a Pass 1 correction

Pass 1 classified `recoverEvidence` as **H2 "digest-verified"**. **That label was right for the
wrong reason, and the right reason is stronger.**

`recoverEvidence` does **not** treat the payload as opaque. It reasons directly from fields inside
the cast `readState`: `readState.sections[ref.sectionId]`, `state.range.start/end`,
`readState.revisionDigest`, `state.digest`. Under the founder's amendment that is exactly the case
where a digest would prove only *nobody changed this payload* and **not** *this payload satisfies
the current type*.

⭐ **But the interpretation is checked by its own output.** A wrong `range` cannot silently yield
wrong prose — the slice it produces is re-digested against `state.digest` and a mismatch is a typed
refusal (`section_integrity_failure`). A missing field fails closed the same way: `sha256(text) !==
undefined` refuses.

That is neither "cast only" nor "runtime validated" — it is a third mode worth naming:

> **outcome-verified** — the structure is not proven before use; any misinterpretation is caught
> because the derived result must reconcile with a separately stored fact.

**Corrected record**: `recoverEvidence` — A1 `digest-verified` · A2 **`outcome-verified`** ·
consequence `prose recovery`. ⚠️ It is *only* the evidence prose that carries this protection. The
observation **text, lens and phenomenon** that reach the prompt carry none.

---

## PART B — MI-01 PASS 2 · walked by consequence, not by subsystem

### Tier 1 · Agent / action sinks

🔴 **`service_connectors.capabilities` — the real specimen of this pass.**

```ts
capabilities: (row.capabilities ?? []) as ConnectorCapability[],      // connectorDb.ts:29
status:       row.status as ConnectorStatus,

(c) => c.isEnabled && c.status === 'connected' && c.capabilities.includes(capability)   // types.ts:108
```

Persisted jsonb → **pure cast** → **selects which connector is used to perform an action**. This
outranks every cognition path in the census.

| Dimension | Finding |
|---|---|
| **A1 storage** | `database-backed` |
| **A2 interpretation** | ⛔ **`cast only`** — `ConnectorCapability` is a closed union in TypeScript with **no runtime guard anywhere**; `.includes(capability)` is a plain string match |
| **A3 version** | `single stable shape` — **one** migration (`20260402000001`), never altered |
| **A4 producers** | ⚠️ **`open`** — `connectorDb`, `caldavConnector`, `auth/google/callback`, `auth/google/disconnect`, `nostr/register` all write it |
| **Consequence** | **agent action** |

⛔ **Stated precisely, without inflation.** The read is member-scoped (`WHERE member_id = $1`), so
the failure mode is **misrouting among a member's own connectors** — a connector considered eligible
for an operation it does not support — **not** cross-member breach. The DB also matches structurally
(`capabilities @> $2::jsonb`), so shape matters at the query layer too.

⭐ Mitigating and worth naming: **A3 is the strongest possible value here** — one migration, one
shape, no drift. The trust-the-store premise *holds* for this column, which is why `cast only` is
survivable. It is the **A4 `open`** value that makes it worth watching: five writers, one union, no
guard.

### Tier 2 · Canonical-turn cognition — ⭐ clean

Every cast inside `lib/maia/canonical-turn/**` is on an **in-memory** value
(`participation.admitted.map(renderedRow) as AdmittedRow[]`, `Object.keys(PRODUCER_REGISTRY) as
ProducerId[]`). **No persisted JSON is hydrated inside the canonical turn.** The turn composes from
producers; persistence reads live upstream in them.

### Tier 3 · Memory / episodic — ⭐ the founder's worry does not land here

> **`member_memory_atoms` and `member_daily_anchors` carry no jsonb columns at all.**

The **live** memory substrate (Cat 6 — the one that reaches the prompt) is entirely typed columns.
There is no persisted-untyped → typed boundary on it to get wrong.

The large unvalidated jsonb surfaces — `episodic_memories` (8 jsonb cols), `somatic_memories` (8),
`morphic_pattern_memories` (9) — belong to the **dormant** Cat 3/Cat 4 services. Reachability
checked, not assumed:

| Service | Importers | Reachable from a route? |
|---|---|---|
| `EpisodicMemoryService` | `MemoryPalaceOrchestrator`, `substrateMap`, `episodes/mark/route` | ⛔ **No** |
| `SomaticMemoryService` | `MemoryPalaceOrchestrator`, `substrateMap` | No |
| `MorphicPatternService` | `MemoryPalaceOrchestrator`, `substrateMap`, `recurrenceDetector` | No — `recurrenceDetector` has no importers |
| `MAIAMemoryArchitecture` | — | No route imports it |

⚠️ **Correction to an intermediate finding in this very pass.** A grep listed
`app/api/sovereign/episodes/mark/route.ts` as importing `EpisodicMemoryService`, and I recorded it as
route-reachable. **Reading the file refuted that**: the only occurrence is a comment —
*"…outside this route's jurisdiction"* — and the route runs its own typed `query<MarkedEpisodeRow>`.
**The grep found the name, not the dependency.** Kept rather than deleted; it is the third time in
this programme an instrument has been wrong in the direction of alarm.

### Tier 4 · Remaining high-consequence hydration
⛔ **Not walked.** 338 `JSON.parse` sites and the majority of the 303 row-casts remain un-censused
and are **not claimed safe**.

---

## PART C — the question Pass 2 was told to ask

> **What is the oldest row this reader could legally encounter?**

| Path | Oldest producer | Known historical shapes | Current reader acceptance |
|---|---|---|---|
| `service_connectors.capabilities` | `20260402000001`, single migration | **1** | accepts any string array; union unenforced at runtime |
| `developmental_readings.observations` | `20260904000001` | ⚠️ **2** — v1/v2, `phenomenon` optional, **no version field** | asserts current shape for all rows |
| `member_memory_atoms` | — | n/a — no jsonb | n/a |

⭐ **This table is the whole finding of MI-01 in three rows.** The action sink has the weakest
interpretation proof and the *strongest* version discipline. The cognition path has known drift and
no discriminator. **Neither is a defect yet; together they say where trust in persistence stops
being warranted by persistence's history.**

---

## PART D — hypotheses, ⛔ still not ratified

> **Storage integrity does not establish semantic validity.** Retrieval establishes what was stored;
> interpretation requires its own warrant.

> **A read may trust persisted structure only to the extent that all admissible producers and
> historical versions establish the invariants the reader consumes.**

Pass 2 supports both and ratifies neither. ⛔ **Do not infer `schema_version` everywhere from one
specimen** — explicit tag, migration to canonical shape, backward-compatible parser, structural
discriminator, opaque historical event, and validation against a union are all legitimate, and which
is right depends on what the object means and how it evolves.

## Standing

**MI-01 PASS 1 FROZEN `8a260313` · MI-A1 AMENDMENT ADOPTED · PASS 2 COMPLETE, READ-ONLY, ZERO CODE
CHANGES · `outcome-verified` ADDED AND PASS 1's H2 CORRECTED · ACTION SINK: 1 SPECIMEN
(`service_connectors.capabilities`, cast-only, open producers, single stable shape, member-scoped) ·
CANONICAL TURN CLEAN · LIVE MEMORY CARRIES NO JSONB · JSONB-HEAVY MEMORY SERVICES DORMANT AND
UNREACHABLE · TIER 4 UN-CENSUSED · NO REPAIR · NO VALIDATOR · NO VERSION MIGRATION · AST GUARD LANE
STILL NOT OPENED · BW-03 `f276c730` · BW-04 `d3bc8670` · AUTH-05 DEMONSTRATED, NOT RATIFIED.**

> *The store may be trusted only for the invariants its whole producer history actually guarantees.*
