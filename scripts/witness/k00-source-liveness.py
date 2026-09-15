#!/usr/bin/env python3
"""k00-source-liveness.py — SID ENTRY observer-liveness verifier (evidence-only; design §5.3; founder ruling 2026-09-15).

Reads kernel00-*.jsonl journals and answers ONE validity question per journal: was the SOURCE-ID-02
in-process observer demonstrably running during the hold?  It counts `input_source_sample` records whose
`frames` value is a non-negative integer >= 1, and reports the per-record `frameReset` counter (0 / non-0).
It reads nothing else from those records and never decides an ENTRY class; UNPERTURBED / PERTURBED /
INDETERMINATE and the Fisher comparison are applied at [G] from the entry ledger, not here.

    python3 scripts/witness/k00-source-liveness.py --selftest
    python3 scripts/witness/k00-source-liveness.py <journal.jsonl> [...]

Output (TSV, one row per journal, header first):
    journal  source_sample_records  frames_present_records  frameReset_nonzero_records  frameReset_zero_records  resets_total  liveness
LIVE     frames_present_records >= LIVE_MIN (10)
DORMANT  frames_present_records <  LIVE_MIN
"""
import json, os, sys

LIVE_MIN = 10
EVENT = "input_source_sample"
KEY_FRAMES = "frames"
KEY_RESET = "frameReset"


def _int_or_none(v):
    if isinstance(v, bool):
        return None
    if isinstance(v, int):
        return v
    if isinstance(v, str) and v.strip().lstrip("-").isdigit():
        return int(v.strip())
    return None


def read_journal(path):
    n = present = nz = z = resets = 0
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except ValueError:
                continue
            if not isinstance(rec, dict) or rec.get("event") != EVENT:
                continue
            n += 1
            ev = rec.get("evidence")
            ev = ev if isinstance(ev, dict) else {}
            f = _int_or_none(ev.get(KEY_FRAMES))
            if f is not None and f >= 1:
                present += 1
            r = _int_or_none(ev.get(KEY_RESET))
            if r is not None and r != 0:
                nz += 1
                resets += abs(r)
            elif r == 0:
                z += 1
    return {"journal": os.path.basename(path), "source_sample_records": n, "frames_present_records": present,
            "frameReset_nonzero_records": nz, "frameReset_zero_records": z, "resets_total": resets,
            "liveness": "LIVE" if present >= LIVE_MIN else "DORMANT"}


COLS = ["journal", "source_sample_records", "frames_present_records", "frameReset_nonzero_records",
        "frameReset_zero_records", "resets_total", "liveness"]


def emit(rows, out=sys.stdout):
    out.write("\t".join(COLS) + "\n")
    for r in rows:
        out.write("\t".join(str(r[c]) for c in COLS) + "\n")


# --- self-test: synthetic journals live in scripts/witness/fixtures/k00-source-liveness-selftest/ ------------------
# (the fixture files carry every distractor key a real record carries; this source names none of them)
EXPECT = {
    "live10.jsonl":       (10, 10, 0, 10, 0, "LIVE"),
    "dormant9.jsonl":     (9, 9, 0, 9, 0, "DORMANT"),
    "frames0.jsonl":      (12, 0, 0, 12, 0, "DORMANT"),
    "badframes.jsonl":    (13, 10, 0, 13, 0, "LIVE"),
    "mixedreset.jsonl":   (11, 11, 3, 8, 6, "LIVE"),
    "unrelated.jsonl":    (10, 10, 0, 10, 0, "LIVE"),
    "distractors.jsonl":  (10, 10, 0, 10, 0, "LIVE"),
    "boundary9plus.jsonl": (12, 9, 1, 11, 4, "DORMANT"),
}


def selftest():
    d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures", "k00-source-liveness-selftest")
    fails = 0
    for name, (n, present, nz, z, resets, live) in sorted(EXPECT.items()):
        r = read_journal(os.path.join(d, name))
        got = (r["source_sample_records"], r["frames_present_records"], r["frameReset_nonzero_records"],
               r["frameReset_zero_records"], r["resets_total"], r["liveness"])
        ok = got == (n, present, nz, z, resets, live)
        fails += 0 if ok else 1
        print(f"{'ok ' if ok else 'FAIL'} {name}: got {got} expected {(n, present, nz, z, resets, live)}")
    # distractor invariance: live10 and distractors differ only in keys this verifier never reads → identical rows
    a = read_journal(os.path.join(d, "live10.jsonl")); b = read_journal(os.path.join(d, "distractors.jsonl"))
    same = all(a[c] == b[c] for c in COLS if c != "journal")
    fails += 0 if same else 1
    print(f"{'ok ' if same else 'FAIL'} distractor-invariance: live10 == distractors on every column")
    print(f"selftest {len(EXPECT) + 1 - fails}/{len(EXPECT) + 1}")
    return 0 if fails == 0 else 1


if __name__ == "__main__":
    if len(sys.argv) >= 2 and sys.argv[1] == "--selftest":
        sys.exit(selftest())
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(2)
    emit([read_journal(p) for p in sys.argv[1:]])
