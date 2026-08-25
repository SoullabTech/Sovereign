#!/usr/bin/env python3
"""Arm record — the frozen launch state of one benchmark arm.

An arm is identified by an explicit session ID captured at launch, never by
task-text heuristics.

Why this file exists (2026-08-24): a postflight bound Arm A's transcript as
Arm B, because both arms necessarily carry the same canonical task hash --
prompt identity is a *task* discriminator, not an *arm* discriminator. The run
then read plugin state from the machine at postflight time (PRESENT) and
printed it as though it were the arm's launch state (Arm A launched with the
plugin ABSENT). The treatment variable was reported inverted, as a pass.

The fix has two halves. This half freezes launch state into a record. The other
half (arm-postflight.py) adjudicates *from that record* and may consult the
current machine only to warn about drift.

Usage:
  arm-record.py capture --arm B --task T1 --task-file t1.txt --cwd <dir> \
                        --model claude-opus-5 [--out arm-B-T1.json]
  arm-record.py bind    --record arm-B-T1.json --session-id <uuid>
  arm-record.py show    --record arm-B-T1.json

capture runs BEFORE the arm session is launched; session_id is null and the
record status is PREFLIGHT. bind is run immediately after launch with the
session ID read off the live session. bind refuses to overwrite an existing
binding: an arm gets one referent, once.
"""
import argparse, hashlib, json, os, subprocess, sys, datetime

PLUGIN_CACHE = os.path.expanduser("~/.claude/plugins/cache/soullab/soullab-jarvis/0.1.0")
REGISTRY = os.path.expanduser("~/.claude/plugins/installed_plugins.json")

# Two digest recipes are already in the corpus and they disagree by method, not
# by bytes (9006cff2... vs 62398ae7... for the same tree). Recording only one
# invites a later reader to compare across recipes and see a false divergence,
# so both are captured, each under the name of the record that introduced it.
#
# Both original recipes had a defect found 2026-08-24: they excluded .git and
# .orphaned_at but NOT .in_use/. Claude Code writes one .in_use/<pid> liveness
# marker into the installed plugin cache per RUNNING session, so the digest
# moved whenever any session started or exited -- unrelated to the plugin's
# bytes. That turns the integrity check into a false-divergence generator
# capable of VOIDing a sound arm because another window was open. Excluding
# .in_use/, the installed cache digests to 9006cff2... and equals its
# marketplace source exactly: 21 content files, no drift.
RECIPES = {
    "scratchpad": (
        'D="$1"; find "$D" -type f -not -path "*/.git/*" -not -path "*/.in_use/*" -not -name ".orphaned_at" '
        '| sed "s|^$D/||" | sort '
        '| while read f; do printf "%s " "$f"; shasum -a 256 "$D/$f" | cut -d" " -f1; done '
        '| shasum -a 256 | cut -d" " -f1'
    ),
    "armlog": (
        'D="$1"; find "$D" -type f ! -path "*/.git/*" ! -path "*/.in_use/*" -print0 | sort -z '
        '| xargs -0 shasum -a 256 | sed "s|$D/||" | shasum -a 256 | cut -d" " -f1'
    ),
}


def utcnow():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def sh(cmd, *args):
    try:
        r = subprocess.run(["bash", "-c", cmd, "bash", *args],
                           capture_output=True, text=True, timeout=120)
        return r.stdout.strip()
    except Exception:
        return ""


def git(cwd, *a):
    try:
        r = subprocess.run(["git", "-C", cwd, *a], capture_output=True, text=True, timeout=60)
        return r.stdout.strip() if r.returncode == 0 else ""
    except Exception:
        return ""


def sha256_text(s):
    return hashlib.sha256(s.encode()).hexdigest()


def sha256_file(p):
    try:
        with open(p, "rb") as f:
            return hashlib.sha256(f.read()).hexdigest()
    except Exception:
        return None


def launcher_state():
    """Bind the executable that actually launches the arm.

    This machine carries mixed installations (~/.local/share/claude/versions/*
    plus an app bundle at a different version), so "the CLI version" is not a
    machine property -- it is a property of the binary on PATH at launch. A
    version string is not identity: two builds can report the same version, so
    the resolved file is hashed and byte identity is what cross-arm checks use.
    """
    path = sh("command -v claude || true")
    real = os.path.realpath(path) if path else None
    return {
        "path": path or None,
        "realpath": real,
        "version": sh("claude --version 2>&1 || true") or None,
        "sha256": sha256_file(real) if real and os.path.isfile(real) else None,
    }


def plugin_state(cache=PLUGIN_CACHE, registry=REGISTRY):
    """Observe plugin state on THIS machine, right now.

    capture calls this at launch time and freezes the answer into the record.
    postflight calls it again only to detect drift -- never to adjudicate.
    """
    listed = sh('claude plugin list 2>&1 | grep -c soullab-jarvis || true')
    present_list = listed.isdigit() and int(listed) > 0

    reg_present, reg_sha, reg_path, reg_version = False, None, None, None
    try:
        with open(registry) as f:
            data = json.load(f)
        # Real shape: {"plugins": {"<name>@<marketplace>": [ {...} ]}}
        for key, entries in (data.get("plugins") or {}).items():
            if key.split("@")[0] != "soullab-jarvis":
                continue
            reg_present = True
            for ent in (entries if isinstance(entries, list) else [entries]):
                if not isinstance(ent, dict):
                    continue
                reg_sha = ent.get("gitCommitSha") or reg_sha
                reg_path = ent.get("installPath") or reg_path
                reg_version = ent.get("version") or reg_version
            break
    except Exception:
        pass

    digests = {}
    if os.path.isdir(cache):
        for name, recipe in RECIPES.items():
            digests[name] = sh(recipe, cache) or None

    return {
        "present_in_list": present_list,
        "present_in_registry": reg_present,
        "installed_sha": reg_sha,
        "install_path": reg_path or (cache if os.path.isdir(cache) else None),
        "installed_version": reg_version,
        "tree_digests": digests,
        "marketplace_source": sh(
            "claude plugin marketplace list 2>&1 | grep -A1 'soullab$' | tail -1 "
            "| sed 's/.*Directory (//;s/)//' || true") or None,
    }


def cmd_capture(a):
    cwd = os.path.abspath(a.cwd)
    if not os.path.isdir(cwd):
        sys.exit(f"instrument error: --cwd does not exist: {cwd}")

    task_text = open(a.task_file).read().rstrip("\n")
    here = os.path.dirname(os.path.abspath(__file__))
    task_set = a.task_set or os.path.join(here, "emit-task.py")

    rec = {
        "schema": "arm-record/1",
        "status": "PREFLIGHT",
        "arm": a.arm,
        "session_id": None,
        "transcript": None,
        "launch_timestamp": utcnow(),
        "bound_at": None,
        "cwd": cwd,
        "repo": {
            "head": git(cwd, "rev-parse", "HEAD"),
            "tree": git(cwd, "rev-parse", "HEAD^{tree}"),
            "detached": git(cwd, "symbolic-ref", "-q", "HEAD") == "",
            "clean": git(cwd, "status", "--porcelain") == "",
        },
        "plugin": plugin_state(),
        "cli_version": sh("claude --version 2>&1 || true"),
        "launcher": launcher_state(),
        "model": a.model,
        "task_id": a.task_id,
        "task_set_sha": sha256_file(task_set),
        "task_set_path": task_set,
        "task_prompt_sha256": sha256_text(task_text),
        "task_prompt_len": len(task_text),
        "expected_prompt_source": a.expected_prompt_source,
    }

    out = a.out or os.path.join(here, f"arm-{a.arm}-{a.task_id}.json")
    if os.path.exists(out) and not a.force:
        sys.exit(f"refusing to overwrite existing record: {out}\n"
                 f"  an arm record is frozen launch state; pass --force only to "
                 f"discard a launch that never happened.")
    with open(out, "w") as f:
        json.dump(rec, f, indent=2)
        f.write("\n")
    print(f"wrote {out}")
    print(f"  arm={rec['arm']} task={rec['task_id']} plugin_present="
          f"{rec['plugin']['present_in_list']} head={rec['repo']['head'][:9]}")
    print(f"  status=PREFLIGHT  session_id=null")
    lz = rec["launcher"]
    print(f"  launcher={lz['version']}  sha256={(lz['sha256'] or '?')[:16]}…")
    print(f"\nNext: launch the arm by hand from {cwd}, then immediately:")
    print(f"  arm-record.py bind --record {out} --session-id <SESSION-ID>")
    return 0


def cmd_bind(a):
    with open(a.record) as f:
        rec = json.load(f)
    if rec.get("session_id"):
        sys.exit(f"refusing to rebind: {a.record} is already bound to "
                 f"{rec['session_id']}\n  an arm gets one referent, once. "
                 f"To record a different session, capture a new arm record.")
    sid = a.session_id.strip()
    if not sid:
        sys.exit("instrument error: empty --session-id")

    rec["session_id"] = sid
    rec["bound_at"] = utcnow()
    rec["status"] = "LAUNCHED"
    if a.transcript:
        rec["transcript"] = os.path.abspath(a.transcript)
    else:
        slug = rec["cwd"].replace("/", "-")
        guess = os.path.expanduser(f"~/.claude/projects/{slug}/{sid}.jsonl")
        # Derived from the recorded session id and cwd -- not a content search.
        rec["transcript"] = guess

    with open(a.record, "w") as f:
        json.dump(rec, f, indent=2)
        f.write("\n")
    print(f"bound {a.record}")
    print(f"  arm={rec['arm']} session_id={sid}")
    print(f"  transcript={rec['transcript']}")
    if not os.path.exists(rec["transcript"]):
        print("  note: transcript not on disk yet (expected while the arm is running)")
    return 0


def cmd_show(a):
    with open(a.record) as f:
        print(json.dumps(json.load(f), indent=2))
    return 0


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("capture", help="freeze launch state before hand-launching an arm")
    c.add_argument("--arm", required=True)
    c.add_argument("--task", dest="task_id", required=True)
    c.add_argument("--task-file", required=True)
    c.add_argument("--cwd", required=True)
    c.add_argument("--model", required=True)
    c.add_argument("--task-set")
    c.add_argument("--expected-prompt-source", default="typed")
    c.add_argument("--out")
    c.add_argument("--force", action="store_true")
    c.set_defaults(fn=cmd_capture)

    b = sub.add_parser("bind", help="bind the explicit session id captured at launch")
    b.add_argument("--record", required=True)
    b.add_argument("--session-id", required=True)
    b.add_argument("--transcript")
    b.set_defaults(fn=cmd_bind)

    s = sub.add_parser("show")
    s.add_argument("--record", required=True)
    s.set_defaults(fn=cmd_show)

    a = p.parse_args()
    sys.exit(a.fn(a))


if __name__ == "__main__":
    main()
