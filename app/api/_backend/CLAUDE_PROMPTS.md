# 🌀 Spiralogic / Maya – Claude Code Prompt Series

*A structured set of code-generation prompts to manage your project.*

> **How to use:** Copy the specific prompt you need and paste it into Claude. Claude will execute the steps systematically.

---

## 1. **Setup & Environment**

**Prompt:**

```
⏺ Claude, act as my Spiralogic build engineer.  
Task: Verify and fix environment setup.  
Steps:  
1. Check .env.local for missing/incorrect API keys (OpenAI, Anthropic, Supabase, ElevenLabs, Sesame).  
2. Verify port alignment (frontend, backend).  
3. Confirm npm/yarn deps with --legacy-peer-deps as needed.  
4. Output missing configs in checklist format.
```

---

## 2. **Type Fixing & Compilation**

**Prompt:**

```
⏺ Claude, act as my TypeScript surgeon.  
Task: Ensure clean compile for backend.  
Steps:  
1. Scan backend/src for type mismatches.  
2. Auto-patch AgentResponse, MemoryItem, OracleInsight types.  
3. Add missing imports and definitions.  
4. Write scripts/fix-types.sh that runs tsc --noEmit and auto-fixes common errors.  
5. Summarize which files were touched.
```

---

## 3. **Service Integration (Sesame, Supabase, ElevenLabs)**

**Prompt:**

```
⏺ Claude, act as my API integrator.  
Task: Confirm Sesame + Supabase + ElevenLabs integrations.  
Steps:  
1. Generate scripts/test-sesame.sh for HuggingFace models.  
2. Add test-sesame to start-beta.sh flow.  
3. Write Supabase persistence test (write/read/delete cycle).  
4. Add ElevenLabs "Maya is online" confirmation voice.  
5. Return unified status dashboard.
```

---

## 4. **Orchestration & Agent Routing**

**Prompt:**

```
⏺ Claude, act as my Oracle conductor.  
Task: Verify and simplify agent orchestration.  
Steps:  
1. Inspect MainOracleAgent for routing to DreamAgent, ShadowAgent, GuideAgent, etc.  
2. Add fallback logic (if Sesame is down, route to OpenAI).  
3. Refactor with score-based adaptive routing.  
4. Ensure all elemental agents (Fire, Water, Earth, Air, Aether) respond with .content not .response.  
5. Generate integration diagram in markdown.
```

---

## 5. **UI/UX Simplification**

**Prompt:**

```
⏺ Claude, act as my Sacred UI designer.  
Task: Enforce Sacred Tech aesthetic on frontend.  
Steps:  
1. Create SimplifiedOracleInterface.tsx with minimal chat + gold pulse for breakthroughs.  
2. Add oracle-animations.css for emotional states.  
3. Update simplified-page.tsx with clean layout.  
4. Document in UI_GUIDE.md.  
```

---

## 6. **Beta Readiness Validation**

**Prompt:**

```
⏺ Claude, act as my QA orchestrator.  
Task: Validate full beta readiness.  
Steps:  
1. Run scripts/beta-check.sh.  
2. Confirm all 15 smoke tests in MAYA_SMOKE_TESTS.md.  
3. Output green/yellow/red dashboard.  
4. Suggest fixes if any system fails.  
```

---

## 7. **CSM Voice Integration**

**Prompt:**

```
⏺ Claude, act as my voice architect.  
Task: Finalize Sesame CSM integration for Maya.  
Steps:  
1. Connect CSMConversationMemory to /api/oracle/chat.  
2. Test with test-maya-csm-integration.js.  
3. Map elemental voice tones (Air, Fire, Water, Earth, Aether).  
4. Update start-beta.sh to include CSM test.  
5. Document in CSM_INTEGRATION_COMPLETE.md.
```

---

## 8. **Ongoing Maintenance**

**Prompt:**

```
⏺ Claude, act as my Spiralogic caretaker.  
Task: Continuous debugging + improvement.  
Steps:  
1. Detect infinite restart loops and patch nodemon.json.  
2. Auto-fix common issues with logger, imports, types.  
3. Keep start-beta.sh current with new tests.  
4. Summarize all changes in CHANGELOG.md.  
```

---

## 9. **Test Suite Management**

**Prompt:**

```
⏺ Claude, act as my test conductor.
Task: Manage and update Maya smoke tests.
Steps:
1. Update test-maya-unified.ts to use correct API endpoints.
2. Fix all request/response formats (userText not message).
3. Add new tests for CSM voice, elemental routing.
4. Generate test coverage report.
5. Create npm script for easy test runs.
```

---

## 10. **Documentation Sync**

**Prompt:**

```
⏺ Claude, act as my documentation architect.
Task: Keep all docs current with implementation.
Steps:
1. Update BETA_ARCHITECTURE.md with latest changes.
2. Sync API_REFERENCE.md with actual endpoints.
3. Create TROUBLESHOOTING.md for common issues.
4. Generate dependency graph in TECH_STACK.md.
5. Output doc health report.
```

---

## 11. **Performance Optimization**

**Prompt:**

```
⏺ Claude, act as my performance engineer.
Task: Optimize Maya's response times.
Steps:
1. Profile API response times with console.time().
2. Add Redis caching for repeated queries.
3. Implement request debouncing (500ms).
4. Create performance dashboard endpoint.
5. Document optimizations in PERFORMANCE.md.
```

---

## 12. **Security Hardening**

**Prompt:**

```
⏺ Claude, act as my security guardian.
Task: Harden the Oracle system.
Steps:
1. Audit all API endpoints for auth requirements.
2. Add rate limiting to prevent abuse.
3. Sanitize all user inputs against injection.
4. Rotate exposed API keys in .env.local.
5. Create SECURITY_CHECKLIST.md.
```

---

## 13. **Memory System Enhancement**

**Prompt:**

```
⏺ Claude, act as my memory architect.
Task: Enhance Maya's memory capabilities.
Steps:
1. Implement MemoryService with Supabase backend.
2. Add memory summarization for long conversations.
3. Create memory export/import functionality.
4. Test memory persistence across restarts.
5. Document in MEMORY_ARCHITECTURE.md.
```

---

## 14. **Elemental Balance Tuning**

**Prompt:**

```
⏺ Claude, act as my elemental harmonizer.
Task: Fine-tune elemental agent responses.
Steps:
1. Analyze response patterns for each element.
2. Adjust elemental routing thresholds.
3. Create elemental diagnostic endpoint.
4. Test cross-elemental transitions.
5. Document in ELEMENTAL_TUNING.md.
```

---

## 15. **Production Readiness**

**Prompt:**

```
⏺ Claude, act as my deployment engineer.
Task: Prepare for production deployment.
Steps:
1. Create production.env template.
2. Add health check endpoints.
3. Configure error monitoring (Sentry).
4. Set up backup strategies.
5. Generate DEPLOYMENT_GUIDE.md.
```

---

## Quick Reference Commands

### Environment Check
```bash
cd backend && npm run check:env
```

### Type Check
```bash
cd backend && npm run type:check
```

### Service Tests
```bash
cd backend && ./scripts/test-sesame.sh
```

### Full Beta Launch
```bash
cd backend && ./scripts/start-beta.sh
```

### Run Smoke Tests
```bash
npx tsx test-maya-unified.ts
```

---

## Prompt Chaining

For complex tasks, chain prompts together:

1. Start with **Prompt #1** (Environment Setup)
2. Then **Prompt #2** (Type Fixing)
3. Follow with **Prompt #3** (Service Integration)
4. Validate with **Prompt #6** (Beta Readiness)

---

## Custom Prompt Template

```
⏺ Claude, act as my [ROLE].
Task: [SPECIFIC OBJECTIVE].
Steps:
1. [First action with clear output]
2. [Second action with validation]
3. [Third action with error handling]
4. [Documentation update]
5. [Summary/report generation]
```

---

⚡ **Pro tip:** Save frequently-used prompts as keyboard shortcuts or in a snippet manager for instant access.

---

*Last updated: [Current Date]*
*Version: 1.0*