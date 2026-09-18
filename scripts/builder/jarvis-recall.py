#!/usr/bin/env python3
"""Model-neutral JARVIS recall across local history and live git branch records."""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).resolve().parent
CONTINUITY = HERE / "jarvis-continuity.py"
DEFAULT_DB = Path.home() / ".jarvis/continuity/continuity.sqlite3"


def git(repo: Path, *args: str) -> str:
    return subprocess.check_output(
        ["git", "-C", str(repo), *args], text=True, stderr=subprocess.DEVNULL
    )


def candidate_refs(repo: Path, terms: list[str], recent_limit: int = 200) -> list[str]:
    raw = git(repo, "for-each-ref", "--sort=-committerdate",
              "--format=%(refname)", "refs/heads", "refs/remotes/origin")
    refs = [r.strip() for r in raw.splitlines()
            if r.strip() and not r.endswith("/HEAD")]
    recent = refs[:recent_limit]
    lower_terms = [t.lower() for t in terms]
    threshold = max(1, min(2, len(lower_terms)))
    named = []
    for ref in refs[recent_limit:]:
        low = ref.lower()
        if sum(1 for t in lower_terms if t in low) >= threshold:
            named.append(ref)
    # Recency makes routine recall bounded; identity matches ensure an older
    # descriptive lane branch is not hidden merely by branch volume.
    return list(dict.fromkeys(recent + named))


def query_terms(query: str) -> list[str]:
    seen, out = set(), []
    for term in re.findall(r"[A-Za-z0-9_]+", query):
        t = term.lower()
        if len(t) < 2 or t in seen:
            continue
        seen.add(t)
        out.append(term)
    return out[:8]


def grep_files(repo: Path, refs: list[str], term: str) -> set[tuple[str, str]]:
    if not refs:
        return set()
    try:
        raw = git(repo, "grep", "-l", "-i", "-F", "-e", term,
                  *refs, "--", "docs/programme")
    except subprocess.CalledProcessError:
        return set()
    found = set()
    for line in raw.splitlines():
        if ":" not in line:
            continue
        ref, rel = line.split(":", 1)
        found.add((ref, rel))
    return found


def best_line(text: str, terms: list[str]) -> tuple[int, str]:
    lines = text.splitlines()
    scored = []
    lower_terms = [t.lower() for t in terms]
    for i, line in enumerate(lines):
        low = line.lower()
        score = sum(1 for t in lower_terms if t in low)
        if score:
            scored.append((score, -i, i, line))
    if not scored:
        return 1, ""
    _, _, idx, _ = max(scored)
    start = max(0, idx - 8)
    end = min(len(lines), idx + 13)
    excerpt = "\n".join(f"{n + 1}: {lines[n]}" for n in range(start, end))
    return idx + 1, excerpt


def branch_search(repo: Path, query: str, limit: int = 6) -> list[dict]:
    terms = query_terms(query)
    if not terms:
        return []
    refs = candidate_refs(repo, terms)
    counts: dict[tuple[str, str], int] = defaultdict(int)
    for term in terms:
        for key in grep_files(repo, refs, term):
            counts[key] += 1

    lower_terms = [t.lower() for t in terms]

    def candidate_score(item):
        (ref, rel), matched = item
        rel_low = rel.lower()
        rel_upper = rel.upper()
        # Lane/file identity is stronger than incidental prose overlap. For a
        # named lane, orient from its charter, then prefer the highest-stage
        # programme records over older stages and raw JSON evidence.
        path_matches = sum(1 for t in lower_terms if t in rel_low)
        all_path_terms = int(path_matches == len(lower_terms))
        is_charter = int("CHARTER" in rel_upper and rel.endswith(".md"))
        is_record_doc = int(rel.endswith(".md") and "/evidence/" not in rel_low)
        stage_match = re.search(r"(?:^|[_/-])A(\d+)(?:[_/.-]|$)", rel_upper)
        stage = int(stage_match.group(1)) if stage_match else 0
        return (
            -all_path_terms,
            -path_matches,
            -is_charter,
            -is_record_doc,
            -stage,
            -matched,
            ref,
            rel,
        )

    candidates = sorted(counts.items(), key=candidate_score)
    results, seen_blobs = [], set()
    for (ref, rel), matched in candidates:
        path_matches = sum(1 for t in lower_terms if t in rel.lower())
        if matched < max(1, min(2, len(terms))) and path_matches < 2:
            continue
        try:
            blob = git(repo, "rev-parse", f"{ref}:{rel}").strip()
            if blob in seen_blobs:
                continue
            seen_blobs.add(blob)
            content = git(repo, "show", f"{ref}:{rel}")
            commit = git(repo, "rev-parse", ref).strip()
        except subprocess.CalledProcessError:
            continue
        line_no, excerpt = best_line(content, terms)
        if not excerpt:
            continue
        stage_match = re.search(r"(?:^|[_/-])A(\d+)(?:[_/.-]|$)", rel.upper())
        stage = f"A{stage_match.group(1)}" if stage_match else None
        record_type = "CHARTER" if "CHARTER" in rel.upper() else "PROGRAMME_RECORD"
        state_match = re.search(
            r"^\*\*(?:State|Status|Standing):\*\*\s*(.+?)\s*$",
            content, flags=re.IGNORECASE | re.MULTILINE,
        )
        declared_state = state_match.group(1).strip() if state_match else None
        results.append({
            "kind": "jarvis_branch_record",
            "authority": "BRANCH_RECORD_NONCANONICAL",
            "ref": ref,
            "git_sha": commit,
            "path": rel,
            "line_no": line_no,
            "stage": stage,
            "record_type": record_type,
            "declared_state": declared_state,
            "sensitivity": "LOCAL_ONLY",
            "external_eligible": 0,
            "matched_terms": matched,
            "text": excerpt,
        })
        if len(results) >= limit:
            break
    return results


def history_search(db: Path, query: str, limit: int = 6) -> list[dict]:
    if not db.exists():
        return []
    raw = subprocess.check_output([
        sys.executable, str(CONTINUITY), "--db", str(db),
        "search", query, "--limit", str(limit), "--max-chars", "1200"
    ], text=True)
    return json.loads(raw).get("results", [])


def summarize_branch(records: list[dict]) -> dict | None:
    if not records:
        return None
    staged = []
    charter_state = None
    for r in records:
        if r.get("record_type") == "CHARTER" and r.get("declared_state"):
            charter_state = r["declared_state"]
        stage = r.get("stage")
        if stage and re.fullmatch(r"A\d+", stage):
            staged.append((int(stage[1:]), r))
    highest_num = max((n for n, _ in staged), default=None)
    highest = [r for n, r in staged if n == highest_num] if highest_num is not None else []
    states = list(dict.fromkeys(
        r["declared_state"] for r in highest if r.get("declared_state")
    ))
    first = highest[0] if highest else records[0]
    return {
        "authority": "BRANCH_RECORD_NONCANONICAL",
        "ref": first.get("ref"),
        "git_sha": first.get("git_sha"),
        "highest_stage": f"A{highest_num}" if highest_num is not None else None,
        "highest_stage_states": states,
        "charter_state": charter_state,
        "sources": [
            {"path": r.get("path"), "line_no": r.get("line_no")}
            for r in highest
        ],
    }


def combined(repo: Path, db: Path, query: str,
             branch_limit: int, history_limit: int):
    branch = branch_search(repo, query, branch_limit)
    return {
        "query": query,
        "branch_summary": summarize_branch(branch),
        "branch_records": branch,
        "history": history_search(db, query, history_limit),
    }


def emit_bundle(data: dict, max_chars: int, audience: str):
    results = data["branch_records"] + data["history"]
    if audience == "external" and any(
        not r.get("external_eligible") for r in results
    ):
        raise SystemExit("REFUSED: recall contains material not explicitly EXTERNAL_SAFE")
    remaining = max_chars
    parts = []
    summary = data.get("branch_summary")
    if summary:
        states = " || ".join(summary.get("highest_stage_states") or []) or "NO_DECLARED_STATE"
        sources = ", ".join(
            f"{s.get('path')}:{s.get('line_no') or 1}"
            for s in summary.get("sources") or []
        )
        item = (
            "[JARVIS BRANCH SUMMARY — NONCANONICAL | "
            f"highest_stage={summary.get('highest_stage') or 'NO_STAGE'} | "
            f"highest_stage_states={states} | "
            f"charter_state={summary.get('charter_state') or 'NO_DECLARED_STATE'} | "
            f"{summary.get('ref')}@{str(summary.get('git_sha') or '')[:12]} | "
            f"sources={sources}]"
        )
        parts.append(item[:remaining])
        remaining -= min(len(item), remaining)
    for r in results:
        if remaining <= 0:
            break
        if r["kind"] == "jarvis_branch_record":
            stage = r.get("stage") or "NO_STAGE"
            declared = r.get("declared_state") or "NO_DECLARED_STATE"
            header = (
                f"[BRANCH RECORD — NONCANONICAL | {r.get('record_type')} | "
                f"stage={stage} | declared_state={declared} | {r['ref']}@"
                f"{r['git_sha'][:12]} | {r['path']}:{r['line_no']}]"
            )
        else:
            header = (
                f"[HISTORICAL CONTINUITY | {r['path']}:"
                f"{r.get('line_no') or 1} | {r.get('timestamp') or 'undated'}]"
            )
        item = header + "\n" + r.get("text", "").strip()
        item = item[:remaining]
        parts.append(item)
        remaining -= len(item)
    print("\n\n---\n\n".join(parts))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=".")
    ap.add_argument("--db", default=str(DEFAULT_DB))
    sub = ap.add_subparsers(dest="cmd", required=True)

    sea = sub.add_parser("search")
    sea.add_argument("query")
    sea.add_argument("--branch-limit", type=int, default=6)
    sea.add_argument("--history-limit", type=int, default=6)

    bun = sub.add_parser("bundle")
    bun.add_argument("query")
    bun.add_argument("--branch-limit", type=int, default=4)
    bun.add_argument("--history-limit", type=int, default=4)
    bun.add_argument("--max-chars", type=int, default=12000)
    bun.add_argument("--audience", choices=("local", "external"), default="local")

    args = ap.parse_args()
    repo = Path(args.repo).resolve()
    db = Path(args.db).expanduser()
    data = combined(
        repo, db, args.query, args.branch_limit, args.history_limit
    )
    if args.cmd == "search":
        print(json.dumps(data, indent=2))
    else:
        emit_bundle(data, args.max_chars, args.audience)


if __name__ == "__main__":
    main()
