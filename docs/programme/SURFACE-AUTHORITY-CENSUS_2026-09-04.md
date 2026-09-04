# SURFACE AUTHORITY CENSUS — 2026-09-04

**Lane:** JARVIS memory organism · governing act between Proof 9 and the next build
**Kind:** read-only census. No code modified, no branch cut for repair, no deploy, no repair proposed.
**Source basis:** working checkout detached at `b20f2742e` — the SHA running in production at census time. The code read below *is* the production code, not an approximation of it.
**Verdict:** CLOSED · PASS (founder adjudication 2026-09-04)

---

## Mission (founder, verbatim)

> Determine which route is intended to own ordinary signed-in MAIA conversation, why observed production traffic moved `/list → /between/chat → /list`, and whether `/api/between/chat` remains an intentional live surface, fallback, special-mode route, or legacy/dormant path. Do not modify code, deploy, create a branch, or propose a repair until the census is complete.

---

## 1. The conversational component has exactly one endpoint seam

`components/OracleConversation.tsx` makes **one** conversational request: `apiFetch(apiEndpoint, …)` at `components/OracleConversation.tsx:5362`.

- No second endpoint.
- No retry against another route.
- No fallback to `/api/between/chat`.
- The offline branch (`:5330`) produces a **locally generated** presence reply; it is not another route.
- `trackEvent.apiCall('/api/between/chat', …)` at `:6065` is a **hardcoded telemetry label**, not a request. It mislabels `/list` turns as between turns in analytics.

## 2. Every render site chooses `/list`; the between default is unreached

| Render site | endpoint passed |
|---|---|
| `app/maia/page.tsx:843` | `/api/sovereign/app/maia/list` |
| `app/maia/page.tsx:1540` | `/api/sovereign/app/maia/list` |
| `app/field/talk/page.tsx:415` | `/api/sovereign/app/maia/list` |
| `app/studio/maia/page.tsx:118` | `/api/sovereign/app/maia/list` |
| `components/maia/presence/MaiaPresence.tsx:239` | `/api/sovereign/app/maia/list` |

Those are all five JSX usages of `<OracleConversation`. The prop default

```ts
apiEndpoint = '/api/between/chat', // Default to current behavior
```

at `components/OracleConversation.tsx:626` is **dead**: no call site relies on it. Its comment is stale and actively misleading — it names a "current behavior" that no rendered surface has.

## 3. Route selection is static; there is no condition

No environment variable, feature flag, remote config, mode branch, device branch, or runtime predicate selects between the two routes anywhere in `app/`, `components/`, `lib/`, `hooks/`. The choice is a literal string at each call site. There is nothing that *could* have flipped at runtime.

## 4. `/between/chat`'s live clients are embedded / special-mode, never ordinary `/maia`

**Live and reachable**

| Client | Reached from |
|---|---|
| `components/oracle/EmbeddedMAIAChat.tsx:95,156` | `app/oracle/iching/page.tsx:810` — the I Ching reading page (first turn *and* follow-up turns) |
| `components/elemental-alchemy/BookChat.tsx:103` | `app/maia/community/elemental-alchemy/page.tsx:1237` |
| `components/elemental-alchemy/AskMaiaSheet.tsx:139` → `/api/community/elemental-alchemy/ask` → **server-side forward** at `app/api/community/elemental-alchemy/ask/route.ts:70` | `app/maia/community/elemental-alchemy/page.tsx:1210` |
| `app/chat-test/page.tsx` | test page, reachable by URL |

**Orphaned — no render site anywhere**

`components/consciousness/BetweenChatInterface.tsx` · `components/chat/BetaMinimalMirror.tsx` · `components/voice/VoiceMirror.tsx` (referenced only by `components/chat/EnhancedMirrorView.tsx`, itself unreferenced) · `hooks/useMaiaStream.ts` · `hooks/useMayaStream.ts`

Orphaned on the `/list` side as well: `lib/hooks/useMaiaChat.ts:129`.

This is the legacy tail. It is real, but it is not what makes `/between/chat` live.

## 5. The traffic flip is NOT a deploy artifact

`app/maia/page.tsx` passes `/api/sovereign/app/maia/list` at **both** `b20f2742e` and `e3f379530` — founder independently confirmed the `app/maia/page.tsx` blob SHA is identical in both trees.

```
git diff b20f2742e e3f379530 -- app/api/sovereign/app/maia/list/route.ts app/api/between/chat/route.ts
 app/api/between/chat/route.ts | 46 +++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 46 insertions(+)
```

`/list` is byte-identical across the two candidate SHAs. Client route selection did not change across the two deploys. **The deploy cannot be the cause of the flip.**

## 6. `origin_route` is honest instrumentation, not a shared label

Both routes set it at their own HTTP boundary under the stated ROUTING INVARIANT — `/list` at `:1325` and `:1598`, `/between/chat` at `:1971`. Neither borrows the other's constant. The observed flip is **real HTTP traffic**, not a labeling artifact.

(Contrast §1: the *client-side* `trackEvent` label is dishonest. The *server-side* `agent_runs.origin_route` instrument is not. Only the latter was used as census evidence.)

---

## VERDICT

```text
SURFACE AUTHORITY CENSUS       CLOSED · PASS

/list
  AUTHORITATIVE PRIMARY
  ordinary signed-in MAIA conversation

/between/chat
  INTENTIONAL LIVE SECONDARY
  embedded / special-mode conversation
  not fallback
  not globally dormant
  carries legacy tail

observed /list → between → /list
  NOT a route-selection flip in ordinary /maia
  traffic came from different client surfaces
  exact historical between client remains UNPROVEN

e3f379530
  HELD
  DO NOT MERGE AS-IS
  useful evidence/reference for future secondary-surface convergence
```

### Current member experience

A signed-in member at `soullab.life/maia` posts to `/api/sovereign/app/maia/list`, which at the running SHA loads and formats durable I Ching readings (`app/api/sovereign/app/maia/list/route.ts:136,1060`). **Divination continuity is live on the surface the founder actually uses.**

### Why `e3f379530` stays held

It adds divination to a route no ordinary signed-in MAIA conversation reaches. Its member-visible effect would be confined to the I Ching page's embedded chat and the elemental-alchemy chats. That is not worthless — the embedded I Ching chat is a natural place to discuss a cast — but it is **not** "MAIA remembers your reading in ordinary conversation," and `/list` already delivers that, witnessed at Proof 9. If it returns, it returns as an embedded-surface cut argued on its own merits, not on the dissolved premise that it fixes primary-surface continuity.

---

## Evidence gaps — recorded, none blocking

1. **Shallow clone.** 306 commits. Earliest visible touch of both route-selection lines is `37bbf0c23` (2026-08-27, PR #1113 `fix/voice-sovereignty-01`), which may not be the introduction. Provenance of the `/list` choice is unestablished.
2. **The exact between-window client is UNWITNESSED.** `app/oracle/iching/page.tsx` → `EmbeddedMAIAChat` is an excellent candidate — it is precisely where a cast is discussed — but it is a hypothesis. **Do not upgrade it to fact without correlating the between-window `agent_runs` rows to member + session + open page.**
3. **Serving client artifact in production unverified.** A stale cached browser bundle is theoretically possible. It cannot explain the architectural authority question: current production traffic, current source, and the identical `/maia` client across both candidate SHAs all agree that ordinary `/maia` owns `/list`.
4. **Deploy custody of `b20f2742e` at 16:30:39 remains OPEN** — unaffected by, and not settled by, this census.

---

## The correction this census completes

MAIA did not keep changing her primary nervous system. Two different conversational surfaces were being observed and treated as one.
