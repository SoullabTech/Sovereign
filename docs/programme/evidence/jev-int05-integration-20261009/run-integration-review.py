#!/usr/bin/env python3
"""JEV-INT-05 integration review runner (convenience orchestration — NOT itself evidence).

Adapted from the Mac session's pinned runner (docs/programme/evidence/jev-int05-live-hardening-20261007/run-review.py). It runs the declared
suite against ONE exact commit and writes a receipt. Evidence exists only when a reviewer runs it on the Mac/T7 against the exact commit.
Only localhost / synthetic tests: no provider contact, no credential, no spend. The committed switch is never edited.

Usage (from a clean checkout / detached worktree of the exact commit, with the project node_modules present):
    python3 docs/programme/evidence/jev-int05-integration-20261009/run-integration-review.py --head <full commit sha> \
        --second-device-root "/Volumes/T7 Shield" [--out DIR]
"""
import argparse, concurrent.futures, datetime, hashlib, json, os, re, shlex, signal, subprocess, sys, time
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument('--head', required=True, help='full 40-hex commit the working tree must be at')
ap.add_argument('--second-device-root', default=os.environ.get('JEV_TEST_SECOND_DEVICE_ROOT', ''), help='MOUNT POINT on a second device (e.g. "/Volumes/T7 Shield")')
ap.add_argument('--out', default='')
ap.add_argument('--workers', type=int, default=3)
a = ap.parse_args()

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]
BASE = '41caa8f79af488fd8ea82442fe3586f03b13d15e'           # the code the Mac reviewed (findings LW1-LW4)
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
git = lambda *x: subprocess.check_output(['git', *x], cwd=REPO, text=True).strip()
node = subprocess.check_output(['which', 'node'], text=True).strip()

# ── preconditions ─────────────────────────────────────────────────────────────
head = git('rev-parse', 'HEAD')
assert head == a.head, f'HEAD {head} != pinned {a.head}'
assert not git('status', '--porcelain', '--untracked-files=no'), 'tracked tree is not clean'
assert (REPO / 'node_modules/typescript/bin/tsc').exists() and (REPO / 'node_modules/tsx/dist/cli.mjs').exists(), 'project node_modules (typescript, tsx) required'
assert a.second_device_root and os.path.isdir(a.second_device_root), 'a mounted second-device root is required (never run green without it)'
assert os.stat(a.second_device_root).st_dev != os.stat(os.environ.get('TMPDIR') or '/tmp').st_dev, 'second-device root is on the same device as the temp directory'
out = Path(a.out) if a.out else Path.home() / '.maia-evidence' / f'jev-int05-integration-{head[:9]}-{int(time.time())}'
out.mkdir(parents=True, exist_ok=True)
env = {k: v for k, v in os.environ.items() if k in ('PATH', 'HOME', 'TMPDIR', 'USER', 'LANG', 'LC_ALL', 'SHELL')}
env['JEV_TEST_SECOND_DEVICE_ROOT'] = a.second_device_root

# ── process checks ────────────────────────────────────────────────────────────
B = 'scripts/builder/__tests__/'
checks = [  # (name, argv, timeout_s, [required substrings], expected_exit)
 ('live-proof-1', [B + 'jev-wire-live-run-v1-proof.mjs'], 120, ['16 passed · 0 failed'], 0),
 ('live-proof-2', [B + 'jev-wire-live-run-v1-proof.mjs'], 120, ['16 passed · 0 failed'], 0),
 ('live-proof-3', [B + 'jev-wire-live-run-v1-proof.mjs'], 120, ['16 passed · 0 failed'], 0),
 ('live-matrix', [B + 'jev-wire-live-run-v1-matrix.mjs'], 600, ['HARNESS-GUARD  5/5', '41/41 candidates killed on their named check · 0 problems'], 0),
 ('live-old-negative-control', [B + 'jev-wire-live-run-v1-proof.mjs'], 120, ['11 passed · 5 failed', 'FAIL  L10-', 'FAIL  L13-', 'FAIL  L14-', 'FAIL  L15-', 'FAIL  L16-'], 1),
 ('differential', [B + 'jev-wire-live-run-v1-differential.mjs', '--label', 'integrated'], 240, ['14 pass · 0 SAFETY/REPORT failures', '4 advisory notes [D6b, D6d, D7b, D8b]'], 0),
 ('differential-matrix', [B + 'jev-wire-live-run-v1-differential-matrix.mjs'], 3000, ['HARNESS-GUARD  16/16', '15/15 candidates killed on exactly their named scenarios · 0 problems'], 0),
 ('adapter-proof', [B + 'jev-wire-http-adapter-v1-proof.mjs'], 120, ['18 passed · 0 failed'], 0),
 ('adapter-matrix', [B + 'jev-wire-http-adapter-v1-matrix.mjs'], 600, ['23/23 candidates killed on their named check · 0 problems'], 0),
 ('checkpoint-proof', [B + 'jev-wire-checkpoint-v1-proof.mjs'], 120, ['16 passed · 0 failed'], 0),
 ('checkpoint-matrix', [B + 'jev-wire-checkpoint-v1-matrix.mjs'], 600, ['28/28 candidates killed on their named check · 0 problems'], 0),
 ('wire-proof', [B + 'jev-wire-v1-proof.mjs'], 120, ['37 passed · 0 failed'], 0),
 ('wire-matrix', [B + 'jev-wire-v1-matrix.mjs'], 900, ['49/49 candidates killed on their named check · 0 problems'], 0),
 ('findings-old', [B + 'jev-wire-v1-findings-repro.mjs', 'old'], 120, ['old: 8/8 findings reproduce'], 0),
 ('findings-new', [B + 'jev-wire-v1-findings-repro.mjs', 'new'], 120, ['new: 0/8 findings reproduce'], 0),
 ('J1-freeze', ['scripts/verify-jarvis-jev-j1-freeze.mjs'], 120, ['0 FREEZE INTACT'], 0),
 ('J1-host', [B + 'jev-judgment-host-v1-proof.mjs'], 120, ['JEV-INT-02H HOST MEMBRANE — PASS'], 0),
 ('J1-matrix', ['node_modules/tsx/dist/cli.mjs', 'tests/constitutional/jarvis-jev-j1/matrix.ts'], 300, ['MATRIX LETHAL + DISCRIMINATING'], 0),
 ('J1-typecheck', ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.jarvis-jev-j1.json'], 300, [], 0),
]
# negative control for the differential: the code the Mac reviewed must FAIL it on exactly the thirteen original gaps
base_wrapper = out / 'base-wrapper-41caa8f79.mjs'
base_wrapper.write_text(git('show', f'{BASE}:scripts/builder/jev-wire-live-run-v1.mjs') + '\n')
checks.append(('differential-base-negative-control', [B + 'jev-wire-live-run-v1-differential.mjs', '--label', 'BASE', '--wrapper', str(base_wrapper)], 240,
               ['1 pass · 13 SAFETY/REPORT failures [D1, D2, D3, D5, D6a, D6c, D7, D8, D9, D10a, D10b, D10c, D11]'], 1))

def run(entry):
    name, argv, timeout, must, want_exit = entry
    cmd = [node] + argv
    item_env = env.copy()
    if name == 'live-old-negative-control': item_env['JEV_LR_SOURCE_COMMIT'] = BASE
    t0 = time.monotonic(); start = now(); path = out / (name + '.log.txt'); code = None; err = None
    with path.open('w') as f:
        f.write('COMMAND=' + shlex.join(cmd) + f'\nSOURCE_HEAD={head}\nCWD={REPO}\nSTARTED_AT={start}\nTEST_SECOND_DEVICE={a.second_device_root}\n\n'); f.flush()
        try:
            proc = subprocess.Popen(cmd, cwd=REPO, env=item_env, stdout=f, stderr=subprocess.STDOUT, start_new_session=True)
            try: code = proc.wait(timeout=timeout)
            except subprocess.TimeoutExpired:
                err = 'TIMEOUT'; os.killpg(proc.pid, signal.SIGTERM)
                try: code = proc.wait(timeout=3)
                except subprocess.TimeoutExpired: os.killpg(proc.pid, signal.SIGKILL); code = proc.wait()
        except Exception as ex: err = type(ex).__name__ + ': ' + str(ex)
        end = now(); f.write(f'\nEXIT_CODE={code}\nEXECUTION_ERROR={err}\nFINISHED_AT={end}\n')
    text = path.read_text()
    valid = code == want_exit and err is None and all(s in text for s in must)
    if name == 'live-old-negative-control': valid = valid and text.count('FAIL  ') == 5
    return dict(name=name, command=cmd, exit_code=code, expected_exit=want_exit, error=err, validated=valid, log=str(path.name), log_sha256=sha(path), elapsed_sec=round(time.monotonic() - t0, 3), started_at=start, finished_at=end)

# ── custody checks (no process; exact comparisons) ────────────────────────────
M_BLOBS = {  # the Mac-authored hardening b48e0c623, adopted UNCHANGED (founder decision A)
 'scripts/builder/jev-wire-live-run-v1.mjs': '32a5b51dde5cd93b1917fc1306abf055ca635943',
 'scripts/builder/__tests__/jev-wire-live-run-v1-proof.mjs': '672e55dd13024bb6f606cb42ddeb28383e0e5999',
 'scripts/builder/__tests__/jev-wire-live-run-v1-matrix.mjs': '72f1f0ba44b221e6b4a7e12772ba159d85448ab7',
}
FROZEN_SHA256 = {
 'scripts/builder/jev-wire-v1.mjs': '16ba1e3bcec8fd5bc8a68077ab634a6faedd39877c58b98f206d1e3bcc7904f0',
 'scripts/builder/jev-wire-checkpoint-v1.mjs': 'e03c37c5cf663c1d68b610f5dfda728d9d96ff227ea289fbe657254322c5e704',
 'scripts/builder/jev-wire-http-adapter-v1.mjs': 'c7b52e22714c116a641ead404e70736e2b9701a98b3fe57d34bb31b2958e75ac',
 'scripts/builder/jev-judgment-host-v1.mjs': '751d473df62eac31347d2a471e054e9cd5f851ac449e9086e147ba641b3e897b',
}
def custody():
    r = {}
    r['wrapper_proof_matrix_equal_M'] = {p: (git('hash-object', p) == b == git('rev-parse', f'HEAD:{p}')) for p, b in M_BLOBS.items()}
    r['frozen_sha256_equal'] = {p: sha(REPO / p) == h for p, h in FROZEN_SHA256.items()}
    r['frozen_unchanged_vs_base'] = {p: git('rev-parse', f'HEAD:{p}') == git('rev-parse', f'{BASE}:{p}') for p in list(FROZEN_SHA256) + ['scripts/builder/__tests__/jev-wire-variant-lib.mjs']}
    changed = git('diff', '--name-only', BASE, 'HEAD').splitlines()
    r['changed_paths_vs_base_outside_docs'] = [p for p in changed if not p.startswith('docs/')]
    allowed = {'scripts/builder/jev-wire-live-run-v1.mjs', 'scripts/builder/__tests__/jev-wire-live-run-v1-proof.mjs', 'scripts/builder/__tests__/jev-wire-live-run-v1-matrix.mjs',
               'scripts/builder/__tests__/jev-wire-live-run-v1-differential.mjs', 'scripts/builder/__tests__/jev-wire-live-run-v1-differential-matrix.mjs',
               'scripts/builder/__tests__/jev-wire-payload-capture.mjs', 'package.json'}
    r['unexpected_code_paths_changed'] = [p for p in r['changed_paths_vs_base_outside_docs'] if p not in allowed]
    r['untouched_trees_vs_base'] = {t: git('diff', '--name-only', BASE, 'HEAD', '--', t) == '' for t in ('lib', 'app', 'database', 'tests', 'tsconfig.jarvis-jev-j1.json', 'scripts/verify-jarvis-jev-j1-freeze.mjs')}
    r['pilot_paths_changed'] = [p for p in changed if re.search(r'pilot|jev-label', p, re.I)]
    r['response_shape_witnessed'] = subprocess.check_output([node, '-e', "import('./scripts/builder/jev-wire-v1.mjs').then(m=>console.log(String(m.RESPONSE_SHAPE.witnessed)))"], cwd=REPO, text=True).strip()
    tpl = json.loads((REPO / 'docs/programme/JEV-INT-05_EXECUTION_GRANT_TEMPLATE.json').read_text())
    r['grant_template_state'] = tpl['state']
    r['grant_template_table_hash_is_closed_candidate'] = tpl['table_hash'] == subprocess.check_output([node, '-e', "import('./scripts/builder/jev-wire-v1.mjs').then(m=>console.log(m.questionTableHash()))"], cwd=REPO, text=True).strip()
    r['code_tree_ids'] = {**{t: git('rev-parse', f'HEAD:{t}') for t in ('scripts/builder', 'tests/constitutional')}, 'package.json': git('rev-parse', 'HEAD:package.json')}
    r['all_ok'] = (all(r['wrapper_proof_matrix_equal_M'].values()) and all(r['frozen_sha256_equal'].values()) and all(r['frozen_unchanged_vs_base'].values())
                   and not r['unexpected_code_paths_changed'] and all(r['untouched_trees_vs_base'].values()) and not r['pilot_paths_changed']
                   and r['response_shape_witnessed'] == 'false' and r['grant_template_state'] == 'DRAFT' and r['grant_template_table_hash_is_closed_candidate'])
    return r

print('PINNED_REVIEW_HEAD', head, 'COMMANDS', len(checks), 'OUT', out, flush=True)
cust = custody(); (out / 'custody.json').write_text(json.dumps(cust, indent=2) + '\n')
print('CUSTODY_ALL_OK', cust['all_ok'], flush=True)
results = {}
with concurrent.futures.ThreadPoolExecutor(max_workers=a.workers) as pool:
    for fut in concurrent.futures.as_completed([pool.submit(run, c) for c in checks]):
        row = fut.result(); results[row['name']] = row
        print(row['name'], 'EXIT', row['exit_code'], 'VALID', row['validated'], 'LOG_SHA256', row['log_sha256'], flush=True)
ordered = [results[c[0]] for c in checks]
state = {'head': head, 'baseline': BASE, 'generated_at': now(), 'node': subprocess.check_output([node, '--version'], text=True).strip(),
         'second_device_root': a.second_device_root, 'custody': cust, 'checks': ordered,
         'all_valid': all(x['validated'] for x in ordered) and cust['all_ok'], 'fake_only': True, 'real_provider_calls': 0, 'real_spend_usd': 0}
(out / 'receipt.json').write_text(json.dumps(state, indent=2) + '\n')
with (out / 'SHA256SUMS.txt').open('w') as f:
    for p in sorted(out.iterdir()):
        if p.name != 'SHA256SUMS.txt': f.write(f'{sha(p)}  {p.name}\n')
for item in ordered:
    for line in (out / item['log']).read_text().splitlines():
        if any(s in line for s in ('passed ·', 'candidates killed on', 'findings reproduce', 'FREEZE INTACT', 'MATRIX LETHAL', 'HOST MEMBRANE', ' pass · ', 'HARNESS-GUARD')):
            print(item['name'], line[:200], flush=True)
print('RECEIPT_SHA256', sha(out / 'receipt.json')); print('ALL_VALID', state['all_valid'], flush=True)
sys.exit(0 if state['all_valid'] else 1)
