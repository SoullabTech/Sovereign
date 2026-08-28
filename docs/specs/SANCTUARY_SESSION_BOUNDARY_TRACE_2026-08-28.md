# SANCTUARY-SETTINGS-DISCONNECT-01 — new-session boundary trace

**Status:** boundary implemented via `sessionId` provenance (Kelly ruling
2026-08-28). Member-scope question in §3 remains OPEN.
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

Recorded as **SANCTUARY-MEMBER-SCOPE-01**, open.

---

## 4. Held for separate adjudication

**SANCTUARY-DEFAULT-AUTHORITY-CONSOLIDATION-01** — collapsing
`maia_sanctuary_default` (Data & Privacy toggle) into
`maia_account_settings.defaultMemoryMode` (MAIA Settings picker).

These are one setting rendered in two places with no code path between them,
so they can and do disagree. That consolidation was attempted in `188abf5`
and has been fully reverted out of this repair — `lib/storage/sovereign.ts`
is byte-identical to canonical. It is a Class A consent change in its own
right and is not blessed incidentally here. The migration direction proposed
at the time, preserved for the future adjudication: migrate only *toward*
Sanctuary, so a legacy opt-in cannot be lost in the merge.
