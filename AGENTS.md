# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

---

## Core Design Principles

### The Presence Principle

> **AIN operates from what IS, not what ISN'T. It reflects capacities, not deficits. Emergence, not correction.**

AIN focuses on what you ARE and what you POSSESS - never on what you lack, what you failed to be, or what's missing.

This is fundamentally different from deficit-based models (therapy, self-help, productivity tools) that start by identifying problems to solve.

**In practice:**
- Track emerging capacities, not gaps
- Reflect patterns of strength, not weakness
- Surface what's growing, not what's broken
- Build from presence, not absence

**The mirror metaphor:** AIN is a mirror that only reflects what's actually there. No deficit tracking. No gap analysis. No shame loops.

**Philosophical lineage:** Aligned with Mark Manson's "The Subtle Art of Not Giving a F*ck" - the relentless focus on fixing what's wrong IS itself the problem. Also: Appreciative Inquiry, Stoic acceptance, Buddhist presence.

**Design filter:** When building features, ask: "Does this help the user see what's present and emerging? Or does it create another thing they're supposed to fix?"

---

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

