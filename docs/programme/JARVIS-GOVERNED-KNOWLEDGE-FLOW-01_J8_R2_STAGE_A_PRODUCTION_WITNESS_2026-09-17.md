# JARVIS-GOVERNED-KNOWLEDGE-FLOW-01 — J8-R2 Stage A Production Witness

> **Class:** C — documentary evidence capture only  
> **Governing authority:** founder Stage A deployment authorization · J8-R1 SELECTIVE founder grant · J8-R1 sufficiency-order repair · canonical Representation Authority Law  
> **Current gate:** Stage A exact-SHA production witness frozen → re-pin canonical for separately authorized Stage B catch-up  
> **Evidence subject:** exact production runtime `0c95526c1c7b7d8bd8cc443aa88e85c062a510dc`  
> **Stop boundary:** this record authorizes no Stage B deployment, no threshold/descriptor change, no corpus/Library/schema/member-data mutation, and no automatic J8 closure

**Date:** 2026-09-17  
**Witness type:** bounded read-only production witness  
**Verdict:** ✅ **J8-R2 STAGE A READ-ONLY WITNESS PASS**  
**J8 standing:** ⛔ remains open pending founder closure/adjudication; this evidence does not close J8 by itself.

---

## 1 · Stage A deployment custody

Founder authorized deployment of exact immutable SHA:

`0c95526c1c7b7d8bd8cc443aa88e85c062a510dc`

for the clean J8-R2 witness only.

A bounded Relationships runtime (`11a67cec5fc8800ee6989ccf5cbcb068e7d3706f`) completed immediately before Stage A began. It was identified and distinguished from the J8 deployment before J8-R2 started.

The Minisforum deployment lock then named:

```text
entry       pre-deploy-gate.sh deploy-maia
target      0c95526c1c7b7d8bd8cc443aa88e85c062a510dc
target_sha  0c95526c1
```

Stage A completed with:

```text
runtime GIT_COMMIT   0c95526c1
container health     healthy
image tag            maia-sovereign:0c95526c1
image id             sha256:be677c41e5ad6fa24152b6658d93fba515d609ec6f87f7608d8c6a82a9e7e7b8
/api/version commit  0c95526c
environment          production
```

Fresh in-container `/api/version` witness:

```json
{"version":"1.0.0","major":1,"minor":0,"patch":0,"commit":"0c95526c","timestamp":"2026-09-18T03:10:30.579Z","env":"production","buildDate":"unknown"}
```

No later canonical SHA was deployed during this witness.

---

## 2 · Read-only witness design

A fully authenticated `/api/sovereign/app/maia/list` request can persist an accepted member turn before generation. Stage A explicitly prohibited member/corpus/Library/schema production-data mutation.

J8-R2 therefore did **not** manufacture a member or submit an authenticated production turn merely for proof.

The read-only witness combined:

1. exact running production provenance (`/api/version → 0c95526c`);
2. direct execution of the exact deployed governed-retrieval service against production PostgreSQL and production-local Ollama;
3. exact source proof from the same immutable deployed commit that `/maia/list` is the canonical serving seam and calls that service behind Sanctuary;
4. runtime cognition-source / producer-registry proof for FAST / CORE / DEEP participation geometry;
5. production DB invariants proving no retrieval analytics or corpus mutation occurred.

This proves the production serving crossing under the authorized no-write witness contract without creating synthetic member data.

---

## 3 · Upstream authority / attestation chain — PASS

Production runtime returned exactly one J6 global authority key matching the governed Elemental Alchemy source:

```text
authority keys        1
exact authority keys  1
source path            data/ain/source/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md
source SHA-256         f57f17e6ab82f911a4932c1f2d5fa0149e8fe499c7461f60bd87f86d0f657af0
```

SELECTIVE contract:

```text
contract id            J8-R1-EA-SELECTIVE-v1
computed SHA-256       cb616d711e62b40f8042065c3d8a072c25f5ee6da1050c376e0246a4d1e39928
expected SHA-256       cb616d711e62b40f8042065c3d8a072c25f5ee6da1050c376e0246a4d1e39928
grant status           GRANTED
effect scope           current_turn_retrieved_evidence_membership
```

Local embedding model:

```text
model                   nomic-embed-text:latest
model artifact digest   0a109f422b47e3a30ba2b10eca18548e944e8a23073ee3f3e947efcf3c45e59f
dimensions              768
```

Exact J7 production corpus/vector attestation:

```text
rows                     1238
sources                  1
embedded rows            1238
chunk indexes            0..1237
vector dimensions        768
chunk-set SHA-256        87b0cbaa076cdb6d374597b75fb652ac87313b1eda1ad87fce4a8490cf61d852
embedding-set SHA-256    4ec0eb4d2fdc6e56fccd14927fcb9e4cf5df51ade15cd75ce25c3966ce2bee93
```

The repaired runtime order is therefore exercised after:

`J6 authority → exact grant → model attestation → corpus/vector attestation → query embedding → applicability → chunk selection`.

---

## 4 · Production selection controls

All outputs below are metadata only. No chunk text was emitted into the evidence record.

### Positive governed-source controls

```text
EA elemental self-knowledge
hits 3
similarities 0.673839 · 0.657876 · 0.655490
source only elemental-alchemy

historical crystal-of-self-knowledge query
hits 3
similarities 0.693212 · 0.668039 · 0.646392
source only elemental-alchemy

Fire / vision / imagination
hits 3
similarities 0.751087 · 0.731476 · 0.729694
source only elemental-alchemy

Water / emotion / meaning
hits 3
similarities 0.725865 · 0.718556 · 0.716781
source only elemental-alchemy
```

No foreign source appeared in any positive result.

### Confusable / wrong-system controls

```text
Traditional Chinese medicine Fire / organs     0 hits
Feng Shui five elements                        0 hits
Ayurveda / doshas                              0 hits
chemistry / periodic table                     0 hits
```

The principal J8-R1 false-positive failure mode is therefore refused in production.

---

## 5 · Quality note — Jungian-shadow wording

This wording:

> How can Jungian shadow and inner awareness be understood through the elemental facets of the self?

returned `0` governed chunks end-to-end.

Its **source applicability** still passed:

```text
positive similarity     0.8273865091
confusable similarity   0.6114021514
margin                  +0.2159843577
eligible                true
```

A direct chunk-query diagnostic also returned no rows for this query even with a deliberately permissive retrieval floor, while the same direct query shape returned normal rows for the historical positive query. The query embedding itself was structurally valid:

```text
dimensions          768
finite values       768
non-zero values     768
norm                20.7767526491
NaN / Infinity      none
```

**Disposition:** quality / false-negative anomaly; unexplained in this witness. It does not widen authority, admit a foreign source, mutate the contract, or defeat the demonstrated ability to retrieve intended EA material. No threshold, descriptor, or contract change is authorized here.

This should be investigated separately if broad Jungian-language recall is product-critical.

---

## 6 · Canonical `/maia/list` crossing — PASS under read-only witness contract

Exact source from deployed commit `0c95526c…` proves:

```text
route calls retrieveGovernedKnowledge(message)                true
retrieval guarded by AIN flag + !isSanctuary                 true
Sanctuary guard occurs before retrieval call                 true
governed context server-binds after client ...meta           true
route owns minSimilarity=0.55                                false
route owns maxChunks=3                                       false
```

Therefore the canonical member-serving route consumes the governed service while leaving SELECTIVE policy in the attested contract.

No authenticated HTTP member request was submitted because doing so could persist an accepted member turn and would violate the bounded read-only witness authorization.

---

## 7 · Sanctuary / producer standing — PASS

Runtime producer registry:

```text
producer                 retrieved.governed_knowledge
participation class      retrieved
authority                situate
requires.notSanctuary    true
room                     sovereign_chat
```

The exact deployed route also guards retrieval with `!isSanctuary` before the retrieval call.

Sanctuary therefore refuses the governed source crossing before SELECTIVE retrieval is exercised.

---

## 8 · FAST / CORE / DEEP one-participation geometry — PASS

Runtime cognition-source checks on the deployed image established:

```text
FAST carries governed block                         PASS
CORE carries governedKnowledgeAddendum              PASS
DEEP orchestrator receives one governed stream      PASS
observer parallel reader gets no raw duplicate      PASS
temporal layer readers get no raw duplicate         PASS
meta reader gets no raw duplicate                   PASS
temporal synthesis receives the raw block           PASS
optional consultation guards against second copy    PASS
```

This preserves one governed source participation per native stage rather than multiplying source weight through DEEP fan-out.

---

## 9 · Provenance-bearing prompt block — PASS

The historical positive query produced `3` governed hits. The rendered governed block was bounded to `6000` characters and established:

```text
block present                                   true
Elemental Alchemy — Kelly Nezat                present
exact source revision SHA                      present
authority: rights_holder_authorized            present
"not member memory" boundary                   present
bounded rendering                              PASS
```

Two excerpt markers fit inside the 6000-character cap; the third hit was not expanded beyond the cap. This is expected bounded rendering, not loss of source identity.

---

## 10 · Read-only / production-state invariants — PASS

The governed retrieval service and its model/corpus attestation modules contain no SQL mutation statements.

The lower `RetrievalService` writes `ain_knowledge_retrievals` only when a `userId` is supplied. The governed service supplies no `userId`.

Post-witness production state:

```text
ain_knowledge_chunks         1238 rows
AIN sources                  1
AIN embedded                 1238
library_sources              2228 rows
ain_knowledge_retrievals     0 rows total
retrieval rows recent 30m    0
```

No corpus, Library, schema, member-turn, or retrieval-analytics mutation was performed by the J8-R2 probe.

---

## 11 · Stage A verdict

```text
exact Stage A deployment provenance      PASS
production health                         PASS
J6 source authority                       PASS
SELECTIVE grant / contract digest         PASS
local model artifact attestation          PASS
J7 row/text/vector attestation            PASS
positive EA retrieval                     PASS
foreign-source exclusion                  PASS
TCM/Feng Shui/Ayurveda/chemistry refusal  PASS
Sanctuary refusal geometry                PASS
provenance-bearing bounded block          PASS
FAST/CORE/DEEP one-participation           PASS
no production-data mutation               PASS
```

**J8-R2 Stage A read-only production witness: PASS.**

The Jungian-shadow query anomaly is retained as an explicit quality note and does not alter this authority/safety verdict.

### Non-effects

This witness does not:

- change the SELECTIVE contract;
- change thresholds or descriptors;
- close J8 by inference;
- authorize Stage B;
- authorize corpus/Library/schema/member-data changes;
- establish universal semantic recall quality for every in-scope wording.

### Next gate

1. preserve this exact `0c95526c…` witness as the clean J8-R2 evidence;
2. re-pin `clean-main-no-secrets`;
3. request a separate founder Stage B catch-up deployment authorization for that then-current exact canonical SHA;
4. after catch-up, run production health/provenance plus a bounded J8 regression witness.
