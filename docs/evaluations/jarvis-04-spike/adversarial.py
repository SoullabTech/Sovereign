"""
JARVIS-04 adversarial proof record — agent-memory substrate vs the JARVIS baseline.

METHOD NOTE, stated first because it changes what the numbers mean.
In JARVIS-02 a stub model was the CORRECT instrument: the adapter seam was under
test, and an LLM would only have added variance to it. Here it would be the
wrong instrument. In mem0 the model IS the mechanism under test — it decides
what becomes memory (FACT_RETRIEVAL_PROMPT) and issues ADD/UPDATE/DELETE/NONE
over existing memory (DEFAULT_UPDATE_MEMORY_PROMPT). Stubbing that would
manufacture the finding rather than measure it.

So this harness does two things it can do honestly, and refuses the third:
  A. exercises mem0's REAL history store, which is model-free, and records what
     the schema can and cannot carry;
  B. runs the same adversarial cases against the REAL JARVIS epistemic guard;
  C. marks every model-mediated behaviour UNKNOWN rather than simulating it.

Synthetic data only. No credentials. No network. No production system touched.
"""
import json, os, subprocess, sys, tempfile, sqlite3

passed = failed = unknown = 0
def check(name, cond, detail=""):
    global passed, failed
    if cond: passed += 1; print(f"  PASS  {name}")
    else:    failed += 1; print(f"  FAIL  {name}")
    if detail: print(f"          {detail}")
def mark_unknown(name, why):
    global unknown
    unknown += 1
    print(f"  UNKNOWN  {name}")
    print(f"           {why}")

os.environ["MEM0_TELEMETRY"] = "False"
from mem0.memory.storage import SQLiteManager

WORK = tempfile.mkdtemp(prefix="jarvis04-")
DB = os.path.join(WORK, "history.db")
h = SQLiteManager(db_path=DB)

print("\n=== A. WHAT THE CANDIDATE'S HISTORY STORE CAN CARRY ===")
cols = [r[1] for r in sqlite3.connect(DB).execute("PRAGMA table_info(history)")]
print(f"  history columns: {cols}")
check("A1. an event history exists at all — corrections are not simply lost",
      {"old_memory", "new_memory", "event", "is_deleted"} <= set(cols), f"{len(cols)} columns")
check("A2. an actor is recorded", "actor_id" in cols)
# The absences are the finding.
for field, label in [("source","provenance / source"), ("evidence","evidence class"),
                     ("status","standing / status"), ("supersedes","supersession pointer"),
                     ("checksum","integrity chain")]:
    check(f"A3.{field}: NO '{label}' column — the schema cannot express it",
          field not in cols and not any(field in c for c in cols),
          f"absent from {cols}")

print("\n=== B. ADVERSARIAL CASES — CANDIDATE HISTORY STORE ===")
h.add_history("m1", None, "deploy uses Caddy", "ADD", actor_id="llm")
h.add_history("m1", "deploy uses Caddy", "deploy uses Nginx", "UPDATE", actor_id="llm")
rows = h.get_history("m1")
check("B1. corrected memory — the prior value is retained",
      any(r.get("old_memory") == "deploy uses Caddy" for r in rows), f"{len(rows)} history rows")
check("B2. conflicting memories — both texts survive in history",
      {r.get("new_memory") for r in rows} >= {"deploy uses Caddy", "deploy uses Nginx"})
h.add_history("m1", "deploy uses Nginx", None, "DELETE", actor_id="llm", is_deleted=1)
rows2 = h.get_history("m1")
check("B3. history preservation — a DELETE event is soft, the row remains",
      len(rows2) > len(rows) and any(r.get("event") == "DELETE" for r in rows2),
      f"{len(rows2)} rows after DELETE")
check("B4. same text from different authorities is NOT distinguishable by standing",
      "actor_id" in cols and "status" not in cols,
      "actor_id records WHO asserted; nothing records with what STANDING or on what EVIDENCE")
check("B5. no-evidence case — a memory with no support is stored identically to a supported one",
      "source" not in cols,
      "the schema has nowhere to put support, so 'unsupported' is unrepresentable")
check("B6. missing provenance cannot even be flagged as missing",
      not any(c in cols for c in ("source", "provenance", "evidence_class")))

print("\n=== C. WHAT CANNOT BE MEASURED WITHOUT MANUFACTURING THE ANSWER ===")
mark_unknown("model-authored unsupported recollection",
             "FACT_RETRIEVAL_PROMPT decides what becomes a memory. Requires a live LLM; "
             "stubbing it would author the verdict rather than measure it.")
mark_unknown("irrelevant but semantically similar retrieval",
             "retrieval is embedding similarity over a vector store; needs an embedding model "
             "and credentials. UNKNOWN, not assumed.")
mark_unknown("stale memory / correction cascade",
             "mem0 has no dependency edges between memories, so a cascade has nothing to "
             "traverse — but whether the LLM would notice staleness is model behaviour, UNKNOWN.")
mark_unknown("restart recall quality / project portability",
             "recall quality is a function of the embedding model and store; not exercisable here.")

print("\n=== D. THE SAME ADVERSARIAL CASES AGAINST THE JARVIS BASELINE ===")
REPO = "/home/user/Sovereign"
GUARD = os.path.join(REPO, "scripts/builder/epistemic-guard.mjs")

def adjudicate(claim):
    p = subprocess.run(["node", GUARD, "adjudicate", "--claim-json", json.dumps(claim), "--json"],
                       capture_output=True, text=True, cwd=REPO)
    try: return p.returncode, json.loads(p.stdout or "{}")
    except Exception: return p.returncode, {"raw": (p.stdout or p.stderr)[:200]}

rc, out = adjudicate({
    "id": "J04-NOEV", "status": "OBSERVATION",
    "assertion": "The deploy path uses Caddy.", "evidence": []})
check("D1. no-evidence case — JARVIS REFUSES the claim",
      rc == 1, f"exit={rc} — refusal is a verdict, not an error")

rc2, out2 = adjudicate({
    "id": "J04-WEAK", "status": "OBSERVATION",
    "assertion": "The deploy path uses Caddy.",
    "evidence": [{"kind": "project_memory", "detail": "I remember this from a previous session",
                  "ref": "memory"}]})
check("D2. model-authored recollection is classed WEAK and cannot carry OBSERVATION",
      rc2 == 1, f"exit={rc2} — 'project_memory' is a declared WEAK evidence kind")

rc3, out3 = adjudicate({
    "id": "J04-GOOD", "status": "OBSERVATION",
    "assertion": "The epistemic guard proof reports 49 passed and 0 failed.",
    "evidence": [{"kind": "executable_gate",
                  "detail": "node scripts/builder/__tests__/epistemic-guard-proof.mjs -> 49 passed / 0 failed",
                  "ref": "scripts/builder/__tests__/epistemic-guard-proof.mjs"}]})
check("D3. the SAME assertion with probative evidence is PERMITTED",
      rc3 == 0, f"exit={rc3} — standing follows the evidence, not the text")

rc4, out4 = adjudicate({
    "id": "J04-CORR", "status": "CORRECTION",
    "assertion": "Nginx was believed to be the proxy; it is Caddy.",
    "correction": {"old_claim": "Nginx is the proxy", "why_we_believed_it": "a stale doc said so",
                   "disconfirming_evidence": "container inspection shows maia-caddy",
                   "corrected_claim": "Caddy is the proxy"}})
check("D4. an incomplete correction is REFUSED — all seven rungs required",
      rc4 == 1, f"exit={rc4} — missing general_failure_pattern / candidate_recognition_rule / future_test")

check("D5. same text from different authorities IS distinguishable",
      rc2 == 1 and rc3 == 0,
      "identical-shaped claims separated purely by evidence class — the candidate cannot do this")

h.close()
print("\n" + "=" * 64)
print(f"JARVIS-04 ADVERSARIAL RECORD: {passed} passed · {failed} failed · {unknown} UNKNOWN")
print("=" * 64 + "\n")
sys.exit(0 if failed == 0 else 1)
