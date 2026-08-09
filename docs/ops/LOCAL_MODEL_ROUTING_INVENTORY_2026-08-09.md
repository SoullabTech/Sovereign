# Local model routing — verified inventory (2026-08-09)

Purpose: correct the premise of the "install Ollama to cut Claude API spend" plan.
Everything below was **measured on the Mac Studio**, not assumed.

## 1. The setup already exists

`ollama` v0.24.0 at `/opt/homebrew/bin/ollama` (client 0.23.2 — version skew, harmless).

Installed models:

| Model | Size | Age |
|---|---|---|
| `qwen3-coder:30b` | 18 GB | 5 months |
| `qwen3:32b` | 20 GB | 5 months |
| `maia-coder:latest` | 18 GB | 5 months |
| `maia-content:latest` | 20 GB | 5 months |
| `deepseek-r1:8b` / `:latest` | 5.2 GB | 6 months |
| `qwen2.5:7b` | 4.7 GB | 4 weeks |
| `nomic-embed-text` | 274 MB | 3 months |

`maia-coder` is **FROM qwen3-coder** with a hand-written MAIA system prompt already
encoding: plan-before-editing · run `typecheck` / `check:no-supabase` / `smoke` ·
no-Supabase/OpenAI/Vercel sovereignty rule · and an explicit **escalation rule**:
*"If you have attempted the same fix twice and it is still failing, say 'This needs
cloud-level reasoning' and stop."*

⇒ The two-tier local/cloud architecture was designed and built five months ago.
The open question is **why it isn't in use**, not whether to build it.

## 2. `ollama launch claude` is real on this machine

`ollama launch --help` lists supported integrations:
`claude` (Claude Code) · `cline` · `codex` · `copilot` · `droid` · `hermes` ·
`kimi` · `opencode` · `openclaw` · `pi` · `pool` · `vscode`.

No `jarvis` integration exists.

## 3. Suspected defect in `maia-coder`

Its Modelfile sets `TEMPLATE {{ .Prompt }}` — a raw passthrough that replaces
qwen3-coder's native chat/tool-call template. Agentic harnesses (Claude Code, Aider)
depend on that template for tool calling. `RENDERER qwen3-coder` is also set and may
compensate on 0.24.0. **Unverified** — test before trusting, and if tool calls fail,
rebuild the Modelfile without the `TEMPLATE` line.

## 4. Repo-side routing that already exists

- `lib/consciousness/modelRouter.ts`
- `lib/consciousness/LLMProvider.ts`
- `lib/consciousness/local-llm/LocalLLMIntegration.ts`

These govern **MAIA's runtime** model choice, not the **development** harness.
Do not conflate the two lanes.

## 5. Cheapest next experiments, in order

1. Confirm billing lane: per-token API key vs. flat-rate subscription. A pricing-lane
   change can dwarf any routing work.
2. `ollama launch claude --model maia-coder` in a **worktree**, given one task
   previously paid for: repo read + report, no writes. Record whether tool calls work.
3. Same task with stock `qwen3-coder:30b`, to isolate whether the custom Modelfile helps
   or hurts.
4. Only then decide a routing policy.

`context-mode` (already installed) is the other live token lever — it keeps raw tool
output out of the context window, which is where agentic spend concentrates.
