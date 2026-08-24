#!/usr/bin/env python3
"""Emit a frozen benchmark task text, byte-identically, every time.

The run sheet stores each task as a wrapped markdown blockquote, which is right for
reading and wrong for pasting: transcribing it by eye can hand arm A and arm B two
different strings, and PROTOCOL.md requires the task text to be identical across the
pair. This unwraps deterministically so both arms get the same bytes.

    emit-task.py T1              # the canonical single-line text
    emit-task.py T1 --sha        # its sha256, to record per arm
    emit-task.py T1 | pbcopy     # paste into the session
"""
import hashlib
import io
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SHEET = os.path.join(HERE, "RUN_SHEET_2026-08-24.md")


def canonical(tag):
    src = io.open(SHEET, encoding="utf-8").read()
    m = re.search(r"^### %s[^\n]*\n(.*?)^Referent check" % re.escape(tag), src, re.S | re.M)
    if not m:
        sys.exit("no frozen task %r in %s" % (tag, os.path.basename(SHEET)))
    quoted = [l[2:].strip() for l in m.group(1).splitlines() if l.startswith("> ")]
    if not quoted:
        sys.exit("task %r has no blockquote body -- the run sheet format changed" % tag)
    return re.sub(r"\s+", " ", " ".join(quoted)).strip()


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(2)
    text = canonical(args[0])
    if "--sha" in args:
        print(hashlib.sha256(text.encode("utf-8")).hexdigest())
    else:
        sys.stdout.write(text + "\n")


if __name__ == "__main__":
    main()
