#!/usr/bin/env python3
"""Evidence-only reader for SOURCE LEVEL-CALIBRATION-01.

Reads SID journals at rest and applies the existing SOURCE-ID validity law:
  V1: B997 >= 10 * C_base (20 dB) with >=2 visible healthy windows
  V2: median baseline m2_997 >= 0.9

Calibration selection adds one prospective operating-margin rule only:
  20*log10(B997/C_base) >= 26 dB in every row.

The 26 dB selection rule does NOT change k00-source-ledger.py and cannot
reinterpret historical SOURCE-03 rows.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import statistics
import sys
import tempfile

RATE = 48_000.0
FRAME_FRAMES = 1_920.0
VIS = 10.0
M2 = 0.9
MIN_FRAMES = 20
SELECTION_DB = 26.0


def fnum(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def load(path: str):
    rows = []
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def paired_windows(rows):
    result = []
    for i, row in enumerate(rows):
        if row.get("event") != "input_source_sample":
            continue
        ev = row.get("evidence") if isinstance(row.get("evidence"), dict) else {}
        twin = None
        for j in range(i - 1, max(-1, i - 4), -1):
            h = rows[j]
            hev = h.get("evidence") if isinstance(h.get("evidence"), dict) else {}
            if (
                h.get("event") == "input_health_sample"
                and h.get("generation") == row.get("generation")
                and hev.get("windowMs") == ev.get("windowMs")
            ):
                twin = hev
                break
        result.append({"source": ev, "health": twin or {}})
    return result


def read_journal(path: str) -> dict:
    rows = load(path)
    session = rows[0].get("session", "-") if rows else "-"
    windows = paired_windows(rows)
    if not windows:
        return {
            "journal": os.path.basename(path),
            "session": session,
            "readable": False,
            "reason": "no_source_evidence",
        }

    geometry_ok = True
    healthy = []
    for w in windows:
        src, health = w["source"], w["health"]
        rate = fnum(src.get("analysisRateHz"))
        frame_frames = fnum(src.get("frameFrames"))
        if rate != RATE or frame_frames != FRAME_FRAMES:
            geometry_ok = False
            continue
        if (
            health.get("inputFlow") == "healthy"
            and (fnum(src.get("frames")) or 0) >= MIN_FRAMES
        ):
            healthy.append(w)

    if not geometry_ok:
        return {
            "journal": os.path.basename(path),
            "session": session,
            "readable": False,
            "reason": "geometry_mismatch",
        }
    if len(healthy) < 2:
        return {
            "journal": os.path.basename(path),
            "session": session,
            "readable": False,
            "reason": "insufficient_healthy_windows",
            "healthyWindows": len(healthy),
        }

    def median(key):
        vals = [fnum(w["source"].get(key)) for w in healthy]
        vals = [v for v in vals if v is not None]
        return statistics.median(vals) if vals else None

    b997 = median("e997Mean")
    b700 = median("e700Mean")
    b1200 = median("e1200Mean")
    bm2 = median("m2_997")
    c_base = max(b700 or 0.0, b1200 or 0.0)

    visible = 0
    for w in healthy:
        src = w["source"]
        e997 = fnum(src.get("e997Mean")) or 0.0
        control = max(
            fnum(src.get("e700Mean")) or 0.0,
            fnum(src.get("e1200Mean")) or 0.0,
        )
        if e997 >= VIS * control:
            visible += 1

    v1 = (
        visible >= 2
        and b997 is not None
        and b997 >= VIS * c_base
    )
    v2 = bm2 is not None and bm2 >= M2
    ratio_db = None
    if b997 is not None and b997 > 0 and c_base > 0:
        ratio_db = 20.0 * math.log10(b997 / c_base)

    selection_pass = bool(
        v1
        and v2
        and ratio_db is not None
        and ratio_db >= SELECTION_DB
    )

    return {
        "journal": os.path.basename(path),
        "session": session,
        "readable": True,
        "healthyWindows": len(healthy),
        "visibleWindows": visible,
        "B997": b997,
        "C_base": c_base,
        "baselineM2_997": bm2,
        "ratioDb": ratio_db,
        "V1": v1,
        "V2": v2,
        "selectionDb": SELECTION_DB,
        "calibrationPass": selection_pass,
    }


def population(files, label: str) -> dict:
    rows = [read_journal(p) for p in files]
    readable = all(r.get("readable") for r in rows)
    all_pass = readable and bool(rows) and all(r.get("calibrationPass") for r in rows)
    dbs = [r["ratioDb"] for r in rows if r.get("ratioDb") is not None]
    return {
        "label": label,
        "rowCount": len(rows),
        "readableRows": sum(1 for r in rows if r.get("readable")),
        "passingRows": sum(1 for r in rows if r.get("calibrationPass")),
        "selectionDb": SELECTION_DB,
        "medianDb": statistics.median(dbs) if dbs else None,
        "populationPass": all_pass,
        "rows": rows,
    }


def vp_compare(vp_on: dict, vp_off: dict) -> dict:
    on = vp_on.get("medianDb")
    off = vp_off.get("medianDb")
    if on is None or off is None:
        return {"deltaDb": None, "characterization": "MIXED_OR_INDETERMINATE"}
    delta = off - on
    if delta >= 6.0:
        label = "VP_ATTENUATION_MATERIAL"
    elif delta < 3.0:
        label = "VP_EFFECT_SMALL_AT_CALIBRATION_LEVEL"
    else:
        label = "MIXED_OR_INDETERMINATE"
    return {"deltaDb": delta, "characterization": label}


def synthetic_journal(path: str, ratio: float, m2: float = 1.1) -> None:
    rows = []
    seq = 0
    t = 1000
    for _ in range(4):
        seq += 1
        t += 1000
        rows.append({
            "seq": seq,
            "session": "cal-selftest",
            "generation": 1,
            "event": "input_health_sample",
            "timeMonotonicMs": t,
            "evidence": {"windowMs": "1000", "callbacks": "100", "inputFlow": "healthy", "ioRunning": "true"},
        })
        seq += 1
        control = 1e-4
        rows.append({
            "seq": seq,
            "session": "cal-selftest",
            "generation": 1,
            "event": "input_source_sample",
            "timeMonotonicMs": t,
            "evidence": {
                "windowMs": "1000",
                "frames": "25",
                "frameReset": "0",
                "frameFrames": "1920",
                "analysisRateHz": "48000",
                "e700Mean": str(control),
                "e1200Mean": str(control),
                "e997Mean": str(control * ratio),
                "m2_997": str(m2),
            },
        })
    with open(path, "w", encoding="utf-8") as fh:
        for row in rows:
            fh.write(json.dumps(row) + "\n")


def selftest() -> bool:
    with tempfile.TemporaryDirectory() as td:
        good = []
        weak = []
        for i in range(5):
            g = os.path.join(td, f"good-{i}.jsonl")
            w = os.path.join(td, f"weak-{i}.jsonl")
            synthetic_journal(g, ratio=20.0)  # 26.02 dB
            synthetic_journal(w, ratio=5.0)   # 13.98 dB, fails frozen V1
            good.append(g)
            weak.append(w)
        p_good = population(good, "Lx")
        p_weak = population(weak, "Lx")
        off = population(good[:3], "VP-OFF")
        cmp_small = vp_compare(p_good, off)
        checks = [
            ("five 26 dB rows pass", p_good["populationPass"] and p_good["passingRows"] == 5),
            ("weak V1 population fails", not p_weak["populationPass"]),
            ("VP compare remains characterization", cmp_small["characterization"] == "VP_EFFECT_SMALL_AT_CALIBRATION_LEVEL"),
        ]
        for name, ok in checks:
            print(("ok " if ok else "FAIL ") + name)
        print(f"selftest: {sum(ok for _, ok in checks)}/{len(checks)}")
        return all(ok for _, ok in checks)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--label", default="CAL")
    ap.add_argument("--json-out")
    ap.add_argument("--compare-vp-on")
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("journals", nargs="*")
    args = ap.parse_args()

    if args.selftest:
        return 0 if selftest() else 1
    if not args.journals:
        ap.error("provide one or more journals")

    result = population(args.journals, args.label)
    if args.compare_vp_on:
        with open(args.compare_vp_on, "r", encoding="utf-8") as fh:
            prior = json.load(fh)
        result["vpComparison"] = vp_compare(prior, result)

    text = json.dumps(result, indent=2, sort_keys=True)
    print(text)
    if args.json_out:
        with open(args.json_out, "w", encoding="utf-8") as fh:
            fh.write(text + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
