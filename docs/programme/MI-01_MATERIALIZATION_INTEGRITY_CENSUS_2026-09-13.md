# MI-01 — MATERIALIZATION INTEGRITY CENSUS · PASS 1

**Founder-authorized 2026-09-13.** Read-only. ⛔ **No validators added. No repairs. No code changes.**
Deliberately **not** called BW-05 — BW answered the authority question it was created to investigate.

**The question**: *at every persisted-untyped → typed-domain boundary, what makes the resulting
object true enough to use?*

---

## 1. Declared scope, and the remainder

The boundary is larger than one pass can census with integrity:

```
369  jsonb/json columns across 180 tables
303  row-cast hydration sites in lib/
338  JSON.parse call sites in lib/
```

⛔ **Counting casts is the wrong instrument** — the interesting class is **H4**, defined by
consequence. Pass 1 therefore censuses **by sink, not by count**: it starts at the consequential
operations (cognition · mutation · authority · member-visible truth) and walks back to the persisted
bytes. **Censused: the Writer's Studio Work surface — 14 jsonb columns across 4 tables.**
⚠️ **Everything else is UN-CENSUSED and is not claimed to be safe**, including the MAIA memory
surface the founder specifically wondered about.

---

## 2. ⭐ The headline finding — the boundary is asymmetric

> **The organism validates where data ENTERS persistence and casts where it LEAVES.**

Runtime type guards exist and are **real**:

```
isPhenomenon · isDevelopmentalLens · isNonConclusion
```

Every use is on the **write** path — `developmentalReading/freeze.ts`, `developmentalReader/parse.ts`,
`developmentalReader/validate.ts`. **Zero uses on any read path.**

Read-side hydration is a pure cast, and honestly typed as one — `ReadingRow` declares every jsonb
column `unknown`, so the assertion is *visible* rather than disguised:

```ts
scope:      row.scope        as DevelopmentalReading['scope'],
readState:  row.read_state   as DevelopmentalReading['readState'],
observations: row.observations as NonEmptyArray<DevelopmentalObservation>,
```

**This is a coherent architecture, not an oversight**: validate once at the gate, then trust the
store. It holds exactly as well as the premise *nothing else ever wrote this column, and its shape
never changed.* §4 tests that premise.

---

## 3. Classification of the censused paths

| Path | Persisted source | Consequence | Runtime proof | Class |
|---|---|---|---|---|
| `planAuthoredStructure` ← `manuscript_structure_proposals.reviewed` | jsonb | ⭐ **mutation** — creates the member's authored structure units | ✅ `!Array.isArray(reviewed.units)` → refuse, then `validateReviewed(units, sections)` | **H1 VALIDATED** |
| `authorStructureFromProposal` guards | `review_revision`, `section_topology_hash` | mutation | ✅ stale-revision + topology-hash refusals before the last write point | **H1** |
| `loadFrozenDevelopmentalReading` → `developmentalAskReader` → `runStructured` | `developmental_readings` (6 jsonb cols) | ⭐ **MAIA cognition** — reaches the system prompt | ⛔ cast only | **H4** |
| `recoverEvidence` on that reading's `readState` | `read_state` jsonb | prose recovered from an immutable revision | ✅ **digest-verified** (07A) | **H2** |
| `threadStore` → `row.anchor as AskAnchor`; `o as unknown as DevelopmentalReadingIdentity` | `ask_threads` (2 jsonb cols) | selects which observation is addressed → cognition | ⛔ cast only, and a **double cast** | **H4** |
| `ask_turns.staleness`, `.answer_provenance` | jsonb | record / display | ⛔ cast only | **H3** |

**H5 (unresolved): 0** on the censused surface. **No hydrated jsonb feeds an authorization
decision** — authority comes from `member_id` predicates and `BoundWorkScope`, never from persisted
structure. ⭐ That is worth stating plainly: the worst possible class is empty here.

⭐ **The pattern that emerges is better than the raw cast count suggested: the organism validates
where it MUTATES and casts where it REASONS.** A census by count would have reported "303 unchecked
casts" and been useless. A census by consequence reports that the mutation path is guarded and the
cognition path is not.

---

## 4. Does the "trust the store" premise actually hold?

For `developmental_readings` — the H4 path that reaches the prompt:

| Dimension | Finding |
|---|---|
| **Producer** | `developmentalReading/store.ts` `freezeAndStore` — validated, and the only production writer |
| **Immutability** | rows refuse UPDATE; a written shape is never edited in place |
| **DB constraint** | `CHECK (jsonb_typeof(observations) = 'array')` plus the outcome↔observations correspondence — **structure at the array level, nothing about an observation's interior** |
| **Historical producers** | ⚠️ **yes** — see below |
| **Other writers** | ⚠️ `scripts/ws2-07c-reading-gate-a.ts`, `scripts/ws2-07f/falsify-standing-*.ts` also `INSERT INTO developmental_readings`. Witness/gate scripts under rollback contracts, but **producers nonetheless** |

### 4.1 🔴 Contract drift is documented in the hydrator itself

```ts
/* `readingContractVersion` is NOT selected because it is not a column.
   The v1/v2 distinction lives in the observation shape itself — whether
   `phenomenon` may be absent … */
```

⭐ **Two contract versions coexist in one column, discriminated structurally, with no version
field** — and the read path asserts every row is the current `DevelopmentalObservation`. This is not
hypothetical shape drift; it is **recorded, present, and named by the code that performs the cast.**

⛔ The comment's reasoning is right (*a hydrator that invented the field would be asserting a
provenance the row does not carry*). The finding is not that the comment is wrong — it is that
**the premise "the shape never changed" is already false on the one path that reaches cognition.**

---

## 5. The candidate law — ⛔ HYPOTHESIS, deliberately not ratified

> **Retrieval does not prove interpretation.** Materialization is not complete merely because bytes
> were retrieved; structured persisted data becomes domain data only once its required invariants
> have been established.

Pass 1 gives it **one supporting instance** (H4 cognition path with documented version drift) and
**one strong counter-consideration** (the mutation path is already validated, so the organism does
not universally need telling). ⛔ **Not enough to canonize**, and the same discipline that held
AUTH-05 holds this.

## 6. What Pass 1 does NOT establish

- ⛔ **Nothing about the MAIA memory surface.** The founder's specific worry — *persisted historical
  JSON crossing directly into MAIA cognition under a TypeScript assertion* — is **answered YES for
  developmental readings** and **UNMEASURED for memory atoms, episodic memory, agent runs and the
  canonical-turn producers.** That is the obvious Pass 2.
- ⛔ Nothing about `JSON.parse` sites (338) — a different shape from row casts and not walked.
- ⛔ No claim that H3 is safe; only that its consequence is bounded *on the paths censused*.
- ⛔ No validator, no repair, no lane opened.

## 7. Standing

**MI-01 PASS 1 COMPLETE · READ-ONLY · ZERO CODE CHANGES · SCOPE DECLARED AND REMAINDER NAMED ·
`H1 2 · H2 1 · H3 1 · H4 2 · H5 0` ON THE WORK SURFACE · NO HYDRATED JSONB FEEDS AUTHORITY ·
CONTRACT DRIFT DOCUMENTED ON THE COGNITION PATH · "RETRIEVAL DOES NOT PROVE INTERPRETATION" HELD AS
HYPOTHESIS · AST GUARD LANE NOT OPENED (deferred behind MI-01 by ruling) · BW-03 FROZEN `f276c730` ·
BW-04 FROZEN `d3bc8670` · AUTH-05 DEMONSTRATED, NOT RATIFIED · BASELINE STILL 33.**

> *The organism validates where it mutates and casts where it reasons. Pass 1 found the one place
> that matters: the path into MAIA's mind.*
