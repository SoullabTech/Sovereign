#!/usr/bin/env python3
"""Stage 4I working view - family-aware, previous rulings read-only."""
import json
from pathlib import Path
d = json.loads((Path(__file__).resolve().parent / "register.json").read_text())
R, H = d["records"], d["historical_records"]
ruled = lambda r: (r.get("editorial_status") or "unadjudicated") != "unadjudicated"
inline = lambda r: r["display_form"] != "block_epigraph"
pop = [r for r in R if r["provenance_review_state"] != "ruled_out_of_scope"
       and not ruled(r) and (inline(r) or r.get("pass_assignment") == "4I")]
fam = {}
for r in R + H:
    if r.get("family"):
        fam.setdefault(r["family"], []).append(r)
popids = {r["id"] for r in pop}
print(f"STAGE 4I POPULATION: {len(pop)}\n")
seen = set()
print("== FAMILY GROUPS (shared evidence, occurrence-level rulings) ==")
for f, v in sorted(fam.items()):
    if not ({x["id"] for x in v} & popids):
        continue
    print(f"\n  {f}")
    for x in v:
        if x in H:
            lane, txt = "HISTORICAL (settled)", x["text_at_removal"]
        elif x["id"] in popids:
            lane, txt = "4I - AWAITING RULING", x["text"]
            seen.add(x["id"])
        else:
            lane, txt = "SETTLED - read only", x["text"]
        loc = f"L{x.get('line_at_build','-')}"
        print(f"    {lane:<22} {x['id']:<14} {loc:<7} {str(x.get('provenance_status'))[:18]:<20} {txt[:40]}")
        if lane.startswith("SETTLED"):
            print(f"      -> {x.get('editorial_status')}")
print(f"\n== SINGLE OCCURRENCES ({len(pop)-len(seen)}) ==")
for r in sorted([x for x in pop if x["id"] not in seen], key=lambda x: x["line_at_build"]):
    print(f"  {r['id']:<14} L{r['line_at_build']:<5} {str(r['provenance_status'])[:18]:<20} {r['text'][:46]}")
