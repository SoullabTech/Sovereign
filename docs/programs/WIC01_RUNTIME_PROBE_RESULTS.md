# WIC01-RUNTIME-BOUNDARY-PROBES — results

**Program:** `MAIA-WHOLE-INTELLIGENCE-CONVERGENCE-01`
**Lane mandate:** factual only. **No fixes, migrations, registry changes, or tier corrections from this lane.**
**Status:** ✅ **RUN 2026-08-31T19:26Z** from Kelly's Mac Studio → `soullab@minisforum`

---

## Headline: custody CONFIRMED

```
production GIT_COMMIT : fc66b477a
census SHA            : fc66b47
                        ▲ MATCH
```

**The census describes code that members are actually running.** The Phase 0 custody gap is closed and no finding is invalidated. The charter's `INVALIDATED → rebind` transition is not triggered.

Deploy lane verified (`DEPLOY_LANE=deploy-lane`), `APP_VERSION=1.2.0`, container created `2026-08-31T17:11:32Z` — ~2h 15m before the probe.

---

## Results

| # | Fact | Result | Verdict |
|---|---|---|---|
| 1 | Production `GIT_COMMIT` | `fc66b477a` — **matches census SHA** | ✅ custody confirmed |
| 2 | `DEPLOY_LANE` | `deploy-lane` | ✅ came through the lock |
| 3 | Model routing / fallback | `MAIA_TEXT_PROVIDER` **unset** → code default `anthropic`; `OLLAMA_BASE_URL=http://host.docker.internal:11434`, `OLLAMA_MODEL=qwen2.5:7b`; `MYTHIC_ATLAS_URL=http://mythic-atlas:8088/api/mythic-atlas` | ✅ fallback **is** configured — census row 30 resolved |
| 4 | Tier distribution (7d) | `CORE 1935` · `FAST 721` · **`DEEP 0`** — all on `sovereign/app/maia/list` | ⚠️ **see §Escalation** |
| 5 | `member_relational_signals` | 609 rows, newest `2026-08-31 00:37:18Z` | ✅ writes land — D16 partly resolved |
| 6 | `memory_transition_records` | table exists · 3992 rows · newest `2026-08-31 14:09:08Z` | ✅ LIVE — census row 23 resolved |
| 7 | `semantic_memory_vectors` in DB | **absent** (`to_regclass` → null) | ⛔ confirmed missing |
| 8 | `lattice_nodes` in DB | **absent** (`to_regclass` → null) | ⛔ confirmed missing |
| 9 | `memoryHealth` markers (1h) | `0` and `0` | ❓ **UNKNOWN** — see below |
| 10 | Corpus Callosum (24h) | `CORE 275` · `FAST 243` · **no DEEP** | ✅ consistent with fact 4 |

---

## Escalation — the tier inversion is lived, not theoretical

```text
CORE  1935 turns   72.9%   ← developmental memory ABSENT here
FAST   721 turns   27.1%   ← the only tier with full memory
DEEP     0 turns    0.0%
```

**MAIA loses developmental memory, forward-readiness, knowledge-field and youth-support on roughly three out of every four production turns.**

This changes the priority of two findings in opposite directions:

- **D7 ESCALATES to P0.** It was ranked P1 as a correctness defect. It is not: CORE is the dominant tier, and CORE is exactly where `unratifiedTierGaps()` reports four sources missing. This is the single highest member-facing cost the census found.
- **D8 DE-ESCALATES to P2.** DEEP-primary's consultation-lane-only wiring is still architecturally incorrect, but **DEEP served zero turns in seven days.** Real defect, no lived cost today. It must be fixed by P3 for correctness — it does not compete for priority with D7.

The ruling's phrase — *the deeper the tier, the less memory MAIA has* — now has a measured cost attached, and the cost lands almost entirely on CORE rather than DEEP.

---

## Fact 9 stays UNKNOWN (and why that is the honest answer)

Zero `memoryHealth` / layer markers in the probe hour is **not** evidence that logging is broken. Corroborating timeline:

```
14:09  newest memory_transition_records row
17:11  container recreated (deploy)
19:26  probe — 0 markers in the preceding hour
```

No transition records since the 17:11 deploy either. The simplest reading is **no member traffic in that window**, not broken instrumentation — but the probe cannot distinguish the two. **Recorded as UNKNOWN.**

Follow-up probe, to be run during known traffic:
```bash
ssh soullab@minisforum 'docker logs maia-sovereign --since 24h 2>&1 \
  | grep -cE "memoryHealth|conversational-block|atoms loaded"'
```

## What the zero rows for `between/chat` do NOT prove

Fact 4 returned only `sovereign/app/maia/list`. That is **not** evidence that `between/chat` receives no traffic. Verified in code at `fc66b47`:

```
app/api/between/chat/route.ts             logAgentRun / corpusCallosum refs: 0
app/api/voice/stream-conversation/route.ts                                 : 0
```

Neither divergent cognition path emits Corpus Callosum rows at all — consistent with the census finding that they are separate implementations. **Their traffic is invisible to this probe by construction.** Measuring it needs Caddy access logs or route-level instrumentation, which is a separate factual question and does not block P1.

---

## Two census corrections

**MythicAtlas (census row 18) was mischaracterized.** The census read the code default `http://localhost:8000` and described an *"external Python service outside the Docker stack."* Production sets `MYTHIC_ATLAS_URL=http://mythic-atlas:8088/api/mythic-atlas` — an **in-network Docker service**. The witnessed 422 is therefore contract drift between two services that can reach each other, not a missing service. Severity unchanged (P2); characterization corrected.

**Model fallback (census row 30) resolved, with a caveat to probe.** A fallback *is* configured. Two notes, neither asserted as a defect:
- `OLLAMA_MODEL=qwen2.5:7b`. CLAUDE.md describes the fallback as *"Local Ollama (DeepSeek models)"* — documentation drift worth reconciling.
- `host.docker.internal` resolves automatically under Docker Desktop but requires an explicit `host-gateway` mapping under Docker Engine on Linux, which minisforum runs. **Whether it resolves from inside the container is unprobed.** One command settles it: `docker exec maia-sovereign getent hosts host.docker.internal`.

---

## Raw output

```text
WIC01 RUNTIME BOUNDARY PROBES — 2026-08-31T19:26:27Z
host: soullab@minisforum

═══ 1. PRODUCTION SHA + DEPLOY LANE ═══
fc66b477a
deploy-lane
1.2.0
created=2026-08-31T17:11:32.819109928Z image=sha256:12900db8debf175bf665a94a44cf635862110095d0e241f7a5d0775e803e39bd

═══ 2. MODEL ROUTING / FALLBACK CONFIG ═══
http://host.docker.internal:11434
qwen2.5:7b
http://mythic-atlas:8088/api/mythic-atlas

═══ 3. TIER DISTRIBUTION (7d) ═══
/api/sovereign/app/maia/list | CORE | 1935
/api/sovereign/app/maia/list | FAST | 721

═══ 4. RELATIONAL SIGNAL WRITE LIVENESS ═══
609 | 2026-08-31 00:37:18.24875+00

═══ 5. MEMORY TRANSITION RECORDS ═══
memory_transition_records
3992 | 2026-08-31 14:09:08.766556+00

═══ 6. UNMIGRATED STORES — EXISTENCE CHECK ONLY ═══
semantic_memory_vectors |
lattice_nodes |

═══ 7. MEMORY HEALTH + LAYER MARKERS (1h) ═══
0
0

═══ 8. CORPUS CALLOSUM EMISSION (24h) ═══
CORE | 275
FAST | 243
```

*(`printenv` omits unset variables: three values returned for five requested, so `MAIA_TEXT_PROVIDER` and `MAIA_INFERENCE_MODE` are unset.)*

---

## P1 adjudication — the two stores

Applying the ladder from the Phase 8 packet plan. **These are adjudications, not authorizations.** No migration and no deletion is authorized here.

### `semantic_memory_vectors` → **CANDIDATE for retirement**

```text
table in production DB : ABSENT
readers in code        : NONE  (no SELECT anywhere in the repo)
writers in code        : ONE   (INSERT at lib/sovereign/maiaService.ts:3524)
```

Ladder position: **writer + no consumer and no architectural purpose.**

Every INSERT has been failing against a nonexistent relation for as long as the code has run, and nothing would read the rows even if it succeeded. This is the ladder's retirement-candidate branch — **a candidate, not a decision.** The remaining question is intent, which the probe cannot answer: was a reader planned and never built? That belongs to a ruling.

**Do not create the table to make the writer work.** The writer has no consumer.

### `lattice_nodes` → **explicitly dormant / deferred**

```text
table in production DB : ABSENT
readers in code        : YES (ConsciousnessMemoryLattice + /api/consciousness/memory/* routes)
writer on live turn    : GATED OFF
```

Materially different from the first, and the difference is decisive. The live-turn write is gated at `lib/sovereign/maiaService.ts:3435`:

```ts
const allowLatticeWrite = memoryMode === 'longterm';
```

The live route resolves recognized members to `'continuity'`, never `'longterm'` — so **the lattice write is not attempted on the member turn at all.** The absent table costs the live turn nothing today.

Ladder position: **writer + intended future reader** — real readers exist, the substrate does not, and a hard gate holds the writer closed. Deferred with the intent named. Retirement is *not* indicated; neither is a migration.

### Both — the discipline that holds

A table absent from the DB does not authorize creating it. A writer with no reader does not authorize deleting it. **Both remain rulings, and neither is reachable from the probe alone.**

---

## Program state after this lane

```text
P0        EVIDENCE CONTRACT      CLOSED (1d09c42) — contract only, runtime unmigrated
§6 probes RUNTIME FACTS          CLOSED — custody confirmed, 9 of 10 facts settled
                                 fact 9 UNKNOWN, follow-up probe named
P1        TRUTH INSTRUMENT       ADJUDICATED — awaiting authorization to execute
P2+                              HELD
```

**Revised priority into P1**, on evidence rather than inference:

1. **D1/D2 health truthfulness** — unchanged as first. The instrument still cannot report a failed dependency.
2. **D7 tier inversion — ESCALATED to P0**, now carrying a measured cost of 73% of turns.
3. D9 RLM relative URL — unchanged, one line, deterministic.
4. **D8 DEEP wiring — DE-ESCALATED to P2** on zero measured DEEP traffic.
5. D10/D11 — adjudicated above; no action authorized.
