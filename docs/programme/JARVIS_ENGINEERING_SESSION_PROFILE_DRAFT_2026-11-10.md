# JARVIS Engineering Session Profile — DRAFT (2026-11-10)

Status: **DRAFT, proposal only.** Authorizes nothing. No setting, config, connector, plugin or skill was changed to produce it. Token figures are **estimates** unless marked MEASURED.

## 1. Measured startup sample (MEASURED, `get_usage`, this audit session)
Memory files 87,956 · Messages 48,014 · System tools 17,972 · MCP tools 15,919 · System prompt 12,727 · Skills 8,779.
Note: Memory files 87,956 is the pre-relocation figure; this session's checkout is branch `fix/account-settings-save-feedback-20261031`, which still carries the large CLAUDE.md. The relocated 38 KB CLAUDE.md lives on `clean-main-no-secrets` (receipt: 18,423). Messages is inflated here by the task prompt and hook context.

## 2. Where config lives (names/types only; no values read)
| Layer | Finding |
|---|---|
| `~/.claude.json` user mcpServers | `proton-mail` (stdio) only |
| `~/.claude/settings.json` | enabledPlugins: context-mode, codex (openai-codex), claude-code-setup, soullab-jarvis; hooks: SessionStart, SessionEnd |
| Repo `.mcp.json`, `.claude/settings.json` | absent |
| Repo `.claude/settings.local.json`, `.claude/launch.json` | present (not read for content; launch.json is modified/uncommitted) |
| Repo skills / agents | `field-study`; 6 agents (ain-architect, ain-growth, maia-dev, maia-ios, maia-ops, security-auditor) |
| User skills `~/.claude/skills` | alien-science-research, jarvis-local, jarvis-referent-discipline, jarvis-security-guardian, soullab-continuity, task-observer, writers-studio-product-steward (+ `synced/`) |

Most of the ~16k "MCP tools" and many "System tools" come from **claude.ai account connectors and desktop-app built-in servers**, which are not in any file above; they are controlled per session via the app (`mcp__ccd_connectors__*` tools exist for per-session enable/disable).

## 3. Inventory and classification
Loaded = full schema in context at start; Deferred = name only until ToolSearch.

| Item (tools seen) | Source | State | Class |
|---|---|---|---|
| Built-in Bash/Read/Edit/Write/Agent/Skill/ToolSearch… | harness | loaded | ESSENTIAL |
| context-mode (9 ctx_* tools) | plugin | deferred | ESSENTIAL |
| jarvis-local, jarvis-referent-discipline, jarvis-security-guardian, soullab-continuity, writers-studio-product-steward | user skills | description loaded | ESSENTIAL (continuity/referent) / ON-DEMAND (guardian, steward) |
| ccd_session / ccd_session_mgmt / ccd_turn / ccd_pr (≈30) | desktop app | mixed (update_plan, wrap_up, start_session loaded) | ESSENTIAL |
| terminal (4) | desktop app | read_terminal loaded | ON-DEMAND |
| ccd_host, ccd_view, ccd_window, ccd_sidebar, ccd_directory, ccd_settings (≈35) | desktop app | deferred | ON-DEMAND |
| codex plugin (agent + 3 skills) | plugin | skills loaded | ON-DEMAND |
| field-study, task-observer, alien-science-research | skills | description loaded | ON-DEMAND |
| Repo agents (6) + generic agents | project/harness | descriptions loaded | ON-DEMAND |
| Browser pane (`mcp__Claude_Browser__*`, ≈17) | desktop app | **loaded** | ON-DEMAND (UI verification only) |
| Claude in Chrome (≈19) | extension | deferred | UNRELATED to most source work |
| computer-use (≈26) | desktop app | deferred | UNRELATED |
| iOS Simulator (control loaded, build deferred) | desktop app | partly loaded | UNRELATED unless iOS lane |
| visualize (read_me, show_widget) | desktop app | **loaded** | UNRELATED |
| Docs connector (batch, guide, update loaded; +5 deferred) | claude.ai | partly loaded | UNRELATED |
| Gmail (≈22), Google Calendar (9), Google Drive (13) | claude.ai | deferred | UNRELATED |
| Gamma (≈26), Hugging Face (5) | claude.ai | deferred | UNRELATED |
| proton-mail (5) | user MCP | deferred | UNRELATED |
| mcp-registry (3), scheduled-tasks (6), Cron*/RemoteTrigger | app/harness | deferred | ON-DEMAND |
| Artifact family, Workflow, many anthropic-skills (docx/pptx/xlsx/pdf/docs/google-workspace/morning/etc.) | harness/skills | Artifact loaded; skills as descriptions | UNRELATED to source work |

## 4. Proposed engineering profile (per session, not global)
Keep: harness tools, context-mode, ccd_session*/turn/pr, terminal, jarvis-local, jarvis-referent-discipline, soullab-continuity, SendMessage/Monitor/WebSearch (deferred anyway), hooks as-is.
Defer/omit for engineering sessions: Browser pane, visualize, Docs connector, iOS simulator `control`, Artifact tool, Gmail/Calendar/Drive/Gamma/HF/Proton, Chrome, computer-use, docx/pptx/xlsx/pdf/morning/google-workspace skills.
Unchanged holds: builder, security, source and release holds; skills confer capability not authority.

## 5. Estimated token effect (ESTIMATES, not measured)
| Lever | Est. saving |
|---|---|
| Don't load Browser pane schemas (≈17 tools) | 4–6k |
| Don't load visualize + Docs + iOS control + Artifact schemas | 3–5k |
| Skip unrelated anthropic-skills descriptions (≈14) | 2–4k |
| Skip Chrome/computer-use/Gmail/Gamma etc. *names* in deferred list | 3–6k |
| Trim system-tool set (Cron*, Workflow, notebook, plan-mode tools) if configurable | 1–3k |
| Total plausible | ≈13–24k of the ~42k; the remainder is harness-fixed |
The measured MCP-tools category is 15.9k, so that bounds the connector-side saving; the skills category is 8.8k.

## 6. How to apply without touching global settings or disconnecting apps
Options, least invasive first (each needs a founder decision; none applied here):
1. **Per-session connector toggle** via the app's session connector controls (`mcp__ccd_connectors__set_session_connector_enabled`), scoped to the session only. Verify scope before use.
2. **Project-scoped config**: a new `.claude/settings.local.json` entry or launch profile in the repo (settings.local.json already exists and is modified — review before editing; do not stage/commit casually).
3. **Launch-time profile**: a wrapper (e.g. `soullab-claude engineering`) that passes `--strict-mcp-config`/allowed-tools style flags for that invocation only. Flags and whether desktop sessions honor them are **unverified**.
4. **Skills**: disable unrelated skill descriptions per project via project-level skill settings, if supported; unverified.
Verify any profile with a fresh-session `get_usage` receipt vs the 102,081 baseline.

## 7. Limits of this audit
- Connector/app-level tool counts were counted from this session's tool list, not from a config; account connectors cannot be enumerated from files.
- No per-tool token costs were measured; section 5 is estimate.
- Whether options 2–4 are honored by the desktop app is untested.
- Memory-files figure here reflects the unrelocated branch, not the 38 KB state.
- settings.local.json / launch.json contents not read.
