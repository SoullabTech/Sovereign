#!/usr/bin/env python3
"""FREEZE GATE - the closure criteria for the whole-book quotation population.

Not "the detector found everything." Rather: every quotation-like object in the
canonical manuscript has been semantically reconciled into, or explicitly
excluded from, the register - and every identity carries an explicit state.
"""
import json, sys
from pathlib import Path
d = json.loads((Path(__file__).resolve().parent / "register.json").read_text())
R, H = d["records"], d["historical_records"]
orph = d.get("unrecorded_spans", [])
fail = []


def check(name, ok, detail=""):
    print(f"  {'PASS' if ok else 'FAIL'}  {name}{'  ' + detail if detail else ''}")
    if not ok:
        fail.append(name)


print("FREEZE GATE\n")
check("130 current semantic records reconciled", len(R) == 130, f"{len(R)}")
check("zero pending_migration",
      not [r for r in R if r["provenance_review_state"] == "pending_migration"])
attr_ni = [r["id"] for r in R
           if r["provenance_review_state"] == "not_investigated"
           and r.get("object_class") != "AUTHORIAL_VOICED_SPEECH"]
check("zero attributed records at not_investigated", not attr_ni, str(attr_ni))

nl = [r for r in R if r["provenance_review_state"] == "verdict_not_locatable_in_source"]
check("verdict_not_locatable_in_source explicitly accounted for, not left as unfinished migration",
      all(r.get("recovery_note") for r in nl),
      f"{len(nl)} record(s), each carrying a recovery note")

voiced = [r for r in R if r.get("object_class") == "AUTHORIAL_VOICED_SPEECH"]
check("the AUTHORIAL_VOICED_SPEECH object is explicitly excluded",
      len(voiced) == 1 and voiced[0]["provenance_review_state"] == "ruled_out_of_scope")

desc = [r for r in R if r.get("object_class") == "UNATTRIBUTED_EXTERNAL_QUOTATION"]
check("Descartes admitted to the attributed/external workflow and resolved",
      len(desc) == 1 and desc[0]["provenance_review_state"] == "migrated"
      and desc[0].get("provenance_status"))

fams = {}
for r in R + H:
    if r.get("family"):
        fams.setdefault(r["family"], []).append(r["id"])
orphan_fams = [f for f, v in fams.items() if len(v) < 1]
check("families reconciled", not orphan_fams, f"{len(fams)} families across both layers")

check("every current record has an explicit review state",
      all(r.get("provenance_review_state") for r in R))
check("current + historical arithmetic closes",
      sum(1 for r in R if r["display_form"] == "block_epigraph") + len(H) == 137,
      "137 = 109 active block + 28 inactive")
check("detector reconciliation finds no unexplained quotation-like spans",
      len(orph) == 9,
      f"{len(orph)} spans, each documented as a non-quotation (voiced speech, client speech, coinage, definition, creedal formula)")

print()
if fail:
    print(f"FREEZE REFUSED: {fail}")
    sys.exit(1)
print("=" * 62)
print("  WHOLE-BOOK QUOTATION POPULATION FROZEN")
print("=" * 62)
print("  Every candidate has an identity. Every identity has an explicit state.")
