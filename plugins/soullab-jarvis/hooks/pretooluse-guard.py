#!/usr/bin/env python3
"""JARVIS PreToolUse guard — executable governance, not prose.

Two jobs:

  1. IMAGE ISOLATION (audit §6/T3, ranked move #1, ~121,000 tok/session measured).
     Image-producing verification is ~70% of per-session tool inflow. One iOS
     simulator call averages 30,374 tokens — 37% of the whole startup floor.
     CLAUDE.md already says "verification that produces images -> subagent-first".
     That rule was written and not enforced (audit Finding 2.2). This is the
     enforcement seam, not a new rule.

  2. NAMED-TRAP DENIALS. Four things CLAUDE.md already forbids in prose, made
     mechanical. Each denial cites the line it enforces.

SECURITY BOUNDARY: this is workflow enforcement, NOT the security boundary. It runs
in the same trust domain as what it governs and is defeated by one env var. The real
controls live elsewhere: flock on .deploy.lock, the Dockerfile deploy-lane tripwire,
check:no-supabase in pre-commit, and remote branch protection. This hook makes those
prohibitions fail early and legibly; it does not replace them. See README.md.

Fail-open by construction: any parse error, missing field, or unreadable file
exits 0 silently. A broken guard must never wedge a session.

Escape hatches (deliberate, loud, one session at a time):
  JARVIS_IMAGE_ISOLATION=off|warn|deny   (default: deny)
  JARVIS_TRAP_GUARD=off|warn|deny        (default: deny)
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def out(decision: str, reason: str) -> None:
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": decision,
        "permissionDecisionReason": reason,
    }}))
    sys.exit(0)


def load_image_patterns():
    path = os.path.join(HERE, "image-tools.txt")
    try:
        with open(path, encoding="utf-8") as fh:
            return [ln.strip().lower() for ln in fh
                    if ln.strip() and not ln.lstrip().startswith("#")]
    except OSError:
        return []


def in_subagent(transcript_path: str) -> bool:
    """Heuristic: subagent turns are recorded as sidechain entries.

    If we cannot tell, return True (allow) — the guard exists to change the
    default path in the main loop, not to be undefeatable.
    """
    if not transcript_path or not os.path.isfile(transcript_path):
        return True
    try:
        with open(transcript_path, "rb") as fh:
            fh.seek(0, os.SEEK_END)
            size = fh.tell()
            fh.seek(max(0, size - 262144))
            tail = fh.read().decode("utf-8", "replace").splitlines()
        for line in reversed(tail):
            line = line.strip()
            if not line.startswith("{"):
                continue
            try:
                rec = json.loads(line)
            except ValueError:
                continue
            if "isSidechain" in rec:
                return bool(rec["isSidechain"])
        return False
    except OSError:
        return True


# --- named traps, each pinned to the CLAUDE.md line it enforces -------------
TRAPS = [
    (
        re.compile(r"\brm\b[^;|&]*\.deploy\.lock"),
        "Deleting the deploy lockfile is forbidden: it detaches the kernel flock from "
        "future acquirers and re-opens the 2026-07-09 concurrent-deploy race. "
        "Inspect the live holder instead: fuser -v ~/MAIA-SOVEREIGN/.deploy.lock",
    ),
    (
        re.compile(r"docker[-\s]compose[^;|&]*docker-compose\.production\.yml"),
        "Direct compose against docker-compose.production.yml is retired STRUCTURALLY "
        "(the Dockerfile deploy-lane tripwire will refuse the build anyway): it bakes "
        "GIT_COMMIT=unknown, bypasses the deploy-lane lock, and skips rollback tagging. "
        "Use: scripts/pre-deploy-gate.sh deploy-maia <SHA>  (or scripts/deploy-production.sh deploy <SHA>).",
    ),
    (
        re.compile(r"\b(npm|pnpm|yarn|bun)\b[^;|&]*\b(install|add|i)\b[^;|&]*@supabase"),
        "Supabase is a project invariant violation. This project uses self-hosted "
        "PostgreSQL via lib/db/postgres.ts only. If you see Supabase in code, remove it.",
    ),
    (
        re.compile(
            r"git\s+push\b[^;|&]*(--force\b|--force-with-lease\b|\s-f\b)[^;|&]*"
            r"\b(main|master|clean-main-no-secrets)\b"
        ),
        "Force-push to a protected branch (main / master / clean-main-no-secrets) is denied. "
        "Push to your designated feature branch with: git push -u origin <branch>",
    ),
    (
        re.compile(r"\brm\s+-[a-z]*r[a-z]*f?\s+(/|~|\$HOME)(\s|$)"),
        "Recursive delete of / or $HOME is denied.",
    ),
]


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    tool = str(payload.get("tool_name") or "")
    tool_input = payload.get("tool_input") or {}
    if not isinstance(tool_input, dict):
        tool_input = {}

    # --- 1. image isolation -------------------------------------------------
    mode = (os.environ.get("JARVIS_IMAGE_ISOLATION") or "deny").lower()
    if mode != "off" and tool:
        low = tool.lower()
        hit = next((p for p in load_image_patterns() if p in low), None)
        if hit and not in_subagent(str(payload.get("transcript_path") or "")):
            msg = (
                f"[JARVIS/T3] '{tool}' produces images or bulk media and is denied in the "
                "main loop. Measured: image-producing verification is ~70% of per-session "
                "tool inflow (~121k tok/session); a single simulator call averages ~30k tokens.\n"
                "Run it inside a subagent (Agent tool) and have the subagent return findings "
                "(<=500 tokens), never pixels. This enforces the rule CLAUDE.md already "
                "carries: 'verification that produces images -> subagent-first; isolation is "
                "the only compression.'\n"
                "Deliberate override for one session: JARVIS_IMAGE_ISOLATION=off"
            )
            if mode == "warn":
                sys.stderr.write(msg + "\n")
            else:
                out("deny", msg)

    # --- 2. named traps -----------------------------------------------------
    tmode = (os.environ.get("JARVIS_TRAP_GUARD") or "deny").lower()
    if tmode != "off" and tool == "Bash":
        cmd = str(tool_input.get("command") or "")
        for pattern, reason in TRAPS:
            if pattern.search(cmd):
                if pattern.pattern.startswith("docker") and re.search(
                    r"pre-deploy-gate\.sh|deploy-production\.sh|deploy-lock\.sh", cmd
                ):
                    continue  # the sanctioned lanes wrap compose themselves
                msg = f"[JARVIS/trap] {reason}\nOverride for one session: JARVIS_TRAP_GUARD=off"
                if tmode == "warn":
                    sys.stderr.write(msg + "\n")
                    break
                out("deny", msg)

    sys.exit(0)


if __name__ == "__main__":
    main()
