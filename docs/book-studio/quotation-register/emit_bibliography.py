#!/usr/bin/env python3
"""Emit ONE alphabetical bibliography from the surviving source relationships.

NOT YET RUNNABLE. It requires bibliography_decisions.json - a HAND-AUTHORED map from
each surviving source object to its entry - which is deliberately not generated. The
surname matcher may only PROPOSE and FLAG; it may never decide an entry. It has already
been caught attaching St. John of the Cross to William James and Richard Feynman by
matching the token "of", which is the failure this reconciliation exists to catch,
committed inside the tool built to catch it.

Chapter grouping is abandoned: it made a source look missing when it was listed
under another chapter (Jung, Tolle), produced duplicate entries for one author,
and encouraged chapter-local reasoning about book-level source relationships.
Where a source is used belongs in the semantic record; source identity belongs
in one list.

Entries come from three places, all of them live relationships:
  1. surviving quotation source objects in the register
  2. non-quotation dependencies the manuscript explicitly names
  3. explicit corrections that supersede whatever the old bibliography said
Anything else is dropped. The historical register holds the archive.
"""
import json, re, unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
MS = HERE.parent / "ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md"
REG = json.loads((HERE / "register.json").read_text())
DEC = json.loads((HERE / "bibliography_decisions.json").read_text())


def norm(t):
    t = unicodedata.normalize("NFKD", t or "")
    t = "".join(c for c in t if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9 ]", " ", t.lower())


def sortkey(entry):
    return norm(re.sub(r"^\*", "", entry)).strip()


def existing():
    lines = MS.read_text().split("\n")
    i = next(i for i, l in enumerate(lines) if l.strip() == "# Bibliography")
    return [l[2:].strip() for l in lines[i + 1:] if l.startswith("- ")]


def main():
    keep = set(DEC["carry_forward"])
    have = existing()
    entries = [e for e in have if e in keep]
    missing_carry = [e for e in keep if e not in have]
    entries += DEC["new_entries"]
    entries = sorted(set(entries), key=sortkey)

    out = ["# Bibliography", "",
           "Sources the book quotes, draws a concept from, or names as part of its "
           "intellectual lineage. Where each is used is recorded in the manuscript itself.",
           ""]
    out += [f"- {e}" for e in entries]
    owed = DEC["owed"]
    if owed:
        out += ["", "<!-- BIBLIOGRAPHY OBLIGATIONS - not for print",
                "     Each names a live source relationship whose citable object cannot yet be",
                "     written. None may be invented; each is resolved before publication."]
        out += [f"     - {o}" for o in owed]
        out += ["-->"]

    lines = MS.read_text().split("\n")
    i = next(i for i, l in enumerate(lines) if l.strip() == "# Bibliography")
    MS.write_text("\n".join(lines[:i] + out) + "\n")
    print(f"carried forward {len([e for e in entries if e in have])} · "
          f"new {len(DEC['new_entries'])} · dropped {len(have) - len([e for e in entries if e in have])} · "
          f"total {len(entries)} · obligations {len(owed)}")
    if missing_carry:
        print("WARNING - carry_forward entries not found verbatim:", missing_carry)


if __name__ == "__main__":
    main()
