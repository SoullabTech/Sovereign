# Phase 8 — CONDUCTOR / CANONICAL TURN ARCHITECTURE

**Program:** `MAIA-WHOLE-INTELLIGENCE-CONVERGENCE-01`
**State:** `PACKETIZING`
**Authority:** `docs/canon/MAIA_ONE_MIND_MANY_EMBODIMENTS.md` (ratified 2026-08-31)
**Explicitly NOT:** endpoint consolidation

> **Phase 8 does not begin by merging the two enormous routes.** That risks producing a 4,000-line canonical monster. Phase 8 extracts the **cognition boundary** first; the routes converge onto it afterward, one at a time.

---

## The root-cause mechanism (why patching addenda cannot work)

```ts
// lib/sovereign/maiaService.ts:587
type MaiaRequest = {
  sessionId: string;
  input: string;
  meta?: Record<string, unknown> & { reqId?: string | null; exchangeId?: string };
  ...
};
```

**Every intelligence in the system reaches cognition through `meta: Record<string, unknown>`** — an untyped bag, read downstream as `(meta as any)?.someAddendum`. Two consequences follow mechanically:

1. **Nothing can detect an addendum that is never consumed.** An addendum absent from `ADDENDA_SPECS` produces no error, no warning, and no test failure. It simply does not exist on that tier. This is the literal mechanism of the tier inversion (D7/D8).
2. **`MaiaRequest` is not exported.** `between/chat` could not call `getMaiaResponse` under a typed contract even if it wanted to — so building its own stack was, at the time, the path of least resistance. The fork is a consequence of the missing contract, not carelessness.

**Therefore packet 1 is the type, not the plumbing.** Until the intelligence payload is structured and typed, every convergence is reversible by the next author who adds a field.

---

## The canonical turn boundary

```text
buildMaiaTurn(input: MaiaTurnInput): Promise<MaiaTurnResult>
        │
        ├── 1. gather eligible intelligence      (sources → EvidenceItem[])
        ├── 2. apply authority / consent          (eligibility filter, never silent)
        ├── 3. conduct composition                (Conductor → CompositionPlan)
        ├── 4. execute cognition tier             (budget/depth only)
        ├── 5. record participation / restraint   (SELECTED / WITHHELD / USED)
        └── 6. return canonical MaiaTurnResult
```

Adapters sit **outside** the boundary, never inside it:

```text
between/chat              → text adapter        → buildMaiaTurn()
voice/stream-conversation → voice lifecycle/STT → buildMaiaTurn() → TTS adapter
journal/reflect           → reflective task contract → buildMaiaTurn()
portal/[slug]/chat        → persona/role contract    → buildMaiaTurn()
now-what/interview        → room task contract       → buildMaiaTurn()
```

**The routes may remain different. MAIA may not.**

---

## Packet sequence

Each packet is independently shippable, independently verifiable, and reversible. **No packet is authorized to run until the one before it is verified.**

### P0 — Evidence contract *(type-only; zero behavior change)*

Define and export the structured intelligence payload. No runtime wiring.

```ts
type EvidenceItem = {
  source: IntelligenceSourceId;      // registry key, closed set
  authority: AuthorityRank;          // constitutional hierarchy position
  provenance: 'member_authored' | 'member_declared' | 'system_inferred' | 'corpus';
  consent: { eligible: boolean; gate: string; gesture?: string };
  content: string;                   // the block as it exists today
  relevance?: number;
  confidence?: number;
  recency?: Date;
  memberDeclaredSignificant: boolean;
};
type MaiaTurnInput = { /* typed; no Record<string, unknown> */ };
```

**Verification:** `npm run typecheck` green against baseline. No behavior change is possible — nothing consumes it yet.

**Why first:** this is the only packet that makes every later packet non-reversible by accident.

---

### P1 — Truth instrument *(Wave A; unblocks measurement of everything after)*

Close D1/D2/D16 **before** any composition change, so P2+ are measured by a working instrument.

- `deriveStatus` must distinguish `absent_store` from `empty_result`. Today both are `'empty'` (`memoryHealth.ts:122-130`).
- Stop feeding the atoms row count into the field named `semantic` (`route.ts:1093-1095`).
- Either feed `pattern` / `somatic` / `field` / `meta`, or mark them `not_wired` — never `'empty'`.
- Surface the swallowed `.catch()` in `relationalObserver.ts:139-140` as an honest failure state.

**Verification:** induce a dependency failure in staging; health must report degraded. **Today it reports healthy — that is the acceptance test.**

**Blocked on:** the §6 runtime probes (census). They have not been run.

---

### P2 — Conductor seam *(pass-through; the load-bearing packet)*

Introduce `conduct(evidence: EvidenceItem[], moment): CompositionPlan` — **initially returning today's fixed order**, so behavior is provably identical.

```ts
type CompositionPlan = {
  selected: Array<{ item: EvidenceItem; reason: string }>;
  withheld: Array<{ item: EvidenceItem; reason: string }>;
  ordering: IntelligenceSourceId[];   // by authority, not array position
};
```

Prompt assembly becomes a **pure function of the plan**. `ADDENDA_SPECS` is deleted as an authority; it survives only as a rendering detail.

**Verification:** byte-identical prompts for a corpus of recorded turns, all three tiers. A diff is a bug, not an improvement.

**Why pass-through matters:** it separates *moving the decision* from *changing the decision*. Doing both at once makes any regression unattributable.

---

### P3 — Tier parity *(closes D7/D8 through the architecture, not around it)*

With P2 in place, tier stops selecting *which* evidence exists and selects **only depth, model, latency, and reasoning budget**. The five FAST-only addenda cease to be special because nothing consults an array to decide.

DEEP-primary's missing prompt seam (`consciousnessOrchestrator`, D8) is resolved by the plan being an input to orchestration rather than a string appended to a prompt.

**Verification:** same member moment across FAST/CORE/DEEP produces **equivalent composition plans**, differing only in budget fields.

---

### P4 — Participation record *(closes Corollary 3)*

Persist the full chain: `AVAILABLE → RETRIEVED → OFFERED → SELECTED/WITHHELD → USED`.

Rename or retire `ConversationMemoryUsesStore` — it records retrieved candidates and is named for a question it does not answer (D14).

**`WITHHELD` is a first-class outcome, recorded with its reason.** A system that only logs what it used cannot demonstrate restraint, and restraint is the behavior this program exists to protect.

---

### P5 — Adapter conversion *(one surface per packet, in this order)*

```text
P5a  between/chat              → text adapter        (D3 — largest, do first while attention is on it)
P5b  voice/stream-conversation → voice adapter       (D4 — verify against P5a via composition-plan equality)
P5c  OracleConversation default apiEndpoint          (D5 — one line, but only meaningful after P5a)
P5d  now-what · relational-navigation                (task contracts)
P5e  journal/reflect · portal/[slug]/chat            (task + persona contracts)
P5f  partners/onboarding/prelude off oracle/conversation; retire that route (D13, D21)
```

Each surface's declared contract — persona, task, latency, permissions — is **registered**, not implicit. That register is the seed of `MAIA_INTELLIGENCE_REGISTRY` (Phase 10).

---

### P6 — Restraint proof *(Wave G; the packet that proves the program succeeded)*

Demonstrate that a source being AVAILABLE and SELECTED-eligible does **not** produce speech.

**Without P6, "fully integrated" becomes MAIA spraying every capability into every response, and convergence will have destroyed what it was run to protect.** P6 is not cleanup. It is the acceptance criterion.

---

## Deferred by ruling, not forgotten

| Item | Status |
|---|---|
| `semantic_memory_vectors` / `lattice_nodes` (D10/D11) | **Adjudication still open.** Neither table is created. Under P0's provenance contract, a source with no reader cannot register — which likely retires the writer rather than owing a migration. |
| Ranking authority consolidation (D12) | Subsumed: the Conductor *is* the arbiter. The 12 implementations become relevance inputs, not deciders. |
| RLM relative URL (D9) | Independent one-line fix. May ship outside this sequence. |
| MythicAtlas 422 (D15) | Contract drift with an external service. Needs that service; not on the convergence path. |
| Corpus / manuscript (D17) | Registers as an authority-ranked source under P0, below member-authored experience. Wiring is a later wave. |
| Somatic / morphic / coherence (D18) | Remain `INTENTIONALLY_RESTRAINED`. This program does not lift frozen plans. |

---

## Phase 8 exit criteria

1. `buildMaiaTurn` is the only path to MAIA cognition; every surface reaches it through a registered adapter.
2. Composition is a plan, not a concatenation; ordering derives from authority.
3. Tier varies budget only — proven by composition-plan equality across tiers.
4. The participation chain reaches `USED`, and `WITHHELD` is recorded with reason.
5. Health telemetry reports a failed dependency as failed.
6. Restraint is demonstrated, not assumed.

**Then Phase 9** (cross-medium witnessing) tests the same member moment across text, voice, desktop, mobile, practitioner, and Studio — expecting **not identical prose**, but *same mind, contextually appropriate embodiment*.
