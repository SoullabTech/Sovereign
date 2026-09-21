# VOICE-2026 — Claim-state reconciliation (2026-09-21)

**Status:** records-only reconciliation. This file changes no runtime, threshold, acceptance law, provider policy, platform routing, migration, or device state.

**Record-of-record base:** `feature/voice-2026-record-of-record-20260916 @ 4e2600a406712bbfae6c6cdad2d21401bedb9554`.

**Canonical application read:** protected `clean-main-no-secrets` was read at `80f57df75f045710e8dd5de337a4d293830f682e` on 2026-09-21. The voice product merges named below are ancestors of that canonical head.

This record updates the dated 2026-09-15 claim-state without rewriting it. The central correction is that two distinct programmes must not be collapsed:

1. **MAIA product voice** — the shared Web/PWA/Desktop/iOS/Android conversation runtime and its current turn-taking, transcription and TTS behavior.
2. **VOICE-2026 native VoiceKernel** — the new iPhone audio-organism qualification programme under KERNEL-00.

Progress in one does not automatically move the other.

---

## 1. Product-voice changes now canonical

The following product work landed after the 2026-09-15 claim-state:

- PR #1328 · merge `fb391f20fbba91c082bde6578a9e9a8720786194` · Desktop beta shell + sovereign live transcription. Provisional text is display-only; final transcript remains the sole committed authority. Merge record: focused voice 25/25, Desktop 358/358. The PR explicitly left a real production microphone witness owed.
- PR #1330 · merge `445a4d1a6f9a673231d12b9d5ab02519100e4fff` · TURN-01 Conversational Space + explicit floor control + Desktop completion path. Merge record: focused voice/turn/provenance 90/90, Desktop 358/358. A real production microphone walk remained owed.
- PR #1334 · merge `8b80ec21060a102ee2007d12f3182049c7c6ad43` · preserved the Safari interim-finalization / silent-response handoff repair and records an exact production deployment witness on 2026-09-17 at that SHA.
- PR #1369 · merge `5b5683048c75087f8bc611fb55e6628cf2983687` · removed the ambiguous bare “I’m done” soft-crisis collision and changed the member-facing explicit-yield control to **Pause**, preserving the underlying floor authority.
- PR #1371 · merge `83b8ab8142350e0c5c02ecd1249d92d46de6170f` · reconciled production hands-free authority with canonical.
- PR #1380 · merge `297ab2d3b50e62b8ffc1bb6659200b3f457d0aef` · explicit-floor intentional silence may no longer be reclassified as capture death by the 15 s liveness watchdog; genuine recognizer death remains boundedly detectable.
- PR #1390 · merge `c6ed841f8ebc378031b5c3fa0262e367a42dc3e8` · TURN-02 one-token automatic recovery from genuine hands-free `silent_death`, replenished only after actual `onresult`; second death before proof of life fails closed.

These merges materially advance the product layer but do **not** establish cross-platform acceptance by themselves.

### Production reachability of the Sept. 18 voice repairs

A later founder-run authenticated production member witness for MAIA Teaching Intelligence records production runtime `1faec40167fcbb5e4feb5bf97d2386df2192c4b4` on 2026-09-21. Git ancestry independently shows all four late product-voice repair merges below are ancestors of that runtime with zero commits behind:

- `5b568304…` · Pause / crisis-speech disambiguation;
- `83b8ab814…` · hands-free authority reconciliation;
- `297ab2d3…` · explicit-floor liveness preservation;
- `c6ed841f…` · bounded automatic silent-death recovery.

Therefore those repairs had reached the production application lineage by the `1faec401…` witness. This establishes **production reachability**, not a complete voice acceptance walk: the teaching witness did not exercise microphone capture, floor timing, TTS handoff, re-arm, or the 10-turn product matrix.

---

## 2. Platform claim table — highest state licensed on 2026-09-21

| Platform / layer | Highest state supported by this record | Evidence | Still owed |
|---|---|---|---|
| **Web / Safari / PWA** | **LIVE · production lineage includes the Sept. 18 TURN-01/TURN-02 repairs** | PR #1334 records exact-image production deployment at `8b80ec210…`. A later authenticated production witness names runtime `1faec401…`, and ancestry proves `5b568304…`, `83b8ab814…`, `297ab2d3…`, and `c6ed841f…` are all ancestors. | Product acceptance is still owed: production reachability is not the P1–P10 + 10-turn microphone/TTS/re-arm witness. |
| **Desktop / Mac app** | **CANONICAL BETA IMPLEMENTATION · device/runtime acceptance incomplete** | #1328 and #1330 are canonical: native/Desktop capture, rolling sovereign transcription, final-only transcript authority, Conversational Space, explicit floor completion. | Exact installed app identity and a real microphone conversation walk on the current build. The merge records themselves explicitly left that witness open. |
| **iOS MAIA product app** | **SHARED PRODUCT REPAIRS PRESENT · current-device parity NOT PROVEN** | TURN-01/TURN-02 behavior lives in the shared conversation runtime and is canonical. | A post-Sept-18 native/TestFlight build identity plus an on-device acceptance walk. Do not infer this from shared-code ancestry alone. |
| **iPhone native VoiceKernel** | **QUALIFICATION PROGRAMME ACTIVE · KERNEL-00 NOT ACCEPTED** | Record-of-record through `4e2600a406…`: ENTRY-05 green; SOURCE-03 completed; C0 evidence exists; C1 implementation/pins exist; C2 and C3-C5 designs exist. | Source level calibration / fresh attributable source population; C1 device population; C2 core-fault witnesses; C3 route matrix; C4 interruption/reset/lifecycle; C5 endurance; 18-row all-PASS packet; founder KERNEL-00 ruling. |
| **Android** | **NOT PROVEN on the completed product/native stack** | Shared web/runtime code exists. | Current Android build/runtime identity and the same acceptance walk. No Android VoiceKernel acceptance exists. |
| **Canonical MAIA cognition behind voice** | **PRESERVED BY LAW / TEST CONTRACT** | The non-degradation contract requires spoken and typed turns to converge before cognition. | Every platform witness must continue to show that transport differences do not create a different MAIA mind. |

---

## 3. What “finished voice” means

The programme is complete only when **both** of these are true:

### A. Product voice acceptance
For every supported member platform, an exact build/runtime identity passes the same human conversation protocol:

1. explicit voice entry arms capture;
2. live/provisional text never becomes a committed turn by itself;
3. a normal spoken turn commits once;
4. a long reflective silence does not steal explicit floor ownership;
5. Pause explicitly yields the floor;
6. MAIA speaks through the governed TTS policy;
7. automatic mode re-arms after MAIA finishes;
8. a genuine capture death recovers once only under the bounded TURN-02 law, then fails closed if proof of life never returns;
9. interruption/background/device-loss behavior is truthful;
10. spoken and typed turns converge into the same MAIA cognition and memory/consent rules.

Passing one surface does not accept another.

### B. Native VoiceKernel acceptance
KERNEL-00 must reach its ratified terminal state: K00-01…K00-18 all explicitly present and **PASS**, with 0 FAIL, 0 WARN, 0 SKIP, 0 MISSING, bound to exact organism/build/device/journal identity. Only a subsequent founder act may open BRIDGE-01.

---

## 4. Native frontier after the SOURCE-03 read

SOURCE-03 is not “stimulus absent.” At the consumed seam the gated 997 Hz fixture is present, but only 9–15 dB above controls against the predeclared 20 dB visibility bar. The 2 Hz gate signature is present. The historical ten rows remain `UNMEASURED-SRC` forever; the threshold is not softened.

The next lawful source act is therefore **SOURCE LEVEL-CALIBRATION-01**, records/design first, followed only by separately authorized execution. Its purpose is to establish a source-level/geometry pin that clears the existing V1 law prospectively, not to reinterpret old rows.

---

## 5. Sentence of record

> **MAIA’s product voice has moved materially beyond the 2026-09-15 state: Safari/PWA has a deployment-witnessed repair; the Sept. 18 Pause, hands-free, explicit-floor-liveness and bounded silent-death-recovery repairs are all in the production lineage witnessed at runtime `1faec401…`; and Desktop live transcription/member-owned turn-taking are canonical. Cross-platform product acceptance is still incomplete. Separately, the native iPhone VoiceKernel remains under KERNEL-00 and is not accepted or bridged into production.**

This is a records statement, not a deployment or acceptance act.
