#!/usr/bin/env python3
"""Reconstruct the bibliography candidate set from the SURVIVING source register.

GOVERNING RULE: the bibliography is reconstructed from the manuscript's FINAL source
relationships. It is not an archive of everything the book once cited - the historical
register already preserves that archive.

Historical records inform WHY an entry disappeared. They never survive into the
bibliography by inheritance.

This script never writes to the manuscript. It emits a reconciliation report only.
"""
import json, re, unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
MS = HERE.parent / "ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md"
REG = json.loads((HERE / "register.json").read_text())
OUT = HERE.parent / "BIBLIOGRAPHY_RECONCILIATION.md"


def norm(t):
    """Fold diacritics AWAY, do not turn them into word breaks.

    Replacing a combining mark with a space splits Chodron into "cho dro n" and
    silently reports a present entry as MISSING - the exact failure this
    reconciliation exists to catch, reproduced inside the tool that catches it.
    """
    t = unicodedata.normalize("NFKD", t or "")
    t = "".join(c for c in t if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9 ]", " ", t.lower())


def surname(name):
    """Last token of the first comma-free chunk - good enough to match a bib line."""
    if not name:
        return ""
    n = re.split(r"[,(]", name)[0].strip()
    n = re.sub(r"\b(trans|translated|by|the|as rendered)\b.*", "", n, flags=re.I).strip()
    return n.split()[-1] if n else ""


def load_bibliography():
    """(chapter, raw line) for every entry under the Bibliography heading."""
    lines = MS.read_text().split("\n")
    i = next(i for i, l in enumerate(lines) if l.strip() == "# Bibliography")
    chapter, entries = None, []
    for l in lines[i + 1:]:
        if l.startswith("#"):
            chapter = l.lstrip("#").strip()
        elif l.startswith("- "):
            entries.append((chapter, l[2:].strip()))
    return entries


def source_objects():
    """Active records that still create a source relationship in the manuscript."""
    out = []
    for r in REG["records"]:
        if r.get("object_class") in ("AUTHORIAL_VOICED_SPEECH",):
            continue
        if r.get("provenance_status") in ("not_a_provenance_object", "personal_communication"):
            continue
        who = r.get("actual_author") or r.get("attributed_as")
        if not who:
            continue
        out.append(r)
    return out


def main():
    bib = load_bibliography()
    recs = source_objects()
    rows, seen = [], {}
    for r in recs:
        who = r.get("actual_author") or r.get("attributed_as")
        sn = surname(who)
        hits = [(c, e) for c, e in bib if sn and norm(sn) in norm(e)]
        flag = r.get("bibliography_relationship") or ""
        if not hits:
            cls = "MISSING"
        elif re.search(r"wrong (source|work|book)|WRONG TRANSLATOR", flag, re.I):
            cls = "WRONG WORK / WRONG TRANSLATOR"
        elif re.search(r"correct", flag, re.I):
            cls = "CORRECT (verify)"
        elif flag:
            cls = "FLAGGED"
        else:
            cls = "PRESENT, unverified"
        rows.append({"id": r["id"], "who": who, "surname": sn, "class": cls,
                     "flag": flag, "chapter": (r.get("chapter") or "")[:26],
                     "work": r.get("work"), "trans": r.get("translator_or_mediator"),
                     "rights": r.get("rights_status"),
                     "entries": [f"{c}: {e}" for c, e in hits]})
        for c, e in hits:
            seen.setdefault(e, []).append(r["id"])

    # Reverse reconciliation: entries pointing at nothing the manuscript still uses.
    tomb = {}
    for h in REG["historical_records"]:
        who = h.get("actual_author") or h.get("attributed_as")
        sn = surname(who)
        if sn:
            tomb.setdefault(norm(sn), []).append(h)
    orphans = []
    for c, e in bib:
        if e in seen:
            continue
        why = ""
        for sn, hs in tomb.items():
            if sn and sn in norm(e):
                h = hs[0]
                why = f"source relationship removed at {h.get('removed_at_stage')} ({h.get('record_state')})"
                break
        orphans.append((c, e, why))

    L = ["# Bibliography reconciliation",
         "",
         "> **The bibliography is reconstructed from the manuscript's final source relationships.",
         "> It is not an archive of everything the book once cited — the historical register",
         "> already preserves that archive.**",
         "",
         "Generated from the surviving register by `quotation-register/build_bibliography.py`.",
         "The existing bibliography is used as EVIDENCE, never as the base.",
         "",
         f"- active source objects requiring an entry: **{len(rows)}**",
         f"- existing bibliography entries: **{len(bib)}**",
         f"- existing entries matched by a surviving source object: **{len(seen)}**",
         f"- existing entries matched by nothing surviving: **{len(orphans)}**",
         "",
         "## 1 · Candidate set from surviving source objects",
         ""]
    order = ["MISSING", "WRONG WORK / WRONG TRANSLATOR", "FLAGGED", "PRESENT, unverified", "CORRECT (verify)"]
    for cls in order:
        group = [r for r in rows if r["class"] == cls]
        if not group:
            continue
        L += [f"### {cls} — {len(group)}", ""]
        for r in sorted(group, key=lambda x: x["chapter"]):
            L.append(f"**{r['id']}** · {r['who']} · _{r['chapter']}_")
            if r["work"]:
                L.append(f"  - work: {r['work']}")
            if r["trans"]:
                L.append(f"  - translator/mediator: {r['trans']}")
            if r["flag"]:
                L.append(f"  - register flag: {r['flag']}")
            for e in r["entries"]:
                L.append(f"  - existing entry — {e}")
            L.append("")
    L += ["## 2 · Reverse reconciliation — entries matched by nothing surviving", "",
          "Each must be justified as a non-quotation source the manuscript still relies on",
          "(Stage 3b dependency, lineage reference, further reading) or removed.", ""]
    for c, e, why in orphans:
        L.append(f"- _{c}_ — {e}" + (f"  \n  → {why}" if why else ""))
    OUT.write_text("\n".join(L) + "\n")
    print(f"{len(rows)} source objects · {len(bib)} existing entries · "
          f"{len(orphans)} unmatched entries → {OUT.name}")


if __name__ == "__main__":
    main()
