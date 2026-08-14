# Rupture Containment Question — `member_relational_signals.rupture_state`

**Date:** 2026-08-13 · **Mode:** READ-ONLY forensic. No source edited, no row mutated, no fix proposed, nothing surfaced.
**Production witness:** `soullab@minisforum` / `maia-postgres` / `maia_consciousness`, live `GIT_COMMIT=9aefae046`.
**Scope exclusion:** ratification of `RELATIONSHIP_ROOM_CONSTITUTION.md` is owned by a separate agent and is **not** assessed here; the ratification brief was not opened.

---

## 0. Starting facts — verified, not assumed

`SELECT rupture_state, count(*), count(relationship_id), count(source_turn_id), min/max(created_at) … GROUP BY 1`:

| rupture_state | rows | with `relationship_id` | with `source_turn_id` | first | last |
|---|---|---|---|---|---|
| `ruptured` | 44 | **0** | **0** | 2026-04-18 | **2026-08-13** |
| `strained` | 53 | **0** | **0** | 2026-04-11 | **2026-08-13** |
| NULL | 343 | **0** | **0** | 2026-04-10 | **2026-08-13** |

Confirmed additionally: **all 440 rows carry `source = 'maia_conversation'`**; zero rows carry `source = 'labtool_manual'`. Mean confidence: `ruptured` 0.64, `strained` 0.74. Distinct members: 6 (`ruptured`), 5 (`strained`), 16 (all rows).

Writes are **current, not historical**: last 14 days show writes on 9 separate days, including **2026-08-13 — 6 rows, of which 1 `ruptured` and 1 `strained`**.

**Evidence class: PRODUCTION-PROVEN.**

---

## 1. What produced these records?

**A keyword substring match over the member's own message text. Nothing else.**

`lib/relationships/detectRelationalSignal.ts:117-130` defines the deciding vocabulary:

```ts
const RUPTURE_SIGNALS: Record<RuptureState, string[]> = {
  ruptured: [
    'betrayed', 'broken', 'ended it', 'cut off', 'cut him off', 'cut her off',
    'no contact', 'estranged', 'fell apart', "it's over", "we're done",
    'divorce', 'break up', 'breakup', 'broke up',
  ],
  strained: [
    'tension', 'hurt me', 'hurt them', 'hurt him', 'hurt her',
    'upset with', 'frustrated with', 'silent treatment',
    'not speaking', 'stormed out', 'walked out',
  ],
  none: [], unclear: [],
};
```

The decision itself (`detectRelationalSignal.ts:386-393`):

```ts
  // RUPTURE STATE
  let ruptureState: RuptureState | null = null;
  if (RUPTURE_SIGNALS.ruptured.some((kw) => userLower.includes(kw))) {
    ruptureState = 'ruptured';
  } else if (RUPTURE_SIGNALS.strained.some((kw) => userLower.includes(kw))) {
    ruptureState = 'strained';
  }
```

This is **unanchored substring containment** — not tokenized, not negation-aware, not scoped to a relational clause, not model-derived, not member-confirmed. `'broken'` matches *"I feel broken"*, *"the build is broken"*, *"nothing is broken between us"*. `'divorce'` matches *"my parents' divorce"*. `userLower` is the member's message only (MAIA's own reply feeds `tone`/`dynamicTags` via `combined`, but not `rupture_state`).

`rupture_state` then **raises** the confidence that lets the row persist at all (`:406`): `if (ruptureState) confidence += 0.25;` — additive scoring, capped at 0.95 with the comment *"we should never claim certainty."*

**Writers (both traffic-bearing lanes, fire-and-forget):**

- `app/api/sovereign/app/maia/route.ts:375` — **the traffic-bearing route** (2105 turns/7d)
- `app/api/sovereign/app/maia/list/route.ts:1433` — the low-traffic lane (26 turns/7d)

Both call `detectRelationalSignal(message, orchestratorResult.text)` then `persistDetectedSignal(...)` with `relationshipId` hardcoded `null` — which is why 0/440 rows carry a `relationship_id`. Persistence is `lib/relationships/relationshipSignalService.ts:111` (`insertRelationalSignal`), wrapped so DB errors never reach the conversation. Sanctuary turns are excluded at the `/list` call site (`isSanctuary` guard).

**Evidence class: SOURCE-PROVEN** (deciding code + call sites) **· PRODUCTION-PROVEN** (`source='maia_conversation'` on 440/440 rows, writes today).

---

## 2. What epistemic claim does `ruptured` encode?

**SYSTEM INFERENCE — a heuristic classification carrying a confidence value.** Explicitly *not* any of:

- **MEMBER DECLARES** — no member-facing surface writes `ruptured`; 0 rows of `source='labtool_manual'`.
- **RELATIONSHIP ESTABLISHED** — 0/440 rows bind a `relationship_id`. The judgement is not attached to any relationship the member recorded. It is a free-floating attribute of the *member*, keyed to `member_id` alone.
- **PRACTITIONER OBSERVES** — no practitioner path writes this table.
- **MAIA INFERS** — closest, but overstates: MAIA the model does not judge here. A 14-item string list does.

Plainly: **the system is asserting that a human relationship — which it has not identified, which the member has not named, and which it cannot point back to a sentence for — is broken.** It asserts this from one word appearing anywhere in one message.

**Provenance actually recorded on the row:** `source` (enum: `maia_conversation` | `labtool_manual`) and `confidence` (REAL). That is a *coarse* provenance class and it is real — the row does not pretend to be member-declared. What is **absent**: the originating text or turn (§3), the relationship referent, any authorship marker at render time, and any member correction or withdrawal path.

**Canon clause implicated** — `docs/canon/RELATIONSHIP_ROOM_CONSTITUTION.md` §II RELATIONAL AUTHORSHIP:

> **BOUNDARY.** An observation or an inference may never silently become a declaration. The system may not author into the member's relational record any statement of relational condition that the member has not made. That MAIA today has a write path for *rupture* which no member-facing surface offers is an inversion of authorship, stated here as a constitutional fault — the remedy is not designed here.

The canon already names this exact write path and already classes it a constitutional fault. This audit measures it; it does not discover it.

**Evidence class: SOURCE-PROVEN** (canon text, type enum, call-site `null`) **· PRODUCTION-PROVEN** (source/relationship_id counts).

---

## 3. What source evidence exists per record?

**None retrievable from the row. 0 of 440 rows carry `source_turn_id` — 0.0%.**

This is not a schema gap. The column exists in production (verified against `information_schema.columns`) and was added by `database/migrations/20260409000011_relational_signal_source_turn.sql` in April. **51 rows have been written since 2026-07-01, long after the column existed — 0 of them carry it.** Both call sites *attempt* to supply it:

```ts
const turnIdRaw = orchestratorResult.metadata?.turnId;
const sourceTurnId = typeof turnIdRaw === 'number' && Number.isFinite(turnIdRaw) && turnIdRaw > 0 ? turnIdRaw : null;
```

`lib/sovereign/maiaService.ts:3343` does set `meta.turnId = turnId`, but the value never arrives at the insert. The exact break between `meta` and the returned `metadata` (`maiaService.ts:3693`, `responseMetadata`) was **not** run down in this read-only pass.

The table stores no conversation content **by design** (`20260409000010_…sql` header: *"NOT a clinical record · NOT a verdict · descriptive, never diagnostic"*). Combined with an empty `source_turn_id`, the consequence is exact:

> **The judgement is stored, and its basis is not.** For every one of the 44 `ruptured` rows, there is no supported way to answer *"what did the member actually say?"* Correlating `member_id` + `created_at` against `maia_turns` would be reconstruction by proximity, not provenance — and is not a retrieval path the system offers.

**Evidence class: PRODUCTION-PROVEN** (0/440, 0/51-since-July, column present) **· UNRESOLVED** (why `turnId` never lands).

---

## 4. Can MAIA currently consume them?

**No. There is no prompt reader of `member_relational_signals` anywhere in the codebase.**

Complete reader inventory (every reference to the table or to `relationshipSignalService`):

| Reader | Path | Destination | Prompt? |
|---|---|---|---|
| `getLatestSignal` | `relationshipSignalService.ts:221` → `GET /api/maia/relational-signal` | `components/maia/RelationshipFieldCard.tsx` | **No — UI** |
| `getRecentSignals` | `relationshipSignalService.ts:244` | no live caller found | No |
| `countMatchingSignals` | `relationshipSignalService.ts:278` → `/api/maia/relational-signal/count` | continuity hint on the same card | **No — UI** |
| direct SQL | `app/api/founder/relational-signals/route.ts:200` + `/review` | founder-only review surface | **No — founder** |

**The near-miss that is not one:** `buildRelationalContextBlock` *does* reach a prompt — but it consumes `getMemberActiveRelationalContext`, which reads `member_relationships` and `relationship_entries` (`relationshipContextService.ts:84,116,132`), **not** `member_relational_signals`. And its only call site is `app/api/oracle/conversation/route.ts:2409` — the lane retired 2026-07-17 (410 + Sanctuary S2/K4), which receives ~zero traffic.

The traffic-bearing route `app/api/sovereign/app/maia/route.ts` imports `detectRelationalSignal` and `persistDetectedSignal` and **nothing else** from this subsystem: it **writes only**. `rupture_state` reaches no prompt on any route, traffic-bearing or otherwise.

**Evidence class: SOURCE-PROVEN** (exhaustive grep of table name + service across `app`, `lib`, `components`, `scripts`).

---

## 5. Is any production behavior currently being altered by them?

**No production behavior is currently altered — and the reason is a navigation removal, not a gate.**

The render path, traced end-to-end:

`RelationshipFieldCard` → mounted **only** by `components/maia/panels/RelationshipsPanel.tsx:28` → mounted **only** by `MaiaRightPanelHost.tsx:76` under `case 'relationships'` → requires `activeWorld === 'relationships'` → `setActiveWorld` is called from exactly one place, `MaiaShell.tsx:174` (`handleWorldChange`, driven by left-rail clicks) → **the Relationships rail item no longer exists.** `lib/navigation/maiaNav.ts:66-68`:

```ts
  // Encounters (Footprints → /sessions) and Relationships (Heart → /relationships)
  // removed from the rail 2026-07-05: both surfaced only a contextual panel with no
  // process behind it. Restore here once each is attached to an actual process.
```

`'relationships'` survives in `MAIA_PANELS` (`maiaNav.ts:286`) and in `MaiaWorldId` (`navigation/types.ts:36`), but no member gesture can set it. `app/relationships/` exists as a page and does **not** read this table (verified). `worldHints` (`MaiaShell.tsx:258-261`) can only decorate rail items that exist.

**What is still fully live behind that removed rail entry**, and what would render if `activeWorld` ever became `'relationships'` again (`RelationshipFieldCard.tsx:123-126, 282, 335`):

```ts
    case 'ruptured': return 'something broken here';
    case 'strained': return 'something strained here';
```

rendered as *"…, something broken here."* under the label **"Surfaced from your recent conversation"** — and injected into a pre-filled prompt the member can send to MAIA (`:146-152`): *"I'm in a … field with … **Something is broken.** Help me understand what is happening…"* — putting the system's inference into the member's own voice.

The API (`GET /api/maia/relational-signal`) is unauthenticated-gated by session only and **returns the latest signal today**, including `ruptureState`. The endpoint is live; only the mount point is absent.

**Evidence class: SOURCE-PROVEN** (render ancestry traced through the actual mount chain, not the symptom node) **· INFERRED** for member-facing unreachability — this is a code-read of the nav ancestry, **not** a device witness. No PWA/iOS walk was performed.

---

## CONTAINMENT POSTURE — finding, not recommendation

**DORMANT AND ACCUMULATING. Not prompt-operative. Not currently member-visible.**

Stated precisely, because the three are different risks:

1. **Not prompt-operative.** `rupture_state` reaches no prompt on any route. MAIA does not currently speak differently to a member because a row says `ruptured`. (§4, SOURCE-PROVEN)
2. **Not currently member-visible** — but by *nav removal*, not by a consent gate, a feature flag, or a constitutional check. The card, its phrasing, its prompt-injection affordance, and its API all remain live and correct-by-their-own-lights. Restoring one rail entry restores member visibility of all 44 judgements, with no further change. (§5, SOURCE-PROVEN ancestry / INFERRED reachability)
3. **Accumulating in the present tense.** This is not a dormant historical corpus. The traffic-bearing route wrote a new `ruptured` row **today**. The population grows whether or not anything reads it, and each new row is written without a relationship referent and without a retrievable basis. (§0, PRODUCTION-PROVEN)

The gap between (1)+(2) and (3) is the containment question itself: **the write path is live and the read path is dark.** Dormancy here is a property of the current navigation tree, not of the architecture.

## The smallest thing that would have to be true for this to be safe

Stated as a condition, per the mandate — **not** as a change, and this document does not authorize one:

> **An inference would have to be unable to present itself as a declaration — at the row and at every render — and its basis would have to be retrievable by the member it is about.**

Concretely, that single condition decomposes into what is measurably absent today: the row would carry its authorship (system-inferred, not member-said) in a form the render layer must honor; the originating turn would be recoverable, so *"what did I say that produced this?"* has an answer (`source_turn_id` is 0/440); and the member would be able to see, correct, or withdraw what the system wrote about their relationship — the authority `RELATIONSHIP_ROOM_CONSTITUTION.md` §II IMPLICATION already assigns them. Until that holds, `ruptured` remains a statement of relational condition authored by the system into the member's record, which §II BOUNDARY forbids and already names a constitutional fault.

---

## UNRESOLVED

- **Why `source_turn_id` is never populated.** `maiaService.ts:3343` sets `meta.turnId`; the insert receives `undefined`. Whether `meta` and the returned `metadata` (`:3693`) are the same object was not run down. 0/440 is measured; the mechanism is not.
- **Member-facing unreachability is code-read, not witnessed.** No PWA or iOS walk was performed to confirm no residual entry point (deep link, legacy route, cached client state) can set `activeWorld = 'relationships'`.
- **Which of the two write lanes produced which rows.** Both `/maia` and `/list` write with `source='maia_conversation'`; the rows do not distinguish them.
- **False-positive rate is unmeasured and, given §3, unmeasurable from the rows alone.** No claim is made here that any specific `ruptured` row is wrong — only that none of the 44 can be checked.
- **`getRecentSignals` has no live caller found.** Absence from a search is evidence about the search.
