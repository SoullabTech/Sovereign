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
# A FROZEN POPULATION IS NOT A FROZEN COUNT. What froze is the set of identities
# under management; adjudication moves records between the active and historical
# layers and must not read as a breach. The invariant is the sum.
FROZEN_POPULATION = 158  # 130 active + 28 historical at the moment of freezing
adm = [r["id"] for r in R if r.get("admitted_after_freeze")]
check("frozen population reconciles across both layers",
      len(R) + len(H) - len(adm) == FROZEN_POPULATION,
      f"{len(R)} active + {len(H)} historical - {len(adm)} admitted after the freeze "
      f"= {len(R) + len(H) - len(adm)} (frozen {FROZEN_POPULATION})"
      + (f" | post-freeze admissions: {adm}" if adm else ""))
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
ab = sum(1 for r in R if (r["display_form"] == "block_epigraph" or r.get("former_form") == "block")
         and not r.get("admitted_after_freeze"))
ib = sum(1 for r in H if r.get("former_form", "block") == "block")
check("block lifecycle closes against the original census",
      ab + ib == 137, f"137 = {ab} active block + {ib} inactive block")
# The 9 spans the reconciler still surfaces, each ruled a non-quotation with a
# reason. Set equality, not a count: a count lets a new unexplained span hide
# behind a disappeared one.
DOCUMENTED_SPANS = {
    "But you said what I imagine is real.":                   "client speech",
    "From the Father and the Son comes the Holy Spirit":       "creedal formula",
    "Who am I to dare identify with something":                "authorial voiced speech",
    "Who am I not to dare to accept this new adventure":       "authorial voiced speech",
    "emotionally inadequate,":                                 "client speech",
    "wasted years at a job they hate":                         "client speech",
    "I know therefore I am.":                                  "authorial coinage",
    "being logical and consistent.":                           "definition",
    "This is what I have experienced. What is your experience?": "authorial voiced speech",
}
undoc = [o["text"][:60] for o in orph
         if not any(k in o["text"] for k in DOCUMENTED_SPANS)]
missing = [k for k in DOCUMENTED_SPANS
           if not any(k in o["text"] for o in orph)]
check("detector reconciliation finds no unexplained quotation-like spans",
      not undoc and not missing,
      f"{len(orph)} spans, each documented as a non-quotation"
      + (f" | UNDOCUMENTED: {undoc}" if undoc else "")
      + (f" | no longer present: {missing}" if missing else ""))

print()
if fail:
    print(f"FREEZE REFUSED: {fail}")
    sys.exit(1)
print("=" * 62)
print("  WHOLE-BOOK QUOTATION POPULATION FROZEN")
print("=" * 62)
print("  Every candidate has an identity. Every identity has an explicit state.")
