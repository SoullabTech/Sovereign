#!/usr/bin/env python3
"""Proof harness for arm-record.py + arm-postflight.py. Synthetic, hermetic.

The centre of this file is one regression control, reproducing the 2026-08-24
failure exactly:

    transcript     = an Arm A session (plugin ABSENT at launch)
    arm record     = Arm B          (plugin PRESENT at launch)
    current machine= plugin PRESENT

    armb-postflight.sh : PASS, and printed "plugin PRESENT" as an arm property
    arm-postflight.py  : INADMISSIBLE -- transcript.sessionId != recorded session_id

A guard that refuses everything is not a guard, so the matching-B case must
pass, and an Arm A record adjudicated against its own Arm A transcript must
pass while still reporting plugin ABSENT on a machine where it is PRESENT.
"""
import json, os, subprocess, sys, tempfile, threading, time

HERE = os.path.dirname(os.path.abspath(__file__))
POSTFLIGHT = os.path.join(HERE, "arm-postflight.py")
RECORD = os.path.join(HERE, "arm-record.py")
PASS = FAIL = 0

TASK = ("Read-only investigation. Determine how JARVIS resolves its repository root "
        "in dev mode versus installed mode, and report the exact precedence order.")
import hashlib
TASK_SHA = hashlib.sha256(TASK.encode()).hexdigest()

CWD = "/Users/soullab/jarvis-bench-dfbdef18"
SID_A = "5f60651c-f2c2-4ed4-886d-c7f1c0b4ea60"
SID_B = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"


def chk(label, got, want):
    global PASS, FAIL
    if got == want:
        PASS += 1; print(f"  PASS  {label}")
    else:
        FAIL += 1; print(f"  FAIL  {label}\n        expected [{want}] got [{got}]")


def chk_in(label, needle, hay, want=True):
    global PASS, FAIL
    if (needle in hay) == want:
        PASS += 1; print(f"  PASS  {label}")
    else:
        FAIL += 1; print(f"  FAIL  {label}\n        {'missing' if want else 'unexpected'}: {needle!r}")


def plugin(present, sha, dig):
    return {"present_in_list": present, "present_in_registry": present,
            "installed_sha": sha, "install_path": "/cache",
            "tree_digests": {"scratchpad": dig, "armlog": dig + "-al"},
            "marketplace_source": CWD}


def record(d, arm, sid, present, launch="2026-08-24T18:00:00Z", cwd=CWD,
           status="LAUNCHED", transcript=None, name=None):
    r = {"schema": "arm-record/1", "status": status, "arm": arm, "session_id": sid,
         "transcript": transcript, "launch_timestamp": launch,
         "bound_at": launch, "cwd": cwd,
         "repo": {"head": "dfbdef18d361", "tree": "0746b8c1e838",
                  "detached": True, "clean": True},
         "plugin": plugin(present, "dfbdef18d361" if present else None,
                          "9006cff2" if present else "0000absent"),
         "cli_version": "2.1.241 (Claude Code)", "model": "claude-opus-5",
         "task_id": "T1", "task_set_sha": "task5e7", "task_set_path": "/emit-task.py",
         "task_prompt_sha256": TASK_SHA, "task_prompt_len": len(TASK),
         "expected_prompt_source": "typed"}
    p = os.path.join(d, name or f"arm-{arm}-T1.json")
    with open(p, "w") as f:
        json.dump(r, f, indent=2)
    return p


def transcript(d, sid, *, cwd=CWD, deliver="typed", turns=3,
               first_ts="2026-08-24T18:07:24Z", task_in_tool_result=False,
               contaminate=False, name=None):
    """Synthetic transcript. deliver=None -> task never user-delivered."""
    lines = []

    def rec(**kw):
        kw.setdefault("sessionId", sid)
        kw.setdefault("cwd", cwd)
        kw.setdefault("timestamp", first_ts)
        lines.append(json.dumps(kw))

    rec(type="user", isMeta=True, message={"role": "user", "content": "<meta>"})
    if deliver:
        rec(type="user", promptSource=deliver, entrypoint="cli",
            permissionMode="auto", effort="high", mode="normal",
            message={"role": "user", "content": TASK})
    if task_in_tool_result:
        rec(type="user", message={"role": "user", "content": [
            {"type": "tool_result", "tool_use_id": "t1",
             "content": [{"type": "text", "text": "output was: " + TASK}]}]})
    for i in range(turns):
        content = [{"type": "text", "text": f"turn {i}"}]
        if contaminate and i == 0:
            content.append({"type": "tool_use", "id": "t9", "name": "Bash",
                            "input": {"command": "python3 measure-session.py --json x"}})
        rec(type="assistant", message={"role": "assistant", "model": "claude-opus-5",
                                       "content": content},
            timestamp="2026-08-24T18:10:00Z")
    p = os.path.join(d, name or f"{sid}.jsonl")
    with open(p, "w") as f:
        f.write("\n".join(lines) + "\n")
    return p


def run(rec_path, tr=None, freeze=0, drift=None, extra=()):
    cmd = [sys.executable, POSTFLIGHT, "--record", rec_path,
           "--freeze-seconds", str(freeze)]
    if tr:
        cmd += ["--transcript", tr]
    if drift:
        cmd += ["--drift-from", drift]
    else:
        cmd += ["--no-drift"]
    cmd += list(extra)
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    return r.returncode, r.stdout + r.stderr


d = tempfile.mkdtemp(prefix="armproof-")
machine_present = os.path.join(d, "machine.json")
with open(machine_present, "w") as f:
    json.dump(plugin(True, "dfbdef18d361", "9006cff2"), f)

print("== arm-binding proof ==")

# ---------------------------------------------------------------- control 1
print("\n-- REGRESSION CONTROL: Arm A transcript vs Arm B record, machine PRESENT --")
recB = record(d, "B", SID_B, True)
trA = transcript(d, SID_A)
rc, out = run(recB, trA, drift=machine_present)
chk("historical failure now INADMISSIBLE", rc, 1)
chk_in("names the session mismatch", "transcript.sessionId == record", out)
chk_in("says which session the record wants", SID_B, out)
chk_in("says which session the transcript carries", SID_A, out)
chk_in("verdict is INADMISSIBLE", "VERDICT: INADMISSIBLE", out)

# ---------------------------------------------------------------- control 2
print("\n-- COUNTER-CONTROL: a real matching B must PASS (guard cannot refuse all) --")
trB = transcript(d, SID_B)
rc, out = run(recB, trB, drift=machine_present)
chk("matching B is ADMISSIBLE", rc, 0)
chk_in("verdict ADMISSIBLE", "VERDICT: ADMISSIBLE", out)
chk_in("task delivered", "T1 user-delivered", out)
chk_in("no drift on matching machine", "no drift", out)

# ---------------------------------------------------------------- control 3
print("\n-- TREATMENT VARIABLE: adjudicate from record, machine only warns --")
recA = record(d, "A", SID_A, False)          # Arm A launched with plugin ABSENT
rc, out = run(recA, trA, drift=machine_present)   # machine now says PRESENT
chk("Arm A vs its own transcript is ADMISSIBLE", rc, 0)
chk_in("plugin adjudicated ABSENT from record", "plugin present      : ABSENT", out)
chk_in("does NOT print PRESENT as the arm property",
       "plugin present      : PRESENT", out, want=False)
chk_in("drift banner raised", "CURRENT ENVIRONMENT DIFFERS FROM RECORDED ARM STATE", out)
chk_in("drift is explicitly non-adjudicating", "DRIFT WARNING ONLY", out)
chk_in("drift names the moved field", "present_in_list", out)

# ---------------------------------------------------------------- unbound
print("\n-- unbound arm record must refuse, not search --")
recU = record(d, "B", None, True, status="PREFLIGHT", name="arm-B-unbound.json")
rc, out = run(recU, trB)
chk("unbound record INADMISSIBLE", rc, 1)
chk_in("refuses explicitly", "not bound to a session", out)
chk_in("forbids the heuristic", "do NOT search", out)

# ---------------------------------------------------------------- delivery
print("\n-- task must be USER-DELIVERED, not merely present --")
trTR = transcript(d, SID_B, deliver=None, task_in_tool_result=True,
                  name="tool-result-only.jsonl")
rc, out = run(record(d, "B", SID_B, True, name="r2.json"), trTR)
chk("task only in tool_result -> INADMISSIBLE", rc, 1)
chk_in("names the delivery failure", "never delivered as a user message", out)

# ---------------------------------------------------------------- cwd / time
print("\n-- cwd and launch-order gates --")
trW = transcript(d, SID_B, cwd="/tmp/elsewhere", name="wrongcwd.jsonl")
rc, out = run(record(d, "B", SID_B, True, name="r3.json"), trW)
chk("cwd mismatch -> INADMISSIBLE", rc, 1)
chk_in("names cwd", "cwd matches record", out)

trE = transcript(d, SID_B, first_ts="2026-08-24T17:00:00Z", name="early.jsonl")
rc, out = run(record(d, "B", SID_B, True, name="r4.json"), trE)
chk("transcript predating launch -> INADMISSIBLE", rc, 1)
chk_in("names launch order", "started after launch record", out)

# ---------------------------------------------------------------- ran / clean
print("\n-- empty arm and self-measurement --")
trZ = transcript(d, SID_B, turns=0, name="empty.jsonl")
rc, out = run(record(d, "B", SID_B, True, name="r5.json"), trZ)
chk("zero assistant turns -> INADMISSIBLE", rc, 1)
chk_in("names empty arm", "arm ran", out)

trC = transcript(d, SID_B, contaminate=True, name="contam.jsonl")
rc, out = run(record(d, "B", SID_B, True, name="r6.json"), trC)
chk("self-measurement -> INADMISSIBLE", rc, 1)
chk_in("names contamination", "no benchmark self-measurement", out)

trOK = transcript(d, SID_B, task_in_tool_result=True, name="tr-plus-delivery.jsonl")
rc, out = run(record(d, "B", SID_B, True, name="r7.json"), trOK)
chk("tool_result echo is not contamination", rc, 0)

# ---------------------------------------------------------------- closure
print("\n-- closure proof must catch a still-growing transcript --")
trG = transcript(d, SID_B, name="growing.jsonl")
stop = threading.Event()

def churn():
    while not stop.is_set():
        with open(trG, "a") as f:
            f.write(json.dumps({"type": "assistant", "sessionId": SID_B, "cwd": CWD,
                                "timestamp": "2026-08-24T18:11:00Z",
                                "message": {"role": "assistant", "content": []}}) + "\n")
        time.sleep(0.2)

th = threading.Thread(target=churn, daemon=True); th.start()
rc, out = run(record(d, "B", SID_B, True, name="r8.json"), trG, freeze=2)
stop.set(); th.join(timeout=2)
chk("growing transcript -> INADMISSIBLE", rc, 1)
chk_in("names closure", "closed (2s freeze)", out)

# ---------------------------------------------------------------- delivery warn
print("\n-- delivery-mechanics discrepancy warns, does not void --")
trQ = transcript(d, SID_B, deliver="queued", name="queued.jsonl")
rc, out = run(record(d, "B", SID_B, True, name="r9.json"), trQ)
chk("queued delivery still ADMISSIBLE", rc, 0)
chk_in("but warns on delivery mechanics", "delivery mechanics", out)

# ---------------------------------------------------------------- record tool
print("\n-- arm-record.py refuses silent rebinding --")
rp = record(d, "B", None, True, status="PREFLIGHT", name="rebind.json")
r1 = subprocess.run([sys.executable, RECORD, "bind", "--record", rp,
                     "--session-id", SID_B], capture_output=True, text=True)
chk("first bind succeeds", r1.returncode, 0)
r2 = subprocess.run([sys.executable, RECORD, "bind", "--record", rp,
                     "--session-id", "9999"], capture_output=True, text=True)
chk("second bind refused", r2.returncode != 0, True)
chk_in("refusal explains one referent, once", "one referent, once", r2.stdout + r2.stderr)

# ---------------------------------------------------------------- digest
print("\n-- installed-tree digest must ignore .in_use/ session markers --")
from importlib.machinery import SourceFileLoader
AR = SourceFileLoader("arm_record", RECORD).load_module()

tree = os.path.join(d, "faketree")
os.makedirs(os.path.join(tree, "skills"), exist_ok=True)
os.makedirs(os.path.join(tree, ".in_use"), exist_ok=True)
with open(os.path.join(tree, "plugin.json"), "w") as f:
    f.write('{"name":"soullab-jarvis"}')
with open(os.path.join(tree, "skills", "orient.md"), "w") as f:
    f.write("orient")

def digests(t):
    return {n: AR.sh(r, t) for n, r in AR.RECIPES.items()}

base = digests(tree)
with open(os.path.join(tree, ".in_use", "59164"), "w") as f:
    f.write('{"pid":59164,"procStart":"Mon Aug 24 21:39:49 2026"}')
with_marker = digests(tree)
chk("scratchpad recipe ignores .in_use", with_marker["scratchpad"], base["scratchpad"])
chk("armlog recipe ignores .in_use", with_marker["armlog"], base["armlog"])
chk("both recipes produced a digest", all(bool(v) for v in base.values()), True)

# ...but must still notice a real content change, or it ignores everything
with open(os.path.join(tree, "skills", "orient.md"), "w") as f:
    f.write("orient CHANGED")
moved = digests(tree)
chk("scratchpad recipe still detects real change",
    moved["scratchpad"] != base["scratchpad"], True)
chk("armlog recipe still detects real change",
    moved["armlog"] != base["armlog"], True)

# ---------------------------------------------------------------- registry
print("\n-- registry parser must read the real installed_plugins.json shape --")
reg = os.path.join(d, "installed_plugins.json")
with open(reg, "w") as f:
    json.dump({"version": 2, "plugins": {
        "context-mode@context-mode": [{"scope": "user", "version": "1.0.22",
                                       "gitCommitSha": "bf3600f4"}],
        "soullab-jarvis@soullab": [{"scope": "user", "version": "0.1.0",
                                    "installPath": "/cache/soullab-jarvis/0.1.0",
                                    "gitCommitSha": "dfbdef18d361"}]}}, f)
st = AR.plugin_state(cache=tree, registry=reg)
chk("registry entry detected", st["present_in_registry"], True)
chk("gitCommitSha extracted", st["installed_sha"], "dfbdef18d361")
chk("does not take another plugin's sha", st["installed_sha"] != "bf3600f4", True)
chk("installPath extracted", st["install_path"], "/cache/soullab-jarvis/0.1.0")

reg2 = os.path.join(d, "empty_plugins.json")
with open(reg2, "w") as f:
    json.dump({"version": 2, "plugins": {"context-mode@context-mode": [{}]}}, f)
st2 = AR.plugin_state(cache=tree, registry=reg2)
chk("absent plugin reports absent", st2["present_in_registry"], False)


print(f"\n{PASS} passed · {FAIL} failed")
sys.exit(1 if FAIL else 0)
