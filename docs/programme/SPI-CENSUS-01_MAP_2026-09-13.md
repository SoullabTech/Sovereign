# SPI-CENSUS-01 — CENSUS MAP — RUN 2026-09-13

**Lane:** `SPI-CENSUS-01` · **Authorized:** founder ruling 2026-09-13 (census run).
**Instrument:** `SPI-CENSUS-01_INSTRUMENT_2026-09-13.md` · **Charter:** `…_CHARTER_2026-09-13.md`.
**Status:** ⛔ **CENSUS RUN. NOTHING REPAIRED, DESIGNED, CONSTITUTED OR MERGED.**

---

## 0 · Scope declaration

```text
PRIMARY TREE      origin/clean-main-no-secrets @ e1c6f527b   (working tree)
REFS INSPECTED    origin/claude/jop-04-census         (read-only, ls-tree)
  read-only       origin/claude/bold-bohr-pmtynu      (read-only, ls-tree)
                  origin/chore/jop-03-mandate-custody (read-only, ls-tree)
NOT INSPECTED     the other ~1,355 remote refs
METHOD            path inspection, symbol search, route/table reading
```

⛔ **`ABSENT` below means "not found in the scope named on that row."**

## 1 · ⚠️ The census's evidence ceiling — read before any row

**No row in this map is classified `LIVE` by this run.** `LIVE` requires production runtime evidence
at the Cat 6 standard, and **this session cannot reach production.** Where the Anchor already records
a production witness from a prior session, that is cited as **`LIVE (Anchor record, prior session —
not re-witnessed here)`** and is a *weaker* statement than a witness of our own.

This is not a limitation to apologise for. It is the difference between *what exists in the tree* and
*what runs for a member*, which is the whole point of the Anchor's rule.

## 2 · ⚠️ Self-correction — candidate C3 was wrong

My first-pass candidate said *member-wide export was not found in scope.* **It exists.**

```text
app/api/members/export-data/route.ts      (139 lines)
app/api/premium-storage/export/route.ts
```

The miss was a **too-narrow search term** — I grepped `exportMember|memberExport` and the route is
`export-data`. ⭐ **That is candidate C5's failure mode reproduced inside my own candidate list, one
level up**: a scoped absence read as an absence. It is corrected here rather than quietly fixed,
and it is the reason §0 exists.

The corrected finding is more useful than either the wrong one or a bare "it exists" — see D11.

---

## 3 · The thirteen dimensions

### D1 · Personal corpus ingestion — **PARTIAL**
**Object:** `lib/manuscript/ingest/` (`parseUpload` · `segment` · `titleSuggestion`), `lib/manuscript/source/`
(`arrivals` · `custody` · `omission`) · **Ref:** base · **Evidence:** path + module inspection.
**Gap (question):** ingestion is manuscript-shaped. What is the path for journals, transcripts,
recordings and correspondence that are *not* a Work?

### D2 · Persistent memory — **PARTIAL, and internally split**
**Object:** `lib/memory/` (14+ modules), `lib/anamnesis/` (7), `lib/consciousness/memory/` (4);
23 memory/atom/episode migrations · **Ref:** base · **Evidence:** inspection; Anchor records atoms
loader + `memoryHealth.semantic` as **Cat 6 (prior session)**.
⚠️ **Geometry, not an average:** several systems coexist at different maturities — Cat 6 live atoms
alongside Cat 3 built-but-uncalled substrate (`EpisodicMemoryService`, `CoherenceFieldService`) and
Cat 4 dormant services, per the Anchor's own typology.
**Gap:** which of these is *the* memory of record for a person, as opposed to one of several stores?

### D3 · Provenance — **PARTIAL, two unrelated systems**
**Object:** `lib/manuscript/development/` (`evidenceRef` · `readState` · `bind` · `capture` ·
`resolve`) — typed, frozen, digest-verified; **and** `lib/ai/structured/` provenance on model output.
**Ref:** base · **Evidence:** inspection.
⚠️ **These are different objects.** One tracks evidence about a *Work*; the other tracks provenance of
a *generation*. **Neither is a provenance layer over "what we know about a person."**
**Gap:** the strongest provenance machinery in the organism is not pointed at the human model.

### D4 · Inferred human model — **PARTIAL**
**Object:** `lib/consciousness/spiral/SpiralStateService`, `ConsciousnessProfile`,
`QualiaMeasurementEngine`, `lib/circles/fieldPulseService` (`affinity_score`, `evidence_reason`,
`created_by='system'`) · **Ref:** base · **Evidence:** inspection.
**Gap:** inference demonstrably exists. Whether the member is *told* which of it is inferred is D13.

### D5 · Confirmation / correction / supersession — ⚠️ **SPLIT: built path diverges from designed successor**
**Object:** `lib/consciousness/interpretiveLedger.ts` — on lineage it runs
`UPDATE interpretive_ledger SET status = 'superseded' WHERE id = $1`, **mutating the parent**.
**Ref:** base · **Evidence:** source read.
⛔ **The designed successor says the opposite.** `docs/architecture/TEMPORAL_MEMORY_DIRECTION_2026-09-06.md`
specifies succession *carried by the successor* via `supersedes`, with `superseded_by` **derived,
never stored**. The built ledger stores it and rewrites the parent row.
⛔ **No supersession implementation exists in `lib/memory/` or `lib/anamnesis/` at all.**
**State recorded as geometry:** one **built** path (ledger, divergent) · one **DESIGNED** successor
(Temporal Memory direction, unauthored spec) · **ABSENT** in the memory modules themselves.
⛔ This census does not adjudicate which is correct. It records that two answers exist.

### D6 · Relational intelligence — **UNDECIDED**
**Object:** prompt-level instruction only — `lib/maia/noteModeVoice.ts`,
`lib/maia/prompts/participatoryRealityPrompt.ts`, `lib/maia/field-lab/centerOfInquiry.ts`;
`lib/maia/prompts/memoryCanonGuard` scrubs false amnesia claims · **Ref:** base.
**Evidence:** inspection. **No structural mechanism located** that distinguishes *"you told me"* from
*"I inferred this"* in what reaches the member.
**Gap:** is the distinction a prompt convention or an enforced property? Unsettled either way here.

### D7 · Practitioner knowledge — **PARTIAL**
**Object:** `lib/practitioner/` (`auth` · `clientSubscription` · `multiTenantMiddleware` ·
`memberClient` · `practitionerService` · `integrations`) — 47 files · **Ref:** base.
**Evidence:** inspection. **Access and tenancy exist. A retrievable teachings corpus was not found.**
**Gap:** *"what does Kelly teach about projection?"* has infrastructure around it and no body of work
behind it — in this scope.

### D8 · Creative generation — **PARTIAL**
**Object:** `app/writers-studio/` + `lib/manuscript/` (215 files); WS2 lanes active in the Anchor.
**Ref:** base · **Evidence:** inspection + Anchor lane records.
**Gap:** authorship boundary is the live question there already; nothing to add from here.

### D9 · Representation / impersonation boundary — 🔴 **ABSENT (canon) · UNDECIDED (enforcement)**
**Object:** **no canon document** named for representation or impersonation; `impersonat*` appears in
one canon file incidentally. Prompt-level only: `MAIA_RUNTIME_PROMPT.ts`, `cringe-filter.ts`.
A refusal mechanism exists — `tests/constitutional/refusal-registry/` — but **no representation
refusal was located in it.** **Ref:** base · **Evidence:** inspection + `docs/canon/` listing.
⛔ **The intended distinction from every "model-of-me" system is the dimension with the least written
custody and no located enforcement.** The stance is real in the Anchor's vows and the Invariants; it
is **asserted, not constituted, and not asserted as a refusal the system can fail.**
⛔ **This census does not write that canon.** Charter §2.

### D10 · Governed external action — **PARTIAL, off-base**
**Object:** JOP programme — `origin/claude/jop-04-census` (**30 matching paths**),
`origin/chore/jop-03-mandate-custody` (9); bounded-cognition boundary modules on
`origin/claude/bold-bohr-pmtynu` (**20**), including `lib/boundedCognition/{permission,currency,
executionAuthorization,executionState}.ts`.
**Ref:** three non-base refs, read-only · **Evidence:** `git ls-tree` path inspection only — ⛔ **no
source read, no state claimed.**
⭐ **On base alone this dimension reads `ABSENT`, and that would be badly wrong.** Candidate C5
confirmed at full strength.

### D11 · Export / member ownership — **PARTIAL, and narrow**
**Object:** `app/api/members/export-data/route.ts` · **Ref:** base · **Evidence:** route read.
**It exports from:** `members` · `member_settings` · `member_sessions` · `developmental_memories` ·
`google_calendar_credentials`.
⚠️ **Not found in that route:** memory atoms · semantic memory · relationship memory · manuscripts and
Works · anchors · episodes · practitioner material.
**Gap:** export exists and covers a *fraction* of what a member has. ⛔ Under the reciprocity test
that UARE-01 applied to someone else's ownership claim, **this is the row that binds us**.

### D12 · Deletion / forgetting — **PARTIAL**
**Object:** `lib/manuscript/source/eraseManuscript.ts`; `vault_erasure_queue` migration; Sanctuary
Mode's absolute boundary in the Anchor · **Ref:** base · **Evidence:** inspection.
**Gap:** erasure is Work-scoped and queue-backed. Member-scoped forgetting across the memory systems
of D2 was not located.

### D13 · Model visibility — **PARTIAL**
**Object:** `/maia/orientation`, `/maia/anchor/history`; `lib/maia/memoryHealth.ts`,
`substrateMap.ts`, `substrateObservability.ts` · **Ref:** base · **Evidence:** inspection; Anchor
records `/maia/orientation` as live with honest reporting (prior session).
**Gap:** these surface *substrate health* — whether memory is working. **No surface located that shows
a member the model formed of them, item by item, with its source.** Health is not visibility.

---

## 4 · Headline result

> **Soullab already has most of this, and the pieces have different authority, maturity and
> visibility.** The composition hypothesis is supported. It is not a missing-subsystem problem.

The three thinnest findings are not the ones a feature comparison would have predicted:

1. **D9 — the differentiator has the least custody.** No canon, no located refusal.
2. **D3 → D4 — the best provenance machinery in the organism is not pointed at the human model.**
   It is pointed at manuscripts.
3. **D11/D13 — ownership and visibility are narrower than their adjacent capabilities.** Export
   covers five tables; visibility shows substrate health rather than the model.

⭐ **And one geometry finding worth more than a state:** D5 holds a built implementation that
contradicts its own designed successor, in a project that has already written down which way it
should go. Averaging that to `PARTIAL` would have hidden it.

## 5 · Jurisdiction gaps (⛔ recorded, not resolved)

- **D5** — who adjudicates the ledger-vs-direction divergence? Memory lane or the Episodic Phase 2
  spec that does not yet exist.
- **D9** — constituting a representation canon needs an authority this lane does not have.
- **D10** — three refs carry it; no single lane visibly owns the composite.
- **D11** — export completeness sits between sovereignty, memory and Writer's Studio.

## 6 · What this census did NOT establish

⛔ No `LIVE` verified by this run · no source read on non-base refs · no runtime behaviour observed ·
no claim about production · ~1,355 refs uninspected · **no repair, architecture, migration, canon,
product requirement, doctrine or merge.**

> *One map, not another architecture — and the map's most useful marks are where the organism
> disagrees with itself.*
