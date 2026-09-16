# JARVIS-CONTINUITY-REMAINDER-01 · ACT 5 · Production witness procedure

**Date:** 2026-09-15
**Deploy subject:** `762c3c4ed` on production base `e57ca1baa`
**Witness identity:** `SEL-W1` · new act; prior C1-BRIDGE-02 W1 remains spent.
**Production precondition:** running `GIT_COMMIT=762c3c4ed` by both Config.Env and printenv.

## 1. Purpose

Test the repaired selection law through the real serving route on a fresh guest session. This is not a replay of the failed W1 and does not reuse its corpus.

The witness tests one claim only:

> An opaque paraphrase may continue the immediately preceding unresolved retrieval episode and recover the object named by the nearest grounded MEMBER ask, without relying on exact wording overlap or assistant-carried object content.

`S` is not spent. First-ask opaque memory remains out of scope.

## 2. Exact pre-witness sequence

Serve these six member turns, in order, on one new guest session:

```text
0  Silver cedar is an image that's been on my mind today.
1  The room feels quiet this evening.
2  I'm noticing the weight of my feet on the floor.
3  There is a soft hum from the computer beside me.
4  I want to stay with this simple moment for a little while.
5  Do you remember me saying something about silver cedar?
```
At the final witness serve, the marker at `0` is displaced under both supported tiers:

- FAST aperture 3 → active prefix `[3,4,5]`, displaced includes `0`;
- CORE aperture 4 → active prefix `[2,3,4,5]`, displaced includes `0`.

Turn `5` is the nearest and only grounded retrospective source in that active prefix. Its member-authored object anchors are `silver · cedar`.

## 3. SEL-W1 act

Send exactly:

> What was that phrase I mentioned earlier?

Do not rephrase or retry. The first serve is the witness.

PASS requires all of:

```text
Processing Profile      FAST or CORE
L1/bridge recovered     indices contains 0
via                     contains 5 for the recovered target
MAIA response            identifies silver cedar
```

The bridge result must not depend on an assistant-only carrier. Any result that omits `0` is a FAIL even if the surface answer is satisfying.
## 4. Stop law

FAIL if any of:

- bridge abstains on SEL-W1;
- bridge recovers but index `0` is absent;
- selected provenance terminates only on MAIA-carried marker content;
- DEEP serves the witness (void; no second serve without a new act).

On failure: record and stop. No tuning, no immediate repair, no W2/W3, no `S`.

## 5. Recovery custody

The pre-deploy `:previous` tag did not preserve the known-safe baseline. Before SEL-W1, the exact prior production image was independently located by baked environment and pinned:

```text
maia-sovereign:safe-e57ca1baa
image sha256:59f1cad5fb43…
GIT_COMMIT=e57ca1baa
```

This safety tag does not alter the running container. The defective generic rollback primitive remains out of scope; if SEL-W1 triggers rollback, restoration must use this explicit image and be verified by baked `GIT_COMMIT`.

## Addendum · HTTP guest boundary correction (2026-09-15)

The first attempt to begin setup through `/api/sovereign/app/maia/list` returned HTTP 401 before MAIA processing. Read-only database checks immediately afterward showed **0** `maia_sessions` rows and **0** `conversation_turns` rows for that attempted session id. Therefore no witness turn was accepted and `SEL-W1` remains unspent.

The procedure's assumption that this live route admits a fresh unauthenticated guest was false. This is an HTTP/auth-boundary fact, not a continuity result.

`SEL-W1` will therefore be served through the running production container's canonical service seam (`ensureSession` + `getMaiaResponse`) against the real production database. This preserves the evidence under test: same deployed image, same session persistence, same FAST/CORE routing, same `recoverForTier` composition, same seven messages, same order, and same first-result rule. It deliberately bypasses only the unrelated HTTP authentication boundary.

No message text, oracle, expected index, retry rule, or pass/fail condition changes. No browser credential, cookie, session token, or authentication bypass is created or harvested.