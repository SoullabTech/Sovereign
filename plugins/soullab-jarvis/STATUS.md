# soullab-jarvis — status

Held to this repo's own rungs: **built ≠ wired ≠ surfacing ≠ verified.**

| Component | Rung | Evidence |
|---|---|---|
| `hooks/session-start.sh` | **built** | executes standalone, emits valid SessionStart JSON (`verify-guards.sh`) |
| `hooks/pretooluse-guard.py` | **built** | 18 of 20 assertions in `verify-guards.sh` |
| `hooks/stop-close-out.py` | **built** | executes standalone; respects `stop_hook_active` |
| Skills (4) | **built** | files exist with valid frontmatter; never invoked by a live session |
| `.jarvis/memory/` scaffold | **built** | `HOT.md` (47 lines) + routing README; no promoted content yet |
| Marketplace entry | **built** | `.claude-plugin/marketplace.json` parses; never installed |

**Nothing here is `wired`.** Wired begins at the first session where the plugin is installed
and a hook fires in a real conversation. `surfacing` begins when a denial or a SessionStart
block is observed in a real transcript. `verified` requires a before/after token differential
on real sessions.

## Claims this repository must NOT make yet

- ⛔ "JARVIS context cost dropped ~54%." The audit's projection is `~254,600 → ~118,000 tok
  per session` from **measured inputs**. No before/after differential has been run. The
  projection is not a result.
- ⛔ "Image isolation recovers 121k tokens per session." That is the measured **size of the
  bucket**, not the measured **effect of the hook**.
- ⛔ "Governance is now enforced." Enforcement begins when the plugin is installed. A committed
  hook is a file.

## Known limits, stated up front

- **Subagent detection is heuristic.** The guard tails the transcript for the most recent
  `isSidechain` record and allows when it cannot tell. It changes the default path in the main
  loop; it is not tamper-proof.
- **`image-tools.txt` is explicit enumeration.** A new image emitter is invisible until added.
  The list came from a 40-transcript census on one machine and may not match another.
- **The trap list is four rules, not a policy.** It encodes named `CLAUDE.md` prohibitions. It
  is not a security boundary and should not be described as one.
- **The Stop hook is advisory.** It emits evidence; it enforces nothing.

## First measurement to run (before any claim)

Install, work one ordinary session, then compare against the audit's corpus:

1. Did `SessionStart` cost stay under ~600 tokens?
2. Did any image-tool denial fire, and did the subagent path actually get taken?
3. Per-session `tool_result` inflow vs the 173,381-token baseline.

Until (3) is measured on real sessions, this plugin's value is **argued, not demonstrated.**
