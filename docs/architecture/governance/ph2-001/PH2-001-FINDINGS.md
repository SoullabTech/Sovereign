# PH2-001 — VERIFIED FINDINGS

Findings established during PH2-001 execution. **Each is a statement of what exists. None decides what
should exist.** Items marked `FOR WEEKLY REVIEW` carry founder-approved wording and are deliberate
deferrals, not backlog.

Implementation base at time of writing: `feature/ph2-001-implementation-base`.
Sealed Phase-1 evidence: `0241d896f73e5a5f820eb16e59bd7e5beeffd99a` — unaltered by anything here.

---

## F-001 · Memory-orchestrator influence is FAST-only — `FOR WEEKLY REVIEW`

**Founder-approved wording, 2026-08-13:**

> **Memory-orchestrator influence is currently FAST-only (~27% of observed turns); CORE/DEEP retain other
> continuity mechanisms. Whether orchestrator influence should become tier-independent is a deliberate
> future product/architecture decision, not a verification repair.**

**Evidence.** `memoryInfluenceAddendum` and `forwardReadinessAddendum` are read only at
`lib/sovereign/maiaService.ts:1199` and `:1205`, inside `fastPathResponse`, and interpolated only into the
FAST template at `:1297`. They have **no field on `MaiaContext`** (`lib/sovereign/maiaVoice.ts`), are
**absent from `ADDENDA_SPECS`**, and are **not assembled** by the CORE builder (`:1571ff`) or the DEEP
builder (`:2200ff`). Prevalence from sealed A0: **CORE 72.8% / FAST 27.2% / DEEP 0%.**

**Scope limit — deliberately narrow.** This does **not** say CORE lacks continuity.
`conversationalRecallAddendum` is wired on both paths, and A1 established that *prior conversation history
was appended into the Turn-2 CORE prompt before Claude generation*. The claim is only that **these two
blocks are FAST-only.**

**Three clean truths to carry forward:**

1. CORE retains continuity through conversation history and `conversationalRecallAddendum`.
2. FAST additionally receives `memoryInfluenceAddendum` and `forwardReadinessAddendum`.
3. **The architecture therefore gives different memory influence across tiers**, and whether that is
   intended has not been decided.

**Not repaired.** Wiring these into CORE/DEEP would change behaviour on ~73% of turns. Founder ruling:
that is too consequential to absorb into a verification task.

---

## F-002 · The addendum wiring surface is five sites, not two — `ACCEPTANCE INVARIANT`

Introducing one addendum requires edits at **five** places. Missing #5 silently skips ~27% of turns;
missing #1–4 silently skips ~73%.

| # | Site |
|---|---|
| 1 | `MaiaContext` type — `lib/sovereign/maiaVoice.ts:~78` |
| 2 | `ADDENDA_SPECS` — `lib/sovereign/maiaVoice.ts:~413` |
| 3 | CORE context assembly — `lib/sovereign/maiaService.ts:~1571` |
| 4 | DEEP context assembly — `lib/sovereign/maiaService.ts:~2200` |
| 5 | FAST inline template — `lib/sovereign/maiaService.ts:1297` |

Set comparison at the time of writing: **17 addenda on both paths · 7 CORE/DEEP-only · 6 FAST-only.**

**Founder-ruled acceptance invariant for Item 4:**

> **Any server-authored relational addendum introduced for member correction/yield must be proven to
> arrive on FAST, CORE, and DEEP — or explicitly declare which tiers it does not serve.**
>
> **No "present in meta" evidence. No inventory proxy. Actual assembly-path proof.**

---

## F-003 · Context-inventory misreported composition on CORE/DEEP — `REPAIRED`

The inventory block's own contract is composition — *"reports only context that actually reaches the
prompt"* — but `memoryOrchestrator` and `forwardReadiness` were computed as `!!m.<field>` from `meta`,
tier-independently, in `getMaiaResponse` (`:2379`). On CORE/DEEP they read **true** where arrival is
structurally impossible, and `evidenceProviders` then listed `memoryOrchestrator` as an evidence provider
for that turn.

**This is `availability ≠ composition` instrumented as though it were composition** — the same hazard class
recorded across the sealed Phase-1 work.

**Repaired (PBR-002):** the two flags are tier-scoped, and suppressed items are surfaced under a new
`availableButNotComposed` field so the gap stays visible rather than becoming a silent false.
**No behavioural change to which addenda reach which tier.**

---

## F-004 · Withdrawn candidate — astrology addendum naming

`astrologyAddendum` (route/meta) vs `astrologicalContextAddendum` (`MaiaContext` / `ADDENDA_SPECS`) appeared
to be a wiring gap of the F-001 kind. **It is not.** The mapping is deliberate and present at
`maiaService.ts:1571` (CORE) and `:2200` (DEEP).

**Recorded because it was raised as a candidate and then disproven by checking.** A withdrawn finding is
part of the record.

---

## F-005 · Untraced, not cleared — `cognitiveProfile` / `fieldWorkSafe` / `fieldRouting` on the dormant route

`app/api/sovereign/app/maia/route.ts` places these before its `...meta` spread, the same shape as PBR-001.
It was classified `NOT_SAME_DEFECT` because **no prompt-authoritative field crosses the collision there** —
which is the defect definition that was set. Whether client-overridable `fieldWorkSafe` matters downstream
was **not traced**, and the route is dormant.

> **Untraced is not cleared.** Recorded so the distinction survives.
