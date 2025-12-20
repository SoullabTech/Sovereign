---
description: "Create complete documentation set for new feature"
argument-hint: "feature-name"
allowed-tools: "Read,Write,Grep"
---

# Documentation as Living Specification Pattern

You're documenting: **$1** (completed feature)

## WRITE THESE 5 DOCUMENTS IN ORDER

---

### DOCUMENT 1: Philosophy

Create `Community-Commons/09-Technical/$1_ARCHITECTURE.md` (500-1000 words)

```markdown
# $1: Shifting from OLD paradigm to NEW paradigm

**Status:** [Production-ready / In development / Planning]
**Last Updated:** YYYY-MM-DD

---

## The Problem

[2-3 sentences about what was broken or missing in the old approach]

## The Insight

[What changed our thinking? What realization led to this design?]

## Core Difference

| Old Approach | New Approach | Why It Matters |
|-------------|-------------|----------------|
| [Old way] | [New way] | [Impact] |
| [Old way] | [New way] | [Impact] |
| [Old way] | [New way] | [Impact] |

## Three Core Principles

1. **[Principle Name]**: [What it means + why it's essential]

2. **[Principle Name]**: [What it means + why it's essential]

3. **[Principle Name]**: [What it means + why it's essential]

## Example: Before/After

**Before:**
\`\`\`typescript
// Old implementation
\`\`\`

**After:**
\`\`\`typescript
// New implementation
\`\`\`

---

## See Also
- [ARCHITECTURE_PRINCIPLES.md](/lib/ARCHITECTURE_PRINCIPLES.md)
- [Related Feature]
```

---

### DOCUMENT 2: Quick Reference

Create `Community-Commons/09-Technical/HOW_TO_ADD_NEW_$1.md` (1000-1500 words)

```markdown
# How To Add New [$1 Item]

Quick reference for creating new $1 items.

---

## 5-Minute Workflow

### Step 1: Create Directory
\`\`\`bash
mkdir -p $1/my-item
cd $1/my-item
\`\`\`

### Step 2: Create meta.json
\`\`\`json
{
  "id": "my-item",
  "version": "0.1.0",
  "tier": "FAST|CORE|DEEP",
  "category": "foundational|lineage|emergent",
  "enabled": true
}
\`\`\`

[Continue with all steps...]

---

## Complete Example: [Item Name]

[Full working example with all files]

---

## Common Patterns

### Pattern 1: [Pattern Name]
[Copy-paste template]

### Pattern 2: [Pattern Name]
[Copy-paste template]

---

## Checklist Before Submitting

- [ ] meta.json created with all required fields
- [ ] Tested locally
- [ ] Synced to registry
- [ ] End-to-end test passing
```

---

### DOCUMENT 3: Integration Guide

Create `Community-Commons/09-Technical/$1_INTEGRATION_GUIDE.md` (1000-1200 words)

```markdown
# $1 Integration Guide

This guide shows exactly where and how to wire $1 into MAIA's request flow.

---

## Current Flow (Before Integration)

\`\`\`
1. Request arrives at /api/maia
2. Router determines tier (FAST/CORE/DEEP)
3. Cognitive profile fetched
4. Field routing applied
5. [INSERT $1 HERE] ← New step
6. Normal response paths (FAST/CORE/DEEP)
7. Response returned
\`\`\`

## Integration Point

**File:** \`lib/sovereign/maiaService.ts\`
**Location:** After field routing, before normal response paths
**Approximate line:** XXXX

**Why here?**
- After: Routing complete (we know tier, element, realm)
- Before: Normal paths (feature can override or fall through)
- Non-blocking: Errors don't break normal flow

---

## Draft Code (Ready to Paste)

\`\`\`typescript
// ===== $1 INTEGRATION =====

if (process.env.$1_ENABLED === '1') {
  try {
    const result = await run$1({...});

    if (result.outcome === 'success') {
      return {
        text: result.responseText,
        meta: {...}
      };
    }

    if (result.outcome === 'hard_refusal') {
      return {
        text: result.refusalMessage,
        meta: {...}
      };
    }

    // Soft fail: fall through
  } catch (error) {
    logError('$1-runtime-error', error);
  }
}

// Continue with normal paths...
\`\`\`

---

## Testing Procedure

[3 test scenarios with curl commands]

---

## Error Handling

All $1 errors are **non-blocking**:
- Runtime errors → Log + fall through
- Database errors → Log + disable for session
- Missing dependencies → Graceful degradation

---

## Feature Flags

- \`$1_ENABLED=0\` (default): Code exists but doesn't run
- \`$1_ENABLED=1\`: Feature active
- \`$1_SHADOW_MODE=1\`: Runs but doesn't return results (logs only)
```

---

### DOCUMENT 4: Team Memo

Create `Community-Commons/09-Technical/$1_INTEGRATION_TEAM_MEMO.md` (3000+ words)

```markdown
# $1 Integration Team Memo

**To:** Engineering, Facilitation, Data Analysis Teams
**From:** Architecture Team
**Date:** YYYY-MM-DD
**Status:** Pre-Integration — Team Alignment Required

---

## What We're Doing

[2-3 paragraphs in plain English explaining what's changing and why]

---

## Key Terminology Changes

### Before → After

| Old Language | New Language | Meaning |
|-------------|-------------|---------|
| [old] | [new] | [what it means] |

### New Core Concepts

- **[Concept]**: [Definition]
- **[Concept]**: [Definition]

---

## Integration Plan (X Phases, Y Weeks)

### Week 1: [Phase Name]
- **Code changes**: [What files change]
- **Safety**: [How we ensure no breakage]
- **Deliverable**: [What's complete by end of week]

[Continue for all weeks...]

---

## Rollout Priorities

### 1. Anchor Terminology First
- **Action**: [What to do]
- **Goal**: [What this achieves]
- **Why**: [Rationale]

[Continue for all priorities...]

---

## Success Criteria

### Week 1
- ✅ [Specific measurable outcome]

[Continue for all weeks...]

---

## What Doesn't Change

[Reassurance section]

---

## Questions Before We Start

1. **Engineering**: [Question]
2. **Facilitation**: [Question]
3. **Data Analysis**: [Question]

---

## Next Steps

1. [Action item with owner]
2. [Action item with owner]

---

**Closing:** [Philosophical principle or metaphor]
```

---

### DOCUMENT 5: Status Report

Create `$1_SYSTEM_SHIP_READY.md` (root level, 1000-1500 words)

```markdown
# $1 System — Shippable Spine Complete

**Status:** Production-ready, pending \`$1_ENABLED=1\`
**Reviewed:** YYYY-MM-DD
**Integration Point:** lib/sovereign/maiaService.ts (lines X-Y)

---

## What We Built

[2-3 paragraphs explaining the complete system]

---

## Stack Delivered

### 1) Filesystem Structure (X files)
[List all items]

### 2) Database Layer (Y files)
[List tables, functions, views]

### 3) Backend Runtime (Z files)
[List core files]

### 4) Integration Point
[Location and details]

---

## How To Enable

\`\`\`bash
export $1_ENABLED=1
npm run dev
\`\`\`

---

## Quick Verification

### Test 1: [Name]
[Command + expected output]

### Test 2: [Name]
[Command + expected output]

---

## Integration Test Results

All X scenarios passing:

1. ✅ [Scenario]
2. ✅ [Scenario]

**Run tests:**
\`\`\`bash
npx tsx scripts/test-$1.ts
\`\`\`

---

## Documentation Artifacts

1. **$1_ARCHITECTURE.md** — Philosophy
2. **HOW_TO_ADD_NEW_$1.md** — Developer guide
3. **$1_INTEGRATION_GUIDE.md** — Technical integration
4. **$1_INTEGRATION_TEAM_MEMO.md** — Team alignment
5. **This document** — Ship-ready summary

---

## Rollout Plan

[4 phases with timelines]

---

## Files Created/Modified (N total)

[Complete list]

---

## Next Steps

[Week-by-week plan]

---

## Success Criteria

[Measurable outcomes per phase]

---

## The System Is Complete

✅ [Checklist of what's done]

**The rest is iteration.**

---

**[Phase Name]: Complete.** ✅
```

---

## CROSS-LINKING

In each file, include "See also:" section:
```markdown
## See Also
- [ARCHITECTURE_PRINCIPLES.md](/lib/ARCHITECTURE_PRINCIPLES.md)
- [$1_ARCHITECTURE.md](./Community-Commons/09-Technical/$1_ARCHITECTURE.md)
- [Community Commons Index](../README.md)
```

---

**Now create these 5 documents in order, one at a time.**
