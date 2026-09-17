# MAIA-MAVEN-T1A — J5 REMEDIATION RERUN

**Date:** 2026-09-17
**Gate:** J5 — negative-control falsification
**Canonical base:** `clean-main-no-secrets` @ `2e82ca9f10128c034956c974f4c6501f811035e7`
**Branch:** `chore/t1a-j5-repair-20260917`
**Standing:** **FAIL — two witnessed defects repaired on branch; ambient REOPEN remains live; exact-referent speech path remains unclosed**
**Implementation:** contained branch only · ⛔ not merged · ⛔ not deployed · ⛔ J6 unopened

---

## 0. What this rerun is allowed to prove

The prior J5 census returned a decisive FAIL. Founder adjudication authorized one bounded remediation sequence:

1. integrate the already-attested LF-SCOPE-01 containment repair;
2. author the KEEP / CONTINUE speech-act contract;
3. repair the capture/recognition seam without implementing a CONTINUE persistence substrate;
4. rerun the J5 negative controls;
5. stop before J6 if any control remains red or unattested.

This record is the stop record. It does not authorize the newly discovered REOPEN repair.

---

## 1. Canonical movement handled before evidence

The lane began on canonical `83fce8ed`. Before publication, `clean-main-no-secrets` advanced to `2e82ca9f` through three JARVIS-documentation commits.

Mechanical comparison:

- files changed by canonical advancement: `CLAUDE.md`, `docs/programme/JARVIS_INSTRUCTIONAL_MANUAL_v1.md`;
- overlap with this lane: **0 files**;
- repair branch rebased cleanly onto `2e82ca9f`;
- the discriminating 118-test set and typehealth gate were rerun **after** that rebase.

No stale-base PASS is claimed.

---

## 2. Remediation A — Living Field containment

Prior attested source: `6adbc3bb5e10fac9c1aa6253e0800329a0d7286c`.

Current contained integration: `4d65c39a4`.

The pre-repair blobs of all three affected canonical runtime files were byte-identical to the LF-SCOPE parent when audited, and canonical's later movement touched none of them. The exact attested containment semantics therefore integrate without reinterpretation:

- `memory_scope = 'personal'` on the personal Living Field path;
- practitioner-attribution guard;
- member-response rejection guard;
- existing sacred/protected/status guards preserved;
- all three reads covered: counts, gathering, and `encounterContext.ts` cognition feed;
- no write, schema, migration, affinity mutation, or `/maia` visual change.

Focused containment suite after rebase: **21 / 21 PASS**.

See `LF-SCOPE-01_CANONICAL_INTEGRATION_WITNESS_2026-09-17.md`.

---

## 3. Remediation B — KEEP / CONTINUE recognition

Contract: `5fb816fef` — `MAIA-MAVEN-T1A_J5_SPEECH_ACT_CONTRACT_2026-09-17.md`.

Implementation: `6fda1bd90`.

Canonical previously exposed only `keep_material | open_keep`, so CONTINUE-shaped language was absorbed into KEEP before availability was consulted.

The bounded repair now represents an ordered set of governed acts:

```text
KEEP · CONTINUE · OPEN_KEEP
```

with resolution vocabulary:

```text
RESOLVED · AMBIGUOUS · ORDINARY
```

The recognizer remains deterministic, pure, non-consuming, and persistence-free.

Measured after repair:

| Utterance | Result |
|---|---|
| `keep this` | KEEP |
| `keep this open` | CONTINUE |
| `keep this question open` | CONTINUE |
| `can we keep this question open?` | CONTINUE |
| `keep that open` | CONTINUE |
| `leave this open` | CONTINUE |
| `come back to this` | CONTINUE |
| `Keep this and leave it open` | KEEP + CONTINUE |
| `keep this door open` | ORDINARY |
| `keep this in mind` | ORDINARY |
| `keep going` | ORDINARY |

The runtime consumer now checks KEEP, CONTINUE and OPEN_KEEP independently. CONTINUE has no Keep fallback, opens no Keep panel, performs no persistence, and does not consume the conversational turn. MAIA's authored platform map and memory speech-act boundary now teach the same distinction before generation.

Focused recognizer + wiring tests: **72 / 72 PASS**.

---

## 4. Candidate generation remains non-persistent

The generic conversation-level Keep doorway opens `CaptureSpiritPanel` through `/api/capsules/from-chat-window`.

The route's authority split is explicit and mechanically preserved:

```text
OPEN KEEP     → zero persistence
PREPARE KEEP  → distilled preview, zero durable write
CONFIRM KEEP  → separate member action may persist
```

`/api/capsules/from-chat-window` deliberately imports no `createCapsule` and returns an unsaved draft with no id.

The direct member-message affordance is a different, exact path: `Keep this moment` posts the member's verbatim message text to `/api/sovereign/episodes/mark` only after the member clicks the affordance. The route stores `verbatim_text` byte-for-byte and forbids interpretive fill.

`keepOpenNonPersistent.test.ts` participates in the green 118-test rerun below.

### Latent conversational-Keep note

`KeepAffordance` still contains historical `filed / filing_confirmation / offer` vocabulary, but the current `OracleConversation` only imports it; it is not rendered, and `NEXT_PUBLIC_CONVERSATIONAL_KEEP_ENABLED` is defined but has no live use site. It is therefore **latent, not counted as a current J5 crossing**. No claim is made that the latent design conforms if reactivated.

---

## 5. ⭐ New decisive finding — REOPEN is ambient on canonical

The rerun traced the prior-continuity crossing rather than assuming the repaired KEEP/CONTINUE seam was the whole problem.

It is not.

### 5.1 The present gate

In the live sovereign route:

```ts
const allowCrossSessionMemory = isRecognizedUser && !isSanctuary;
```

For recognized users, memory mode defaults to `continuity` unless another mode is supplied. The client itself sends `continuity` unless local storage explicitly requests `longterm`.

No deliberate member REOPEN act participates in that decision.

### 5.2 The crossing is broader than MemoryBundle

`memoryMode === 'ephemeral'` can suppress the MemoryBundle leg, but it does **not** establish START_FRESH semantics for the rest of the route.

Later, this block runs on:

```ts
if (allowCrossSessionMemory && userId) { ... }
```

and can load, among other prior material:

- developmental memory / theme signals;
- `member_memory_atoms`;
- prior cross-session exchanges (`conversationalRecallAddendum`);
- member-marked episodic recall.

Separately, Member Live Context loads whenever:

```ts
isRecognizedUser && !isSanctuary
```

Therefore identity + ordinary non-Sanctuary posture currently authorize multiple prior→present crossings. `ephemeral` is not a universal refusal of those crossings.

### 5.3 Why existing consent is not REOPEN authority

The atom loader has real and valuable eligibility gates (`return_preference`, scope, status, sacred protection, member response, attribution). Conversational and episodic recall also carry opt-out/preferences.

Those gates answer:

> Which prior material is eligible if a crossing is authorized?

J4's REOPEN law asks a different question:

> Did the member deliberately authorize prior continuity to cross into this encounter?

Prior eligibility/consent does not itself supply the present REOPEN act.

### 5.4 Representation Authority disposition

`isRecognizedUser`, non-Sanctuary posture, and default `memoryMode = continuity` are presently functioning as an authority substitute for REOPEN.

They may legitimately establish identity, privacy posture, and eligible memory mode. They do not, under the ratified T1A contract, constitute the member's deliberate retrieval instruction.

**Result: ambient REOPEN is a live canonical non-conformance.**

The explicit relationship-context handoff is a useful contrast: it requires `relationshipContextId` from a member handoff and does not use ambient fallback. That path already demonstrates the shape of a deliberate crossing without authorizing a repair here.

⛔ No REOPEN repair is made in this tranche.

---

## 6. Exact referent — still not closed for spoken `Keep this`

The system has an exact, member-controlled per-message Keep path: member-authored message → explicit `Keep this moment` click → verbatim episodic mark.

The spoken language path is different. `keep this` can establish the **KEEP act**, but the deictic word `this` does not by itself prove which material the member selected. The generic conversation-level doorway prepares a reviewable/distilled chat-window draft rather than an exact referent.

That is safe from silent persistence because preparation writes nothing and later persistence requires another member act. It is **not sufficient evidence** to declare J4's `exact referent before interpretation` closed for spoken Keep.

This is where the still-owed R8 qualified-Keep scope matters: the system has at least an exact member-message Keep and a wider reflection/capsule Keep-like flow. J5 is not authorized to collapse those into one referent or mint their final names.

**Disposition: UNATTESTED / R8-dependent, not silently passed.**

---

## 7. J5 negative-control rerun

| Control | Verdict | Evidence / reason |
|---|---|---|
| **NC-1 ENCOUNTER must not become KEEP** | ✅ PASS on inspected Keep crossing | recognizer is pure/no-I/O; generic open/prepare is zero-write; direct exact mark requires member click |
| **NC-2 KEEP must not become REOPEN** | ⛔ FAIL by independent ambient crossing | on a normal recognized turn, prior material may already enter without any REOPEN instruction; the repaired Keep recognizer is not the cause |
| **NC-3 REOPEN must not become KEEP** | ⚠️ UNATTESTED | there is no governed explicit REOPEN recognizer/path to exercise end-to-end; no false PASS inferred from absence |
| **NC-4 CONTINUE must not fall back to KEEP** | ✅ PASS | measured CONTINUE phrases no longer return KEEP; runtime CONTINUE branch has no Keep affordance/persistence |
| **NC-5 Sanctuary = ENCOUNTER ONLY** | ✅ PASS on T1A inspected seams | Sanctuary blocks cross-session retrieval and all Keep affordances inspected; see test note below |
| **NC-6 MAIA must not become selector** | ⚠️ UNATTESTED for spoken referent | direct per-message Keep is exact; spoken `this` still routes to a reviewable candidate surface rather than proving exact referent |
| **NC-7 candidate generation must not become selection** | ✅ PASS | from-chat-window preparation creates no durable row/id; confirmation remains separate |
| **NC-8 conversational relevance / system state must not become REOPEN authority** | ⛔ **FAIL** | recognized + non-Sanctuary posture ambiently enables multiple prior-continuity producers without a present member REOPEN act |

A J5 gate with NC-2 and NC-8 red cannot advance.

---

## 8. Test and static evidence after rebase

### Green discriminating set

```text
keepIntent recognition .......................... PASS
keepIntent response wiring ..................... PASS
Living Field scope containment ................. PASS
platform knowledge / voice wiring .............. PASS
Keep open / prepare zero-persistence ........... PASS
-----------------------------------------------------
5 suites · 118 tests ............................ PASS
```

### Typehealth

```text
program files  4372
errors         229
baseline       239
regressions    0
result         PASS
```

Provider/no-Supabase governance also passed during the implementation commit hook.

### Existing Sanctuary test drift — not attributed to this lane

A six-suite Sanctuary/Keep cluster produced **58 PASS / 2 FAIL**. Both failing assertions were then executed on untouched canonical `2e82ca9f`'s source lineage (base check at `83fce8ed`, with no intervening overlap) and failed identically:

1. `episodes/mark/__tests__/sanctuaryGuard.test.ts` still expects a raw first-eight member-id prefix, while runtime logging now correctly emits hashed `memberRef`.
2. `components/__tests__/sanctuaryCaptureRefusal.test.ts` searches for the obsolete literal JSX substring `{!isSanctuary &&`; current rendering uses a compound guard.

The other four suites in that cluster passed. These two are pre-existing assertion drift, not introduced by this repair. They are **not repaired here** because that would widen the lane.

---

## 9. Gate disposition

```text
LF-SCOPE containment branch repair ............. ✅ GREEN
CONTINUE → KEEP recognition repair ............. ✅ GREEN
KEEP candidate generation → persistence ........ ✅ REFUSED / GREEN
spoken Keep exact referent ..................... ⚠️ UNATTESTED · R8-dependent
explicit REOPEN path ........................... ⛔ ABSENT / UNATTESTED
ambient prior→present crossing ................. ⛔ LIVE NON-CONFORMANCE
NC-2 ........................................... ⛔ FAIL
NC-8 ........................................... ⛔ FAIL
J5 ............................................. ⛔ FAIL
J6 ............................................. ⛔ UNOPENED
merge .......................................... ⛔ NOT PERFORMED
deploy ......................................... ⛔ NOT PERFORMED
production ..................................... UNTOUCHED
```

## 10. Stop

The next lawful question is no longer a Keep-regex question.

It is the REOPEN authority boundary:

> What single deliberate member act authorizes prior continuity to cross into the present, and how must every memory producer prove that act before contributing generative context?

That requires a new founder act / contained contract. This lane stops here.
