#!/usr/bin/env python3
"""JARVIS Stop hook — produce the close-out evidence instead of demanding it.

Deliberately NON-BLOCKING. A Stop hook that blocks can loop, and a governance
layer whose failure mode is "the session cannot end" is worse than the prose it
replaces. So this hook does not judge whether the work was finished; it emits
the evidence a reader needs to judge for themselves:

    changed paths (staged + unstaged + untracked, capped)
    branch / HEAD
    the close-out checklist

Fires at most once per session (stamp under .jarvis/run/), so a multi-turn
session is not narrated repeatedly. Fail-open on every error path.
"""
import json
import os
import subprocess
import sys

CAP = 25


def git(args, cwd):
    try:
        return subprocess.run(["git"] + args, cwd=cwd, capture_output=True,
                              text=True, timeout=10).stdout.strip()
    except Exception:
        return ""


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    if payload.get("stop_hook_active"):
        sys.exit(0)

    cwd = payload.get("cwd") or os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    root = git(["rev-parse", "--show-toplevel"], cwd)
    if not root:
        sys.exit(0)

    session = str(payload.get("session_id") or "nosession").replace("/", "_")[:64]
    stamp_dir = os.path.join(root, ".jarvis", "run")
    stamp = os.path.join(stamp_dir, f"closeout-{session}")
    try:
        os.makedirs(stamp_dir, exist_ok=True)
        if os.path.exists(stamp):
            sys.exit(0)
        with open(stamp, "w", encoding="utf-8") as fh:
            fh.write("emitted\n")
    except OSError:
        pass  # stamping is best-effort; never block on it

    status = [ln for ln in git(["status", "--porcelain"], cwd).splitlines() if ln.strip()]
    branch = git(["rev-parse", "--abbrev-ref", "HEAD"], cwd)
    head = git(["rev-parse", "--short", "HEAD"], cwd)

    lines = ["JARVIS CLOSE-OUT", f"  branch: {branch}    HEAD: {head}"]
    if status:
        lines.append(f"  changed paths ({len(status)}):")
        for ln in status[:CAP]:
            lines.append(f"    {ln}")
        if len(status) > CAP:
            lines.append(f"    ... and {len(status) - CAP} more")
    else:
        lines.append("  changed paths: none (working tree clean)")
    lines += [
        "",
        "  Before reporting done, the report must carry:",
        "    result      - what is now true that was not true before",
        "    evidence    - the command run and its actual output, not a description of it",
        "    validation  - which gate was run (typecheck / preflight / smoke / colab gate)",
        "    status      - built | wired | surfacing | verified  (these are not synonyms)",
        "    next action - the single next thing, or 'none'",
    ]

    print(json.dumps({"systemMessage": "\n".join(lines)}))
    sys.exit(0)


if __name__ == "__main__":
    main()
