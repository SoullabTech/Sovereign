# Framework Registry Monitor — Spec v0.1 (2026-05-27)

**Status:** Spec — not yet implemented. Awaiting decision points (§VII) before scaffold.
**Branch target:** new branch `feature/framework-registry-monitor` (do NOT bundle with `feature/conversational-memory-phase2`).
**Phase:** Phase 1 observability. Does not authorize wiring changes, dormant activation, or member-facing claims.

---

## 0. Frame & non-goals

This monitor exists because the framework arena currently conflates **five distinct questions** (Kelly 2026-05-27, shared grammar with `ADMIN_DIAGNOSTIC_SURFACE_2026-05-27.md`):

1. *Does this framework exist anywhere reachable to the runtime?* — **exists**
2. *Is there a prompt-builder line that could extract it?* — **reachable**
3. *Did a real turn actually invoke it?* — **participates**
4. *Does the invocation emit telemetry we can see?* — **observable**
5. *Did the model's output substantively reflect its participation?* — **influences**

The 2026-05-25 audit (`FRAMEWORK_ACCESS_MAP_2026-05-25.md`) collapses these. Member-facing language ("MAIA has access to 27+ frameworks") collapses them further. **The monitor's primary architectural function is to keep these five separable** — using the same grammar as every other arena in the parent admin observability surface.

Phase 1 measures (1)–(4). **Influence (5) is explicitly out of scope** — that is Phase 2-equivalent verification work and belongs to a separate spec after this stabilizes.

### Non-goals (refuse these in implementation)

- No wiring of dormant cat-3/4 frameworks
- No DEEP-tier addenda fix (separate work — `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §V)
- No "MAIA has access to N frameworks" claim in member-facing copy or `/maia/orientation`
- No Obsidian vault promotion from `@ts-nocheck` prototype to live source
- No retroactive reconstruction of telemetry — forward-only emission
- No assertion of "27" as canonical inventory until Kelly's master list is provided

---

## I. Five-axis separation (load-bearing — shared grammar with parent spec)

| Axis | Truth-domain | Phase 1 mechanism |
|---|---|---|
| **Exists** | Filesystem | Static inventory script (Layer A) reads registry + cat-3/4 files + Obsidian vault |
| **Reachable** | Source code | Static inventory annotates each framework with its known prompt-builder wire-points (FAST / CORE / DEEP) |
| **Participates** | Runtime | Per-turn log marker `[MAIA] framework-fired { ... }` (Layer B) confirms the addendum concatenated into a prompt |
| **Observable** | Telemetry surface | `memoryHealth.frameworks` aggregation + parent admin panel renders the participation events. A framework can participate without being observable if telemetry path is broken. |
| **Influences** | Output substance | **Out of scope for Phase 1.** Future work. Cannot be inferred from participation or observability alone. |

**Why the separation matters:** a framework can exist (cat 3) without being reachable; be reachable (cat 6 narrow) without firing in any given turn; fire without emitting telemetry (silent participation); emit telemetry without influencing output (addendum present but model ignores). Collapsing axes is the inflation pathway.

**The observable axis is load-bearing.** It's the difference between "the system did the thing" and "we can see that the system did the thing." Most failure modes in this dashboard live at the observable → participates gap — the framework fired but the panel can't see it because telemetry path is incomplete.

---

## II. Layer A — Static inventory

**Script:** `scripts/framework-inventory.ts` (new)

**Inputs:**
- `lib/consciousness/therapeuticFrameworks.ts` — canonical live registry (13 therapeutic + 5 reflection)
- `lib/` recursive scan for cat-3/4 framework-like files (keyword set: CBT, DBT, ACT, EMDR, IFS, gestalt, jungian, archetypal, family constellation, spiralogic, enneagram, MBTI, attachment theory, polyvagal, somatic experiencing, NVC, shadow work, inner child, hakomi, focusing, psychosynthesis, transpersonal, narrative therapy, solution-focused, motivational interviewing, mindfulness, compassion-focused, schema therapy)
- `OBSIDIAN_VAULT_PATH` env var (if set) — scan `02-Synthesis/`, `03-Frameworks/`, `04-Archetypal/` for framework markdown
- Optional: Kelly's canonical 27 list (when provided) — compared as separate column

**Outputs:**
- `data/framework-inventory.json` — machine-readable
- `docs/architecture/FRAMEWORK_INVENTORY_<YYYY-MM-DD>.md` — human-readable snapshot

**Schema (per entry):**
```ts
{
  id: string,              // e.g. "cbt", "ifs", "jungian"
  displayName: string,
  category: 3 | 4 | 6,     // built-not-wired / dormant-by-design / live
  source: 'registry' | 'lib-file' | 'obsidian',
  filePath: string,
  reachability: {
    fast: boolean,         // has extraction at lib/sovereign/maiaService.ts
    core: boolean,         // has extraction at lib/sovereign/maiaVoice.ts
    deep: boolean,         // has extraction at buildComprehensiveVoicePrompt
  },
  notes: string,           // provenance / activation conditions
  inCanonical27: boolean | 'unknown',  // unknown until Kelly's list provided
}
```

**Run cadence:** manual diagnostic for now (`npm run framework:inventory`). Pre-commit hook deferred (§VII decision).

**Refused:** the script does NOT auto-wire anything, does NOT modify registry, does NOT mutate state.

---

## III. Layer B — Runtime telemetry

**New log marker** (additive, no behavior change):

```
[MAIA] framework-fired {
  tier: 'FAST' | 'CORE' | 'DEEP',
  frameworkId: string,
  reflectionLensId: string | null,
  addendumChars: number,
  reachedPrompt: boolean,        // false if blocked (e.g. DEEP divergence)
  selectionMode: 'auto' | 'explicit',
  memberIdPrefix: string,        // first 8 chars only
}
```

**Wire points (existing, additive emit only):**
- FAST: `lib/sovereign/maiaService.ts:1108-1232` — emit after `therapeuticFrameworkAddendum` concatenation
- CORE: `lib/sovereign/maiaVoice.ts:811` — emit after `safeAddendum` extraction
- DEEP: emit at `buildComprehensiveVoicePrompt` site with `reachedPrompt: false` until §V fix lands — *the silence is signal*

**Critical principle:** the DEEP-tier emit with `reachedPrompt: false` is the load-bearing observation. It makes the divergence-debt **measurable from telemetry rather than from architectural reasoning**. This is the first time the gap becomes visible in runtime evidence.

---

## IV. Surfacing

**`memoryHealth.frameworks` field** (mirror of `memoryHealth.breakthrough` pattern):

```ts
memoryHealth.frameworks = {
  ok: boolean,                    // any framework fired in session
  firedCount: number,             // turns where non-null framework fired
  byTier: { fast: number, core: number, deep: number },
  byFramework: Record<string, number>,
  reachedPrompt: number,          // subset where reachedPrompt: true
  blockedAtDeep: number,          // subset where tier=DEEP and reachedPrompt=false
}
```

Wired at the same `buildMemoryHealth` call site in `app/api/sovereign/app/maia/list/route.ts` that already carries `breakthrough`.

**No member-facing UI surface in this spec.** Visible only via:
1. Server logs (grep `[MAIA] framework-fired`)
2. `GET /api/sovereign/diagnostics/frameworks` (admin-only, optional — §VII decision)
3. `memoryHealth.frameworks` in the existing admin diagnostic response

---

## V. Verification gate (contact-fidelity progression)

Following the Kelly directive 2026-05-26 stage-language pattern (`is_breakthrough`):

- **Stage 3 — Reachable**: script ships, log markers emit, schema field populated. Default state on merge.
- **Stage 4 — Verified**: first non-auto framework selection in production produces a `framework-fired` log line with `reachedPrompt: true`. Single observation under authenticated load.
- **Stage 5 — Live**: repeated firings across **multiple members across multiple sessions across multiple tiers**. Sustained operational signal — not a single test event.

**Anti-inflation guard:** the first `framework-fired { reachedPrompt: true }` row is Stage 4, NOT "MAIA has framework cognition." That phrase is not in this spec and should not appear in commit messages, PR descriptions, or member-facing copy.

**The monitor is itself Phase 1 observability** — its stage-progression also follows this ladder. The monitor is cat-6 reachable when the spec lands; cat-6 verified when its own log markers emit under production load; cat-6 live when it has been used to make at least one operational decision (e.g. caught a divergence-debt regression, or surfaced an unexpected dormant activation).

---

## VI. Refused moves (explicit)

- Promoting Obsidian vault bridge from `@ts-nocheck` prototype
- Adding any framework to the registry as part of monitor work
- Bundling DEEP-tier addenda fix into this scope
- Writing any "27 frameworks available" copy anywhere
- Pre-commit hook enforcement until manual diagnostic stabilizes
- Member-facing dashboard until Stage 5 reached
- Any retroactive log reconstruction

---

## VII. Decision points (Kelly)

Before scaffold begins:

1. **Should `framework-fired` emit for `auto` / default-Spiralogic turns?**
   - *For*: gives baseline count; distinguishes "no framework selected" from "framework selected but didn't fire."
   - *Against*: floods log with low-signal events; muddies the firing rate metric.
   - *Recommendation*: emit with `selectionMode: 'auto'` so it's filterable but present.

2. **Static inventory script — manual run only, or pre-commit hook?**
   - *Manual only* preserves the diagnostic-not-policy framing. Pre-commit risks the inventory becoming load-bearing in CI.
   - *Recommendation*: manual only for v0.1. Revisit at Stage 5.

3. **Admin diagnostic endpoint / surfacing?**
   - *Kelly 2026-05-27 directive (binding)*: yes, but **as part of unified Admin Substrate Observability** (`ADMIN_DIAGNOSTIC_SURFACE_2026-05-27.md`), NOT as a framework-only page. The framework monitor emits telemetry into `memoryHealth.frameworks` (this spec, step 2); the unified admin surface (sibling spec) reads it as Panel C (this spec's destination, step 3). No framework-only admin endpoint is built — that would violate the shared-grammar discipline.
   - *Resolved*: emit telemetry into `memoryHealth.frameworks` in this spec. Surfacing is the parent spec's job, in commit sequence per `ADMIN_DIAGNOSTIC_SURFACE` §IX.

4. **Canonical 27 list — provide now, or build monitor first and discover the gap empirically?**
   - *Now*: monitor can immediately flag missing/extra frameworks against canon.
   - *Later*: monitor reveals what's actually firing; the 27 then gets reconciled against empirical reality rather than aspirational ontology.
   - *Recommendation*: build monitor first. The empirical inventory is itself input to the 27-list decision. Reverse order risks the canon becoming aspirational rather than descriptive.

5. **Obsidian vault scan — included in v0.1, or deferred?**
   - The bridge is `@ts-nocheck` prototype. Scanning the vault filesystem (read-only) is separable from the bridge — we can scan without elevating the bridge.
   - *Recommendation*: include vault scan in Layer A static inventory (read-only filesystem walk). Do NOT touch `obsidian-vault-bridge.ts`. Surface vault-only frameworks with `source: 'obsidian'` so the gap between vault and runtime is visible.

---

## VIII. Why now (cluster alignment)

Per Kelly 2026-05-27 ratification:

> *"The architecture has already done enough thinking. Now it needs: visibility, evidence, and runtime truthfulness. The monitor is the first bridge into that world."*

This monitor is the **first live test of parallel-emission-vs-differentiated-participation** in the framework arena — the same question the Corpus Callosum substrate raised for elemental voices, now applied to therapeutic/symbolic frameworks. Once instrumented, the architecture can begin asking which frameworks actually activate, under which tiers, at what frequency, with what coverage — *without* prematurely freezing the canonical ontology.

It also operationalizes four constitutional disciplines simultaneously:
- **Integration before accumulation**: measures existing 13 before any case for the 40
- **Built ≠ wired ≠ surfacing ≠ verified**: makes the five axes operationally distinguishable
- **Sequence inversion**: observability → activation, not the reverse
- **Identity claims only after verification**: no "MAIA has frameworks" until log shows firing pattern
- **Shared grammar across arenas**: this monitor uses the same five-axis vocabulary as the parent admin observability surface — refuses per-arena ontology drift

---

## IX. Out of scope but adjacent

These belong to **separate specs** and should not be folded in:

- DEEP-tier addenda fix (`ADDENDA_CHANNEL_DIVERGENCE` §V) — the monitor *measures* the DEEP block; fixing it is different work
- Canonical 27 list reconciliation — upstream ontology work
- Obsidian vault bridge promotion — separate infrastructure decision
- Per-framework influence scoring — Phase 2-equivalent
- Member-facing framework selection UI changes — none authorized

---

## X. First commit shape (when approved)

This spec covers **steps 1–2** of the parent spec's five-step sequence (`ADMIN_DIAGNOSTIC_SURFACE_2026-05-27.md` §IX). Step 3 (admin panel surfacing) lives in the parent spec.

**Step 1 — Telemetry emission (this spec)**

Single commit, scoped:
1. `scripts/framework-inventory.ts` + `npm run framework:inventory` script (Layer A)
2. `[MAIA] framework-fired` log marker at FAST + CORE + DEEP wire points (Layer B — additive, no behavior change)
3. Log a single `data/framework-inventory.json` snapshot to confirm Stage 3 reachable
4. Commit message: `feat(framework-monitor): Phase 1 telemetry emission (Stage 3 — reachable, not verified)`

**Step 2 — memoryHealth.frameworks aggregation (this spec, separate commit)**

1. `memoryHealth.frameworks` schema field added to `buildMemoryHealth` call site
2. Per-tier aggregation (FAST / CORE / DEEP) over recent window
3. `reachedPrompt: true/false` count for divergence-debt visibility
4. Commit message: `feat(framework-monitor): wire memoryHealth.frameworks aggregation`

**Step 3+ deferred to parent spec.** No admin route, no panel, no UI in this spec.

No registry changes. No new frameworks. No DEEP fix. No member-facing copy. No admin surface creation (parent spec's job).
