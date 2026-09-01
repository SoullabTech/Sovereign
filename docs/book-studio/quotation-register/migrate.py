#!/usr/bin/env python3
"""Apply a hand-authored verdict migration to the register.

MIGRATION IS NOT EXTRACTION. It is the transfer of earned knowledge into a new
authority. Every entry is hand-authored and cites where its verdict was earned.
No prose is parsed. Nothing is re-adjudicated.

This script never opens the manuscript at all - verification and migration
operate on immutable input and have no write path to the canonical artifact.
"""
import json, re, unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
REG, SRC = HERE / "register.json", HERE / "session_verdicts.json"

ALLOWED = {"provenance_status", "actual_author", "internal_speaker", "work",
           "translator_or_mediator", "rights_status", "bibliography_relationship",
           "family", "editorial_status", "notes", "evidence_location",
           "provenance_review_state", "attributed_as_note"}


def norm(t):
    t = unicodedata.normalize("NFKD", t)
    t = re.sub(r"[‘’']", "'", t)
    return re.sub(r"[^a-z0-9 ]", "", t.lower()).strip()


def main():
    data = json.loads(REG.read_text())
    entries = json.loads(SRC.read_text())["entries"]
    report = {"migrated": [], "ambiguous": [], "unmatched": [], "conflicts": []}

    for e in entries:
        m, occ = norm(e["match"]), e.get("occurrence", 1)
        hits = [r for r in data["records"]
                if m in norm(r["text"]) and r["occurrence"] == occ]
        if not hits:
            report["unmatched"].append(e["match"]); continue
        if len(hits) > 1:
            report["ambiguous"].append({"match": e["match"],
                                        "ids": [h["id"] for h in hits]}); continue
        rec = hits[0]
        new_p, old_p = e.get("provenance_status"), rec.get("provenance_status")
        if old_p and new_p and old_p != new_p:
            report["conflicts"].append({"id": rec["id"], "existing": old_p,
                                        "incoming": new_p}); continue
        for k, v in e.items():
            if k in ALLOWED and v is not None:
                rec[k] = v
        # Per-axis review state. Migrating a rights class or an editorial ruling
        # does NOT assert that provenance was investigated.
        if e.get("provenance_status"):
            rec["provenance_review_state"] = "migrated"
        elif e.get("provenance_review_state") == "not_investigated":
            rec["provenance_review_state"] = "not_investigated"
        if e.get("rights_status"):
            rec["rights_review_state"] = "migrated"
        if e.get("editorial_status"):
            rec["editorial_review_state"] = "migrated"
        report["migrated"].append(rec["id"])

    for r in data["records"]:
        if r["provenance_review_state"] == "not_investigated" \
                and r["id"] not in report["migrated"] \
                and r["display_form"] == "block_epigraph":
            r["provenance_review_state"] = "pending_migration"
            r["evidence_location"] = ("QUOTATION_PROVENANCE_AUDIT.md - "
                                      "chapter-batch migration owed")

    data["migration_report"] = report
    REG.write_text(json.dumps(data, indent=2, ensure_ascii=False))

    states = {}
    for r in data["records"]:
        states[r["provenance_review_state"]] = states.get(r["provenance_review_state"], 0) + 1
    print(f"migrated   : {len(report['migrated'])}")
    print(f"unmatched  : {len(report['unmatched'])}  {report['unmatched']}")
    print(f"ambiguous  : {len(report['ambiguous'])}  {report['ambiguous']}")
    print(f"conflicts  : {len(report['conflicts'])}  {report['conflicts']}")
    print("\nreview state across all records:")
    for k, v in sorted(states.items()):
        print(f"  {k:20s} {v}")


if __name__ == "__main__":
    main()
