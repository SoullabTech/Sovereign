# 🌀 Spiralogic Oracle System – Claude Code Prompt Playbook

*A structured series of Claude Code prompts to manage, fix, and evolve Maya + Spiralogic.*

➡️ [Quick Reference](./docs/CLAUDE_PROMPTS_QUICK.md)  
➡️ [AIN Beta Test Prompts](./AIN_BETA_TEST_PROMPTS.md)  
➡️ [Folder Structure](./FOLDER_STRUCTURE.md)

---

## 1. **Setup & Environment**

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

✅ With this playbook, you don't have to rewrite prompts. Just copy-paste the one you need into Claude Code, and it will act in that specific role (engineer, surgeon, integrator, designer, etc.).

---

Would you like me to **auto-link this playbook into your `FOLDER_STRUCTURE.md`** so that new developers (or you later) can always find it?