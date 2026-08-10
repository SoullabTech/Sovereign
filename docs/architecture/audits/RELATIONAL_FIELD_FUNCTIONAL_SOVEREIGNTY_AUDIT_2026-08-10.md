# Relational Field — Functional Sovereignty Audit

**Run:** 2026-08-10, read-only. No mutation, no instrumentation, no fixes.
**Prompt:** `docs/specs/RELATIONAL_FIELD_FUNCTIONAL_SOVEREIGNTY_AUDIT_PROMPT_2026-08-10.md`
**Production evidence:** `maia-postgres` on minisforum, SELECT only.

## CLASSIFICATION: **D — ARCHIVAL ONLY**

Relationship data is stored and displayed. It carries **no correction
authority, no currentness authority, and no withdrawal authority**, and it
**does not reach MAIA's prompt at all** on the live conversation route.

Plus one **first-order containment finding** (§0), elevated per instruction.

---

> ## ✅ RU-0 CORRECTED IN CODE — 2026-08-10 (NOT YET DEPLOYED)
>
> The §0 containment gap below is **fixed on branch `feature/labtools-redesign`**;
> production still runs the unguarded code until a deploy is authorized.
>
> - **Live call site guarded** — `app/api/sovereign/app/maia/route.ts:364` now reads
>   `… && !isSanctuary`, matching its sibling.
> - **Defence in depth** — `observeRelationalContent` takes a **required**
>   `RelationalObservationPosture` and refuses outright when `isSanctuary`.
>   Required, not optional: omission is now a **compile error**, so containment no
>   longer depends on a caller remembering a conditional. Refusal is silent by
>   design — a per-turn log would leak the fact and cadence of sanctuary use.
> - **Retired route fail-safe** — `app/api/oracle/conversation/route.ts` (410) has no
>   sanctuary gate at all, which is its stated retirement reason, so it now passes
>   `{ isSanctuary: true }`: if the 410 is ever lifted without a gate, observation
>   stays OFF rather than silently resuming.
> - **Regression test** — `app/api/sovereign/app/maia/__tests__/relationalSanctuaryGuard.test.ts`
>   asserts by **brace-depth containment** (not textual proximity) that every
>   relational write in every live MAIA route sits inside a `!isSanctuary` block.
>   **Verified to fail before the fix** — naming `route.ts:355` and `route.ts:370` —
>   while both `list/route.ts` cases passed, independently confirming the
>   sibling-consistency asymmetry the audit described. **7/7 after.**
> - **Gates** — 72/72 across the relational + sanctuary suites; `npm run typecheck`
>   no regressions (237 vs 239 baseline).
>
> ⛔ **RU-0 changed containment only.** No read path, provenance, correction,
> currentness, withdrawal, or continuity behavior was altered; no schema or
> migration was touched. §1–§4 and Classification **D** stand unchanged, and the
> §0b provenance correction is unaffected.
>
> ⚠️ **Existing rows of unknown posture were NOT touched.** Nothing was purged,
> backfilled, or relabeled. Whether anything should be done about relational rows
> written before this fix — including the 6 entries + 4 signals in the 2026-06-14
> sanctuary window, whose attribution remains **UNPROVEN** — is a founder decision
> and is not resolved here.

---

## §0. FIRST-ORDER — Sanctuary containment gap on the live route

**The guard exists on the wrong route.**

| Route | Relational observation guarded? | agent_runs, 30d |
|---|---|---|
| `app/api/sovereign/app/maia/route.ts` | ⛔ **NO GUARD** (line 356) | **3388** |
| `app/api/sovereign/app/maia/list/route.ts` | ✅ `!isSanctuary` (line 1428) | 13 |

`list/route.ts:1426` carries the explicit intent —
*"a sanctuary turn must never feed relational observation or signal
persistence — its content must not become available to Relationship Field
retrieval."* The sibling route computes `isSanctuary` at **line 220** and uses
it at **line 223**, then calls `observeRelationalContent(...)` and
`persistDetectedSignal(...)` at **line 356 without it**.

`observeRelationalContent` (`lib/consciousness/relationalObserver.ts`) is not a
logger. It **auto-creates** a `member_relationships` row named
*"Unresolved Relational Field"*, then writes `relationship_entries` whose
`content` is **MAIA's own summary of the member's relational material**, plus
`relationship_entry_patterns`. It has **no internal Sanctuary guard** — grep for
`sanctuary` in that file returns nothing. Defence-in-depth is absent: the only
guard is at one call site, and the live call site does not have it.

**Structural corroboration.** `posture_at_creation` exists on
`conversation_turns`, `member_memory_atoms`, `episodic_memories`,
`member_theme_signals`, `agent_runs`, `integration_passes`. It does **not**
exist on `member_relationships`, `relationship_entries`, or
`relationship_field_state`. The relational tables sit **outside the Sanctuary
provenance regime entirely** — there is no column in which a sanctuary-origin
relational row could even be recorded, and therefore no way to find or purge
one after the fact.

**Realized or latent — the honest boundary.**
Sanctuary is exercised in production but rarely: `runtime_events.is_sanctuary`
= 5 (all 2026-06-14, 12:44–12:58Z), `usage_events.is_sanctuary` = 1.
`conversation_turns.posture_at_creation` has **zero** `sanctuary` rows, so the
*turn*-persistence guard is working.

Within the 34-minute window containing all five sanctuary events
(12:34–13:08Z), production holds **6 `relationship_entries` and 4
`member_relational_signals`** — and that day had **7 entries in total**, 6 of
them inside that window.

⚠️ **UNPROVEN — stopped at the evidence boundary.** `runtime_events.member_id_prefix`
is NULL on all five sanctuary rows, so the entries cannot be attributed to the
sanctuary session rather than to a different member conversing concurrently.
Closing this would require running a sanctuary turn (mutation) or adding
instrumentation — **both forbidden by the authorization, and neither was done.**

**This is first-order regardless of whether it has already fired.** Sanctuary is
canon-declared an *absolute boundary*. A boundary whose only enforcement sits on
a route carrying 0.4% of traffic is not a boundary. Do not treat the
"UNPROVEN" label as mitigation of the gap — it qualifies only the question of
whether leakage has *already occurred*.

---

## §0b. RECORD CORRECTION to the placement report (2026-08-10, same day)

The placement report called the Relational Field *"genuinely live and
member-used"* on distribution evidence (43 relationships / 20+ members / 130
entries in 30 days). **The distribution was real; the characterization was
wrong.** Provenance evidence:

| Fact | Production |
|---|---|
| `member_relationships` that are the auto-created catch-all | **29 of 43** |
| `relationship_entries` inside that catch-all | **1139 of 1157** |
| entries with `confidence` set (⇒ observer-inferred) | **1139** |
| entries with NULL `confidence` (candidate member-declared) | **18** |
| entries in the last 30 days: inferred / declared | **129 / 0** |

So ~98% of the corpus is **MAIA INFERS**, not **MEMBER DECLARES**, and two
thirds of the relationship rows were created by the system, not by a person.
Correct characterization: **member-*triggered*, system-*authored*.** Members
generated the conversational input; the system authored every record.

I verified distribution and did not verify provenance. That is the same class
of error the 2026-08-09 corrections were written to prevent, one layer in.

---

## §1. CORRECTION — *change understanding without erasing legitimate history?*

**EXISTS → partially · LIVE → yes · REACHES MAIA → n/a · CHANGES BEHAVIOR → no**

| Capability | State |
|---|---|
| edit relationship `name` / `bond_type` / `note` | ✅ `PATCH /api/relationships/[id]` |
| edit or retract an **entry** | ⛔ no route — `entries/route.ts` exposes GET + POST only |
| mark an entry superseded | ⛔ no column (`superseded_at` / `corrected_by` absent) |
| distinguish correction from new statement | ⛔ no mechanism |
| provenance column on entries | ⛔ **none** — `confidence IS NOT NULL` is the only inference tell, and it is incidental, not a provenance contract |
| remove a relationship | ⚠️ `DELETE` → `archived_at` (whole relationship, all-or-nothing) |

**The conjunction fails in the worst direction.** The member can edit the
*label* on a relationship but cannot touch the **1139 MAIA-authored entries**
beneath it. The only available remedy is archiving the entire relationship —
which erases legitimate history to remove one wrong inference. *"That's not what
I meant about her"* has **no representable form**.

**First broken seam:** `relationship_entries` has no provenance or supersession
columns — `(id, relationship_id, member_id, kind, felt_signals, free_text,
maia_reflection, pattern_hint, field_tone_snapshot, suggested_movement, content,
confidence, created_at)`.

---

## §2. CURRENTNESS — *can old truth lose present authority?*

**EXISTS → partially (one table) · LIVE → write-side only · REACHES MAIA → no**

The one genuine currentness mechanism in the system is
`relationship_entry_patterns.expires_at`, set at write time
(`relationalObserver.ts:187`, `DEFAULT_PATTERN_TTL_DAYS`). The design intent is
explicit and correct — `patternDetection.ts:14`: *"relational dynamics are
stateful, not fixed traits."*

But it is **advisory, not enforced**: `patternDetection.ts:286` says *"readers
should filter on `expires_at > NOW()`"*. Enforcement is delegated to readers,
and (per §4) the only reader is a dead route. Production holds 34 pattern rows.

`relationship_entries` has **no** validity window, supersession, or authority
concept — every entry is equally current forever.
`relationship_field_state` (10 rows) **accumulates alongside** entries; it does
not supersede them.

**First broken seam:** currentness is expressed at write time in one side table
and enforced nowhere.

---

## §3. WITHDRAWAL — *"don't use that anymore" → future behavior changes?*

**EXISTS → NO.** Nothing further to trace.

No withdrawal column on any relational table; no route accepting a withdrawal
gesture; no consumer reading such a flag. This is not a wiring gap — the
capability is **wholly absent**.

Note the asymmetry with the rest of the system: the **atoms** lane has
`return_preference` and the **Daily Anchor** lane has `surface_preference`,
both member-authored consent gates. The Relational Field — which holds ~98%
system-authored inference, the material most in need of a withdrawal gesture —
has **no equivalent**.

**First broken seam:** schema. There is no column in which withdrawal could be
recorded.

---

## §4. CONTINUITY — *distinguishable from archival recall?*

**It is neither. The read path is severed: relational memory is WRITE-ONLY.**

The live route `app/api/sovereign/app/maia/route.ts` imports exactly three
relational symbols — **all writes**:

```
observeRelationalContent   (write)
detectRelationalSignal     (write)
persistDetectedSignal      (write)
```

The read path — `getMemberActiveRelationalContext` +
`buildRelationalContextBlock` — has **exactly one caller**:
`app/api/oracle/conversation/route.ts:2402`. That route returns **HTTP 410
Gone**: *"Legacy route retired pending Sanctuary-governed persistence (S2,
2026-07-17)"*.

**No `member_relationships` / `relationship_entries` data reaches any prompt.**

⚠️ **Do not conflate two different objects.** `loadRelationshipEssence`
(`MemberLiveContext.ts:394`) *is* live — but it reads `relationship_essences`,
the **MAIA↔member dyad**, a different table from the member's relationships
with **other people**. Relational Field continuity cannot be claimed from it.

Against the prompt's three-way distinction: this is **not** mutually
established relational knowing, **not** relational continuity, and **not even
archival recall in conversation** — the archive exists and is visible at
`/relationships`, but MAIA cannot see it. Accumulation without retrieval.

**First broken seam:** the sole consumer of the relational read path is a 410
route. Same shape as the M0 spiral-state severance — that was a severed
*write*; this is a severed *read*.

---

## Summary

| Q | Capability | EXISTS | LIVE | REACHES MAIA | CHANGES BEHAVIOR |
|---|---|---|---|---|---|
| 1 | Correction | partial (labels only) | ✅ | n/a | ⛔ |
| 2 | Currentness | partial (patterns TTL) | write-side | ⛔ | ⛔ |
| 3 | Withdrawal | ⛔ **absent** | — | — | ⛔ |
| 4 | Continuity | read path exists | ⛔ 410 route | ⛔ | ⛔ |

**Acceptance criterion, answered directly.** *"MAIA remembers something about
this relationship"* is not merely insufficient here — **it is not true.** MAIA
writes a great deal about the member's relationships and reads back none of it.
What is stored has **no authority now**, because it has no authority at all.

---

## Bounded correction units (proposed, NOT executed)

- **RU-0 — Sanctuary containment** *(first-order; smallest, most urgent)*.
  Bring the live route's call site under the same `!isSanctuary` guard as its
  sibling, and add an internal guard inside `observeRelationalContent` so the
  boundary does not depend on a single call site. Consider `posture_at_creation`
  on relational tables so origin is *recordable*. ⚠️ Any decision about existing
  rows of unknown posture is a **founder** call — this audit neither purges nor
  recommends purging.
- **RU-1 — Provenance.** A `source` / `generated_by` column on
  `relationship_entries` distinguishing MEMBER DECLARES · MAIA INFERS ·
  RELATIONSHIP ESTABLISHED · PRACTITIONER OBSERVES. **Prerequisite for RU-2/3** —
  correction and withdrawal are meaningless while 98% of the corpus is
  provenance-blind.
- **RU-2 — Correction without erasure.** Entry-level supersession
  (`superseded_at` + `superseded_by`) with retention of the superseded row.
- **RU-3 — Withdrawal.** A member gesture that any future reader must honor,
  modeled on `return_preference` / `surface_preference`.
- **RU-4 — Read seam.** Decide whether relational context should reach the live
  prompt at all. ⛔ **Not a reconnection task.** Re-attaching a severed read of a
  98%-inferred, provenance-blind, non-withdrawable corpus would ship the wrong
  thing quickly. RU-1/2/3 gate this. **Founder decision, not an engineering fix.**

**STOP.** No implementation performed.
