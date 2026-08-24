#!/usr/bin/env python3
"""Proof harness for measure-session.py. Synthetic transcripts, known answers.

The instrument that measures the adapter must itself be verified, or the A/B is
just two numbers with a story attached.
"""
import json, os, subprocess, sys, tempfile, threading, time

HERE = os.path.dirname(os.path.abspath(__file__))
MEASURE = os.path.join(HERE, "measure-session.py")
PASS = FAIL = 0


def chk(label, got, want):
    global PASS, FAIL
    if got == want:
        PASS += 1; print(f"  PASS  {label}")
    else:
        FAIL += 1; print(f"  FAIL  {label}\n        expected [{want}] got [{got}]")


def rec(**kw):
    kw.setdefault("timestamp", "2026-08-24T00:00:00Z")
    return json.dumps(kw)


def use(tid, name, inp, side=False, ts="2026-08-24T00:00:00Z"):
    return rec(type="assistant", isSidechain=side, timestamp=ts,
               message={"role": "assistant", "content": [
                   {"type": "tool_use", "id": tid, "name": name, "input": inp}]})


def result(tid, payload, side=False, image=False, ts="2026-08-24T00:00:00Z"):
    content = ([{"type": "image", "source": {"data": payload}}] if image
               else [{"type": "text", "text": payload}])
    return rec(type="user", isSidechain=side, timestamp=ts,
               message={"role": "user", "content": [
                   {"type": "tool_result", "tool_use_id": tid, "content": content}]})


def head(inp=100, cc=200, cr=300, out=50):
    return rec(type="assistant", isSidechain=False,
               message={"role": "assistant", "content": [{"type": "text", "text": "hi"}],
                        "usage": {"input_tokens": inp, "cache_creation_input_tokens": cc,
                                  "cache_read_input_tokens": cr, "output_tokens": out}})


def write(lines):
    fd, path = tempfile.mkstemp(suffix=".jsonl"); os.close(fd)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")
    return path


def measure(path):
    out = subprocess.run([sys.executable, MEASURE, "--json", path],
                         capture_output=True, text=True, timeout=60)
    return json.loads(out.stdout)


print("== instrument proof ==")

# A: plugin disabled. 40,000-byte screenshot lands in the MAIN loop.
A = write([
    head(),
    use("t1", "mcp__ios-simulator__control", {"action": "screenshot"}),
    result("t1", "x" * 40000, image=True),
    use("t2", "Bash", {"command": "git rev-parse --show-toplevel"}),
    result("t2", "/repo"),
    use("t3", "Bash", {"command": "git status --porcelain"}),
    result("t3", "M f.ts"),
    use("t4", "Read", {"file_path": "/repo/big.tsx"}),
    result("t4", "y" * 400),
    use("t5", "Read", {"file_path": "/repo/big.tsx"}),
    result("t5", "y" * 400, ts="2026-08-24T00:05:00Z"),
])

# B: plugin enabled. Denial in main loop, screenshot taken inside the subagent.
B = write([
    head(),
    use("s1", "mcp__ios-simulator__control", {"action": "screenshot"}),
    result("s1", "[JARVIS/T3] 'mcp__ios-simulator__control' produces images ... denied"),
    use("s2", "Task", {"prompt": "look at the screen, report findings"}),
    use("s3", "mcp__ios-simulator__control", {"action": "screenshot"}, side=True),
    result("s3", "x" * 40000, side=True, image=True),
    result("s2", "z" * 800, ts="2026-08-24T00:02:00Z"),
])

a, b = measure(A), measure(B)

chk("startup read from usage, not estimated", a["startup_context_tokens"], 600)
chk("A: image tokens land in main loop",      a["image_est_tokens_main_loop"], 10000)
chk("A: none in subagent",                    a["image_est_tokens_sidechain"], 0)
chk("A: image block counted in main loop",    a["image_blocks_main_loop"], 1)
chk("A: orientation calls detected",          a["orientation_calls"], 2)
chk("A: repeated read of same path",          a["repeated_reads"], 1)
chk("A: no denials",                          a["hook_denials"], 0)
chk("A: elapsed seconds computed",            a["elapsed_seconds"], 300.0)

chk("B: image tokens quarantined to subagent", b["image_est_tokens_sidechain"], 10000)
# The denial message itself is attributed to the image tool and is main-loop cost.
# That is correct and it is the point: ~17 tokens instead of ~10,000.
chk("B: main loop carries only the denial",    b["image_est_tokens_main_loop"] < 100, True)
chk("B: no image block in main loop",          b["image_blocks_main_loop"], 0)
chk("B: denial observed",                      b["hook_denials"], 1)
chk("B: subagent invocation counted",          b["subagent_invocations"], 1)

chk("delta is the thing being claimed",
    a["image_est_tokens_main_loop"] - b["image_est_tokens_main_loop"] > 9900, True)

# Robustness: a corrupt transcript must be measured, not crash the run.
C = write([head(), "{ not json", use("q", "Read", {"file_path": "/a"}), result("q", "ok")])
c = measure(C)
chk("malformed line counted, not fatal",       c["parse_failures"], 1)
chk("valid records still measured",            c["tool_calls"], 1)

# --- the two failure modes a real run surfaced on 2026-08-24 -------------------
# Both produce a table that LOOKS like a result. Both must refuse instead.

def compare_rc(a, b):
    r = subprocess.run([sys.executable, MEASURE, "--compare", a, b],
                       capture_output=True, text=True, timeout=60)
    return r.returncode, (r.stderr or "")

# A session that opened and did nothing: file exists, non-empty, zero assistant turns.
EMPTY = write([
    rec(type="user", isSidechain=False, message={"role": "user", "content": "hi"}),
    rec(type="system", isSidechain=False, subtype="mode"),
])
e = measure(EMPTY)
chk("empty arm: zero assistant turns detected", e["assistant_turns"], 0)
rc, err = compare_rc(EMPTY, B)
chk("empty arm refused (exit 2)",              rc, 2)
chk("empty arm names the real problem",        "never ran" in err, True)

# A session measuring itself: its transcript contains the measure-session.py call.
SELF = write([
    head(),
    use("m1", "Bash", {"command": "python3 plugins/soullab-jarvis/benchmark/measure-session.py --compare a b"}),
    result("m1", "some table"),
])
sm = measure(SELF)
chk("self-measurement detected",               sm["measures_itself"], True)
rc, err = compare_rc(A, SELF)
chk("self-measurement refused (exit 2)",       rc, 2)
chk("self-measurement explains why",           "benchmark bookkeeping, not the task" in err, True)
chk("self-measurement claims only what it saw", "is the session running" in err, False)

# A transcript still being APPENDED by a live session. Nothing inside it names
# this tool, so the self-measurement marker cannot see it -- the only witness is
# the file moving under the read. Big enough that the read window is unambiguous.
LIVE = write([head()] + [
    use(f"g{i}", "Read", {"file_path": f"/repo/f{i}.ts"}) for i in range(9000)
])
_stop = threading.Event()


def _churn():
    while not _stop.is_set():
        with open(LIVE, "a", encoding="utf-8") as fh:
            fh.write(result("g1", "appended while being measured") + "\n")
            fh.flush()
        time.sleep(0.001)


_before = os.path.getsize(LIVE)
_t = threading.Thread(target=_churn, daemon=True)
_t.start()
time.sleep(0.02)
rc_live, err_live = compare_rc(A, LIVE)
_stop.set()
_t.join(timeout=5)

chk("live arm: file did grow during the run",  os.path.getsize(LIVE) > _before, True)
# The decisive one: the pre-existing guard is blind here, so it cannot be the
# thing that refuses this arm.
chk("live arm carries no self-measure marker", measure(LIVE)["measures_itself"], False)
chk("live arm refused (exit 2)",               rc_live, 2)
chk("live arm named ARM NOT STABLE",           "ARM NOT STABLE" in err_live, True)
chk("live arm says session may be active",
    "SESSION MAY STILL BE ACTIVE" in err_live, True)

os.unlink(LIVE)

# A genuine pair must still pass through.
rc, _ = compare_rc(A, B)
chk("valid pair still compares (exit 0)",      rc, 0)

for p_ in (EMPTY, SELF):
    os.unlink(p_)

# An empty transcript must not fabricate a startup figure.
D = write(["{}"])
d = measure(D)
chk("empty transcript -> no startup claim",    d["startup_context_tokens"], None)

for p in (A, B, C, D):
    os.unlink(p)

print(f"\n{PASS} passed · {FAIL} failed")
sys.exit(1 if FAIL else 0)
