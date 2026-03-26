# AI Development Workflow: Claude Code + Codex CLI

## Two Agents, Distinct Roles

| Dimension | Claude Code | Codex CLI |
|-----------|-------------|-----------|
| **Strength** | Architecture, debugging, review, symbolic logic | Multi-file builds, refactors, repetitive execution |
| **When** | Design, investigate, refine, ship | Build, migrate, fix en masse, scaffold |
| **Mode** | Interactive, conversational | Task-based, autonomous |
| **Safety** | Full project context, canon-aware | Scoped by handoff contract |
| **Isolation** | Worktrees (optional) | Worktrees (mandatory) |

## Decision Guide: Which Agent?

**Use Claude Code when:**
- Designing architecture or making structural decisions
- Debugging subtle behavioral issues (oracle routing, conductor logic)
- Reviewing Codex output for alignment
- Working with sovereignty invariants or canon compliance
- Anything requiring project-wide context

**Use Codex CLI when:**
- Building a feature from a clear spec (Claude already designed it)
- Refactoring across many files (rename, restructure, extract)
- Fixing TypeScript errors repo-wide
- Generating database migrations from a schema spec
- Scaffolding new components/routes from patterns

## The Handoff Pattern

```
1. Claude analyzes → designs approach
2. Claude writes handoff contract (JSON)
3. Codex executes in isolated worktree
4. Claude reviews diff → fixes inconsistencies
5. Merge to main when clean
```

### Handoff Contract Format

```json
{
  "goal": "What Codex should accomplish",
  "scope": ["files to modify"],
  "constraints": ["rules to follow"],
  "expected_output": ["what done looks like"],
  "context": {
    "architecture_notes": "how this fits the system",
    "related_files": ["read-only context files"]
  }
}
```

Template: `scripts/codex-handoff.template.json`

## Commands

```bash
# Quick task (suggest mode — Codex proposes, you approve)
npm run codex "Fix all TypeScript errors in lib/consciousness/"

# Feature build (auto-edit — Codex edits freely, asks before commands)
npm run codex:feature "Implement the pattern ledger panel per docs/specs/pattern-ledger.md"

# Full autonomous run (worktree-isolated, no prompts)
npm run codex:auto "Refactor all imports in lib/maia/ to use path aliases"

# Contract-based handoff (Claude generates the JSON, Codex executes)
npm run codex:contract scripts/handoffs/shadow-agent-routing.json
```

## Safety Rules

1. **Codex never touches main directly** — always worktree-isolated
2. **Codex never modifies canon** — `docs/canon/*` is deny-listed
3. **Codex never modifies infrastructure** — docker-compose, Caddyfile, .env
4. **Codex never pushes** — `git push` is deny-listed
5. **All Codex output is reviewed by Claude or human** before merge

## Worktree Lifecycle

```bash
# Codex creates worktree automatically via codex-run.sh
# After review:
cd /path/to/worktree && git diff          # inspect changes
cd ~/MAIA-SOVEREIGN && git merge branch   # merge if clean
git worktree remove /path/to/worktree     # cleanup
```

## Environment Setup

Codex CLI requires an OpenAI API key:
```bash
export OPENAI_API_KEY="sk-..."
```

Add to your shell profile or `.env.local` (never `.env.production`).

## Configuration

Repo-level config: `.codex/config.toml`
- Model defaults, approval modes, deny-listed paths and commands
- Project instructions automatically loaded by Codex
