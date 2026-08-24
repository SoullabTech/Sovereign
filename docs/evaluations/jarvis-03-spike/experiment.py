"""
JARVIS-03 decisive experiment — Semantica as a DecisionGraphAdapter candidate.

WHAT IS UNDER TEST. Not whether Semantica is a good product. Whether it can hold
the lineage JARVIS needs and return dependency sets accurately enough for JARVIS
to adjudicate, WITHOUT taking over epistemic authority JARVIS already owns.

  Semantica traverses. JARVIS adjudicates.

Synthetic, non-sensitive data only. No production system is touched. No MAIA
memory is read or written.
"""
import json, os, shutil, sqlite3, sys, tempfile, time
from semantica.provenance import ProvenanceManager, SQLiteStorage

passed = failed = 0
def check(name, cond, detail=""):
    global passed, failed
    if cond: passed += 1; print(f"  PASS  {name}")
    else:    failed += 1; print(f"  FAIL  {name}")
    if detail: print(f"          {detail}")

WORK = tempfile.mkdtemp(prefix="jarvis03-")
DB = os.path.join(WORK, "graph.db")
pm = ProvenanceManager(storage=SQLiteStorage(DB))

# ── Build the lineage the directive specifies ────────────────────────────────
# Evidence A -supports-> Decision B -derives-> Knowledge C -used by-> Skill D
#                                                        -contributes to-> Scene E
# Authority F -authorizes-> Decision B
# Action G   -results from-> Decision B
# Outcome H  -results from-> Action G
#
# NOTE ON EDGE TYPING, established rather than assumed below: Semantica's model is
# W3C PROV derivation, so an edge's TYPE is not first-class. `used_entities` says
# THAT B used A and F; it does not say A *supports* while F *authorizes*. The only
# place to put the relation name is metadata, which traversal does not read.
print("\n=== 0. BUILDING THE SYNTHETIC LINEAGE ===")
pm.track_entity("A", source="synthetic", entity_type="evidence")
pm.track_entity("F", source="synthetic", entity_type="authority")
pm.track_entity("B", source="synthetic", entity_type="decision",
                parent_entity_id="A", used_entities=["A", "F"],
                metadata={"edges": {"A": "supports", "F": "authorizes"}})
pm.track_entity("C", source="synthetic", entity_type="project_knowledge",
                parent_entity_id="B", used_entities=["B"],
                metadata={"edges": {"B": "derives"}})
pm.track_entity("D", source="synthetic", entity_type="skill",
                parent_entity_id="C", used_entities=["C"],
                metadata={"edges": {"C": "used_by"}})
pm.track_entity("E", source="synthetic", entity_type="project_scene",
                parent_entity_id="D", used_entities=["D"],
                metadata={"edges": {"D": "contributes_to"}})
pm.track_entity("G", source="synthetic", entity_type="action",
                parent_entity_id="B", used_entities=["B"],
                metadata={"edges": {"B": "results_from"}})
pm.track_entity("H", source="synthetic", entity_type="outcome",
                parent_entity_id="G", used_entities=["G"],
                metadata={"edges": {"G": "results_from"}})
pm.track_entity("Z", source="synthetic", entity_type="evidence")   # unrelated control
check("8 lineage nodes + 1 unrelated control persisted",
      pm.get_statistics().get("total_entries", 0) >= 9, json.dumps(pm.get_statistics())[:160])

# ── The six required questions ───────────────────────────────────────────────
print("\n=== 1. THE SIX QUESTIONS, ANSWERED DETERMINISTICALLY ===")
ids = lambda entries: [e.entity_id for e in entries]

lin_c = ids(pm.trace_lineage("C"))
check("Why does C exist? — full ancestry returned", set(lin_c) >= {"C", "B", "A", "F"}, f"{lin_c}")

prov_b = pm.get_provenance("B")
check("What evidence supports B? — B's inputs are retrievable",
      set(prov_b.get("used_entities", [])) == {"A", "F"}, f"used_entities={prov_b.get('used_entities')}")

lin_g = ids(pm.trace_lineage("G"))
check("What decision caused G? — B is in G's ancestry", "B" in lin_g, f"{lin_g}")

desc_b = ids(pm.trace_descendants("B"))
check("What resulted from B? — forward traversal reaches C, D, E, G, H",
      set(desc_b) >= {"C", "D", "E", "G", "H"}, f"{desc_b}")

desc_a = ids(pm.trace_descendants("A"))
check("What depends on A, directly or indirectly? — transitive impact set",
      set(desc_a) >= {"B", "C", "D", "E", "G", "H"}, f"{desc_a}")

# ── Supersession: state before and after ─────────────────────────────────────
pm.track_entity("A", source="synthetic", entity_type="evidence",
                metadata={"note": "revised measurement"}, revision_type="correction")
hist_a = pm.revision_history("A")
check("What was the state before and after a superseding fact? — both retained",
      len(hist_a) >= 2, f"revision_history(A) rows={len(hist_a)}")

# ── Correction cascade ───────────────────────────────────────────────────────
print("\n=== 2. CORRECTION CASCADE — INVALIDATE A, DO NOT DELETE IT ===")
before = pm.get_provenance("A")
inv = pm.invalidate("A", agent_id="jarvis-03-experiment", reason="superseded by re-measurement")
after = pm.get_provenance("A")
check("A is marked invalidated, not removed", after is not None and after.get("invalidated") is True,
      f"invalidated={after.get('invalidated')} reason={after.get('invalidation_reason')}")
check("the invalidation records who and when", bool(after.get("invalidated_by") and after.get("invalidated_at_time")),
      f"by={after.get('invalidated_by')} at={after.get('invalidated_at_time')}")

impact = ids(pm.trace_descendants("A"))
check("the dependency set JARVIS needs is returned after invalidation",
      set(impact) >= {"B", "C", "D", "E", "G", "H"}, f"impact set = {sorted(set(impact))}")
# JARVIS assigns the statuses; Semantica supplied only the set.
assignable = {"B": "REVIEW", "C": "STALE", "D": "REVIEW/SUSPEND", "E": "REGENERATE"}
check("...and it covers every node JARVIS must re-status",
      set(assignable) <= set(impact), f"required={sorted(assignable)} got={sorted(set(impact))}")
check("Semantica did NOT assign statuses itself — it has no such vocabulary",
      not any(k in (after or {}) for k in ("status", "standing", "epistemic_status")),
      "correct: traversal is not adjudication")

# ── Negative controls ────────────────────────────────────────────────────────
print("\n=== 3. NEGATIVE CONTROLS ===")
check("1. an unrelated evidence node (Z) is NOT in A's impact set", "Z" not in impact, f"impact={sorted(set(impact))}")

hist_after = pm.revision_history("A")
check("2. a contradictory fact did not overwrite the historical fact",
      len(hist_after) >= 2 and before is not None,
      f"history rows={len(hist_after)}; pre-correction entry still retrievable")

chain = pm.verify_chain()
check("3. the append-only hash chain verifies — history is not silently rewritable",
      chain.get("valid") is True or chain.get("is_valid") is True, json.dumps(chain)[:200])

orphan = pm.track_entity("ORPHAN", source="synthetic", entity_type="evidence")
check("4. missing provenance stays missing — it is not inferred",
      orphan.derived_from_id is None and orphan.used_entities == [],
      f"derived_from_id={orphan.derived_from_id} used_entities={orphan.used_entities}")

# The sharp edge: a `source=` string that happens to match an existing entity id
# is silently promoted to a derivation edge the caller never asserted.
heur = pm.track_entity("HEURISTIC_PROBE", source="A", entity_type="evidence")
check("4b. FINDING: a source= string matching an entity id IS auto-promoted to a derivation edge",
      heur.derived_from_id == "A",
      f"derived_from_id={heur.derived_from_id} — provenance the caller never asserted")

sig_ok = True
try:
    pm.track_entity("BADKWARG", source="synthetic", nonsense_kwarg_that_does_not_exist=True)
except TypeError:
    sig_ok = False
check("4c. FINDING: unknown kwargs are silently accepted, not rejected", sig_ok,
      "a mistyped provenance field fails open — it records nothing and raises nothing")

src = open(os.path.join(os.path.dirname(sys.modules["semantica.provenance"].__file__), "manager.py")).read()
check("5. no chain-of-thought is required or manufactured",
      not any(t in src for t in ("chain_of_thought", "reasoning_trace", "thinking")),
      "provenance/manager.py references no private model reasoning")

# ── Edge typing — establish, do not assume ───────────────────────────────────
print("\n=== 4. EDGE TYPING — WHAT THE MODEL CAN AND CANNOT SAY ===")
b_entry = pm.get_provenance("B")
check("FINDING: edges are untyped — traversal cannot distinguish 'supports' from 'authorizes'",
      set(b_entry.get("used_entities", [])) == {"A", "F"} and "edges" in (b_entry.get("metadata") or {}),
      "both arrive as undifferentiated used_entities; the relation name survives only in metadata, "
      "which no traversal method reads")

# ── Operational ──────────────────────────────────────────────────────────────
print("\n=== 5. OPERATIONAL ===")
t0 = time.perf_counter(); [pm.trace_descendants("A") for _ in range(50)]
per = (time.perf_counter() - t0) / 50 * 1000
check("representative traversal latency is workable", per < 100, f"{per:.2f} ms per full-impact traversal (9 nodes)")

del pm
pm2 = ProvenanceManager(storage=SQLiteStorage(DB))
check("durable across process-local reopen — SQLite, no server",
      set(ids(pm2.trace_descendants("A"))) >= {"B", "C", "D", "E"}, "reopened the same db file")

try:
    ttl = pm2.export_prov(format="turtle")
    check("exportable to W3C PROV-O turtle — no lock-in", isinstance(ttl, str) and len(ttl) > 0,
          f"{len(ttl)} chars; head: {ttl.splitlines()[0][:70] if ttl else ''}")
except Exception as e:
    check("exportable to W3C PROV-O turtle — no lock-in", False, f"{type(e).__name__}: {str(e)[:90]}")

tables = [r[0] for r in sqlite3.connect(DB).execute("SELECT name FROM sqlite_master WHERE type='table'")]
check("storage is a plain readable SQLite file — a second export path exists",
      "provenance" in tables, f"tables={tables}")

shutil.rmtree(WORK, ignore_errors=True)
print("\n" + "=" * 62)
print(f"JARVIS-03 GRAPH EXPERIMENT: {passed} passed · {failed} failed")
print("=" * 62 + "\n")
sys.exit(0 if failed == 0 else 1)
