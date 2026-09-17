# JARVIS-GOVERNED-KNOWLEDGE-FLOW-01 — J8-R1 SELECTIVE retrieval build evidence

> **Class:** A candidate evidence — no grant, merge, deploy, or J8 PASS is created here
> **Governing authority:** `docs/canon/REPRESENTATION_AUTHORITY_LAW.md` · current founder rulings · canonical JARVIS manual · J6 authority boundary
> **Current gate:** bounded candidate evidence → founder SELECTIVE grant docket
> **Evidence subject:** isolated J8-R1 candidate over canonical `9c72c9c5a08e087a2b9900069cf629ad915c95e7`
> **Stop boundary:** `PENDING_FOUNDER_GRANT`; no merge/deploy/J8 PASS by test or CI inference

**Date:** 2026-09-17
**Standing:** **candidate build evidence PASS; SELECTIVE authority NOT GRANTED; J8 remains STOP.**

## 1 · Why the earlier green candidate was reopened

The first J8-R1 repair wired exact-source retrieval into canonical `/maia/list`, kept Sanctuary upstream, separated retrieval from Knowledge Gate weighting, prevented client-meta override, and preserved one raw evidence participation across FAST / CORE / DEEP.

That candidate reached green local/CI states on earlier heads, but was never merged or deployed because canonical moved repeatedly.

More importantly, a later read-only production falsifier showed its `0.55` nearest-chunk rule was insufficient:

```text
known EA awareness query       max EA similarity ~0.693
TCM Fire / organ query         max EA similarity ~0.706  ← false positive
Feng Shui five elements        max EA similarity ~0.723  ← false positive
Ayurveda / dosha query         max EA similarity ~0.582  ← false positive
software SQL                   max EA similarity ~0.543
weather                        max EA similarity ~0.529
```

Therefore an authorized source could be semantically close yet still be the wrong interpretive frame for the question. The green predecessor was rejected before merge. Green did not become authority.

## 2 · Applicability quarantine / single-writer recovery

A concurrent actor had previously introduced an applicability idea into shared worktree commit `12beaf9b681682d6d4ef742fd97ed245e493f1bd` before that mechanism had been reviewed inside the Class A repair. It was correctly quarantined rather than accepted through concurrency.

After the independent false-positive probe established the underlying problem, applicability was deliberately reopened on isolated worktree:

```text
/Users/soullab/MAIA-J8-R1-APPLICABILITY-20260917
```

Branch:

```text
feature/jarvis-gkf-j8-r1-applicability-20260917
```

No acceptance evidence in this record comes from the shared dirty worktree.

## 3 · Canonical freshness chronology

This lane has stopped and rebased rather than inheriting green evidence across candidate identities:

1. `83fce8ed…` → `2e82ca9f…` — JARVIS manual designation.
2. `2e82ca9f…` → `69b7c7fb…` — five-field lane preamble became canonical.
3. `69b7c7fb…` → `51d4060d…` — Representation Authority Law / J9–J11 documentary custody became canonical; zero mechanical overlap, material semantic impact.
4. `51d4060d…` → `9c72c9c5…` — Living Field scope containment + J11 canonicalization closure; zero J8 file overlap. J11 explicitly leaves retrieval implementation to its own governed lane.

The candidate was rebased onto `9c72c9c5…` before the current authority design and evidence pass.

## 4 · Canonical Representation Authority reconciliation

Canonical law now requires two things before a representation may determine selection membership:

1. an explicit governed grant;
2. an attestation that can fail when the authority-bearing condition becomes stale, absent, substituted, or invalid.

The J8 repair therefore distinguishes:

```text
AUTHORITATIVE standing
J6 source authority
        ↓
ATTESTED substrate
J7 row text + embedding set + model artifact
        ↓
SELECTIVE authority
exact founder-granted J8 contract
        ↓
selection representations
applicability + chunk similarity
        ↓
current-turn retrieved-evidence membership
```

Similarity, embeddings, classification, salience, and table membership are never treated as upstream authority.

## 5 · Exact candidate SELECTIVE contract

```text
contract id      J8-R1-EA-SELECTIVE-v1
contract SHA256  cb616d711e62b40f8042065c3d8a072c25f5ee6da1050c376e0246a4d1e39928
authority class  SELECTIVE
effect scope     current_turn_retrieved_evidence_membership
```

Digest-bound contract material includes:

```text
source SHA256           f57f17e6ab82f911a4932c1f2d5fa0149e8fe499c7461f60bd87f86d0f657af0
vector model            nomic-embed-text
vector model digest     0a109f422b47e3a30ba2b10eca18548e944e8a23073ee3f3e947efcf3c45e59f
vector dimensions       768
positive similarity     >= 0.50
positive-confusable gap >= 0.05
chunk similarity        >= 0.55
max chunks              3
ranking                  cosine
require embedding        true
domain/categories        not selection filters
chunk count              1238
chunk-set SHA256         87b0cbaa076cdb6d374597b75fb652ac87313b1eda1ad87fce4a8490cf61d852
embedding-set SHA256     4ec0eb4d2fdc6e56fccd14927fcb9e4cf5df51ade15cd75ce25c3966ce2bee93
```

`governedSelectionContractDigest()` recomputes the contract; substitution of an authority-bearing predicate turns the contract attestation red.

## 6 · Founder grant remains absent by construction

Runtime grant record:

```text
status             PENDING_FOUNDER_GRANT
contract id        J8-R1-EA-SELECTIVE-v1
contract SHA256    cb616d711e62b40f8042065c3d8a072c25f5ee6da1050c376e0246a4d1e39928
founder ruling ref null
```

The service consumes and validates the grant **before member-query embedding**. A missing/pending/invalid grant therefore prevents applicability computation, corpus attestation, chunk ranking, and prompt injection.

A simulated exact grant is used only inside unit tests to falsify downstream behavior. No simulated grant exists in production code.

## 7 · Runtime J6 authority consumption

The candidate consumes `getGlobalLibraryAuthorityKeys()` directly at runtime before any SELECTIVE representation is computed.

The registry source participates only when both match:

```text
admission-derived filePath == governed sourcePath
admission-derived checksum == governed sourceSha256
```

No authority key, wrong path, or wrong checksum returns no governed evidence before embedding.

This replaces the earlier weaker design in which a static registry plus build-time equivalence could have been mistaken for runtime authority consumption.

## 8 · Source applicability calibration

Candidate applicability contract:

- two positive descriptors for Kelly Nezat's EA psychospiritual/self-knowledge frame;
- three confusable descriptors for TCM/Feng Shui, Ayurveda, and chemical elements;
- positive floor `0.50`;
- positive-over-nearest-confusable margin `0.05`.

Read-only production calibration against the current local model:

```text
INTENDED EA / SELF-DEVELOPMENT
Fire vision / imagination       PASS  margin +0.152
Water emotion / meaning         PASS  margin +0.195
Earth grounding / embodiment    PASS  margin +0.096
Air thinking / communication    PASS  margin +0.150
Aether / whole-self field       PASS  margin +0.102
elemental self-integration      PASS  margin +0.157
Jungian shadow / inner life     PASS  margin +0.173

CONFUSABLE / WRONG SYSTEM
astrology elements              REFUSE margin -0.107
ancient Greek elements          REFUSE margin -0.048
Wiccan correspondences          REFUSE margin -0.073
tarot elemental suits           REFUSE margin -0.074
fantasy elemental magic         REFUSE margin -0.074
TCM five phases                 REFUSE margin -0.143
Ayurveda / pitta                REFUSE margin -0.246
chemistry / periodic table      REFUSE margin -0.318
```

Result: **7 / 7 intended controls eligible; 8 / 8 adjacent wrong-system controls refused.** This is bounded calibration evidence, not universal classification accuracy and not authority.

Observed first-use local-model cost on production host:

```text
member query vector       44 ms
descriptor vectors        144 ms in parallel
total cold applicability  188 ms
```

Descriptor vectors are process-cached after first successful construction. Timing is an observed host reading, not a guarantee.

## 9 · Exact local model attestation

Production Ollama reports:

```text
name    nomic-embed-text:latest
digest  0a109f422b47e3a30ba2b10eca18548e944e8a23073ee3f3e947efcf3c45e59f
```

`GovernedEmbeddingModelAttestation` reads `/api/tags` on every governed-relevant turn after grant validation and before query embedding. Same model name with different weights is refused.

The governed embedding call explicitly requests `nomic-embed-text` through the existing fail-fast sovereign local embedding seam.

## 10 · Exact stored corpus + vector attestation

Production already has `pgcrypto`. A read-only server-side attestation reconstructs both the J7 text identity and the exact stored vector identity before chunk ranking.

Observed production result:

```text
rows                 1238
embedded             1238
index range           0–1237
vector dimensions     768–768
chunk-set SHA256      87b0cbaa076cdb6d374597b75fb652ac87313b1eda1ad87fce4a8490cf61d852
embedding-set SHA256  4ec0eb4d2fdc6e56fccd14927fcb9e4cf5df51ade15cd75ce25c3966ce2bee93
```

The SQL is parameterized on the exact source filename and hashes ordered per-row text/vector representations. Row count, source count, embedding count, index range, dimensions, text digest, and embedding digest must all match.

Observed end-to-end SSH/container/SQL probe time was roughly 0.1s. The application call avoids this work on inapplicable turns.

Any row or vector substitution, deletion, dimension drift, or missing embedding makes the attestation red before SELECTIVE ranking.

## 11 · Query-vector reuse and fixed caller policy

The member query is embedded once. The same validated vector is used for:

1. applicability;
2. exact-source chunk ranking.

`RetrievalService` now accepts an optional precomputed query vector and refuses empty/zero/non-finite vectors before DB access.

The canonical `/maia/list` caller no longer owns `.55` or `3`; those fields live only in the digest-attested SELECTIVE contract. Caller code therefore cannot silently widen the selection effect without changing the contract digest.

## 12 · One-participation DEEP geometry

The reconciled candidate prevents internal fan-out from multiplying one retrieved source's influence:

- FAST: one prompt seam;
- CORE: one typed addendum;
- DEEP recursive/meta: one orchestrator knowledge stream; direct fallback only if native orchestration yields no result;
- DEEP temporal: parallel readers remain source-blind; source enters once at synthesis;
- optional DEEP consultation: raw source only when the local DEEP stage did not consume it.

Static falsifiers require this geometry.

## 13 · Full targeted acceptance population

Exact current candidate test population:

- GovernedRetrievalService
- GovernedSelectionContract
- GovernedSelectionGrant
- GovernedEmbeddingModelAttestation
- GovernedCorpusAttestation
- RetrievalService source allowlist/precomputed vector
- canonical route/tier wiring
- governed registry / J6 authority equivalence
- canonical-turn producer participation
- global Library authority
- J7 EA ingest contract / transaction
- corpus admission

Result:

```text
13 suites PASS
94 / 94 tests PASS
0 failed
```

Important falsifiers include:

- no/mismatched J6 authority → no representation computation;
- pending founder grant → no member-query embedding;
- SELECTIVE contract predicate substitution → red digest;
- same model name / altered model digest → red;
- applicability failure → no corpus attestation/chunk query;
- corpus row/text/vector substitution → red;
- route threshold/count override absent;
- empty source allowlist → no DB;
- invalid precomputed query vector → no DB;
- foreign lower-layer row → refused;
- Sanctuary precedes retrieval;
- client meta cannot override governed context;
- DEEP raw evidence not multiplied.

## 14 · TypeScript / repository standing

Exact current candidate local result:

```text
ship TypeScript       229 diagnostics
baseline              239
regressions             0

scripts diagnostics    40 existing
J8-related scripts      0
```

`git diff --check`: PASS.

No new external provider surface was added. No SQL mutation was added. No user-linked retrieval analytics are invoked by governed retrieval.

## 15 · Production pre-state / non-mutation

Latest read-only production state carried into this lane:

```text
maia-sovereign runtime   97c7d9463
health                   healthy
ain_knowledge_chunks     1,238 rows / 1 source / 1,238 embedded
library_sources          2,228 rows / 1,752 completed
```

This repair lane has made **no production write**.

## 16 · Build adjudication

**J8-R1 dormant candidate: PASS for bounded local build/falsification evidence.**

This establishes only that the candidate is coherent enough to present to the founder for the explicit SELECTIVE grant required by canonical law.

It does **not** establish:

- SELECTIVE authority granted;
- merge authorized;
- deploy authorized;
- J8 PASS;
- normal member turns using EA in production.

## 17 · Next exact act

Founder decision docket:

`docs/programme/JARVIS-GOVERNED-KNOWLEDGE-FLOW-01_J8_R1_SELECTIVE_GRANT_DOCKET_2026-09-17.md`

Until that docket receives an explicit founder act, `GovernedSelectionGrant.ts` remains `PENDING_FOUNDER_GRANT` and the candidate is runtime-dormant.

If the founder grants the exact contract, the next bounded implementation act may change only the grant status/ruling reference needed to activate **that same digest-bound contract**, then rerun exact-head Class A evidence. Merge and deploy remain separate founder gates.
