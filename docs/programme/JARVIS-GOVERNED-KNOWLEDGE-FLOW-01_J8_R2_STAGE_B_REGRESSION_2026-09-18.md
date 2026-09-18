# JARVIS-GOVERNED-KNOWLEDGE-FLOW-01 — J8-R2 Stage B Regression Witness

> **Class:** C — documentary evidence capture only  
> **Governing authority:** founder Stage B exact-SHA deployment authorization · frozen Stage A witness · J8-R1 SELECTIVE founder grant · J8-R1 sufficiency-order repair  
> **Current gate:** Stage B exact-SHA regression frozen → founder J8 adjudication / separate later production-catch-up decision if desired  
> **Evidence subject:** exact production runtime `34e7fe4eb3acdadb690f403d1c17734fc182209e`  
> **Stop boundary:** this record authorizes no later canonical deployment, no contract/threshold change, no production-data mutation, and no automatic J8 closure

**Date:** 2026-09-18  
**Witness type:** bounded read-only post-catch-up J8 regression  
**Verdict:** ✅ **STAGE B J8 REGRESSION PASS**  
**J8 standing:** ⛔ remains open pending founder adjudication; this evidence does not close J8 by itself.

---

## 1 · Custody and production provenance

Founder authorized Stage B for exact SHA:

`34e7fe4eb3acdadb690f403d1c17734fc182209e`

with the completed Stage A clean witness preserved at:

- Stage A production SHA: `0c95526c1c7b7d8bd8cc443aa88e85c062a510dc`
- frozen Stage A evidence commit: `146d9a30098ae6534e0c0ed9cf775685348dd85f`

At Stage B gate entry, production was already observed healthy on the exact authorized Stage B target. A redundant same-SHA redeploy was therefore not performed.

Observed production:

```text
runtime GIT_COMMIT   34e7fe4eb
container health     healthy
image tag            maia-sovereign:34e7fe4eb
image id             sha256:49189ff4a7004b0619d4c80115633b47abfd287380f0aff3bc4ce254cdeb79ce
/api/version commit  34e7fe4e
environment          production
```

Fresh `/api/version` response:

```json
{"version":"1.0.0","major":1,"minor":0,"patch":0,"commit":"34e7fe4e","timestamp":"2026-09-18T11:31:22.207Z","env":"production","buildDate":"unknown"}
```

Current repository canonical had already advanced to `ee7999c244a981ab2305dec6f4f2fd86bad1f9c9` by the time this witness was frozen. That later SHA was **not** authorized or deployed by this Stage B act.

---

## 2 · Pre-regression production state

Before the bounded read-only regression:

```text
ain_knowledge_chunks      1238 rows
AIN sources               1
AIN embedded              1238
library_sources           2228 rows
ain_knowledge_retrievals  0 rows
```

---

## 3 · Exact J8 authority/model/corpus attestations — PASS

Production runtime returned:

```text
J6 authority keys        1
exact authority keys     1
source SHA-256           f57f17e6ab82f911a4932c1f2d5fa0149e8fe499c7461f60bd87f86d0f657af0
```

SELECTIVE contract:

```text
contract id              J8-R1-EA-SELECTIVE-v1
computed SHA-256         cb616d711e62b40f8042065c3d8a072c25f5ee6da1050c376e0246a4d1e39928
expected SHA-256         cb616d711e62b40f8042065c3d8a072c25f5ee6da1050c376e0246a4d1e39928
grant status             GRANTED
effect scope             current_turn_retrieved_evidence_membership
```

Local model:

```text
model                     nomic-embed-text:latest
model artifact digest     0a109f422b47e3a30ba2b10eca18548e944e8a23073ee3f3e947efcf3c45e59f
```

Exact corpus/vector attestation:

```text
rows                      1238
sources                   1
embedded rows             1238
chunk indexes             0..1237
vector dimensions         768
chunk-set SHA-256         87b0cbaa076cdb6d374597b75fb652ac87313b1eda1ad87fce4a8490cf61d852
embedding-set SHA-256     4ec0eb4d2fdc6e56fccd14927fcb9e4cf5df51ade15cd75ce25c3966ce2bee93
```

All matched the Stage A clean witness.

---

## 4 · Bounded production retrieval regression

### Positive EA control

Historical positive query:

> What is the crystal of self-knowledge and how do its elemental facets relate to awareness?

Result:

```text
hits          3
subject       elemental-alchemy only
similarities  0.693212 · 0.668039 · 0.646392
```

### Confusable / wrong-system controls

```text
Traditional Chinese medicine    0 hits
Feng Shui                       0 hits
Ayurveda                        0 hits
chemistry / periodic table      0 hits
```

The Stage A authority/relevance behavior therefore survives Stage B.

---

## 5 · Sanctuary containment — PASS

Exact Stage B source + runtime producer standing established:

```text
canonical route calls retrieveGovernedKnowledge(message)    true
retrieval guarded by AIN flag + !isSanctuary               true
Sanctuary guard occurs before retrieval call               true
route owns minSimilarity=0.55                              false
route owns maxChunks=3                                     false

producer                    retrieved.governed_knowledge
requires.notSanctuary       true
participation class         retrieved
authority                   situate
room                        sovereign_chat
```

No authenticated production member turn was submitted.

---

## 6 · Post-regression no-mutation invariant — PASS

After the Stage B regression:

```text
ain_knowledge_chunks      1238 rows
AIN sources               1
AIN embedded              1238
library_sources           2228 rows
ain_knowledge_retrievals  0 rows
```

Prestate and poststate are identical for the witnessed production data surfaces.

No corpus, Library, schema, member-turn, or retrieval-analytics mutation was performed.

---

## 7 · Stage B verdict

```text
exact Stage B runtime provenance      PASS
production health                     PASS
J6 source authority                   PASS
SELECTIVE grant / contract digest     PASS
local model artifact attestation      PASS
J7 row/text/vector attestation        PASS
positive EA retrieval                 PASS
TCM/Feng Shui/Ayurveda/chemistry      REFUSED
Sanctuary containment                 PASS
production-data no-mutation           PASS
```

**Stage B bounded J8 regression: PASS.**

Stage A remains the clean scientific witness for `0c95526c…`. Stage B establishes that the J8 contract continues to behave correctly on production runtime `34e7fe4e…`.

---

## 8 · Standing

```text
Stage A clean witness                 ✅ PASS / preserved
Stage B regression                    ✅ PASS
J8 SELECTIVE contract                 ✅ unchanged
production runtime                    34e7fe4eb
current canonical                     ee7999c244a981ab2305dec6f4f2fd86bad1f9c9
later canonical deployment            ⛔ NOT AUTHORIZED BY THIS ACT
J8 closure                            ⛔ NOT INFERRED
```

### Next gate

Founder adjudication may now decide whether the accumulated J8 evidence is sufficient to close J8.

Separately, if production is to advance from `34e7fe4e…` to current canonical `ee7999c2…`, that requires a new exact-SHA deployment authorization and is outside this Stage B act.
