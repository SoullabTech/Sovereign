# Follow-Up Findings — recorded, excluded from this work unit

## F-1 — JARVIS Desktop does not durably preserve C3 task intent across the authority handoff

**Status: RECORDED ONLY. Not worked in this unit, by founder directive.**

**Discovered:** 2026-08-11, while establishing whether the Desktop-submitted task text was recoverable from the execution fabric. It was not.

**Mechanism.** In `jarvis-desktop/src/main.js`, the `ipcMain.handle('jarvis:submit-task')` handler calls `route(task)`, builds a `response` object in memory, and returns it over IPC. For the C3 branch it sets `status: 'routed_not_executed'` and a note directing the founder to open a Claude Code session.

There is **no `writeFile`, no `appendFile`, and no database insert** anywhere in the handler. The only `fs` usage in the file consists of `existsSync` probes for repo markers and the capability registry. `~/Library/Application Support/jarvis-desktop/` contains only Electron/Chromium runtime state (GPUCache, Session Storage, Local Storage leveldb, Trust Tokens) — no JARVIS-authored task store.

**Consequence.** The submitted task exists only in the renderer's in-memory React state. Desktop correctly *routes* C3 intent but has nothing to *hand across* the authority boundary it just enforced. The founder must re-supply the task text manually, and a window reload loses it.

**Why this matters beyond convenience.** The C3 refusal is a deliberate governance control — Desktop declines to exercise founder identity without an active founder-driven session. That control is sound. But a governance boundary that discards the artifact it is protecting converts a *deferral* into a *loss*. The authority handoff is the exact moment the envelope most needs durability.

**Not a defect in the routing decision.** `routed_not_executed` behaved correctly and the reason string was accurate.

**Proposed disposition:** its own JARVIS work unit — persist a task envelope (id, timestamp, lane, prompt, routing decision, status) at the `routed_not_executed` branch, and surface an "Open C3 Execution Session" affordance that carries it. Scope, storage location, and retention posture to be decided in that unit, not this one.

**Explicitly excluded here** to keep the geometric-reasoning claim audit clean — a research unit that pivots into persistence plumbing loses its research objective.

---

## F-2 — Search-summary attribution error (methodological, no action required)

Search-engine summaries attributed the arXiv paper *Teleodynamic Learning* (arXiv:2603.11355) to Julian D. Michels' line of work. Direct fetch shows the authors are **Enrique ter Horst and Juan Zambrano**.

Had the summary been trusted, the ledger would have recorded a peer-venue ML publication that does not exist for this author, materially inflating the evidence base for C-4.

**Standing lesson for future claim audits:** fetch the primary. A search summary is a pointer, never a source. Recorded because this class of error is silent and self-confirming.
