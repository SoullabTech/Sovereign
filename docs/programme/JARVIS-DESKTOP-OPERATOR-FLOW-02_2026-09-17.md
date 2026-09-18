# JARVIS-DESKTOP-OPERATOR-FLOW-02

**Opened:** 2026-09-17 · founder request to take JARVIS Desktop to the next functional level
**Base:** current canonical `0bd2b65789ec1a60acc8621fb04b50095ebe5b29`
**Inherited bounded precursor:** `d7c574179` transplanted as `a779fca97`

## Purpose

Make JARVIS Desktop usable from founder intent rather than requiring fluency in C0/C1/C3, provider names, or Builder machinery.

## Governing UX law

> The founder states the desired outcome. JARVIS handles machinery. The founder is asked only for consequential choices that cannot be inferred safely.

For this cut, the consequential choice is the disclosure/intelligence posture:

- **Keep this local** — bounded C1 reasoning on the Mac; no external model call.
- **Frontier reasoning** — route to C3; routing itself sends nothing externally. External execution remains a second explicit act through the already-governed Nemotron seam.

## Containment

This cut does **not**:

- add a new IPC channel;
- widen Builder `local-native` authority;
- permit automatic C3 execution;
- expose repository or continuity material to Nemotron;
- infer which repository files count as evidence;
- implement, merge, deploy, or touch production;
- remove the existing C0/C1/C3 controls.

The old technical controls remain available under **Advanced tools and lane controls**.

## Acceptance

1. Work opens with **Run through JARVIS** and the question “What do you want to happen?”
2. Local is the default posture and remains bounded to the canonical 4,000-character C1 limit.
3. An oversized local request is refused with a narrowing instruction; it is never silently promoted to C3.
4. Frontier posture makes the external boundary visible before any external execution.
5. Routing to C3 does not execute Nemotron; the existing explicit frontier act remains required.
6. The prior manual C0/C1/C3 tools remain reachable under Advanced.
7. No privileged preload/IPC surface changes in this cut.

## Next gate

Founder walk of the Work screen. If the new intent-first flow is legible, the next functional cut may add a genuine governed Work Unit composer with explicit evidence selection and live run-stage projection. Provider orchestration/multi-model reconciliation remains a separate authority-bearing seam.

## Functional cockpit cut

The successor now adds a real governed Work Unit cockpit over the canonical Builder/provider substrate.

### Founder flow

```text
Home intent
  -> Work draft
  -> quick local/text-only act OR governed Work Unit
  -> explicit provider strategy
  -> explicit external repository disclosure
  -> explicit Inkling spend grant when selected
  -> canonical Work Unit packet
  -> provider attempt(s)
  -> append-only attempt history
  -> structured reconciliation
  -> Needs Kelly / second review owed / repair before witness / evidence presented
```

### Provider strategy

The Work Unit identity belongs to the work, never the worker. `nemotron-zen` and
`inkling-tinker` are attempts under one packet. Provider changes do not widen the Work Unit
authority envelope.

`nemotron-zen` uses `opencode/nemotron-3-ultra-free` through OpenCode Zen. `inkling-tinker`
uses `tinker/thinkingmachines/Inkling` and remains fail-closed when `TINKER_API_KEY` is not
present in JARVIS's launch environment.

### New canonical seam

`scripts/builder/work-unit-create.mjs` is the single packet-creation seam used by Desktop.
It runs the canonical packet validator plus answer-leakage lint, refuses collisions, writes
mode `0600`, and does not claim a worktree or launch a worker.

### New Desktop privileged seam

One reviewed invoke channel was added:

`jarvis:work-unit-action`

Its MAIN-owned action enum is exactly:

- `providers`
- `create`
- `status`
- `run-provider`

The renderer cannot supply a repository path, shell command, canonical SHA, branch name, or
raw authority envelope at creation. MAIN derives the SHA from the bound repository and builds
the packet through `operator-work-unit.js`. Provider runs go through the canonical
`opencode-provider.mjs` resolution and `ain-delegate.sh opencode` execution seam.

### Reconciliation law

JARVIS may reconcile structured execution evidence; it does not adjudicate semantic model
disagreement automatically.

- no attempts -> `NOT_RUN`
- one clean attempt -> `SECOND_REVIEW_OWED`
- nonzero/rejected/failing attempt -> `REPAIR_BEFORE_WITNESS`
- explicit escalation -> `NEEDS_KELLY`
- structured disagreement -> `REVIEW_DISAGREEMENT`
- multiple clean attempts -> `EVIDENCE_PRESENTED`, with semantic judgment still founder-owned

### Still not authorized

This cut does not add provider implementation authority, repository writes by external models,
automatic merge, automatic deployment, production access, or automatic founder rulings.

## Evidence added in this cut

- intent-first focused suite: `86/86 PASS`
- full pre-cockpit Jarvis Desktop + alpha-floor suite: `97/97 PASS`
- Work Unit packet authoring: `5/5 PASS`
- Work Unit controller reconciliation: `7/7 PASS`
- cockpit/authority acceptance: `21/21 PASS`
- canonical Work Unit creation proof: `4/4 PASS`

## Post-cockpit gate

- Jarvis Desktop full suite: `155/155 PASS`
- Alpha Floor / preload proof: `97/97 PASS`
- exact preload invoke channels: `13/13`
- Work Unit identity/attempt invariants: `37/37 PASS`
- governed OpenCode provider proof: `23/23 PASS`
- canonical Work Unit creation proof: `4/4 PASS`
- delegate syntax, JS syntax, JSON parse, `git diff --check`: PASS

**Standing:** candidate is qualified for a founder Desktop walk. It is not installed over the existing packaged app yet.
