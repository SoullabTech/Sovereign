# JARVIS-03 — Decision / Provenance Graph Evaluation (Semantica)

**Unit:** JARVIS-03 · **Date:** 2026-08-24 · **Scope:** Semantica evaluated **strictly as a DecisionGraphAdapter candidate** — not as JARVIS, not as an authority system.
**Not evaluated, by directive:** TencentDB, AIVM.
**Production untouched.** Isolated venv outside the repo; synthetic non-sensitive data only; no MAIA memory read or written. Repository changes are documents only.
**Package under test:** PyPI `semantica 0.6.6` — *"Graph-Native Infrastructure for Context and Accountable AI Systems"*, MIT, `github.com/semantica-agi/semantica`. ⚠️ The npm package named `semantica` is an unrelated React UI library at v0.0.1 and is **not** this.
**Decisive experiment:** `jarvis-03-spike/experiment.py` — **24 passed · 0 failed** (`RUN_OUTPUT.txt`).

---

## 1. Answer to the required question

> **Does Semantica materially simplify the provenance/dependency graph JARVIS genuinely lacks, without taking over epistemic authority JARVIS already possesses?**

**Yes — but only one module of it, and only if the rest is kept out.**

This is a materially different answer from JARVIS-02. Deep Agents offered capability JARVIS did not need. Semantica's `semantica.provenance` module offers **precisely the thing JARVIS-01 identified as its central aperture** — the return path — and it does so in 12 packages, 86 MB, over a plain SQLite file, with a verifying hash chain and a W3C PROV-O export.

The experiment answered all six required lineage questions deterministically, ran the correction cascade without deleting history, and passed all five negative controls.

⛔ **But the package as a whole must not be adopted.** `semantica.context` ships a `Decision` model carrying a model-authored `reasoning` string with embeddings, and a `PolicyEngine.check_compliance(decision, policy_id) -> bool`. That is **adjudication machinery** — the thing JARVIS owns and the thing JARVIS-02 rejected in Deep Agents' `MemoryMiddleware`. The same failure class, in a different package.

**Recommended disposition: `WRAP` — `semantica.provenance` only, behind a JARVIS-owned DecisionGraphAdapter interface, after the two fail-open defects in §5 are mitigated at the boundary.** Everything else: `REJECT` or `UNKNOWN`.

---

## 2. Capability establishment — executable, not marketing

Each row was established by importing and calling the real package. Nothing here is taken from the project's description.

| Declared capability | Established | Evidence |
|---|---|---|
| Durable nodes and relationships | ✅ **YES** | `SQLiteStorage`; survives reopen in a fresh manager; single `provenance` table |
| Evidence provenance | ✅ **YES** | `ProvenanceEntry` — 39 fields incl. `source_document`, `source_location`, `source_quote`, `confidence`, `credibility`, `agent_id`, `activity_id` |
| First-class decision representation | ⚠️ **YES, and that is the problem** | `semantica.context.decision_models.Decision` — but see §4 |
| Forward causal traversal | ✅ **YES** | `trace_descendants("B")` → `C, D, E, G, H` |
| Reverse dependency traversal | ✅ **YES** | `trace_lineage("C")` → `C, B, A, F` |
| Contradiction representation | ⚠️ **PARTIAL** | `semantica.conflicts.Conflict` (5 types, `conflicting_values`, `sources`, `severity`) — ⛔ but also `recommended_action`, and the module is **not** wired to the provenance graph |
| Supersession | ✅ **YES** | `supersedes`, `previous_version_id`, `revision_type`, `valid_from`/`valid_until`; `revision_history()` returned both states |
| Temporal state / history | ✅ **YES** | `valid_from`/`valid_until`, `query_recorded_between()`, `revision_history()`, `TemporalVersionManager` |
| Impact analysis | ✅ **YES** | full transitive impact set after invalidation: `B, C, D, E, G, H` |
| Policy representation / evaluation | ⚠️ **YES — and out of scope** | `PolicyEngine.check_compliance() -> bool`; `SHACLValidator` (needs `shacl` extra) |
| Deterministic querying | ✅ **YES** | no model in the traversal path; repeated runs identical; 1.14 ms per full-impact traversal |
| Exportability | ✅ **YES, two paths** | `export_prov(format="turtle")` → 9,950 chars of W3C PROV-O; plus the raw SQLite file |
| Local / self-hosted operation | ✅ **YES** | SQLite, no server, no network, no credentials |
| MCP or external access | ✅ **YES** | `semantica.mcp_server` — 12 tools incl. `record_decision`, `find_precedents`, `get_causal_chain` |

**`UNKNOWN`, and not argued around:** behaviour at scale (the experiment used 9 nodes); the graph backends (`Neo4j`, `Neptune`, `Apache AGE`, `FalkorDB`) which need extras not installed; `semantica.reasoning`, `semantica.kg`, `semantica.export`, `semantica.context` runtime behaviour — all four **failed to import** without `numpy`, so they were read but not exercised; concurrent-writer behaviour; upgrade/migration behaviour across package versions.

---

## 3. The decisive experiment

Lineage built exactly as specified — `Evidence A → Decision B → Knowledge C → Skill D → Scene E`, with `Authority F → B`, `Action G → B`, `Outcome H → G`, plus an unrelated `Evidence Z` control.

### The six questions — all answered deterministically

| Question | Answer returned |
|---|---|
| Why does C exist? | `['C', 'B', 'A', 'F']` |
| What evidence supports B? | `used_entities = ['A', 'F']` |
| What decision caused G? | `['G', 'B', 'A', 'F']` — B in ancestry |
| What resulted from B? | `['G', 'C', 'H', 'D', 'E']` |
| What depends on A, directly or indirectly? | `['B', 'G', 'C', 'H', 'D', 'E']` |
| State before and after a superseding fact? | `revision_history(A)` = 2 rows, both retained |

### Correction cascade — `invalidate(A)`, not delete

- A marked `invalidated=True`, **retained**, with `invalidated_by` and `invalidated_at_time` recorded.
- Impact set returned: `B, C, D, E, G, H` — covering every node JARVIS must re-status.
- ⭐ **Semantica assigned no status.** It has no `status` / `standing` / `epistemic_status` field at all. It returned the dependency set and stopped.

That is exactly the required division: **Semantica traverses. JARVIS adjudicates.** JARVIS assigns `B → REVIEW`, `C → STALE`, `D → REVIEW/SUSPEND`, `E → REGENERATE` from its own vocabulary, over a set Semantica computed.

### Negative controls — all five pass

1. Unrelated node `Z` **absent** from A's impact set.
2. The correction **did not overwrite** history — 3 revision rows retained, pre-correction entry still retrievable.
3. `verify_chain()` → `{"valid": true, "total_entries": 11, "broken_links": []}`. Entries are hash-chained (`checksum` / `previous_checksum` / `sequence_id`), so history is not silently rewritable.
4. A node created with no parent kept `derived_from_id=None`, `used_entities=[]` — **missing provenance stayed missing.**
5. `provenance/manager.py` references no `chain_of_thought`, `reasoning_trace` or `thinking`. **No private model reasoning is required or manufactured.**

---

## 4. ⛔ The semantic mismatch — where Semantica reaches for JARVIS's authority

Three places. The first is decisive; the others are containable.

### 4.1 `Decision` carries model-authored reasoning and a confidence float

```python
class Decision:
    decision_id: str; category: str; scenario: str
    reasoning: str                       # ← narrative, model-authored
    outcome: str; confidence: float      # ← a number, not a standing
    reasoning_embedding: Optional[List[float]]
    node2vec_embedding: Optional[List[float]]
    decision_maker: str
```

Compare JARVIS's `epistemic-guard.mjs`: eight **statuses**, twenty-two **evidence kinds** split probative/weak, four **standing** levels, and a seven-rung **correction anatomy**. A `reasoning` string with a `confidence` float is not weaker than that vocabulary — it is a **different and incompatible** one, and adopting it would put an unadjudicated narrative where a standing belongs.

⛔ **This is the JARVIS-02 finding recurring in a second package.** `semantica/context/agent_memory.py` exists too. Any external system offering "decisions" and "memory" must be checked for whether it carries *adjudicated standing* or merely *persisted assertion*. Semantica's provenance layer carries the former's raw material; its context layer carries the latter.

### 4.2 `PolicyEngine.check_compliance(decision, policy_id) -> bool`

A boolean verdict on whether a decision complies. JARVIS already refuses by name, with a failure class, from `checkAuthority` / `epistemic-guard` / `governance-gate`. A second compliance authority returning an unexplained bool is precisely the "two authorities disagreeing with nothing on screen" failure JARVIS-00 closed for repository roots.

### 4.3 Edges are untyped — the model cannot say *how* B used A

**Established, not assumed.** `used_entities = ['A', 'F']` is undifferentiated: traversal cannot distinguish *A supports B* from *F authorizes B*. The relation name survives only in `metadata`, which no traversal method reads.

For JARVIS this matters directly: `Authority → authorizes → Decision` and `Evidence → supports → Decision` are **different kinds of claim with different governance consequences**, and JARVIS-01 recorded that authority and evidence must not be collapsed. Semantica's model is W3C PROV *derivation*, not a general typed-relation graph.

⚠️ **Consequence for any adapter:** JARVIS must carry the edge type itself and cannot rely on traversal to preserve it. This is the single largest piece of adapter work.

---

## 5. Two fail-open defects a JARVIS adapter must close

Both found by the experiment, both benign in Semantica's intended use, both unacceptable under JARVIS evidence discipline.

| # | Defect | Observed | Why it matters here |
|---|---|---|---|
| **5.1** | A `source=` string that happens to match an existing entity id is **auto-promoted to a derivation edge** the caller never asserted | `track_entity("HEURISTIC_PROBE", source="A")` → `derived_from_id="A"` | This is inferred provenance presented as recorded provenance — the thing negative control 4 exists to forbid. It passed control 4 *and* fails this stricter one. An adapter must never pass a bare `source=` that could collide with an entity id. |
| **5.2** | Unknown kwargs are **silently accepted**, not rejected | `track_entity(..., nonsense_kwarg_that_does_not_exist=True)` raised nothing and recorded nothing | A mistyped provenance field fails open: the caller believes it recorded a link; nothing did. My own first probe hit exactly this — I passed `derived_from_id=` (an *output* field name; the input is `parent_entity_id=`) and it was silently discarded. |

⚠️ **Correction to my own earlier reading:** on first inspection I described 5.2 as "a caller-supplied provenance field silently dropped." That overstated it — `derived_from_id` is not an input parameter, so it was never a supported field being discarded. The accurate finding is the narrower one above: *unknown* kwargs fail open.

---

## 6. Operational evaluation

| Dimension | Measured / established |
|---|---|
| **Runtime** | Python ≥3.8. ⚠️ Second runtime alongside JARVIS's Node — same cost JARVIS-02 charged Deep Agents |
| **Dependencies — full** | ⛔ **42 core**, incl. `torch`, `transformers`, `spacy`, `sentence-transformers`, `faiss-cpu`, `opencv-python`, `librosa`, `gensim`, `matplotlib`, `plotly`. Install passed **1.8 GB** before being abandoned |
| **Dependencies — provenance layer only** | ⭐ **12 packages, 86 MB** via `--no-deps` + `networkx rdflib pydantic loguru structlog pyyaml` |
| **Coupling** | `provenance`, `graph_store`, `conflicts`, `change_management`, `ontology`, `mcp_server`, `core` import on light deps. `context`, `reasoning`, `kg`, `export` **require `numpy`** — the decision/memory layer is coupled to the ML stack, the provenance layer is not |
| **Persistence backend** | SQLite by default (`InMemoryStorage` also available); optional Neo4j / Neptune / Apache AGE / FalkorDB via extras (**UNKNOWN** — not exercised) |
| **Latency** | **1.14 ms** per full-impact traversal over 9 nodes. **UNKNOWN** at scale |
| **License** | **MIT** — permissive, vendorable |
| **Export path** | Two: `export_prov("turtle")` → W3C PROV-O, and the raw SQLite table. **Lock-in risk: LOW** |
| **Failure behaviour** | ⚠️ **Fails open** in the two cases in §5 — records nothing, raises nothing. Opposite of JARVIS's fail-closed discipline |
| **Maintenance complexity** | v0.6.6, pre-1.0, single maintainer email, active extras surface. ⚠️ API stability **UNKNOWN**; pinning required |

---

## 7. Disposition

| Capability | Existing JARVIS mechanism | Disposition |
|---|---|---|
| **Provenance / derivation graph storage** | — (**aperture A1**) | ⭐ **WRAP** — `semantica.provenance` behind a JARVIS-owned adapter |
| **Forward impact traversal** | — (aperture A1) | ⭐ **WRAP** |
| **Reverse lineage traversal** | — (aperture A1) | ⭐ **WRAP** |
| **Correction cascade dependency set** | — (the directive's §VIII need) | ⭐ **WRAP** — set only; JARVIS assigns every status |
| **Append-only integrity chain** | `.ain/epistemic-ledger.jsonl` (no hash chain) | **ADAPT** — the `checksum`/`previous_checksum`/`verify_chain` pattern is worth having; the ledger is JARVIS's |
| **W3C PROV-O export** | — | **ADAPT** — cheap, reduces lock-in |
| **Temporal validity (`valid_from`/`valid_until`)** | `epistemic-guard` `STALE` status | **ADAPT** — complements, does not replace |
| **Epistemic status / standing** | `epistemic-guard.mjs` — 8 statuses, 4 standings, 22 evidence kinds | ⛔ **KEEP JARVIS** |
| **Correction anatomy** | 7 rungs incl. `candidate_recognition_rule`, `future_test` | ⛔ **KEEP JARVIS** — Semantica has no equivalent |
| **Decision representation** | Work Unit packet + `governing_authority` | ⛔ **REJECT** — `Decision.reasoning` + `confidence` + embeddings is unadjudicated narrative |
| **Policy evaluation** | `checkAuthority`, `governance-gate`, `epistemic-ci` | ⛔ **REJECT** — `check_compliance() -> bool` is a second authority |
| **Agent memory** | (aperture) | ⛔ **REJECT** — `semantica/context/agent_memory.py` is the JARVIS-02 failure class again |
| **Contradiction representation** | `epistemic-guard` `CORRECTION`; Living Spiral §9 `contradicted` (unimplemented) | **EXPERIMENT** — `conflicts` is unwired to the provenance graph and emits `recommended_action` |
| **Typed relations** | JARVIS: Evidence/Observation/Claim/Decision/Action/Outcome/Authority | ⛔ **KEEP JARVIS** — edges are untyped; the adapter must carry types |
| **MCP surface** | — | **UNKNOWN / EXPERIMENT** — 12 tools exist; no JARVIS need identified (JARVIS-02 reached the same conclusion about MCP) |
| **Graph backends (Neo4j etc.)** | — | **UNKNOWN** — not exercised |
| **Entity extraction / embeddings / reasoning** | — | ⛔ **REJECT** — this is the 42-dependency ML stack; JARVIS needs none of it |

**Tally:** `WRAP` 4 · `ADAPT` 3 · `KEEP JARVIS` 3 · `REJECT` 5 · `EXPERIMENT` 2 · `UNKNOWN` 2 · `USE SEMANTICA` **0**.

⭐ **`USE SEMANTICA` is zero for the same reason `USE DEEP AGENTS` was zero: nothing here should be handed authority.** But unlike JARVIS-02, `WRAP` is non-empty and points at the programme's actual centre.

---

## 8. What this does and does not establish

**PROVEN:** a graph substrate exists that answers all six lineage questions deterministically, performs the correction cascade without destroying history, returns accurate impact sets, passes all five negative controls, assigns no statuses of its own, runs locally on SQLite in 86 MB, and exports to an open standard. 24/24, reproducible.

**NOT PROVEN — and not to be inferred:**
- Behaviour beyond 9 synthetic nodes. Real JARVIS lineage would be orders larger. **UNKNOWN.**
- That JARVIS *should* take this dependency. §5 lists two fail-open defects; §4.3 says the adapter must carry edge typing itself. Whether that adapter is cheaper than ~400 lines of SQLite in the existing `.ain/` substrate is a **JARVIS-05 question this unit does not answer.**
- Anything about the ML-coupled modules, which were read but never executed.

⚠️ **The genuine alternative this unit surfaces but does not decide:** the wrapped surface is narrow — nodes, typed edges, forward/reverse traversal, invalidation-with-history, a hash chain. JARVIS already owns a versioned, portable, CI-adjudicated `.ain/` ledger. **Whether to wrap Semantica or to build that narrow surface natively is exactly the JARVIS-05 ruling**, and it should be made with the JARVIS-04 result in hand, not before.

**Carried forward unchanged:** the `headOf()` divergence (JARVIS-02 §6) — it did not prevent truthful JARVIS-03 evidence, so it was not repaired. The `spawnSync git ENOENT` aperture (JARVIS-01 A10).

**JARVIS-03 is complete. STOP. JARVIS-04 is not begun.**
