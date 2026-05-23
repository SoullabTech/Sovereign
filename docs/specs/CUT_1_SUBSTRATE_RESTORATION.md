# Cut 1 — Substrate Restoration

**Status:** APPROVED — implementation in progress
**Approved by:** Kelly, 2026-05-22
**Supersedes:** `docs/specs/MEMORY_WIRING_RESTORATION.md` Phase 0 framing
**Authority chain:** `docs/canon/THE_CLEARING.md` → `docs/canon/MAIA_MEMORY_CANON_v1.0.md` → `docs/canon/SPIRAL_CONTINUITY_ENGINE.md` → `docs/architecture/MAIA_PAI_MEMORY_ARCHAEOLOGY.md` §VII–VIII

---

## I. The cut

```
Live sovereign MAIA route                       (between/chat + oracle/conversation)
        │
        ▼
Phase 1.5 orchestrator                          (lib/maia/memoryOrchestrator.ts — already wired)
        │
        ▼
member_memory_atoms reader  ◀── NEW             (minimally-safe loader)
        │
        ▼
memoryHealth                ◀── NEW             (canon §VII 12-layer object)
        │
        ▼
promptBlock                                     (orchestrator's existing assembly,
                                                 now receiving atoms + health-conditioned
                                                 §VI fallback language)
```

## II. In-scope deliverables

### A. Single source of truth for §V/§VI canon guard
**New file:** `lib/maia/prompts/memoryCanonGuard.ts`

Exports:
- `MEMORY_CANON_GUARD_PROMPT` — the canonical §V forbidden-language block + §VI required fallback block (three exemplar sentences). Imported by oracle/conversation, maiaService, MAIA_RUNTIME_PROMPT.
- `FORBIDDEN_AMNESIA_PATTERNS` — regex array with verb-synonym coverage: `have / carry / hold / retain / maintain / keep / preserve / store / remember` × `memory / context / continuity / recollection / recall / thread`.
- `scrubMemoryAmnesia(text, opts)` — post-generation scrubber returning corrected text when a forbidden pattern fires.

### B. Minimally-safe atoms reader
**New file:** `lib/maia/memoryAtomsLoader.ts`

Reads `member_memory_atoms` with the following filters (all required, all canon-derived):
- `member_id = $1`
- `status IN ('active', 'still_alive')` — excludes `set_aside`, `protected`, `archived`
- `NOT ('sacred_protected' = ANY(registers))` — sacred-protected atoms are structurally voice-ineligible per migration constraint
- `return_preference IN ('contextual_doorway', 'ritual_review_opt_in')` — excludes `member_pulled` default (member has not opted into ambient surfacing)
- `ORDER BY kept_at DESC`
- `LIMIT 8`

Snapshot shape exposes:
- `id`, `title`, `body` (only when `source_type = 'spontaneous'`; never the source content for non-spontaneous atoms)
- `primaryRegister`, `registers`, `elementalLenses`, `status`, `keptAt`, `returnPreference`

Prompt block format (NO cross-atom synthesis, NO inference, NO interpretation across atoms):
```
# MEMBER-PLACED PORTFOLIO

The member has explicitly kept the following material. Member-placed, not system-inferred.
Recognize naturally if the present moment connects. Do NOT cross-reference, synthesize, or
interpret across these atoms — each stands as the member declared it.

- "<title>" — kept <relative time>, register: <register>, lens: <lens>
- ...
```

### C. memoryHealth object (canon §VII)
**New file:** `lib/maia/memoryHealth.ts`

12-layer object exactly per canon shape:
```ts
{
  recentTurns | session | conversational | episodic | semantic |
  relational | developmental | pattern | somatic | breakthrough |
  field | meta | continuityConfidence
}
```

Each layer: `"ok" | "empty" | "error"`. `continuityConfidence`: `"high" | "medium" | "low"`.

Forward-compatible: layers not yet wired report `"empty"`. Subsequent cuts will populate.

Telemetry: logged per turn via `summarizeMemoryHealthForLog(h)`. Surfaceable on ops dashboard (Canon §VII.3).

Health-conditioned prompt: when base chain (recent + episodic + semantic + relational + developmental) has more than one layer in `"error"` for an authenticated member, the §VI fallback block is amplified in the prompt.

### D. Wiring into both routes
- `app/api/oracle/conversation/route.ts` — import guard module, load atoms, build health, inject atoms prompt block late (alongside `Daily Anchor` carve-out per existing pattern at line ~2379).
- `app/api/between/chat/route.ts` — same wiring, primary chat route.
- `lib/sovereign/maiaService.ts` — import shared `FORBIDDEN_AMNESIA_PATTERNS` and concat with existing `IDENTITY_DISCLAIMER_PATTERNS`; append `MEMORY_CANON_GUARD_PROMPT` to `MEMORY_AUTHORITY_BLOCK` (identity guard preserved; memory guard upgraded).
- `lib/consciousness/MAIA_RUNTIME_PROMPT.ts` — replace inline memory guards with `MEMORY_CANON_GUARD_PROMPT`.
- `components/OracleConversation.tsx:301` — `MAX_API_HISTORY` 30 → 80.

### E. Falsifiability test
**New file:** `scripts/verify-memory-canon-v.sh`

Runs the §V regex from the new shared module against a fixed set of 10 provocation prompts and either captured production responses or live API responses. Returns 0 if no forbidden pattern fires across all 10, non-zero otherwise.

This is the gate: Cut 1 ships only when this test passes.

## III. Non-goals (explicit)

- ❌ No atom extraction (writes). Reader only.
- ❌ No schema changes. The atoms migration (2026-05-21) is sufficient as-is.
- ❌ No blind transplant from `app/api/_backend/src/services/MemoryOrchestrator.ts`. Architecture A is source, not seed code.
- ❌ No semantic / vector retrieval activation. Embedding pipeline is broken (`[SEMANTIC] Skipping insert: embedding.length=0`); Phase 2a remains gated.
- ❌ No FIS FieldState primitive composition. Deferred until enough layers are wired to compose meaningfully.
- ❌ No consolidation of `MemoryBundle` vs `MemoryOrchestrator` parallel paths. Wiring Audit Q1 is its own subsequent cut.
- ❌ No new orchestrator. The existing Phase 1.5 `lib/maia/memoryOrchestrator.ts` stays the load-bearing composer.
- ❌ No activation of any `lib/consciousness/*` orphan module.
- ❌ No surfacing of `member_pulled` atoms (default). Members must explicitly set `contextual_doorway` or opt into `ritual_review_opt_in` for an atom to surface ambiently — this is the consent gate, encoded in the reader's WHERE clause.
- ❌ No `crossing_allowed = TRUE` writes. Reader never bypasses the schema-level discipline.
- ❌ No identity-guard refactor (separate concern from memory guard).

## IV. Verification

### Compile-time
- `npm run typecheck` — zero errors.

### Static
- `npm run check:no-supabase` — zero violations (no new Supabase usage).
- Existing pre-commit hooks pass.

### Functional
- 10-provocation falsifiability test (script E above). Pass = no §V phrase fires across all 10.
- Manual smoke: authenticated session, ask MAIA "do you remember our X thread?" with no atoms set — verify §VI fallback fires, not amnesia language.
- Manual smoke: same session with member atoms set to `contextual_doorway`, ask open question — verify atoms reach the prompt block (visible in debug log if `MAYA_DEBUG_MEMORY=true`).

### Telemetry
- `memoryHealth` object logged per turn. Verifiable via:
  ```bash
  ssh soullab@minisforum 'docker logs maia-sovereign --since 10m 2>&1 | grep "memoryHealth"'
  ```

## V. Deployment

Per `CLAUDE.md`:
```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets \
  && git checkout clean-main-no-secrets \
  && git pull \
  && docker compose -p maia-sovereign -f docker-compose.production.yml --env-file .env.production up -d --build maia'
```

Verification post-deploy:
```bash
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}}"'   # under 1 min
curl -k https://soullab.life/api/health                                          # fresh JSON, uptime ~0
```

## VI. Roll-back

Single revert commit. No schema changes means no DB roll-back required. The atoms reader returning empty on revert is the same as before Cut 1 (atoms were never read).

## VII. Out of scope for this spec

Subsequent cuts (each its own spec):
- Cut 2 — Resolve Wiring Audit Q1
- Cut 3 — Daily Anchor reader
- Cut 4 — Idea threads reader
- Cut 5 — Journey-space patterns reader
- Cut 6 — Obsidian/AIN vault bridge (requires sub-spec)
- Cut 7 — Architecture A parallel-fetch + per-layer-timeout discipline restored as new code
- Cut 8 — Longitudinal axis
- Cut 9 — FIS FieldState primitive composition (the "Unified Intelligence" convergence target)
- Cut 10+ — Roadmap Phase 2a/b/c re-evaluation

Each begins when Cut N-1 has shipped and held under observation.
