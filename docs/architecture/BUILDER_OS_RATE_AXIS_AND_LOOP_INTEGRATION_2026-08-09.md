# Builder OS — Request-Rate Axis + Closed-Loop Integration (Horizon III)

**Date:** 2026-08-09 · **Authority:** founder directive, Horizon III concurrency governance +
worktree ownership · **Evidence basis:**
[`CLAUDE_CODE_RESET_WINDOW_ATTRIBUTION_2026-08-09.md`](../ops/CLAUDE_CODE_RESET_WINDOW_ATTRIBUTION_2026-08-09.md)
(*"it was rate, not weight"*).

**Scope discipline:** no product code · no model-routing change · no automatic Kimi/Qwen
delegation · no deployment · no Horizon IV/V work. This unit builds the traffic controller;
it does not choose alternate roads.

---

## 0. Headline

The directive's controls were **~70% already built** by a parallel session earlier the same
day. This unit **recovered rather than rebuilt**, then closed the four genuine gaps and
repaired one real defect that only appeared once the pieces were tested together.

> **The concurrency incident produced duplicate work on the concurrency fix.** That is not an
> anecdote — it is the §2 "recover before build" rule earning its place, and it is the single
> best argument for the work-unit registry the Master Directive describes.

---

## 1. Substrate recovered (classification per directive §2)

| Substrate | Found | Disposition |
|---|---|---|
| `scripts/builder/session.mjs` (490 ln) — capacity budget, worktree/branch ownership, read/write claims, collision detection, stale recovery, ledger | built same day, untracked, **54/54 proofs passing** | **PRESERVE + COMPLETE** |
| `scripts/builder/__tests__/session-proof.mjs` | 54 assertions incl. mutation controls | **PRESERVE** — extended, never rewritten |
| `scripts/ain-worktree-claim.sh` | isolated-worktree creation | **PRESERVE** — referenced, not reimplemented |
| `~/.claude/ain-delegation/` (sessions · packets · results · logs) | existing ledger home | **PRESERVE** — reused as-is |
| `scripts/builder/orient.mjs` + proof (33) | Closed Loop 1 | **RECONNECT** — governance probe added |
| `scripts/builder/continue.mjs` + proof (27) | Closed Loop 1 | **RECONNECT** — gated release added |
| `deploy-lock.sh` flock pattern | proven lock idiom | **PRESERVE** — pattern followed, not copied |
| `CLAUDE_CODE_RAPID_ALLOTMENT_EXHAUSTION_AUDIT_2026-08-09.md` | parallel audit of the same event | **RECONCILE** — see §5 |

**Nothing was duplicated.** No second registry, ontology, roadmap, or handoff mechanism was
created.

---

## 2. What was genuinely missing, and was built

| Gap | Built | Proof |
|---|---|---|
| **Rate observability** — the variable that actually failed had no instrument | `scripts/builder/rate.mjs` — 5m/30m/60m/5h windows, ratio-to-baseline, distinct sessions, model mix | `rate-proof.mjs` (24) |
| **Rate warning bands** | NORMAL <2× · ELEVATED 2–4× · HIGH 4–8× · ANOMALOUS ≥8× | R1/R2 + reachability + burst controls |
| **`/orient` governance awareness** | ownership · capacity · rate · contention, read-only | `loop-governance-proof.mjs` (28) |
| **`/continue` release** | validation-gated release of write claim + capacity slot | H0–H2 |
| **Founder status surface** | rate wired into `session.mjs status`; `/jarvis` skill; `npm run jarvis` | scenario proof |
| **Instrument wiring** | `npm run jarvis` / `jarvis:rate` / `jarvis:report` / `jarvis:proof` | — |

Policy change: **default concurrency 2 → 1** per founder directive. The prior value's
evidence (2 was this machine's observed-normal) is *preserved in the source comment*, so
raising it back is an evidence-backed configuration change rather than a regression.

---

## 3. Defect found by testing, not by inspection

**Worktree ownership could be defeated by path spelling.** `session.mjs` compared claims with
`path.resolve()`, which normalizes `..` and relativity but **not symlinks**. Two sessions
naming the same physical directory as `/var/…` and `/private/var/…` would each believe they
held a different worktree while writing the same files — a direct breach of
*one write unit → one worktree → one owner*.

Fixed with `canonicalWorktree()` (`realpathSync`, falling back to `path.resolve` for paths
that do not yet exist). Regression-locked by the symlink case in `incident-scenario-proof.mjs`.

This defect was invisible to 54 passing proofs and appeared only when `/orient` and
`session.mjs` were made to agree about the same worktree — **integration was the instrument.**

---

## 4. Exact behavior now

**Two distinct controls, never collapsed.**

- **Capacity** (how many Claude lanes may consume requests): budget default **1**; excess work
  → `WAITING_FOR_CLAUDE`, queued (exit 3), never silently started. Founder override admits
  beyond the budget and is written to the ledger with author, reason and timestamp.
- **Ownership** (who may mutate an artifact): one write unit → one branch → one worktree → one
  owner. Read claims are distinct and acquire no write authority, yet still consume capacity —
  because inspection consumes Claude, even though it mutates nothing.

**Ownership refusal outranks the queue, deliberately.** You cannot queue for a worktree another
writer owns: waiting would not make it available, so the honest answer is refusal. Queueing is
for *capacity*, which does free up.

**Escalation ladder in `/orient`:** ownership held → `STOP` · packet contradicted → `DOWNGRADE`
· capacity full → `WAITING_FOR_CLAUDE` · hazard / stale probe / ANOMALOUS rate → `WARN` · else
`OK`. Capacity gets its own verdict so a full lane is never mistaken for a broken workspace.

**`/orient` never acquires authority by looking** (proof G1: three runs change the active count
by zero). Claiming is a separate deliberate act.

**`/continue --handoff` is the only mutating path**, and it is gated: a valid packet releases
claim + slot; an **invalid packet releases neither** and says so. Freeing a lane while
destroying the continuity that made the lane worth holding is the worst available outcome.

**Nothing is ever killed, throttled, or rerouted.** The rate surface recommends; humans act.

---

## 5. Two audits of one day — reconciled, not ranked

Two independent audits of 2026-08-09 exist. They were produced by different concurrent
sessions and **converge**; that convergence is itself evidence the diagnosis is stable.

| | RAPID_ALLOTMENT_EXHAUSTION | RESET_WINDOW_ATTRIBUTION |
|---|---|---|
| window | trailing 24 h | post-reset 10.8 h |
| sessions | 37 | 34 |
| concurrency method | hourly sampling | 5-minute buckets |
| sustained / peak | 11 sustained, **14 peak** | 14 sustained, **18 peak** |
| top-1 burden | 14.3% | 13.9% |
| top-10 burden | 76.4% | 73.8% |
| shared checkout | confirmed | confirmed |
| limit hit | session, not weekly | session, not weekly |

Differences are fully explained by window and by concurrency granularity — a 5-minute bucket
resolves a peak that hourly sampling averages away. **Neither supersedes the other.** Unique
to the first: 10 sessions launched inside a 3-minute window; two 32-hour carryover sessions;
post-compaction regrowth at 32.8% vs 3.4% baseline. Unique to the second: the rate ratios, the
2.8-hour compression, and per-request burden measured *below* baseline — the finding that
forced the second control axis.

---

## 6. Proofs

```bash
npm run jarvis:proof
```

| Suite | Assertions | Covers |
|---|---|---|
| `session-proof.mjs` | 54 | C1–C3, W1–W4, X1–X2, S1, observability, no-process-enumeration, no-kill |
| `orient-proof.mjs` | 33 | orientation contract (regression) |
| `continue-proof.mjs` | 27 | packet grammar/budget (regression) |
| `rate-proof.mjs` | 24 | R1, R2, band reachability, burst-not-averaged, caveats, missing-root = UNKNOWN |
| `loop-governance-proof.mjs` | 28 | O1, O2, H0–H2, orientation-acquires-nothing |
| `incident-scenario-proof.mjs` | 18 | 14 units / one checkout, symlink evasion, capacity queueing, ANOMALOUS, ungoverned disclosure |
| **total** | **184** | 0 failed |

Every suite runs against throwaway git repos, throwaway registries, and synthetic transcripts.
**No paid Claude session is launched by any proof.**

---

## 7. Provisional policy values (none are canon)

| Value | Setting | Basis | Change via |
|---|---|---|---|
| max active Claude lanes | **1** | founder directive; 2 was observed-normal | `concurrency.json`, `BUILDER_MAX_CLAUDE_SESSIONS`, `--override` |
| rate baseline | **131.8 req/h** | 94,872 req / 720 h, 30-day measured | `baseline_rph`, `BUILDER_RATE_BASELINE_RPH`, `--baseline` |
| bands | 2× / 4× / 8× | calibrated so 11.8× is ANOMALOUS and baseline is not | `rate_bands`, `BUILDER_RATE_BANDS` |
| stale threshold | 4 h **+ process gone** | quiet ≠ abandoned | `BUILDER_STALE_AFTER_S` |

---

## 8. Known limitations — stated, not solved

1. ⚠️ **Ungoverned lanes cannot be prevented.** The budget governs only sessions that call
   `session.mjs open`. A session started outside Builder consumes the same allowance and is
   invisible to the budget. The status surface **discloses** this (`⚠ N lane(s) are
   UNGOVERNED`) rather than reporting a false `1 / 1`. Closing this needs a harness-level hook
   — not authorized here.
2. ⚠️ **Never exercised under real multi-lane load.** All evidence is synthetic or
   single-lane. Proof ladder: `EXISTS ✓ CORRECT ✓ CONNECTED ✓ REACHABLE ✓` ·
   **`EXERCISED ✗ OBSERVABLE ✗ SUSTAINED ✗`.**
3. ⚠️ **Local counts are not quota units.** Every surface says so. The relationship between
   local request counts and Anthropic accounting remains **UNKNOWN** and is not modelled.
4. Band edges are calibrated against **one** incident. One event is a shape, not a distribution.
5. Rate reads assistant turns from transcript files; a provider-side retry invisible to the
   transcript is not counted.
6. `--handoff` releases by session id supplied by the caller; it does not verify that the
   caller *is* that session.

---

## 9. What this unit deliberately did NOT do

No automatic delegation to Kimi/Qwen/Ollama on capacity exhaustion · no model routing or
selection · no hard rate enforcement · no process killing · no OS process enumeration · no
JARVIS GUI · no Horizon IV/V work · no changes to product code, MAIA memory, or deployment.

**The traffic controller exists. It does not choose alternate roads.**
