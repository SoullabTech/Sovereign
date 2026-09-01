#!/usr/bin/env python3
"""Closure gate. Read-only. Run after every migration batch."""
import json, sys
from pathlib import Path
d = json.loads((Path(__file__).resolve().parent / "register.json").read_text())
R, H = d["records"], d.get("historical_records", [])
rep, fail = d.get("migration_report", {}), []

def check(name, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {name}{'  ' + detail if detail else ''}")
    if not ok: fail.append(name)

print("CLOSURE GATE\n")
check("every source entry maps to exactly one quotation id",
      not rep.get("unmatched") and not rep.get("ambiguous"),
      f"unmatched={len(rep.get('unmatched',[]))} ambiguous={len(rep.get('ambiguous',[]))}")
check("no contradictory provenance verdicts without a conflict record",
      not rep.get("conflicts"), f"conflicts={len(rep.get('conflicts',[]))}")
check("ids are unique", len({r['id'] for r in R}) == len(R), f"{len(R)} records")

states = {r["provenance_review_state"] for r in R}
check("unverified / pending_migration / not_investigated remain distinct",
      "unverified" not in states,
      "provenance verdict never used as a review state; "
      + ", ".join(f"{s}={sum(1 for r in R if r['provenance_review_state']==s)}" for s in sorted(states)))

bad = [r["id"] for r in R if r["provenance_review_state"] == "migrated" and not r["provenance_status"]]
check("provenance review state never claims migrated without a verdict", not bad, str(bad))
axis = [r["id"] for r in R if r["editorial_review_state"] == "migrated"
        and r["provenance_review_state"] == "migrated" and not r["provenance_status"]]
check("editorial rulings do not stand in for provenance (axes independent)", not axis, str(axis))

noev = [r["id"] for r in R if r["provenance_review_state"] == "migrated" and not r["evidence_location"]]
check("every migrated claim cites its evidence location", not noev, str(noev))

ruled_no_prov = [r["id"] for r in R if r["editorial_review_state"] == "migrated"
                 and r["provenance_review_state"] != "migrated"]
print(f"  NOTE  {len(ruled_no_prov)} record(s) editorially ruled with provenance still open: {ruled_no_prov}")

blk = sum(1 for r in R if r["display_form"] == "block_epigraph")
pend = sum(1 for r in R if r["provenance_review_state"] == "pending_migration")
mig_blk = sum(1 for r in R if r["display_form"] == "block_epigraph" and r["provenance_review_state"] == "migrated")
DOCUMENTED = ("not_investigated", "verdict_not_locatable_in_source")
ni_blk = sum(1 for r in R if r["display_form"] == "block_epigraph" and r["provenance_review_state"] in DOCUMENTED)
check("block reconciliation: total = migrated + pending + documented not_investigated",
      blk == pend + mig_blk + ni_blk,
      f"{blk} = {mig_blk} migrated + {pend} pending + {ni_blk} documented-deferred")
check("current-field total", len(R) == 130, f"{len(R)} active records")
check("historical records carry no active manuscript span",
      all(h.get("active_span") is None for h in H), f"{len(H)} historical")
check("historical ids disjoint from current ids",
      not ({h["id"] for h in H} & {r["id"] for r in R}))
check("historical block lifecycle: 137 = 109 active + 28 inactive",
      blk + len(H) == 137, f"{blk} active + {len(H)} inactive")
sh = {}
for h in H: sh[h["record_state"]] = sh.get(h["record_state"], 0) + 1
print(f"  NOTE  historical states: {sh}")
print("  NOTE  attributed occurrences ever identified: 137 historical block + 19 inline = 156; "
      "2 unattributed boundary records held separately")

fams = {}
for r in R:
    if r.get("family"): fams.setdefault(r["family"], []).append(r["id"])
print("\n  families:", {k: len(v) for k, v in fams.items()})
print("\n" + ("GATE PASSED" if not fail else f"GATE FAILED: {fail}"))
sys.exit(1 if fail else 0)
