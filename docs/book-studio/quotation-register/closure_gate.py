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
check("historical entries all matched exactly one lifecycle record",
      not rep.get("historical_unmatched"), str(rep.get("historical_unmatched", [])))
# ---- Stage 4A tombstone integrity gate ----
s4 = [h for h in H if h.get("removed_at_stage") == "Stage 4A"]
no_ev = [h["id"] for h in s4 if h.get("provenance_status")
         and not (h.get("evidence_location") or "").startswith("QUOTATION_PROVENANCE_AUDIT")]
check("every Stage 4A tombstone verdict cites a Stage 2 evidence location",
      not no_ev, f"{len(s4)} Stage 4A tombstones; {len(no_ev)} unearned")
s4_ev = [h["id"] for h in s4 if (h.get("evidence_location") or "").startswith("STAGE4")]
check("no provenance verdict originates solely from a Stage 4 editorial note",
      not s4_ev, str(s4_ev))
corrected = [h for h in s4 if any(v.get("stage") == "tombstone authoring (unearned)"
                                  for v in h.get("provenance_history", []))]
check("authoring corrections are represented in provenance_history, not silently reconciled",
      len(corrected) > 0 and all(h.get("provenance_history") for h in corrected),
      f"{len(corrected)} corrected record(s) carry their superseded value"
      + ("  [VACUOUS - no corrections found where at least one is known]" if not corrected else ""))
check("editorial removal status untouched by the integrity pass",
      all(h.get("record_state") in ("removed", "reclaimed_as_author_prose") for h in H))
check("bibliography and rights remain on their own axes",
      all(not (h.get("bibliography_relationship") and
               h["bibliography_relationship"] == h.get("provenance_status")) for h in H))

hist_hist = [h for h in H if h.get("provenance_history")]
check("superseded verdicts are preserved, not discarded",
      all(all(v.get("superseded_by") for v in h["provenance_history"]) for h in hist_hist),
      f"{len(hist_hist)} record(s) carry a verdict history")
print(f"  NOTE  historical records with a migrated provenance verdict: "
      f"{sum(1 for h in H if h['provenance_review_state'] == 'migrated')} of {len(H)}")
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
for r in R + H:
    if r.get("family"): fams.setdefault(r["family"], []).append(r["id"])
fam_all = {}
for r in R:
    if r.get("family"): fam_all.setdefault(r["family"], {"active": [], "hist": []})["active"].append(r)
for h in H:
    if h.get("family"): fam_all.setdefault(h["family"], {"active": [], "hist": []})["hist"].append(h)
asym = []
for f, m in fam_all.items():
    if m["hist"] and m["active"]:
        bad = {"misattributed", "paraphrase_adapted", "no_ancestor", "unverified"}
        surv = [r for r in m["active"] if r.get("provenance_status") in bad]
        if surv:
            asym.append((f, [r["id"] for r in surv]))
if asym:
    print("\n  ASYMMETRIC REPAIR - family members repaired elsewhere, these survive with the same defect class:")
    for f, ids in asym:
        print(f"      {f}: {ids}")
print("\n  families:", {k: len(v) for k, v in fams.items()})
print("\n" + ("GATE PASSED" if not fail else f"GATE FAILED: {fail}"))
sys.exit(1 if fail else 0)
