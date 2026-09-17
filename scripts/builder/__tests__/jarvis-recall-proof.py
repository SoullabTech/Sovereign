#!/usr/bin/env python3
import importlib.util
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
MOD = ROOT / "scripts/builder/jarvis-recall.py"
spec = importlib.util.spec_from_file_location("recall", MOD)
R = importlib.util.module_from_spec(spec)
spec.loader.exec_module(R)


def run(repo, *args):
    return subprocess.check_output(
        ["git", "-C", str(repo), *args], text=True
    ).strip()


def check(name, cond):
    if not cond:
        raise AssertionError(name)
    print("PASS", name)


with tempfile.TemporaryDirectory(prefix="jarvis-recall-proof-") as td:
    repo = Path(td)
    run(repo, "init", "-q")
    run(repo, "config", "user.email", "proof@localhost")
    run(repo, "config", "user.name", "JARVIS Proof")
    (repo / "README.md").write_text("proof\n")
    run(repo, "add", ".")
    run(repo, "commit", "-qm", "base")
    base = run(repo, "branch", "--show-current")

    run(repo, "checkout", "-qb", "feature/voice-acoustic-turn-projection-20260916")
    voice = repo / "docs/programme/VOICE-2026"
    voice.mkdir(parents=True)
    (voice / "TURN-03_ACOUSTIC_TURN_PROJECTION_CHARTER_2026-09-16.md").write_text(
        "# TURN-03 Acoustic Turn Projection\n"
        "**State:** OPEN · SHADOW ONLY · NO LIVE TURN AUTHORITY\n"
        "Investigate acoustic continuation intent.\n"
    )
    (voice / "TURN-03_A3_CONTROL_2026-09-16.md").write_text(
        "# TURN-03 A3 Control\n"
        "**State:** COMPLETE · A3 REMAINS OPEN\n"
        "Acoustic turn projection control.\n"
    )
    (voice / "TURN-03_A4_INSTRUMENTATION_SEAL_2026-09-16.md").write_text(
        "# TURN-03 A4 Instrumentation Seal\n"
        "**State:** SEALED · NOT EXECUTED · NO LIVE TURN AUTHORITY\n"
        "Acoustic turn projection instrumentation.\n"
    )
    run(repo, "add", ".")
    run(repo, "commit", "-qm", "turn-03 records")
    run(repo, "checkout", "-q", base)

    records = R.branch_search(repo, "TURN-03 Acoustic Turn Projection", 6)
    check("lane charter ranks first", records[0]["record_type"] == "CHARTER")
    check("A4 programme record is retrieved", any(r.get("stage") == "A4" for r in records))

    summary = R.summarize_branch(records)
    check("summary computes highest stage mechanically", summary["highest_stage"] == "A4")
    check(
        "summary preserves A4 declared state",
        summary["highest_stage_states"] == ["SEALED · NOT EXECUTED · NO LIVE TURN AUTHORITY"],
    )
    check(
        "charter standing remains separate",
        summary["charter_state"] == "OPEN · SHADOW ONLY · NO LIVE TURN AUTHORITY",
    )
    check(
        "branch authority remains noncanonical",
        summary["authority"] == "BRANCH_RECORD_NONCANONICAL",
    )
    check(
        "every retrieved branch record is LOCAL_ONLY",
        all(r["sensitivity"] == "LOCAL_ONLY" and r["external_eligible"] == 0 for r in records),
    )

    data = {"branch_summary": summary, "branch_records": records, "history": []}
    try:
        R.emit_bundle(data, 4000, "external")
    except SystemExit as e:
        check("external bundle fails closed", "REFUSED" in str(e))
    else:
        raise AssertionError("external bundle must refuse LOCAL_ONLY branch records")

print("PASS recall proof complete")
