#!/usr/bin/env python3
"""Arm postflight — adjudicate one benchmark arm against its frozen arm record.

Supersedes armb-postflight.sh, which had two defects that together made the
treatment variable untrustworthy:

  1. It took a transcript path as its only referent and had no way to know
     which arm that transcript was. Callers resolved the arm by task text --
     but both arms carry the same canonical task hash by construction, so the
     heuristic bound Arm A's transcript and adjudicated it as Arm B.
  2. It read plugin presence, registry state and the installed-tree digest
     from the machine at postflight time and printed them as arm properties.
     Adjudicating Arm A (launched with the plugin ABSENT) on a machine where
     the plugin is now PRESENT printed "plugin PRESENT ... OK" -- the treatment
     variable, inverted, reported as a pass.

The contract here:

  * The arm is whatever the frozen record says it is. transcript.sessionId must
    equal the recorded session_id, or the run is INADMISSIBLE. No content
    search may decide which session "must have been" this arm.
  * Every environment fact used to ADJUDICATE comes from the record.
  * The current machine is inspected only to WARN about drift. It can never
    substitute for launch state.

Usage:
  arm-postflight.py --record arm-B-T1.json [--transcript path] [--freeze-seconds 60]

Exit: 0 ADMISSIBLE · 1 INADMISSIBLE · 2 instrument error
"""
import argparse, hashlib, json, os, re, sys, time, datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

BENCH_MARKERS = ("measure-session.py", "arm-postflight.py", "arm-record.py",
                 "verify-instrument.py", "verify-arm-postflight.py", "armb-postflight.sh")

FAILS, WARNS = [], []


def line(status, label, detail=""):
    if status == "FAIL":
        FAILS.append(label)
    elif status == "WARN":
        WARNS.append(label)
    print(f"  {status:4}  {label:34} {detail}")


def load_jsonl(p):
    out = []
    with open(p, errors="replace") as f:
        for l in f:
            l = l.strip()
            if not l:
                continue
            try:
                out.append(json.loads(l))
            except Exception:
                pass
    return out


def user_task_text(r):
    """Text of a genuinely user-delivered task message, else None.

    Excludes meta records, system-injected prompts, and -- the case that
    misled the earlier search -- user-role records whose content is a
    tool_result. A tool result that happens to quote the task is not the task
    being delivered to the session.
    """
    if r.get("type") != "user" or r.get("isMeta"):
        return None
    if r.get("promptSource") == "system":
        return None
    c = (r.get("message") or {}).get("content")
    if isinstance(c, str):
        return c
    if isinstance(c, list):
        if any(isinstance(b, dict) and b.get("type") == "tool_result" for b in c):
            return None
        return "".join(b.get("text", "") for b in c
                       if isinstance(b, dict) and b.get("type") == "text")
    return None


def semver(s):
    """First dotted version in a string. '2.1.243 (Claude Code)' -> '2.1.243'."""
    m = re.search(r"\d+\.\d+\.\d+", s or "")
    return m.group(0) if m else None


def cross_check(pa, pb):
    """Refuse a pair whose arms did not run on the same CLI and model.

    Added 2026-08-24 after the CLI auto-updated 2.1.241 -> 2.1.243 between the
    Arm B capture and its launch. The previous instrument only PRINTED the
    recorded cli_version and never compared it, so the pair would have differed
    in two variables -- plugin AND CLI -- while being reported as differing in
    one. Version strings are not identity: byte identity of the resolved
    launcher is what establishes equivalence.
    """
    with open(pa) as f:
        a = json.load(f)
    with open(pb) as f:
        b = json.load(f)
    print(f"=== CROSS-ARM CHECK  {a.get('arm')} vs {b.get('arm')} ===")
    bad = []

    av, bv = semver(a.get("cli_version")), semver(b.get("cli_version"))
    if av and bv and av == bv:
        line("OK", "A.cli_version == B.cli_version", av)
    else:
        line("FAIL", "A.cli_version == B.cli_version", f"{av} vs {bv}"); bad.append(1)

    if a.get("model") and a.get("model") == b.get("model"):
        line("OK", "A.model == B.model", a.get("model"))
    else:
        line("FAIL", "A.model == B.model", f"{a.get('model')} vs {b.get('model')}"); bad.append(1)

    la, lb = a.get("launcher") or {}, b.get("launcher") or {}
    if la.get("sha256") and la.get("sha256") == lb.get("sha256"):
        line("OK", "launcher byte-identical", la["sha256"][:16] + "…")
    else:
        line("FAIL", "launcher byte-identical",
             f"{(la.get('sha256') or '<none>')[:12]}… vs {(lb.get('sha256') or '<none>')[:12]}…"
             " — equivalence may not be inferred from version strings")
        bad.append(1)
    if la.get("realpath") != lb.get("realpath"):
        line("WARN", "launcher path differs",
             f"{la.get('realpath')} vs {lb.get('realpath')}")

    print(f"\n=== PAIR: {'COMPARABLE' if not bad else 'NOT COMPARABLE'} ===")
    return 0 if not bad else 1


def frozen(path, seconds):
    """Long size+mtime freeze. A short probe is not proof a session closed."""
    def sample():
        st = os.stat(path)
        return (st.st_size, st.st_mtime)
    a = sample()
    if seconds <= 0:
        return True, [a]
    half = seconds / 2.0
    time.sleep(half)
    b = sample()
    time.sleep(seconds - half)
    c = sample()
    return (a == b == c), [a, b, c]


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--record")
    ap.add_argument("--cross-check", nargs=2, metavar=("A_RECORD", "B_RECORD"),
                    help="refuse a pair whose arms differ in CLI, model or launcher")
    ap.add_argument("--transcript")
    ap.add_argument("--freeze-seconds", type=float, default=60.0)
    ap.add_argument("--drift-from", help="JSON file with a plugin_state dict "
                                         "(testing seam; default = observe this machine)")
    ap.add_argument("--no-drift", action="store_true")
    a = ap.parse_args()
    if a.cross_check:
        return cross_check(*a.cross_check)
    if not a.record:
        print("instrument error: --record is required")
        return 2

    try:
        with open(a.record) as f:
            rec = json.load(f)
    except Exception as e:
        print(f"instrument error: cannot read arm record: {e}")
        return 2
    if rec.get("schema") != "arm-record/1":
        print(f"instrument error: unknown record schema {rec.get('schema')!r}")
        return 2

    stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"=== ARM {rec.get('arm')} / {rec.get('task_id')} POSTFLIGHT  {stamp} ===")

    # ---- the binding gate -------------------------------------------------
    sid = rec.get("session_id")
    if not sid or rec.get("status") == "PREFLIGHT":
        print("\n  REFUSED — arm record is not bound to a session.")
        print("  status=%s session_id=%s" % (rec.get("status"), sid))
        print("  This arm has no referent. It was never launched, or the session ID")
        print("  was never captured. Bind it with arm-record.py bind; do NOT search")
        print("  for a transcript that looks like it.")
        print("\n=== VERDICT: INADMISSIBLE (unbound arm record) ===")
        return 1

    t = a.transcript or rec.get("transcript")
    if not t or not os.path.exists(t):
        print(f"\n  REFUSED — transcript not found: {t}")
        print("\n=== VERDICT: INADMISSIBLE (no transcript at the bound path) ===")
        return 1

    print("\n--- arm identity (from the frozen record; NOT from this machine) ---")
    print(f"  recorded session_id : {sid}")
    print(f"  transcript          : {t}")

    recs = load_jsonl(t)
    if not recs:
        line("FAIL", "transcript parses", "no records")
        print("\n=== VERDICT: INADMISSIBLE ===")
        return 1

    tsids = sorted({r.get("sessionId") for r in recs if r.get("sessionId")})
    stem = os.path.splitext(os.path.basename(t))[0]
    if tsids == [sid]:
        line("OK", "transcript.sessionId == record", sid)
    else:
        line("FAIL", "transcript.sessionId == record",
             f"transcript carries {tsids or ['<none>']}, record says {sid}")
    if stem == sid:
        line("OK", "transcript filename == session_id", stem)
    else:
        line("WARN", "transcript filename == session_id", f"file stem {stem}")

    ts = sorted(r["timestamp"] for r in recs if "timestamp" in r)
    launch = rec.get("launch_timestamp") or ""
    if ts and launch and ts[0] > launch:
        line("OK", "started after launch record", f"{ts[0]} > {launch}")
    elif ts and launch:
        line("FAIL", "started after launch record",
             f"first record {ts[0]} precedes launch record {launch}")
    else:
        line("FAIL", "started after launch record", "missing timestamps")

    cwds = sorted({r.get("cwd") for r in recs if r.get("cwd")})
    if cwds == [rec.get("cwd")]:
        line("OK", "cwd matches record", rec.get("cwd"))
    else:
        line("FAIL", "cwd matches record", f"transcript cwd {cwds}, record {rec.get('cwd')}")

    # ---- the task was actually delivered ----------------------------------
    want = rec.get("task_prompt_sha256")
    hits = []
    for i, r in enumerate(recs):
        txt = user_task_text(r)
        if txt and txt.strip() and hashlib.sha256(txt.rstrip("\n").encode()).hexdigest() == want:
            hits.append((i, r.get("promptSource")))
    if hits:
        line("OK", f"{rec.get('task_id')} user-delivered",
             f"idx {[h[0] for h in hits]} promptSource={[h[1] for h in hits]}")
    else:
        echoes = sum(1 for r in recs if want and rec.get("task_prompt_len")
                     and json.dumps(r).count("Read-only investigation") > 0)
        line("FAIL", f"{rec.get('task_id')} user-delivered",
             f"canonical task never delivered as a user message "
             f"({echoes} incidental record(s) mention it)")

    turns = sum(1 for r in recs if r.get("type") == "assistant")
    line("OK" if turns else "FAIL", "arm ran", f"{turns} assistant turns")

    ok_frozen, samples = frozen(t, a.freeze_seconds)
    line("OK" if ok_frozen else "FAIL", f"closed ({a.freeze_seconds:g}s freeze)",
         " ".join(f"{s[0]}@{s[1]:.0f}" for s in samples))

    contam = 0
    for r in recs:
        m = r.get("message") or {}
        c = m.get("content")
        if not isinstance(c, list):
            continue
        for b in c:
            if isinstance(b, dict) and b.get("type") == "tool_use":
                blob = json.dumps(b.get("input", {}))
                if any(mk in blob for mk in BENCH_MARKERS):
                    contam += 1
    line("OK" if contam == 0 else "FAIL", "no benchmark self-measurement",
         f"{contam} tool_use input(s) reference the instrument")

    # ---- launch parameters -------------------------------------------------
    print("\n--- launch parameters (from transcript) ---")
    for k in ("entrypoint", "promptSource", "permissionMode", "effort", "mode"):
        seen = sorted({r[k] for r in recs if isinstance(r.get(k), str)})
        print(f"  {k:16}: {seen}")
    # --- fail-closed: the arm must have RUN on the CLI and model the record claims.
    # Read from the transcript, which stamps `version` on its records -- launch
    # state, not machine state at postflight time.
    tvers = sorted({r["version"] for r in recs if isinstance(r.get("version"), str)})
    rec_v = semver(rec.get("cli_version"))
    if len(tvers) > 1:
        line("FAIL", "single CLI across the arm", f"transcript spans {tvers}")
    elif not tvers:
        line("FAIL", "cli_version establishable", "transcript stamps no version")
    elif not rec_v:
        line("FAIL", "cli_version establishable", f"record cli_version {rec.get('cli_version')!r}")
    elif semver(tvers[0]) == rec_v:
        line("OK", "record.cli == transcript.cli", rec_v)
    else:
        line("FAIL", "record.cli == transcript.cli",
             f"record {rec_v}, arm actually ran {semver(tvers[0])}")

    lv = semver((rec.get("launcher") or {}).get("version"))
    if lv and rec_v and lv != rec_v:
        line("FAIL", "record cli/launcher agree", f"cli {rec_v}, launcher {lv}")

    models = sorted({(r.get("message") or {}).get("model")
                     for r in recs if (r.get("message") or {}).get("model")})
    if not models:
        line("FAIL", "model establishable", "transcript names no model")
    elif rec.get("model") and models == [rec["model"]]:
        line("OK", "record.model == transcript.model", rec["model"])
    else:
        line("FAIL", "record.model == transcript.model",
             f"transcript {models}, record {rec.get('model')}")

    exp = rec.get("expected_prompt_source")
    delivered = sorted({h[1] for h in hits if h[1]})
    if exp and delivered and exp not in delivered:
        line("WARN", "delivery mechanics", f"expected {exp!r}, delivered via {delivered}")
    if ts:
        print(f"  {'window':16}: {ts[0]} -> {ts[-1]}")

    # ---- adjudicated arm properties: RECORD ONLY ---------------------------
    pl = rec.get("plugin") or {}
    print("\n--- arm environment (ADJUDICATED FROM THE FROZEN RECORD) ---")
    print(f"  plugin present      : {'PRESENT' if pl.get('present_in_list') else 'ABSENT'}"
          f"   <- the treatment variable")
    print(f"  registry entry      : {'PRESENT' if pl.get('present_in_registry') else 'ABSENT'}")
    print(f"  installed SHA       : {pl.get('installed_sha')}")
    for name, dig in (pl.get("tree_digests") or {}).items():
        print(f"  tree digest[{name:10}]: {dig}")
    print(f"  cli version         : {rec.get('cli_version')}")
    _l = rec.get("launcher") or {}
    print(f"  launcher            : {_l.get('realpath')}")
    print(f"  launcher sha256     : {_l.get('sha256')}")
    print(f"  repo HEAD / tree    : {(rec.get('repo') or {}).get('head')} / "
          f"{(rec.get('repo') or {}).get('tree')}")
    print(f"  detached / clean    : {(rec.get('repo') or {}).get('detached')} / "
          f"{(rec.get('repo') or {}).get('clean')}")
    print(f"  task-set SHA        : {rec.get('task_set_sha')}")

    # ---- current machine: DRIFT WARNING ONLY -------------------------------
    if not a.no_drift:
        try:
            if a.drift_from:
                with open(a.drift_from) as f:
                    now = json.load(f)
            else:
                from importlib.machinery import SourceFileLoader
                mod = SourceFileLoader(
                    "arm_record",
                    os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                 "arm-record.py")).load_module()
                now = mod.plugin_state()
        except Exception as e:
            now = None
            print(f"\n  (drift check unavailable: {e})")
        if now:
            diffs = []
            for k in ("present_in_list", "present_in_registry", "installed_sha"):
                if now.get(k) != pl.get(k):
                    diffs.append(f"{k}: record={pl.get(k)} now={now.get(k)}")
            for name, dig in (pl.get("tree_digests") or {}).items():
                if (now.get("tree_digests") or {}).get(name) != dig:
                    diffs.append(f"tree_digests[{name}]: record={dig} "
                                 f"now={(now.get('tree_digests') or {}).get(name)}")
            print("\n--- current machine (DRIFT WARNING ONLY — never adjudicates) ---")
            if diffs:
                print("  *** CURRENT ENVIRONMENT DIFFERS FROM RECORDED ARM STATE ***")
                for d in diffs:
                    print(f"    {d}")
                print("  The arm is adjudicated on the recorded state above. This block is")
                print("  informational: it says the machine moved since launch, not that the")
                print("  arm is bad.")
                WARNS.append("environment drift")
            else:
                print("  no drift: current machine still matches the recorded arm state")

    verdict = "ADMISSIBLE" if not FAILS else "INADMISSIBLE"
    print(f"\n=== VERDICT: {verdict} ===")
    if FAILS:
        print(f"  failed checks : {', '.join(FAILS)}")
    if WARNS:
        print(f"  warnings      : {', '.join(WARNS)}")
    return 0 if not FAILS else 1


if __name__ == "__main__":
    sys.exit(main())
