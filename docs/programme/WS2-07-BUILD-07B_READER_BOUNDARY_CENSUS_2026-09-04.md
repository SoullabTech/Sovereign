# WS2-07 · BUILD-07B — Reader Boundary Census

> **Read-only. Nothing here is built.** This census answers the founder's ten questions and the
> critical boundary question for BUILD-07B DEVELOPMENTAL READER, from the canonical tree, so that
> a 07B contract and its falsifiers can be adjudicated **before** any code. It authorizes
> nothing. No model was called, no prompt was written, no schema, route, surface or persistence
> was touched, no `DevelopmentalReading` was constructed, and no manuscript was read by a model.

```text
LANE               JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01
UNIT               BUILD-07B DEVELOPMENTAL READER
STATE              BUILD-07B OPEN · FIND/BOUNDARY CENSUS ONLY
TRIGGER            BUILD-07A DEVELOPMENTAL EVIDENCE CLOSED / ACCEPTED and present on canonical
TRIGGER SATISFIED  clean-main-no-secrets @ 27ec9f895 (merge of PR #1184)
CENSUS TREE        27ec9f895 — every file:line below is read from this commit
AUTHORIZES         read-only discovery of the developmental-reader boundary
DOES NOT AUTHORIZE implementation · model calls · new prompts · new schema · new persistence ·
                   routes · surfaces · DevelopmentalReading construction · editorial
                   recommendations · manuscript mutation · BUILD-07C+
GOVERNED BY        WS2-07-UNDERSTAND_DEVELOPMENTAL_READING_SEMANTICS.md (§2 context principle,
                   §3 authored-structure ruling, §4 lens/phenomenon crossing)
                   WS2-07-DECIDE_DEVELOPMENTAL_READING_OBJECT.md (INV-0 … INV-25)
                   WS2-07-BUILD-07A_EVIDENCE_WITNESS_2026-09-03.md (§8, §9)
INHERITS           WS2-07-FIND_DEVELOPMENTAL_INTELLIGENCE_CENSUS_2026-09-02.md — not repeated;
                   its EXISTS / PARTIAL / MISSING / LEGACY / DO NOT REUSE rows stand
NEXT               founder / Jarvis adjudication → define 07B contract + falsifiers → only then
                   authorize BUILD
```

Classification vocabulary, as used in FIND: **EXISTS** (present and usable as-is), **PARTIAL**
(present, does part of the job, named gap), **LEGACY** (present, superseded, not wired),
**DUPLICATE** (two things doing one job), **MISSING** (looked for, not found), **DO NOT REUSE**
(present, and reusing it would violate a ruling). One addition for a reader census: **PATTERN** —
the *shape* is inheritable while the *substrate* is not; every PATTERN row says which half.

---

## 0 · The critical question, answered first

> *What is the smallest typed boundary through which MAIA can receive recoverable manuscript
> evidence and authored structure without yet being allowed to create a developmental
> observation?*

**Answer (for adjudication, not decree).** The boundary already has its input half on canonical
and lacks its output half. It is smallest when it is built from **exactly three 07A values and
nothing else**, and when what comes back is **not yet an observation**:

```text
INPUT — what MAIA may receive                       WHERE IT EXISTS TODAY

  DevelopmentalEvidence                              lib/manuscript/development/readState.ts:127-131
    .readState   ids · offsets · digests · topology   (no prose by construction, :14-17)
    .coverage    per-section 'position' | 'body'      readState.ts:119-124

  Recovered  (prose enters ONLY through this)         lib/manuscript/development/resolve.ts:47-54
    produced by recoverEvidence(ref, readState,        resolve.ts:86
    revisionContent) against the IMMUTABLE revision,
    digest-verified before a single character is
    sliced (:79-84); addressed by a SectionRef /
    PassageRef under the frozen state

  FrozenStructureContext                              readState.ts:88-91 (inline, frozen at capture,
    the member-authored topology AS READ               :77-87), or Recovered{kind:'structure'}
                                                       (resolve.ts:53)

OUTPUT — what MAIA may return (MISSING; the 07B contract defines it)

  a READER RESULT that is below a DevelopmentalReading:
    · every claim carries EvidenceRef[] (07A vocabulary), NOT observation-id strings
    · the refs are provable by bindEvidence(refs, evidence) against the SAME
      DevelopmentalEvidence (inputFingerprint equality) — bind.ts:88
    · it has NO field for interpretation, possibilities, lens, phenomenon, severity,
      id, or persistence (DECIDE INV-14, INV-15, INV-12; §13 "no reader")
    · it is a value "for inspection — never for storage" in the sense interpret.ts:258-271
      already gives refusedReading: 07C, not 07B, mints identity and freezes
    · a typed 'none' and a typed refusal are distinct results (DECIDE INV-23, §10)

WHAT MAY NEVER CROSS IT
    LiveDraftState / LiveWork (.sections[].text)      readState.ts:135-140 · resolve.ts:178-183
    manuscript_draft_sections.text read at model time  (INV-5; evidenceRef.ts:27-33)
    manuscript_structure_units rows read at model time (must come through the frozen context)
    a Map<sectionId, string> of bodies with no readState behind it (interpret.ts:232)
```

The structural guarantee that "not yet an observation" holds is the same one BUILD-07A used for
"not yet a reading": **absence of the field**. A reader result type that has no `interpretation`,
no `lens`, no `id` cannot be populated with one by a caller that forgot to check (the reasoning at
`interpret.ts:177-184` and `ask/anchor.ts:4-8`). What 07C adds — lens, phenomenon, observation
identity, provenance freeze, persistence — is then *addition*, never *promotion*.

Two things this answer does **not** settle, flagged for adjudication in §3:

- whether the reader may return **observation text** at all, or only bindable references plus
  typed non-conclusions (the boundary between "may faithfully read" and "may notice");
- whether the **lens** (what is being asked) is 07B commissioning input or 07C classification.

---

## 1 · The ten questions

### Q1 · What can the existing reader actually consume today?

`ReaderInput` (`lib/manuscript/structure/interpret.ts:228-236`):

```text
pass             1 | 2 | 3
evidence         StructureEvidence — mechanical observations over HEADINGS (evidence.ts:126-132)
sections         HeadedSection[] = { id, position, heading } for the WHOLE draft (evidence.ts:134-138)
bodies           ReadonlyMap<sectionId, string> — "only what the host has supplied so far;
                 empty on pass 1" (:232); filled by the host's fetchBodies from the LIVE draft
previousRequest? { sectionIds, why }
```

It consumes **no draft id, no revision number, no read state, no authored structure**. The
manuscript id lives on the evidence object (`evidence.ts:127`). Bodies are live prose keyed by
section id, indistinguishable inside the reader from any other string — the only provenance they
carry is which ids were asked for (`boundedFetcher`, `maiaReader.ts:800-806`).

| Thing | Class | Note |
|---|---|---|
| `ReaderInput` as a **substrate** for development | **PARTIAL** | wrong evidence vocabulary (heading-derived, not manuscript positions); live bodies; no frozen state; no structure |
| the host-loop **shape** `evidence → reader → validate → coverage → store` (`interpretStructure`, `interpret.ts:288-376`) | **PATTERN** | shape inheritable; substrate (`gatherEvidence`, live `fetchBodies`) is not |
| `HeadedSection` / headings-only topology | **PARTIAL** | 07A's `sectionTopology` (`readState.ts:100`) is the frozen equivalent and carries no headings; headings would have to come through the frozen state or be ruled out |

### Q2 · Can `BoundEvidence` / recovered historical evidence enter the reader without degrading into loose prose?

Two corrections to the question's premise, then the answer.

**`BoundEvidence` is an output-side proof, not an input feed.** It cannot be constructed except by
`bindEvidence(refs, evidence)` (`bind.ts:39-56`: private member, no exported constructor). It is the
relation an *observation* must carry (`bind.ts:20-25`). What enters the reader is
`DevelopmentalEvidence` (what was read, no prose) plus `Recovered` (the words, recovered under it).
`BoundEvidence` is what 07C requires of the reader's *claims* afterwards.

**Inside a prompt, prose is always loose.** A model reads text as text; no type survives
serialization into a message. The invariant 07A actually establishes is narrower and sufficient:
prose may enter a reading **only** through the frozen state and the immutable revision, digest-
verified (`resolve.ts:79-84`), and is **never stored** with the reading (`readState.ts:14-17`,
`evidenceRef.ts:20-25`). Whether a 07B reader degrades that is decided at two seams:

1. **Rendering.** The existing renderer (`buildRequest`, `maiaReader.ts:414-449`; `renderSections`
   `:400-405`) renders bodies with their ids. For development the rendered block would have to
   carry the `Recovered` address — `sectionId`, code-point `range`, and position — so a claim
   can be stated in `EvidenceRef` terms. **MISSING** (no renderer for `Recovered` /
   `FrozenStructureContext` exists; `grep` finds no non-test caller of `recoverEvidence` at all).
2. **Return.** The existing reader returns `evidenceRefs: string[]` naming *mechanical observation
   ids* (`interpret.ts:79-80`), validated by string membership (`:406`, `:433-435`, refusal
   `unknown-evidence-ref`). For development the return must be `EvidenceRef` values proven by
   `bindEvidence` — a refusal vocabulary that already exists (`bind.ts:58-73`: `no_evidence` ·
   `malformed_ref` · `unknown_section` · `body_not_read` · `range_outside_section` ·
   `run_not_as_read` · `structure_not_supplied` · `unknown_structure_unit`).

| Thing | Class | Note |
|---|---|---|
| `bindEvidence` / `BoundEvidence` | **EXISTS** | the output-side proof; zero non-test callers besides the 07A witness script |
| `recoverEvidence` → `Recovered` | **EXISTS** | the only sanctioned prose path; zero non-test callers |
| renderer from `Recovered` / `FrozenStructureContext` to a request | **MISSING** | |
| `evidenceRefs: string[]` observation-id convention | **DO NOT REUSE** | names MAIA's own mechanical observations, not manuscript positions; INV-5 requires typed, durable, recoverable refs |
| `bodies: Map<string,string>` as the prose channel | **DO NOT REUSE** | carries no read state; is exactly the loose-prose door |

### Q3 · Can it read authored structure as it existed with that evidence, rather than today's convenient structure?

The existing reader reads **no authored structure at all**: "no path from the reader to
`manuscript_structure_units`" (`maiaReader.ts:11-15`); FIND recorded *MAIA ↔ authored structure*
as MISSING. Its only structural input is its own earlier perception (proposals), which UNDERSTAND
§3 rules out as the reference for development.

07A answers the "as it existed" half exactly once and inline: `FrozenStructureContext`
(`readState.ts:77-91`) is captured in the same `REPEATABLE READ` transaction as the revision match
(`capture.ts:143-160`; rows via `readStructureRows`, `:111`), and `locateCurrent` reports whether
each unit / the topology has since moved, three-state (`resolve.ts:193-196`; per-unit comparison
`:201-216`). So a 07B reader can read structure "as it existed with that evidence" **only** by
consuming `evidence.readState.structureContext` — and only when `withStructure: true` was set at
capture (`capture.ts:38-47`). Where it was not, structural evidence is refused at bind
(`structure_not_supplied`) — absent, not degraded (INV-16a).

| Thing | Class | Note |
|---|---|---|
| `FrozenStructureContext` | **EXISTS** | never rendered to any reader; **disconnected** |
| `readStructureRows` re-read at model time | **DO NOT REUSE** for the reader | it is a capture-time loader; reading rows again at reader time is the "today's convenient structure" bypass |
| proposal / reviewed structure as the reader's structure | **DO NOT REUSE** | UNDERSTAND §3 ruling; evidenceRef.ts:35-39 refuses proposal ids and reviewed keys |
| `fingerprintStructureRows` (`structureDigest.ts:52`) | **EXISTS** | the topology digest `locateCurrent` compares |

### Q4 · What is the current reader's scope contract: section, run, division, whole Work?

None of those. The contract is **quantitative**, host-enforced, per-reading:

```text
DEFAULT_READ_SCOPE   maxIdsPerRequest 4 · maxSections 8 · maxChars 60_000     readScope.ts:40-44
enforcement          host only, never reader (interpret.ts:315-317); refuses whole, never trims
                     (:332-339, :351-357); pass exhaustion is a distinct refusal (:341-348)
scope of headings    always ALL (interpret.ts:231; read/route.ts:64-73)
requests             individual section ids
out of scope         materials, notes, scraps, uploads, gathered references (readScope.ts:20-24)
truncation           does not exist as a mode (readScope.ts:9-14; coverage.truncated: false, evidence.ts:118)
```

There is no section / run / division / whole-Work scope enum anywhere in the family. 07A supplies
the vocabulary that such a scope would be expressed in: `bodyScope: readonly string[]` +
`withStructure` at capture (`capture.ts:38-47`), `ReadDepth = 'position' | 'body'` per section
(`readState.ts:119`), and refs at section / passage / run / unit / units / topology granularity
(`evidenceRef.ts:91-93`). A *division* scope is therefore expressible today as "the section ids
placed in unit U, at body depth, with structure supplied"; a *whole-Work* scope as "all sections
at body depth" — but **no ceiling for either has been ruled**. UNDERSTAND §2 explicitly leaves
open whether development may read bodies at all and under what ceiling, and rules that the
8 / 60k regime is **not** adopted by inheritance.

| Thing | Class | Note |
|---|---|---|
| `ReadScope` ceilings as the development ceiling | **DO NOT REUSE** by inertia | UNDERSTAND §2: "neither regime is adopted"; the ceiling is a finding, not a knob — but a *new* ceiling must be ruled, not omitted |
| host-side refuse-whole / never-trim enforcement | **PATTERN** | shape inheritable |
| `ReadScopeReport` (`readScope.ts:52-60`, no prose, no headings) | **PATTERN** | the report shape for a refused over-scope request |
| typed division / whole-Work scope | **MISSING** | expressible in 07A terms; not ruled, not typed |
| chronology across the Work (Continuity lens) | **MISSING** | FIND row stands; nothing computes it |

### Q5 · Where is reader identity / version / prompt provenance already represented?

```text
ReaderProvenance { provider:'anthropic'; model; promptHash; readerVersion; frozenAt }
                                                      readerProvenance.ts:12-21
ReaderIdentity   = Omit<ReaderProvenance,'frozenAt'>  readerProvenance.ts:24
produced         createMaiaStructureReader → reader.provenance   maiaReader.ts:782-787
  READER_VERSION 'REAL-STRUCTURE-READER-01'            maiaReader.ts:96
  promptContractHash = sha256(READER_SYSTEM + \0 + JSON(readerTools()))   maiaReader.ts:105-111
  scope ceilings interpolated into the prompt, so a scope change moves the hash   :131-139
persisted        manuscript_structure_proposals.reader_provenance; frozenAt stamped by the
                 store, never accepted from the caller   proposalStore.ts:176-192
seam             StructuredResult.provenance { provider, model (ACTUALLY SENT), latencyMs }
                                                      lib/ai/structured/types.ts:92-97
sibling          ASKER_VERSION + askPromptHash() (system prompt only, no tool contract)
                                                      ask/askReader.ts:29, :53-54
```

DECIDE INV-25 adopts the whole five-field vocabulary for a developmental reading. `ReaderIdentity`
is the reader's half; `frozenAt` is the store's and belongs to 07C.

| Thing | Class | Note |
|---|---|---|
| `ReaderProvenance` / `ReaderIdentity` types | **EXISTS** | reuse as-is; `provider` is the literal `'anthropic'` — narrower than the seam's `ProviderName`; fine while the seam refuses everything else |
| `promptContractHash` discipline (system + tool schema, snake_case `input_schema` load-bearing, `:256-269`) | **PATTERN** | a `DEVELOPMENTAL-READER-01` constant and its own hash would follow it |
| model pinned by caller, echoed by seam | **EXISTS** | `StructuredRequest.model` (types.ts:39-45); result echoes the model actually sent |

### Q6 · What existing pathway would tempt us to bypass BUILD-07A and just hand the model the current manuscript?

Ranked by how easy the bypass would be to write:

1. **`runStructured` itself** (`lib/ai/structured/router.ts:65`). Any module may call it with any
   `messages`; the seam has no notion of evidence and must not — it is a transport contract. The
   guard against this is the 07A module-graph gate in the *other* direction
   (`development/__tests__/evidenceCannotAct.test.ts:31-36`) and, for 07B, an equivalent gate
   that a developmental reader module may import prose from **nowhere but `development/resolve`**.
2. **The structure read route's live body fetch** (`app/api/sovereign/manuscripts/[id]/structure/read/route.ts:64-73`, `:90-99`)
   with `boundedFetcher` (`maiaReader.ts:800-806`) — a working, bounded, member-gated path from
   `manuscript_draft_sections` straight into a prompt. It is correct for its own purpose and is
   exactly what 07A forbids for development (INV-5: no offsets into live prose; INV-7b: recoverable
   state).
3. **07A's own live loaders**: `LiveDraftState` (`readState.ts:135-140`), `loadLiveWork`
   (`capture.ts:181`) and `LiveWork` (`resolve.ts:178-183`) all hold `.text`. They exist for
   `freezeReadState` and `locateCurrent` — supersession measurement — and a reader that accepted
   either would be handed current prose with no frozen state behind it.
4. **`captureEvidence` misuse**: capture is honest (it refuses any revision that does not exactly
   match, `readState.ts:19-24`), but a caller could capture, then *ignore* `readState` and render
   the sections it already has in hand. The boundary must make the rendered text derivable only
   from `recoverEvidence`, not from the capture's inputs.
5. **`AskContext.evidence: unknown; coverage: unknown`** (`ask/askReader.ts:76-90`). Not a prose
   door — the Ask runtime selects zero bodies by construction (`frozenReading.ts:18-22`) — but it
   is the shape of a *loosely typed* context and must not be the template for the 07B input.
6. **Legacy families**: `app/api/_backend/src/**` agents and prompts, `app/api/book-studio/**`
   (a markdown bridge into `docs/book-studio/drafts`), and the ingest vocabulary in
   `lib/manuscript/types.ts:199-201` ("Editorial annotations": `keyTeachings`,
   `practicalApplications`). None reads a member's Work under any evidence discipline.

| Thing | Class |
|---|---|
| `runStructured` seam | **EXISTS** — the one provider seam; reuse, and gate what may reach it |
| structure read route body fetch + `boundedFetcher` | **DO NOT REUSE** for development |
| `LiveDraftState` / `LiveWork` / `loadLiveWork` as reader input | **DO NOT REUSE** — supersession loaders only |
| `AskContext` typing (`unknown` evidence/coverage) | **DO NOT REUSE** as a template |
| `_backend` agents · `book-studio` routes · `types.ts` editorial annotations | **LEGACY** · **DO NOT REUSE** |

### Q7 · Does any existing developmental / editorial path already mix evidence, observation and interpretation?

**No manuscript path mixes them; one keeps them apart in a way DECIDE has since ruled against for
development.**

- The structure family types them apart: `evidence.ts` observes only ("no divisions, no names, no
  hierarchy and no confidence", `:1-19`); `interpret.ts` interprets; the join is by observation id
  (`:79-80`); `coverage` and `unaccountedSectionIds` are host-derived facts never accepted from the
  reader (`:170-173`, `:476-478`); `editorialLabel` is separated from `title` so commentary cannot
  become manuscript text (`:46-73`); the member's copy is a fourth type, `ReviewedStructure`
  (`proposalStore.ts:48-57`).
- **But** `EditorialSynthesis.questionsForAuthor` (`interpret.ts:127-159`) is a *reading-level*
  question list. DECIDE INV-13a rules that developmental questions attach to an **observation**
  and inherit its refs and address, and that a reading-level `questions[]` is "a DERIVED
  presentation, never a second authoritative copy". The structure family's shape is therefore
  **DO NOT REUSE** for 07B/07C, not because it is wrong for structure but because it is the exact
  divergence DECIDE forbids for development.
- `ProposedUnitDraft.rationale` and `Common.account` are free interpretive prose beside the
  refs; `assertNoProse` (`proposalStore.ts:73-92`) says plainly it cannot see a quoted sentence
  inside them. A developmental reader result with a free-text field has the same gap; 07A's quote
  policy (`evidenceRef.ts:20-25`) answers it for refs, not for prose fields.
- The Ask runtime mixes nothing: it answers about a frozen reading and cannot act
  (`askReader.ts:1-19`).
- No `DevelopmentalReading`, observation, lens or phenomenon symbol exists in code
  (`grep` over `lib app scripts`, non-test: zero hits); the 07A gate asserts the substrate defines
  none (`evidenceCannotAct.test.ts`, last case).

| Thing | Class |
|---|---|
| evidence ≠ interpretation typing, host-derived coverage, commentary ≠ title | **PATTERN** |
| `EditorialSynthesis` / reading-level `questionsForAuthor` | **DO NOT REUSE** (INV-13a) |
| `ProposedUncertainty` enum (`interpret.ts:33-39`) | **PARTIAL** — structure-specific values; DECIDE's `uncertainty` is per observation and open |
| lens / phenomenon vocabulary | **MISSING** in code — documented only (UNDERSTAND §4; CAPABILITY "The lenses") |

### Q8 · Can the reader return something below a `DevelopmentalReading`?

The existing family already does exactly this split, and it is the strongest PATTERN in the
census:

```text
reader returns    ReaderOutput = { status:'interpreted', reading } | { status:'read-request', sectionIds, why }
                                                      interpret.ts:223-226
host turns it into InterpretResult — validates refs, derives coverage + hash, or REFUSES with a
                  refusedReading "for inspection — never for storage"   interpret.ts:251-271
store freezes     identity, provenance.frozenAt, immutability trigger   proposalStore.ts:6-15, :176-192
```

Mapped onto Stage 7: the **reader result** (07B) is the analogue of `ReaderOutput` — unstored,
unidentified, unfrozen; the **reading** (07C) is the analogue of `InterpretResult` + store. The
differences that make it a new contract rather than a reuse:

- refs are `EvidenceRef` values proven by `bindEvidence`, not observation-id strings;
- the read-request variant, if kept, must be expressed in frozen-state terms (section ids the
  reading has at position depth but not body depth — `unreadSpan`, `bind.ts:171`), and any
  expansion is a **new capture**, never a widening of the frozen one (INV-19; UNDERSTAND §2.1);
- `none` is a complete result with full coverage, distinct from refusal (INV-23, INV-24);
- the result carries **no** `interpretation`, `possibilities`, `severity`, `id` (INV-14, INV-15).

| Thing | Class |
|---|---|
| reader-output ≠ reading ≠ stored split | **PATTERN** |
| `ReaderOutput` / `InterpretResult` types themselves | **DO NOT REUSE** — structure-shaped (`units`, `form`) |
| a developmental reader result type | **MISSING** — the 07B contract |

### Q9 · What failures must produce typed refusal / non-conclusion rather than best-effort inference?

Collected from what canonical already types, so the 07B falsifiers can name them:

```text
CAPTURE      FreezeRefusal (readState.ts:168-177) · not_found · not_addressable · no_revision
             (capture.ts:48-55) — a reading with no exactly-matching revision does not begin
RECOVER      revision_content_required · revision_integrity_failure · section_integrity_failure ·
             section_not_in_read_state · range_outside_section · structure_not_frozen ·
             unit_not_in_structure_context (resolve.ts:55-65) — prose that does not digest to
             what was frozen is never rendered
BIND         no_evidence · malformed_ref · unknown_section · body_not_read ·
             range_outside_section · run_not_as_read · structure_not_supplied ·
             unknown_structure_unit (bind.ts:58-73) — one unprovable ref refuses the result;
             precedence fixed (:82-86); never trimmed to the refs that do bind
SCOPE        over-scope refuses whole, never trims (interpret.ts:332-357 pattern); a ceiling for
             development must exist to be refused against (MISSING — Q4)
SEAM         structured_inference_unavailable · provider_unavailable · invalid_inference_mode ·
             not_configured (types.ts:100-117) — sovereign / local_only REFUSE, never reach past
             the mode (router.ts:14-20); malformed tool output stays detectable (types.ts:83-89)
MODEL OUTPUT malformed → throw, never degrade to 'none' (maiaReader.ts:32-47, :674-681);
             foreign fields refused (:636-642) — the same rule for a developmental tool contract
STRUCTURE    no structure supplied → structural claims ABSENT, not degraded (INV-16a);
             structure requested for a Work with no authored structure → absent (UNDERSTAND §3)
STALENESS    current · superseded{moved} · unmeasured (resolve.ts:193-196) — never two-state,
             never re-anchored (INV-19, INV-20); unmeasured is a state, not an error
NONE         'none' is complete, carries full coverage and provenance (INV-23, INV-24) — it is
             not a refusal and a refusal is not a 'none'
NON-CONCLUSION what the reading cannot establish from its coverage must be declarable — the
             doesNotEstablish non-empty tuple (evidence.ts:46) is the PATTERN; its values for
             development (e.g. continuity without chronology) are MISSING
```

### Q10 · What is genuinely missing versus merely disconnected?

```text
DISCONNECTED — exists on canonical, joined to nothing
  lib/manuscript/development/*            zero non-test callers except scripts/ws2-07a-evidence-witness.ts
  recoverEvidence → Recovered             never rendered anywhere
  FrozenStructureContext                  never rendered anywhere
  bindEvidence                            no reader output to prove
  runStructured                           reachable; unused for development
  ReaderIdentity / promptContractHash     pattern present; no developmental constant
  ReadScopeReport / refuse-whole          pattern present; no developmental ceiling
  (the disconnection is deliberate — evidenceCannotAct.test.ts forbids development/ from
   importing maiaReader, askReader, lib/ai — and the 07B contract must state which direction
   the one new import runs and gate the reverse)

MISSING — looked for, not found
  developmental reader INPUT type          from DevelopmentalEvidence + Recovered[] + FrozenStructureContext
  renderer                                 Recovered / FrozenStructureContext → request text with addresses
  developmental reader RESULT type         below DevelopmentalReading (§0)
  tool contract + DEVELOPMENTAL-READER-01  prompt, tools, version constant, hash
  host loop                                capture → recover → read → bind (the 07B/07C seam)
  developmental scope + ceiling            division / whole-Work, ruled and typed
  non-conclusion vocabulary                for development
  chronology across the Work               Continuity lens dependency (FIND row stands)
  lens / phenomenon in code                documented only
  the reverse module-graph gate            reader module may take prose only from development/resolve
```

---

## 2 · Census summary

| Class | Rows |
|---|---|
| **EXISTS** | `DevelopmentalEvidence` · `recoverEvidence`/`Recovered` · `FrozenStructureContext` · `bindEvidence`/`BoundEvidence` · `locateCurrent` three-state · `fingerprintStructureRows` · `runStructured` seam + `StructuredResult.provenance` · `ReaderProvenance`/`ReaderIdentity` · caller-pinned model |
| **PATTERN** (shape yes, substrate no) | host loop `evidence → reader → validate → coverage → store` · `ReaderOutput` ≠ `InterpretResult` ≠ stored · `promptContractHash` discipline · refuse-whole/never-trim + `ReadScopeReport` · `doesNotEstablish` non-empty tuple · evidence ≠ interpretation typing · host-derived coverage · commentary ≠ title |
| **PARTIAL** | `ReaderInput` (wrong vocabulary, live bodies, no state, no structure) · `HeadedSection` topology (07A topology carries no headings) · `ProposedUncertainty` |
| **MISSING** | reader input type · renderer · reader result type · tool contract + version + hash · host loop · developmental scope/ceiling · non-conclusion vocabulary · chronology · lens/phenomenon in code · reverse module-graph gate |
| **LEGACY** | `structure/detect.ts` (FIND row stands) · `app/api/_backend/src/**` agents and prompts · `app/api/book-studio/**` · `lib/manuscript/types.ts:199-201` editorial annotations |
| **DUPLICATE** | none found — structure reader and Ask runtime are parallel by design (FIND row stands); 07A and the structure family share no code and should not |
| **DO NOT REUSE** | `evidenceRefs: string[]` observation-id convention · `bodies: Map<string,string>` prose channel · structure read route body fetch + `boundedFetcher` · `LiveDraftState`/`LiveWork`/`loadLiveWork` as reader input · `readStructureRows` at reader time · proposal/reviewed structure as the reference · `ReadScope` ceilings by inertia · `EditorialSynthesis` reading-level questions (INV-13a) · `AskContext` `unknown` typing · `ReaderOutput`/`InterpretResult` shapes · every LEGACY row |

---

## 3 · For adjudication — what the 07B contract must rule before BUILD

Recorded as questions the census cannot answer from the tree. Each is a founder / Jarvis ruling.

```text
A1  MAY READ vs MAY NOTICE   Does the 07B reader return observation TEXT (drafts that 07C binds,
                             classifies and freezes), or only bindable references + typed
                             non-conclusions? The founder's flow ("What may MAIA faithfully
                             read?") reads as the second; DECIDE INV-13 makes observation the
                             required base of a reading, which reads as the first belonging to
                             the reader that actually read. Census recommendation: drafts —
                             observation text + NonEmptyArray<EvidenceRef> + optional uncertainty,
                             NO lens / phenomenon / interpretation / possibilities / id — because
                             a reader that returns only refs has read nothing MAIA can be held to.
A2  LENS                     Commissioning input to 07B (the purpose a reading is commissioned
                             for, INV-18) or 07C classification (INV-12 places phenomenon with
                             the observation)? Census reads lens as INPUT, phenomenon as 07C.
A3  BODIES + CEILING         Whether development may read bodies, and under what ceiling
                             (UNDERSTAND §2 open list). 07A can express any scope; none is ruled.
A4  READ-REQUEST             Whether the reader may ask for more (a NEW capture, INV-19) or the
                             commissioned scope is final.
A5  HEADINGS                 Whether the reader receives section headings; 07A's frozen topology
                             carries ids only.
A6  GATE DIRECTION           The one permitted import: a reader module → development/resolve for
                             prose, and nothing else that yields prose; the reverse (development/
                             → reader) stays forbidden by evidenceCannotAct.test.ts.
A7  NON-CONCLUSIONS          The developmental doesNotEstablish vocabulary (Q9).
```

Falsifiers for 07B should be derivable from Q9 and A1–A7 once ruled; this census does not
write them.

---

## 4 · What this census does not do

```text
no model call · no prompt · no tool contract · no type · no TypeScript file
no DevelopmentalReading · no observation · no lens · no phenomenon
no route · no surface · no schema · no persistence · no manuscript read by a model
no ceiling ruled · no contract ruled · no falsifier written
no closure of BUILD-07B · no authorization of BUILD-07B BUILD · no opening of BUILD-07C
no repair of anything found · no re-census of FIND's rows
```
