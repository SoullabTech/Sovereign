# MEMORY-DIVINATION-BETWEEN-ROOM-01 — Lane Record

**Programme**: `docs/programme/MAIA_JARVIS_MEMORY_ORGANISM_FULL_OPERATIONALIZATION.md` (Track A, Pass 1)
**Predecessor**: `docs/programme/JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01.md` (merged, canonical `b7d3dacf9`)
**Branch**: `claude/memory-divination-between-room-01`, cut from canonical `clean-main-no-secrets @ 774f02e14`
**Authorized**: founder, 2026-09-04, after the live-surface scope finding below.
**Status**: BUILD complete · gates green · **not deployed** · awaiting founder review → lane deploy → production witness.

**Mission**: make the already-certified durable divination memory participate truthfully in the live `between` MAIA room, using the existing loader, producer identities, MIPA vocabulary, consent boundaries and cognition seam. No new memory architecture.

---

## 1. The finding this cut answers

Proof 9 for the Pass 1 divination cut could not close, and the reason was not a defect in the loader.

```text
2026-09-04 13:52:25   signed-in cast at /oracle/iching, Save not pressed
                      [oracle/iching] reading persisted { memberRef 88099bb1977c,
                      readingId 1e098ab3-…, primaryHex 55 }          ← Cut 1C PASS
2026-09-04 13:52:49   the member's conversation turn goes to /api/between/chat
                      → no divination-block, no shadow line, no recall
```

Production census, `agent_runs` over seven days (roughly eight rows per turn):

| Route | rows | last turn |
|---|---|---|
| `/api/sovereign/app/maia/list` | 1069 | 2026-09-04 00:51:47 |
| `/api/between/chat` | 48 and climbing | 2026-09-04 14:05:23 |

The Pass 1 wiring landed on `/list`; the member is talking on `between`. The durable reading existed and was unreachable from the room she was in. Founder ruling: *"Do not go hunting for some page that still posts to `/list` just to make Proof 9 turn green. That would prove the cut on a route, not prove memory continuity on the MAIA surface you are actually using."*

## 2. Route census — what `/api/between/chat` actually exposes (canonical `774f02e14`)

Run before binding any witness to this route, per the founder's instruction not to invent a `/list`-style requirement.

| Aspect | Finding |
|---|---|
| Canonical turn construction | **absent** — zero references to `constructCanonicalTurn` / `canonical-turn` in 2,665 lines |
| `[MAIA/shadow]` instrument | **absent** — no zero-diff requirement can be bound to this route today |
| Identity | server-authoritative: `getCurrentSession()` → `authUserId`; in production a body id is never trusted (`TRUST_BODY_ID` is dev-only), unauthenticated resolves to `anon:<sessionId>` |
| Sanctuary | `isSanctuary` from the request; the memory-orchestrator block already gates on it |
| Memory loads present | significant moments, memory atoms, developmental memories, theme signals, memory-influence plan, forward readiness, selflet, relationship memory, knowledge gate, field wisdom |
| Divination | **absent** — no loader, no addendum |
| Addenda seam | route `context` → `generateMaiaTurn` → spread into `meta` → `getMaiaResponse`; `maiaService` already reads the three divination keys from `meta` (Pass 1 cut), so no new formatter or reader is needed |
| Profile | `processingProfileOverride: 'BETWEEN'` is trace-only (`maiaService.ts:3763`); turns still route FAST/CORE/DEEP, all three of which already carry the divination addenda |

**Consequence for the witness**: this cut requires no shadow zero-diff on `between`, because no shadow exists there. The canonical-turn certification is done at fixture against `ROOM_POLICIES.between`; the production witness binds to the route's own marker and to MAIA's answer.

## 3. Changes

| File | Change |
|---|---|
| `lib/maia/canonical-turn/producerRegistry.ts` | the three divination producers gain `'between'` in `rooms`. Axes, `consentBasis`, `requires`, `scope`, `mandatory` untouched |
| `app/api/between/chat/route.ts` | load + format inside the existing recognized-member, not-Sanctuary gate; `[MAIA/between] divination-block` marker; three keys through `safeAddenda` into the route `context` alongside the other addenda |
| `lib/maia/canonical-turn/__tests__/divinationBetweenRoom.test.ts` | **new** — registry scope, axes unchanged, MIPA in the between room, Sanctuary, anonymous, manifest evidence, three-authorship separation |
| `lib/maia/canonical-turn/__tests__/divinationParticipation.test.ts` | three superseded pins updated in place (room scope was `['sovereign_chat']` when Pass 1 landed); the not-registered-room case now uses `now_what` |

No new loader, no second formatter, no schema change, no writer, no migration, no idempotency machinery.

## 4. Acceptance

Certified at fixture by the new suite:

| # | Property | Pinned by |
|---|---|---|
| 3 | the loader is reused, not duplicated | route imports `divinationRecallLoader`; no second formatter exists |
| 4 | three authorships remain separable | member text only in the member block, corpus framed as corpus, cast framed as computed |
| 5 | admitted material reaches cognition on the between room | MIPA `ADMITTED eligible` ×3 in `ROOM_POLICIES.between`; cast text carries hexagram, relating hexagram, changing lines |
| 6 | no Sanctuary / identity / consent regression | Sanctuary → `HELD sanctuary` ×3; anonymous → `EXCLUDED no_verified_member` ×3; requirements unchanged from Pass 1 |
| 8 | no second writer or duplicate persistence | this cut touches no write path |

Production witness, still owed:

| # | Property | How |
|---|---|---|
| 1 | authenticated cast persists without Save | already witnessed 13:52:25, `primaryHex: 55` |
| 2 | the ordinary turn is served by `/api/between/chat` | edge log or `agent_runs.origin_route` |
| 7 | MAIA names 55 / Abundance without the member supplying it | her reply, checked field by field against the persisted row |

Gates on this branch: `npm run typecheck` exit 0, no regressions · 88 tests across the divination, canonical-turn and oracle suites · locally reported, not CI-certified (this branch carries no GitHub status contexts).

## 5. Open question this cut does not answer

Whether `getCurrentSession()` resolves the member on `/api/between/chat` in production. If it does not, `effectiveUserId` is `anon:<sessionId>`, the gate correctly refuses, and no divination participates — which would be an identity finding on the between surface, not a defect in this cut. Read-only check while the reading from 13:52 is still inside the 60-day window:

```bash
ssh soullab@minisforum 'docker logs -t maia-sovereign --since 2h 2>&1 | grep -E "\[MAIA CONTEXT\]" -A 3 | grep -E "recognized|effectiveUserId" | tail -6'
```

`recognized: true` means the witness can pass. `recognized: false` makes the identity question the next cut, ahead of any further divination work.

## 6. Witness protocol after deploy

```bash
# the between-room marker, per turn (counts only, never content)
ssh soullab@minisforum 'docker logs -t maia-sovereign --since 15m 2>&1 | grep -A 9 -E "MAIA/between\] divination-block|\[Divination\]" | cut -c1-260'
```

Expected on a member turn with the 13:52 reading in the window: `[MAIA/between] divination-block { candidateCount: 1, emitted: true, surfacedCount: 1, intentChars, castChars, interpretationChars, userId }`, then MAIA naming hexagram 55 and its transformation to 13 without being told.

## 7. Exclusions honoured

NO CMT redesign · NO Attribution/P6 · NO divination schema change · NO second persistence writer · NO 280-char conversational clip repair · NO Continuity Mode change · NO widening of unrelated producers · NO M3 cutover · NO deploy from this branch.
