# JOP-04 · RB-6B — Pre-Repair Host Witness · Runbook

**Authorized:** 2026-09-13 · ⛔ **FOUNDER-RUN. This session has no Electron host.**
⛔ **Do not design or implement the host-minted decision before this witness is captured.**

```text
SUBJECT SHA     fd543df1     RB-6A closed subject
JUDGE SHA       4267e12b     CAL-3 amended judge
APPARATUS       scripts/jop04/rb6b-host-witness.js   ⭐ FROZEN across all three arms
CAPABILITY      git.rev_parse — one existing harmless registered READ capability
ENTRY POINT     jarvis:submit-task
```

---

## 1 · What must be proved

```text
real renderer submission → real ipcMain('jarvis:submit-task') → real route()
  → legitimate routing condition satisfied → valid C0 route reached
  → NO independent host execution decision exists
  → real runCapability() → harmless read capability EXECUTES
```

**Verdict sought:** *Condition B witnessed through the production IPC path — a routing result is
sufficient to cause execution.* **That is the pre-repair RED witness.**

### The three propositions — all three must be **witnessed**, not inferred

```text
1. route was legitimate
2. no independent host decision existed
3. execution nevertheless occurred
```

⛔ **If any one is unobserved, the result is not the required baseline.**

⚠️ **Do not let the record say** *"there is no execution-decision mechanism in source, therefore none
existed."* The source census already established that. **The host witness's job is to show the actual
runtime path behaved accordingly.** A source reference may explain what was observed; it can never
substitute for observing the crossing.

⭐ **How the apparatus distinguishes host execution from a harness-side call, by construction:** the
preload exposes **no execution primitive** — `desktop-preload-allowlist.mjs` proves it *"separately
proven not to reference `runCapability`, so discovery can never become execution."* A capability
result arriving in the renderer therefore could only have been produced host-side.

## 2 · Procedure

**Step 1 — bind the app to a checkout of the subject.**

```bash
git worktree add --detach /tmp/jop04-subject fd543df1
git -C /tmp/jop04-subject rev-parse HEAD      # must be fd543df1…
cd /tmp/jop04-subject/jarvis-desktop && npm install && npm run stamp
cat build/build-info.json                      # ⭐ HOST BUILD SHA — must tie to fd543df1
```

**Step 2 — snapshot host-side runtime state BEFORE** (so absence is observed, not assumed):

```bash
R=~/.claude/ain-delegation/runtime
wc -l  $R/events.jsonl 2>/dev/null; ls -1 $R/runs 2>/dev/null | wc -l
cp -a  $R/events.jsonl /tmp/jop04-events.before 2>/dev/null || echo "(no events log yet)"
```

**Step 3 — launch and bind the repository.**

```bash
cd /tmp/jop04-subject/jarvis-desktop && npm start
```

In the app: bind the repository to `/tmp/jop04-subject` if prompted. Open DevTools on the renderer.

**Step 4 — run the frozen apparatus.** Paste `scripts/jop04/rb6b-host-witness.js` into the renderer
console. It prints (and copies) the witness JSON.

**Step 5 — snapshot host-side runtime state AFTER**, and diff:

```bash
R=~/.claude/ain-delegation/runtime
diff /tmp/jop04-events.before $R/events.jsonl || true   # ⭐ records what the crossing DID write
```

## 3 · What the apparatus captures

| Arm | Pre-repair expectation |
|---|---|
| **CONTROL** — no routing declaration | `refused_not_routable` ⭐ *RB-6A witnessed live at the real boundary* |
| **ARM A** — valid route, host decision absent | **EXECUTES** — the RED witness |
| **ARM B** — valid route + constituted host decision | `UNINSTANTIATED` ⛔ no mechanism; not fabricated |
| **ARM C** — caller counterfeit | `UNINSTANTIATED` ⛔ nothing truthful to counterfeit yet |

⭐ **The apparatus is frozen and already accommodates all three arms**, so the post-repair run uses
**the same witness**:

```text
SAME WITNESS
  BEFORE   valid route + no host decision  →  EXECUTES
  AFTER    valid route + no host decision  →  DOES NOT EXECUTE
  AFTER    valid route + legitimate host decision  →  EXECUTES
```

⛔ **Do not edit the apparatus between runs.** A changed witness costs another lane proving the
measurement apparatus did not cause the difference.

## 4 · Freeze these fields

```text
SUBJECT SHA          fd543df1
JUDGE SHA            4267e12b
HOST BUILD SHA       <build-info.json app_build_sha — must equal fd543df1>
CAPABILITY           git.rev_parse
ENTRY POINT          jarvis:submit-task
ROUTING RESULT       C0
HOST DECISION        ABSENT
EXECUTION ATTEMPT    YES
TOOL RESULT          <captured stdout>
EVENTS DIFF          <before → after>
```

## 5 · ⛔ Stop conditions — adjudicate, do not repair

```text
the task never crosses the real IPC boundary
routing eligibility cannot be established legitimately
the route is not C0 / equivalent
the harmless capability does not execute
the witness cannot distinguish host execution from a harness-side direct call
any new execution-decision mechanism unexpectedly appears
the build SHA cannot be tied exactly to fd543df1
```

⛔ **Do not repair during the witness. A surprising result is evidence.**

## 6 · After a successful witness

Freeze it as the **RB-6B PRE-REPAIR HOST WITNESS**. **Then stop.**

Only then does the next design act open — and ⛔ **it does not begin by asking what token or type to
create:**

> **What host fact exists independently of routing that can truthfully answer
> *"execute THIS invocation now"*?**

⭐ That ordering is what keeps the design from producing a permit-shaped object first and sovereignty
second.

### The fourth distinction CAL-3d will demand post-repair

```ts
if (validRoute) { hostDecision = mint(); }   // ⛔ beautiful provenance, worthless architecture
```

> **The post-repair question is not "can the host mint something?" It is: can the host independently
> choose NOT to mint it while preserving the exact same valid route?**
> **That is sovereignty.**

---

```text
RB-6A            CLOSED
CONDITION B      witnessed in-process (CAL-3a RED) · ⛔ NOT yet at the real IPC boundary
APPARATUS        BUILT · FROZEN · three arms
RUN              ⛔ FOUNDER ACT — no Electron host in this session
RB-6B DESIGN     ⛔ NOT OPEN until the witness is frozen
```
