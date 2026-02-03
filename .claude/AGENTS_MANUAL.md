# MAIA Agent Team Manual

## Quick Start

Open Claude Code in the MAIA-SOVEREIGN directory. Your agents are automatically available.

```bash
cd ~/MAIA-SOVEREIGN
claude
```

---

## Your Agents

| Agent | When to Use | Example |
|-------|-------------|---------|
| **ain-architect** | Design decisions, architecture questions | "How should we structure the memory system?" |
| **maia-dev** | Building features, fixing bugs | "Implement the spiral profile service" |
| **ain-growth** | Marketing, content, community | "Write a blog post about sovereign AI" |
| **maia-ops** | Deployments, health checks, releases | "Deploy to production" |
| **maia-ios** | iOS builds, Capacitor issues | "Build for TestFlight" |
| **security-auditor** | Security review, audit | "Audit the authentication flow" |

---

## How to Call Agents

### Explicit Call
```
Use ain-architect to review the proposed database schema for beads and threads
```

### Automatic Delegation
Claude Code will automatically delegate based on the task:
```
Review the memory consent architecture
```
(Claude recognizes this is architecture work and may use ain-architect)

### Parallel Execution (Task Queue Model)
Send multiple tasks in one message:
```
Use ain-architect to design the notification system
Use maia-dev to fix the voice pipeline bug
Use ain-growth to draft launch week content
Use maia-ops to check production health
```
All four run simultaneously.

---

## Daily Workflows

### Morning Standup
```
In parallel:
- Use maia-ops to report system health
- Use security-auditor to scan yesterday's changes
- Use ain-growth to suggest today's content focus
```

### Design Session
```
Use ain-architect to explore options for [feature]
```
Review the proposal, ask questions, then:
```
Use maia-dev to implement the approved design
```

### Development Sprint
```
Use maia-dev to implement [feature] following the patterns in lib/memory/
```

### Content Creation
```
Use ain-growth to create a complete blog post about [topic] ready for publication
```

### Release Day
```
1. Use maia-ios to build for TestFlight
2. Use maia-ops to deploy web to production
3. Use ain-growth to draft release announcement
```

---

## Steering Mid-Task

While an agent is working, you can inject guidance:

```
# Agent is working on a feature...

Add this context: The feature should respect Sanctuary Mode - no content retention

# Agent incorporates this into ongoing work
```

---

## Background Execution

For long-running tasks:
```
Run the test suite in the background while I review the architecture
```

Check progress:
```
/tasks
```

---

## Agent Capabilities Summary

### ain-architect (Design)
- **Tools**: Read, Glob, Grep, WebSearch, WebFetch
- **Model**: Opus (most capable)
- **Mode**: Plan (read-only, proposes but doesn't change)
- **Use for**: Architecture decisions, system design, research

### maia-dev (Build)
- **Tools**: Read, Glob, Grep, Edit, Write, Bash
- **Model**: Sonnet (balanced)
- **Mode**: Full access
- **Use for**: Feature implementation, bug fixes, refactoring
- **Auto-runs**: typecheck, no-supabase check, smoke tests

### ain-growth (Market)
- **Tools**: Read, Write, WebSearch, WebFetch, Glob
- **Model**: Sonnet
- **Mode**: Write access
- **Use for**: Blog posts, social content, launch planning, community strategy

### maia-ops (Deploy)
- **Tools**: Bash, Read, Grep, Glob
- **Model**: Haiku (fast, cheap)
- **Mode**: Bash access
- **Use for**: Deployments, health checks, container management, logs

### maia-ios (Mobile)
- **Tools**: Bash, Read, Edit, Glob, Grep
- **Model**: Sonnet
- **Mode**: Full access
- **Use for**: iOS builds, Capacitor issues, TestFlight releases

### security-auditor (Review)
- **Tools**: Read, Glob, Grep
- **Model**: Sonnet
- **Mode**: Plan (read-only)
- **Use for**: Security audits, vulnerability scanning, compliance checks

---

## Common Patterns

### Research Then Build
```
Use ain-architect to research how other sovereign AI projects handle memory consent

# Review findings, then:

Use maia-dev to implement our approach based on the research
```

### Parallel Research
```
Research these three areas in parallel using separate agents:
- Voice pipeline architecture
- Memory consent patterns
- iOS authentication flow
```

### Chain of Responsibility
```
Use security-auditor to review the auth changes
# If issues found:
Use maia-dev to fix the security issues
# Then:
Use maia-ops to deploy the fixes
```

### Content Pipeline
```
Use ain-growth to:
1. Research what resonates about sovereign AI
2. Draft a blog post
3. Create social media excerpts
4. Suggest a content calendar for launch week
```

---

## Troubleshooting

### Agent Not Found
Make sure you're in the MAIA-SOVEREIGN directory:
```bash
cd ~/MAIA-SOVEREIGN
claude
```

### Agent Using Wrong Approach
Be more specific:
```
Use maia-dev to implement this following the existing pattern in lib/memory/BeadService.ts
```

### Too Slow
Use haiku for simple tasks:
```
Use maia-ops to quickly check if all containers are running
```

### Need More Capability
Use opus for complex reasoning:
```
Use ain-architect to analyze the tradeoffs between three different memory architectures
```

---

## Extending the Team

Create new agents in `.claude/agents/`:

```markdown
---
name: my-new-agent
description: When Claude should use this agent
tools: Read, Glob, Grep  # What it can access
model: sonnet            # sonnet, opus, or haiku
permissionMode: default  # default, plan, acceptEdits
---

System prompt for the agent goes here.
Describe its role, constraints, and patterns.
```

---

## Integration with Cowork

Once you have Claude Cowork (Max plan):

| Task Type | Use |
|-----------|-----|
| Code, builds, git | Claude Code + these agents |
| Docs, research, files | Claude Cowork |
| Marketing assets | Either (Cowork for design files) |

They share the same underlying architecture. Use Code for technical work, Cowork for everything else.

---

## The Philosophy

From the video: "Task queues position AI as your worker. You delegate, it executes, you review."

Your job:
1. **Steer** — Define what you want clearly
2. **Review** — Check the output quality
3. **Redirect** — Adjust mid-execution if needed

The agents' job:
1. **Plan** — Break down the task
2. **Execute** — Do the work
3. **Report** — Show you what was done

This is managing, not chatting.

---

## Quick Reference Card

```
# Check health
Use maia-ops to check all systems

# Build iOS
Use maia-ios to build for TestFlight

# Deploy
Use maia-ops to deploy to production

# New feature
Use ain-architect to design [feature]
Use maia-dev to implement [feature]

# Content
Use ain-growth to write [content type] about [topic]

# Security
Use security-auditor to review [area]

# Parallel work
Use [agent1] to [task1]
Use [agent2] to [task2]
Use [agent3] to [task3]
```

---

*Last updated: 2025-01-25*
*Agents location: `.claude/agents/`*
