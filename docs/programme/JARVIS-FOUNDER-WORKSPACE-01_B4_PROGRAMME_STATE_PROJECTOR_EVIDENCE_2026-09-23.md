# JARVIS-FOUNDER-WORKSPACE-01 — B4 · Deterministic `programme-state.v1` Projector (evidence)

**Authorized by:** founder continuation act 2026-09-23 under FD-3 (projector law) and D-03 (contract + projection, never a second truth store). **Against:** canonical `840194ba`. **Standing: B4 DELIVERED · first real projection recorded · ⛔ STOP.**

## 1 · What landed

`scripts/builder/founder-workspace/programme-state-projector.mjs` (`readTree` gathers `docs/programme/**/*.md` + the CLAUDE.md priority-thread bullets; `project` is pure over that tree; every FD-3 rule is a named, replaceable decision in `DECISIONS`; rules table `RULES` travels inside every projection) · `project-programme-state.mjs` CLI (`--summary` · `--write` → `$AIN_HOME/projections/programme-state.v1.json`, refuses any path under docs/) · `tests/constitutional/founder-workspace/{b4-matrix,b4-candidates}.mjs`.

**FD-3 as implemented** — association R-A1 filename-prefix hyphenated id · R-A2 `evidence/<ID>/` · R-A3 first backticked id in a thread bullet · else UNCLASSIFIED; precedence R-P1 founder adjudication/rulings/ratification record with an extractable standing line, newest first · R-P2 newest record with a `**State|Status|Standing|Disposition:**` line (a lone record governs without a date; several with any undated one are undecidable) · R-P3 the thread orients (`thread.newer_act_identified`) and never overrides · R-P4 same tier + same date + different standing → `UNVERIFIED / CONFLICT`, both cited; external R-X1 = the D-01 rule (a founder-record line carrying a backticked id and *EXTERNAL PROTECTED DEPENDENCY*); R-E1 no exclusions in v1; R-C1 `complete ⇔ 0 unclassified ∧ 0 unreadable ∧ examined = emitted + excluded + classified`. Output carries `presentation_only:true` · `authority_effect:'none'` · `content_hash` (excludes `projected_at`).

## 2 · Matrix (this container)

PJ-0 deterministic (identical `content_hash` across runs) · PJ-1 standing verbatim incl. emoji and emphasis · PJ-2 completeness only by the FD-3 arithmetic · PJ-3 thread orients, never overrides · PJ-4 an older founder adjudication governs over a newer plain record · PJ-5 same-day disagreement → CONFLICT · PJ-6 unassociable file + id-less bullet stay UNCLASSIFIED and block `complete` · PS-4 no-standing programme emitted UNVERIFIED, never omitted · PJ-7 D-01 external row carries `custody.branch: outside this repository` · PJ-8 no consumer outside `founder-workspace/` reads a projection (static scan of `jarvis-desktop/src`, `scripts/builder`, `lib`: 0 hits) · PJ-9 the F0 fixture's programme ids ⊆ the live projection, with **one recorded exception** (below) · PJ-10 the real projection validates as `programme_state` inside a live view-model (VM-4). **DC-P1…DC-P6 all DEAD** → exit 0.

## 3 · The first real projection (observed against this checkout)

`630 subjects (570 files · 60 thread bullets) · 197 programme ids · 94 unclassified · 0 unreadable · complete=false` · evidence states OBSERVED 55 · UNVERIFIED 125 · UNVERIFIED / CONFLICT 17. Reproduce: `npm run project:programme-state`.

⭐ **Three findings, each a docket item, none guessed around:**
1. **PD-1 · date is too coarse a clock.** 17 programmes carry same-day records with different standing lines (e.g. `JARVIS-FOUNDER-WORKSPACE-01` F0 → F1 → F1R1 adjudications all dated 2026-09-23; `JARVIS-WORK-UNIT-01` W0…W5, all 2026-09-18). R-P4 correctly refuses to choose. Measured, not taken: ordering those 17 sets by each file's last git commit time would fully order **5** and leave **12** still tied (multi-file commits). A finer deterministic clock (a `supersedes:` line, an act sequence in the filename, or git first-add order) is a **founder rule**, not a projector default.
2. **PD-2 · 94 subjects have no deterministic programme.** 29 thread bullets carry no backticked id (older bullet style); 65 files use non-hyphenated or non-id prefixes (`J11_…` ×13, `MAIA_WHOLE_ORGANISM_MAP/…` ×12, `LIVING_…`, `PARKED_…`, `S3_…`, `WRITERS_STUDIO_…`, findings named by subject). An alias table is a governed rule (R-A4), owed before `complete:true` can ever be true.
3. **PD-3 · the F0 fixture's `WORKSTATION-STORAGE-RELIEF` lives outside FD-3's population** (record in `docs/ops`, thread bullet without a backticked id). The matrix records it as the one known exception rather than widening the population silently; whether `docs/ops` lanes join the population is a founder rule.

Also observed: false programme ids from act-shaped prefixes (`F5-A`, `ER-R1`, `DC-C7`, `GATE-0`) — honest under R-A1, and the same alias act (PD-2) resolves them.

## 4 · Not done

No projection written anywhere in this container (`--write` not invoked); no `$AIN` touched; no Today surface; no consumer; ⛔ B5 not open.
