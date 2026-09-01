#!/usr/bin/env python3
"""Apply a hand-authored verdict migration to the register.

MIGRATION IS NOT EXTRACTION. It is the transfer of earned knowledge into a new
authority. Every entry is hand-authored and cites where its verdict was earned.
No prose is parsed. Nothing is re-adjudicated.

This script never opens the manuscript at all - verification and migration
operate on immutable input and have no write path to the canonical artifact.
"""
import json, re, subprocess, sys, unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
REG, SRC = HERE / "register.json", HERE / "session_verdicts.json"
TOMB = HERE / "tombstones.json"

ALLOWED = {"provenance_status", "actual_author", "internal_speaker", "work",
           "translator_or_mediator", "rights_status", "bibliography_relationship",
           "family", "editorial_status", "notes", "evidence_location",
           "provenance_review_state", "attributed_as_note", "recovery_note", "family_role", "object_class", "member_testimony", "former_form", "provenance_history"}


def norm(t):
    t = unicodedata.normalize("NFKD", t)
    t = re.sub(r"[‘’']", "'", t)
    return re.sub(r"[^a-z0-9 ]", "", t.lower()).strip()


def similarity(a, b):
    A, B = set(norm(a).split()), set(norm(b).split())
    return len(A & B) / len(A | B) if A and B else 0.0


def main():
    # Always migrate onto a freshly built register. Migration is a projection of the
    # source files onto the detected population, not an accumulating mutation.
    subprocess.run([sys.executable, str(HERE / "build_register.py")],
                   check=True, capture_output=True)
    data = json.loads(REG.read_text())
    entries = json.loads(SRC.read_text())["entries"]
    # Ontology rulings first: what KIND of object this is must be settled before
    # any verdict is written, so a class decision can never overwrite a verdict.
    bd = HERE / "boundary_rulings.json"
    if bd.exists():
        entries += json.loads(bd.read_text())["entries"]
    for b in sorted(HERE.glob("batch_*.json")):
        entries += json.loads(b.read_text())["entries"]
    at = HERE / "author_testimony.json"
    if at.exists():
        entries += json.loads(at.read_text())["entries"]
    report = {"migrated": [], "ambiguous": [], "unmatched": [], "conflicts": []}

    for e in entries:
        m, occ = norm(e["match"]), e.get("occurrence", 1)
        hits = [r for r in data["records"]
                if m in norm(r["text"]) and r["occurrence"] == occ]
        if not hits:
            gone = [t for t in json.loads(TOMB.read_text())["records"]
                    if norm(e["match"]) in norm(t["text"])]
            if gone:
                report.setdefault("superseded_by_removal", []).append(e["match"])
            else:
                report["unmatched"].append(e["match"])
            continue
        if len(hits) > 1:
            report["ambiguous"].append({"match": e["match"],
                                        "ids": [h["id"] for h in hits]}); continue
        rec = hits[0]
        new_p, old_p = e.get("provenance_status"), rec.get("provenance_status")
        if e.get("member_testimony") and old_p and new_p and old_p != new_p:
            rec.setdefault("provenance_history", []).append({
                "verdict": old_p, "stage": "search-based verification",
                "note": "Superseded by author testimony about how the material entered the manuscript.",
                "superseded_by": new_p})
            old_p = None
        if old_p and new_p and old_p != new_p:
            report["conflicts"].append({"id": rec["id"], "existing": old_p,
                                        "incoming": new_p}); continue
        for k, v in e.items():
            if k in ALLOWED and v is not None:
                rec[k] = v
        # Per-axis review state. Migrating a rights class or an editorial ruling
        # does NOT assert that provenance was investigated.
        if e.get("provenance_review_state") == "edition_check_required":
            rec["provenance_review_state"] = "edition_check_required"
        elif e.get("provenance_review_state") == "ruled_out_of_scope":
            rec["provenance_review_state"] = "ruled_out_of_scope"
        elif e.get("provenance_status"):
            rec["provenance_review_state"] = "migrated"
        elif e.get("provenance_review_state"):
            rec["provenance_review_state"] = e["provenance_review_state"]
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

    tombs, n = [], 0
    for t in json.loads(TOMB.read_text())["records"]:
        n += 1
        tombs.append({
            "id": f"EA-Q-T{n:03d}",
            "record_state": t["state"],
            "removed_at_stage": t["stage"],
            "last_known_location": t["last_location"],
            "text_at_removal": t["text"],
            "attributed_as": t.get("attributed_as"),
            "provenance_status": t.get("provenance_status"),
            "provenance_review_state": "migrated" if t.get("provenance_status") else "not_investigated",
            "internal_speaker": t.get("internal_speaker"),
            "rights_status": t.get("rights_status"),
            "rights_review_state": "migrated" if t.get("rights_status") else "not_investigated",
            "bibliography_relationship": t.get("bibliography_relationship"),
            "editorial_status": t.get("editorial_status"),
            "editorial_review_state": "migrated",
            "family": t.get("family"),
            "evidence_location": t.get("evidence_location"),
            "notes": t.get("notes"),
            "provenance_history": t.get("provenance_history", []),
            "former_form": t.get("former_form", "block"),
            "active_span": None,
        })
    hist_entries = []
    for b in sorted(HERE.glob("batch_*.json")):
        hist_entries += json.loads(b.read_text()).get("historical_entries", [])
    for e in hist_entries:
        m = norm(e["match"])
        hits = [t for t in tombs if m in norm(t["text_at_removal"])]
        if len(hits) != 1:
            report.setdefault("historical_unmatched", []).append(
                {"match": e["match"], "hits": len(hits)})
            continue
        t = hits[0]
        if e.get("prior_verdict"):
            t.setdefault("provenance_history", []).append({
                "verdict": e.get("provenance_status"),
                "stage": e.get("verdict_stage", "Stage 2 census"),
                "evidence_location": e.get("evidence_location"),
                "note": e.get("notes"),
                "superseded_by": t.get("provenance_status"),
            })
            report.setdefault("prior_verdicts_recorded", []).append(t["id"])
            continue
        if t.get("provenance_status") and e.get("provenance_status") \
                and t["provenance_status"] != e["provenance_status"]:
            report["conflicts"].append({"id": t["id"], "existing": t["provenance_status"],
                                        "incoming": e["provenance_status"], "layer": "historical"})
            continue
        for k, v in e.items():
            if k in ALLOWED and v is not None:
                t[k] = v
        if e.get("provenance_status"):
            t["provenance_review_state"] = "migrated"
        if e.get("rights_status"):
            t["rights_review_state"] = "migrated"
        report.setdefault("historical_migrated", []).append(t["id"])

    data["historical_records"] = tombs
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
