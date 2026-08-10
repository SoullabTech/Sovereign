# JONDI — MAIA VOICE + CONVERSATION CONTINUITY BEHAVIORAL AUDIT

**Date:** 2026-08-10
**Mode:** TEST / EVIDENCE FIRST — **no corrections applied, no instrumentation added**
**Overall result:** **C — FAILURES REPRODUCED; CORRECTION REQUIRED**
(with F2/F3 deferred to a human-driven voice pass — see §3)

---

## 1 — Environment

| Field | Value |
|---|---|
| Repository | `/Users/soullab/MAIA-SOVEREIGN` |
| Session branch (dirty, **not** tested) | `feature/labtools-redesign` @ `25db0eec9`, 342 dirty paths |
| **Build under test** | **`d2db55d7b`** — *"Merge PR #997 … feature/governance-containment"*, 2026-08-09 19:54:56 -0400 |
| Provenance of that SHA | identical to `origin/clean-main-no-secrets` **and** to the live production container (`docker exec maia-sovereign printenv GIT_COMMIT` → `d2db55d7b`) |
| Test host | Detached worktree `/Users/soullab/maia-audit-d2db55d7b`, `npm run dev` on `:3460` |
| Database | Local self-hosted PostgreSQL `maia_consciousness` (455 migrations, schema check passed) |
| Test identity | **Fixture member** `Larry Closs (Demo)` / `larry.demo` / `846b7d27-a320-42dc-87ca-84c9593ba5a9`, `onboarded=t`, `onboarding_step=complete` |
| How authenticated | Fixture row inserted into `auth_sessions` + matching `maia_session` cookie. **No password entered; no account created; Jondi's account never used.** |
| Browser | In-app Chromium 148 on macOS, 1280×720 |
| Voice configuration | Web path = **browser Web Speech API** (`ContinuousConversation` → `lib/voice/webSpeechLifecycle.ts`) |
| Microphone | **`permission: denied`, no labelled input device** |

**Baseline:** the fixture member had **0 rows** in `conversation_turns`, `member_memory_atoms`,
`reflection_capsules`, `episodes`, `conversation_memory_uses` before testing.

**Environment caveat (load-bearing):** this is a local dev server, not production. Every finding
below was therefore **re-checked against the production database** where the defect is
data-observable. Both headline findings are production-confirmed (§4, §6).

---

## 2 — Surface and vocabulary

Jondi's surface is `/maia` → `components/OracleConversation.tsx` (10,547 lines).

**Jondi's action vocabulary does not exist in the interface.** Walking every control on the
conversation surface (voice view, text view, and the Tools menu), the complete action set is:

| Rendered control | Handler |
|---|---|
| "Keep this moment — saves your exact words" | `handleKeepMoment` |
| "Keep something from this conversation" | `handleCaptureSpirit` |
| "Copy" / "Download conversation (Save as text file)" | clipboard / file export |
| "Upload files", "Soul Prompts", "Disable voice responses" | Tools menu |
| "Open The House", "Switch to speaking", "Voice input" | navigation / mode |

⛔ **There is no control labelled "Save", "Shift", or "New Pattern" anywhere on the MAIA
conversation surface.** "Shift" exists only as an *Ideas* block type (`app/maia/ideas/[id]/page.tsx:106`,
internal `block_type = 'change'`) — a **different room**. "New Pattern" matches only
`ProtocolCreator.tsx` ("New Pattern Inquiry Protocol") and an admin research panel, neither of
which is reachable from conversation.

**This mismatch is itself a finding.** Jondi is naming actions using words the interface does not
use. Until it is established what Jondi actually taps, F4b and F4c cannot be tested against the
right controls — and the possibility that Jondi is describing *Keep* (or a cross-room journey into
Ideas) is unresolved.

---

## 3 — Voice legs: NOT TESTED (deferred by decision, not by finding)

§4/§5/§6/§8 were **not executed**. The automated browser reports `micPermission: "denied"` with no
labelled audio input, and the web voice path is the Web Speech API, which requires a live audio
stream. There is no way to deliver speech without patching the page, which §19 forbids.

Per the founder's decision this session, voice legs are deferred to a **human-driven pass** (tester
speaks at a real microphone while traces are captured). **F2 and F3 are therefore
UNTESTED — neither reproduced nor refuted.** Nothing in this document should be read as evidence
that MAIA's hearing or listening re-arm is healthy.

One voice-adjacent observation, recorded but **not** causal: `POST /api/voice/openai-tts` returned
**500** twice on this local host. Local env lacks the relevant key, so this is very likely an
environment artifact — **and** the route's existence is worth a separate look given the project
invariant against OpenAI.

---

## 4 — F1: CONVERSATION CUT OFF / LOST — **REPRODUCED**

### The mechanism

Conversation turns are **not written by the server that generates the response.** The client
writes them, after it receives the response:

`components/OracleConversation.tsx:3039` → `apiFetch('/api/conversation/turns', { POST })`
→ `lib/memory/stores/TurnsStore.ts` (the only `INSERT INTO conversation_turns` in the codebase).

Consequence: **the member's own words are never persisted at send time.** User turn and MAIA turn
are written together, as one exchange, only once the client is still alive to write them. Observed
directly — both rows share one `exchange_id`, `seq` 0/1, and an identical `mintedAt`:

```
18:11:18.200 | user      seq0 | ex=e555ba9c | AUDIT-TURN-2: What was the codeword I gave you?
18:11:18.203 | assistant seq1 | ex=e555ba9c | ALPINE.
```

### The reproduction

Turn submitted via the real "Send message" button, then navigation 250 ms later:

- Server log: **`POST /api/sovereign/app/maia/list 200 in 1495ms`** — the server completed the turn **successfully**.
- Database: **`SELECT count(*) … content ILIKE '%OBSIDIAN%'` → 0.**
- UI after return: the turn is **absent**.

**The member typed a message, the server processed it and answered, and both the question and the
answer were destroyed — with no error, no warning, and no trace.** This is silent loss.

### First broken transition

```
USER TURN SUBMITTED  →  server responds 200
                     →  [client unloads before it can issue the write]
                     →  POST /api/conversation/turns NEVER ISSUED
                     →  user turn AND MAIA turn both lost
```

This matches Jondi's report 1 ("conversation is cut off and good conversation is lost") and is
consistent with the *shape* of report 4. The window widens with response latency — turn 1 in this
session showed **34.6 s** turn latency, and DEEP-tier turns are slower still. Jondi failing "once
they start cooking" fits a mechanism whose exposure grows with how long MAIA takes to think.

---

## 5 — F4a: SAVE (= Keep) — **NOT REPRODUCED**

Keep was traced end to end and is sound.

| Check | Result |
|---|---|
| Request fires | yes |
| What persists | `episodic_memories` id **29** |
| Destination | `verbatim_text` = exact member words; `marked_by_member = **true**` |
| Conversation identity | `source_session_id = session_1786399709147` — **unchanged** |
| Conversation after Save | **intact**; no navigation occurred |
| Discoverable? | **yes** — "Your moments" link, verified by walking to it; the kept words render, dated |
| Retrievable after return | **yes** — conversation and kept moment both survive |

Destination and retrievability were **proven by walking to the surface**, not inferred from a toast.
The "Your moments" page states its own contract plainly: *"Nothing here is titled, sorted, or
interpreted, and no one else can see this page."*

**Minor observation (not a failure):** after reload, the "Kept" marker does not re-render on the
kept turn — the transcript shows "Keep this moment" again, though the kept moment persists
correctly. The *record* is fine; the *acknowledgement* is not restored.

**F4b (Shift) and F4c (New Pattern): UNTESTABLE — the controls do not exist on this surface (§2).**

---

## 6 — DUPLICATE EXCHANGE WRITE — **REPRODUCED, AND PRODUCTION-CONFIRMED**

Not in Jondi's four reports, found while testing. **One submission produced two complete exchanges:**

```
18:15:03.295 | user      seq0 | ex=0c33a480 | AUDIT-TURN-4 … Codeword CEDAR.
18:15:03.299 | assistant seq1 | ex=0c33a480 | CEDAR — held. What's on your mind.
18:15:03.643 | user      seq0 | ex=72a0fa19 | AUDIT-TURN-4 … Codeword CEDAR.   ← duplicate
18:15:03.644 | assistant seq1 | ex=72a0fa19 | CEDAR — held. What's on your mind.
```

Distinct `exchange_id`s 348 ms apart; the network trace shows `POST /api/sovereign/app/maia/list`
firing twice. The duplicate is **member-visible**: after reload the transcript renders the turn twice.

**Production check — this is not a local artifact:**

```
distinct (user_id, content) pairs with >1 exchange_id, last 30 days  →  120
```

That is a real, live defect affecting real members' transcripts.

---

## 7 — Other verified results

| § | Test | Result |
|---|---|---|
| 3 | Baseline text continuity, multi-turn | **PASS** — MAIA recalled the codeword ALPINE across turns |
| 12 | Navigate away → return | **PASS** — full transcript restored via `GET /api/conversation/turns` |
| 13 | Reload during idle | **PASS** — transcript restored (including, faithfully, the duplicate) |
| 14 | Persistence trace | user + MAIA written together, client-issued, **after** response |
| 7 | Voice ↔ text mode switch | conversation identity `session_1786399709147` unchanged across switches; **no** competing conversation minted |

---

## 8 — Additional defect found: missing table, **in production**

Every MAIA turn logs, non-blocking:

```
❌ [POSTGRES] Query error: relation "lattice_nodes" does not exist
⚠️  [MEMORY] Recall failed (non-blocking)
   at ConsciousnessMemoryLattice.resonanceRecall → getMaiaResponse (maiaService.ts:2657)
```

`grep` finds **no migration that creates `lattice_nodes`**, and production agrees:

```
production:  SELECT to_regclass('public.lattice_nodes')  →  (null)
```

**Memory recall via `ConsciousnessMemoryLattice` is failing on every turn in production.** It is
caught and non-blocking, so it degrades silently. Every observed turn logged `MEMORY_HEALTH: 'low'`.
Whether this materially thins what MAIA recalls is **not established here** and should not be
assumed either way — but it is a live, silent failure on the memory path.

(Also observed locally only, and almost certainly an env artifact: `[MythicAtlas] ECONNREFUSED`.)

---

## 9 — Required classification (§20)

| Failure | Classification |
|---|---|
| **F1** — conversation cut off / lost | **REPRODUCED** — silent, total loss of a submitted exchange on navigation-before-write |
| **F2** — MAIA stops hearing | **UNTESTED** — deferred to human-driven voice pass |
| **F3** — voice activation fluctuates / stalls | **UNTESTED** — deferred to human-driven voice pass |
| **F4a** — Save (Keep) loses continuity | **NOT REPRODUCED** — Keep is sound, destination discoverable |
| **F4b** — Shift loses continuity | **UNTESTABLE** — no such control on this surface |
| **F4c** — New Pattern loses continuity | **UNTESTABLE** — no such control on this surface |
| *(unreported)* duplicate exchange write | **REPRODUCED + PRODUCTION-CONFIRMED (120/30d)** |
| *(unreported)* `lattice_nodes` missing | **CONFIRMED IN PRODUCTION** |

---

## 10 — What is proven / what remains unknown

**Proven**
1. A submitted turn that the server answers with 200 can be lost entirely — question and answer — if the client navigates before issuing the client-side write. No error surfaces.
2. Persistence is client-issued after the response (`OracleConversation.tsx:3039` → `TurnsStore.ts`); nothing is written at send time.
3. One submission can produce two exchanges; 120 such cases exist in production over 30 days.
4. Keep persists verbatim, `marked_by_member = true`, preserves conversation identity, and its destination is reachable.
5. Navigation and reload otherwise restore conversation correctly.
6. No "Save"/"Shift"/"New Pattern" control exists on the conversation surface.
7. `lattice_nodes` does not exist in production; memory recall fails silently every turn.

**Unknown**
- Everything about voice (F2/F3): mic re-arm, TTS→listening transition, interruption, long-session stalling.
- Whether Jondi's "cut off" is *this* loss window or a voice-specific one.
- What Jondi actually means by save / shift / new pattern.
- Whether the duplicate write and the loss window share a cause (both touch the submit path).
- Whether missing `lattice_nodes` measurably degrades recall.

---

## 11 — Recommended bounded correction units (NOT executed)

Proposed only; §19 honoured — nothing was changed.

- **U1 — Persist the user's turn at send time.** Write the user turn before/independently of the response, and make the exchange write survive unload (`sendBeacon` / `keepalive`). Closes F1's loss window. *Highest value; matches Jondi's loudest complaint.*
- **U2 — Idempotent exchange submission.** Client-side submit guard plus a server-side idempotency key on `exchange_id`. Closes the duplicate write. Consider a separate decision on the 120 existing production duplicates — **do not delete member content without a founder ruling.**
- **U3 — Human-driven voice pass** for F2/F3, per the deferred plan.
- **U4 — Resolve `lattice_nodes`**: add the missing migration or retire the caller. Decide deliberately — per the capability-preservation rule this is a *description and wiring* question, not an invitation to delete.
- **U5 — Bind Jondi's vocabulary to real controls** before attempting F4b/F4c.
- **U6 — Restore the "Kept" acknowledgement** on reload (cosmetic).

⛔ **Per §19 and §21, none of the above is authorized by this audit.** One successful conversation
is not proof of reliability, and no fix should be called done until F1 is re-tested under the same
navigation race and the voice pass has run.

---

## 12 — Test residue (cleanup notes)

Created on the **local** database only — production untouched:
- `auth_sessions` fixture row, token prefix `jondiaudit20260810…` (expires 2026-08-12)
- 8 `conversation_turns` rows + 1 `episodic_memories` row (id 29) on the fixture member
- Worktree `/Users/soullab/maia-audit-d2db55d7b`; launch config `jondi-audit` (:3460)
