# iOS MAIA memory-context divergence — first divergence found

**Date**: 2026-08-24
**Scope**: bounded diagnosis + repair of ONE divergence. No memory architecture was rebuilt, added to, or re-specced.
**Symptom**: on iOS native, MAIA is conversationally responsive and has generic continuity, but does not recall specific member memory ("I don't have that detail in front of me right now…"). Web/PWA behaviour was the reference.

---

## I. What is NOT the problem

Ruled out by reading the actual paths, not by inference:

| Layer | Web/PWA | iOS native | Same? |
|---|---|---|---|
| Chat component | `OracleConversation` | `OracleConversation` | ✅ same |
| Endpoint | `/api/sovereign/app/maia/list` | `/api/sovereign/app/maia/list` | ✅ same |
| Request transport | `apiFetch()` | `apiFetch()` | ✅ same |
| CORS on the chat route | echoes requested headers | echoes requested headers | ✅ passes `x-session-token` |
| Memory assembly (atoms / conversational / episodic / developmental) | one code path | same code path | ✅ same |

There is **no second memory implementation** for native. The retrieval and prompt-injection code is byte-identical. The divergence is upstream of memory entirely — it is in **who the server thinks is asking**.

## II. The first divergence — two identity authorities that disagree only on native

The app carries two notions of "signed in":

- **CLIENT-BELIEVED** — `beta_user` / `memberId` in localStorage. Drives the UI: the greeting, the name, whether a signed-in room renders at all.
- **SERVER-VERIFIED** — the member behind a valid `auth_sessions` row, reached via the `maia_session` cookie (web) or the `x-session-token` header (iOS/Safari). This is the **only** identity the memory path honours (`lib/auth/getMemberFromRequest.ts` → `app/api/sovereign/app/maia/list/resolveIdentity.ts`).

`/api/auth/whoami` is documented in its own header as *"the canonical source of truth for 'am I signed in?'"*. It was not. It contained this branch:

```ts
// If we have a member ID header but no cookie, look up member directly
if (memberIdHeader && !sessionToken) {
  const memberResult = await query(`SELECT ... FROM members WHERE id = $1`, [memberIdHeader]);
  ...
  return NextResponse.json({ authed: true, ... });
}
```

A bare `x-member-id` header — an **unverified claim** — was accepted as identity after a plain existence check.

**On web that branch is unreachable.** The `maia_session` cookie is always sent same-origin, so whoami takes the session branch and the conversation route takes the same session branch. The two authorities agree, always.

**On iOS that branch is the only one reachable.** The cookie cannot travel cross-origin from `capacitor://localhost`, so whoami always fell through to `x-member-id` and answered `authed: true` — while `getMemberIdFromRequest`, which *refuses* a bare `x-member-id` as impersonable (member UUIDs are client-exposed; commit `5b4eff3d5`), resolved the identical request to `null`.

Result on native, and only on native:

```
whoami            → authed: true,  "you are Kelly"     → UI renders a recognized member
/maia/list        → userId: null,  anonymous caller    → allowCrossSessionMemory = false
                                                       → atoms / conversational / episodic all skipped
                                                       → MAIA answers fluently, recalls nothing
```

Three structural guards that would have caught this on web are absent on native by construction:

1. **`middleware.ts` is replaced by a no-op stub** for the static export (`scripts/capacitor-patch-routes.sh:196`), so no server-side auth gate runs.
2. Even when middleware does run, it has an explicit **Capacitor bypass** that lets unauthenticated page loads through and defers to "client-side will check auth via localStorage" — i.e. defers to the authority that was wrong.
3. **Nothing at native boot ever asked the server who it was.** `UnifiedAuth`'s whoami check explicitly early-returns on native (`if (Capacitor.isNativePlatform()) return;`), and whoami's own CORS `Allow-Headers` omitted `X-Session-Token`, so a native request could not have carried the correct credential through preflight even if it tried.

And the conversation route **does not error** when identity fails — it answers normally as an anonymous caller. The degradation was logged server-side (`[MAIA] userId resolved`) and was invisible to the device. The only witness was an ssh session into production.

## III. Repair (only this divergence)

1. **`app/api/auth/whoami/route.ts`** — the authentication decision is **delegated whole** to `getMemberIdFromRequest()`, the same function the memory path calls. Whatever it returns is what whoami reports.

   ```
   AUTHORITY    getMemberIdFromRequest(request)
   DIAGNOSTICS  which credentials were present? why might one have failed?
   NEVER        whoami reimplementing authentication
   ```

   This is stricter than "the same logic", and the distinction is load-bearing. The first attempt at this repair re-implemented the predicate inside whoami — it *resembled* the resolver and still diverged from it in two ways, both invisible until they cost someone their memory:

   | | Independent predicate | Delegated authority |
   |---|---|---|
   | stale `maia_session` cookie + valid `x-session-token` | `cookie \|\| header` authenticates the **cookie's failure** and never reaches the header | resolver falls through to the header → authenticated |
   | identity claim | checks `x-member-id` only | checks `x-member-id` **or** the `maia_member_id` cookie |

   The first row is not hypothetical for this bug: a device mid-migration holding a dead cookie and a good token is exactly the iOS state under investigation.

   Diagnostics (`credentialSource`, `expired_session`, `revoked_session`, `hasCookie`, `hasSessionTokenHeader`) are derived *after* the decision and cannot revise `authed`. The failure probe is read-only by design — explaining a failure must not write, so it does not call `validateSession` (which bumps `last_active_at`).

   `X-Session-Token` added to CORS `Allow-Headers`. This also closes a real disclosure hole: whoami previously returned a member's username, name, tier and practitioner status to anyone who sent that member's (client-exposed) UUID.
2. **`lib/maia/maiaRuntimeContext.ts`** — the chat response's `runtimeContext` now carries `memberRecognized`, `crossSessionMemory` and `sanctuary`. Booleans only; never the member UUID, never content. This makes *"MAIA has nothing to recall"* distinguishable from *"MAIA was never told who I am"* **from the device**, which is what makes the acceptance test runnable on iOS at all.
3. **`lib/auth/verifyServerIdentity.ts`** (new) + wired at `/maia` boot — asks the server who it recognizes and compares with what the device believes. Emits `[identity] parity`. **Diagnostic and non-destructive**: it never clears credentials and never redirects, so an offline boot cannot sign a member out of their own device. An unreachable server reports `unknown`, not a lost session.

## IV. What this does and does not establish

**Established** (code-proven, test-locked): the two identity authorities disagreed on native and agree now; the disagreement is sufficient on its own to produce exactly the observed symptom.

**Not established** (requires the device): that this was the *only* thing wrong on Kelly's phone. The repair makes the state witnessable; it does not by itself put a valid session token on a device that lacks one.

Two outcomes are now distinguishable, and the next step differs between them:

- `memberRecognized: true` on iOS → the device holds a valid session; identity was never the blocker and the divergence is further down. Re-open the trace at the memory loaders.
- `memberRecognized: false` on iOS → the device has no valid `maia_session_token`. Recall returns via re-authentication. The open question then becomes *why* the token is absent: sessions are a fixed 30-day `auth_sessions` row with **no sliding renewal anywhere** (`memberIdForSessionToken` is read-only and does not bump expiry), and on web an expired session is invisible because middleware bounces the member to `/signin` — a correction native never receives.

Deliberately **not** repaired, because it has not been witnessed: the native header-attachment path. `apiFetchWithHeaders` hands a `Headers` instance to `fetch` under `CapacitorHttp: { enabled: true }` (which patches global fetch), while the purpose-built `apiFetchNative` — which builds a plain header object — is dead code marked *"Currently unused"*. If step 2 below reports `memberRecognized: false` on a device that provably holds a valid token, that is the next place to look. Repairing it now would be guessing.

## V. Relationship to the AUTH-01-D lane

This work was rebased onto canonical tip `891b68773`, which carries **AUTH-01-D — route identity authority containment** (`c78060360`). That lane repaired 20 UNSAFE AUTHORITY routes, whoami among them: *"auth/whoami: existence of a member row is no longer authentication."* The two efforts converged on the same defect independently, which is corroboration, not duplication.

Two things remained after AUTH-01-D, and this branch closes them.

**1. The containment was partial, in the same shape.** AUTH-01-D calls `getMemberIdFromRequest`, but consults it only in the *no-cookie* branch:

```ts
const verifiedMemberId = await getMemberIdFromRequest(request);
if (!sessionToken && !verifiedMemberId) { /* refuse */ }
if (verifiedMemberId && !sessionToken)  { /* authenticate */ }
// cookie present → falls through to getCurrentSession(), cookie-only, again
```

When a cookie is present the decision reverts to `getCurrentSession()` — a second predicate — and the freshly computed `verifiedMemberId` is discarded. So a device holding a **dead cookie and a live `x-session-token`** is refused despite the resolver having already verified it, and a **mismatched `maia_member_id` cookie** alongside a valid session is never checked. Both controls below fail against canonical.

This is the same lesson twice: consulting the authority is not the same as being governed by it.

**2. The native path was still unreachable.** AUTH-01-D's own note says *"Capacitor/iOS keeps a working path: getMemberIdFromRequest validates the x-session-token header."* True in the handler, unreachable from the device — whoami's CORS `Allow-Headers` was `Content-Type, Accept, X-Member-Id`, so a cross-origin preflight from `capacitor://localhost` strips `x-session-token` before it arrives. The header is now allowed.

**§0.4 of `AUTH_CONSOLIDATION_LANE_2026-08-24.md` is the other half of this diagnosis.** `POST /api/members/email-code/verify` caught session-creation failure, logged it `(non-fatal)`, and returned `success: true` anyway — *"The client then stored a localStorage session with no server session behind it."* That is precisely the device state described in §II: `beta_user` present, no `auth_sessions` row, whoami vouching for it. That lane fixed the **cause**; this one fixes the **detector**. Neither is sufficient alone: without the cause fixed, devices keep entering the state; without the detector fixed, nobody can tell that they have.

It also shifts the prior on §IV — a device that went through the OTP path before that fix is *expected* to report `memberRecognized: false`.

## VI. Proof that the paths collapsed rather than merely converged

Three controls in `app/api/auth/whoami/__tests__/route.test.ts`. Each names a semantic that an independent predicate got wrong, and each was run against every relevant baseline:

| Control | pre-correction (`dffb720`) | canonical AUTH-01-D (`891b68773`) | this branch |
|---|---|---|---|
| invalid `maia_session` + valid `x-session-token` → authed via header | ✕ FAIL | ✕ FAIL | ✓ PASS |
| valid session + mismatched `maia_member_id` cookie → rejected | ✕ FAIL | ✕ FAIL | ✓ PASS |
| session row with unparseable expiry → still authed, label omitted | — | — | ✓ PASS |

A test that passes before and after proves nothing about which function owns the decision. These fail before and pass after.

**The third control was earned, not designed.** AUTH-01-D's P6 fixture returns a session row carrying `member_id` and nothing else. Against it, the credential-*labelling* step called `validateSession(...).expiresAt.toISOString()`, threw on the malformed expiry, and the outer catch returned `authed: false` — the diagnostic layer overruling the authority, which is the exact failure this endpoint exists to eliminate. The boundary has to hold against a **throw**, not merely against a different return value. Labelling is now wrapped and cannot revise the decision; a label that cannot be computed costs a label, never a member's identity.

That failure is also the argument for the gate: the branch was green on its own suite and still broke a proof that only existed in another lane.

## VII. Acceptance — how to witness it

1. Ask the same memory question on web/PWA and on iOS.
2. Read `runtimeContext.memberRecognized` and `runtimeContext.crossSessionMemory` from the chat response on each. This is step 2 of the acceptance criteria and was previously unanswerable from the device.
3. On iOS, check the boot log for `[identity] parity` — `client-only` is the split-brain state.
4. Cross-check server-side:

```bash
ssh soullab@minisforum 'docker logs maia-sovereign --since 1h 2>&1 \
  | grep -E "MAIA\] userId resolved|WHOAMI|memory orchestrator skipped"'
```

`memory orchestrator skipped { reason: "no-userid" }` on a turn the member believed was authenticated is the divergence, recorded.

## VIII. Canon note

The repair is a truthfulness repair before it is an auth repair. A system that presents a member's name while conversing with them as a stranger is making a claim about recognition it cannot honour, and MAIA does not get to be wrong about whether it knows who it is talking to. Sovereignty Invariant check: the change increases member agency (a member can now see and act on a lost session instead of experiencing MAIA as having forgotten them), adds no capability, and adds no memory. It removes an unverified identity path rather than adding one.
