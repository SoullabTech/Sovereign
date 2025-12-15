Here are the main integration points and files for the MAIA system, based on your architecture and codebase:

---

### 1. **Core Orchestration & Engine**

- [MaiaFieldOrchestrator.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Field-based orchestrator (integration with field intelligence, pattern flows)
- [MaiaFullyEducatedOrchestrator.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Claude-powered orchestrator (Maia voice, advanced response)
- [MaiaSystemRouter.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Intelligent routing between orchestrators and agents
- [ResponsePaletteEngine.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Response generation from field
- [SpiralogicOrchestrator.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Elemental calculations and Spiralogic flows

---

### 2. **Agent & Service Integration**

- [agentOrchestrator.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Coordinates all agents, memory, and intelligence
- [MultiAgentChoreographyService.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Multi-agent response orchestration
- [AINOrchestrator.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Adaptive Intelligence Network (elemental services, edge/cloud config)
- [PersonalOracleAgent.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Memory-enhanced Oracle agent, intelligence mapping

---

### 3. **Memory Systems Integration**

- [memoryIntegrationService.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Bridges Soul Memory System and Supabase journal
- [MemoryOrchestrator.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Orchestrates memory storage and retrieval
- [maia-memory-service.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Primary Supabase memory service
- [maia-memory-hybrid-adapter.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Hybrid memory adapter (Supabase + mem0)
- [mem0-adapter.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — mem0 integration layer

---

### 4. **External AI Integrations**

- **Claude:**
    - API: `https://api.anthropic.com/v1/messages`
    - Key files:
        - [MaiaFullyEducatedOrchestrator.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html)
        - [PersonalOracleAgent.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html)
        - [maya-prompts.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html)
        - [MaiaEnhancedPrompt.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html)
- **OpenAI:**
    - Key files:
        - [OracleIntelligenceService.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html)
        - [FireAgent.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html), [WaterAgent.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html), [EarthAgent.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html), [AetherAgent.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html), `EnhancedAirAgent.ts`

---

### 5. **API Entry Points**

- [route.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Main Oracle endpoint
- [route.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Maia chat endpoint
- [route.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Health monitoring

---

### 6. **Testing & Monitoring**

- [pre-launch-test-suite.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Integration and quality tests
- [route.ts](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Quality dashboard API

---

### 7. **Documentation**

- [MAIA_INTEGRATION_ARCHITECTURE.md](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Full integration map, diagrams, and file references
- [MAIA_INTEGRATION_TESTING_GUIDE.md](vscode-file://vscode-app/private/var/folders/_l/jnp2qzr17j73n3q0yr1vym2c0000gn/T/AppTranslocation/2A988A2A-0919-4186-BF1B-83B42002DE06/d/Visual%20Studio%20Code.app/Contents/Resources/app/out/vs/code/electron-browser/workbench/workbench.html) — Automated integration test scripts and flows

---

**Summary:**  
Your integration points span orchestrators, agent services, memory adapters, external AI APIs, and API routes. For full-system coherence, focus on the files above and their interfaces. The architecture docs provide diagrams and references for all critical flows. If you need a specific integration scenario or code sample, let me know!