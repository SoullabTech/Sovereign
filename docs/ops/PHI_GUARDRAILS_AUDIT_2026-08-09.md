# PHI `guardrails` Lane — Read-Only Evidence Audit (2026-08-09)

**No implementation performed.** No code, config, CI, hook, dependency, or policy modified.
Probes used temp files and shadowed binaries only; tree verified clean after each.

Follows `docs/ops/CONTROL_BINDING_AUDIT_2026-08-09.md`. Status vocabulary held distinct throughout:
`EXISTS · REACHABLE · DEPENDENCIES AVAILABLE · FAILURE-CAPABLE · FAILURE-PROPAGATING · EFFECTIVE · BOUND · PROVEN IN LIVE CI`

---

## A. Control topology

`guardrails` (`package.json:60`) is an `&&` chain of **six** legs spanning **two unrelated concerns**:

| # | leg | concern | runtime | impl |
|---|---|---|---|---|
| 1 | `check:nocheck` | type-debt hygiene (`@ts-nocheck` allowlist) | 1s | node + `grep -rl` |
| 2 | `check:private-routes` | architecture (no Next route files in `_backend`) | 0s | node `fs.readdirSync` |
| 3 | `check:backend-imports` | architecture (server/client boundary) | 0s | node `fs.readdirSync` |
| 4 | `guard:ain-v2-integration` | feature-presence assertion | 1s | tsx |
| 5 | `guard:phi` | **PHI security** | **13s** | bash + `rg` + `git ls-files` |
| 6 | `check:no-phi-enc` | **PHI security** | 0s | tsx + `git ls-files` |

**Q9 — does the name describe what it checks?** No. `guardrails` is a generic label over two
security gates (5, 6) and four developer/architecture diagnostics (1–4). Nothing in the name or
output distinguishes "a PHI leak reached a log line" from "a file has `@ts-nocheck`".

**Q10 — which should not be security gates?** Legs 1 and 4 are developer utilities
(type debt; feature-presence). Legs 2 and 3 are architectural safety, adjacent to but not PHI.
Only 5 and 6 are PHI controls.

---

## B. Dependency topology

| dependency | used by | declared? | available in CI? |
|---|---|---|---|
| `rg` (ripgrep) | `guard:phi` **only** | ❌ **NOWHERE** — absent from `dependencies`, `devDependencies`, and every workflow | ⚠️ **UNVERIFIED** — no workflow installs it; presence would be an accident of the runner image |
| `git` | `guard:phi`, `check:no-phi-enc` | implicit (git repo) | ✅ via `actions/checkout` |
| `grep` | `check:nocheck` | implicit (POSIX) | ✅ |
| node / tsx | 1–4, 6 | ✅ `package.json` | ✅ via `npm ci` |

**Q15 — reproducible install path in CI?** For legs 1–4 and 6, yes (`npm ci`). For leg 5, **no**:
the only genuine PHI-scanning leg depends on an undeclared binary that nothing installs.

---

## C. Current reachability

**Every leg has zero callers outside the aggregate, and the aggregate has zero callers.**

| leg | external refs | verdict |
|---|---|---|
| `check:nocheck` / `check:private-routes` / `check:backend-imports` | `package.json` only | unreachable |
| `guard:ain-v2-integration` / `guard:phi` | `package.json` only | unreachable |
| `check:no-phi-enc` | `package.json` + `.claude/settings.local.json` | unreachable (the latter is a **tool-permission allowlist, not a caller**) |

No workflow, hook, or script invokes `guardrails`. **REACHABLE = NO** for the whole tree.

---

## D. Current efficacy — two independent fail-open paths in `guard:phi`

`guard:phi` is FAILURE-CAPABLE in the happy path (exits 1 on the real finding, verified). It is
**not** trustworthy, because it exits **0 with a green checkmark** under two separate conditions:

| condition | simulated by | result |
|---|---|---|
| `rg` absent | `PATH=/usr/bin:/bin` | exit **0**, prints `✅ PHI guardrails: skipped (rg not available)` (`phi-no-plaintext-drift.sh:31-35`) |
| `git ls-files` fails | shadowed failing `git` stub | exit **0**, prints `✅ PHI guardrails: OK` — via the `|| true` on line 15, which yields an empty `FILES` so every loop body is skipped |

Both violate the standing invariant. The second is worse than the first: it prints **`OK`**, not
`skipped` — it is indistinguishable from a genuine pass, and it fired **while the known
`client_email` leak was present in the tree**.

`check:no-phi-enc` is **not FAILURE-CAPABLE** at all without `--strict` (already recorded).

### Scope blind spot (Q14 — the `git ls-files` analogue, and it is larger)

`phi-no-plaintext-drift.sh:10-16` selects `app/**`, `lib/**`, `scripts/**/*.ts`,
`database/migrations/**`. Git's `**` pathspec requires an intervening directory, so **top-level
files are excluded**, and three trees are omitted entirely.

| | files |
|---|---|
| in `guard:phi` scope | 4,786 |
| all tracked `.ts`/`.tsx` in those trees + `components`/`hooks`/`middleware.ts` | 5,948 |
| **unscanned** | **1,162 (19.5%)** |

Unscanned breakdown: `components/` **862** · `scripts/` (top-level) **141** · `lib/` (top-level)
**114** · `hooks/` **38** · `app/` (top-level) **6** · repo root **1**.

**Materiality:** applying the guard's own pattern to the unscanned set finds **no current
violations**. This is **latent risk, not an active leak** — but `components/` is where
member-facing name/email rendering lives, and `no-inline-names` already flags
`components/team/DMProfileCard.tsx:48`.

### Pattern narrowness (efficacy ceiling, not a bug)

- Matches `console.log` **only** — `console.error`/`warn`/`info` and any `logger.*` sink are unmatched.
- Fixed PHI variable list: `client_name|preferred_name|client_email|client_phone|newName`.
  `practitionerName` — a person's name — is **not** on it, and was caught at line 111 only
  incidentally because `client_email` shares the line.
- Regex over text; an aliased variable (`const e = client_email`) defeats it.

### Failure propagation through the aggregate (Q8)

`guardrails` is an `&&` chain, so a non-zero leg short-circuits and propagates. **But** the two
red legs sit at positions 1 and 5: `check:nocheck` (RED) short-circuits **before** `guard:phi` ever
runs. Today, `npm run guardrails` never reaches the PHI legs at all.

---

## E. The concrete PHI finding

```
app/api/practitioner/practice-field/invite/route.ts:111
console.log(`[PracticeField] Invitation sent: ${practitionerName} → ${client_email}, space ${spaceId}`);
```

A client email address and a practitioner name written to application logs. **Repo-wide this is the
only pattern-1 hit**; pattern-2 (PHI as separate argument) has zero hits.

**Q12 — independent confirmation:** yes. `check:no-inline-names` flags the *same file* at line 51
(`preferred_name || name` inline resolution producing `practitionerName`, the very variable logged
at 111). Two instruments, different policies, same artifact — and both unbound.

**Q13 — additional acceptance cases:** `check:nocheck` is red on 6+ files
(`lib/beta/BetaExperienceDesign.ts`, `lib/beta/MaiaMonitoring.ts`, …); `no-inline-names` is red on
6 sites. For **PHI specifically, line 111 is the only live case** — a single, unambiguous acceptance
target.

---

## F. Adversarial evidence obtainable without touching production

1. **Real positive** — line 111 (exists today; no fixture needed).
2. **Fail-open probes** — shadowing `rg`/`git` on `PATH`, as done here. Repeatable, zero footprint.
3. **Scope probes** — set-difference of pathspecs against `git ls-files`.
4. **Synthetic negatives** — temp files under `components/` and top-level `lib/` to demonstrate the
   blind spot; delete after.
5. **Sink-variant probes** — `console.error` with an in-list PHI var, to demonstrate the narrowness.

All five are available pre-repair, so a repaired guard can be proven against a real defect rather
than a happy path.

---

## G. Repair boundary — *if* authorized (nothing done)

Ordered; **1–2 are the trust prerequisites and are independent of the PHI fix**:

1. **Fail closed on missing dependency** — `rg` absent must exit non-zero or emit an explicit
   `BLOCKED/INDETERMINATE`; never `✅ skipped`.
2. **Fail closed on empty enumeration** — remove `|| true` on line 15; an empty `FILES` must be an
   error, never a silent pass. *(This is the more dangerous of the two — it prints `OK`.)*
3. **Declare the dependency** — install `rg` in CI, or reimplement in node/`grep` and remove the
   binary dependency entirely (leg 5 is the only `rg` consumer in the repo).
4. **Close the scope gap** — add `components/`, `hooks/`, `middleware.ts`, and top-level
   `app|lib|scripts` files; expect a re-baseline pass over 1,162 newly-scanned files.
5. **Widen sinks / PHI list** — `console.*` and `logger.*`; add `practitionerName`-class names.
6. **The production PHI fix itself** — line 111. *Separate change, separate review.*

Steps 1–2 are cheap and self-contained. Step 4 may surface new findings and should be expected to,
not treated as regression.

## H. Binding boundary — *if* warranted, after repair

Bind the **PHI subset only** (`guard:phi` + `check:no-phi-enc --strict`) as a distinct
security gate — not the six-leg aggregate. CI (`pull_request`) is the right boundary: `guard:phi`
takes **13s**, tolerable in CI, heavy for every commit. Binding must not sit behind the red
`check:nocheck`, which currently short-circuits before the PHI legs run.

## I. Residual limitations

- Whether GitHub's `ubuntu-latest` image ships `rg` is **unverified**; irrelevant if step 3 removes
  the dependency, decisive if it does not.
- Regex/grep analysis cannot follow aliasing, destructuring, or object spread. This guard reduces
  drift; it does not prove absence of PHI logging. That limit should be stated wherever it is cited.
- The 1,162-file expansion is unmeasured for new findings until step 4 runs.

## J. Recommendation

**Split the aggregate. Two dispositions, not one:**

- `guardrails` as it stands → **RECLASSIFY-AS-UTILITY.** It is a developer aggregate wearing a
  security name. It should not be bound to CI as a gate in its current shape, and its name should
  stop implying enforcement.
- PHI subset (`guard:phi` + `check:no-phi-enc`) → **REPAIR-THEN-BIND**, extracted into an explicitly
  named PHI gate. Trust prerequisites G1–G2 must land **before** any binding; a fail-open control
  bound to CI is strictly worse than an unbound one, because it manufactures a green signal.

Answering the lane's framing question — *can `guardrails` honestly be called a guard at all?* — **as
currently constituted, no.** It cannot be reached, its only real PHI scanner fails open two
different ways, its most security-relevant leg is unreachable behind a red hygiene check, and its
name describes none of this. The individual PHI logic is sound and catches a real defect; the
aggregate around it is not a control.

## K. No implementation performed

Confirmed. Awaiting authorization.
