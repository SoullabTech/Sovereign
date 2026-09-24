# H7j — Current-Act Relation Acquisition

**Experiment:** `H7j-HELDOUT-01`  
**Status:** OFFLINE R&D ONLY  
**Verdict:** **CONFIRMED — BOUNDED**

No production prompt, cognition, memory, schema, routing, model, validator, or egress change is authorized by this experiment alone.

## Frozen artifacts

- Acquisition-rule SHA-256: `155d759a7a8a25dba337cd151812700da95f8e1064c3def8a14a78e478fa24c8`
- Held-out-corpus SHA-256: `4f47768b866d018de03ad60dd63271cfd40e0eae3f78df8923eaa817740cdda2`

## Aggregate result

| Metric | Result |
|---|---:|
| Exact acquired current-act relation | **34/36** |
| Acquired material / non-material | **34/36** |
| Primary anchor | **6/6** |
| Baseline gold recall | 14/18 |
| Acquired materiality gold recall | 18/18 |
| Final anchored gold recall | **18/18** |
| Material target retained | **6/6** |
| New non-gold selections vs baseline | **0** |

## Frozen promotion checks

- **PASS** — Acquired current-act relation exact accuracy >= 30/36: **34/36**
- **PASS** — Material/non-material accuracy induced by acquired relations >= 32/36: **34/36**
- **PASS** — Primary anchor correct = 6/6: **6/6**
- **PASS** — Final projector gold recall >= baseline gold recall: **18/18 vs 14/18**
- **PASS** — Final projector materially-governing target recall >= 5/6: **6/6**
- **PASS** — At most 1 newly selected non-gold item relative to baseline: **0**
- **PASS** — At least one case where acquired anchor changes ordering or membership relative to unanchored acquired-materiality projection: **1/6: MODEL_TURNOVER_SOVEREIGNTY**

## Per-case results

### SANCTUARY_PERSISTENCE
- Gold: `sa_no · sa_failclosed · sa_purge`
- B: `sa_no · sa_purge · sa_keep`
- Acquired-materiality: `sa_no · sa_purge · sa_failclosed`
- Final anchored: `sa_no · sa_purge · sa_failclosed`
- Acquired anchor: `sa_no`

### PRACTITIONER_DECLINED_OBSERVATION
- Gold: `po_release · po_authorship · po_member`
- B: `po_release · po_authorship · po_recall`
- Acquired-materiality: `po_release · po_authorship · po_member`
- Final anchored: `po_release · po_authorship · po_member`
- Acquired anchor: `po_release`

### MODEL_TURNOVER_SOVEREIGNTY
- Gold: `mt_arch · mt_not_subject · mt_not_exercised`
- B: `mt_not_exercised · mt_not_subject · mt_arch`
- Acquired-materiality: `mt_not_exercised · mt_not_subject · mt_arch`
- Final anchored: `mt_arch · mt_not_exercised · mt_not_subject`
- Acquired anchor: `mt_arch`

### PROVIDER_FAILURE_HONESTY
- Gold: `pf_503 · pf_nofake · pf_auth`
- B: `pf_nofake · pf_503 · pf_local`
- Acquired-materiality: `pf_nofake · pf_503 · pf_auth`
- Final anchored: `pf_nofake · pf_503 · pf_auth`
- Acquired anchor: `pf_nofake`

### CIRCLE_DISCOVERY_PRIVACY
- Gold: `cd_no · cd_declared · cd_literal`
- B: `cd_no · cd_scale · cd_declared`
- Acquired-materiality: `cd_no · cd_declared · cd_literal`
- Final anchored: `cd_no · cd_declared · cd_literal`
- Acquired anchor: `cd_no`

### READING_CIRCLE_GUEST_SCOPE
- Gold: `rg_token · rg_no_personal · rg_scope`
- B: `rg_no_personal · rg_scope · rg_token`
- Acquired-materiality: `rg_no_personal · rg_scope · rg_token`
- Final anchored: `rg_no_personal · rg_scope · rg_token`
- Acquired anchor: `rg_no_personal`

## Interpretation

### What passed

On this held-out corpus, a bounded acquisition layer using only the current act, candidate evidence, standing/provenance, and ordinary structural relation types was sufficient to recover the current-act relations needed by the H7i-R1 projector at the frozen threshold.

The key transition is therefore no longer:

```text
hand-supplied current-act edge
→ projector
```

but:

```text
CURRENT MEMBER ACT
        ×
ADMITTED EVIDENCE
        ×
ORDINARY RELATIONAL / PROVENANCE STRUCTURE
        ↓
CURRENT-ACT RELATION ACQUISITION
        ↓
DIRECT ANCHOR + CONTEXT-BOUND MATERIALITY
        ↓
SMALL DISPOSABLE GESTALT
```

### What this does not prove

The acquisition rule remains deliberately small and symbolic. It does not establish that unrestricted free-form relation discovery is reliable, nor that every production conversation will expose sufficiently typed ordinary structure. It shows that **given admitted evidence plus modest ordinary structural typing, the current-act edges do not need to be manually pre-authored.**

### Production implication

If this verdict is confirmed, the synthetic/replay chain has reached the point where the next useful falsifier is not another increasingly clever offline benchmark. It is shadow behavior against real production turns.

## Next exact gate

### `H8 — Production Shadow Projection`

Run the H7j acquisition layer and unchanged H7i-R1 projector against real production conversations in shadow only:

- read existing admitted evidence and provenance;
- compute current-act relations;
- compute direct anchor and context-bound materiality;
- produce the three-slot disposable projection;
- **do not inject it into MAIA cognition;**
- **do not write it as member memory;**
- log only bounded evidence references, acquired relation classes, selected evidence ids, and comparison metrics;
- compare the shadow projection with the actual canonical context/response and with later member corrections or confirmations.

Promotion from H8 should require production evidence that the projection is useful and truthful before any prompt, cognition, schema, memory-write, or routing effect is authorized.
