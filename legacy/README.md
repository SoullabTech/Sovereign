# Legacy Code - DISABLED

**⚠️ WARNING:** Code in this directory is **DISABLED** and must **NOT** be imported or used.

---

## Why This Exists

During the sovereignty enforcement implementation (Phase 4.6), we found **36 files** containing direct `new Anthropic()` instantiations that bypassed the sovereignty architecture.

**Investigation revealed:**
- ZERO active imports (verified with `rg "from.*layered-sacred-oracle|from.*backend/maia-"`)
- These files are **dead code** - not reachable from any active routes
- They represent earlier experimental approaches before the channel-based architecture

**Rather than delete immediately** (which could cause issues if undocumented dependencies exist), we:
1. Moved them to `legacy/` to clearly mark as disabled
2. Added runtime guards to throw errors if accidentally imported
3. Documented their purpose and replacement

---

## Directory Structure

```
legacy/
├── lib/
│   └── disabled-oracles/  # Early oracle implementations with direct Anthropic
└── backend/
    └── maia-*.js          # Early backend modules with direct Anthropic
```

---

## Replacement Architecture

**DO NOT use code in this directory.**

Instead, use the sovereignty-enforced architecture:

### For LLM Calls
```typescript
// ❌ OLD (legacy, bypasses sovereignty)
import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const message = await anthropic.messages.create({...});

// ✅ NEW (sovereignty-enforced)
import { getLLM } from '@/lib/ai/providerRouter';
const llm = getLLM('chat');  // Respects SOVEREIGN_MODE flags
const response = await llm.generateText(prompt, { system, maxTokens });
```

### For Consciousness Operations
```typescript
// ❌ OLD (legacy, could leak to cloud)
const response = await someOracleFunction(input);

// ✅ NEW (always local, kernel-first)
import { maiaService } from '@/lib/sovereign/maiaService';
const response = await maiaService.processMessage(input, sessionId);
```

---

## Protection Layers

**This legacy code cannot be accidentally reintroduced:**

1. **Pre-commit hook** - Blocks `new Anthropic()` and `@anthropic-ai/sdk` imports in routes
2. **GitHub Actions CI** - Prevents `--no-verify` bypass on PRs
3. **Runtime guards** - Top of each file throws error if imported
4. **CODEOWNERS** - Changes to providerRouter require review

---

## If You Need to Reference This Code

**For understanding historical context:**
- Read the files to understand early approaches
- Check git history for reasoning behind specific implementations
- Review artifacts/SOVEREIGNTY_LOCKDOWN_COMPLETE.md for full audit

**For implementing similar functionality:**
- Use `lib/ai/providerRouter.ts` as the ONLY LLM entry point
- Use `lib/sovereign/maiaService.ts` for conversation orchestration
- Follow channel-based routing: `'chat'` (mouth) vs `'consciousness'` (mind)

---

## Safe Deletion Timeline

**Do NOT delete before:**
- [ ] Full codebase import analysis confirms zero references
- [ ] All backend routes audited for indirect imports
- [ ] Test suite confirms no runtime dependencies

**Estimated safe deletion:** After Phase 5 completion and full regression testing

---

## Files in This Directory

### lib/disabled-oracles/
- `layered-sacred-oracle.ts` - Early multi-layer oracle (replaced by maiaService)
- `elegant-sacred-oracle.ts` - Experimental simplified oracle
- `complete-sacred-oracle.ts` - Comprehensive oracle with direct Anthropic

### backend/
- `maia-i-thou.js` - I-Thou dialogue module
- `maia-triad-conversation.js` - Triad conversation orchestrator
- `maia-supervision-session.js` - Supervision session handler
- `maia-ask-needs.js` - Needs assessment module
- `maia-session-closing.js` - Session closing ritual
- `maia-first-reflection.js` - First reflection generator
- `maia-first-contact-direct.js` - First contact handler
- `maia-triad-continue.js` - Triad continuation logic

**Total:** 11 files, ~15,000 lines of code, ZERO active imports

---

## Contact

Questions about legacy code removal or sovereignty architecture:
- See: `CLAUDE.md` - Development guide
- See: `artifacts/SOVEREIGNTY_LOCKDOWN_COMPLETE.md` - Full audit
- See: `.github/CODEOWNERS` - Protected files requiring review
