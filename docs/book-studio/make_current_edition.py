#!/usr/bin/env python3
"""Derive the CURRENT-EDITION file from the SECOND-EDITION canonical manuscript.

TWO FILES, ONE SOURCE OF TRUTH. Editorial work continues in the canonical
manuscript; this script re-derives the current-edition upload from it, so the two
cannot drift. Never hand-edit the generated file.

WHAT DIFFERS, AND ONLY THIS:
  - the edition statement reverts to the currently published edition
  - the ISBNs are the live product's, unlabelled, because in that file they are
    simply the book's identifiers
  - no Second Edition designation, and no foreword

Everything else - every correction, reclaim, repair and the new Four Grades of
Fire - is identical, because that is the point: current buyers receive the best
manuscript we have while the Second Edition is finished.

The failure this prevents: shipping "Second Soullab Press Edition" over
first-edition ISBNs into the live product, which is exactly the metadata
contradiction this project exists to eliminate.
"""
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "ELEMENTAL_ALCHEMY_FROM_ORIGINAL_FULL.md"
OUT = HERE / "ELEMENTAL_ALCHEMY_CURRENT_EDITION.md"

SECOND = """ISBN 979-8-9967127-0-0 (paperback, first edition)\\
ISBN 979-8-9967127-2-4 (hardcover, first edition)

Second Soullab Press Edition"""

CURRENT = """ISBN 979-8-9967127-0-0 (paperback)\\
ISBN 979-8-9967127-2-4 (hardcover)

First Soullab Press Edition"""


def main():
    t = SRC.read_text()
    if SECOND not in t:
        raise SystemExit("edition block not found in the canonical manuscript - "
                         "the front matter changed and this script must be updated "
                         "rather than silently producing a wrong file")
    OUT.write_text(t.replace(SECOND, CURRENT))
    print(f"derived {OUT.name} from {SRC.name}")
    print("  edition statement : First Soullab Press Edition")
    print("  identifiers       : the live product's, unlabelled")
    print("  foreword          : none")
    print(f"  words             : {len(OUT.read_text().split()):,}")


if __name__ == "__main__":
    main()
