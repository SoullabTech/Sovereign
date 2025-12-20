# Development Pattern Automation — Complete ✅

**Status:** Ship-ready
**Date:** 2025-12-20
**Location:** `.claude/commands/`

---

## What Was Created

Five custom slash commands that automate MAIA's most-used development workflows:

### 1. `/architecture-refinement [feature-name]`

Guides you through the complete architecture refinement workflow:
- Philosophy document first (problem → insight → difference table → principles)
- Type system (interfaces, gates, contraindications)
- Database schema (tables, functions, views, indexes)
- Progressive disclosure runtime
- Integration point in getMaiaResponse()
- 3-doc set (ship-ready, quick ref, team memo)

**When to use:** Building new major systems (agents, skills, consciousness frameworks)

---

### 2. `/migration-upgrade [feature-name]`

Creates complete database migration workflow:
- Dependency analysis
- Migration SQL file (<2KB, idempotent)
- Apply script with rollback protection
- Verify script (tables, functions, views, indexes)
- Documentation with rollback procedure

**When to use:** Schema changes, data transformations, deprecations

---

### 3. `/testing-pattern [feature-name]`

Generates comprehensive test suite:
- Golden test cases JSON (happy path + refusals + edge cases)
- Integration test script with pass/fail tracking
- Smoke tests (curl commands for manual verification)
- Database verification script

**When to use:** Before shipping any new feature

---

### 4. `/documentation-pattern [feature-name]`

Creates complete 5-document set:
1. Philosophy (ARCHITECTURE.md) — The "why"
2. Quick Reference (HOW_TO_ADD_NEW.md) — 5-minute workflow
3. Integration Guide (INTEGRATION_GUIDE.md) — Exact line numbers, code
4. Team Memo (INTEGRATION_TEAM_MEMO.md) — Rollout plan, alignment
5. Status Report (SYSTEM_SHIP_READY.md) — What's done, how to enable

**When to use:** After code complete, before rollout

---

### 5. `/progressive-disclosure [feature-name]`

Implements 3-tier loading architecture:
- Layer 1: Metadata files (boot-time, <1KB each)
- Layer 2: Definition files (on-demand, <10KB each)
- Layer 3: Execution files (prompts/tools, load on use)
- Runtime loader with feature flags
- 4-phase rollout sequence (silent → shadow → gradual → full)

**When to use:** Features that could scale to 100+ items

---

## How To Use

### Basic Usage

```bash
# In Claude Code terminal:
/architecture-refinement user-authentication
/testing-pattern payment-processor
/documentation-pattern invocation-system
```

### With Context

The commands have access to your entire codebase via allowed tools:
- `Read` - Read existing files for context
- `Write` - Create new files
- `Edit` - Modify existing files
- `Grep` - Search for patterns
- `Glob` - Find files by pattern
- `Bash` - Run scripts/verification

### Command Chaining

You can invoke multiple commands sequentially:

```bash
# Full workflow for new feature:
/architecture-refinement shadow-integration
# ... follow the 6-step workflow ...

/testing-pattern shadow-integration
# ... create test suite ...

/documentation-pattern shadow-integration
# ... write 5 docs ...
```

---

## Technical Implementation

### File Structure

```
.claude/
├── commands/
│   ├── architecture-refinement.md
│   ├── migration-upgrade.md
│   ├── testing-pattern.md
│   ├── documentation-pattern.md
│   └── progressive-disclosure.md
├── project-context.md
└── settings.local.json
```

### YAML Frontmatter

Each command includes:

```yaml
---
description: "Short description for /help"
argument-hint: "feature-name"
allowed-tools: "Read,Write,Edit,Grep,Glob,Bash"
---
```

**Benefits:**
- `description` - Shows in `/help` output
- `argument-hint` - Reminds user what to pass
- `allowed-tools` - Restricts tool access for safety

### Variable Substitution

Commands use `$1`, `$2`, etc. for arguments:

```markdown
You are architecting: **$1**

Create `lib/$1/types.ts`:
...
```

When invoked as `/architecture-refinement shadow-integration`, `$1` becomes `shadow-integration`.

---

## Advantages Over Manual Prompts

### Before (Manual)

```
User: "Help me build a new feature with proper architecture"
Claude: "Sure! What kind of feature?"
User: "A skills system"
Claude: "Great! Let me start with the types..."
[15 messages back and forth]
```

### After (Automated)

```
User: /architecture-refinement skills-system
Claude: [Immediately follows 6-step workflow]
        1. Creates SKILLS_SYSTEM_ARCHITECTURE.md
        2. Creates lib/skills/types.ts
        [etc., all in one flow]
```

### Key Improvements

1. **Consistency** - Same workflow every time
2. **Completeness** - Never forget a step
3. **Speed** - One command vs 15-message conversation
4. **Team alignment** - Everyone uses same patterns
5. **Discoverability** - `/help` lists all workflows

---

## Advanced Features

### Model Selection

You can specify which Claude model to use:

```yaml
---
description: "..."
model: "claude-opus"  # Use Opus for complex architecture
---
```

**Default:** Inherits from parent (usually Sonnet)
**Options:** `claude-sonnet`, `claude-opus`, `claude-haiku`

### Tool Restrictions

Limit which tools the command can use:

```yaml
allowed-tools: "Read,Grep"  # Read-only command
```

**Safety benefit:** Documentation commands can't accidentally modify code.

### Chaining with Skills

Slash commands are **explicit** (you invoke them).
Skills are **implicit** (Claude invokes when relevant).

**Recommended setup:**
- Slash commands for **initiating** workflows
- Skills for **applying** patterns during work

---

## Existing Slash Commands

You already have:

```bash
/db  # Database operations workflow
```

**Location:** `.claude/commands/db.md`

Your new commands integrate seamlessly with existing ones.

---

## Next Steps

### 1. Test the Commands

```bash
# Try each one:
/architecture-refinement test-feature
/testing-pattern test-feature
/documentation-pattern test-feature
```

### 2. Create Skills (Complementary)

Create `.claude/skills/` directory with agent skills that **automatically apply** these patterns when Claude detects the need.

**Example:**
```
.claude/skills/architecture-refinement/
├── SKILL.md
└── templates/
    └── architecture-template.md
```

When you say "I need to build a new consciousness framework," Claude automatically applies the architecture refinement skill.

### 3. Add to Team Workflow

Commit `.claude/commands/` to git:

```bash
git add .claude/commands/
git commit -m "✨ Add development pattern automation

5 slash commands for architecture, migration, testing,
documentation, and progressive disclosure workflows.

Usage: /architecture-refinement feature-name"
```

Now your entire team has access to these workflows.

---

## Sovereignty Hardening

The existing `scripts/audit-sovereignty.ts` is already production-grade with:

✅ Config file support (`.sovereignty-audit.json`)
✅ AST-based detection (not just regex)
✅ Machine-readable output (JSON)
✅ Monorepo safety (ignores node_modules, build dirs)

**To wire into CI:**

```yaml
# .github/workflows/sovereignty.yml
name: Sovereignty Audit
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run audit:sovereignty
        env:
          FAIL_ON: critical  # Fail only on critical violations
```

**Thresholds:**
- `critical > 0` → Fail build
- `high > 0` → Warn (don't block)
- `medium/low` → Track as debt

---

## Documentation Reference

**Full patterns guide:**
`OPTIMAL_PROMPTS_TOP_5_PROCESSES.md` (67KB reference)

**Contains:**
- Complete workflow descriptions
- Common pitfalls
- Success criteria
- Example implementations
- Meta-prompting strategy

**Relationship:**
- Slash commands = **Executable** workflows
- Documentation = **Reference** material

---

## Success Metrics

After implementing these commands, you should see:

✅ **Faster feature delivery** - No more "how do I structure this?" questions
✅ **Consistent quality** - Every feature follows same patterns
✅ **Reduced rework** - Fewer architectural mistakes caught late
✅ **Better docs** - Documentation created during implementation, not after
✅ **Team alignment** - Everyone uses same workflows

---

## Feedback Loop

**If a command workflow needs improvement:**

1. Edit the `.claude/commands/[command].md` file
2. Test the updated workflow
3. Commit the change
4. Team gets updated workflow on next pull

**Living documentation:** Commands evolve with your practices.

---

## See Also

- **Claude Code Slash Commands Docs:** https://code.claude.com/docs/en/slash-commands
- **Claude Code Skills Docs:** https://code.claude.com/docs/en/skills
- **OPTIMAL_PROMPTS_TOP_5_PROCESSES.md** - Full reference guide
- **MULTI_MODEL_QUICKSTART.md** - Model selection system
- **MAIA_BETA_SPINE_HARDENING_WHITEPAPER.md** - Certification system

---

**Development automation complete. Five workflows now invokable with single commands.** ✅
