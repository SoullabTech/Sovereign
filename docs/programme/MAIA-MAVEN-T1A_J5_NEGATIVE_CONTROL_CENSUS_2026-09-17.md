# MAIA-MAVEN-T1A — J5 NEGATIVE-CONTROL CENSUS

**Gate:** J5 — Repository Truth / Negative-Control Falsification
**Authority exercised:** READ · TRACE · CENSUS · FALSIFY · RECORD
**Authority NOT exercised:** ⛔ BUILD · REPAIR · MIGRATE · SCHEMA · ROUTE · UI · PRODUCTION
**Base:** `clean-main-no-secrets` @ `97c7d946`, branch `claude/determined-bell-olsuy7`
**Date:** 2026-09-17

---

## ⭐⭐ 9. J5 VERDICT — **MIXED**, reported individually, ⛔ not averaged

| Control | Verdict |
|---|---|
| **NC-1** ENCOUNTER ↛ KEEP | ✅ **PASS** (source-attested) — with a recorded History-write finding |
| **NC-2** KEEP ↛ REOPEN | ✅ **PASS** (source-attested) — the Keep path performs no retrieval |
| **NC-3** REOPEN ↛ KEEP | ✅ **PASS** (source-attested) — retrieval paths are read-only |
| **NC-4** CONTINUE ↛ KEEP | ⚠️ **GAP — cannot fail because CONTINUE does not exist** in `/maia` |
| **NC-5** Sanctuary = ENCOUNTER ONLY | ✅ **PASS** at four independent layers — ⚠️ one delegation risk |
| **NC-6** MAIA ↛ selector (referent) | ⚠️ **UNATTESTED** — no referent resolver found; capture-panel prefill uninspected |
| **NC-7** candidate ↛ selection | ✅ **PASS** (source-attested) |
| **NC-8** relevance ↛ REOPEN | ✅ **PASS** on the relevance prohibition — ⚠️ **TENSION** on durable vs per-act authority |
| Exact referent | ⚠️ **PARTIAL** — verbatim preserved on the Press path; transformation uninspected elsewhere |

⚠️ **ALL VERDICTS ARE SOURCE-ATTESTED, NOT EXECUTED.** `node_modules` is absent in this
container, so **no test was run**. Relevant suites exist and are named in §7; ⛔ per the gate's
evidence standard none was added, and their existence is not their passing.

⭐ **The headline:** the runtime is **substantially better governed than J4 assumed**, because a
prior founder ruling already built the Keep authority contract — and the real defects are two
**absences** (CONTINUE, START_FRESH) plus one **discipline-not-structure** guard, not a
collapse of acts.

---

## 1. Repository seam census

### 1.1 ⭐⭐ The decisive discovery — the KEEP AUTHORITY CONTRACT already exists

`lib/consciousness/keepIntent.ts` (186 lines), header verbatim:

```text
KEEP AUTHORITY CONTRACT (Kelly ruling 2026-08-28)

  UNDERSTAND   MAIA understands the member is expressing Keep intent.
  FACILITATE   The House may surface / open the member-controlled Keep gesture.
  COMMIT       Only the member's own confirmation may persist the material.

Recognition must never silently collapse into commitment.
```

⭐ **This is an ancestor of the J4 contract, ruled three weeks before it** (2026-08-28 vs
2026-09-17), and it independently reaches the same law. J4 §6 (*MAIA may assist; MAIA may not
become the selector*) is the same distinction stated from the other side.

The module is **pure**: *"No model calls. No side effects. No persistence."* Verified —
it imports nothing, performs deterministic phrase matching, returns `{kind, matched}`.

⭐ It also already encodes the **KEEP/CONTINUE discrimination** J4 §4 later ratified, via a
`FALSE_FRIENDS` list checked against *the matched region, not the whole message*:

```text
'keep this up' · 'keep this going' · 'keep this in mind' · 'keep this door open'
'keep this to yourself' · 'keep this between us' · 'keep this brief' · 'mark this as read'
```

⭐ And it handles the compound case: *"keep going — actually, can we keep this?"* means both
things, and the second is a real request (`everyOccurrenceIsFalseFriend`).

⚠️ **Note for R8:** `'remember this moment'`, `'remember this exchange'`, `'remember this part'`
are **KEEP_MATERIAL phrases**. The founder's *"seemingly innocent 'remember this' gesture"* is
therefore already routed to KEEP recognition — correctly bounded to UNDERSTAND/FACILITATE, but
worth knowing that the phrase is live.

### 1.2 Seam inventory

| Concern | Live seam | Notes |
|---|---|---|
| Keep invocation recognition | `lib/consciousness/keepIntent.ts` → `detectKeepIntent()` | pure; wired at `components/OracleConversation.tsx:218` (import) and `:6307` (call) |
| KEEP vs CONTINUE | same module, `FALSE_FRIENDS` | discriminates KEEP from *"keep this open"*-shaped phrasing |
| Keep write (Press) | `app/api/sovereign/manuscripts/[id]/keeps/route.ts` | member gesture; verbatim re-verified against member's own section |
| Keep read (Press) | `app/api/sovereign/keeps/route.ts` | *"ORDERS but never SELECTS"*, 8 doctrine assertions |
| Keep write (portfolio) | `lib/psyche/portfolio.ts:460` `INSERT INTO member_memory_atoms` | carries `posture_at_creation`, `generated_by` |
| Ambient memory return | `lib/maia/memoryAtomsLoader.ts` via `lib/maia/roomComposition.ts:48` | consent-gated in SQL |
| Episodic return | `lib/maia/episodicRecallBlock.ts` ← `memoryLoaders.loadRecentMarkedEpisodes` | member-marked only |
| Selection policy | `lib/maia/memorySelectionPolicy.ts` | versioned; changing it is a governed act |
| Sanctuary posture | `lib/sanctuary/turnPosture.ts` | per-turn, private constructor, fail-closed |
| Turn-consuming detector | `lib/services/conversationEssenceExtractor.ts:207` `detectJournalCommand()` | used at `components/OracleConversation.tsx:4961` |
| Auto-extraction (writes) | `lib/maia/sessionProcessor.ts` | `persistEpisodicMemory` · `persistThresholdEvents` · `persistExpansionEvents` |
| **CONTINUE act in `/maia`** | ⛔ **NONE FOUND** | see NC-4 |
| **START_FRESH** | ⛔ **NONE FOUND** | see §8 |
| Referent resolution of *"this"* | ⛔ **NONE FOUND** | see NC-6 |

⭐ **Why recognition sits apart from `detectJournalCommand()`**, in the module's own words:

> *That detector CONSUMES the member's utterance — when it matches, the message never reaches
> MAIA and she goes silent. "Can we keep this?" is relational speech addressed to her. The
> interface must not turn her mute because it recognized an affordance.*

That is Invariant 6 (Mirror Integrity) reasoned out at an interface seam, independently.

---

## 2. ENCOUNTER / KEEP / REOPEN / CONTINUE transition map

```text
ENCOUNTER ──detectKeepIntent()──▶ [UNDERSTAND]  pure, no write
                │
                ├─ Sanctuary? ──▶ ⛔ REFUSED (branch is first)
                │
                └──▶ [FACILITATE] doorway surfaced alongside the reply
                              │
                              └─ member confirms ──▶ [COMMIT] ──▶ KEEP persisted
                                                    ▲
                                          only the member's act reaches here

REOPEN  ──▶ memoryAtomsLoader   (gate: return_preference ∈ {contextual_doorway,
        │                              ritual_review_opt_in}; member_pulled NEVER ambient)
        └──▶ episodicRecallBlock (gate: members.episodic_recall_enabled; member-marked only)
                     ⚠️ runs ambiently per turn — see NC-8 TENSION

CONTINUE ──▶ ⛔ NO PATH IN /maia
             (exists in other domains: ChangeStatus lifecycle, lib/team/attention.ts open loops)

START_FRESH ──▶ ⛔ NO PATH ANYWHERE
```

---

## 3. NC-1 … NC-8 disposition

### NC-1 — ENCOUNTER must not become KEEP · ✅ **PASS**

`detectKeepIntent()` writes nothing and opens nothing. `components/__tests__/keepIntentWiring.test.ts`
asserts *"recognition does not commit"*, *"nothing in the block persists anything"*, and *"the
material branch surfaces a doorway, it does not open the panel"*.

⚠️ **Finding, recorded not scored as FAIL.** `lib/maia/sessionProcessor.ts` **does** persist
without a member act: `INSERT INTO episodic_memories` (:616), `threshold_events` (:546),
`expansion_events` (:568), carrying `confidence`, `significance`, `source`.

⭐ **This is not a Keep, and it does not become returnable Memory** — which is exactly the
Continuity Positions distinction holding in live code. `lib/maia/episodicRecallBlock.ts` states:

> *Does NOT select by significance / emotional_intensity / breakthrough_level — those columns
> are NULL for member-marked rows and are never consulted. Selection is member-marked-only.*

So auto-inferred rows are written to **History** and are **structurally excluded from Memory**.
NODE-16 §III permits History by default on personal `/maia`. ⛔ NC-1 is about KEEP, and no path
manufactures one.

### NC-2 — KEEP must not become REOPEN · ✅ **PASS**

The Keep block at `OracleConversation.tsx:6302-6314` performs recognition and doorway surfacing
only; it contains no retrieval call. `lib/consciousness/keepIntent.ts` imports nothing.

⚠️ **Scope of the claim:** this proves *the Keep path adds no retrieval*. It does **not** prove
the encounter's retrieval baseline is zero — ambient return runs independently of any Keep act
(NC-8). The two are separate questions and are kept separate here.

### NC-3 — REOPEN must not become KEEP · ✅ **PASS**

`lib/maia/memoryAtomsLoader.ts`: *"Does NOT write atoms — writes must be member gestures only."*
`app/api/sovereign/keeps/route.ts` is GET-only and reads kept passages. `episodicRecallBlock.ts`
renders; it does not persist. No retrieval path was found that writes.

### NC-4 — CONTINUE must not fall back to KEEP · ⚠️ **GAP**

⛔ **CONTINUE does not exist as a member act in `/maia`.** No recognizer for *"leave this open"*,
*"come back to this"*, or *"keep this open"* was found. The only hits are prompt copy
(`lib/maia/noteModeVoice.ts:92`), a UI label (`components/focus/NextStepBuilder.tsx:339`), and
Changes/team lifecycle state elsewhere.

⭐ **Partial structural protection exists anyway:** `keepIntent.ts` `FALSE_FRIENDS` excludes
*"keep this door open"* from KEEP, so that phrasing cannot degrade into a Keep — it simply
produces **no act at all**.

⚠️ **Honest verdict: this control cannot FAIL, and it cannot PASS.** There is no CONTINUE to
degrade and none to honour. Recorded as a **GAP**, ⛔ not a pass. *Absence of the act is not
evidence of separation between acts.*

### NC-5 — Sanctuary must remain ENCOUNTER ONLY · ✅ **PASS** at four layers

| Layer | Evidence |
|---|---|
| Posture resolution | `lib/sanctuary/turnPosture.ts` — per-turn, private constructor (unforgeable), **fail-closed when no posture is provided** |
| Conversation seam | `keepIntentWiring.test.ts`: *"the Sanctuary branch comes first and does neither"*; *"isSanctuary is a dependency of the enclosing callback"* (⭐ guards a stale closure) |
| Capture handler | `sanctuaryCaptureRefusal.test.ts`: refusal *"returns before any capture request is dispatched"* and *"precedes the auth and message-count guards, so Sanctuary is answered first"*; *"the member is told why, rather than met with a silent no-op"* |
| Session processing | `lib/maia/sessionProcessor.ts:16` — *"Sanctuary sessions: metadata only, no content stored, no LLM call"*; `handleSanctuary()` at :300 |
| Recall suppression | `episodicRecallBlock.ts` — *"Does NOT inject the block during Sanctuary Mode (defense-in-depth)"* |

⭐ `keepIntentWiring.test.ts` also asserts *"MAIA cannot claim the Keep completed"* — the
speech-act boundary forbidding her from **asserting** a capture. That is J4 §2's *"MAIA must not
carry, summarize, quote, or reconstruct"* approached from the utterance side.

⚠️ **ONE DELEGATION RISK, named.** `keepIntent.ts` states: *"knows nothing about Sanctuary.
Callers own that."* That is correct for a pure recognizer, but it means **Sanctuary safety is a
property of each call site, not of the module.** One caller exists today and is guarded. ⛔ A
second caller could be added with no compile-time or test-time signal. ⛔ Not repaired.

### NC-6 — MAIA must not become the selector · ⚠️ **UNATTESTED**

⛔ **No referent-resolution seam was found.** `detectKeepIntent()` returns the matched *phrase*,
never the designated *material*; it has no notion of what *"this"* points at.

Structurally this is the right shape — the member selects in the capture surface, so MAIA never
chooses the enduring referent. **But the census could not establish what that surface pre-fills.**
If the capture panel pre-selects (e.g.) "the last exchange", a system choice of referent exists
one layer below the recognizer.

⚠️ **Recorded as UNATTESTED, ⛔ not PASS.** Per the gate's evidence standard, *absence of
sufficient evidence is not PASS.* Closing it requires inspecting the capture surface's prefill —
⛔ not performed, as it approaches UI territory this gate excludes.

### NC-7 — Candidate generation must not become selection · ✅ **PASS**

No automatic Keep-candidate generator was found. The recognition block surfaces a doorway and
`keepIntentWiring.test.ts` asserts *"nothing in the block persists anything"*, *"the Keep block
never returns early"*, and *"the doorway names the member as the one who asked, not MAIA as
noticer"*.

⭐ That last assertion is J4 §6 in miniature: the doorway is attributed to the member's request,
not to MAIA having noticed something worth keeping.

### NC-8 — Conversational relevance must not become REOPEN authority · ✅ **PASS** / ⚠️ **TENSION**

**PASS on the prohibition itself.** `lib/maia/memorySelectionPolicy.ts` states the live policy:

> *Ordering is breakthrough-first then most-recently-kept; **relevance to the current
> conversation does not participate in selection under this policy version.***

Consent gates are in SQL, not runtime logic: `return_preference IN ('contextual_doorway',
'ritual_review_opt_in')`; *"Does NOT surface 'member_pulled' atoms ambiently"*; never
`sacred_protected`; a member `rejected` status **releases** the atom. `is_breakthrough` is
documented at `lib/maia/substrateMap.ts:380` as *"never system-set"*.

⭐ So ordering is **mechanical and declared**, and the set is **member-authorized** — precisely
the two things J4 §7 admits.

⚠️ **TENSION, for founder ruling.** J4 §7 requires *"a deliberate member instruction to bring
prior material forward"*. The live mechanism is a **durable standing preference**
(`return_preference = 'contextual_doorway'`), applied **ambiently every turn**, not a
per-encounter instruction.

Both readings are defensible and NODE-16 §XXI ranks them: *current explicit member instruction*
(2) outranks *explicit durable preference* (4) — so a durable preference **is** legitimate
authority, merely lower-ranked. ⛔ But J4 §7 as written does not say whether a standing
authorization satisfies "its own deliberate member act", and R1 makes the answer consequential.
⛔ Not resolved here.

---

## 4. Sanctuary disposition

**ENCOUNTER ONLY holds in live code**, enforced at posture resolution, the conversation seam,
the capture handler, session processing, and recall suppression. The J4 §2 ruling (*a Keep
cannot originate from a Sanctuary turn*) is **already the runtime's behaviour**, reached before
the ruling existed.

⚠️ Open: the delegation risk in NC-5; and ⛔ the census did **not** attempt to prove the eighth
J4 sub-claim — *no system component carries or reconstructs the Sanctuary material after exit* —
which would require runtime observation of post-exit state. **UNATTESTED.**

---

## 5. Exact-referent disposition · ⚠️ **PARTIAL**

✅ **Press path is strong.** `app/api/sovereign/keeps/route.ts` carries `verbatim_text` and
states that `POST /manuscripts/[id]/keeps` *"re-verifies the passage exists verbatim inside that
member's own section before writing, so a keep cannot originate text"*, with doctrine assertions
*"returns the kept characters unaltered"* and *"carries provenance with every line, never
separately"*.

✅ **Provenance columns exist** on the portfolio path: `posture_at_creation`, `generated_by`
(`lib/psyche/portfolio.ts:465`) — the latter is the member-authored vs member-adopted-MAIA
distinction J4 §5 requires, at least structurally.

⚠️ **Not established:** whether any path persists **derived meaning** alongside the referent.
`sessionProcessor` demonstrably persists derived material (`summary`, `confidence`,
`significance`) — but into `episodic_memories`/`threshold_events`, ⛔ not into a Keep. Whether a
Keep can ever carry a summary was not proven either way. **UNATTESTED.**

---

## 6. ⭐ Representation Authority substitutions found (⛔ none repaired)

### RA-1 — The phrase match is treated as the member act, and is bounded

`detectKeepIntent()` is a deterministic string matcher whose output decides whether a Keep
doorway appears.

1. **SUBSTITUTION** — yes: if `KEEP_MATERIAL_PHRASES` / `FALSE_FRIENDS` change while the member's
   utterance is constant, the surfaced affordance changes.
2. **GRANT** — the Kelly ruling 2026-08-28, which grants it **UNDERSTAND + FACILITATE only**.
3. **ATTESTATION** — `lib/consciousness/__tests__/keepIntent.test.ts` (incl. a source-reading
   test) and `components/__tests__/keepIntentWiring.test.ts`.

⭐ **The substitution is real but constitutionally bounded**: a wrong match costs a spurious or
missing *doorway*, never a persistence. This is the correct containment, and it is why the seam
survives J4 unmodified.

### RA-2 — ⚠️ Two `keepIntent` modules, two vocabularies, one unwired

`lib/consciousness/keepIntent.ts` (wired, phrase recognition) and `lib/library/keepIntent.ts`
(*"the constitutional seam of the Personal Wisdom Library"*, with `UsageAuthority` ladder
`store_only → only_when_i_ask → reflect_with_me → use_in_guidance`, `DEFAULT_USAGE_AUTHORITY =
'only_when_i_ask'`).

**The library module has ZERO non-test consumers.** Two modules share a filename and a domain
noun while meaning different things — ⭐ the **third** instance of the R8 "Keep denotes several
things" pattern, now at module level. ⛔ Recorded, not repaired; it is R8 territory.

### RA-3 — ⭐⭐ The strongest finding: a guard that is discipline, not structure

`sessionProcessor` writes `confidence`, `significance`, `breakthrough_level`,
`emotional_intensity` into `episodic_memories`. `episodicRecallBlock` protects the member by
**declining to consult those columns**:

> *Does NOT select by significance / emotional_intensity / breakthrough_level — those columns
> are NULL for member-marked rows and are never consulted.*

1. **SUBSTITUTION** — yes, and it is currently **inert**: those classifier outputs sit in the
   database beside member-marked rows and are simply not read.
2. **GRANT** — none. Nothing grants them selection authority; they are written and ignored.
3. **ATTESTATION** — ⚠️ **the comment and the query shape.** No test was found asserting that a
   future selector must not consult them.

⭐⭐ **The separation between History and Memory here rests on a query that chooses not to read
columns that are sitting right there.** That is correct behaviour resting on discipline rather
than structure — the same class as `houseDispositions.ts`'s own self-indictment (*"NOTHING IN
THIS FILE ENFORCES THIS"*). ⛔ Not repaired; naming it is this gate's job.

---

## 7. Existing tests / attestations (⚠️ present, ⛔ NOT RUN)

| Suite | Bears on |
|---|---|
| `lib/consciousness/__tests__/keepIntent.test.ts` | NC-1, NC-4 (false friends), RA-1 |
| `components/__tests__/keepIntentWiring.test.ts` | NC-1, NC-5, NC-7 |
| `components/__tests__/sanctuaryCaptureRefusal.test.ts` | NC-5 |
| `app/api/sovereign/keeps/__tests__/keepsReadDoctrine.test.ts` | NC-3, exact referent |
| `app/api/sovereign/episodes/mark/__tests__/sanctuaryGuard.test.ts` | NC-5 |
| `lib/library/__tests__/keepIntent.test.ts` | RA-2 (module has no non-test consumer) |

⛔ **`node_modules` is absent in this container; none was executed.** ⛔ No instrumentation was
added. Running these on a prepared host would convert most source-attested verdicts to executed
evidence — ⭐ and that is the cheapest available strengthening of this gate.

---

## 8. Gaps and untestable claims

1. ⛔ **START_FRESH DOES NOT EXIST.** Every hit is prompt copy, greeting text
   (`lib/maia/welcomeGreeting.ts:90,112`; `lib/greetings/greetingRender.ts:136`), or
   `lib/maia/prompts/memoryCanonGuard.ts`, which **forbids MAIA claiming** *"each time we talk,
   I start fresh"*. ⭐⭐ **R1 is a ruling about a mechanism that has no runtime.** R1 is not
   violated — it is **unimplemented**, and nothing today can honour or breach it.
2. ⛔ **CONTINUE does not exist in `/maia`** (NC-4).
3. ⚠️ **No referent resolver** (NC-6); capture-surface prefill uninspected.
4. ⚠️ **Post-Sanctuary-exit non-reconstruction** unprovable by static census.
5. ⚠️ **Durable-preference vs per-act reopening** (NC-8) needs a founder ruling.
6. ⚠️ **RA-3** has no test.
7. ⚠️ `app/api/oracle/conversation/route.ts:1762` carries a separate server-side `keepIntent`;
   CLAUDE.md records that route as receiving **~zero live traffic**. ⛔ Its relationship to the
   wired client seam was **not** established.

---

## 10. Standing

**J5 CENSUS COMPLETE · VERDICT MIXED** · NC-1/2/3/5/7/8 ✅ PASS (source-attested, ⛔ unexecuted) ·
NC-4 ⚠️ GAP · NC-6 ⚠️ UNATTESTED · exact referent ⚠️ PARTIAL · RA-1/RA-2/RA-3 recorded ⛔
unrepaired · START_FRESH ⛔ ABSENT · CONTINUE ⛔ ABSENT in `/maia` · qualified Keep names ⚠️ OWED,
out of scope.

⛔ **NOTHING REPAIRED. J6 NOT OPENED. PRODUCTION UNTOUCHED.**

**STOPPING FOR FOUNDER ADJUDICATION.**

> ⭐ The gate did its job: the architecture was not confirmed by argument, and it was not
> refuted. It was found **already half-built by an earlier ruling, and half-absent** — and the
> census can say which half is which.
