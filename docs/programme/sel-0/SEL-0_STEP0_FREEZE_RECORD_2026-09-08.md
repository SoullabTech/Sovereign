# SEL-0 · STEP 0 — production discovery + manifest freeze · RECORD

**Act**: SEL-0 Step 0 only. Production read-only. Repository writes limited to freezing the
manifests and recording their digests, per the founder write-boundary ruling recorded in
`JARVIS-WS2-DEVELOPMENTAL-INTELLIGENCE-CONTINUATION.md`.

**Branch** `jarvis/ws2-sel0-production-discovery-2026-09-08` · opened from tip `3167138e4`.
**Governing instrument** `WS2-DEVELOPMENTAL_INTELLIGENCE_AUDIT_2026-09-08.md` §4.
**Mission** `WS2-SEL-0_PRODUCTION_DISCOVERY_MISSION_2026-09-08.md`.

---

## 0 · C0 cleared

The parent flow recorded `C0 BLOCKED — production access unavailable in this environment`.
That block was environmental and it is cleared here: this session runs on the Mac Studio and
reaches production over `ssh soullab@minisforum` (`hostname -I` → `192.168.0.104`).
Nothing else about the block changed.

```text
production host        minisforum · 192.168.0.104
database               maia_consciousness  (container maia-postgres)
runtime                maia-sovereign · GIT_COMMIT 3afa51b9f · DEPLOY_LANE deploy-lane
container created      2026-09-08T17:28:33Z
access used            read-only SELECT only; no INSERT/UPDATE/DELETE/DDL issued
```

---

## 1 · The owning production store — derived, then proved

The candidate space was derived from production, not from the conversation: every table in
`maia_consciousness` whose name matches
`develop|observ|notic|encounter|reading|selection|insight|finding` (33 tables), then narrowed on
structure and on writer/reader code paths.

**Owning store**

```text
table      developmental_readings
column     observations   jsonb array, NOT NULL, CHECK jsonb_typeof = 'array'
migration  20260904000001_developmental_readings.sql
           20260904000002_developmental_reading_contract_v2.sql
sole writer  lib/manuscript/developmentalReading/store.ts  freezeAndStore()
             one INSERT, one row, one table; row immutability enforced by a
             BEFORE UPDATE trigger in the migration
readers      lib/manuscript/ask/frozenDevelopmentalReading.ts   (SELECT only, by construction)
             lib/manuscript/developmentalReading/store.ts       (loadReading / list)
             lib/manuscript/standing/store.ts                   (address existence only)
```

**What constitutes an observation** — `DevelopmentalObservation`,
`lib/manuscript/developmentalReading/contract.ts:135`:

```text
key                  reading-internal, stable      o1 … oN
lens                 the commissioned editorial question, copied never inferred
phenomenon?          OPTIONAL under contract v2; omission is the only "no taxonomy claim"
evidenceRefs         NonEmptyArray<EvidenceRef>, re-bound before the freeze
observation          the reader's claim text, VERBATIM — 07C does not rewrite
doesNotEstablish     NonEmptyArray<DevelopmentalNonConclusion>
structureDependency  { kind: 'independent' } | { kind: 'authored-structure' }
```

### 1.1 · Rejected candidates, on structure — not on name

```text
voice:memory_selection      NOT A STORE. A log-marker string literal at
                            app/api/voice/stream-conversation/route.ts:1298. No table,
                            no view, no runtime object. Named in the mission as the
                            tempting near-match; disqualified by inspection, not by fiat.

developmental_memories      2024 rows. Member conversational memory: user_id, memory_type,
                            spiral_cycle, facet_code, vector_embedding, valid_from/valid_to.
                            No manuscript binding, no lens, no evidence refs, no
                            doesNotEstablish. A different domain that shares an adjective.

observations                1 row. The encounter witness primitive: witnessed_by,
                            witness_text, horizon, surface, signal_id. Practitioner
                            encounter domain, not manuscript reading.

developmental_findings      0 rows. No migration in this repository and no code writer.
developmental_review*       0 rows.
developmental_missions      0 rows.
encounter_interpretations   0 rows.
```

### 1.2 · The historical 226 has no production store — stated as a structural fact

`lib/manuscript/encounter/` contains **no INSERT, UPDATE or DELETE**. Its only SQL is a read of
`manuscript_working_drafts` (`read.ts:96`). The G8 fourth-witness notices were therefore
transient run output, never persisted state.

Further, `developmentalReader/`, `developmentalReading/` and `ask/` import **nothing** from
`lib/manuscript/encounter/` — the two lanes are code-disjoint.

⛔ `226` is not the corpus, was not used as identity, and did not participate in the derivation.

---

## 2 · The frozen source state

One row. Read-only, at the digest below.

```text
reading id          e8cd07c7-1b33-4c7d-a020-3bc2db9d6553
manuscript_id       55742458-be2c-406a-a158-d0438cf02892
draft / revision    cef52911-dcc5-448a-b844-734aa026266d · r5
commissioned_lens   development          withStructure: false
outcome             reading
frozen_at           2026-09-08T12:07:18.442295Z
input_fingerprint   bb1c3ca4b6167175ec7fb668f88643afe60c080a8172372ad46f2613f626d555
bodyScope           253 sections
observations        26           keys o1 … o26
reader              DEVELOPMENTAL-READER-05      claude-opus-5
                    promptHash 5c0ab1683726c9dec78f56cc19412dd3a6cd600d4254f1f545b977c86a0b21a1
classifier          DEVELOPMENTAL-PHENOMENON-04  claude-opus-5
                    promptHash 1116c66c0dd7c4c07925691a136339ea318c8e67842fcdddbee9e641c99daf3e
```

### 2.1 · Finding, recorded not repaired — the reading contract version is not persisted

`freeze.ts:108,157` sets `provenance.readingContractVersion = READING_CONTRACT_VERSION`
(`DEVELOPMENTAL-READING-CONTRACT-02`). `store.ts` writes only `provenance.reader` and
`provenance.classifier` into their two columns; the contract version reaches no column and is
dropped at the INSERT. `frozenDevelopmentalReading.ts:51` records the same fact from the read
side — *"`readingContractVersion` is NOT selected because it is not a column."*

Consequence: the contract says v1 is *identified by the absence of this field*, so a v2 reading
is indistinguishable from a v1 reading in persisted state. This row is materially **v2** —
`o24` carries no `phenomenon`, which only v2 admits — while its record cannot say so.

⛔ Not repaired here. Not in this mandate. Recorded so it is not rediscovered as a fresh finding.

---

## 3 · F-7 eligibility, applied

Adjudicated in an **isolated agent** whose transcript does not enter the founder-facing session.
Its return contract was `key · verdict · rule clause` with an explicit bar on quoting,
paraphrasing or characterising any observation content. This is how the mission's two true-but-
opposed requirements were both honoured: proving and filtering the corpus requires inspecting
its content; showing that content to the founder breaks the blind.

Rule applied, ratified canon, not re-derived —
`WS2-ENCOUNTER-01_E1_NOTICING_VOCABULARY_2026-09-08.md` §3.2:

```text
absence measured against an EXPECTED STANDARD        → forbidden
non-return of something the WORK ITSELF ESTABLISHED  → potentially lawful (bounded)
```

```text
26   observations in the frozen production reading
 7   INELIGIBLE_F7      o1 o2 o14 o16 o18 o20 o23
19   ELIGIBLE                                          → N = 19
```

Per-ID reasons are frozen in `SEL-0_EXCLUDED_SET.json`, separately from Manifest A, so
eligibility cannot later be quietly relaxed to improve a score.

⚠️ **Applicability note.** F-7 is recorded as a defect of the Encounter lane, and this corpus is
produced by the code-disjoint developmental-reader lane. The eligibility rule was nevertheless
applied on its substance — E1 §3.2 governs absence-shaped developmental claims wherever they
are uttered, and the mission's step 4 directs the discovering session to apply it rather than
inherit a prior adjudication. **This is the first F-7 adjudication of this corpus; no prior one
exists.** If the founder holds that F-7 exclusion may only carry forward an already-recorded
adjudication, then the excluded set is empty and N = 26 — which does not change the gate below.

---

## 4 · The three frozen manifests + the excluded set

All four are bound to one candidate-set identity:
**same lawful IDs · same N · same candidate-set digest · different representations by design.**

```text
candidate_set_identity_digest   sha256 ab10d17ee4b0ba61fff3f5cebd5c6f9fbfb830d49a3e1062424a00e0ae5507a9
observation_id form             <reading_id>:<key>
```

| file | sha256 | bytes |
|---|---|---|
| `SEL-0_SOURCE_SNAPSHOT.json` | `2f45070104c2d598b1bc4b43168cff5ddaae4571d96fa24bce867ebac9cb7272` | 118430 |
| `SEL-0_MANIFEST_A_SOURCE.json` | `d1870867c6bf075bbaae9c510d9a726f09215c0c43110fca531ac7fa75cfa84d` | 37098 |
| `SEL-0_EXCLUDED_SET.json` | `1c19e9b579c3acb158cd5988f3f267ee2faf91663a0ed9a095b62605cac6bbc8` | 2035 |
| `SEL-0_MANIFEST_B_BLIND.json` | `a5564f058890963f370fe17ab8960a7325697c9fb3e40283058f8fc07fb1e843` | 16872 |
| `SEL-0_MANIFEST_C_NATIVE.json` | `7cd7685ef09abe5697e0eaa6eef2c062d80193b029d5040b4151496a2dca7980` | 137377 |

⛔ **`SEL-0_MANIFEST_B_BLIND.json` carries the stimulus. It must not be opened before Step 2.**

### 4.1 · Manifest B — canonical sort is selection-neutral

```text
method   ascending sha256( seed + ':' + observation_id )
seed     SEL-0-BLIND-SORT-2026-09-08          (recorded, reproducible, auditable)
```

Disqualified and not used: production order, score order, recency order, and the reading's own
`o1 … oN` order — the last because reading order is the order the reader met the material and
therefore carries a salience signal shared with any native ranking.

Item content is the verbatim `observation` claim text alone. No phenomenon label, no evidence
refs, no read state, no coverage, no digests in view, no instrumentation. The reader's text is
already plain member-facing prose and is carried unrewritten (07C founder ruling).

### 4.2 · Manifest C — the native surface, and the native-field allowlist

The founder's native-surface ruling was applied on its stated terms — **consumption, not
existence.** The reader path was established empirically rather than assumed:

```text
deployed reader     app/api/sovereign/manuscripts/[id]/ask/route.ts
                      -> lib/manuscript/ask/developmentalContext.ts
deployed selection  lib/manuscript/ask/developmentalAnchor.ts selectObservation()
                    exact-key lookup. "Never a nearest match — there is no such thing."
deployed order      lib/writersStudio/developPresentation.ts:287-289
                    "Observation order is the reading's own (o1 … oN);
                     nothing is sorted, ranked or filtered."
```

**There is no deployed score and no deployed ranking path over developmental observations.**
Consequently no pre-snapshot score enters Manifest C, because none exists to consume.

**Prior-selection signal — named explicitly, and excluded on the consumption test.**
`developmental_observation_standing_events` (member keep/dismiss) is the only candidate. It is
**not consumed**: D5 is a module-graph gate asserting that standing cannot reach MAIA cognition
(`lib/manuscript/standing/__tests__/standingOutsideCognition.test.ts`), and the table holds
**0 rows** in production. It does not enter Manifest C merely because it exists.

Native allowlist, frozen in the manifest: `key · lens · observation · phenomenon (where the
classifier made a claim) · doesNotEstablish · structureDependency · evidenceRefs`, plus the
reading-level `readState · coverage · scope.commissionedLens · scope.withStructure` as the
global ranking context (digested separately).

Excluded from the native surface: the founder's ranking (not created), the threshold (unset),
benchmark annotations (none), any post-snapshot state (none), F-7-ineligible material (the 7).

---

## 5 · N, and the gate it meets

```text
N = 19
```

**`N < 40`. The predeclared floor is met with a STOP.**

Per audit §4, SEL-0 as specified requires `N ≥ 40`. At N=19 the instrument may not be run
against these measures and a weak result may not be read as a finding: under the null, the
proposed `STRONG` criterion fires by chance at roughly the N=20 row of the audit's table
(≈7% for 3/5 in top-5; ≈15% for 4/5 in top-10), and the top-10 containment condition is close
to vacuous when 10 is more than half the corpus.

⛔ This floor was frozen **before** N was known and is not reconsidered now that N is known and
a preferred reading exists. Redesign — rank correlation over the full set rather than top-k
overlap — is a founder question, not an act available to this session.

⚠️ **The gate outcome is invariant to the F-7 adjudication.** Even taking the whole production
reading unfiltered, N would be 26, still below 40. Nothing about the exclusions rescues the run.

---

## 6 · Standing at stop

```text
C0                        CLEARED — production access established
OWNING STORE              PROVEN — developmental_readings.observations
226                       NOT USED · no production store exists for it
voice:memory_selection    DISQUALIFIED — a log marker, not a store
SOURCE STATE              SNAPSHOT FROZEN · read-only
F-7 ELIGIBILITY           APPLIED — 7 excluded, reasons frozen separately
MANIFEST A                FROZEN
MANIFEST B                FROZEN — stimulus sealed, unopened
MANIFEST C                FROZEN — native allowlist named before the freeze
EXCLUDED SET              FROZEN
N                         19
MINIMUM N                 >= 40  — NOT MET
THRESHOLD                 UNSET — step 1 not entered
FOUNDER RANKING           NOT STARTED · founder blind INTACT
MAIA RANKING              NOT STARTED · not computed
F-7 REPAIR                NOT TOUCHED
PHASE 2 AND BEYOND        NOT OPEN
PR / MERGE / DEPLOY       NOT AUTHORIZED · none performed
PRODUCTION WRITES         NONE
```

**Next act is a founder ruling, not a build**: SEL-0 cannot run as specified at N=19. The
choices are the audit's own — redesign the instrument to rank correlation over the full set, or
enlarge the lawful corpus by commissioning further readings and re-running Step 0 against the
larger production state. Neither is authorized here.

---

## 7 · Disposition against the founder's trichotomy

Recorded verbatim as given, with the landing marked:

```text
A  persisted lawful corpus · N >= 40
     -> freeze threshold against N -> continue SEL-0                     NOT MET

B  persisted lawful corpus · N < 40                                      ◀ THIS RUN
     -> top-k instrument prohibited
     -> redesign measurement over the existing corpus

C  no persisted lawful corpus / no native production surface
     -> SEL-0 cannot presently execute -> STOP for a new founder ruling  NOT MET
```

**B, and not C.** C is excluded on evidence, not on preference: a persisted lawful corpus does
exist (`developmental_readings.observations`, 19 lawful survivors, frozen at the digests in §4),
and a native production surface does exist and is deployed (`ask` route → `developmentalContext`,
runtime `3afa51b9f`). What fails is the *measure*, not the corpus and not the surface.

The top-k instrument is therefore **prohibited on this corpus** and was not run. The redesign B
directs — rank correlation over the full set rather than top-5 / top-10 overlap — is the next
act; it is **not** performed here, because Step 0 was the whole of this mandate and a redesigned
measure must be specified and frozen before N-aware eyes go anywhere near the item set. The
founder blind is intact and remains the thing to protect through the redesign: whoever writes the
new measure may know N = 19 and must not know the contents.
