#!/usr/bin/env python3
"""Measure one Claude Code session transcript, or diff two.

The adapter's whole claim is a context delta. This is the instrument that produces
it. It reads the same corpus the 2026-08-16 context audit read
(~/.claude/projects/<slug>/*.jsonl) so the numbers are comparable to that baseline.

    measure-session.py <transcript.jsonl> [...]         # one JSON summary per file
    measure-session.py --json A.jsonl                   # machine-readable
    measure-session.py --compare BASE.jsonl CAND.jsonl  # A/B delta table

An arm is refused, never reported, when it cannot honestly be measured: zero
assistant turns (it never ran), a transcript that measures itself, or a file that
CHANGES SIZE WHILE BEING READ (the session is still open and still writing).

Estimation note, stated once and honestly: tool-result inflow is estimated at
**4 bytes/token**, the same convention the context audit used, because transcripts do
not record per-result token counts. Startup context and output tokens are NOT estimates
-- they are read from the recorded `usage` block. Never present an estimate and a
recorded figure as the same class of evidence.
"""
import json
import os
import re
import sys
from collections import defaultdict

BYTES_PER_TOKEN = 4
HERE = os.path.dirname(os.path.abspath(__file__))
ORIENT = re.compile(
    r"git\s+(rev-parse|status|branch|symbolic-ref|log\s+-1)|hostname\s+-I|"
    r"docker\s+(ps|inspect)|printenv\s+GIT_COMMIT"
)
DENIAL = re.compile(r"\[JARVIS/(T3|trap)\]")


class ArmNotStable(Exception):
    """The transcript changed on disk while it was being read."""

    def __init__(self, path, before, after):
        self.path, self.before, self.after = path, before, after
        super().__init__(path)


def _stat_sig(path):
    """Inode + length + mtime. A session still being written changes all three."""
    st = os.stat(path)
    return (st.st_ino, st.st_size, st.st_mtime_ns)


def image_patterns():
    path = os.path.join(HERE, "..", "hooks", "image-tools.txt")
    try:
        with open(path, encoding="utf-8") as fh:
            return [l.strip().lower() for l in fh
                    if l.strip() and not l.lstrip().startswith("#")]
    except OSError:
        return []


def text_of(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for c in content:
            if not isinstance(c, dict):
                parts.append(json.dumps(c)); continue
            if c.get("type") == "text":
                parts.append(c.get("text", ""))
            elif c.get("type") == "image":
                # The base64 payload IS the context cost. Counting an image block as
                # zero was the instrument's own first bug -- it would have reported a
                # screenshot as free and made the whole benchmark meaningless.
                src = c.get("source") or {}
                parts.append("i" * len(str(src.get("data") or "")))
            else:
                parts.append(json.dumps(c))
        return "".join(parts)
    if content is None:
        return ""
    return json.dumps(content)


def has_image_block(content):
    return isinstance(content, list) and any(
        isinstance(c, dict) and c.get("type") == "image" for c in content
    )


def measure(path):
    pats = image_patterns()
    tool_name = {}          # tool_use_id -> name
    tool_side = {}          # tool_use_id -> isSidechain at call time
    by_emitter = defaultdict(lambda: {"calls": 0, "est_tokens": 0, "image_blocks": 0})
    read_paths = defaultdict(int)
    m = {
        "file": os.path.basename(path),
        "startup_context_tokens": None,
        "startup_breakdown": {},
        "output_tokens": 0,
        "tool_calls": 0,
        "tool_calls_sidechain": 0,
        "subagent_invocations": 0,
        "inflow_est_tokens": 0,
        "image_est_tokens_main_loop": 0,
        "image_est_tokens_sidechain": 0,
        "image_blocks_main_loop": 0,
        "orientation_calls": 0,
        "repeated_reads": 0,
        "hook_denials": 0,
        "elapsed_seconds": None,
        "records": 0,
        "parse_failures": 0,
        "assistant_turns": 0,
        "measures_itself": False,
    }
    stamps = []
    sig_before = _stat_sig(path)

    with open(path, encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line.startswith("{"):
                continue
            try:
                rec = json.loads(line)
            except ValueError:
                m["parse_failures"] += 1
                continue
            m["records"] += 1
            side = bool(rec.get("isSidechain"))
            if rec.get("timestamp"):
                stamps.append(str(rec["timestamp"]))
            msg = rec.get("message") or {}
            usage = msg.get("usage") or {}

            if rec.get("type") == "assistant":
                m["assistant_turns"] += 1
            if rec.get("type") == "assistant" and usage:
                if m["startup_context_tokens"] is None and not side:
                    b = {
                        "input_tokens": usage.get("input_tokens", 0),
                        "cache_creation_input_tokens": usage.get("cache_creation_input_tokens", 0),
                        "cache_read_input_tokens": usage.get("cache_read_input_tokens", 0),
                    }
                    m["startup_breakdown"] = b
                    m["startup_context_tokens"] = sum(b.values())
                m["output_tokens"] += usage.get("output_tokens", 0)

            content = msg.get("content")
            if isinstance(content, list):
                for c in content:
                    if not isinstance(c, dict):
                        continue
                    if c.get("type") == "tool_use":
                        name = str(c.get("name") or "?")
                        tool_name[c.get("id")] = name
                        tool_side[c.get("id")] = side
                        m["tool_calls"] += 1
                        if side:
                            m["tool_calls_sidechain"] += 1
                        if name in ("Task", "Agent"):
                            m["subagent_invocations"] += 1
                        inp = c.get("input") or {}
                        blob = json.dumps(inp)
                        if "measure-session.py" in blob:
                            m["measures_itself"] = True
                        if ORIENT.search(blob):
                            m["orientation_calls"] += 1
                        if name == "Read" and isinstance(inp, dict) and inp.get("file_path"):
                            read_paths[inp["file_path"]] += 1
                    elif c.get("type") == "tool_result":
                        tid = c.get("tool_use_id")
                        name = tool_name.get(tid, "unattributed")
                        body = c.get("content")
                        est = len(text_of(body)) // BYTES_PER_TOKEN
                        img = has_image_block(body)
                        e = by_emitter[name]
                        e["calls"] += 1
                        e["est_tokens"] += est
                        m["inflow_est_tokens"] += est
                        low = name.lower()
                        is_img = img or any(p in low for p in pats)
                        if is_img:
                            if tool_side.get(tid, side):
                                m["image_est_tokens_sidechain"] += est
                            else:
                                m["image_est_tokens_main_loop"] += est
                                if img:
                                    m["image_blocks_main_loop"] += 1
                                    e["image_blocks"] += 1
                        if DENIAL.search(text_of(body)):
                            m["hook_denials"] += 1

            flat = json.dumps(rec)
            if rec.get("type") == "system" and DENIAL.search(flat):
                m["hook_denials"] += 1

    # If the file moved under the read, these numbers describe no single state of
    # it. Detecting that requires the file itself; no marker inside the transcript
    # can reveal a session that is merely still open.
    sig_after = _stat_sig(path)
    if sig_after != sig_before:
        raise ArmNotStable(path, sig_before, sig_after)

    m["repeated_reads"] = sum(v - 1 for v in read_paths.values() if v > 1)
    m["distinct_read_paths"] = len(read_paths)
    if len(stamps) >= 2:
        try:
            from datetime import datetime
            def p(s):
                return datetime.fromisoformat(s.replace("Z", "+00:00"))
            m["elapsed_seconds"] = round((p(max(stamps)) - p(min(stamps))).total_seconds(), 1)
        except Exception:
            pass
    m["by_emitter"] = dict(sorted(
        by_emitter.items(), key=lambda kv: -kv[1]["est_tokens"])[:15])
    return m


ROWS = [
    ("startup_context_tokens", "startup context (recorded)"),
    ("inflow_est_tokens", "tool inflow (est, 4B/tok)"),
    ("image_est_tokens_main_loop", "  of which image, MAIN LOOP"),
    ("image_est_tokens_sidechain", "  of which image, subagent"),
    ("image_blocks_main_loop", "image blocks in main loop"),
    ("subagent_invocations", "subagent invocations"),
    ("orientation_calls", "orientation calls"),
    ("repeated_reads", "repeated reads (same path)"),
    ("hook_denials", "hook denials observed"),
    ("output_tokens", "output tokens (recorded)"),
    ("tool_calls", "tool calls"),
    ("elapsed_seconds", "elapsed seconds"),
    ("assistant_turns", "assistant turns (0 = arm never ran)"),
]


def fmt(v):
    return "n/a" if v is None else (f"{v:,}" if isinstance(v, int) else str(v))


def compare(a, b):
    print(f"\n{'metric':<34}{'A (base)':>14}{'B (cand)':>14}{'delta':>14}{'':>10}")
    print("-" * 86)
    for key, label in ROWS:
        x, y = a.get(key), b.get(key)
        d = pct = ""
        if isinstance(x, (int, float)) and isinstance(y, (int, float)):
            d = f"{y - x:+,.0f}"
            pct = f"{((y - x) / x * 100):+.1f}%" if x else ""
        print(f"{label:<34}{fmt(x):>14}{fmt(y):>14}{d:>14}{pct:>10}")
    print("-" * 86)
    print("Recorded = read from the transcript's usage block. Est = bytes/4, audit convention.")
    print("A delta on ONE session pair is an observation, not a result. Run >=3 pairs.\n")


def _measure_or_refuse(label, path):
    """measure(), except a transcript that moves under the read is refused."""
    try:
        return measure(path)
    except ArmNotStable as e:
        sys.stderr.write(
            "\nARM NOT STABLE / SESSION MAY STILL BE ACTIVE\n\n"
            f"  {label}: {os.path.basename(e.path)}\n"
            f"  size {e.before[1]:,} -> {e.after[1]:,} bytes "
            f"({e.after[1] - e.before[1]:+,}) while it was being read.\n\n"
            "The transcript changed during measurement, so the figures describe no\n"
            "single state of it. That is what an arm looks like while its session is\n"
            "still open and still writing. Close that session, or run the comparison\n"
            "from a third session that is neither arm, and measure again.\n"
            "See PROTOCOL.md.\n"
        )
        sys.exit(2)


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(2)
    if args[0] == "--compare":
        if len(args) != 3:
            sys.exit("usage: --compare BASE.jsonl CAND.jsonl")
        # A missing or empty path here almost always means the arms were never run
        # and a shell expansion produced ''. Say that, rather than throwing.
        arms = []
        for label, path in (("BASE (arm A)", args[1]), ("CAND (arm B)", args[2])):
            if not path or not os.path.isfile(path):
                sys.stderr.write(
                    f"\ncannot compare: {label} path is "
                    f"{'empty' if not path else 'not a file'}: {path!r}\n\n"
                    "Both arms must have been RUN first -- each arm is one Claude Code\n"
                    "session in which you performed the benchmark task. List what exists:\n\n"
                    "  ls -lt ~/.claude/projects/<project-slug>/*.jsonl\n\n"
                    "If that shows fewer than two transcripts, there is nothing to compare\n"
                    "yet. See PROTOCOL.md.\n"
                )
                sys.exit(2)
            arms.append((label, path, _measure_or_refuse(label, path)))

        # An existing, non-empty transcript is NOT evidence that an arm ran. A session
        # that opened and did nothing yields zeros -- and zeros subtracted from real
        # numbers render as a delta, which reads as a result. Refuse it.
        for label, path, m in arms:
            if m["assistant_turns"] == 0:
                sys.stderr.write(
                    f"\ncannot compare: {label} has ZERO assistant turns -- "
                    "that arm never ran.\n"
                    f"  {os.path.basename(path)}: {m['records']} records, no work performed.\n\n"
                    "Its metrics would all be 0, and 0 is 'no data' here, not 'measured\n"
                    "zero'. Every delta would be the other arm restated. Run the task in\n"
                    "that arm first. See PROTOCOL.md.\n"
                )
                sys.exit(2)

        # A transcript that ran the measurement tool did benchmark bookkeeping, not the
        # task. It cannot serve as an arm -- and if it is still live, its numbers grow
        # with the very turns that read them.
        #
        # State only what the evidence shows: the file CONTAINS a measure-session.py
        # call. Whether that call is this one is not knowable from here.
        for label, path, m in arms:
            if m["measures_itself"]:
                sys.stderr.write(
                    f"\ncannot compare: {label} ran the measurement tool itself\n"
                    f"  ({os.path.basename(path)} contains a call to measure-session.py).\n\n"
                    "That session did benchmark bookkeeping, not the task, so it is not an\n"
                    "arm -- and if it is still live, its numbers grow with every turn that\n"
                    "reads them. Pick the transcripts of the two sessions in which you\n"
                    "actually performed the task. See PROTOCOL.md.\n"
                )
                sys.exit(2)

        compare(arms[0][2], arms[1][2])
        return
    as_json = args[0] == "--json"
    files = args[1:] if as_json else args
    for f in files:
        m = _measure_or_refuse(os.path.basename(f), f)
        if as_json:
            print(json.dumps(m, indent=2))
        else:
            print(f"\n== {m['file']} ==")
            for key, label in ROWS:
                print(f"  {label:<34}{fmt(m.get(key)):>14}")
            print(f"  {'records / parse failures':<34}{m['records']:>7} / {m['parse_failures']}")
            if m["by_emitter"]:
                print("  top emitters by est tokens:")
                for name, e in list(m["by_emitter"].items())[:8]:
                    print(f"    {name:<38}{e['calls']:>5} calls{e['est_tokens']:>12,} tok")


if __name__ == "__main__":
    main()
