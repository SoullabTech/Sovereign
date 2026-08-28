# SANCTUARY-SETTINGS-DISCONNECT-01 — new-session boundary trace

**Status:** session provenance CLOSED. Cross-member attribution CLOSED (§3).
Fail-closed initialization NOT closed — see §5, `SANCTUARY-INIT-GATE-01`.

| Unit | Question it answers | State |
|---|---|---|
| SANCTUARY-SETTINGS-DISCONNECT-01 | when does a new session consume the default? | closed |
| SANCTUARY-MEMBER-SCOPE-01 | whose preference is this? | closed |
| SANCTUARY-DEFAULT-RESOLVE-01 | what does the authoritative source say? | open |
| SANCTUARY-INIT-GATE-01 | may a turn begin before we know? | open |
**Branch:** `claude/sanctuary-button-state-issue-872q0a`
**Supersedes the semantics attempted in:** `188abf5` (default→live coupling, reverted)

---

## 1. The boundary

The genuinely-new-MAIA-session event is:

```
getOrCreateMaiaSessionId() returns { isNew: true }
```

`lib/maia/presence/conversationIdentity.ts` — the canonical identity module.
It mints when the stored `maia_session_id` is absent, or `maia_session_date`
is not today. `isNew` is already an explicit, exported part of its contract;
nothing needs inventing to detect the boundary.

**It is a daily rotation, not a member gesture.** There is no "new
conversation" action on `/maia`. The module's own docstring records that
whether yesterday's thread should carry forward is an unruled product
decision (`docs/architecture/MAIA_HOUSE_PRESENCE_IMPLEMENTATION.md`).

### What the boundary is NOT

| Event | New session? | Why |
|---|---|---|
| Mount / reload (same day) | **No** | `isNew: false`, id restored |
| Sign-in | **No**, not directly | see §3 leak |
| Thread creation / adoption | n/a | no thread model on this surface |
| Explicit "new conversation" | n/a | **does not exist on `/maia`** |
| First visit, or first visit of a new calendar day | **Yes** | `isNew: true` |
| First visit after `clearAuthState()` | **Yes** | keys removed → next call mints |

### Where the boundary is crossed

| Site | Reads `isNew`? |
|---|---|
| `app/maia/page.tsx:532` | **Yes** — already branches on it, and already clears `maia_conversation_<priorSessionId>` in that branch. This is the seam. |
| `components/maia/presence/MaiaPresence.tsx:118` | **No** — takes `sessionId`, discards `isNew`. Whichever mounts first mints; the presence sheet can therefore cross the boundary silently. |
| `app/field/talk/page.tsx:251–270` | **Bypasses the module entirely** — reads and writes `maia_session_id` / `maia_session_date` by hand, reimplementing the rotation. The module's claim to be "the ONE place session identity is minted" is false today. |

Any seed implementation must cover all three, or `/field/talk` and the
presence sheet will remain holes in whatever the seam guarantees.

---

## 2. `maia_settings` is not session state

Naming the helpers `getSessionSanctuary` / `setSessionSanctuary` describes
their intended role, not their storage. They read and write:

```
localStorage["maia_settings"].sanctuary
```

with no `sessionId`, no `conversationId`, and no provenance for *how* the
boundary came to be set (default-seeded vs. member override). It is
browser-resident live state.

Consequence — both stale-state directions survive today:

```
default = Sanctuary,   live override = Continuity, new session → stale Continuity survives
default = Continuity,  live override = Sanctuary,  new session → stale Sanctuary survives
```

Neither is fixed by anything on this branch. The branch only added a member-
controlled exit from the second case once it has already happened.

**RESOLVED** by adding provenance to the existing state rather than a second
authority:

```
maia_settings.sanctuary   ← still the ONLY live Sanctuary authority
maia_settings.sessionId   ← provenance only: which session owns that value
```

`sessionId` never answers whether Sanctuary is on, only whether the live
value belongs to this session. `ensureSessionSanctuary(currentSessionId)` in
`lib/settings/accountSettings.ts` is the one place a new session consumes the
default; matching provenance preserves the override, differing or absent
provenance reseeds and re-stamps. Because it compares a stamp rather than
asking who minted first, it is idempotent and order-independent — which is
what makes the three crossing sites safe to wire without duplicating policy.

18 falsification tests in `lib/settings/__tests__/sessionSanctuary.test.ts`.
Mutation-checked: deleting the provenance comparison fails 8 of them.

---

## 3. Adjacent finding — sign-out leak (not fixed here)

`clearAuthState()` (`lib/http/apiBase.ts:354`) clears `maia_session_id` and
`maia_session_date` but neither `maia_settings` nor `maia_account_settings`.

**Partly mitigated.** Because sign-out clears the canonical session keys, the
next member gets a new sessionId, mismatches the stale provenance, and is
reseeded. The previous member's *live flag* can no longer be inherited.

**Not solved: the default it reseeds from is still the previous member's.**
Read-only trace of `maia_account_settings`:

| Direction | Status |
|---|---|
| Local → server | `updateMaiaSetting` writes localStorage **and** `PUT /api/members/settings` → `default_memory_mode` |
| Server → local | **never happens.** `GET /api/members/settings` does return `maia.defaultMemoryMode`, but its only consumer (`AccountSettings.tsx:351`) destructures `notifications` and `privacy` and discards the `maia` block. `saveAccountSettings()` is called from exactly two local edit handlers; nothing hydrates it from the server, ever. |
| Cleared on sign-out | No |

So the default is per-device, not per-member. The seed is correct with respect
to the *session* boundary and unverified with respect to *member identity*.

Risk is asymmetric and the unsafe direction is real: member A leaves
`defaultMemoryMode: 'continuity'` on the device, member B — whose stored
default is Sanctuary — signs in, and B's session is seeded Continuity. B's
chosen Sanctuary default is silently not applied. Do not claim member-scoped
defaults until the server value is actually read back.

### SANCTUARY-MEMBER-SCOPE-01 — repaired

The cache is now attributable. `maia_account_settings_owner` records which
member the cached `defaultMemoryMode` belongs to — provenance again, not a
second setting, and in its own key so `saveAccountSettings()` stays unaware
of it.

* `getAccountSettings()` serves the cached `defaultMemoryMode` only when it is
  provably the signed-in member's. Unowned (legacy, unattributed) counts as
  unproven, not as mine. Gated field: **`defaultMemoryMode` only** — voice,
  memory depth, display and assistant name have always been device-local and
  are untouched.
* `GET /api/members/settings` → `maia.defaultMemoryMode` is now consumed.
  `hydrateAccountSettingsForMember()` adopts it and stamps ownership;
  `loadMemberDefaultMemoryMode()` is the fetch-and-adopt wrapper.
* Hydration runs **before** the session boundary consumes the default, on both
  seeding surfaces (`/maia` boot and the presence provider). The provider has
  no network wait of its own and mounts on every route, so it would otherwise
  reliably win the race and seed from an unestablished default.
* `clearAuthState()` withdraws the ownership claim. The cached settings
  themselves are left alone; only the claim that they belong to a member goes.
* Unresolved hydration (fetch fails, or the server returns no value for the
  field) leaves the cache **unowned**. The member gets the documented system
  default — the same thing a member on a fresh device gets — never the previous
  member's value.

12 tests in `lib/settings/__tests__/memberScopedDefault.test.ts`, including the
exact two-member sequence in both directions. Mutation-checked: removing the
ownership gate fails 6; adopting an unresolved server value fails 2.

### Green gates for this candidate

`lib/settings` + `lib/maia/presence`: **42/42, 3 suites.**
`lib/sovereign/__tests__` excluding `presenceMode.test.ts`: **89/89, 3 suites.**

`lib/sovereign/__tests__/presenceMode.test.ts` has one failure
("should be called after sanitization, before voice synthesis"). Verified
**pre-existing** by re-running it on a stashed clean tree. It is recorded here
as pre-existing and is **excluded from this candidate's green gates** — it is
not evidence for or against this work.

### 3.1 Residual — first-load window when hydration fails

If hydration cannot resolve (offline, 500) on the first load after a member
switch, that session is seeded from the **system** default rather than the
member's stored one. Cross-member leakage is closed — member A's value is
never used — but a member whose stored default is Sanctuary would begin that
one session in Continuity, and would have to set it themselves.

Closing this properly needs the seed to be *deferrable* rather than
default-to-system, which means `ensureSessionSanctuary` gaining a "cannot
establish yet" state. That was explicitly out of bounds for this unit
(no changes to `ensureSessionSanctuary`). Recorded, not claimed as fixed.

---

## 5. SANCTUARY-INIT-GATE-01 — read-only trace (not implemented)

The residual in §3.1 is no longer a member-scope defect: no member's value
leaks into another's session. It is the remaining **privacy** failure — an
unresolvable default is translated into Continuity rather than admitted as
unknown.

The fix cannot be a better guess. `ensureSessionSanctuary()` currently returns
`boolean`, which has no room to say *"I do not yet know."* The next unit needs:

```
established-sanctuary
established-continuity
unresolved                ← new
```

and a rule that `unresolved` blocks a turn from beginning rather than
resolving to a value:

```
unresolved            → no text dispatch, no voice dispatch, retry
authoritative failure → establish Sanctuary, then permit dispatch
```

### Sites a gate would have to cover

Two entry points begin a turn, in `components/OracleConversation.tsx`:

| Entry | Line | Notes |
|---|---|---|
| `handleTextMessage` | 4870 | text composer; also the fallback voice path's delegate |
| `handleVoiceTranscript` | 6638 | streaming leg returns at 7263 without reaching `handleTextMessage` |

Three sites carry the boundary once a turn is under way:

| Site | Line | Kind |
|---|---|---|
| `sanctuary: isSanctuary` in the sovereign request body | 5385 | wire, inside `handleTextMessage` |
| `sendStreamingMessage(…, isSanctuary)` | 7255 | wire, streaming voice leg |
| `isSanctuary` in the turns-persistence POST | 3205 | **write** — a `useEffect` on `messages`, not inside either entry point |

The third is the one to think hardest about: it is a message-driven effect, so
gating only the two entry points would still leave a persistence path that runs
whenever `messages` changes. Any gate that admits `unresolved` has to account
for it, or an unresolved turn could still be written.

### Not started

This branch is held at `1ef523f` as a candidate for the two closed units and is
deliberately **not** broadened to cover initialization. `SANCTUARY-INIT-GATE-01`
changes `ensureSessionSanctuary`'s contract and touches turn dispatch, so it
belongs in its own unit on its own branch, with its own authorization.
