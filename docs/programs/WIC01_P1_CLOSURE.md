# WIC01-P1 — RUNTIME / SOURCE ADJUDICATION · CLOSURE

**Program:** `MAIA-WHOLE-INTELLIGENCE-CONVERGENCE-01`
**Packet:** P1 — **adjudication and convergence-of-facts. NOT a repair packet.**
**Authorized:** 2026-08-31 (founder ruling)
**Evidence:** `docs/programs/WIC01_RUNTIME_PROBE_RESULTS.md` (probes run 2026-08-31T19:26Z)
**Runtime behavior change:** **NONE.** No application code was modified by this packet.

> P1 makes what we now know canonical. Nothing more.

---

## §1 — Frozen runtime facts

Canonical as of 2026-08-31. **Recorded without extrapolation** — every entry is either a probe return or an explicit UNKNOWN.

```text
production SHA                 fc66b477a
census custody                 MATCH  (census ran against fc66b47)

member_relational_signals      LIVE           609 rows, newest 2026-08-31 00:37Z
memory_transition_records      LIVE          3992 rows, newest 2026-08-31 14:09Z
model fallback                 CONFIGURED    Ollama qwen2.5:7b @ host.docker.internal:11434
semantic_memory_vectors        TABLE ABSENT
lattice_nodes                  TABLE ABSENT / dormant path
memoryHealth probe             UNKNOWN

between/chat traffic           UNKNOWN from this instrument
voice stream traffic           UNKNOWN from this instrument

MythicAtlas                    IN-STACK      http://mythic-atlas:8088
422                            service-contract drift

tier distribution (7d)         CORE 1935 (72.9%) · FAST 721 (27.1%) · DEEP 0
```

### Two facts that must not be misread

**Fact 9 (`memoryHealth` markers) remains UNKNOWN.** Zero markers in the probe hour is most simply explained by no member traffic after the 17:11 deploy, but the probe cannot distinguish that from broken logging. It is not recorded as zero, and it is not recorded as healthy.

**The zero endpoint rows are instrument blindness, not zero traffic.** Neither `between/chat` nor `voice/stream-conversation` emits Corpus Callosum rows at all — verified at `fc66b477a`: zero `logAgentRun` / `corpusCallosum` references in either route. Their traffic is invisible to `agent_runs` **by construction.** Any future statement that these surfaces are unused would be an inference the instrument cannot support.

---

## §2 — Store adjudications

### `semantic_memory_vectors` → **CANDIDATE FOR RETIREMENT**

```text
production table   ABSENT
readers in repo    NONE   (no SELECT anywhere)
writers in repo    ONE    (INSERT at lib/sovereign/maiaService.ts:3524)
writes             cannot succeed against a nonexistent relation
successful writes  would still have no consumer
```

**Candidate is not deletion authority.** P1 registers this disposition canonically and stops there. P1 has not removed the writer, added the table, or invented a reader.

Retirement is its own later bounded unit, and it asks one question:

> **Does any intended architectural consumer exist outside the presently bound system?**

If no — retire it. P1 does not carry that cleanup.

### `lattice_nodes` → **DORMANT / DEFERRED**

```text
production table       ABSENT
readers in repo        YES  (ConsciousnessMemoryLattice + /api/consciousness/memory/*)
live-turn writer       INTENTIONALLY UNREACHABLE
gate                   lib/sovereign/maiaService.ts:3435
                       allowLatticeWrite = memoryMode === 'longterm'
live route resolves    'continuity' for recognized members → gate closed
```

A reader exists. The live writer is intentionally unreachable under the production `continuity` memory mode. Therefore:

- **no migration owed**
- **no retirement indicated**
- **no production defect**
- **no reason to create the table** merely because the code contains a latent long-term path

Dormant intent recorded. **Leave it alone.**

---

## §3 — Priority updates

### D7 — tier inversion → **P0 PRIORITY**, **not a P1 repair**

```text
CORE   72.9%   developmentalMemory ABSENT
FAST   27.1%   full memory
DEEP    0.0%
```

Not a rare tier edge case: **the dominant production cognition tier is the one missing developmental memory.** The escalation is justified by measurement, not by argument.

**And it is explicitly not repaired here.** Adding `developmentalMemory` to CORE's old addenda list during P1 would solve the urgent symptom *through exactly the architecture this program exists to replace* — and would do it without the byte-identical witness that makes a composition change interpretable.

> **Urgency changes the order within convergence. It does not justify bypassing the architecture.**

D7 becomes the **first behavior-changing convergence packet immediately after the pass-through Conductor is proven** — packet P3a, split out below.

### D8 — DEEP consultation-only wiring → **P2 PRIORITY**

Zero DEEP-primary turns in seven days. Its malformed consultation-only memory state is still architecturally wrong, but is not presently affecting member traffic. P3b corrects it as part of canonical tier convergence. **No emergency packet.**

---

## §4 — Explicitly NOT authorized in P1

P1 did none of the following, and none is authorized by this closure:

- ❌ repair the CORE developmental-memory gap
- ❌ alter `TIER_DISPOSITION` to desired future behavior
- ❌ remove the `semantic_memory_vectors` writer
- ❌ create either missing table
- ❌ activate lattice writes
- ❌ repair MythicAtlas
- ❌ add endpoint telemetry merely to answer the traffic question
- ❌ touch `between/chat` or `voice/stream-conversation`
- ❌ begin Conductor runtime plumbing

---

## §5 — P1 acceptance

| Criterion | Status |
|---|---|
| Every probe-dependent UNKNOWN that could be settled has a canonical disposition | ✅ 9 of 10 settled |
| The two stores have their adjudications | ✅ §2 |
| D7 → P0 and D8 → P2 priorities updated | ✅ §3, and in the packet plan |
| Fact 9 remains explicitly UNKNOWN | ✅ §1 |
| Endpoint traffic remains explicitly unmeasured | ✅ §1, with the reason it is unmeasurable by this instrument |
| No runtime behavior changes | ✅ zero application code modified |
| Contract tests green | ✅ 11/11 |
| Typecheck green | ✅ 231 errors vs 239 baseline — no regressions |

**P1 CLOSED.**

---

## §6 — What comes next

```text
P0   typed evidence contract              CLOSED   (1d09c42)
 ↓
P1   runtime / source adjudication        CLOSED   (this document)
 ↓
P2   pass-through Conductor               ← NEXT AUTHORIZATION
     byte-identical composition proof
 ↓
P3a  DEVELOPMENTAL MEMORY CONVERGENCE     P0 PRIORITY · CORE first
 ↓
P3b  remaining tier convergence           (includes D8)
 ↓
P4+  embodiment / route adoption / restraint
```

**P2 remains held until this closure lands.** After P1, the next authorization is the pass-through Conductor — **not an emergency addenda patch, even with D7 now at P0.**
