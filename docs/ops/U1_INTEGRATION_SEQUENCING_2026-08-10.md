# U1 Integration Sequencing — Sovereignty Gate bootstrap condition

**Date:** 2026-08-10 · **Status:** governance mechanism verified; **no admin bypass required**

## The condition that prompted this record

Branch protection on `clean-main-no-secrets` requires three status contexts:
`build`, `check-diagrams`, **`sovereignty`**. The workflow that emits `sovereignty`
(`.github/workflows/sovereignty-gate.yml`, job id `sovereignty`) did **not** exist on
trunk. PR #1007 (U1, Class A) was therefore BLOCKED by a required check that could
not report.

The apparent conclusion was a chicken-and-egg: the gate cannot report until it is on
trunk, so installing the gate would itself need an admin merge.

## ⚠️ CORRECTION — the chicken-and-egg does NOT apply to #999

**It was verified, not assumed.** After bringing `chore/phi-log-gate-unit` up to date
with trunk, PR #999 reports:

```
mergeState: CLEAN
  auto-label:      SUCCESS
  check-diagrams:  SUCCESS
  covenant-gates:  SUCCESS
  build:           SUCCESS
  sovereignty:     SUCCESS     ← the required context, reporting
```

For a **same-repo** pull request, GitHub runs `on: pull_request` workflows from the
**head** branch. #999 carries `sovereignty-gate.yml`, so it satisfies the required
context on its own. An earlier statement in this lane — *"#999 is the one place an
admin merge is structurally unavoidable"* — was **wrong** and is retracted.

**Consequence: no admin merge is warranted anywhere in this chain.** The bootstrap
exception that was being weighed is unnecessary. The governance system can govern
this change without bypass — including installing its own missing gate.

## Why the required context was not "stale"

Removing the `sovereignty` context would have deleted a **real** control, not a dead
one. The workflow's own header records that it binds a pre-existing `ci:sovereignty`
aggregate that *"was defined and green but had ZERO callers — no workflow invoked
it."* Branch protection was configured **ahead of** the workflow that satisfies it.
The defect was a missing caller, not an obsolete requirement.

## Scope verification of #999 (unchanged after update to trunk)

13 files · +1391 / −70 · coherent single purpose:

| Area | Files |
|---|---|
| The missing gate | `.github/workflows/sovereignty-gate.yml` (+60) |
| PHI log guard | `scripts/guards/phi-log-gate.ts`, `scripts/guards/__proof__/phi-log-gate.proof.ts` |
| Local hooks | `.githooks/pre-commit`, `scripts/setup-githooks.sh`, `.gitignore`, `package.json` |
| Records | 5 × `docs/ops/*audit*.md` |
| **Product** | `app/api/practitioner/practice-field/invite/route.ts` (+4/−4) — stops logging client email + practitioner name |

The single product file **is** the PHI leak the gate exists to prevent — the unit's
subject, not unrelated work. Touches **no** Sacred Boundary path, so `class-b` is
correct. Scope is byte-identical before and after the trunk update.

## Two acts, kept separate in the record

| | #999 — governance mechanism | #1007 — governed change |
|---|---|---|
| Class | `class-b` | **`class-a`** (touches `lib/memory/`) |
| Purpose | installs the `sovereignty` gate | durable turn acceptance (U1) |
| Checks | **CLEAN — all 5 green** | build/check-diagrams/covenant-gates green; `sovereignty` cannot report until #999 lands |
| Admin bypass | **not needed** | **must never be used** |
| Approvals | per Class B | **Founder-Steward + 2 Council votes + 1 Mentor verification — OUTSTANDING** |

⛔ **#1007 must not be admin-merged under any circumstance.** It is the governed
Class A change the mechanism exists to control. Its approval boxes are deliberately
unchecked; the author (automation) classified only.

## Remaining sequence

1. ~~Bring `chore/phi-log-gate-unit` up to date with trunk~~ — **done** (`7991c38ab`, 0 behind)
2. ~~Re-verify scope after update~~ — **done**, unchanged
3. ~~Record the condition~~ — this file
4. ~~Merge #999~~ — **done, NORMAL merge** (`ca43f8ccd`). It was a **draft**; marked ready
   for review first (founder-authorized), then merged through the ordinary path.
   **No admin merge. No branch-protection change. No bypass.**
5. ~~Confirm the gate now runs from trunk~~ — **done**, see below
6. Obtain the real Class A approvals for #1007 — **OUTSTANDING**
7. Merge #1007 normally once all required checks pass
8. Deploy U1, then run the prepared production proof

## Proof the gate is live on trunk

- `.github/workflows/sovereignty-gate.yml` exists at `origin/clean-main-no-secrets`,
  job id `sovereignty`.
- Sovereignty Gate run **31445397072** — `event=push`, `sha=ca43f8ccd`, **success**.
  The gate executed from trunk itself, not from a feature branch.

### Mechanical nuance worth keeping

For **same-repo** PRs, GitHub runs `on: pull_request` workflows from the **head**
branch. Landing the workflow on trunk therefore does **not** retroactively add a
`sovereignty` check to already-open PRs: #1007 still shows no `sovereignty` check and
is now `BEHIND` by 13 commits.

This is self-consistent rather than a problem: protection sets `strict: true`, so every
branch must be brought up to date with trunk before merging — and any branch that is
up to date necessarily carries the workflow, so the check reports. The mechanism now
closes on itself without exception.

## Production deployment of `ca43f8ccd` (security/governance delta — separate from U1)

Deployed **2026-08-11T00:28:19Z** via the canonical quick lane with an explicitly
named immutable SHA:

```bash
scripts/pre-deploy-gate.sh deploy-maia ca43f8ccd
```

Chosen over the full deploy because the runtime delta is a **single app route**
(`practice-field/invite`) with no migration, no schema change, and no other service
touched. The quick lane still refreshed rollback tags (`:current` / `:previous` /
`:ca43f8ccd`) and ran the fail-closed post-swap provenance verify.

### Verification

| Check | Result |
|---|---|
| Deploy exit | `0`; `[deploy-ctx:ok] GIT_COMMIT=ca43f8ccd == asserted ca43f8ccd` |
| `printenv GIT_COMMIT` | **`ca43f8ccd`** |
| `printenv DEPLOY_LANE` | `deploy-lane` — came through the sanctioned lane, not a bare compose build |
| Container | created `2026-08-11T00:28:19Z`, **Up (healthy)** |
| `/api/health` | `200`, `version: ca43f8ccd`, `uptime: 92` |
| LAN IP | `192.168.0.104` — matches router port-forward target |
| Other services | all 8 containers healthy |
| Errors since deploy | **0** |

### PHI log-leak fix — verified in the deployed artifact

`"Invitation sent"` occurs **exactly once** in the built route
(`.next/server/app/api/practitioner/practice-field/invite/route.js`), and that single
occurrence is the sanitized form:

```
Invitation sent: space ${l}, steward ${b.slice(0,8)}
```

No `client_email`, no `practitionerName`. The pre-fix form (`${practitionerName} →
${client_email}`) is **absent from the shipped bundle**.

### Route regression

Unauthenticated `POST /api/practitioner/practice-field/invite` → **`401
{"error":"Not authenticated"}`** in 11 ms. Route loads and enforces auth; no crash.

⚠️ **No real invite was sent.** Verification used an unauthenticated probe plus static
inspection of the built bundle, deliberately, because triggering a genuine invite
would email a real person.

## State at time of writing

```
trunk:               ca43f8ccd  (Merge pull request #999)
production:          ca43f8ccd  ✅ DEPLOYED AND VERIFIED — security delta closed
#999                 MERGED normally, all 5 checks green including sovereignty
#1007                impl 86649f5f1 · docs 4e4a095f5 · BEHIND by 13 · untouched
                     Class A approvals: Founder-Steward, 2 Council votes,
                     Mentor verification — ALL OUTSTANDING
```

⚠️ **Trunk is now ahead of production.** `ca43f8ccd` contains the PHI log-leak fix and
the Sovereignty Gate; production still runs `b00340cfc`. Deploying that delta is a
separate decision from the U1 lane and is **not** authorized by anything in this record.

Nothing was deployed, admin-bypassed, or altered in branch protection. #1007 untouched.
