# PHI Legacy Redundancy Audit — 2026-08-10

**Read-only.** No code, config, CI, hook, or branch-protection change in this unit. Nothing deleted,
nothing weakened, nothing retired.

Scope: does `guard:phi` / `scripts/guards/phi-no-plaintext-drift.sh` provide any detection capability
not already covered by the canonical `check:phi-gate` / `scripts/guards/phi-log-gate.ts`?

Evidence gathered in worktree at `chore/phi-log-gate-unit`, HEAD `cad42b8678935a4f13187e980b6ba24fae19348f`,
tree clean, PR #999 `mergeable_state: clean` at time of audit.

---

## 0. State re-established

| fact | value |
|---|---|
| HEAD / branch | `cad42b867…` / `chore/phi-log-gate-unit` |
| PR #999 | open, draft, `mergeable_state: clean` |
| `check:phi-gate` | `npx tsx scripts/guards/phi-log-gate.ts` — unchanged from prior units |
| `guard:phi` | `bash scripts/guards/phi-no-plaintext-drift.sh` |
| `.githooks/pre-commit` | branch guard → no-supabase → no-openai → no-direct-anthropic → **check:phi-gate** (unchanged this unit) |
| CI caller | `.github/workflows/sovereignty-gate.yml`, step "PHI / sensitive logging gate" → `check:phi-gate` |
| required merge contexts | `build`, `check-diagrams`, `sovereignty` (strict:true) — unchanged |

## 1. Control identity — both names are one file

`guard:phi` **is** `phi-no-plaintext-drift.sh` — the npm script is a one-line wrapper
(`bash scripts/guards/phi-no-plaintext-drift.sh`), not two separate controls. Reported once.

```text
CONTROL:                    guard:phi (npm script) / phi-no-plaintext-drift.sh (the script it wraps)
PATH:                       scripts/guards/phi-no-plaintext-drift.sh
LANGUAGE:                   bash + ripgrep (external binary, declared nowhere in this repo)
CALLERS:                    package.json "guardrails" aggregate — the ONLY caller anywhere in the
                             tracked repo (git grep for `npm run guard:phi` / `npm run guardrails`
                             across every tracked file: one hit, the package.json definition itself)
LOCAL HOOK:                  NOT called — .githooks/pre-commit contains no reference to guard:phi,
                             guardrails, or phi-no-plaintext-drift.sh
CI:                          NOT called — grep across every .github/workflows/*.yml for phi|guard
                             matches only sovereignty-gate.yml (calls check:phi-gate, not guard:phi)
                             and deploy.yml (matches "leak guardrail" → scripts/ci/leak-guard.sh, an
                             unrelated secrets-scanning control, confirmed by reading the exact line)
PACKAGE SCRIPT:               guard:phi defined; its one caller, `guardrails`, is ITSELF uncalled —
                             not in the hook, not in CI, not in preflight, not in any deploy script
                             (scripts/preflight-compose-config.sh, scripts/pre-deploy-gate.sh,
                             scripts/deploy-production.sh all grepped, zero matches)
MANUAL ONLY:                 YES — reachable only by a human typing `npm run guard:phi` or
                             `npm run guardrails` directly at a terminal
CURRENTLY LOAD-BEARING:       NO
```

Also checked and ruled out as documentation drift: no tracked `*.md` outside `docs/ops/` (which
already documents this divergence accurately) claims `guard:phi` or `guardrails` is a live, wired
control.

## 2. Detection-rule comparison — the two scanners' policies are identical

`phi-log-gate.ts` states in its own header that detection is *"preserved byte-for-byte from
phi-no-plaintext-drift.sh."* Verified directly against both current sources, rule by rule:

| # | rule | legacy pattern | canonical pattern | match |
|---|---|---|---|---|
| 1 | PHI value interpolated into `console.log` | `console\.log.*\$\{(client_name\|preferred_name\|client_email\|client_phone\|newName)\}` | identical | ✅ byte-identical |
| 2 | PHI value as a separate `console.log` argument | `console\.log\([^)]*,\s*(client_name\|preferred_name\|client_email\|client_phone\|row\.name\|row\.email)\s*[,)]` | identical | ✅ byte-identical |
| 3 | decrypt-failure → plaintext fallback (**warn**, not fail) | `catch.*\|\|.*\.name\b\|\.catch\(\).*row\.name` | identical | ✅ byte-identical |
| 4 | plaintext PHI column in a migration (**warn**, not fail) | `ADD COLUMN\s+(client_name\|preferred_name\|client_email\|client_phone)\s+(VARCHAR\|TEXT)` | identical | ✅ byte-identical |

Exemption paths for rule 3 (`scripts/backfill-*`, `scripts/**/backfill-*`, `scripts/**/migrate-*`,
`scripts/guards/*`) are also identical between the two. **No detection-rule gap in either
direction.** Neither scanner catches anything the other's regex set doesn't also express.

## 3. Scope comparison — canonical is a strict superset

| | legacy (`git ls-files` pathspecs) | canonical (prefix + extension in JS) |
|---|---|---|
| dirs | `app/**` `lib/**` `scripts/**` | `app/` `lib/` `components/` `hooks/` `scripts/` + `middleware.ts` |
| extensions | `.ts`/`.tsx` for app,lib; `.ts` only for scripts | `.ts` `.tsx` `.js` `.jsx` `.mjs` uniformly |
| enumeration mechanism | `git ls-files` with `**` pathspecs | `git ls-files` (no pathspec) filtered by prefix in JS |

Git's `**` pathspec requires an intervening directory — already quantified in
`docs/ops/PHI_GATE_REPAIR_2026-08-09.md`: this silently excluded **every top-level file** in
`app/`, `lib/`, `scripts/`, plus `components/`, `hooks/`, and `middleware.ts` entirely — 1,162 files
(19.5% of the population) at the time of that measurement. Canonical's population has since grown
to 6,158 tracked source files + 446 migrations (re-verified this session).

**Set-inclusion check, not just a count comparison:** every legacy pathspec (`app/**/*.ts`,
`app/**/*.tsx`, `lib/**/*.ts`, `lib/**/*.tsx`, `scripts/**/*.ts`) implies "nested under that
top-level dir, extension in canonical's extension list" — which is exactly canonical's own
membership test, minus the nesting restriction. **There is no file matched by a legacy pathspec that
canonical's enumeration excludes.** The reverse is false in 19.5% of cases (top-level files,
`components/`, `hooks/`, `middleware.ts`, `.js`/`.jsx`/`.mjs` anywhere).

## 4. One genuine asymmetry found — narrow, and non-load-bearing

Legacy's rule-4 migration check (§73–80 of the script) does **not** use the `git ls-files`-derived
file list at all. It runs `rg -l ... "$ROOT/database/migrations"` directly against the **filesystem
directory**, recursively — meaning it would notice a plaintext-PHI-column pattern in a migration
file that is untracked (never `git add`ed). Canonical's equivalent filters `git ls-files` output by
`MIGRATION_RE`, so it only sees tracked (or at least staged) files.

This is a real, if narrow, capability legacy has that canonical does not. It is **not currently
load-bearing**, for three independent reasons:

1. It only affects rule 4, which is a **warning**, not a fail, in both scanners.
2. It requires **manually** running `npm run guard:phi` (or `guardrails`) against a dirty working
   tree containing an unstaged `.sql` file — a scenario with zero installed callers to trigger it.
3. The moment such a file is staged (a precondition for it ever reaching a commit, the pre-commit
   hook, or CI), canonical sees it identically — `git ls-files` includes staged-but-uncommitted
   content.

## 5. A second asymmetry found this unit — legacy is less reliable, not more capable

`phi-no-plaintext-drift.sh:55` iterates its file list via
`while IFS= read -r f; do ... done < <(printf "%s\n" $FILES)` — **`$FILES` is unquoted.** Unquoted
shell expansion word-splits on whitespace before `printf` ever sees it, so any tracked filename
containing a space would be silently split into fragments, corrupting the loop for that file (it
would then fail the `[ -f "$ROOT/$f" ]` guard and be skipped without any error or warning).

Checked empirically: **zero tracked source files under the scanned directories currently contain a
space** in their path, so this defect is latent, not live. It is nonetheless a real reliability gap
that canonical does not share — `phi-log-gate.ts` processes `git ls-files` output via JavaScript's
`.split("\n")`, which does not word-split on spaces; a space-containing filename is handled
correctly. Filed here rather than fixed, per this unit's read-only mandate — legacy is not being
repaired, only characterized.

Combined with the two fail-open defects already established in prior units (`rg` absent → false
green; `git ls-files` failure via unguarded `|| true` → false green while a real leak was present),
this is the **third** distinct reliability defect found in the legacy scanner, none of which have
any equivalent in the canonical gate.

## 6. Adjacent, explicitly out of scope

`check:no-phi-enc` (`scripts/check-no-phi-enc-in-responses.ts`) is a fifth leg of the same
`guardrails` aggregate and is PHI-adjacent (it scans for encrypted-field leakage into API responses,
a different failure mode than log-content scanning). The mission named only `guard:phi` and
`phi-no-plaintext-drift.sh`. Noted for completeness; not assessed for redundancy here — its
`--strict` posture is a separately tracked open decision (`docs/ops/PRECOMMIT_RECONCILIATION_2026-08-09.md`).

---

## Summary

| dimension | legacy (`guard:phi`) | canonical (`check:phi-gate`) |
|---|---|---|
| detection rules | 4, identical to canonical | 4, identical to legacy |
| source file scope | strict subset of canonical | strict superset of legacy |
| migration scope | broader in one respect (untracked files, manual-only, warn-level) | tracked/staged only |
| dependency | `rg`, undeclared, absence → false green | none beyond `git` |
| fail-open defects | 3 found (rg-absent, empty-enumeration, unquoted-word-split) | 0 |
| local hook | not called | 4th leg, proven positive + negative |
| CI | not called | bound, proven positive + negative |
| merge binding | not called | required context `sovereignty`, proven blocking |
| reachability | manual only, two hops from any installed trigger | fully wired end-to-end |

**Answer to the governing question:** *can the older controls be retired without reducing the
effective detection set?* — **Yes, with one qualification worth stating precisely.** "Effective"
must mean the set of violations actually caught by *installed, reachable* controls, since an
unreachable control catches nothing in practice regardless of what its regex could match. Under
that definition, legacy's detection rules are a strict subset of canonical's, its file scope is a
strict subset except for the narrow untracked-migration case (§4), and it is invoked by nothing
automated. Its retirement would not remove any coverage that currently reaches a developer or a PR.

The qualification: §4's untracked-migration capability is real, narrow, and would be lost on
retirement — worth a one-line decision (accept the loss, or port that one behavior into the
canonical gate) rather than silent disappearance, if and when retirement is authorized. That
decision, and retirement itself, are **not** performed in this unit.

## Not done in this unit

No deletion. No CI change. No hook change. No branch-protection change. No weakening of any
scanner. `guard:phi`, `guardrails`, and `phi-no-plaintext-drift.sh` remain exactly as they were.
