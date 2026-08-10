# Builder OS — Claude Adapter (MVJ Unit 6)

**Date:** 2026-08-09 · **Authority:** founder directive, MVJ Unit 6, executed under the
§0.1 canonical-object invariant and §0.2 interpretation rule · **Precondition:** Unit 5
(canonical Work Unit reconciliation) CLOSED/PROVEN/CANONICAL at `153b9ce98` ·
**Base ref (founder ruling):** `feature/unit5-canonical-work-unit` @ `153b9ce98`,
`feature/labtools-redesign` deliberately untouched (deferred, not authorized here).

**Scope discipline:** no autonomous Claude routing, no multiple parallel Claude workers
by default, no Builder OS redesign, no new providers, no conversational JARVIS, no broad
JARVIS deployment.

---

## Headline

**`CLAUDE_AS_JARVIS_WORKER: PROVEN`.**

> Claude Code now works for JARVIS. JARVIS no longer needs Claude Code to be the place
> where its operational state lives.

```text
canonical Work Unit → JARVIS → Claude capacity claim → isolated worktree + WRITE ownership
   → compact Claude packet → Claude worker → bounded mutation → worker result
   → independent deterministic verification → JARVIS integration → result persistence → release
```

Every link proven against real evidence (§7 below), not synthetic fixtures alone.

---

## 1. Architecture — where the adapter sits

**No new harness.** `ain-delegate.sh`'s `_run_lane` gained a third branch (`claude`,
alongside `local`/`kimi`). Everything upstream of worker invocation — packet resolution,
worktree claim, Builder WRITE ownership registration, collision handling — is **already
provider-agnostic** (built in Unit 3, before a Claude lane existed) and required **zero
changes** to support Claude. This is the load-bearing structural finding of this unit:
Unit 6 is a three-line dispatch addition plus one new derivation function, not a new
control plane.

```text
_run_lane(lane, work_unit_id, model?)
  ├─ resolve/claim worktree           (unchanged, Unit 3)
  ├─ register Builder WRITE ownership  (unchanged, Unit 3 — session.mjs open)
  ├─ dispatch on lane:
  │    local  → maia-code -p "$prompt" --permission-mode bypassPermissions      (unchanged)
  │    kimi   → kimi-cc   -p "$prompt" --permission-mode bypassPermissions      (unchanged)
  │    claude → claude    -p "$prompt" --model "$model" --permission-mode "$(_claude_permission_mode)"   (NEW)
  ├─ independently re-run verification_commands  (unchanged, Unit 2)
  └─ write result.json                            (unchanged, Unit 2)
```

**No wrapper binary.** Unlike `local` (needs Ollama redirection via `~/bin/maia-code`) and
`kimi` (needs Moonshot redirection via `~/.local/bin/kimi-cc`), the Claude lane invokes
the real `claude` binary directly — there is no provider to redirect away from. Governance
lives entirely in the flags and the worktree, not in a wrapper script.

**Existing infrastructure classified (directive §2):**

| Substrate | Disposition |
|---|---|
| `_run_lane`'s worktree/ownership preamble | **RECONNECT** — reused as-is, zero changes |
| `session.mjs` capacity/collision governance | **RECONNECT** — reused as-is, zero changes |
| Result computation + `run-check.mjs` verification | **RECONNECT** — reused as-is |
| `work-unit.mjs` (Unit 5) | **RECONNECT** — first real consumer of `derivePermissionEnvelope()` |
| `maia-code`/`kimi-cc` wrapper pattern | **NOT REUSED** — correctly inapplicable; no provider redirection needed |
| Claude-specific harness (new binary/wrapper) | **BUILD, then rejected** — considered and not needed |

The seven canonical objects (§0.1 of the authorizing directive) remain distinct throughout:
Work Unit (the packet, extended) ≠ packet-as-delegated (the same file, projected) ≠
claim/session (`s-29457c13`, this attempt) ≠ result (`proving-case-claude-multiply-fn.json`)
≠ attempt history (`work-unit.mjs record-attempt`, available, not exercised for this single
attempt) ≠ independent verification (`run-check.mjs`, a separate, later act) ≠ integration
(commit `f2218f3da`, actor JARVIS, a still-later, still-separate act).

---

## 2. Model selection — explicit, never implicit Opus

```bash
ain-delegate.sh claude <work_unit_id> [model]
```

Default: **`sonnet`**, an explicit, documented, cost-tier choice — not a discovered
"Builder policy" (none existed to discover), and not Opus-by-default-because-Claude.
Override: `ain-delegate.sh claude <id> opus`. Recorded in `result.json.model` either way,
never left ambiguous.

---

## 3. Headless permissions — derived, not hard-coded

**This is the first real consumer of Unit 5's `derivePermissionEnvelope()`.** Unlike
`local`/`kimi` (fixed with a blanket `--permission-mode bypassPermissions` in Unit 2,
*before* the envelope function existed — deliberately left unretrofitted, out of this
unit's scope), the Claude lane derives its permission mode from the canonical Work Unit's
authority:

```bash
_claude_permission_mode() {
  envelope="$(node work-unit.mjs permission-envelope "$id")"
  scope="$(echo "$envelope" | jq -r '.repo_write_scope')"
  [ "$scope" = "worktree" ] && echo "bypassPermissions"   # bounded by the isolated worktree
  [ "$scope" = "none" ]     && echo "plan"                # read/reason only — not authorized to mutate
}
```

**Bounded, not broad**, per directive §6: `bypassPermissions` is only ever emitted when
the Work Unit's own authority already scoped write access to the isolated worktree — the
same structural boundary `local`/`kimi` already relied on, now made *traceable* (a
specific packet field produces a specific flag) rather than assumed. Proven by F4
(§8 below): a Work Unit authored with `authorized_acts: ["repo.read"]` only derives
`repo_write_scope: "none"` and the adapter maps that to `plan`, never to a broader mode —
the envelope cannot be talked into broadening itself.

---

## 4. Capacity governance — the existing slot, not a new one

**Finding, not a design choice this unit made:** `session.mjs`'s concurrency counter is
**provider-agnostic by construction** — it already counted the Kimi session under the same
`1/1` budget during Unit 2's closure. Directive §8 says *"a JARVIS-launched Claude worker
must acquire the **existing** Claude capacity slot"* — read literally, that is this same
shared slot. No new Claude-specific counter was built, because none was required: the
mandate's own wording, checked against the actual mechanism, resolves via directive §4
option **A** ("Unit 6 is asking the wrong architectural question") — the requirement was
already satisfied the moment Claude registers through `session.mjs open`, which it now
does, identically to `local`/`kimi`.

**Confirmed with real, non-stub state, not only synthetic tests:** the first real
invocation attempt of the proving case (§7) was **genuinely refused** — this unit's own
development session (`s-c96bbec4`) already held the sole slot. That is C2 and F1
demonstrated by accident, before the proving case had even formally started, which is
stronger evidence than a designed test would have been.

---

## 5. Worktree governance — identical, not special-cased

Claude receives no special workspace privilege. Proven (§8, F2): a Claude run targeting a
worktree another writer already owns is refused by name (`REFUSED — worktree is already
owned by an active write session`), not silently admitted — the exact Unit 3 mechanism,
unmodified, now exercised under the `claude` lane specifically.

---

## 6. Authority vs. capability — held under real pressure, not just asserted

The packet for the real proving case (`proving-case-claude-multiply-fn.json`) explicitly
listed *"committing"* under `prohibited_files_actions`. Claude complied — it created the
two files, ran nothing beyond that, and stopped, exactly matching the intended boundary:
**worker implements, JARVIS integrates.** This was not enforced by revoking a capability
Claude technically had (the derived `bypassPermissions` mode would have permitted `git
commit` as a Bash call) — it held because the *instruction* was clear and the model
respected it. This is worth stating precisely rather than overclaiming: **the boundary
held via prompt-level authority in this proving case, not via a technical capability
restriction** — a distinct, real limitation, not swept into the "PROVEN" claim (see §9).

---

## 7. Proving case — real, not synthetic

New, distinctly-named fixture per directive §11 (`multiply(a,b)`, not the Kimi precedent's
`add(a,b)`) — provenance never ambiguous between the two closed-loop proofs.

| | |
|---|---|
| Work Unit | `proving-case-claude-multiply-fn` |
| Worker | `sonnet` (Claude adapter) |
| Starting SHA | `153b9ce98` |
| Files changed | `scripts/ain-delegation-proving-case-claude/multiply.js`, `multiply.test.js` |
| Worker claim | files created, no commit attempted (correctly, per packet prohibition) |
| Independent verification | **PASS** — `run-check.mjs`, `node .../multiply.test.js` → `OK`, exit 0, re-run twice (pre- and post-integration) |
| Integration | **JARVIS**, commit `f2218f3da`, hooks PASS, not attributed to Claude |
| Attempts | 1 (succeeded first try — no permission friction, unlike Kimi's first attempt) |
| Release | Builder claim + worktree lock released via the canonical path; confirmed `active: 0` |

Full narrative: `docs/ops/AIN_DELEGATION_PROVING_CASE_2026-08-09.md` (Unit 6 addendum).

---

## 8. Proofs

```bash
node scripts/builder/__tests__/claude-adapter-governance-proof.mjs
```

Deterministic, stub `claude` binary on PATH — proves governance mechanics without
Anthropic API cost. The real proving case (§7) is the required non-stub complement.

| Proof | PASS/FAIL |
|---|---|
| C1 — capacity free, one Claude Work Unit starts | **PASS** (proven twice: stub + real refusal-then-success) |
| C2 — capacity full, second unit → `WAITING_FOR_CLAUDE`/queued | **PASS** |
| C3 — valid completion releases the slot | **PASS** |
| C4 — crashed worker remains auditable, not silently gone | **PASS** |
| C5 — local rate observability sees JARVIS-launched Claude activity | **PASS** (confirmed live during §7: 3 distinct sessions in the trailing 5 min) |
| F1 — capacity full, no `--queue` → outright refusal | **PASS** |
| F2 — occupied worktree → refused | **PASS** |
| F3 — invalid packet → not launched | **PASS** |
| F4 — unauthorized act → envelope does not broaden itself | **PASS** |
| F5 — worker exits 0, deterministic test fails → JARVIS records failure | **PASS** |
| F6 — process crash → attempt stays auditable | **PASS** |
| F7 — no result → Work Unit never falsely reports integrated | **PASS** |
| F8 — transcript removed → JARVIS state sufficient | **PASS** (proven twice: stub + real, from a separate fresh worktree process) |

**30/30**, plus the real proving case as live confirmation of C1, C2/F1, C5, F8, §6.

### Full regression

| Suite | Result |
|---|---|
| session-proof | 54/54 |
| orient-proof | 33/33 |
| continue-proof | 27/27 |
| rate-proof | 24/24 |
| loop-governance-proof | 28/28 |
| incident-scenario-proof | 18/18 |
| run-check-proof | 15/15 |
| delegate-workspace-convergence-proof | 20/20 |
| work-unit-proof | 37/37 |
| claude-adapter-governance-proof (this unit) | 30/30 |
| **Total** | **286/286, 0 failed** |

(`orient`/`continue` run from the main checkout per the Unit 5-documented location
artifact — running from inside this unit's own claimed worktree makes `/orient` correctly
report self-collision, not a code regression.)

---

## 9. Known limitations — stated, not solved

1. **The worker/JARVIS commit boundary held via instruction, not a technical
   restriction**, in this proving case (§6). The derived permission envelope did not
   *prevent* Claude from running `git commit` — the packet's prohibition and the model's
   compliance did the work. A future unit that wants this enforced structurally (e.g. a
   commit-blocking hook inside the worktree) would need to build that separately; not
   built here, not claimed here.
2. **`local`/`kimi` remain on the pre-Unit-5 hard-coded `bypassPermissions`**, not
   retrofitted onto `derivePermissionEnvelope()`. Deliberate — Unit 6 is scoped to the
   Claude lane; unifying all three is a reasonable, explicitly identified follow-up.
3. **Capacity is shared, not Claude-specific.** An orchestrating JARVIS/Claude session
   (like this unit's own development claim) and a delegated Claude worker compete for the
   *same* slot. This is architecturally consistent (§4) but operationally real — proven by
   the accidental self-refusal in §7. No fix proposed; flagged as an operating
   characteristic to design around, not a defect.
4. **Adaptive routing is explicitly out of scope** (directive §16) — Claude is now a
   *selectable* worker, not an *automatically chosen* one. Nothing here decides
   Claude-vs-Kimi-vs-local.
5. **`--permission-mode plan`** (the read-only branch of `_claude_permission_mode`) is
   implemented and unit-proven (F4) but not exercised by the real proving case, which used
   the default worktree-scoped authority. Left as a proven-but-not-field-exercised path.

## 10. Not done, deliberately

No autonomous Claude routing · no multiple parallel Claude workers by default · no Builder
OS redesign · no new providers (OpenAI/DeepSeek) · no conversational Founder Input
Resolution · no broad JARVIS deployment · no Epistemic Coherence implementation · no
`feature/labtools-redesign` mutation.
