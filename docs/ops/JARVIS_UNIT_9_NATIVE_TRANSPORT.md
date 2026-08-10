# JARVIS UNIT 9 — NATIVE LOCAL-WORKER TRANSPORT (DURABLE RECORD)

## Why Unit 9 existed

Unit 8 proved the precision context router works (Run 002: 2,330 est tokens vs a
32,768 threshold) yet the worker still failed `Prompt is too long`. A control
five-word prompt through `~/bin/maia-code` failed identically, locating the fault
in the transport, not the packet.

```
BEFORE  JARVIS → ain-delegate → maia-code → Claude Code CLI
                → system prompt + tool schemas + MCP + CLAUDE.md (~11,840 tok)
                → Ollama                                            💥 overflow

AFTER   JARVIS → ain-delegate → jarvis-local-worker.mjs
                → POST localhost:11434/api/generate → maia-coder      ✅
```

## Implementation

| File | Purpose |
|---|---|
| `scripts/builder/jarvis-local-worker.mjs` | native Ollama transport: `run`, `health` |
| `scripts/ain-delegate.sh` | new `local-native` lane; legacy `local` lane untouched |

**The dependency that makes this viable:** removing the CLI removes the worker's
tools (no Read, no Bash). A toolless worker can only answer from what it is handed
— which is exactly what Unit 8's materialized fragments provide. Precision context
routing is the precondition for this transport, not a detour from it.

Read-only by construction: the transport speaks HTTP to a local model and returns
text. It has no filesystem or git capability to grant.

Failure classes are distinguished: `TRANSPORT_UNREACHABLE`, `WORKER_TIMEOUT`,
`WORKER_EXECUTION_FAILED`.

## Proof the transport fixed the blocker

| | via CLI (Unit 8) | via native transport (Unit 9) |
|---|---|---|
| five-word control prompt | `Prompt is too long` | **`OK`** — 254 prompt tokens, 0 s |
| real packet | exit 1, no evidence | **exit 0, full evidence, 6 s** |

`prompt_eval_count: 254` is the backend's own count — authoritative evidence of
what the model actually received.

## Run 003 outcome

The worker executed and returned a structured, substantively correct trace with
`file:line` citations. Independent verification passed **5 of 6** citations and
**caught one fabrication**. See `JARVIS_UNIT_9_RUN_003.md`.

## Standing lessons

1. **Packet design can leak the answer.** Run 003's `verification_commands`
   contained `sed -n '257p' …`. The worker echoed `257` as its headline claim while
   the fragment it was shown did not contain that line. Verification commands must
   not name the lines the worker is supposed to discover.
2. **Line numbers are checkout-specific.** Selectors were authored against a dirty
   working tree where `POST` sits at line 257; the delegate worktree is at clean
   `54809f994` where it sits at **253**. A selector is only meaningful together with
   the SHA it was computed against.
3. **Independent verification is what caught both.** The worker was fluent,
   confident, and wrong on its headline claim. Nothing but checking the cited line
   against the actual source would have found it.
